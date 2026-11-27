"""Errors that the API turns into JSON responses."""


class TurretError(Exception):
    """An error the API turns into a JSON response with an HTTP status."""
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message, self.status = message, status
