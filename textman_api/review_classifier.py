# %tensorflow_version 2.x
# from tensorflow.keras.models import Sequential
# from tensorflow.keras import utils
# from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
# import numpy as np
from tensorflow.keras.layers import Dense, Embedding, GRU, LSTM, Input  # , Dropout
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import tokenizer_from_json     # Tokenizer,
from keras.models import Model
from threading import Thread
import json
import os
from langdetect import detect_langs, DetectorFactory
import logger
import pickle
import datetime
from datetime import datetime as dt


# monitoring of the values in real time and fix in file
monitoring = True
DetectorFactory.seed = 0


def save_data(arr):
    timestamp = (dt.now() + datetime.timedelta(hours=5))\
        .strftime('%d/%m/%Y, %H:%M:%S')
    print(arr)
    with open('data.csv', 'a') as datafile:
        datafile.write(
            '\n'.join([';'.join([str(i) for i in [*e,timestamp]]) for e in arr]))


indef_thresh = 0.1
num_words = 10000
max_review_len = 100    # максимальное количество слов из отзыва для использования
embed_size = 100        # максимальное количество уникальных слов


def get_tokenizer(tokenizer_name: str):
    tokenizer_path = os.path.join(os.getcwd(), 'models', tokenizer_name)
    with open(tokenizer_path, encoding='utf-8') as f:
        tokenizer_data = json.load(f)
        # tokenizer_data = pickle.load(f)
    tokenizer = tokenizer_from_json(tokenizer_data)
    return tokenizer


ru_tokenizer = None  # get_tokenizer('ru_review_tokenizer.pickle')
en_tokenizer = get_tokenizer('en_review_tokenizer.json')


def make_model(model_path: str):
    inp = Input(shape=(max_review_len,))
    x = Embedding(num_words, embed_size, input_length=max_review_len)(inp)
    x = LSTM(40, return_sequences=True)(x)
    x = GRU(40)(x)
    outp = Dense(1, activation='sigmoid')(x)
    lstm_model = Model(inputs=inp, outputs=outp)
    lstm_model.load_weights(model_path)
    return lstm_model


ru_model_path = os.path.join(os.getcwd(), 'models', 'ru_review_model.hdf5')
en_model_path = os.path.join(os.getcwd(), 'models', 'en_review_model.hdf5')
model_ru = None  # make_model(ru_model_path)
model_en = make_model(en_model_path)


def get_reviews(corpus):
    corpus_ids = [corpus[i]['id'] for i in range(len(corpus))]
    corpus_texts = [corpus[i]['text'] for i in range(len(corpus))]
    ids_to_texts = dict([(corpus_ids[i], corpus_texts[i]) for i in range(len(corpus_texts))])
    result_reviews = {'positive': [],
                      'negative': [],
                      'indefinite': []
                      }
    to_save = list()
    for identifier, text in ids_to_texts.items():
        try:
            '''langs = detect_langs(text)
            list_of_langs = []
            for lang in langs:
                list_of_langs.append(lang.lang)
            '''
            list_of_langs = ['en']
            if (('ru' in list_of_langs) or ('uk' in list_of_langs)):
                sequence = ru_tokenizer.texts_to_sequences([text])
                data = pad_sequences(sequence, maxlen=max_review_len)
                model = model_ru
            else:
                sequence = en_tokenizer.texts_to_sequences([text])
                data = pad_sequences(sequence, maxlen=max_review_len)
                model = model_en
            result = model.predict(data)
            if result[[0]] < 0.5 - indef_thresh:
                result_reviews['negative'].append(identifier)        # 'Отзыв отрицательный'
            elif result[[0]] <= 0.5 + indef_thresh:
                result_reviews['indefinite'].append(identifier)
            else:
                result_reviews['positive'].append(identifier)        # 'Отзыв положительный')
            if monitoring:
                to_save.append([text, result[0, 0]])
        except Exception as e:
            logger.error()
            logger.error(f"{e}")
    if monitoring:
        Thread(target=lambda: save_data(to_save)).start()
    return result_reviews


dictionary = [
     {'id': '0', 'text': 'Худший из когда-либо оставленных отзывов!'},
     {'id': '1', 'text': """Would be better if you could remove ads even if there was \
a small one time cost for the app. \
I would buy it if the price was reasonable to get rid of ads.\
Did not find an option for this."""},
    {'id': '2', 'text': 'Nice look but itsnot working'},
    {'id': '3', 'text': 'Gives wrong analysis'}
]

print(get_reviews(dictionary))