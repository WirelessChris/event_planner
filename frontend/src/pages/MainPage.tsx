import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsApi, Event } from '../services/api';

function MainPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [volunteerModal, setVolunteerModal] = useState<number | null>(null);
  const [volunteerName, setVolunteerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, logout, checkAdminExists, adminExists } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
    checkAdminExists();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsApi.getAll();
      setEvents(response.data);
    } catch {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerModal || !volunteerName.trim()) return;

    setSubmitting(true);
    try {
      const response = await eventsApi.addVolunteer(volunteerModal, volunteerName.trim());
      setEvents(events.map(ev => ev.id === volunteerModal ? response.data : ev));
      setVolunteerModal(null);
      setVolunteerName('');
    } catch {
      setError('Failed to add volunteer');
    } finally {
      setSubmitting(false);
    }
  };

  const openVolunteerModal = (eventId: number) => {
    setVolunteerModal(eventId);
    setVolunteerName('');
  };

  return (
    <>
      <header>
        <div className="container">
          <h1>Event Planner</h1>
          <nav>
            {isAuthenticated ? (
              <>
                <Link to="/calendar" className="btn btn-primary">
                  Calendar
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : adminExists === false ? (
              <Link to="/register" className="btn btn-primary">
                Setup Admin
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="container">
        <h2 style={{ marginBottom: '20px' }}>Upcoming Events</h2>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <div className="card">
            <p>No events scheduled yet.</p>
          </div>
        ) : (
          <div className="event-list">
            {events.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-info">
                  <h3>{event.title}</h3>
                  {event.description && <p>{event.description}</p>}
                  <div className="volunteer-section">
                    <span className="volunteer-count">
                      {event.volunteers?.length || 0} volunteer{event.volunteers?.length !== 1 ? 's' : ''}
                    </span>
                    {event.volunteers?.length > 0 && (
                      <span className="volunteer-names">
                        : {event.volunteers.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="event-actions">
                  <div className="event-date">
                    <div>{formatDate(event.start)}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                  </div>
                  <button
                    className="btn btn-volunteer"
                    onClick={() => openVolunteerModal(event.id)}
                  >
                    Volunteer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {volunteerModal && (
        <div className="modal-overlay" onClick={() => setVolunteerModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Volunteer for Event</h3>
            <form onSubmit={handleVolunteer}>
              <div className="form-group">
                <label htmlFor="volunteerName">Your Name</label>
                <input
                  type="text"
                  id="volunteerName"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  minLength={2}
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setVolunteerModal(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !volunteerName.trim()}
                >
                  {submitting ? 'Adding...' : 'Add Me'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MainPage;
