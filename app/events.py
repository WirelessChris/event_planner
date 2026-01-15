from datetime import datetime
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import Event

events_bp = Blueprint('events', __name__)


@events_bp.route('/calendar')
@login_required
def calendar():
    return render_template('calendar.html')


@events_bp.route('/api/events', methods=['GET'])
@login_required
def get_events():
    start = request.args.get('start')
    end = request.args.get('end')

    query = Event.query

    if start:
        start_date = datetime.fromisoformat(start.replace('Z', '')).date()
        query = query.filter(Event.date >= start_date)

    if end:
        end_date = datetime.fromisoformat(end.replace('Z', '')).date()
        query = query.filter(Event.date <= end_date)

    events = query.all()
    return jsonify([event.to_dict() for event in events])


@events_bp.route('/api/events', methods=['POST'])
@login_required
def create_event():
    data = request.get_json()

    if not data.get('title') or not data.get('date'):
        return jsonify({'error': 'Title and date are required'}), 400

    event = Event(
        title=data['title'],
        description=data.get('description', ''),
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        start_time=datetime.strptime(data['start_time'], '%H:%M').time() if data.get('start_time') else None,
        end_time=datetime.strptime(data['end_time'], '%H:%M').time() if data.get('end_time') else None,
        created_by=current_user.id
    )

    db.session.add(event)
    db.session.commit()

    return jsonify(event.to_dict()), 201


@events_bp.route('/api/events/<int:event_id>', methods=['GET'])
@login_required
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify({
        'id': event.id,
        'title': event.title,
        'description': event.description or '',
        'date': event.date.isoformat(),
        'start_time': event.start_time.strftime('%H:%M') if event.start_time else '',
        'end_time': event.end_time.strftime('%H:%M') if event.end_time else ''
    })


@events_bp.route('/api/events/<int:event_id>', methods=['PUT'])
@login_required
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.get_json()

    if not data.get('title') or not data.get('date'):
        return jsonify({'error': 'Title and date are required'}), 400

    event.title = data['title']
    event.description = data.get('description', '')
    event.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    event.start_time = datetime.strptime(data['start_time'], '%H:%M').time() if data.get('start_time') else None
    event.end_time = datetime.strptime(data['end_time'], '%H:%M').time() if data.get('end_time') else None

    db.session.commit()

    return jsonify(event.to_dict())


@events_bp.route('/api/events/<int:event_id>', methods=['DELETE'])
@login_required
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()

    return jsonify({'message': 'Event deleted successfully'})
