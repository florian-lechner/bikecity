
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import sys
sys.path.append('../Scraper/')
import scraperBike
from dbinfo import *

# Only to be executed once.

def create_min_availability():
    errors = []
    with Session(scraperBike.engine) as session:
        # Get first and last date from db to create five minute steps inbetween that
        time_queries = ["SELECT MAX(timestamp) FROM ringringbikes.station_availability_timestamp;", "SELECT MAX(last_update) FROM ringringbikes.station_availability;"]
        time_limits = []
        for query in time_queries:
            result = session.execute(text(query))
        
            for line in result:
                time = line[0]
                time_limits.append(time)
                

        interval = timedelta(minutes=5)
        
        # Counts rows of new table to monitor the execution:
        timestamp = time_limits[0].replace(minute=0,second=0)  + timedelta(hours=1)
        count = 0
        while timestamp <= time_limits[1]:
            timestamp += interval
            count += 1
        print(count, "Timestamps")
        print(count*117, "Rows")
        
        # Loop through every timestamp and a tuple for every station
        timestamp = time_limits[0].replace(minute=0,second=0)  + timedelta(hours=1)
        count_sql = 0
        percent_done = 0
        while timestamp <= time_limits[1]:
            
            result = session.execute(text("SELECT S1.station_id, available_bikes, available_bike_stands, status\
                                            FROM ringringbikes.station_availability as S1\
                                            JOIN (\
                                                SELECT station_id, MAX(last_update) as last_update_max\
                                                FROM ringringbikes.station_availability as S2\
                                                WHERE last_update < '"+ str(timestamp) +"'\
                                                GROUP BY S2.station_id\
                                            ) as S3 ON S1.station_id = S3.station_id and S1.last_update = S3.last_update_max"))
            for line in result:
                try:
                    # Creating new line
                    session.add(scraperBike.Station_Availability_timestamp_table(timestamp=timestamp, station_id=int(line[0]), available_bikes=int(line[1]), available_bike_stands=int(line[2]), status=line[3]))
                    session.commit()
                except IntegrityError:
                    session.rollback()
                    errors.append("Rollback:" + str(timestamp))
            timestamp += interval

            # Print progress
            count_sql += 1
            if (count_sql*100)//count > percent_done:
                percent_done += 1
                print(str(percent_done)+"%")
                print("Errors:", len(errors))
        print("---------------------------------------------------------------")
        print("---------------------------------------------------------------")
        print("DONE")
        return errors, count
    
def main():
    scraperBike.connect_db()
    errors, count = create_min_availability()
    print(len(errors),"Errors /",count*117, "Rows")

main()