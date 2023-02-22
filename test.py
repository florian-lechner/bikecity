import sqlalchemy as sqla
from sqlalchemy import create_engine, text
import json


URI="ring-ring-bike.cwdqwzqexfzl.eu-west-1.rds.amazonaws.com"
PASSWORD="ring-ring2023"
PORT="3306"
DB="ring-ring-bike"
USER="admin"

engine= create_engine("mysql+mysqldb://{}:{}@{}:{}".format(USER, PASSWORD, URI, PORT), echo=True)

sql = """CREATE DATABASE IF NOT EXISTS ring-ring-bike"""

with engine.begin() as connection:
    connection.execute(text(sql))
    connection.execute(text("USE ring-ring-bike"))