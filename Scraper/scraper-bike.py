import requests
import json
from dbinfo import *
from sqlalchemy import create_engine
from sqlalchemy import text

engine = create_engine(DATABASE_URL)

def store(text):
    with engine.connect() as connection:
        query = text("SELECT * FROM ringringbikes.stations")
        result = connection.execute(query)
        for line in result:
            print(line)


def main():
    r = requests.get(URL, params={"contract":CONTRACT, "apiKey": JCKEY})
    #store(json.loads(r.text))
    print(json.loads(r.text))


main()
store()
