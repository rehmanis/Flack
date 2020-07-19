from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_socketio import SocketIO

# Configure the flask app
app = Flask(__name__, instance_relative_config=True)
app.config.from_object('config')
app.config.from_pyfile('config.py')

# Initialize the data base
db = SQLAlchemy(app)
# Initialize the password hashing object
bcrypt = Bcrypt(app)
# Initialize flask web socketIO
socketio = SocketIO(app)

# Configure the flask login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"
login_manager.login_message_category = "danger"

import flack.application
from flack.models import User, Message, Channel

db.create_all()
db.session.commit()


# REMOVE THIS LATER. ONLY FOR TESTING PURPOSES
# create the initial channels
# chan1 = Channel(name="general", is_private=False)
# chan2 = Channel(name="other", is_private=False)
# db.session.add(chan1)
# db.session.add(chan2)
# db.session.commit()

