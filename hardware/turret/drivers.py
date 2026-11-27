"""Stepper and servo drivers: real hardware and simulated."""
import sys
from abc import ABC, abstractmethod

from .config import Config


class StepperDriver(ABC):
    @abstractmethod
    def step(self, forward: bool) -> None: ...
    @abstractmethod
    def release(self) -> None: ...


class HatStepper(StepperDriver):
    """Stepper 1 (M1/M2) on the Adafruit DC and Stepper Motor HAT."""
    def __init__(self):
        from adafruit_motorkit import MotorKit
        from adafruit_motor import stepper
        self._stepper = stepper
        self._motor = MotorKit().stepper1

    def step(self, forward: bool) -> None:
        direction = self._stepper.FORWARD if forward else self._stepper.BACKWARD
        self._motor.onestep(direction=direction, style=self._stepper.DOUBLE)

    def release(self) -> None:
        self._motor.release()


class SimStepper(StepperDriver):
    def step(self, forward: bool) -> None: pass
    def release(self) -> None: pass


class ServoDriver(ABC):
    @abstractmethod
    def set_angle(self, angle: float) -> None: ...
    @abstractmethod
    def detach(self) -> None: ...


class GpioServo(ServoDriver):
    """Hardware PWM servo through pigpio (needs the pigpiod daemon)."""
    def __init__(self, config: Config):
        from gpiozero import AngularServo
        from gpiozero.pins.pigpio import PiGPIOFactory
        self._servo = AngularServo(config.servo_pin, min_angle=0, max_angle=180, initial_angle=None,
                                   min_pulse_width=config.servo_min_pulse,
                                   max_pulse_width=config.servo_max_pulse,
                                   pin_factory=PiGPIOFactory())

    def set_angle(self, angle: float) -> None:
        self._servo.angle = angle

    def detach(self) -> None:
        self._servo.detach()


class SimServo(ServoDriver):
    def __init__(self):
        self.angle = None
    def set_angle(self, angle: float) -> None:
        self.angle = angle
    def detach(self) -> None:
        self.angle = None


class HardwareFactory:
    """Builds real drivers on the Pi, fake ones in sim mode."""
    @staticmethod
    def stepper(config: Config) -> StepperDriver:
        return SimStepper() if config.sim else HatStepper()

    @staticmethod
    def servo(config: Config) -> ServoDriver:
        if config.sim:
            return SimServo()
        try:
            return GpioServo(config)
        except Exception as e:
            sys.exit(f"Could not start the servo ({e}). Is pigpiod running? "
                     "sudo systemctl enable --now pigpiod")
