import React, { useState } from 'react';
import './CSS/calendar.css';
import './CSS/month_view.css';
import './CSS/day_view.css';
import './CSS/meeting_window.css';
import MeetingsList from '../assets/meetings_data';
import {DayView, MonthView} from './day_month_Calendar';

function CalendarApp() {
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setView('day');
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateMeeting = (newMeeting) => {
    const newId = meetings.length > 0
      ? Math.max(...meetings.map(m => m.id)) + 1
      : 1;
    const updatedMeetings = [...meetings, { id: newId, ...newMeeting }]
      .sort((a, b) => a.id - b.id);
    setMeetings(updatedMeetings);
    closeCreateModal();
  };

  return (
    <div className="calendar-app">
      <MeetingsList setGlobalMeetings={setMeetings} />
      <div className="main-content">
        <Header 
          view={view} 
          selectedDate={selectedDate} 
          setView={setView} 
          setSelectedDate={setSelectedDate}
          openCreateModal={openCreateModal}
        />

        <div className="calendar-container">
          {view === 'month' ? (
            <MonthView 
              selectedDate={selectedDate} 
              onDateClick={handleDateClick} 
              meetings={meetings}
            />
          ) : (
            <DayView 
              selectedDate={selectedDate} 
              meetings={meetings} 
            />
          )}
        </div>
      </div>
      {showCreateModal && (
        <CreateMeetingModal 
          onClose={closeCreateModal}
          onSave={handleCreateMeeting}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

// Header Component
function Header({ view, selectedDate, setView, setSelectedDate, openCreateModal }) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  const goToPrevious = () => {
    if (view === 'month') {
      const prevMonth = new Date(selectedDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setSelectedDate(prevMonth);
    } else {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDate(prevDay);
    }
  };
  
  const goToNext = () => {
    if (view === 'month') {
      const nextMonth = new Date(selectedDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setSelectedDate(nextMonth);
    } else {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay);
    }
  };
  
  const getHeaderTitle = () => {
    if (view === 'month') {
      return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    } else {
      return `${dayNames[selectedDate.getDay()]}, ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
    }
  };
  
  return (
    <div className="cal_header">
      <button onClick={goToToday} className="header-button"> Today</button>
      <div className="cal_header-left">
        <button onClick={goToPrevious} className="nav-button"> &lt;</button>
        <h2 className="cal_header-title">{getHeaderTitle()}</h2>
        <button onClick={goToNext} className="nav-button"> &gt;</button>
      </div>
      <div className="cal_header-right">
      <select value={view} onChange={(e) => setView(e.target.value)} className="header-button">
        <option value="month">Month Calendar</option>
        <option value="day">Day Calendar</option>
      </select>
        <button onClick={openCreateModal} className="create-button">+ Create</button>
      </div>
    </div>
  );
}

function CreateMeetingModal ({ onClose, onSave, selectedDate }) {
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: selectedDate,
    startTime: '09:00',
    endTime: '10:00',
    color: 'blue',
    description: '',
    attendees: []
  });
  
  const [attendeeInput, setAttendeeInput] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeetingData({
      ...meetingData,
      [name]: value
    });
  };
  
  const handleAddAttendee = () => {
    if (attendeeInput.trim() !== '') {
      setMeetingData({
        ...meetingData,
        attendees: [...meetingData.attendees, attendeeInput.trim()]
      });
      setAttendeeInput('');
    }
  };
  
  const handleRemoveAttendee = (index) => {
    const updatedAttendees = [...meetingData.attendees];
    updatedAttendees.splice(index, 1);
    setMeetingData({
      ...meetingData,
      attendees: updatedAttendees
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(meetingData);
  };
  
  const colorOptions = [
    { id: 'blue', label: 'Blue' },
    { id: 'green', label: 'Green' },
    { id: 'purple', label: 'Purple' },
    { id: 'red', label: 'Red' },
    { id: 'orange', label: 'Orange' }
  ];
  
  return (
    <div className="modal-overlay">
      <div className = "modal">
      <div className="modal-header">
        <h2>Create Meeting</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="form-group" >
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter Subject"
              value={meetingData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={meetingData.date.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setMeetingData({
                    ...meetingData,
                    date: newDate
                  });
                }}
                required
              />
            </div>
            <div className="fgroup">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={meetingData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={meetingData.endTime}
                onChange={handleChange}
                required
              />
            </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Color</label>
            <div className="color-options">
              {colorOptions.map((color) => (
                <div
                  key={color.id}
                  className={`color-option ${color.id} ${meetingData.color === color.id ? 'selected' : ''}`}
                  onClick={() => setMeetingData({ ...meetingData, color: color.id })}
                >
                  {meetingData.color === color.id && <span>✓</span>}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Enter Descriptiont"
              value={meetingData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Attendees</label>
            <div className="attendee-input">
              <input
                type="text"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                placeholder="Enter attendee name"
              />
              <button
                type="button"
                onClick={handleAddAttendee}
              >
                Add
              </button>
            </div>
            
            <div className="attendee-list">
              {meetingData.attendees.map((attendee, index) => (
                <div key={index} className="attendee-item">
                  <span>{attendee}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttendee(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div> </div>
    </div>
  );
}

export default CalendarApp;