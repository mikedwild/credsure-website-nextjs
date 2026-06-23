"""
Shared slowapi limiter instance.

Defined here — not in server.py — so route modules can import it for
`@limiter.limit(...)` decorators without a circular import on `server`
(server imports the routers, the routers import this).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
