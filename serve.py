import http.server
import json
import os

BASE_DIR = os.path.dirname(__file__) or os.getcwd()
GALERIA_DIR = os.path.join(BASE_DIR, 'galeria')

class GigiRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.rstrip('/') == '/galeria/list.json':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            try:
                filenames = sorted(
                    f for f in os.listdir(GALERIA_DIR)
                    if os.path.isfile(os.path.join(GALERIA_DIR, f)) and f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'))
                )
            except FileNotFoundError:
                filenames = []
            self.wfile.write(json.dumps(filenames).encode('utf-8'))
            return
        return super().do_GET()

if __name__ == '__main__':
    os.chdir(BASE_DIR)
    http.server.test(HandlerClass=GigiRequestHandler, port=3456, bind='127.0.0.1')
