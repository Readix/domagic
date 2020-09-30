import datetime
import traceback
from datetime import datetime as dt

def error():
    timestamp = (dt.now() + datetime.timedelta(hours=5))\
        .strftime('%d/%m/%Y, %H:%M:%S:\n')  # Chelyabinsk time
    with open('error.log', 'a') as log:
        log.write(timestamp + traceback.format_exc() + '\n')

