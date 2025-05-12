import { ObjectId } from 'bson';
import './CSS/meeting_window.css';
import React, { useState } from 'react';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function ContextMenu({ visible, x, y, meeting, onAction, onClose }) {
  if (!visible) return null;
  return (
    <div
      className="context-menu"
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 10,
        display: "flex",
        gap: "8px",
      }}
    >
      {["View", "Edit", "Delete"].map((action) => (
        <div
          key={action}
          className="context-button"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={() => {
            alert(`${action} clicked for ${meeting.title}`);
            onClose();
          }}
        >
          {action[0]}
        </div>
      ))}
    </div>
  );
}

export function CreateMeetingModal({ onClose, onSave, selectedDate, startTime, endTime }) {
  const [meetingData, setMeetingData] = useState({
    id: new ObjectId() || 0,
    title: '',
    date: selectedDate,
    startTime: startTime,
    endTime: endTime,
    color: 'blue',
    description: '',
    attendees: []
  });

  const [attendeeInput, setAttendeeInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeetingData({ ...meetingData, [name]: value });
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
    setMeetingData({ ...meetingData, attendees: updatedAttendees });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      fetch(`${BASE_URL}/api/meetings`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(meetingData)
      });
      onSave(meetingData);
    } catch (error) {
      console.error("Error saving meeting:", error);
      alert("Failed to save meeting to server.");
    }
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
      <div className="modal">
        <div className="modal-header">
          <h2>Create Meeting</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
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
                  onChange={(e) =>
                    setMeetingData({
                      ...meetingData,
                      date: new Date(e.target.value),
                    })
                  }
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
                placeholder="Enter Description"
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
                <button type="button" onClick={handleAddAttendee}>Add</button>
              </div>
              <div className="attendee-list">
                {meetingData.attendees.map((attendee, index) => (
                  <div key={index} className="attendee-item">
                    <span>{attendee}</span>
                    <button type="button" onClick={() => handleRemoveAttendee(index)}>×</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
              <button type="submit" className="save-button">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}