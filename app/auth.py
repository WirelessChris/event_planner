from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('events.calendar'))

    # Check if any admin exists
    admin_exists = User.query.filter_by(is_admin=True).first() is not None

    if not admin_exists:
        return redirect(url_for('auth.register'))

    return redirect(url_for('auth.login'))


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    # Only allow registration if no admin exists
    admin_exists = User.query.filter_by(is_admin=True).first() is not None

    if admin_exists:
        flash('Administrator already registered. Please login.', 'info')
        return redirect(url_for('auth.login'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        if not username or not password:
            flash('Username and password are required.', 'error')
            return render_template('register.html')

        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('register.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('register.html')

        user = User(username=username, is_admin=True)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        flash('Administrator account created successfully! Please login.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('register.html')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('events.calendar'))

    # Check if any admin exists, redirect to register if not
    admin_exists = User.query.filter_by(is_admin=True).first() is not None

    if not admin_exists:
        return redirect(url_for('auth.register'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('events.calendar'))

        flash('Invalid username or password.', 'error')

    return render_template('login.html')


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))
