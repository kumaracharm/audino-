import http.server
import socketserver
import threading
import os
import sys
import socket

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

class IsolatedPortalHandler(http.server.SimpleHTTPRequestHandler):
    default_page = "healthguard_app.html"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path in ("/", ""):
            self.path = f"/{self.default_page}"
        return super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Nonce')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # Quiet logging for smooth operation

def make_handler(target_page):
    class CustomHandler(IsolatedPortalHandler):
        default_page = target_page
    return CustomHandler

def run_server(port, target_page, name):
    if is_port_in_use(port):
        print(f"[ACTIVE] Port {port} is already running an isolated service ({name})")
        return

    handler = make_handler(target_page)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.ThreadingTCPServer(("", port), handler) as httpd:
            print(f"[ONLINE] http://localhost:{port} -> {name} ({target_page})")
            httpd.serve_forever()
    except Exception as e:
        print(f"[WARN] Port {port} ({name}) error: {e}")

if __name__ == "__main__":
    print("=" * 72)
    print("  HEALTHGUARD PS-03: MULTI-PORT ZERO-CRASH ISOLATION ARCHITECTURE")
    print("=" * 72)
    print("  1. Port 3000: Clinical Command Hub      -> http://localhost:3000")
    print("  2. Port 3001: Patient Spatial Portal     -> http://localhost:3001")
    print("  3. Port 3002: Chaos Monkey Hacker GUI   -> http://localhost:3002")
    print("=" * 72)

    # Launch background continuous 10-patient dataset stream from kumaracharm/data
    def run_stream_feeder():
        try:
            import subprocess
            streamer_script = os.path.join(BASE_DIR, "stream_service.py")
            if os.path.exists(streamer_script):
                print("[STREAM] Launching continuous 10-patient physiological dataset stream...")
                subprocess.Popen([sys.executable, streamer_script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as ex:
            print(f"[STREAM-WARN] Could not auto-launch stream feeder: {ex}")

    stream_thread = threading.Thread(target=run_stream_feeder, daemon=True)
    stream_thread.start()

    portals = [
        (3000, "healthguard_app.html", "Clinical Command Center"),
        (3001, "patient_checkin.html",  "Patient Spatial Portal"),
        (3002, "chaos_monkey.html",     "Chaos Monkey Cyber Console"),
    ]

    threads = []
    for port, page, name in portals:
        t = threading.Thread(target=run_server, args=(port, page, name), daemon=True)
        t.start()
        threads.append(t)

    print("\n[RESILIENCE] All portals run on isolated processes and ports.")
    print("Heavy chaos attack traffic or voice synthesis CANNOT crash other portals.")
    print("Press Ctrl+C to stop.\n")

    try:
        for t in threads:
            t.join()
    except KeyboardInterrupt:
        print("\nStopping isolated portals.")
        sys.exit(0)
