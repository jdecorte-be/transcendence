#!/usr/bin/env python3
import os
import sys
import time
import socketio


def load_env_file(path: str) -> None:
    if not os.path.exists(path):
        return

    with open(path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def main() -> int:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    load_env_file(os.path.join(script_dir, ".env"))
    url = os.getenv("WS_URL", "https://ws-transcendance.jdecorte.com")
    cookie = os.getenv("WS_COOKIE", "")
    user_id = os.getenv("WS_USER_ID", "")

    headers = {}
    if cookie:
        headers["Cookie"] = cookie

    sio = socketio.Client(logger=True, engineio_logger=True)

    @sio.event
    def connect():
        print("connected", sio.sid)

    @sio.event
    def connect_error(data):
        print("connect_error", data)

    @sio.event
    def disconnect():
        print("disconnected")

    try:
        connect_url = url
        if user_id:
            separator = "&" if "?" in url else "?"
            connect_url = f"{url}{separator}userId={user_id}"

        sio.connect(
            connect_url,
            transports=["websocket"],
            headers=headers,
            auth={"userId": user_id} if user_id else None,
            socketio_path="/socket.io",
        )
        time.sleep(5)
        sio.disconnect()
        return 0
    except Exception as exc:
        print("error", exc)
        return 1


if __name__ == "__main__":
    sys.exit(main())
