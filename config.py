import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # SQLite for development (easy setup, no server needed)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///event_planner.db'

    # For MySQL production, set DATABASE_URL environment variable:
    # mysql+pymysql://username:password@localhost/event_planner

    SQLALCHEMY_TRACK_MODIFICATIONS = False
