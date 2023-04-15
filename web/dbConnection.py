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
   forecast_weather = {}
   hours = int(hours)
   with Session(engine) as session:
        result = session.execute(text("SELECT T1.request_time, T1.forecast_time, T1.temperature, T1.weather_type, T1.icon_number, T2.sunrise, T2.sunset, T2.temperature_feels_like, T2.day_flag,  T1.precipitation_probability, T1.pressure, T1.humidity, T1.clouds, T1.precipitation_value\
                                    FROM ringringbikes.weather AS T1, ringringbikes.weather_extra AS T2\
                                    WHERE CONCAT(DATE_FORMAT(T1.request_time, '%Y-%m-%d %H:'), LPAD(ROUND(MINUTE(T1.request_time) / 5) * 5, 2, '0'), '\:00') = CONCAT(DATE_FORMAT(T2.request_time, '%Y-%m-%d %H:'), LPAD(ROUND(MINUTE(T2.request_time) / 5) * 5, 2, '0'), '\:00') AND T1.request_time = (\
	                                    SELECT MAX(T1.request_time)\
	                                    FROM ringringbikes.weather AS T1, ringringbikes.weather_extra AS T2\
	                                    WHERE T1.request_time = T2.request_time)\
                                    ORDER BY T1.request_time DESC;"))
        for i, line in enumerate(result):
            if i ==int(hours):
                ico = util.icon_to_file_name(line[4], line[8])
                forecast_weather = {'forecast_temp': round(line[2]), 'weather_type': line[3], 'icon_number': ico, 'precipitation_probability': round(line[9]), 'pressure': line[10], 'humidity':line[11], 'clouds':line[12], 'precipitation_value':line[13]}
        
        # Get min / max weather:
        #Test date:
        today_time =  datetime(2023, 3, 8, 8, 0, 0) #datetime.datetime.now()
        today = str(today_time.date())
        min_max_temp = []
        try:
            result = session.execute(text("SELECT W1.temperature\
                                        FROM ringringbikes.weather AS W1\
                                        WHERE CONCAT(DATE_FORMAT(W1.request_time, '%Y-%m-%d %H:'), LPAD(ROUND(MINUTE(W1.request_time) / 5) * 5, 2, '0'), '\:00') = '" + today + " 00:00:00'\
                                        ORDER BY W1.forecast_time ASC;"))
            
            start_day = 24 - today_time.hour - 1

            for i, line in enumerate(result):
                if start_day < i < start_day+24:
                    min_max_temp.append(line[0])

            forecast_weather["min_temp"] = round(min(min_max_temp))
            forecast_weather["max_temp"] = round(max(min_max_temp))
        except:
            print("Error getting current min/max weather")

        return forecast_weather

        
        #return {'No forecast found for %f hours from now', hours}


def get_timeline_availability():
    timeline_availability = []
    with Session(engine) as session:
        try:
            result = session.execute(text("(SELECT station_id, DAYNAME(last_update) as 'Day', HOUR(last_update) as 'Hour', CAST(AVG(available_bikes) AS SIGNED INT) as 'Average_Bikes', CAST(AVG(available_bike_stands) AS SIGNED INT) as 'Average_Stands'  FROM ringringbikes.station_availability\
                                                    WHERE DATE(last_update) = (\
                                                    SELECT DATE(last_update) FROM ringringbikes.station_availability ORDER BY last_update DESC\
                                                    LIMIT 1) \
                                                    AND HOUR(last_update) < (\
                                                    SELECT HOUR(last_update) FROM ringringbikes.station_availability ORDER BY last_update DESC\
                                                    LIMIT 1) \
                                            GROUP BY station_id, Hour)\
                                            UNION\
                                            (SELECT station_id, DAYNAME(last_update) as 'Day', HOUR(last_update) as 'Hour', available_bikes as 'Average_Bikes', available_bike_stands as 'Average_Stands' FROM ringringbikes.station_availability, (SELECT station_id as 'max_id', MAX(last_update) as 'max_update' FROM ringringbikes.station_availability GROUP BY max_id) subtable \
                                            WHERE station_id = max_id AND last_update = max_update)\
                                            UNION\
                                            (SELECT station_id, DAYNAME(last_update) as 'Day', HOUR(last_update) as 'Hour', CAST(AVG(available_bikes) AS SIGNED INT) as 'Average_Bikes', CAST(AVG(available_bike_stands) AS SIGNED INT) AS 'Average_Stands'  FROM ringringbikes.station_availability\
                                            WHERE DAYNAME(last_update) = (\
                                                    SELECT DAYNAME(last_update) FROM ringringbikes.station_availability ORDER BY last_update DESC\
                                                    LIMIT 1)\
                                                    AND HOUR(last_update) > (\
                                                    SELECT HOUR(last_update) FROM ringringbikes.station_availability ORDER BY last_update DESC\
                                                    LIMIT 1)\
                                            GROUP BY station_id, Hour)\
                                            ORDER BY station_id, Hour;"))

            
            resultArray = []

            for line in result:
                resultArray.append({'stationID' : int(line[0]), 'day': line[1], 'hour': int(line[2]), 'average_bikes': line[3], 'average_stands': line[4]})

            for i in range(24):
                availability = []
                for item in resultArray:
                    if int(item['hour']) == i:
                        availability.append(item)
                timeline_availability.append(availability)

        except Exception as e:
            print("Error getting timeline availability data", e)

        return timeline_availability

def current_time_for_testing(): 
    connect_db()
    with Session(engine) as session:
        result = session.execute(text("SELECT DATE_FORMAT(last_update, '%Y-%m-%dT%H:%i:%sZ') from ringringbikes.station_availability ORDER BY last_update DESC LIMIT 1;"))
        for line in result:
            currentTime = {'time' : line[0]}
        return currentTime


def get_clean_db():
    connect_db()
    with Session(engine) as session:
        result = session.execute(text("SELECT * FROM ringringbikes.clean_DB"))
        return result

def main():
    connect_db()

main()


