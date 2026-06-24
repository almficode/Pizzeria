import http.server
import os

os.chdir(os.path.dirname(__file__) or os.getcwd())
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=3456, bind='')
