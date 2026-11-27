"""Rolling event log shown on the debug page."""
import time
from collections import deque


class EventLog:
    def __init__(self, size: int = 200):
        self._lines = deque(maxlen=size)

    def add(self, message: str) -> None:
        line = f"{time.strftime('%H:%M:%S')} {message}"
        self._lines.append(line)
        print(line, flush=True)

    def lines(self) -> list:
        return list(self._lines)
