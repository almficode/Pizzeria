import http.server, os
os.chdir('/Users/adrianalmeida/Desktop/Pizzeria')
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=3456, bind='')
