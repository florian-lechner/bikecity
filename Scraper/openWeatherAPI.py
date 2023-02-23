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
    request_time = time_to_datetime(weather_extra.get("dt"))
    
    with Session(engine) as session:
        for entry in weather_extra:
            try:
                session.add(Weather_extra_table(request_time=request_time, sunrise=float(entry["sys"].get("sunrise")), sunset=float(entry["sys"].get("sunset")), temperature_feels_like=float(entry["main"].get("feels_like")), visibility=float(entry.get("feels_like"))))
                session.commit()
            except IntegrityError:
                session.rollback()

def main():
    r = requests.get(OPENWEATHER_API, params={"lat":LATITUDE, "lon": LONGITUDE, "appid": OPENWEATHER_KEY})   
    weather_extra_stuff = json.loads(r.text)
    connect_db()
    store(weather_extra_stuff)
    #print(weather_extra_stuff)