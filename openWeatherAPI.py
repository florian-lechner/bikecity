import sqlalchemy as sqla
from sqlalchemy import create_engine, text
import json
import requests
import urllib.request
import traceback
import glob
import os
from pprint import pprint
import time
from IPython.display import display
import datetime

APIKEY = "OPENWEATHER_KEY"

# Dublin coordinates
latitude = 53.350140
longitude = -6.266155

# Construct the API URL with the city and country code
url = f'https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={APIKEY}'

# Create an empty dictionary to store the data
weather_dict = {}

# Send a GET request to the API and parse the JSON response
response = urllib.request.urlopen(url)
data = response.read().decode('UTF-8')
new_data = json.loads(data)
#mainTemp = data[3].main.temp


# Save the JSON dictionary data to a file
with open('weather_data.json', 'w') as outfile:
    json.dump(weather_dict, outfile)






#URI="ring-ring-bike.cwdqwzqexfzl.eu-west-1.rds.amazonaws.com"
#PASSWORD="ring-ring2023"
#PORT="3306"
#DB="ring-ring-bike"
#USER="admin"


#engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)
###sql = """CREATE DATABASE IF NOT EXISTS ring-ring-bike"""

#with engine.begin() as connection:
#    connection.execute(text(sql))
#    connection.execute(text("USE ring-ring-bike"))

