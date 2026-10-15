"""Tiny CORS-enabled file server for the TV apps.

Serves this folder (ping.txt, roms/ and an auto-generated roms.json) on the LAN.
Also relays debug remote-control commands to the SNES app (snes/js/remote.js):
  POST /cmd            queue a JSON command (or a JSON list of them) for the TV
  GET  /cmd?after=N    the TV fetches commands with id > N
  POST /up?name=FILE   the TV uploads a screenshot / memory dump / report into remote/
Usage:  python serve.py [port]
"""
import json
import os
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
ROM_DIR = os.path.join(ROOT, "roms")
ROM_EXT = (".sfc", ".smc", ".swc", ".fig", ".zip")
UP_DIR = os.path.join(ROOT, "remote")

commands = []
lock = threading.Lock()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, obj):
        body = json.dumps(obj).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/roms.json":
            names = sorted(
                f for f in os.listdir(ROM_DIR) if f.lower().endswith(ROM_EXT)
            ) if os.path.isdir(ROM_DIR) else []
            self.send_json(
                [{"name": os.path.splitext(n)[0], "file": "roms/" + n} for n in names]
            )
            return
        if url.path == "/cmd":
            after = int(parse_qs(url.query).get("after", ["0"])[0])
            with lock:
                self.send_json([c for c in commands if c["id"] > after])
            return
        super().do_GET()

    def do_POST(self):
        url = urlparse(self.path)
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        if url.path == "/cmd":
            new = json.loads(body)
            with lock:
                for c in new if isinstance(new, list) else [new]:
                    c["id"] = (commands[-1]["id"] if commands else 0) + 1
                    commands.append(c)
                self.send_json({"id": commands[-1]["id"]})
            return
        if url.path == "/up":
            name = os.path.basename(parse_qs(url.query).get("name", ["upload.bin"])[0])
            os.makedirs(UP_DIR, exist_ok=True)
            with open(os.path.join(UP_DIR, name), "wb") as f:
                f.write(body)
            self.send_json({"saved": name, "bytes": len(body)})
            return
        self.send_error(404)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print("Serving %s on 0.0.0.0:%d" % (ROOT, port))
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
