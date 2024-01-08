import sys, os
from flask import Flask
from flask import request, render_template
from flask_login import current_user
from routes import *

app = Flask(__name__)


app.register_blueprint(model)

@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template("home.html")

# @app.errorhandler(404)
# def page_not_found(e):
#     return render_template("404.html"), 404

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=4000)