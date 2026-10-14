"""Tiny CORS-enabled file server for the TV apps.

Serves this folder (ping.txt, roms/ and an auto-generated roms.json) on the LAN.
Usage:  python serve.py [port]
"""
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
ROM_DIR = os.path.join(ROOT, "roms")
ROM_EXT = (".sfc", ".smc", ".swc", ".fig", ".zip")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == "/roms.json":
            names = sorted(
                f for f in os.listdir(ROM_DIR) if f.lower().endswith(ROM_EXT)
            ) if os.path.isdir(ROM_DIR) else []
            body = json.dumps(
                [{"name": os.path.splitext(n)[0], "file": "roms/" + n} for n in names]
            ).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print("Serving %s on 0.0.0.0:%d" % (ROOT, port))
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
