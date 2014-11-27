import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import json
 
 
class WSHandler(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True
    
    def open(self):
        print 'new connection'
        # self.set_nodelay(True)
        
      
    def on_message(self, message):
        
        print 'message received' , message
        try:
            obj=json.loads(message);
        except ValueError, e:
            print e
            self.close()
        try :
            self.write_message("I have received your message: %s %s %s " \
                               % ( obj["corpus"], obj["nbrows"] ,obj["nbcols"]) )
        except tornado.websocket.WebSocketClosedError, e :
            print e
 
    def on_close(self):
      print 'connection closed'
      # print self.close_code , self.close_reason.
 
 
application = tornado.web.Application([
    (r'/ws', WSHandler),
])
 
 
if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8888)
    try :
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
