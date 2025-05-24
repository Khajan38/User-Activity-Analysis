/* EVENT HANDLERS FOR MEETING MANAGMENNT COMPONENTS */
import { v4 as uuidv4 } from 'uuid';
import './CSS/meeting_window.css';
import './CSS/meeting_extensions.css';
import React, { useState } from 'react';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function ContextMenu({ visible, x, y, meeting, onAction, onClose }) {
  if (!visible) return null;
  
  const handleAction = (action) => {
    onAction(action, meeting);
    onClose();
  };
  
  return (
    <div className="context-menu" style={{top: y, left: x}}>
      {["View", "Edit", "Delete"].map((action, index) => (
        <div
          key={action}
          className={`context-button btn-${index}`}
          onClick={() => handleAction(action.toLowerCase())}
        >
          {action[0]}
        </div>
      ))}
    </div>
  );
}

export function ViewMeetingModal({ meeting, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>View Meeting</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="meeting-details">
            <h3 className={`meeting-title ${meeting.color}`}>{meeting.title}</h3>
            <div className="meeting-info">
              <p><strong>Date:</strong> {meeting.date instanceof Date ? 
                meeting.date.toLocaleDateString() : 
                new Date(meeting.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {meeting.startTime} - {meeting.endTime}</p>
              {meeting.description && (
                <div className="meeting-description">
                  <p><strong>Description:</strong></p>
                  <p>{meeting.description}</p>
                </div>
              )}
              {meeting.attendees && meeting.attendees.length > 0 && (
                <div className="meeting-attendees">
                  <p><strong>Attendees:</strong></p>
                  <ul>
                    {meeting.attendees.map((attendee, index) => (
                      <li key={index}>{attendee}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="close-button">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateMeetingModal({ onClose, onSave, selectedDate, startTime, endTime, existingMeeting = null }) {
  const [meetingData, setMeetingData] = useState(
    existingMeeting || {
      id: uuidv4() || 0,
      title: '',
      date: selectedDate,
      startTime: startTime,
      endTime: endTime,
      color: 'blue',
      description: '',
      attendees: []
    }
  );

  const [attendeeInput, setAttendeeInput] = useState('');
  const isEditing = !!existingMeeting;

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
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing 
        ? `${BASE_URL}/api/meetings/${meetingData.id}`
        : `${BASE_URL}/api/meetings`;
        
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });
      console.log("Sent the data to backend...")
      const result = await response.json();
      console.log("Received the data to backend...", result)
      const updatedMeeting = { ...meetingData, id: result._id };
      console.log("Updated Meeting : ", updatedMeeting)
      onSave((prevMeetings) => {
        const exists = prevMeetings.some(meeting => meeting.id === meetingData.id);
        if (exists) {
          console.log("Meeting was previously pushed...")
          return prevMeetings.map(meeting =>
            meeting.id === meetingData.id ? updatedMeeting : meeting
          );
        } else {
          console.log("Meeting was not previously pushed...")
          return [...prevMeetings, updatedMeeting];
        }
      });
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'saving'} meeting:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'save'} meeting to server.`);
    }
  };  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const colorOptions = [
    { id: 'red', label: 'Red' },
    { id: 'orange', label: 'Orange' },
    { id: 'blue', label: 'Blue' },
    { id: 'green', label: 'Green' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Meeting' : 'Create Meeting'}</h2>
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
                onKeyDown={handleKeyDown}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={dateValue}
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
                    onKeyDown={handleKeyDown}
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
                    onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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
                  onKeyDown={(e) => {if (e.key === 'Enter') {e.preventDefault(); handleAddAttendee();}}}
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
              <button type="submit" className="save-button">{isEditing ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function DeleteMeetingConfirmation({ meeting, onClose, onConfirm }) {
  const handleDelete = async () => {
    try {
      await fetch(`${BASE_URL}/api/meetings/${meeting.id}`, {
        method: "DELETE",
      });
      onConfirm(meeting.id);
      onClose();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Failed to delete meeting from server.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal delete-modal">
        <div className="modal-header">
          <h2>Delete Meeting</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <p>Are you sure you want to delete the meeting "{meeting.title}"?</p>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="button" onClick={handleDelete} className="delete-button">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}