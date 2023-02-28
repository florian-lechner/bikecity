from flask import Flask, render_template
import requests
import json

app = Flask(__name__, template_folder='templates', static_folder='static')

stations = requests.get('https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=JC_KEY')
station_objs = json.loads(stations.text)

@app.route("/")
def hello_world():
    return render_template('bikes.html', stations=station_objs)

# To get this to do anything, type the following in the terminal (from the appropriate directory), which should launch a local server
# python -m flask --app flaskApplication run