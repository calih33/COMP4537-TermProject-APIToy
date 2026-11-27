"""Arm state, idle timeout, and abort signal."""
import threading
import time

from .config import Config
from .errors import TurretError
from .log import EventLog


class ArmSafety:
    """Arm state with an idle timeout. Disarming also aborts a fire in progress."""
    def __init__(self, config: Config, log: EventLog):
        self._cfg = config
        self._log = log
        self.armed = False
        self.abort = threading.Event()
        self._last_activity = time.time()
        self._thread = threading.Thread(target=self._watch, daemon=True)

    def start(self) -> None:
        self._thread.start()

    def touch(self) -> None:
        self._last_activity = time.time()

    def arm(self) -> None:
        self.armed = True
        self.touch()
        self._log.add("ARMED")

    def disarm(self, reason: str = "disarmed") -> None:
        self.armed = False
        self.abort.set()
        self.touch()
        self._log.add(reason)

    def require_armed(self, what: str = "not armed") -> None:
        if not self.armed:
            raise TurretError(what, 409)

    @property
    def seconds_left(self) -> int:
        if not self.armed:
            return 0
        return max(0, round(self._cfg.arm_timeout - (time.time() - self._last_activity)))

    def _watch(self) -> None:
        while True:
            time.sleep(1)
            if self.armed and time.time() - self._last_activity > self._cfg.arm_timeout:
                self.disarm("auto disarm (idle timeout)")
