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
                  {getMeetingsForDay(day)
                    .slice(0, 3)
                    .map((meeting) => (
                      <div
                        key={meeting.id}
                        className={`event-item ${meeting.color}`}
                      >
                        {meeting.startTime} - {meeting.title}
                      </div>
                    ))}
                  {getMeetingsForDay(day).length > 3 && (
                    <div className="more-events">
                      +{getMeetingsForDay(day).length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DayView({ selectedDate, meetings }) {
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

  return (
    <div className="day-view">
      <div className="time-column">
        {timeSlots.map((time, index) => (
          <div key={index} className="time-slot">
            {time}
          </div>
        ))}
      </div>
      <div className="schedule-column">
        {timeSlots.map((time, index) => (
          <div key={index} className="schedule-slot">
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
                  <div
                    key={meeting.id}
                    className={`meeting-item ${meeting.color}`}
                    style={{
                      top: `${topPosition}%`,
                      height: `${height}%`,
                      width: `${100}%`
                    }}
                  >
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
    </div>
  );
}
