"""
Shared slowapi limiter instance + real-client-IP helper.

Defined here — not in server.py — so route modules can import it for
`@limiter.limit(...)` decorators without a circular import on `server`
(server imports the routers, the routers import this).
"""
from slowapi import Limiter


def client_ip(request) -> str:
    """Best-effort real client IP behind Railway's proxy.

    slowapi's default `get_remote_address` returns `request.client.host` —
    which behind Railway is the proxy's IP, shared across ALL users and not
    stable. Keying rate-limits / view-dedupe on that both throttles unrelated
    users together and (worse) dedupes distinct real users into one bucket,
    silently suppressing legitimate view counts. Prefer the originating client
    from `X-Forwarded-For` (leftmost entry), fall back to the peer host.

    Note: XFF's leftmost entry is client-supplied and therefore spoofable, so
    this is a soft anti-abuse signal (fine for a view counter / coarse limit),
    not an authentication-grade identity.
    """
    xff = request.headers.get("x-forwarded-for")
    if xff:
        first = xff.split(",")[0].strip()
        if first:
            return first
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=client_ip)
