"""The Turret facade that ties pan, trigger, and safety together."""
import threading
import time

from .config import Config
from .drivers import HardwareFactory
from .errors import TurretError
from .log import EventLog
from .pan import PanAxis
from .safety import ArmSafety
from .trigger import TriggerPuller


class Turret:
    """The whole device: pan axis, trigger puller, and safety, behind simple methods."""
    def __init__(self, config: Config, log: EventLog):
        self._cfg = config
        self._log = log
        self._stepper = HardwareFactory.stepper(config)
        self.pan = PanAxis(config, self._stepper)
        self.trigger = TriggerPuller(config, HardwareFactory.servo(config))
        self.safety = ArmSafety(config, log)
        self._started = time.time()

    def start(self) -> None:
        self.pan.start()
        self.safety.start()

    # pan
    def pan_to(self, deg: float) -> None:
        self.pan.move_to(deg); self.safety.touch(); self._log.add(f"pan to {deg:g}")

    def pan_by(self, deg: float) -> None:
        self.pan.move_by(deg); self.safety.touch(); self._log.add(f"pan by {deg:g}")

    def center(self) -> None:
        self.pan.move_to(0); self._log.add("pan center")

    def stop_pan(self) -> None:
        self.pan.stop(); self._log.add("pan stop")

    def zero_pan(self) -> None:
        self.pan.zero(); self._log.add("pan zeroed here")

    def release_pan(self) -> None:
        self.pan.release(); self._log.add("pan released")

    # arming and firing
    def arm(self) -> None:
        self.safety.arm()

    def disarm(self) -> None:
        self.safety.disarm()

    def fire(self, ms: float = None) -> None:
        self.safety.require_armed()
        ms = self._cfg.fire_ms_default if ms is None else ms
        ms = max(50.0, min(ms, self._cfg.fire_ms_max))
        self.safety.touch()
        self._log.add(f"FIRE {int(ms)}ms")
        self.trigger.fire(ms, self.safety.abort)

    def servo_angle(self, angle: float) -> None:
        self.safety.require_armed("arm first (this can pull the trigger)")
        if not 0 <= angle <= 180:
            raise TurretError("angle must be 0-180")
        self.safety.touch()
        self.trigger.set_angle(angle)
        self._log.add(f"servo angle {angle:g}")

    def servo_rest(self) -> None:
        self.trigger.park(); self._log.add("servo rest")

    def estop(self, reason: str = "estop") -> None:
        self.pan.stop()
        self.safety.disarm(f"{reason}: stopped, disarmed")
        threading.Thread(target=self.trigger.park, daemon=True).start()

    def shutdown(self) -> None:
        self.pan.stop()
        self.trigger.park()
        self._stepper.release()

    def status(self) -> dict:
        return dict(ok=True, sim=self._cfg.sim, armed=self.safety.armed, firing=self.trigger.firing,
                    servo=self.trigger.state, pan_deg=round(self.pan.deg, 2),
                    target_deg=round(self.pan.target_deg, 2), moving=self.pan.moving,
                    limit_deg=self._cfg.pan_limit_deg, arm_seconds_left=self.safety.seconds_left,
                    uptime=round(time.time() - self._started))
