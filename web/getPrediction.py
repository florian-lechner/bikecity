# Import package pandas for data analysis
import pandas as pd

# Import package numpy for numeric computing
import numpy as np

import pickle

with open('../Prediction_Model/prediction_models.pkl', 'rb') as file:
    prediction_models = pickle.load(file)

def get_available_bike_prediction(station_id, date, temperature, pressure, humidity, clouds, precipitation_value, precipitation_probability):
    """ date as string: '2023-05-02 23:59:59' """
    # time conversion:

    # hours * 12 + minutes//5 * 1
    time = int(date[11:13]) * 12 + int(date[14:16])//5
    # day conversion:
    d = pd.Timestamp(date[:10])
    day = d.dayofweek

    input_value = np.array([[temperature, pressure, humidity, clouds, precipitation_value, precipitation_probability, time, day]])
    pred = int(prediction_models[station_id][0](input_value))
    pred_bikes = pred * prediction_models[station_id][1]
    pred_stations = prediction_models[station_id][1]-pred_bikes
    return pred_bikes, pred_stations
