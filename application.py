import os
import requests
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from form import *
from models import *

app = Flask(__name__)
app.secret_key = "replace_later"

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = "postgres://tiljyipwqoxvsk:1f21faf5c09e2db96d620a26ec45b353ed4ed1e2b334e23b70272118b1396264@ec2-52-72-221-20.compute-1.amazonaws.com:5432/d6q05nuc03l818"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


@app.route("/", methods=["Get", "Post"])
def index():
    
    reg_form = RegistrationForm()

    if reg_form.validate_on_submit():

        # get the inputted fields from the form
        username = reg_form.username.data
        password = reg_form.password.data

        # check if username is unique
        user = User.query.filter_by(username=username).first()

        if user:
            return "username already in use"

        # add the user to the db
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        return "new user added to DB"
    
    return render_template("index.html", form=reg_form)


if __name__ == "__main__":
    app.run(debug=True)