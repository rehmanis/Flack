from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, EqualTo


class RegistrationForm(FlaskForm):
    """ Registration Form """
    
    username = StringField("username_label", 
        validators=[InputRequired(message="Username is required"),
        Length(min=3, max=25, message="username must be between 6 and 25 characters")])

    password = PasswordField("password_label",
        validators=[InputRequired(message="Password is required"),
        Length(min=6, max=25, message="Password must be between 6 and 25 characters")])

    password_confirm = PasswordField("password_confirm_label",
        validators=[InputRequired(message="Password is required"),
        Length(min=6, max=25, message="Password must be between 6 and 25 characters"), 
        EqualTo("password", message="passwords must match")])

    submit_button = SubmitField("Register")