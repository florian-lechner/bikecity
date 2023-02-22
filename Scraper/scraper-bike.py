import requests
import json
from dbinfo import *
from sqlalchemy import create_engine
from sqlalchemy import text

engine = create_engine(DATABASE_URL)

def test-connection():
    with engine.connect() as connection:
        result = connection.execute("SELECT * FROM ringringbikes.stations")
        for line in result:
            print(line)


def store(text):
    pass


def main():
    r = requests.get(URL, params={"contract":CONTRACT, "apiKey": JCKEY})
    #store(json.loads(r.text))
    #print(json.loads(r.text))


main()
test-connection()
