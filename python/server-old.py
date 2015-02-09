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

nbClust=3
 
 
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
            with open('./config.json') as cfg  :
                config=json.load(cfg)
            name=config["STORAGE_NAME"] 
            key=config["STORAGE_KEY"]
            blsvc=BlobService(name,key)
            txt=blsvc.get_blob('test', 'data/classic3.mat')
            with open("temp.mat","wb") as f:
                f.write(txt)
            matlabdoc=loadmat("temp.mat")
            X=matlabdoc["A"]
            nbClust=3
            result='{"rowClusterProp":[217,140,195],"colClusterProp":[98,138,80],\
 "rowClusterJob": [["doc1","doc2","doc3"],["doc4","doc5","doc6"],["doc7","doc8","doc9"]],\
 "colClusterGenre": [["library","cases","retrieval"],["boundary","mach","layer"],["patients","cells","renal"]],\
 "rowClusterJobProp":[[{"scientific": 0.019,"weight": 0.017, "presence": 0.026,  "science": 0.022, "incidence": 0.029, "library": 0.0516, "transformation": 0.014, "libraries": 0.027, "rate":0.022, "book": 0.020, "mechanism": 0.014, "test": 0.014, "cases": 0.046, "document": 0.013, "retrieval": 0.0296}],[{"supersonic": 0.043, "layer": \
0.056, "naca": 0.028d co, "flat": 0.0256, "shock": 0.030, "hypersonic": 0.026, "laminar": 0.035, "dimensional": 0.030, "pressure": 0.0387, "heat": 0.032, "velocity": 0.03977, "boundary": 0.0753, "equations": 0.031, "scs": 0.0527, "mach": 0.064}],[{"urinary": 0.014, "hormone": 0.02089, "rats": 0.0164, "renal": 0.0215, "cancer": 0.0162, "cells": 0.03095, "disease": 0.0191, "rat": 0.014, "cell": 0.01950, "patients": 0.032, "tissue": 0.015, "therapy": 0.01789, "liver": 0.0172, "serum": 0.017, "kidney": 0.015}]],\
 "colClusterGenreProp":[[{"scientific": 0.019,"weight": 0.017, "presence": 0.026,  "science": 0.022, "incidence": 0.029, "library": 0.0516, "transformation": 0.014, "libraries": 0.027, "rate":0.022, "book": 0.020, "mechanism": 0.014, "test": 0.014, "cases": 0.046, "document": 0.013, "retrieval": 0.0296}],[{"supersonic": 0.043, "layer": \
0.056, "naca": 0.028, "flat": 0.0256, "shock": 0.030, "hypersonic": 0.026, "laminar": 0.035, "dimensional": 0.030, "pressure": 0.0387, "heat": 0.032, "velocity": 0.03977, "boundary": 0.0753, "equations": 0.031, "scs": 0.0527, "mach": 0.064}],[{"urinary": 0.014, "hormone": 0.02089, "rats": 0.0164, "renal": 0.0215, "cancer": 0.0162, "cells": 0.03095, "disease": 0.0191, "rat": 0.014, "cell": 0.01950, "patients": 0.032, "tissue": 0.015, "therapy": 0.01789, "liver": 0.0172, "serum": 0.017, "kidney": 0.015}]]}' 

            with open("result-file.txt" ,"w") as rf :
                rf.write(result)
                blsvc.put_blob('test', 'data/classic3_result.txt', result, x_ms_blob_type = "BlockBlob")

            target_names=['cisi','cran','med']
            transformer = TfidfTransformer()
            X_tfidf = transformer.fit_transform(X)
            cocluster = SpectralCoclustering(n_clusters=nbClust,
                                 svd_method='arpack', random_state=0)

            cocluster.fit(X_tfidf)
            print " len(cocluster.row_labels_))" ,  len(cocluster.row_labels_)


            #  ///////////  sub_matrices
            
            blobList=list()
            for blob in blsvc.list_blobs('test') :
                blobList.append(blob.name)
            matrices=dict()

            for k in range(nbClust) :
                if 'data/cluster-' + str(k) + '.mat'  not in blobList :
                        print  "======= building matrix for co-cluster", k
                        r_indices=cocluster.get_indices(k)[0]
                        print  "r_indices length" , len(r_indices)
                        c_indices=cocluster.get_indices(k)[1]
                        print  "c_indices length" , len(c_indices)
                        m=sp.lil_matrix((X.shape[0],X.shape[1])) # lil accepte affectation discontinue avec syntaxe zip ...
                        print  "creating matrix" , m.shape
                        m[r_indices, c_indices]=X_tfidf[r_indices[:,np.newaxis], c_indices]
                        print "m.nnz" ,  m.nnz
                        # TO DO 
                        savemat('../data/dhillon/cluster-' + str(k) + '.mat', {'a' : m})
                else :
                    print  "======= loading matrix for co-cluster", k
                    txt=blsvc.get_blob('test', data/cluster-' + str(k) + '.mat' )
                    with open("temp.mat","wb") as f:
                                       f.write(txt)
                    m=loadmat('temp.mat')['a']
                matrices[k]=m

##            txt=blsvc.get_blob('test', 'data/classic3_result.txt')
##            print txt
            self.write_message("I have received your message: %s %s %s " \
                               % ( obj["corpus"], obj["nbrows"] ,obj["nbcols"]  ))

            
        except tornado.websocket.WebSocketClosedError, e :
            print e
 
    def on_close(self):
      print 'connection closed'
      # print self.close_code , self.close_reason.
 
 
application = tornado.web.Application([
    (r'/testCommunications/ws', WSHandler),
])
 
 
if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8888)
    try :
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
