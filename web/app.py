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
    
@app.route("/getBikePrediction/<int:id>/<string:hours>/<string:date>", methods= ['GET'])
def get_bike_prediction(id, hours, date):
    try:
        dbConnection.main()
        if (hours > 0):
            live_weather = dbConnection.get_forecast_weather(hours)
            bikes, stands = get_available_bike_prediction(id, date, live_weather['forecast_temp'], live_weather['pressure'], live_weather['humidity'], live_weather['clouds'], live_weather['precipitation_value'], live_weather['precipitation_probability'])
            availability = {'bikes':bikes, 'stands':stands}
        else:
            live_data = dbConnection.get_station_live_data(id)
            availability = {'bikes': live_data['available_bikes'], 'stands': live_data['available_stands']}
        return jsonify(availability)
    except:
        availability = {'bikes': 0, 'stands': 0}
        return jsonify(availability)
    
