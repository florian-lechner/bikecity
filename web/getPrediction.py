# Import package pandas for data analysis
import pandas as pd

# Import package numpy for numeric computing
import numpy as np

import pickle
from joblib import load

with open('../Prediction_Model/predictionModels.pkl', 'rb') as file:
    prediction_models = pickle.load(file)

#prediction_models = load('../Prediction_Model/predictionModels.joblib')

def get_available_bike_prediction(station_id, date, temperature, pressure, humidity, clouds, precipitation_value, precipitation_probability):
    """ date as string: '02-05-2023, 23:59' """
    # time conversion:

    # hours * 12 + minutes//5 * 1
    time = int(date[11:13]) * 12 + int(date[14:16])//5
    # day conversion:
    d = pd.to_datetime(date[:10], format="%d-%m-%Y")
    day = d.dayofweek

    input_value = np.array([[temperature, pressure, humidity, clouds, precipitation_value, precipitation_probability, time, day]])
    input_df = pd.DataFrame(input_value, columns=['temperature', 'pressure', 'humidity', 'clouds', 'precipitation_value', 'precipitation_probability', 'time', 'day'])
    
    pred = float(prediction_models[station_id][0](input_df))
    pred_bike_chance = round(float(prediction_models[station_id][2](input_df)) * 99)
    pred_stand_chance = round(float(prediction_models[station_id][3](input_df)) * 99)


    pred_bikes = round(pred * prediction_models[station_id][1])
    pred_stations = prediction_models[station_id][1]-pred_bikes

    return pred_bikes, pred_stations, pred_bike_chance, pred_stand_chance
