import os
from flask import Flask, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from flask_socketio import emit, send, join_room, leave_room
from datetime import datetime
from .forms import *
from .models import *
from flack import db, app, login_manager, socketio

CHANNELS = ["welcome", "other"]
ONLINE_USERS = []
USERS =[user.username for user in User.query.all()]

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/chat", methods=["Get"])
@login_required
def chat():
    return render_template("chat.html", users=USERS, channels=CHANNELS)

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
        USERS.append(new_user.username)
        flash("Registered successfully! Please Log In", "success")
        return redirect(url_for("login"))
    
    return render_template("index.html", form=reg_form)


@app.route("/login", methods=["Get", "Post"])
def login():

    login_form = LogInForm()

    if login_form.validate_on_submit():
        user = User.query.filter_by(username=login_form.username.data).first()
        login_user(user)
        flash("Successfully Logged in", "success")
        return redirect(url_for("chat"))

    return render_template("login.html", form=login_form)

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Successfully logged out", "success")
    return redirect(url_for("login"))


@socketio.on("message")
def message(data):
    #print(f"\n\n {data} \n\n")
    msg_time = datetime.now().strftime("%d %B, %Y %H:%M:%S")
    send({"username": data["username"], "msg": data["msg"], "time": msg_time}, room=data["room"])

@socketio.on("user online")
def user_connected(data):
    ONLINE_USERS.append(data["username"])


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    send({"msg": username + " has entered the room, " + room }, room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send({"msg": username + " has left the room, " + room }, room=room)


if __name__ == "__main__":
    socketio.run(app, debug=True)