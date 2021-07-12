import os
import json
from flask import Flask, render_template, jsonify

DIR = os.path.dirname(os.path.abspath(__file__))
# data_dir = os.path.join(DIR, 'sorted') # for bar data
data_dir = os.path.join(DIR, 'sorted-citations-short-per-jur') # for map data

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/')
    def hello():
        return render_template("index.html")

    @app.route('/data/<year>')
    def get_data(year):
        with open(os.path.join(data_dir, year + '.json')) as f:
            data = json.load(f)
        return jsonify(data)

    return app
