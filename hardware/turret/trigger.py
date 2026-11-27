"""Trigger puller: servo with a string tied to the blaster trigger."""
import threading
import time

from .config import Config
from .drivers import ServoDriver
from .errors import TurretError


class TriggerPuller:
    """Servo with a string tied to the blaster trigger."""
    def __init__(self, config: Config, driver: ServoDriver):
        self._cfg = config
        self._driver = driver
        self._lock = threading.Lock()
        self._last_fire = 0.0
        self.state = "detached"

    @property
    def firing(self) -> bool:
        return self._lock.locked()

    def set_angle(self, angle: float, name: str = None) -> None:
        self._driver.set_angle(angle)
        self.state = name or f"{angle:g}"

    def park(self) -> None:
        self.set_angle(self._cfg.servo_rest, "rest")
        time.sleep(0.3)
        self._driver.detach()
        self.state = "detached"

    def fire(self, ms: float, abort: threading.Event) -> None:
        if time.time() - self._last_fire < self._cfg.fire_cooldown:
            raise TurretError("cooling down", 429)
        if not self._lock.acquire(blocking=False):
            raise TurretError("already firing", 409)
        try:
            abort.clear()
            self.set_angle(self._cfg.servo_pull, "pull")
            abort.wait(ms / 1000.0)
        finally:
            self._last_fire = time.time()
            self.park()
            self._lock.release()
