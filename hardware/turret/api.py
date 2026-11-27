"""Flask routes that call into the Turret."""
from flask import Flask, jsonify, request

from .config import Config
from .debug_page import DebugPage
from .device import Turret
from .errors import TurretError
from .log import EventLog


class ApiServer:
    """Flask routes that call into the Turret."""
    def __init__(self, config: Config, turret: Turret, log: EventLog):
        self._cfg = config
        self._turret = turret
        self._log = log
        self._debug = DebugPage()
        self.app = Flask(__name__)
        self._register()

    def _body_number(self, key: str, default: float = None) -> float:
        body = request.get_json(silent=True) or {}
        value = body.get(key, default)
        try:
            return float(value)
        except (TypeError, ValueError):
            raise TurretError(f"{key} (number) required")

    def _status(self):
        return jsonify(self._turret.status())

    def _action(self, fn, *args):
        """Run a turret command, then return the new status."""
        fn(*args)
        return self._status()

    def _route(self, method: str, path: str, handler) -> None:
        self.app.add_url_rule(path, endpoint=f"{method}:{path}", view_func=handler, methods=[method])

    def _register(self) -> None:
        t = self._turret

        @self.app.errorhandler(TurretError)
        def on_error(e):
            return jsonify(ok=False, error=e.message), e.status

        self._route("GET", "/status", lambda: self._status())
        self._route("GET", "/log", lambda: jsonify(ok=True, log=self._log.lines()))
        self._route("GET", "/debug", lambda: self._debug.response())

        self._route("POST", "/pan/to", lambda: self._action(t.pan_to, self._body_number("deg")))
        self._route("POST", "/pan/by", lambda: self._action(t.pan_by, self._body_number("deg")))
        self._route("POST", "/pan/center", lambda: self._action(t.center))
        self._route("POST", "/pan/stop", lambda: self._action(t.stop_pan))
        self._route("POST", "/pan/zero", lambda: self._action(t.zero_pan))
        self._route("POST", "/pan/release", lambda: self._action(t.release_pan))

        self._route("POST", "/arm", lambda: self._action(t.arm))
        self._route("POST", "/disarm", lambda: self._action(t.disarm))
        self._route("POST", "/estop", lambda: self._action(t.estop))
        self._route("POST", "/fire", lambda: self._action(t.fire, self._body_number("ms", self._cfg.fire_ms_default)))
        self._route("POST", "/servo/angle", lambda: self._action(t.servo_angle, self._body_number("angle")))
        self._route("POST", "/servo/rest", lambda: self._action(t.servo_rest))

    def run(self) -> None:
        self.app.run(host=self._cfg.host, port=self._cfg.port, threaded=True, use_reloader=False)
