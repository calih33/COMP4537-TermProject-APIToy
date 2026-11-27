"""All tunable settings."""
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    host: str = "127.0.0.1"         # localhost only, so only this device can talk to it
    port: int = 5000
    sim: bool = False

    steps_per_rev: int = 2048       # 28BYJ-48 full steps per turntable revolution (hub is direct drive)
    step_delay: float = 0.004       # seconds per step, lower is faster (below ~0.002 it skips steps)
    invert_pan: bool = False        # flip if left/right is backwards
    pan_limit_deg: float = 90.0     # +/- from startup position, keeps blaster wires from twisting
    release_when_idle: bool = True  # cut coil power when stopped so the motor stays cool

    servo_pin: int = 12             # GPIO 12 = physical pin 32
    servo_rest: float = 20.0        # servo angle with the string slack
    servo_pull: float = 100.0       # servo angle that pulls the trigger (tune with /servo/angle)
    servo_min_pulse: float = 0.0005
    servo_max_pulse: float = 0.0024

    fire_ms_default: float = 400.0  # how long the trigger is held
    fire_ms_max: float = 3000.0     # hard cap per fire command
    fire_cooldown: float = 0.5      # seconds between fires
    arm_timeout: float = 120.0      # auto disarm after this many idle seconds

    @classmethod
    def from_env(cls) -> "Config":
        return cls(host=os.environ.get("TURRET_HOST", cls.host),
                   port=int(os.environ.get("TURRET_PORT", cls.port)),
                   sim=os.environ.get("TURRET_SIM") == "1")
