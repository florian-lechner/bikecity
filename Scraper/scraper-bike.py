import requests
import json
from dbinfo import *
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from datetime import datetime

Base = automap_base()
engine = create_engine(DATABASE_URL)

# reflect the tables
Base.prepare(autoload_with=engine)
Station_Availability_table = Base.classes.ringringbikes.station_availability
Stations_table = Base.classes.ringringbikes.stations

def test_connection():
    with Session(engine) as session:
        result = session.execute("SELECT * FROM ringringbikes.stations")
        for line in result:
            print(line)

def create_stations(stations):
    with Session(engine) as session:
        for station in stations:
            #print(station)
            try:
                session.add(Stations_table(station_id=int(station.get("number")), name=station.get("name"), address=station.get("address"), total_bike_stands=int(station.get("available_bike_stands"))))
                #vals = (int(station.get("number")), station.get("name"), station.get("address"), int(station.get("available_bike_stands")))
                #result = session.execute("INSERT INTO `ringringbikes`.`stations` (`station_id`, `name`, `address`, `total_bike_stands`) VALUES (%s, %s, %s, %s)", vals)
            except:
                session.rollback()
                raise
            else:
                session.commit()

def time_to_datetime(time):
    # Format "1000-01-01 00:00:00"
    dt = datetime.fromtimestamp(time / 1000)
    formatted_date = dt.strftime("%Y-%m-%d %H:%M:%S")
    return formatted_date

def store(stations):
    with Session(engine) as session:
        for station in stations:
            #print(station)
            vals = (int(station.get("number")), time_to_datetime(int(station.get("last_update"))), int(station.get("available_bikes")), int(station.get("available_bike_stands")), station.get("status"))
            
            result = session.execute("INSERT INTO `ringringbikes`.`station_availability` (`station_id`, `last_update`, `available_bikes`, `available_bike_stands`, `status`) VALUES (%s, %s, %s, %s, %s)", vals)

def main():
    r = requests.get(URL, params={"contract":CONTRACT, "apiKey": JCKEY})  
    stations = json.loads(r.text)
    create_stations(stations)
    #store(stations)
    #print(json.loads(r.text))


main()
#test_connection()
