import os
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from flask_socketio import emit, send, join_room, leave_room
from datetime import datetime
from .forms import *
from .models import *
from flack import db, app, login_manager, socketio

#CHANNELS = [channel.name for channel in Channel.query.all()]
CHANNELS = []
print(f"\n\n{CHANNELS}\n\n")
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
    user_channels = [channel.name for channel in current_user.channels]
    users = [user.username for user in User.query.all()]
    print(f"\n\n{users}\n\n")

    return render_template("chat.html", users=users, channels=user_channels)

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

        for channel in Channel.query.filter_by(is_private=False):
            join_msg = "Joined" + "#" + channel.name
            new_user.add_message(msg=join_msg, channel_id=channel.id)
            new_user.channels.append(channel)
            channel.users.append(new_user)

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
    user = User.query.filter_by(username=current_user.username).first()
    selected_channel = Channel.query.filter_by(name=data["room"]).first()

    # just temporary check. Need to update this later
    if not selected_channel:
        raise "PROBLEM"

    timestamp = user.add_message(msg=data["msg"], channel_id=selected_channel.id)
    msg_time = timestamp.strftime("%#I:%#M %p")
    msg_date = timestamp.strftime("%D %B, %e")

    temp = {"username": data["username"], "msg": data["msg"], "time": msg_time, "date": msg_date}

    send({"username": data["username"], "msg": data["msg"], 
          "time": msg_time, "date": msg_date, "room": data["room"]}, room=data["room"])


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

    #print(f"\n\n {current_user.channels")

    for channel in current_user.channels:
        join_room(channel.name)

@socketio.on("add channel")
def add_channel(data):
    pass

# @app.route("/users", methods=["POST"])
# def get_users():
#     data = request.get_json()
#     channel_name = data["channel"]
#     channel = Channel.query.filter_by(name=channel_name).first()
#     users = [user.username for user in channel.users]

#     return jsonify({"users": users})




@app.route("/messages", methods=["POST"])
def get_messages():
    data = request.get_json()
    channel_name = data["channel"] 
    print()
    print(len(channel_name))
    print(f"\n\n{channel_name}\n\n");

    ### not the most efficient way to query.
    ### Need to think about different db design and possibly using db JOIN

    channel = Channel.query.filter_by(name=channel_name).first()
    print(f"\n")
    print(f'\nchannel found: {channel}\n')
    msg = [msg.message for msg in channel.messages]
    print(f"\n\n{msg}\n\n");
    # messages = Message.query.filter_by(channel_id=channel.id)
    entries = []

    for msg_obj in channel.messages:
        # username = User.query.filter_by(id=msg_obj.user_id).first().username;
        username = msg_obj.user.username;
        msg_time = msg_obj.timestamp.strftime("%#I:%#M %p")
        msg_date = msg_obj.timestamp.strftime("%A %B, %eth")
        entry = {"username": username, "time": msg_time, "date": msg_date, "msg" : msg_obj.message}
        entries.append(entry)

    users = [user.username for user in channel.users]
    print("-----------")
    print(entry["date"])
    print("----------------")

    return jsonify({"entries": entries, "users": users, "success": True})


@app.route("/chat/add_users", methods=["POST"])
def add_users():
    data = request.get_json()
    print(f"\n\n{data}\n\n")

    usernames_to_add = data["users"]
    new_channel = Channel.query.filter_by(name=data["channel"]).first()

    for username in usernames_to_add:
        print(f"\n\n username: {username} \n\n")
        # find the user with this username in the db
        user = User.query.filter_by(username=username).first()
        # add the channel to this users channel list
        user.channels.append(new_channel)
        # add this new channel to the desired channel's users list
        new_channel.users.append(user)
        join_msg = "Joined" + "#" + new_channel.name
        user.add_message(msg=join_msg, channel_id=new_channel.id)

        chl = [channel.name for channel in user.channels]
        urs = [user.username for user in new_channel.users]
        
        print(f"\nAll channels: {chl} \n")
        print(f"\nAll users: {urs} \n")

    db.session.commit()

    return jsonify({"success": True})

@app.route("/chat/create_channel", methods=["POST"])
def create_channel():
    data = request.get_json()
    channel_name = data["channel"]

    if Channel.query.filter_by(name=channel_name).first():
        return jsonify({"success": False})

    new_channel = Channel(name=channel_name)
    db.session.add(new_channel)
    current_user.channels.append(new_channel)
    new_channel.users.append(current_user)
    db.session.commit()
    
    join_msg = "Joined" + "#" + channel_name
    current_user.add_message(msg=join_msg, channel_id=new_channel.id)

    chl = [channel.name for channel in current_user.channels]
    urs = [user.username for user in new_channel.users]


    print(f"\n\n{chl}\n\n{urs}\n\n")

    CHANNELS.append(channel_name)

    return jsonify({"success": True})


@app.route("/chat/leave_channel", methods=["POST"])
def delete_channel():
    data = request.get_json()

    channel_leave = Channel.query.filter_by(name= data["channel"]).first()

    if not channel_leave:
        return jsonify({"success": False})

    urs = [user.username for user in channel_leave.users]
    print(f"before removing: {urs}\n")


    if data["isToBeDeleted"] or (channel_leave.is_private and len(channel_leave.users) == 1):
        print(f"\ndeleting......\n")
        db.session.delete(channel_leave)
        db.session.commit()
    else:
        chl = [channel.name for channel in current_user.channels]
        print(f"\n..........channels before leaving {chl}..........\n")
        channel_leave.users.remove(current_user)
        chl = [channel.name for channel in current_user.channels]
        print(f"\n..........channels after leaving {chl}..........\n")

        urs = [user.username for user in channel_leave.users]
        print(f"after leave removing: {urs}\n")

        leave_msg = "Left" + "#" + channel_leave.name
        current_user.add_message(msg=leave_msg, channel_id=channel_leave.id)
        db.session.commit()

    # add emit to send message to all client in this channel that the users has left

    return jsonify({"success": True, "channel": data["channel"] })


# @app.route("/chat/leave_channel", methods=["POST"])
# def leave_channel():
#     data = request.get_json()

#     channel_leave = Channel.query.filter_by(name= data["channel"]).first()

#     if not channel_leave:
#         return jsonify({"success": False})

#     urs = [user.username for user in channel_leave.users]
#     print(f"before removing: {urs}\n")

#     channel_leave.users.remove(current_user)

#     urs = [user.username for user in channel_leave.users]
#     print(f"after leave removing: {urs}\n")

#     leave_msg = "Left" + "#" + channel_leave.name
#     current_user.add_message(msg=leave_msg, channel_id=channel_leave.id)
#     db.session.commit()

#     # add emit to send message to all client in this channel that the users has left

#     return jsonify({"success": True, "channel": data["channel"] })


    

if __name__ == "__main__":
    socketio.run(app, debug=True)