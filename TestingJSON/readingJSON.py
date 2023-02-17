import pandas as pd

import json, os
import requests

def printJSON(requestResult):
    result = json.loads(requestResult.text)

    if (type(result) is list):
        print("Good job type checking :)")
        for r in result:
            print(r)

    elif (type(result) is dict):
        print("Good job type checking :)")
        for k, v in result.items():
            print("\n"+ k)
            print(v)

    else:
        print("Something is wrong with your type checking :)")



realTime = requests.get('https://api.jcdecaux.com/vls/v1/stations/41?contract=Dublin&apiKey=JC_KEY')
stations = requests.get('https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=JC_KEY')


realTimeDictionary = json.loads(realTime.text)

realTimeDataFrame = pd.DataFrame.from_dict(realTimeDictionary)

print(realTimeDataFrame.to_string)