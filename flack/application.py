import os
from flask import Flask, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from flask_socketio import emit, send, join_room, leave_room
from datetime import datetime
from .forms import *
from .models import *
from flack import db, app, login_manager, socketio

CHANNELS = ["general", "other"]

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/", methods=["Get"])
@login_required
def index():
    return render_template("index.html")

@app.route("/register", methods=["Get", "Post"])
def register():
    
    reg_form = RegistrationForm()

    if reg_form.validate_on_submit():
        # get the inputted fields from the form
        username = reg_form.username.data
        password = reg_form.password.data

        # add the user to the db
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        flash("Registered successfully! Please Log In", "success")
        return redirect(url_for("login"))
    
    return render_template("register.html", form=reg_form)


@app.route("/login", methods=["Get", "Post"])
def login():

    login_form = LogInForm()

    if login_form.validate_on_submit():
        user = User.query.filter_by(username=login_form.username.data).first()
        login_user(user)
        flash("Successfully Logged in", "success")
        return redirect(url_for("index"))

    return render_template("login.html", form=login_form)

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Successfully logged out", "success")
    return redirect(url_for("login"))


@socketio.on("message")
def message(data):
    msg_time = datetime.now().strftime("%d %B, %Y %H:%M:%S")
    send({"username": data["username"], "msg": data["msg"], "time": msg_time}, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)