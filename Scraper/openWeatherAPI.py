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
    global Weather_extra_table
    Base = automap_base()
    engine = create_engine(DATABASE_URL)

    # reflect the tables
    Base.prepare(autoload_with=engine, schema="ringringbikes")
    Weather_extra_table = Base.classes.weather_extra
    
def time_to_datetime(time):
    # Format "1000-01-01 00:00:00"
    # Convert the Unix timestamp to a datetime object
    dt_object = datetime.fromtimestamp(time)
    # Format the datetime object as a string in the desired format
    formatted_datetime = dt_object.strftime('%Y-%m-%d %H:%M:%S')
    return formatted_datetime

def store(weather_extra):
    # instead of request time, it is calculation time given from openWeather system
    request_time = time_to_datetime(weather_extra.get("dt"))
    try:
        sunrise = time_to_datetime(weather_extra["sys"].get("sunrise"))
        sunset = time_to_datetime(weather_extra["sys"].get("sunset"))
        temperature_feels_like = float(weather_extra["main"].get("feels_like"))
        # returns visibility in meter, max is 10 km
        visibility = float(weather_extra.get("visibility"))
        # Day flag
        if sunrise <= request_time < sunset:
            day_flag = 1
        else:
            day_flag = 0

        with Session(engine) as session:
            session.add(Weather_extra_table(request_time=request_time, sunrise=sunrise, sunset=sunset, temperature_feels_like=temperature_feels_like, visibility=visibility, day_flag = day_flag))
            session.commit()
    except IntegrityError:
        session.rollback()

def main():
    r = requests.get(OPENWEATHER_API, params={"lat":LATITUDE, "lon": LONGITUDE, "appid": OPENWEATHER_KEY, "units":"metric"})   
    weather_extra_stuff = json.loads(r.text)
    connect_db()
    store(weather_extra_stuff)
    #print(weather_extra_stuff)
