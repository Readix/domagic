from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from clusterization import find_clusters
from review_classifier import get_reviews
import logger as log


def wrap_exec(func):
    try:
        message = {'error': False, 'data': func()}
    except Exception as e:
        log.error()
        message = {'error': True, 'data': str(e)}
    return message


app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Textman is Working!"}


@app.post("/split_kmeans")
def split_kmeans(items: dict):
    return wrap_exec(lambda: find_clusters(items, model="kmeans", return_ids=True))


@app.post("/split_birch")
def split_birch(items: dict):
    return wrap_exec(lambda: find_clusters(items, model="birch", return_ids=True))


@app.post("/split_dbscum")
def split_dbscum(items: dict):
    return wrap_exec(lambda: find_clusters(items, model="dbscum", return_ids=True))


@app.post("/binary_ton")
def binary_ton(items: List[dict]):
    return wrap_exec(lambda: get_reviews(items))