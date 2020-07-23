from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from flack import db, bcrypt

user_channel_link = db.Table('user_channel_link',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('channel_id', db.Integer, db.ForeignKey('channels.id'), primary_key=True)
)

class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    sid = db.Column(db.String())
    messages = db.relationship("Message", cascade="all, delete-orphan", backref=db.backref("user", lazy=True))
    channels = db.relationship("Channel", secondary=user_channel_link, lazy=True, 
        backref=db.backref("users", lazy=True))

    @property
    def password(self):
        raise AttributeError('password not readable')

    @password.setter
    def password(self, plaintext):
        self.password_hash = bcrypt.generate_password_hash(plaintext).decode("utf-8")

    def verify_password(self, plaintext):
        return bcrypt.check_password_hash(self.password_hash, plaintext)

    def add_message(self, msg, channel_id):
        new_msg = Message(message=msg, user_id=self.id, channel_id=channel_id)
        db.session.add(new_msg)
        db.session.commit()
        return new_msg.timestamp


class Channel(db.Model):
    __tablename__ = "channels"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    is_private = db.Column(db.Boolean, default=True, nullable=False)
    messages = db.relationship("Message", backref=db.backref("channel", lazy=True))


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=False)



