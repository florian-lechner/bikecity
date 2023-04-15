import mimetypes
mimetypes.add_type('application/javascript', '.js', strict=True)

from flask import Flask, render_template, jsonify
import requests
import json
import dbConnection
from groupConfig import *
from personalConfig import *
from getPrediction import get_available_bike_prediction


app = Flask(__name__, template_folder='templates', static_folder='static')


@app.route("/")
def hello_world():
    return render_template('bikes.html', GOOGLEAPI_KEY = GOOGLEAPI_KEY)


@app.route("/getStations", methods= ['GET'])
def get_stations():
    try:
        print("Attempting to get stations from database...")
        dbConnection.main()
        stations = dbConnection.get_stations()
        
    except Exception as e:
        print("Database connection failed. Getting stations from JCDecaux API")
        print(repr(e))
        stations = []
        result = requests.get(JC_URL, params={"contract":JC_CONTRACT, "apiKey": JC_KEY})  
        result = json.loads(result.text)
        for line in result:
            station = {'id': int(line.get("number")), 'name': line.get("address"), 'position_lat': float(line.get("position").get("lat")), 'position_lng': float(line.get("position").get("lng")), 'bikes': int(line.get("available_bikes")), 'bike_stands': int(line.get("available_bike_stands"))}
            stations.append(station)           
    
    return jsonify(stations)


@app.route("/getLiveBikeData/<int:id>", methods= ['GET'])
def get_station_live_data(id):
    try:
        dbConnection.main()
        live_data = dbConnection.get_station_live_data(id)
        return jsonify(live_data)
    except:
        return jsonify({'error': "No data found for station " + str(id)})
    
@app.route("/getStationHistoricalData/<int:id>", methods = ['GET'])
def get_station_historical_data(id):
    try:
        dbConnection.main()
        historical_data = dbConnection.get_station_historical_data(id)
        return jsonify(historical_data)
    except Exception as e:
        print(e)
        return jsonify({'error': "No data found for station " + str(id)})


@app.route("/getLiveWeather", methods= ['GET'])
def get_live_weather():
    try:
        dbConnection.main()
        live_weather = dbConnection.get_live_weather()
        return jsonify(live_weather)
    except:
        return jsonify({'error': "No data found for current weather"})
    
@app.route("/getForecastWeather/<string:hours>", methods= ['GET'])
def get_forecast_weather(hours):
    try:
        dbConnection.main()
        live_weather = dbConnection.get_forecast_weather(hours)
        return jsonify(live_weather)
    except:
        return jsonify({'error': "No data found for future weather for hour " + hours})
    

@app.route("/getTimelineAvailability", methods= ['GET'])
def get_timeline_availability():
    try:
        dbConnection.main()
        timeline_availability = dbConnection.get_timeline_availability()
        return jsonify(timeline_availability)
    except Exception as e:
        return jsonify({'error': e})

    
@app.route("/getBikePrediction/<int:id>/<string:hours>/<string:date>/<int:temperature>/<string:pressure>/<string:humidity>/<string:clouds>/<string:precipitation_value>/<string:precipitation_probability>", methods= ['GET'])
def get_bike_prediction(id, hours, date, temperature, pressure, humidity, clouds, precipitation_value, precipitation_probability):
    hours = int(hours)
    pressure = float(pressure)
    humidity = float(humidity)
    clouds = float(clouds)
    precipitation_value = float(precipitation_value)
    precipitation_probability = float(precipitation_probability)

    # Station closed
    time = int(date[11:13]) * 12 + int(date[14:16])//5
    if (6 < time < 60):
        availability = {'bikes': 0, 'stands': 0, 'chance_bike': 0, 'chance_stand': 0}
        return jsonify(availability)
    else:
        try:
            bikes, stands, chance_bike, chance_stand = get_available_bike_prediction(id, date, temperature, pressure, humidity, clouds, precipitation_value, precipitation_probability)
            availability = {'bikes':bikes, 'stands':stands, 'chance_bike':chance_bike, 'chance_stand':chance_stand}
            return jsonify(availability)
        except Exception as e:
            print(f"An error occurred: {e}")
            availability = {'bikes': 0, 'stands': 0, 'chance_bike': 0, 'chance_stand': 0}
            return jsonify(availability)
        
