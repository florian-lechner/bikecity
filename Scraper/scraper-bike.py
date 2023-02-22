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

def create_stations(stations):
    with engine.connect() as connection:
        for station in stations:
            print(station)
            vals = (int(station.get("number")), station.get("name"), station.get("address"), int(station.get("available_bike_stands")))
            result = connection.execute("INSERT INTO `ringringbikes`.`stations` (`station_id`, `name`, `address`, `total_bike_stands`) VALUES ('%s', '%s', '%s', '%s')", vals)


def store(stations):
    with engine.connect() as connection:
        for station in stations:
            print(station)
            vals = (int(station.get("number")), int(station.get("last_update")), int(station.get("available_bikes")), int(station.get("available_bike_stands")), station.get("status"))
            result = connection.execute("INSERT INTO `ringringbikes`.`station_availability` (`station_id`, `last_update`, `available_bikes`, `available_bike_stands`, `status`) VALUES (%s, %s, %s, %s, %s)", vals)

def main():
    r = requests.get(URL, params={"contract":CONTRACT, "apiKey": JCKEY})  
    stations = json.loads(r.text)
    create_stations(stations)
    store(stations)
    #print(json.loads(r.text))


main()
#test_connection()
