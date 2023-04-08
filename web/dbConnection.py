import json
from groupConfig import *
from personalConfig import *
from sqlalchemy import text
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
import requests
import util

# create the connection to the database
def connect_db():
    global Base
    global engine
    global Station_Availability_table
    #global Station_Availability_timestamp_table
    global Stations_table
    global Station_Coordinates_table
    Base = automap_base()
    engine = create_engine(DATABASE_URL)

    # reflect the tables
    # Base.prepare(autoload_with=engine, schema="ringringbikes")
    # Station_Availability_table = Base.classes.station_availability
    # Stations_table = Base.classes.stations
    # Station_Coordinates_table = Base.classes.station_coordinates
    #Station_Availability_timestamp_table = Base.classes.station_availability_timestamp

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
    
def get_station_historical_data(id):
    historical_data = []
    with Session(engine) as session:
        result = session.execute(text("SELECT CAST(HOUR(last_update) AS SIGNED INT) AS 'Hour', DAYNAME(last_update) as 'Day', \
                                      CAST(AVG(available_bikes) AS SIGNED INT) AS 'Average_Bikes', CAST(AVG(available_bike_stands) AS SIGNED INT) AS 'Average_Stands' \
                                      FROM ringringbikes.station_availability \
                                      WHERE station_id = :id\
                                      GROUP BY Hour, Day;"), {"id": id})
        for line in result:
            historical_data_entry = {'hour': line[0], 'day': line[1], 'average_bike_availability': line[2], 'average_bike_stand_availability': line[3]}
            historical_data.append(historical_data_entry)
        return historical_data

def get_live_weather():
    live_weather = {}
    with Session(engine) as session:
        try:
            result = session.execute(text("SELECT W1.request_time, W1.forecast_time, W1.temperature, W1.weather_type, W1.icon_number, W2.sunrise, W2.sunset, W2.temperature_feels_like, W2.day_flag, W1.precipitation_probability\
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
                live_weather = {'current_temp': round(line[2]), 'weather_type': line[3], 'icon_number': ico, 'request_time': line[0], 'sunrise_time': line[6], 'sunset_time': line[7], 'temperature_feels_like': round(line[8]), 'precipitation_probability': round(line[9])}
        except:
            print("Error getting current weather from SQL")
        
        # Get min / max weather:
        #Test date:
        today =  str(date(2023, 3, 8)) #str(date.today())
        min_max_temp = []
        try:
            result = session.execute(text("SELECT W1.temperature\
                                        FROM ringringbikes.weather AS W1\
                                        WHERE CONCAT(DATE_FORMAT(W1.request_time, '%Y-%m-%d %H:'), LPAD(ROUND(MINUTE(W1.request_time) / 5) * 5, 2, '0'), '\:00') = '" + today + " 00:00:00'\
                                        ORDER BY W1.forecast_time ASC;"))
            
            for i, line in enumerate(result):
                if i < 24:
                    min_max_temp.append(line[0])

            live_weather["min_temp"] = round(min(min_max_temp))
            live_weather["max_temp"] = round(max(min_max_temp))
        except:
            print("Error getting current min/max weather")
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


