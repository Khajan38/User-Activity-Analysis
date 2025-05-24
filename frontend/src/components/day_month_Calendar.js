/* CALENDAR COMPONENTS */
import React, { useState } from 'react';
import { ContextMenu, CreateMeetingModal } from "./event_handlers";

export function MonthView({ selectedDate, onDateClick, meetings }) {
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const getMeetingsForDay = (date) => {
    return meetings.filter(
      (meeting) =>
        meeting.date.getDate() === date.getDate() &&
        meeting.date.getMonth() === date.getMonth() &&
        meeting.date.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="month-view">
      <div className="day-headers">
        {dayNames.map((day, index) => (
          <div key={index} className="day-name">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-cell ${day && isToday(day) ? "today" : ""}`}
          >
            {day && (
              <div className="day-content" onClick={() => onDateClick(day)}>
                <div className="day-number">
                  <span className={isToday(day) ? "today-number" : ""}>
                    {day.getDate()}
                  </span>
                </div>
                <div className="day-events">
                  {(() => {
                    const meetingsToday = getMeetingsForDay(day);
                    return (
                      <>
                        {meetingsToday.slice(0, 3).map((meeting) => (
                          <div key={meeting.id} className={`event-item ${meeting.color}`}>
                            {meeting.startTime} - {meeting.title}
                          </div>
                        ))}
                        {meetingsToday.length > 3 && (
                          <div className="more-events">
                            +{meetingsToday.length - 3} more
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DayView({ selectedDate, meetings, onSaveMeeting }) {
  const [contextMenu, setContextMenu] = useState({visible: false, x: 0, y: 0, meeting: null,});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  
  const todayMeetings = meetings.filter(
    (meeting) =>
      meeting.date.getDate() === selectedDate.getDate() &&
      meeting.date.getMonth() === selectedDate.getMonth() &&
      meeting.date.getFullYear() === selectedDate.getFullYear()
  );

  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const getMeetingsForTimeSlot = (timeSlot) => {
    const hour = parseInt(timeSlot.split(":")[0]);
    return todayMeetings.filter((meeting) => {
      const meetingHour = parseInt(meeting.startTime.split(":")[0]);
      return meetingHour === hour;
    });
  };

  const handleSlotClick = (time, event) => {
    const hour = parseInt(time.split(":")[0]);
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
    setModalData({ date: selectedDate, startTime, endTime });
    setShowModal(true);
  };

  const handleMeetingClick = (event, meeting) => {
    event.stopPropagation();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      meeting,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, meeting: null });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="day-view" onClick={handleCloseContextMenu}>
      <div className="time-column">
        {timeSlots.map((time, index) => (
          <div key={index} className="time-slot">
            {time}
          </div>
        ))}
      </div>
      <div className="schedule-column">
        {timeSlots.map((time, index) => (
          <div
            key={index}
            className="schedule-slot"
            onClick={(e) => handleSlotClick(time, e)}
            style={{ position: "relative" }}
          >
            {getMeetingsForTimeSlot(time).map((meeting) => {
              const startMinutes = parseInt(meeting.startTime.split(":")[1]);
              const endHour = parseInt(meeting.endTime.split(":")[0]);
              const endMinutes = parseInt(meeting.endTime.split(":")[1]);
              const startHour = parseInt(meeting.startTime.split(":")[0]);
              const durationHours =
                endHour - startHour + (endMinutes - startMinutes) / 60;
              const topPosition = (startMinutes / 60) * 100;
              const height = durationHours * 100;
              return (
                startHour === parseInt(time.split(":")[0]) && (
                  <div key={meeting.id} className={`meeting-item ${meeting.color}`} style={{ position: "absolute", top: `${topPosition}%`, height: `${height}%`, width: `100%`, }} onClick={(e) => handleMeetingClick(e, meeting)}>
                    <div className="meeting-title">{meeting.title}</div>
                    <div className="meeting-time">
                      {meeting.startTime} - {meeting.endTime}
                    </div>
                  </div>
                )
              );
            })}
          </div>
        ))}
      </div>
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        meeting={contextMenu.meeting}
        onClose={handleCloseContextMenu}
      />
      {showModal && (
        <CreateMeetingModal
          onClose={handleCloseModal}
          onSave={(meetingData) => {
            console.log('Saving meeting data:', meetingData);
            onSaveMeeting(meetingData);
            setShowModal(false);
          }}
          selectedDate={modalData.date}
          startTime={modalData.startTime}
          endTime={modalData.endTime}
        />
      )}
    </div>
  );
}