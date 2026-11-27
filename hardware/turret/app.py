"""Startup, signal handling, and shutdown."""
import os
import signal

from .api import ApiServer
from .config import Config
from .device import Turret
from .log import EventLog


class Application:
    """Wires everything together and makes sure the hardware is parked on exit."""
    def __init__(self):
        self.config = Config.from_env()
        self.log = EventLog()
        if self.config.sim:
            self.log.add("SIM mode: no hardware in use")
        self.turret = Turret(self.config, self.log)
        self.api = ApiServer(self.config, self.turret, self.log)

    def _on_signal(self, *_):
        try:
            self.turret.shutdown()
        finally:
            os._exit(0)

    def run(self) -> None:
        signal.signal(signal.SIGINT, self._on_signal)
        signal.signal(signal.SIGTERM, self._on_signal)
        self.turret.start()
        self.log.add(f"turret service on http://{self.config.host}:{self.config.port}  (debug page: /debug)")
        self.api.run()
