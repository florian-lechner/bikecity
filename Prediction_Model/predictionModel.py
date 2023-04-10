# Import the required packages
# Import package pandas for data analysis
import pandas as pd

# Import package numpy for numeric computing
import numpy as np

# Import package matplotlib for visualisation/plotting
import matplotlib.pyplot as plt

# Imports for random forest regression
import seaborn as sns
from sklearn.model_selection import RandomizedSearchCV
from sklearn.model_selection import train_test_split
from sklearn import metrics
from sklearn.ensemble import RandomForestRegressor

prediction_models = {}

def createPrediction():
    # Reading from a csv file, into a data frame
    df = pd.read_csv("cleaned_clean_db.csv", keep_default_na=True, dtype={16: str}, delimiter=',', skipinitialspace=True, encoding='Windows-1252')

    stations_unique = sorted(df["station_id"].unique())

    for station in stations_unique[:5]:
            df_station = df.loc[df["station_id"] == station]
            max_stands = df.loc[df["station_id"] == station]["max_stands"].max()
            X = df_station.drop(['station_id', 'available_bikes', 'available_bike_stands', 'availabilty_ratio', 'max_stands'],axis=1)
            y = df_station['availabilty_ratio']

            X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=0.7, random_state=42)
            
            regr = RandomForestRegressor(n_estimators = 100, random_state = 42)
            regr.fit(X_train, y_train)

            prediction_models[station] = [regr.predict, max_stands]

def get_available_bike_prediction(station_id, date, temperature, pressure, humidity, clouds, precipitation_value, precipitation_probability):
   """ date as string: '2023-05-02 23:59:59' """
   # time conversion:
   # hours * 12 + minutes//5 * 1
   time = int(date[11:13]) * 12 + int(date[14:16])//5
   # day conversion:
   d = pd.Timestamp(date[:10])
   day = d.dayofweek

   input_value = np.array([[temperature, pressure, humidity, clouds, precipitation_value, precipitation_probability, time, day]])
   pred = int(prediction_models[1][0](input_value))
   pred_bikes = pred * prediction_models[1][1]
   pred_stations = prediction_models[1][1]-pred_bikes
   return pred_bikes, pred_stations