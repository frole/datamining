# -*- coding: utf-8 -*-
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
import json
from operator import itemgetter

import numpy as np

import os.path

from time import time
from collections import Counter

from scipy.io import loadmat, savemat

from azure.storage import BlobService

def blobExists(blsvc, containerName, blobName) :
    for blob in blsvc.list_blobs(containerName) :
        print "existing blob" , blob.name
        if blob.name == blobName :
            return True
    return False


def fileExists(filePath) :
    if os.path.exists(filePath) :
            return True
    else :
        return False


# http://localhost:3000/test/coclustering/docterms/setParameters
def testSpectral(corpus,nbrows,nbcols) :
    
    nbClust=nbrows

    matlabdoc=loadmat("../data/%s.mat" % corpus  )


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

    

    target_names=['cisi','cran','med']

    transformer = TfidfTransformer()
    X_tfidf = transformer.fit_transform(X)

    cocluster = SpectralCoclustering(n_clusters=nbClust,
                                     svd_method='arpack', random_state=0)
    ##kmeans = MiniBatchKMeans(n_clusters=3, batch_size=20000,
    ##                         random_state=0)

    #//////
    print  "Coclustering..."
    start_time = time()
    cocluster.fit(X_tfidf)
    print  "length of cocluster row_labels_" , len(cocluster.row_labels_)

    # ////////////////////////////////////////////
    # Construire ou relire sous-matrices et les mettre dans liste matrices

    matrices=dict()
    X_tfidf=X_tfidf.tocsc()  # csc seule matrice a accepter des extractions de blocs discontinus

    for k in range(nbClust) :
        if not (fileExists('../data/' + corpus + "-nbclust-" + str(nbClust) + '-cluster-' + str(k)+ '.mat')) :
                print  "======= building matrix for co-cluster", k
                r_indices=cocluster.get_indices(k)[0]
                print  "r_indices length" , len(r_indices)
                c_indices=cocluster.get_indices(k)[1]
                print  "c_indices length" , len(c_indices)
                m=sp.lil_matrix((X.shape[0],X.shape[1])) 
                print  "creating matrix" , m.shape
                m[r_indices[:,np.newaxis], c_indices]=X_tfidf[r_indices[:,np.newaxis], c_indices]
                print "m.nnz" ,  m.nnz
                m=m.tocsc()
                savemat('../data/' + corpus + "-nbclust-" + str(nbClust) + '-cluster-' + str(k)+ '.mat', {'a' : m})
                
        else :
            print  "======= loading matrix for co-cluster", k
            m=loadmat('../data/' + corpus + "-nbclust-" + str(nbClust) + '-cluster-' + str(k)+ '.mat')['a']
        matrices[k]=m
        

    


    conflictWords=dict() # ???
    X_tfidf.data[X_tfidf.data>0]=1 # clip to compute MI scores below
    miScores=np.zeros((nbClust,X_tfidf.shape[1]), dtype=float)
    with open('../data/smartStopwords.txt','r') as f :
        txt=f.read()
        stopwords=txt.split()

    nbTerms=15


    # Response Structure   <================================================================
    row_cluster_sizes= list()     # [217,140,195,172,125,94];
    col_cluster_sizes=list()
    row_cluster_info= []
    col_cluster_info= []
    resp=dict()  # contains all the above info 
    
    # ///////  MI SCORES FOR TERMS + global stats =======
    for k in matrices :
               
        m=matrices[k]
        
        print  "submatrix has {} nnz)".format(m.nnz)
        print  "submatrix has {} rows)".format(len(np.unique(np.nonzero(m)[0])))
        print  "submatrix has {} cols)".format(len(np.unique(np.nonzero(m)[1])))
        print  "subm atrix shape" , m.shape
        print
        
        # // prepare global stats here
        row_cluster_sizes.append(len(np.unique(np.nonzero(m)[0])))
        col_cluster_sizes.append(len(np.unique(np.nonzero(m)[1])))

        print
        print
        print "=======  MI SCORES FOR TERMS FOR CO-CLUSTER" ,k
        m.data[m.data>0]=1  # first, clip ; X_TFIDF has already been clipped
        print "Matrix m for cocluster %d ****" % k

        cran=0.
        cisi=0.
        med=0.
        docsInsim=len(np.unique(m.nonzero()[0]))
        print "nb docs in sim"
        for d in np.unique(m.nonzero()[0]) :
            if d < 1033 :
                med+=1
            elif d < 2493 :
                cisi+=1
            else :
                cran+=1

        print "cran" , cran / docsInsim , "%"
        print "med" , med / docsInsim , "%"
        print "cisi" , cisi/ docsInsim , "%"


        nbDocsInCluster=float(len(np.unique(m.nonzero()[0]) ) )# nbDocs in this submatrix
        nbDocs=float(X_tfidf.shape[0])
        print("   nbDocsInCluster {} nbDocs {}".format(nbDocsInCluster, nbDocs))
        for t in np.unique(m.nonzero()[1]) :
            n_11=float(m[:,t].sum()) # nb docs avec t et dans k
            n_01= float(nbDocsInCluster - n_11) # nb docs sans t mais dans k
            n_10= float(X_tfidf[:,t].sum() - n_11 )# nb docs avec t mais hors de k
            n_00= float( int(nbDocs -  nbDocsInCluster - n_10 ) ) # nb docs hors de k et sans t
            epsi=float(1e-14)
            n_1d=n_11 +  n_10
            n_d1=n_11 + n_01  # en fait, pas a calculer pour chqe terme
            n_0d=n_01 + n_00
            n_d0=n_00 + n_10  # pas a calculer pour chqe terme
        

            if n_11 == 0 : n_11 =epsi
            denom= n_1d * n_d1
            if denom == 0 : denom = epsi
            v_11= (n_11 /nbDocs)  * ( np.log2( (nbDocs * n_11) / denom ) )
    

            if n_01 == 0 : n_01 =epsi
            denom= n_0d * n_d1
            if denom == 0 : denom = epsi
            v_01= (n_01/nbDocs) * ( np.log2( (nbDocs * n_01) / denom ))
   
        
            if n_10 == 0 : n_10 =epsi
            denom=n_1d * n_d0
            if denom == 0. : denom = epsi
            v_10= (n_10/nbDocs) * ( np.log2( (nbDocs * n_10) / denom))
    
        
            if n_00 == 0 : n_00 +=epsi
            denom= n_0d * n_d0 
            if denom == 0. : denom = epsi
            v_00= (n_00/nbDocs) * ( np.log2( (nbDocs * n_00) / denom ))
    

            miScores[k,t]= v_11 + v_01 + v_10 + v_00
        

        # response = object with 4 fields : row_cluster_sizes , col_cluster_sizes,
        #                                   row_cluster_info, col_cluster_info
        
        clust_prop_dic=dict()


        # global_col_cluster_info": [{"top_docs": ["doc15", "doc38", "doc10"],
        # "docs_with_best_scores": {"doc10": 0.055, "doc122": 0.0... } , {idem for cluster2}, ... ]

        max_to_examine=50 # retain the lim last ones as candidates (max scores)
        max_to_keep=15 # retain the lim last ones as candidates (max scores)
        best_candidates=np.argsort(miScores[k,:])[:-max_to_examine:-1]
        nb_kept=0
        for t in  best_candidates :
                if nb_kept >= max_to_keep : break
                if len(feature_names[t][0][0]) < 3 : continue
                if feature_names[t][0][0].endswith("ed") : continue
                if feature_names[t][0][0].endswith("ly") : continue
                if feature_names[t][0][0].endswith("ing") : continue
                if feature_names[t][0][0] in stopwords : continue
                nb_kept+=1
                clust_prop_dic[feature_names[t][0][0] ] = float("{:.3f}".format(miScores[k,t]))
        k_cluster_object=dict()
        sorted_term_score_tuples=sorted(clust_prop_dic.iteritems(), key=itemgetter(1), reverse=True)
        k_cluster_object["top_terms"]= [  t[0] for t in sorted_term_score_tuples[:3] ]
        k_cluster_object["terms_with_best_scores"]=clust_prop_dic
        row_cluster_info.append(k_cluster_object) # add info for kth cluster

    # ///////  MI SCORES FOR DOCS =======

    miScores=np.zeros((nbClust,X_tfidf.shape[0]), dtype=float) 
    for k in matrices :
        print 
        
        m=matrices[k]                          

        print
        print
        print "=======  MI SCORES FOR DOCS ======="
        m.data[m.data>0]=1  # first, clip ; X_TFIDF has already been clipped
        print "Matrix m for cocluster %d ****" % k
        
        nbTermsInCluster=float(len(np.unique(m.nonzero()[1]) ) )# nbDocs in this submatrix
        nbTerms=float(X_tfidf.shape[1])
        print("   nbtermsInCluster {} nbterms {}".format(nbTermsInCluster, nbTerms))
        # Var_1 = terme dans d = 1 sinon 0
        # Var_2 = terme dans T = 1 sinon 0
        for d in np.unique(m.nonzero()[0]) :
            n_11=float(m[d,:].sum()) # nb termes dans d et dans (cluster de termes) k
            n_01= float(nbTermsInCluster - n_11) # nb termes hors de d mais dans k
            n_10= float(X_tfidf[d ,:].sum() - n_11 )# nb termes dans d mais hors de k
            n_00= float( int(nbTerms -  nbTermsInCluster - n_10 ) ) # nb termes hors de d et hors de k
            epsi=float(1e-14)
            n_1d=n_11 +  n_10  # nb termes dans d
            n_d1=n_11 + n_01  # nb termes dans k = nbTermsInCluster
            n_0d=n_01 + n_00
            n_d0=n_00 + n_10

            if n_11 == 0 : n_11 =epsi
            denom= n_1d * n_d1
            if denom == 0 : denom = epsi
            v_11= (n_11 /nbTerms)  * ( np.log2( (nbTerms * n_11) / denom ) )

            if n_01 == 0 : n_01 =epsi
            denom= n_0d * n_d1
            if denom == 0 : denom = epsi
            v_01= (n_01/nbTerms) * ( np.log2( (nbTerms * n_01) / denom ))

        
            if n_10 == 0 : n_10 =epsi
            denom=n_1d * n_d0
            if denom == 0. : denom = epsi
            v_10= (n_10/nbTerms) * ( np.log2( (nbTerms * n_10) / denom))
        
            if n_00 == 0 : n_00 +=epsi
            denom= n_0d * n_d0 
            if denom == 0. : denom = epsi
            v_00= (n_00/nbTerms) * ( np.log2( (nbTerms * n_00) / denom ))


            miScores[k,d]= v_11 + v_01 + v_10 + v_00
        clust_prop_dic=dict()
        max_to_keep=15 # retain the lim last ones as candidates (max scores)
        best_candidates=np.argsort(miScores[k,:])[:-max_to_keep:-1]

        for d in  best_candidates :
            clust_prop_dic[ "doc-" + str(d) ] = float("{:.3f}".format(miScores[k,d]))
        k_cluster_object=dict()
        sorted_term_score_tuples=sorted(clust_prop_dic.iteritems(), key=itemgetter(1), reverse=True)
        k_cluster_object["top_docs"]= [  t[0] for t in sorted_term_score_tuples[:3] ]
        k_cluster_object["docs_with_best_scores"]=clust_prop_dic
        col_cluster_info.append(k_cluster_object) # add info for kth cluster
       
    resp['col_cluster_sizes']=col_cluster_sizes
    resp['row_cluster_sizes']=row_cluster_sizes
    resp['row_cluster_info']= row_cluster_info
    resp['col_cluster_info']= col_cluster_info



    r =json.dumps(resp)
    return r



if __name__ == "__main__":
    print fileExists("../data/classic3.mat")
    


# http://localhost:3000/test/coclustering/docterms/setParameters
##def testSpectral(corpus,nbrows,nbcols) :
##    
##    nbClust=nbrows
##
##    with open('./config.json') as cfg  :
##        config=json.load(cfg)
##    name=config["STORAGE_NAME"] 
##    key=config["STORAGE_KEY"]
##    container=config["CONTAINER"]
##
##    blsvc=BlobService(name,key)
##
##    txt=blsvc.get_blob(container, 'data/' + corpus + '.mat')
##
##    with open("temp/temp.mat","wb") as f:
##        f.write(txt)
##
##    matlabdoc=loadmat("temp/temp.mat")
##
##    for k in matlabdoc.keys() :
##        if k == "A" :
##            X=matlabdoc[k]
##            print  X.shape
##        elif k =="labels" :
##            y_true=[ x[0] for x in matlabdoc[k]]
##            print  "classification" , len(y_true)
##            #print  y_true
##            
##        elif k=="ms" :
##            feature_names=matlabdoc[k]
##            print  "feature names" , len(feature_names)
##            print  type(feature_names[10])
##        elif k=="ts" :
##            document_names=matlabdoc[k]
##            print  "doc names" , len(document_names)
##
##    
##
##    target_names=['cisi','cran','med']
##
##    transformer = TfidfTransformer()
##    X_tfidf = transformer.fit_transform(X)
##
##    cocluster = SpectralCoclustering(n_clusters=nbClust,
##                                     svd_method='arpack', random_state=0)
##    ##kmeans = MiniBatchKMeans(n_clusters=3, batch_size=20000,
##    ##                         random_state=0)
##
##    #//////
##    print  "Coclustering..."
##    start_time = time()
##    cocluster.fit(X_tfidf)
##    print  "length of cocluster row_labels_" , len(cocluster.row_labels_)
##
##    # ////////////////////////////////////////////
##    # Construire ou relire sous-matrices et les mettre dans liste matrices
##
##    matrices=dict()
##    X_tfidf=X_tfidf.tocsc()  # csc seule matrice a accepter des extractions de blocs discontinus
##
##    for k in range(nbClust) :
##        if not (blobExists(blsvc, container, 'data/' + corpus + "-nbclust-" + str(nbClust) + '-cluster-' + str(k)+ '.mat')) :
##                print  "======= building matrix for co-cluster", k
##                r_indices=cocluster.get_indices(k)[0]
##                print  "r_indices length" , len(r_indices)
##                c_indices=cocluster.get_indices(k)[1]
##                print  "c_indices length" , len(c_indices)
##                m=sp.lil_matrix((X.shape[0],X.shape[1])) # lil accepte affectation discontinue avec syntaxe zip ...
##                print  "creating matrix" , m.shape
##                m[r_indices, c_indices]=X_tfidf[r_indices[:,np.newaxis], c_indices]
##    ##            print  r_indices[:,np.newaxis]
##    ##            print  X_tfidf[1, c_indices]
##                print "m.nnz" ,  m.nnz
##                m=m.tocsc()
##                savemat('temp/temp.mat', {'a' : m})
##                txt=file('temp/temp.mat').read()
##                blsvc.put_blob(container ,'data/' + corpus + "-nbclust-" + str(nbClust) + '-cluster-' + str(k)+ '.mat' , txt,\
##                               x_ms_blob_type = "BlockBlob")
##        else :
##            print  "======= loading matrix for co-cluster", k
##            txt= blsvc.get_blob(container,'data/' + corpus + "-nbclust-" + str(nbClust) +  '-cluster-' + str(k)  + '.mat' )
##            with open("temp/temp.mat","wb") as f:
##                f.write(txt)
##            m=loadmat("temp/temp.mat")['a']
##        matrices[k]=m
##        
##
##    
##
##
##    conflictWords=dict()
##    X_tfidf.data[X_tfidf.data>0]=1 # clip to compute MI scores below
##    miScores=np.zeros((nbClust,X_tfidf.shape[1]), dtype=float)
##    txt=blsvc.get_blob(container, 'data/smartStopwords.txt')
##    stopwords=txt.split()
##
##    
##
##    nbTerms=15
##
##
##    # Response Structure   <================================================================
##    row_cluster_sizes= list()     # [217,140,195,172,125,94];
##    col_cluster_sizes=list()
##    row_cluster_info= []
##    col_cluster_info= []
##    resp=dict()  # contains all the above info 
##    
##    # ///////  MI SCORES FOR TERMS + global stats =======
##    for k in matrices :
##               
##        m=matrices[k]
##        
##        print  "submatrix has {} nnz)".format(m.nnz)
##        print  "submatrix has {} rows)".format(len(np.unique(np.nonzero(m)[0])))
##        print  "submatrix has {} cols)".format(len(np.unique(np.nonzero(m)[1])))
##        print  "subm atrix shape" , m.shape
##        print
##        
##        # // prepare global stats here
##        row_cluster_sizes.append(len(np.unique(np.nonzero(m)[0])))
##        col_cluster_sizes.append(len(np.unique(np.nonzero(m)[1])))
##
##        print
##        print
##        print "=======  MI SCORES FOR TERMS FOR CO-CLUSTER" ,k
##        m.data[m.data>0]=1  # first, clip ; X_TFIDF has already been clipped
##        print "Matrix m for cocluster %d ****" % k
##
##        cran=0.
##        cisi=0.
##        med=0.
##        docsInsim=len(np.unique(m.nonzero()[0]))
##        print "nb docs in sim"
##        for d in np.unique(m.nonzero()[0]) :
##            if d < 1033 :
##                med+=1
##            elif d < 2493 :
##                cisi+=1
##            else :
##                cran+=1
##
##        print "cran" , cran / docsInsim , "%"
##        print "med" , med / docsInsim , "%"
##        print "cisi" , cisi/ docsInsim , "%"
##
##
##        nbDocsInCluster=float(len(np.unique(m.nonzero()[0]) ) )# nbDocs in this submatrix
##        nbDocs=float(X_tfidf.shape[0])
##        print("   nbDocsInCluster {} nbDocs {}".format(nbDocsInCluster, nbDocs))
##        for t in np.unique(m.nonzero()[1]) :
##            n_11=float(m[:,t].sum()) # nb docs avec t et dans k
##            n_01= float(nbDocsInCluster - n_11) # nb docs sans t mais dans k
##            n_10= float(X_tfidf[:,t].sum() - n_11 )# nb docs avec t mais hors de k
##            n_00= float( int(nbDocs -  nbDocsInCluster - n_10 ) ) # nb docs hors de k et sans t
##            epsi=float(1e-14)
##            n_1d=n_11 +  n_10
##            n_d1=n_11 + n_01  # en fait, pas a calculer pour chqe terme
##            n_0d=n_01 + n_00
##            n_d0=n_00 + n_10  # pas a calculer pour chqe terme
##        
##
##            if n_11 == 0 : n_11 =epsi
##            denom= n_1d * n_d1
##            if denom == 0 : denom = epsi
##            v_11= (n_11 /nbDocs)  * ( np.log2( (nbDocs * n_11) / denom ) )
##    
##
##            if n_01 == 0 : n_01 =epsi
##            denom= n_0d * n_d1
##            if denom == 0 : denom = epsi
##            v_01= (n_01/nbDocs) * ( np.log2( (nbDocs * n_01) / denom ))
##   
##        
##            if n_10 == 0 : n_10 =epsi
##            denom=n_1d * n_d0
##            if denom == 0. : denom = epsi
##            v_10= (n_10/nbDocs) * ( np.log2( (nbDocs * n_10) / denom))
##    
##        
##            if n_00 == 0 : n_00 +=epsi
##            denom= n_0d * n_d0 
##            if denom == 0. : denom = epsi
##            v_00= (n_00/nbDocs) * ( np.log2( (nbDocs * n_00) / denom ))
##    
##
##            miScores[k,t]= v_11 + v_01 + v_10 + v_00
##        
##
##        # response = object with 4 fields : row_cluster_sizes , col_cluster_sizes,
##        #                                   row_cluster_info, col_cluster_info
##        
##        clust_prop_dic=dict()
##
##
##        # global_col_cluster_info": [{"top_docs": ["doc15", "doc38", "doc10"],
##        # "docs_with_best_scores": {"doc10": 0.055, "doc122": 0.0... } , {idem for cluster2}, ... ]
##
##        max_to_examine=50 # retain the lim last ones as candidates (max scores)
##        max_to_keep=15 # retain the lim last ones as candidates (max scores)
##        best_candidates=np.argsort(miScores[k,:])[:-max_to_examine:-1]
##        nb_kept=0
##        for t in  best_candidates :
##                if nb_kept >= max_to_keep : break
##                if len(feature_names[t][0][0]) < 3 : continue
##                if feature_names[t][0][0].endswith("ed") : continue
##                if feature_names[t][0][0].endswith("ly") : continue
##                if feature_names[t][0][0].endswith("ing") : continue
##                if feature_names[t][0][0] in stopwords : continue
##                nb_kept+=1
##                clust_prop_dic[feature_names[t][0][0] ] = float("{:.3f}".format(miScores[k,t]))
##        k_cluster_object=dict()
##        sorted_term_score_tuples=sorted(clust_prop_dic.iteritems(), key=itemgetter(1), reverse=True)
##        k_cluster_object["top_terms"]= [  t[0] for t in sorted_term_score_tuples[:3] ]
##        k_cluster_object["terms_with_best_scores"]=clust_prop_dic
##        row_cluster_info.append(k_cluster_object) # add info for kth cluster
##
##    # ///////  MI SCORES FOR DOCS =======
##
##    miScores=np.zeros((nbClust,X_tfidf.shape[0]), dtype=float) 
##    for k in matrices :
##        print 
##        
##        m=matrices[k]                          
##
##        print
##        print
##        print "=======  MI SCORES FOR DOCS ======="
##        m.data[m.data>0]=1  # first, clip ; X_TFIDF has already been clipped
##        print "Matrix m for cocluster %d ****" % k
##        
##        nbTermsInCluster=float(len(np.unique(m.nonzero()[1]) ) )# nbDocs in this submatrix
##        nbTerms=float(X_tfidf.shape[1])
##        print("   nbtermsInCluster {} nbterms {}".format(nbTermsInCluster, nbTerms))
##        # Var_1 = terme dans d = 1 sinon 0
##        # Var_2 = terme dans T = 1 sinon 0
##        for d in np.unique(m.nonzero()[0]) :
##            n_11=float(m[d,:].sum()) # nb termes dans d et dans (cluster de termes) k
##            n_01= float(nbTermsInCluster - n_11) # nb termes hors de d mais dans k
##            n_10= float(X_tfidf[d ,:].sum() - n_11 )# nb termes dans d mais hors de k
##            n_00= float( int(nbTerms -  nbTermsInCluster - n_10 ) ) # nb termes hors de d et hors de k
##            epsi=float(1e-14)
##            n_1d=n_11 +  n_10  # nb termes dans d
##            n_d1=n_11 + n_01  # nb termes dans k = nbTermsInCluster
##            n_0d=n_01 + n_00
##            n_d0=n_00 + n_10
##
##            if n_11 == 0 : n_11 =epsi
##            denom= n_1d * n_d1
##            if denom == 0 : denom = epsi
##            v_11= (n_11 /nbTerms)  * ( np.log2( (nbTerms * n_11) / denom ) )
##
##            if n_01 == 0 : n_01 =epsi
##            denom= n_0d * n_d1
##            if denom == 0 : denom = epsi
##            v_01= (n_01/nbTerms) * ( np.log2( (nbTerms * n_01) / denom ))
##
##        
##            if n_10 == 0 : n_10 =epsi
##            denom=n_1d * n_d0
##            if denom == 0. : denom = epsi
##            v_10= (n_10/nbTerms) * ( np.log2( (nbTerms * n_10) / denom))
##        
##            if n_00 == 0 : n_00 +=epsi
##            denom= n_0d * n_d0 
##            if denom == 0. : denom = epsi
##            v_00= (n_00/nbTerms) * ( np.log2( (nbTerms * n_00) / denom ))
##
##
##            miScores[k,d]= v_11 + v_01 + v_10 + v_00
##        clust_prop_dic=dict()
##        max_to_keep=15 # retain the lim last ones as candidates (max scores)
##        best_candidates=np.argsort(miScores[k,:])[:-max_to_keep:-1]
##
##        for d in  best_candidates :
##            clust_prop_dic[ "doc-" + str(d) ] = float("{:.3f}".format(miScores[k,d]))
##        k_cluster_object=dict()
##        sorted_term_score_tuples=sorted(clust_prop_dic.iteritems(), key=itemgetter(1), reverse=True)
##        k_cluster_object["top_docs"]= [  t[0] for t in sorted_term_score_tuples[:3] ]
##        k_cluster_object["docs_with_best_scores"]=clust_prop_dic
##        col_cluster_info.append(k_cluster_object) # add info for kth cluster
##       
##    resp['col_cluster_sizes']=col_cluster_sizes
##    resp['row_cluster_sizes']=row_cluster_sizes
##    resp['row_cluster_info']= row_cluster_info
##    resp['col_cluster_info']= col_cluster_info
##
##
##
##    r =json.dumps(resp)
##    return r

##    # //// Select docs closest to centroid - new  ////////////////
##    # /////////////////////////////////////////////////////
##        
##        
##      
##            
##        
##    # //// Select initial top terms using centroids  ///
##    # ///////////////////////////////////////////////////
##    cent=True
##    if cent :
####        scores[k]=np.array(m.sum(axis=0))[0] # scores[k] recoit un tabbleau 1D
##        centroidArray=m.mean(axis=0) # matrix 2D avec une seule ligne
##
##        scores[k]=np.array(centroidArray).flatten()
##
##        
##
##    # //// create list of top terms /////
##    # ///////////////////////////////////
##    print "======== Build graph    ========="
##    i=0
##    nbMax=50
##    topIndices=list()
##    c_indices=cocluster.get_indices(k)[1]
##    sortedIndices=scores[k].argsort() # scores[k] est un tableau 1D
##    for t in sortedIndices[:-150:-1]:
##        if feature_names[t][0][0].endswith("ed") : continue
##        if feature_names[t][0][0].endswith("ly") : continue
##        if feature_names[t][0][0].endswith("ing") : continue
##        if feature_names[t][0][0] in stopwords : continue
##        if len(feature_names[t][0][0]) < 3: continue
##        if t not in c_indices : continue
##        print feature_names[t][0][0].upper() , scores[k,t]
##        topIndices.append(t)
##        i+=1
##        if i > nbMax-1 : break
##
##
##    normalize(m1, axis=0,copy=False)
##    #m.data**=2.0
##    sim=m1.T * m1
##    lim=3
##    j=0
##    asim=sim.toarray()
##    rankingArray=asim.argsort()
##
##    graphDict=dict()
##    for idx , i in enumerate(topIndices) :
##        print  idx , feature_names[i][0][0].upper()
##        j=0
##        nbMax=5
##        bestNeighborsIndices=rankingArray[i][:-100:-1]
##        for idx2 , n in enumerate(bestNeighborsIndices ):
##                if i == n : continue
##                if feature_names[n][0][0].endswith("ed") : continue
##                if feature_names[n][0][0].endswith("ly") : continue
##                if feature_names[n][0][0].endswith("ing") : continue
##                if feature_names[n][0][0].endswith("es") : continue
##                if feature_names[n][0][0] in stopwords : continue
##                if len(feature_names[n][0][0]) < 3 : continue
##                if n not in c_indices : continue
##                graphDict[(i,n) ] = sim[i,n]
##                j+=1
##                if j > nbMax-1 : break
##
##    setOfNodes=set()     
##    for k in graphDict.keys() :
##        setOfNodes.add(k[0])
##        setOfNodes.add(k[1])
##
##    f=open("/home/frole/windows/graph-classic.js","w")
##    numberingDict=dict() # mapping entre numeros originaux et numeros continus ab 0
##
##    print  >> f , "//  ********** nodeArray"
##         
##    print >> f ,"var nodesArray = ["
##    for idx , i in enumerate(setOfNodes) :
##        numberingDict[i]=idx     # pour traduire les numeros originaux en numeros continus ab 0
##        s= 6 if i in topIndices else 3
##        print >> f ,   '{ ' +  'label : "{}", id : {}, color : "#1F77B4", textcolor : "#ba9d92", size : {}, desc : "{}"'\
##              .format(feature_names[i][0][0],idx, s, "description description") + ' },'
##    print >> f ,  "];"
##
##    print >> f ,  "//  ********** nodesHash"
##
##    print  >> f , "var nodesHash = [];"
##    for i in setOfNodes :
##        print  >> f , 'nodesHash["{}"] = {}'.format(feature_names[i][0][0],numberingDict[i])
##
##    print >> f , "//  ********** linksArray"
##
##    print  >> f , "var linksArray = ["
##    for k in graphDict :
##        print >> f ,  '{' +  'desc : "Edge description", source : {}, target : {}, weight : {}, color : "#cfcfff"'.\
##              format(numberingDict[k[0]],numberingDict[k[1]],graphDict[k]) + '},'
##    print   >> f ,  "];"
##
##    
##    # //// Summary matrix building   /////////////
##    # ////////////////////////////////////////////
##    summary=False
##    if summary :
##        coclustMean=m.mean()
##        print  "mean:" , coclustMean
##        rowprop=float(len(np.unique(np.nonzero(m)[0])) ) / X_tfidf.shape[0]
##        colprop=float(len(np.unique(np.nonzero(m)[1])) ) / X_tfidf.shape[1]
##        print >> f ,'[ "value" : {:.3f} ,  "rowprop" : {:.3f} , "colprop" : {:.3f} , topterms : [{}]'.format(coclustMean,rowprop,colprop,
##                                          ",".join([ '"' + feature_names[i][0][0] + '"' \
##                                                     for i in topIndices[:15] ]))
##
##    f.close()      
##    
##            
##
##        
##    # /////////////////////////////////////
##    # /////////   DOCS DOCS DOCS   ////////
##    # /////////////////////////////////////
##    docgraph=False
##    if docgraph :
##        normalize(m2, axis=1,copy=False) # normalize rows (docs)
##        sim=m2 * m2.T
##        print "sim matrix of type %s built and has for MAX %d"  % (type(sim) ,sim.data.max())
##
##
##        # //////  GEFX graph  /////
##        # /////////////////////////
##        gefx=True
##        if gefx :
##            if 
##            meanSim=np.mean(sim.data)
##            print "mean sim for cluster " , meanSim , k
##
##            rsim=sp.lil_matrix((X.shape[0],X.shape[1])) # lil accepte affectation discontinue avec syntaxe zip ...
##            print  "creating reduced sim matrix" , rsim.shape
##            selected=np.random.randint(0,sim.shape[0],400)
##            rsim[selected, selected]=sim[selected[:,np.newaxis], selected]
##            print " rsim.nnz initial = sim apres reduction " , rsim.nnz
##            rsim=rsim.tocsc()
##            rsim.data[rsim.data < meanSim]=0.0
##            rsim.eliminate_zeros()
##            print " rsim.nnz apres seuillage" , rsim.nnz
##            
##            
##            header="""<?xml version="1.0" encoding="UTF-8"?>
##            <gexf xmlns="http://www.gexf.net/1.2draft"  xmlns:viz="http://www.gexf.net/1.1draft/viz" version="1.2">
##                <meta lastmodifieddate="2009-03-20">
##                    <creator>Gexf.net</creator>
##                    <description>A hello world! file</description>
##                </meta>
##                <graph mode="static" defaultedgetype="directed">"""
##
##            footer="""</graph>
##                    </gexf> """
##
##            
##            f=open("/home/frole/windows/docgraph_cluster_" + str(k) + ".gexf", 'w')
##
##            f.write(header + "\n")
##            f.write("<nodes>\n")
##            docs=np.unique(np.nonzero(rsim)[0])
##            for d in docs :
##                f.write('<node id="' + str(d) + '"'  + ' label="' + document_names[d][0][0] + '"' +  '>\n')
##                f.write("</node>\n")
##            f.write("</nodes>\n")
##
##            
##            f.write("<edges>")
##            edgeNum=0
##            #for idx, (d1, d2) in enumerate(product(docs,docs)) :
##            couples=zip(np.nonzero(rsim)[0]  , np.nonzero(rsim)[1] )
##            seen=dict()
##            print "rsim.nnz (couples)" , len(couples)
##            idx=0
##            for idx, (d1, d2) in enumerate(couples) :
##              if (d2,d1) in seen : continue
##              seen[(d1,d2)]=True
##              if idx % 100000 == 0 : sys.stderr.write("doc " + str(idx))
##              if d1 != d2 :
##                  f.write( '<edge id="'  + str(edgeNum) +  '"'  +  ' source="'  + str(d1) + '"' +  ' target="' + str(d2) + '"' + '/>\n')
##                  edgeNum+=1
##            print "IDX final" , idx
##            f.write("</edges>\n")
##            
##            f.write(footer+ "\n")
##
##            f.close()
##
##
##
##        # //// Sim Graph of docs            //////
##        # ////////////////////////////////////////
##        conflicDetection=False
##        if conflicDetection :
##            nbMismatch=dict()
##            asim=sim.toarray()
##            rankingArray=asim.argsort()
##            #print rankingArray
##            print "np.unique(np.nonzero(m)[0])" , len(np.unique(np.nonzero(m2)[0]))
##            for i in np.unique(np.nonzero(m2)[0]) :
##                badDoc=False
##                currClass=document_names[i][0][0][:3]
##                doc=X_tfidf[i]
##                rankedterms=doc.toarray().argsort()
##                bestdocterms=rankedterms[0][:-6:-1]
##                neighbors=rankingArray[i][:-10:-1]
##                for n in neighbors :
##                      if i != n :
##                          if document_names.get(n,"unknown")[:3] != currClass :
##                              badDoc=True ;break
##                if badDoc :
##                    print " === doc with bad neighbors " , document_names.get(i,"unknown")
##                    for t in  bestdocterms :
##                        print(feature_names.get(t,"unknown"))
##                        conflictWords[feature_names[t] ] = conflictWords.get(feature_names[t],0)+1
##                    for n in neighbors :
##                        if i != n :
##                            if document_names.get(n,"unknown")[:3] != currClass :
##                                if document_names.get(i,"unknown") not in nbMismatch :
##                                      nbMismatch[document_names.get(i,"unknown")]=1
##                                else :
##                                      nbMismatch[document_names.get(i,"unknown")]+=1
##                                  
##                                print "===******** bad neighbor doc" , document_names.get(n,"unknown")
##                                doc=X_tfidf[n]
##                                rankedterms2=doc.toarray().argsort()
##                                bestdocterms2=rankedterms2[0][:-6:-1]
##                                for t2 in  bestdocterms2 :
##                                  print(feature_names.get(t2,"unknown"))
##            print "Mismatch for " , k
##            print nbMismatch
##
##        
##        
##            
##
##    
####from operator import itemgetter
####print sorted(conflictdocs.iteritems(), key=itemgetter(1), reverse=True)
##
##
##                                                          
##
##    # //// Best terms of centroids ##  1960 med  1258 cisi 1085 cran
####    centroidArray=m.mean(axis=0) # matrix 2D avec une seule ligne
####    centroidArray=np.array(centroidArray).flatten()
####    #print  centroidArray[:100]
####    sortedIndices=centroidArray.argsort()
####    topCentroidIndices=sortedIndices[:-nbTerms:-1]
####    c_indices=cocluster.get_indices(k)[1]  # les mots du cocluster de mots
####    #print  indices
####    for i in topCentroidIndices :
####        print  feature_names.get(i,"unknown")
####
##    
##
##        
##
##    
##
####    # ////////////////////////////////////////////////////////////
####    # //// Graph of top centroid terms and their nearest neighbors
####    # ////////////////////////////////////////////////////////////
####
####    # //// Sim Graph of cocluster terms
####    normalize(m, axis=0,copy=False)
####    #m.data**=2.0
####    sim=m.T * m
####    lim=3
####    j=0
####    asim=sim.toarray()
####    rankingArray=asim.argsort()
####
####
####    graphDict=dict()
####    for idx , i in enumerate(topCentroidIndices) :
####        print  idx , feature_names.get(i,"unknown").upper()
####        if i in c_indices : # top centroid terms nay not belong to the word comp of the cocl.
####            bestNeighborsIndices=rankingArray[i][:-6:-1]
####            for idx2 , n in enumerate(bestNeighborsIndices ):
####                if i != n :
####                    graphDict[(i,n) ] = sim[i,n]
####        else :
####            print  "*** WARNING  ***" , feature_names.get(i,"unknown")
####
####    setOfNodes=set()     
####    for k in graphDict.keys() :
####        setOfNodes.add(k[0])
####        setOfNodes.add(k[1])
####
####
####    numberingDict=dict() # mapping entre numeros originaux et numeros continus ab 0
####
####    print  >> f , "//  ********** nodeArray"
####         
####    print  >> f ,"var nodesArray = ["
####    for idx , i in enumerate(setOfNodes) :
####        numberingDict[i]=idx     # pour traduire les numeros originaux en numeros continus ab 0
####        s= 3 if i in topCentroidIndices else 5
####        print >> f ,   '{ ' +  'label : "{}", id : {}, color : "#faddd2", textcolor : "#ba9d92", size : {}, desc : "{}"'\
####              .format(feature_names.get(i,"unknown"),idx, s, "description description") + ' },'
####    print >> f ,  "];"
####
####    print >> f ,  "//  ********** nodesHash"
####
####    print  >> f , "var nodesHash = [];"
####    for i in setOfNodes :
####        print  >> f , 'nodesHash["{}"] = {}'.format(feature_names.get(i,"unknown"),numberingDict[i])
####
####    print >> f , "//  ********** linksArray"
####
####    print  >> f , "var linksArray = ["
####    for k in graphDict :
####        print >> f ,  '{' +  'desc : "Edge description", source : {}, target : {}, weight : {}, color : "#cfcfff"'.\
####              format(numberingDict[k[0]],numberingDict[k[1]],graphDict[k]) + '},'
####    print   >> f ,  "];"
####
####f.close()      
####
####
####
