"""Unit tests for the publishing service token resolver (utils.auth).

Pure unit tests — no live backend or Mongo. A fake async `db` stands in for the
real Motor collection. Runs anywhere the backend deps are installed.
"""
import asyncio
import pytest

from utils.auth import (
    _publishing_token_user,
    hash_publishing_token,
    PUBLISHING_TOKEN_PREFIX,
)


class _FakeColl:
    def __init__(self, doc):
        self._doc = doc

    async def find_one(self, *args, **kwargs):
        return self._doc


class _FakeDB:
    def __init__(self, doc):
        self.site_settings = _FakeColl(doc)


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_hash_is_deterministic_and_distinct():
    a = PUBLISHING_TOKEN_PREFIX + "abc123"
    assert hash_publishing_token(a) == hash_publishing_token(a)
    assert hash_publishing_token(a) != hash_publishing_token(a + "x")


def test_correct_token_resolves_to_editor():
    raw = PUBLISHING_TOKEN_PREFIX + "correcttoken"
    db = _FakeDB({"publishing_token_hash": hash_publishing_token(raw)})
    user = _run(_publishing_token_user(db, raw))
    assert user is not None
    assert user["role"] == "editor"
    assert user["is_service_token"] is True


def test_wrong_token_rejected():
    raw = PUBLISHING_TOKEN_PREFIX + "correcttoken"
    db = _FakeDB({"publishing_token_hash": hash_publishing_token(raw)})
    assert _run(_publishing_token_user(db, PUBLISHING_TOKEN_PREFIX + "wrong")) is None


def test_non_prefixed_token_ignored_without_db_hit():
    # A normal session token (no csk_ prefix) must short-circuit to None so it
    # falls through to the session/JWT paths — never matched as a service token.
    db = _FakeDB({"publishing_token_hash": "deadbeef"})
    assert _run(_publishing_token_user(db, "session-style-token")) is None


def test_no_stored_token_returns_none():
    db = _FakeDB({})
    assert _run(_publishing_token_user(db, PUBLISHING_TOKEN_PREFIX + "anything")) is None


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
