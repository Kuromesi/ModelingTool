import os

from flask import Flask
from flask import render_template, redirect
from routes import *
import yaml

app = Flask(__name__)
app.register_blueprint(model)

@app.route('/', methods=['GET', 'POST'])
def home():
    return redirect('/model')

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

if __name__ == '__main__':
    if not os.path.exists("./projects"):
        os.mkdir("./projects")
    app.run(host="0.0.0.0", port=4000)