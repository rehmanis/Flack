import os
from flask import Flask, render_template, redirect, url_for
from forms import *
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

        # add the user to the db
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for("login"))
    
    return render_template("index.html", form=reg_form)


@app.route("/login", methods=["Get", "Post"])
def login():

    login_form = LogInForm()

    if login_form.validate_on_submit():
        return "You have logged in"

    return render_template("login.html", form=login_form)


if __name__ == "__main__":
    app.run(debug=True)