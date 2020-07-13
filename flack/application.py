import os
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from flask_socketio import emit, send, join_room, leave_room
from datetime import datetime
from .forms import *
from .models import *
from flack import db, app, login_manager, socketio

CHANNELS = ["general", "other"]
ONLINE_USERS = []
# USERS = [user.username for user in User.query.all()]
USERS = []
USERS_SID = {} # user as key and session id as value. This is used to send private message

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

        for channel in Channel.query.all():
            join_msg = "Joined" + "#" + channel.name
            new_user.add_message(msg=join_msg, channel_id=channel.id)

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
    user = User.query.filter_by(username=current_user.username).first()
    selected_channel = Channel.query.filter_by(name=data["room"]).first()

    # just temporary check. Need to update this later
    if not selected_channel:
        raise "PROBLEM"

    timestamp = user.add_message(msg=data["msg"], channel_id=selected_channel.id)
    msg_time = timestamp.strftime("%#I:%#M %p")
    msg_date = timestamp.strftime("%D %B, %e")

    temp = {"username": data["username"], "msg": data["msg"], "time": msg_time, "date": msg_date}
    print(f"\n{temp}\n")
    print(data["room"])
    print()

    send({"username": data["username"], "msg": data["msg"], "time": msg_time, "date": msg_date}, room=data["room"])


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    msg_time = datetime.now().strftime("%#I:%#M %p")
    msg_date = datetime.now().strftime("%D %B, %e")
    join_room(room)
    send({"msg": "joined #" + room, "username": username, "time": msg_time, "date": msg_date}, room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send({"msg": username + " has left the room, " + room }, room=room)

@socketio.on("client connected")
def on_connect(data):
    current_user.sid = request.sid;
    db.session.commit()

    for room in CHANNELS:
        join_room(room)

@socketio.on("add channel")
def add_channel(data):
    pass

@app.route("/messages", methods=["POST"])
def get_messages():
    channel_name = request.form.get("channel") 
    print(channel_name)

    ### not the most efficient way to query.
    ### Need to think about different db design and possibly using db JOIN

    channel = Channel.query.filter_by(name=channel_name).first()
    messages = Message.query.filter_by(channel_id=channel.id)

    data = []

    for msg_obj in messages:
        username = User.query.filter_by(id=msg_obj.user_id).first().username;
        msg_time = msg_obj.timestamp.strftime("%#I:%#M %p")
        msg_date = msg_obj.timestamp.strftime("%D %B, %e")
        entry = {"username": username, "time": msg_time, "date": msg_date, "msg" : msg_obj.message}
        data.append(entry)

    print(f"\n{data}\n")

    return jsonify({"entries": data})

if __name__ == "__main__":
    socketio.run(app, debug=True)