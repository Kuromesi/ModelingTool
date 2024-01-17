import os

from flask import Flask
from flask import render_template, redirect
from routes import *
import yaml
import logging
from flask.logging import default_handler

app = Flask(__name__)
app.register_blueprint(model)
@app.route('/', methods=['GET', 'POST'])
def home():
    return redirect('/model')

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

def set_logger(app: Flask):
    app.logger.removeHandler(default_handler)

    file_handler = logging.FileHandler("./logs/flask.log")
    stream_handler = logging.StreamHandler()
    formatter = logging.Formatter(
            '%(asctime)s [%(thread)d:%(threadName)s] [%(filename)s:%(module)s:%(funcName)s] '
            '[%(levelname)s]: %(message)s'
        )

    file_handler.setLevel(logging.DEBUG)
    stream_handler.setLevel(logging.DEBUG)
    
    file_handler.setFormatter(formatter)
    stream_handler.setFormatter(formatter)
    app.logger.addHandler(file_handler)
    app.logger.addHandler(stream_handler)
    app.logger.setLevel(logging.DEBUG)

def run_app():
    if not os.path.exists("./projects"):
        os.mkdir("./projects")
    if not os.path.exists("./logs"):
        os.mkdir("./logs")

    set_logger(app)
    app.run(host="0.0.0.0", port=4000)

if __name__ == '__main__':
    run_app()

