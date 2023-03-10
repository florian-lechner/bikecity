from flask import Flask, render_template, jsonify
import requests
import json
import dbConnection
from groupConfig import *
from personalConfig import *

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route("/")
def hello_world():
    return render_template('bikes.html', GOOGLEAPI_KEY = GOOGLEAPI_KEY)

@app.route("/getStations", methods= ['GET'])
def get_station_coordinates():
    try:
        dbConnection.main()
        stations = dbConnection.get_stations()
    except:
        stations = []
        result = requests.get(JC_URL, params={"contract":JC_CONTRACT, "apiKey": JC_KEY})  
        result = json.loads(result.text)
        for line in result:
            station = {'id': int(line.get("number")), 'name': line.get("address"), 'position_lat': float(line.get("position").get("lat")), 'position_lng': float(line.get("position").get("lng"))}
            stations.append(station)           
    return jsonify(stations)

@app.route("/getLiveData/<int:id>", methods= ['GET'])
def get_station_live_data(id):
    try:
        dbConnection.main()
        live_data = dbConnection.get_station_live_data(id)
        return jsonify(live_data)
    except:
        return jsonify({'error': "No data found for station " + str(id)})

#####
#Mandatory comment
#@app.route("/getLiveWeather", methods= ['GET'])
#def get_live_weather():
#    try:
#        dbConnection.main()
#        live_weather = dbConnection.get_live_weather()
#        return live_weather
#    except:
#        return {'error': "No data found for weather"}
#####

# To get this to do anything, type the following in the terminal (from the appropriate directory), which should launch a local server
# flask run