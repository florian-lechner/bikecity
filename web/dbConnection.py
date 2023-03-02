import json
from dbinfo import *
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from datetime import datetime

# create the connection to the database
def connect_db():
    global Base
    global engine
    global Station_Availability_table
    global Stations_table
    Base = automap_base()
    engine = create_engine(DATABASE_URL)

    # reflect the tables
    Base.prepare(autoload_with=engine, schema="ringringbikes")
    Station_Availability_table = Base.classes.station_availability
    Stations_table = Base.classes.stations

def get_stations():
    with Session(engine) as session:
        result = session.execute("SELECT * FROM ringringbikes.stations")
        for line in result:
            print(line)


def main():
    connect_db()

main()
get_stations()
    