import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import json

from sklearn.datasets import make_biclusters
from sklearn.datasets import samples_generator as sg
from sklearn.cluster.bicluster import SpectralCoclustering
from sklearn.cluster import MiniBatchKMeans
from sklearn.metrics import consensus_score
from sklearn.metrics.cluster import v_measure_score
from sklearn.feature_extraction.text  import TfidfTransformer
from sklearn.preprocessing import normalize
from sklearn import metrics
import sklearn
import sys
import scipy.sparse as sp

from azure.storage import BlobService
# put_block_blob_from_text put_block_blob_from_bytes  .put_block_blob_from_path('images', 'image.png', 'uploads/image.png')
# get_blob_to_bytes get_blob_to_file get_blob_to_text


import numpy as np

import os.path

from time import time
from collections import Counter


from scipy.io import loadmat, savemat

from spectral import *

 
 
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
            resp=testSpectral(obj["corpus"], obj["nbrows"] ,obj["nbcols"])
            
            self.write_message("I have received your message: %s %s %s  %s " \
                               % ( obj["corpus"], obj["nbrows"] ,obj["nbcols"] , resp))

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
