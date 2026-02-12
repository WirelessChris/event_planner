import { useState, useEffect, FormEvent } from 'react';
import { eventsApi, EventDetail, CreateEventData } from '../services/api';

interface EventModalProps {
  eventId: number | null;
  selectedDate: string | null;
  onClose: () => void;
  onSave: () => void;
}

function EventModal({ eventId, selectedDate, onClose, onSave }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = eventId !== null;

  useEffect(() => {
    if (eventId) {
      loadEvent();
    } else if (selectedDate) {
      setDate(selectedDate);
    }
  }, [eventId, selectedDate]);

  const loadEvent = async () => {
    if (!eventId) return;

    try {
      const response = await eventsApi.getOne(eventId);
      const event: EventDetail = response.data;
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(event.date);
      setStartTime(event.start_time || '');
      setEndTime(event.end_time || '');
    } catch {
      setError('Failed to load event');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const eventData: CreateEventData = {
      title,
      description: description || undefined,
      date,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
    };

    try {
      if (isEditing && eventId) {
        await eventsApi.update(eventId, eventData);
      } else {
        await eventsApi.create(eventData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId || !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setLoading(true);
    try {
      await eventsApi.delete(eventId);
      onSave();
    } catch {
      setError('Failed to delete event');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isEditing ? 'Edit Event' : 'Create Event'}</h3>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            {isEditing && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
