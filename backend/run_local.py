"""Local FastAPI launcher for Windows and macOS/Linux.

Python 3.13 on some Windows installations can block while creating the default
Proactor event loop. The selector policy avoids that startup deadlock without
changing the RAG application itself.
"""

from __future__ import annotations

import asyncio
import sys

import uvicorn


def main() -> None:
    if sys.platform == "win32":
        # Uvicorn's ``run`` creates its own asyncio runner and can fall back
        # to ProactorEventLoop on Python 3.13. Build the runner explicitly so
        # the Selector loop is really used on Windows.
        config = uvicorn.Config("app.main:app", host="127.0.0.1", port=8000, log_level="info")
        server = uvicorn.Server(config)
        with asyncio.Runner(loop_factory=asyncio.SelectorEventLoop) as runner:
            runner.run(server.serve())
        return

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info")


if __name__ == "__main__":
    main()
