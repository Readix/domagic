#!/usr/bin/env python
# -*- coding: utf-8 -*-
import logging
from sklearn.cluster import KMeans, Birch, DBSCAN
from sentence_transformers import SentenceTransformer
from sklearn.metrics import silhouette_score

embedder = SentenceTransformer('distiluse-base-multilingual-cased') # distiluse-base-multilingual-cased # bert-base-nli-mean-tokens


def get_best_n_clusters(corpus: list) -> int:
    '''
        Function than finds an optimum count of clusters
    '''
    sil_score_max = -1  #   this is the minimum possible score
    max_clusters_count = len(corpus)
    for n_clusters in range(2, max_clusters_count):
        corpus_texts = [corpus[i]['text'] for i in range(len(corpus))]
        corpus_embeddings = embedder.encode(corpus_texts)
        clustering_model = KMeans(n_clusters=n_clusters, init='k-means++', max_iter=100)
        clustering_model.fit(corpus_embeddings)
        cluster_assignment = clustering_model.labels_
        sil_score = silhouette_score(corpus_embeddings, cluster_assignment)
        #print("The average silhouette score for %i clusters is %0.2f" % (n_clusters, sil_score))
        if sil_score > sil_score_max:
            sil_score_max = sil_score
            best_n_clusters = n_clusters
    return best_n_clusters


def find_clusters(corpus: dict, model="kmeans", return_ids=True) -> list:
    '''
        Function to find clusters using k-means++ clustering
    '''
    global embedder
    if corpus["count_groups"]:
        num_clusters = int(corpus["count_groups"])
    else:
        logging.info(f"Count_groups is not defined! Autoclustering will be used...")
        num_clusters = get_best_n_clusters(corpus=corpus)
    corpus = corpus["widgets"]
    if len(corpus) > 1:
        ids_clusters = []
        try:
            corpus_ids = [corpus[i]['id'] for i in range(len(corpus))]
            corpus_texts = [corpus[i]['text'] for i in range(len(corpus))]
            ids_to_texts = dict([(corpus_ids[i], corpus_texts[i]) for i in range(len(corpus_texts))])
            # text_to_id = dict([(corpus_texts[i], corpus_ids[i]) for i in range(len(corpus_texts))])
            if num_clusters:
                corpus_embeddings = embedder.encode(corpus_texts)
                if model == "kmeans":
                    clustering_model = KMeans(n_clusters=num_clusters)
                    clustering_model.fit(corpus_embeddings)
                    cluster_assignment = clustering_model.labels_
                elif model == "birch":
                    clustering_model = Birch(n_clusters=num_clusters)
                    clustering_model = clustering_model.fit(corpus_embeddings)
                    cluster_assignment = clustering_model.predict(corpus_embeddings)
                elif model == "dbscum":
                    clustering_model = DBSCAN(eps=1, min_samples=2) # Minimal count of clusters
                    clustering_model = clustering_model.fit(corpus_embeddings)
                    cluster_assignment = clustering_model.labels_
                clusters = dict([(str(i), []) for i in set(cluster_assignment)])
                for i in range(len(cluster_assignment)):
                    clusters[str(cluster_assignment[i])].append(corpus_ids[i])
                for cluster, sentences in clusters.items():
                    ids_clusters.append(sentences)
            if return_ids:
                return ids_clusters
            else:
                text_clusters = []
                for list_of_ids in ids_clusters:
                    text_cluster_lists = []
                    for id in list_of_ids:
                        text_cluster_lists.append(ids_to_texts[id])
                    text_clusters.append(text_cluster_lists)
                return text_clusters
        except Exception as e:
            logging.error(f"{e}")
            return [[f"{e}"]]
    else:
        return [["Corpus should be more than one text!"]]

"""
# TEST find_kmeans_clusters function
dictionary = [
    {'id': '1', 'text': 'I want'},
    {'id': '2', 'text': 'be splitted'},
    {'id': '3', 'text': 'by textman!'},
    {'id': '111', 'text': 'I want an apple'},
    {'id': '222', 'text': 'be splitted by man'},
    {'id': '333', 'text': 'by textman to be!'},
]
"""