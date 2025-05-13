import React, { useState } from 'react';
import './CSS/calendar.css';
import './CSS/month_view.css';
import './CSS/day_view.css';
import './CSS/meeting_window.css';
import MeetingsList from '../assets/meetings_data';
import {DayView, MonthView} from './day_month_Calendar';
import { CreateMeetingModal } from './event_handlers';

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
    setMeetings((prevMeetings) => {
      const exists = prevMeetings.some(m => m.id === newMeeting.id);
      if (exists) {
        return prevMeetings.map(m =>
          m.id === newMeeting.id ? newMeeting : m
        );
      } else {
        return [...prevMeetings, newMeeting];
      }
    });
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
              onSaveMeeting={handleCreateMeeting}
            />
          )}
        </div>
      </div>
      {showCreateModal && (
        <CreateMeetingModal 
          onClose={closeCreateModal}
          onSave={handleCreateMeeting}
          selectedDate={selectedDate}
          startTime="09:00"
          endTime="10:00"
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

export default CalendarApp;