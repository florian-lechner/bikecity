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
       
def get_live_weather():
    live_weather = {}
    with Session(engine) as session:
        # Sort table by request time - get newest request time (min) - merge weather with weather_extra table on rounded request time - get first entry

        result = session.execute(text("SELECT W1.request_time, W1.forecast_time, W1.temperature, W1.weather_type, W1.icon_number, W2.request_time, W2.sunrise, W2.sunset, W2.temperature_feels_like, W2.day_flag\
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
            
            ico = icon_to_file_name(line[4],line[9])

            live_weather = {'current_temp': line[2], 'weather_type': line[3], 'icon_number': ico, 'request_time': line[0], 'sunrise_time': line[6], 'sunset_time': line[7], 'temperature_feels_like': round(line[8])}
        return live_weather


def icon_to_file_name(icon, day_flag):
    if 0 > icon or icon > 52:
        # fallback
        ico = 4
    else:
        ico = icon
    # Icon number to string:
    if ico < 10:
        ico = "0" + str(ico)
    else:
        ico = str(ico)
    # Add day & night to icon
    if ico not in ("04", "09", "10", "11", "12", "13", "14", "15", "22", "23", "30", "31", "32", "33", "34", "46", "47", "48", "49", "50"):
        if day_flag == 1:
            ico += "d"
        else:
            ico += "n"
    return ico

def get_forecast_weather(time): # time taken from input form
   forecast_weather = {}
   with Session(engine) as session:
        dt = datetime.fromtimestamp(time / 1000)
        formattedTime = dt.strftime("%Y-%m-%d %H:%M:%S")
        print(formattedTime)
        # result = session.execute(text("SELECT W1.request_time, W1.forecast_time, W1.temperature, W1.weather_type, W1.icon_number, W2.sunrise, W2.sunset, W2.temperature_feels_like\
        #                             FROM ringringbikes.weather AS W1, ringringbikes.weather_extra AS W2\
        #                             WHERE W1.request_time = W2.request_time AND W1.request_time = \
	    #                             (SELECT MAX(W1.request_time)\
	    #                             FROM ringringbikes.weather AS W1, ringringbikes.weather_extra AS W2\
	    #                             WHERE W1.request_time = W2.request_time)\
        #                             AND W1.forecast_time = ':time'\
        #                             ORDER BY W1.request_time DESC;"), {"time": formattedTime})
        # for line in result:
        #     forecast_weather = {'forecast_temp': line[2], 'weather_type': line[3], 'icon_number': line[4]}
        # return forecast_weather

def main():
    connect_db()

main()
# get_station_live_data(111)
# print(get_station_live_data(11))
