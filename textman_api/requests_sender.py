import requests
from requests.exceptions import HTTPError


dictionary = [
    {'id': '12453553', 'text': 'I want'},
    {'id': '12459063', 'text': 'be splitted'},
    {'id': '15436262', 'text': 'by textman!'},
]


for url in [f"http://135.181.27.4:8000/items/{dictionary}"]:
    try:
        response = requests.get(url)
        # если ответ успешен, исключения задействованы не будут
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
    else:
        print('Success!')
        content = response.content
        print(f'content = {content}')
        json = response.json()
        print(f'json = {json}')
        text = response.text
        print(f'text = {text}')