import requests
import json
from dbinfo import *
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from datetime import datetime
import xmltodict


def connect_db():
    global Base
    global engine
    global Weather_table
    Base = automap_base()
    engine = create_engine(DATABASE_URL)

    # reflect the tables
    Base.prepare(autoload_with=engine, schema="ringringbikes")
    Weather_table = Base.classes.weather
    
def time_to_datetime(time):
    # Format "1000-01-01 00:00:00"
    date_time = datetime.strptime(time, '%Y-%m-%dT%H:%M:%SZ')
    formatted_date = date_time.strftime('%Y-%m-%d %H:%M:%S')
    return formatted_date

def store(weather):
    request_time = time_to_datetime(weather["weatherdata"].get("@created"))
    
    with Session(engine) as session:
        for entry in weather["weatherdata"]["product"]["time"]:
            if entry.get("@from") == entry.get("@to"):
                forecast_time = time_to_datetime(entry.get("@to"))
                temperature = float(entry["location"]["temperature"].get("@value")) # given in Celsius
                pressure = float(entry["location"]["pressure"].get("@value"))       # given in  units of hPa
                humidity = float(entry["location"]["humidity"].get("@value"))       # max 100 percent
                clouds = float(entry["location"]["cloudiness"].get("@percent"))     
                wind_speed_mps = float(entry["location"]["windSpeed"].get("@mps"))
                wind_speed_beaufort = float(entry["location"]["windSpeed"].get("@beaufort"))
                wind_direction = float(entry["location"]["windDirection"].get("@deg"))
            elif forecast_time == time_to_datetime(entry.get("@to")):
                if entry["location"]["precipitation"].get("@minvalue") is None:
                    break
                # statistical analysis of the forecast, and refer to the lower (20th percentile), 
                # middle (60th percentile) and higher (80th percentile) expected amount
                precipitation_value = float(entry["location"]["precipitation"].get("@value")) # given in milimeters (mm)
                precipitation_min = float(entry["location"]["precipitation"].get("@minvalue"))
                precipitation_max = float(entry["location"]["precipitation"].get("@maxvalue"))
                precipitation_probability = float(entry["location"]["precipitation"].get("@probability"))
                weather_type = str(entry["location"]["symbol"].get("@id"))
                icon_number = int(entry["location"]["symbol"].get("@id"))
                #print(entry)
                try:
                    session.add(Weather_table(request_time=request_time, forecast_time=forecast_time, temperature=temperature, pressure=pressure, humidity=humidity, clouds=clouds, wind_speed_mps=wind_speed_mps, wind_speed_beaufort=wind_speed_beaufort, wind_direction=wind_direction, precipitation_value=precipitation_value, precipitation_min=precipitation_min, precipitation_max=precipitation_max, precipitation_probability=precipitation_probability, weather_type=weather_type, icon_number=icon_number))
                    session.commit()
                except IntegrityError:
                    session.rollback()




def main():
    r = requests.get(MET_URL, params={"lat":LATITUDE, "long": LONGITUDE})  
    weather_dict = xmltodict.parse(r.text)
    weather_json_data = json.dumps(weather_dict)
    weather = json.loads(weather_json_data)
    connect_db()
    store(weather)
    
