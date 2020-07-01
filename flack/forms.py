from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, EqualTo, ValidationError
from .models import User

def validate_credentials(form, field):
    """ Check if username and password match the DB """

    query = User.query.filter_by(username=form.username.data).first()

    if (query is None or query.password != field.data):
        raise ValidationError("Invalid username or password")

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

    def validate_username(self, field):
        if User.query.filter_by(username=field.data).first():
            raise ValidationError(f"Username '{field.data}' is already in use. Please chose another")


class LogInForm(FlaskForm):

    username = StringField("username_label", 
        validators=[InputRequired(message="Username is required")])

    password = PasswordField("password_label", validators=[InputRequired(message="Password is required"),
        validate_credentials])

    submit_button = SubmitField("Log In")




