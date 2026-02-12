import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { useAuth } from '../context/AuthContext';
import { eventsApi } from '../services/api';
import EventModal from '../components/EventModal';

function CalendarPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchEvents = async (
    fetchInfo: { startStr: string; endStr: string },
    successCallback: (events: EventInput[]) => void,
    failureCallback: (error: Error) => void
  ) => {
    try {
      const response = await eventsApi.getAll(fetchInfo.startStr, fetchInfo.endStr);
      successCallback(response.data);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEventId(null);
    setSelectedDate(selectInfo.startStr.split('T')[0]);
    setShowModal(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEventId(Number(clickInfo.event.id));
    setSelectedDate(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEventId(null);
    setSelectedDate(null);
  };

  const handleModalSave = () => {
    setShowModal(false);
    setSelectedEventId(null);
    setSelectedDate(null);
    calendarRef.current?.getApi().refetchEvents();
  };

  return (
    <div className="calendar-page">
      <header>
        <div className="container">
          <h1>Event Calendar</h1>
          <nav>
            <Link to="/" className="btn btn-secondary">
              Home
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={fetchEvents}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="auto"
          />
        </div>
      </div>

      {showModal && (
        <EventModal
          eventId={selectedEventId}
          selectedDate={selectedDate}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}

export default CalendarPage;
