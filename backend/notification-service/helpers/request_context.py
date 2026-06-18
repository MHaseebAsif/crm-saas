from contextvars import ContextVar

tid_ctx: ContextVar[str] = ContextVar("tid", default="")
