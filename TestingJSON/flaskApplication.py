from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return '''<p>Hello, World!</p>'''

# To get this to do anything, type the following in the terminal (from the appropriate directory), which should launch a local server
# python -m flask --app flaskApplication run