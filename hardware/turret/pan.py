"""Pan axis: walks the stepper to a target angle on a background thread."""
import threading
import time

from .config import Config
from .drivers import StepperDriver


class PanAxis:
    """Tracks position in steps and walks the stepper toward a target on a background thread."""
    def __init__(self, config: Config, driver: StepperDriver):
        self._cfg = config
        self._driver = driver
        self._pos = 0       # steps from the startup position
        self._target = 0
        self._released = True
        self._thread = threading.Thread(target=self._run, daemon=True)

    def start(self) -> None:
        self._thread.start()

    @property
    def deg(self) -> float:
        return self._pos * 360.0 / self._cfg.steps_per_rev

    @property
    def target_deg(self) -> float:
        return self._target * 360.0 / self._cfg.steps_per_rev

    @property
    def moving(self) -> bool:
        return self._pos != self._target

    def move_to(self, deg: float) -> None:
        limit = self._cfg.pan_limit_deg
        deg = max(-limit, min(limit, deg))
        self._target = round(deg * self._cfg.steps_per_rev / 360.0)

    def move_by(self, delta: float) -> None:
        self.move_to(self.target_deg + delta)

    def stop(self) -> None:
        self._target = self._pos

    def zero(self) -> None:
        self._pos = self._target = 0

    def release(self) -> None:
        self.stop()
        self._driver.release()
        self._released = True

    def _run(self) -> None:
        idle_since = None
        while True:
            if self._pos != self._target:
                forward = self._target > self._pos
                self._driver.step(forward != self._cfg.invert_pan)
                self._pos += 1 if forward else -1
                self._released, idle_since = False, None
                time.sleep(self._cfg.step_delay)
            else:
                if idle_since is None:
                    idle_since = time.time()
                if (self._cfg.release_when_idle and not self._released
                        and time.time() - idle_since > 0.5):
                    self._driver.release()
                    self._released = True
                time.sleep(0.01)
