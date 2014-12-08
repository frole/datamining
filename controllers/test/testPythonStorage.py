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

from azure.storage import BlobService, BlobResult


# put_block_blob_from_text put_block_blob_from_bytes  .put_block_blob_from_path('images', 'image.png', 'uploads/image.png')
# get_blob_to_bytes get_blob_to_file get_blob_to_text
# blob_service.put_blob('foo', 'README.txt',
#file('/usr/share/doc/grep/README').read(),'BlockBlob')


import numpy as np

import os.path

from time import time
from collections import Counter

from scipy.io import loadmat, savemat

nbClust=3


with open('./config.json') as cfg  :
    config=json.load(cfg)
name=config["STORAGE_NAME"] 
key=config["STORAGE_KEY"]

blsvc=BlobService(name,key)

txt=blsvc.get_blob('test', 'data/classic3.mat')

with open("temp.mat","wb") as f:
    f.write(txt)

matlabdoc=loadmat("temp.mat")

for k in matlabdoc.keys() :
    if k == "A" :
        X=matlabdoc[k]
        print  X.shape
    elif k =="labels" :
        y_true=[ x[0] for x in matlabdoc[k]]
        print  "classification" , len(y_true)
        #print  y_true
        
    elif k=="ms" :
        feature_names=matlabdoc[k]
        print  "feature names" , len(feature_names)
        print  type(feature_names[10])
    elif k=="ts" :
        document_names=matlabdoc[k]
        print  "doc names" , len(document_names)

txt2=blsvc.get_blob('test', 'data/classic3_result.txt')
#print "rrr"  , txt2

for blob in blsvc.list_blobs('test') :
    print blob.name

result="AAA BBB CCC"
with open("result-file.txt" ,"w") as rf :
    rf.write(result)

##blsvc.put_blob

blsvc.put_blob('test', 'data/cluster-0.mat', "/home/frole/recherche/data/dhillon/cluster-0.mat", \
               x_ms_blob_type = "BlockBlob")

blsvc.put_blob('test', 'data/cluster-1.mat', "/home/frole/recherche/data/dhillon/cluster-1.mat", \
               x_ms_blob_type = "BlockBlob")

blsvc.put_blob('test', 'data/cluster-0.mat', "/home/frole/recherche/data/dhillon/cluster-2.mat", \
               x_ms_blob_type = "BlockBlob")





