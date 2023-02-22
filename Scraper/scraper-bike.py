import requests
import json
from dbinfo import *
from sqlalchemy import create_engine
from sqlalchemy import text

engine = create_engine(DATABASE_URL)

def test_connection():
    with engine.connect() as connection:
        result = connection.execute("SELECT * FROM ringringbikes.stations")
        for line in result:
            print(line)


def store(stations):
    for station in stations:
        print(station)
        vals = (int(station.get("number")), int(station.get("last_update")), int(station.get("available_bikes")), int(station.get("available_bike_stands")), station.get("status"))
        engine.execute("INSERT INTO `ringringbikes`.`station_availability` (`station_id`, `last_update`, `available_bikes`, `available_bike_stands`, `status`) VALUES (%s, %s, %s, %s, %s)", vals)

def main():
    r = requests.get(URL, params={"contract":CONTRACT, "apiKey": JCKEY})  
    store(json.loads(r.text))
    #print(json.loads(r.text))


main()
#test_connection()
