import mysql.connector
import json

def getStationsData():
    # Connect to MySQL database
    mydb = mysql.connector.connect(
        host="ring-ring-bike.cwdqwzqexfzl.eu-west-1.rds.amazonaws.com",
        user="admin",
        password="ring-ring2023",
        database="ring-ring-bike"
    )

    # Create cursor to execute SQL queries
    mycursor = mydb.cursor()

    # Execute SQL query to retrieve station data
    mycursor.execute("SELECT * FROM ringringbikes.station_coordinates")

    # Fetch all rows of data and store in stations dictionary
    stationsAttempt = {}
    for row in mycursor.fetchall():
        station_id = row[0]
        position_lat = row[1]
        position_lng = row[2]
        stationsAttempt[station_id] = {'position_lat': position_lat, 'position_lng': position_lng}

    # Close database connection
    mydb.close()

    # Convert stations list to JSON and write to file
    with open('stations-cole-attempt.json', 'w') as f:
        json.dump(stationsAttempt, f)

getStationsData()