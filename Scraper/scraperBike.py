import requests
import json
from dbinfo import *
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from datetime import datetime




def connect_db():
    global Base
    global engine
    global Station_Availability_table
    global Stations_table
    global Station_Coordinates_table
    Base = automap_base()
    engine = create_engine(DATABASE_URL)

    # reflect the tables
    Base.prepare(autoload_with=engine, schema="ringringbikes")
    Station_Availability_table = Base.classes.station_availability
    Stations_table = Base.classes.stations
    Station_Coordinates_table = Base.classes.station_coordinates


def time_to_datetime(time):
    # Format "1000-01-01 00:00:00"
    dt = datetime.fromtimestamp(time / 1000)
    formatted_date = dt.strftime("%Y-%m-%d %H:%M:%S")
    return formatted_date

# Test function to check if connection to database is successful
def test_connection():
    with Session(engine) as session:
        result = session.execute("SELECT * FROM ringringbikes.stations")
        for line in result:
            print(line)

# Functions adds every station from the API request into the stations table
def create_stations():
    r = requests.get(JC_URL, params={"contract":JC_CONTRACT, "apiKey": JC_KEY})  
    stations = json.loads(r.text)
    with Session(engine) as session:
        for station in stations:
            #print(station)
            try:
                session.add(Stations_table(station_id=int(station.get("number")), name=station.get("name"), address=station.get("address"), total_bike_stands=int(station.get("available_bike_stands"))))
                session.commit()
            except IntegrityError:
                session.rollback()
    with Session(engine) as session:
        for station in stations:
            #print(station)
            try:
                session.add(Station_Coordinates_table(station_id=int(station.get("number")), position_lat=station.get("latitude"), position_lng=station.get("longitude")))
                session.commit()
            except IntegrityError:
                session.rollback()
                

# Stores all the stations data in the station availability table
def store(stations):
    with Session(engine) as session:
        for station in stations:
            #print(station)
            try:
                session.add(Station_Availability_table(station_id=int(station.get("number")), last_update=time_to_datetime(int(station.get("last_update"))), available_bikes=int(station.get("available_bikes")), available_bike_stands=int(station.get("available_bike_stands")), status=station.get("status")))
                session.commit()
            except IntegrityError:
                session.rollback()

def main():
    r = requests.get(JC_URL, params={"contract":JC_CONTRACT, "apiKey": JC_KEY})  
    stations = json.loads(r.text)
    connect_db()
    store(stations)
    #print(stations)


#main()
#test_connection()
