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
import util

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
    # Base.prepare(autoload_with=engine, schema="ringringbikes")
    # Station_Availability_table = Base.classes.station_availability
    # Stations_table = Base.classes.stations
    # Station_Coordinates_table = Base.classes.station_coordinates

def get_stations():
    stations = []
    with Session(engine) as session:
        result = session.execute(text("SELECT S.station_id, address, position_lat as lat, position_lng as lng, SA.available_bikes, SA.available_bike_stands\
                                            FROM ringringbikes.stations as S, ringringbikes.station_coordinates as SC, ringringbikes.station_availability AS SA, \
                                                (SELECT SA.station_id, MAX(SA.last_update) AS last_update_time\
                                                FROM ringringbikes.station_availability AS SA\
                                                GROUP BY SA.station_id) AS LT\
                                            WHERE S.station_id = SC.station_id AND S.station_id = SA.station_id AND LT.station_id = S.station_id AND SA.last_update = LT.last_update_time;"))               
        for line in result:
            station = {'id': line[0], 'name': line[1], 'position_lat': float(line[2]), 'position_lng': float(line[3]), 'bikes': float(line[4]), 'bike_stands': float(line[5])}
            stations.append(station)
    print("Successfully retrieved stations from database.")
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
       
def get_live_weather():
    live_weather = {}
    with Session(engine) as session:
        result = session.execute(text("SELECT W1.request_time, W1.forecast_time, W1.temperature, W1.weather_type, W1.icon_number, W2.sunrise, W2.sunset, W2.temperature_feels_like, W2.day_flag\
                                        FROM ringringbikes.weather AS W1\
                                        JOIN ringringbikes.weather_extra AS W2 ON CONCAT(DATE_FORMAT(W1.request_time, '%Y-%m-%d %H:'), LPAD(ROUND(MINUTE(W1.request_time) / 5) * 5, 2, '0'), '\:00') = CONCAT(DATE_FORMAT(W2.request_time, '%Y-%m-%d %H:'), LPAD(ROUND(MINUTE(W2.request_time) / 5) * 5, 2, '0'), '\:00')\
                                        WHERE W1.forecast_time = (\
                                            SELECT MIN(W1.forecast_time)\
                                            FROM ringringbikes.weather AS W1\
                                            GROUP BY W1.request_time\
                                            ORDER BY W1.request_time DESC\
                                            LIMIT 1)\
                                        ORDER BY W1.request_time DESC\
                                        LIMIT 1;"))
        
        for line in result:
            ico = util.icon_to_file_name(line[4],line[8])
            live_weather = {'current_temp': line[2], 'weather_type': line[3], 'icon_number': ico, 'request_time': line[0], 'sunrise_time': line[6], 'sunset_time': line[7], 'temperature_feels_like': round(line[8])}
        return live_weather

def get_forecast_weather(hours): # time taken from input form
   hours = int(hours)
   with Session(engine) as session:
        result = session.execute(text("SELECT T1.request_time, T1.forecast_time, T1.temperature, T1.weather_type, T1.icon_number, T2.sunrise, T2.sunset, T2.temperature_feels_like, T2.day_flag\
                                    FROM ringringbikes.weather AS T1, ringringbikes.weather_extra AS T2\
                                    WHERE CONCAT(DATE_FORMAT(T1.request_time, '%Y-%m-%d %H:'), LPAD(ROUND(MINUTE(T1.request_time) / 5) * 5, 2, '0'), '\:00') = CONCAT(DATE_FORMAT(T2.request_time, '%Y-%m-%d %H:'), LPAD(ROUND(MINUTE(T2.request_time) / 5) * 5, 2, '0'), '\:00') AND T1.request_time = (\
	                                    SELECT MAX(T1.request_time)\
	                                    FROM ringringbikes.weather AS T1, ringringbikes.weather_extra AS T2\
	                                    WHERE T1.request_time = T2.request_time)\
                                    ORDER BY T1.request_time DESC;"))
        for i, line in enumerate(result):
            if i ==int(hours):
                ico = util.icon_to_file_name(line[4], line[8])
                return {'forecast_temp': line[2], 'weather_type': line[3], 'icon_number': ico}
        return {'No forecast found for %f hours from now', hours}

def main():
    connect_db()

main()


