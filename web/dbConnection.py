import json
from groupConfig import *
from personalConfig import *
from sqlalchemy import text
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from datetime import datetime
import requests

# create the connection to the database
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

def get_stations():
    stations = []
    with Session(engine) as session:
        result = session.execute(text("SELECT ringringbikes.stations.station_id, address, position_lat as lat, position_lng as lng \
                                      FROM ringringbikes.stations, ringringbikes.station_coordinates \
                                      WHERE ringringbikes.stations.station_id = ringringbikes.station_coordinates.station_id;"))
        for line in result:
            station = {'id': line[0], 'name': line[1], 'position_lat': float(line[2]), 'position_lng': float(line[3])}
            stations.append(station)
    return stations

def get_station_live_data(id):
    live_data = {}
    with Session(engine) as session:
        result = session.execute(text("SELECT SA.station_id, S.address, LT.last_update_time, SA.available_bikes, SA.available_bike_stands\
                                      FROM ringringbikes.stations as S, ringringbikes.station_availability AS SA,\
                                      (SELECT SA.station_id, MAX(SA.last_update) AS last_update_time\
                                      FROM ringringbikes.station_availability AS SA\
                                      GROUP BY SA.station_id) AS LT\
                                      WHERE SA.station_id = LT.station_id AND S.station_id = SA.station_id AND SA.last_update = LT.last_update_time AND SA.station_id = :id;"), {"id": id})
        for line in result:
            live_data = {'id': line[0], 'name': line[1], 'available_bikes': line[3], 'available_stands': line[4]}
        return live_data

#####        
#def get_live_weather():
#    live_weather = {}
#    with Session(engine) as session:
#        result = session.execute(text("SELECT T1.request_time, MIN(T1.forecast_time) AS forecast_time, T1.temperature, T2.request_time, T2.sunrise, T2.sunset, T2.temperature_feels_like\
#                                      FROM ringringbikes.weather AS T1\
#                                      JOIN ringringbikes.weather_extra AS T2 ON T1.request_time <= T2.request_time\
#                                      GROUP BY T1.request_time;"))
#        for line in result:
#            live_weather = {'current_temp': line[2], 'name': line[1], 'available_bikes': line[3], 'available_stands': line[4]}
#        return live_weather
#####

def main():
    connect_db()

main()
# get_station_live_data(111)
# print(get_station_live_data(11))
