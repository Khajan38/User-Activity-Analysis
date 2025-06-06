import { useState, useEffect } from "react";
import axios from "axios";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MeetingsList = ({ setGlobalMeetings }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let ignore = false;
    const fetchMeetings = async () => {
      if (!ignore) {
        try {
          const response = await axios.get(`${BASE_URL}/api/meetings`);
          // Format meetings data according to required structure
          const formattedMeetings = response.data.map((meeting) => ({
            id: meeting._id || 0,
            title: meeting.title || "",
            date: new Date(meeting.date),
            startTime: meeting.startTime || "09:00",
            endTime: meeting.endTime || "10:00",
            color: meeting.color || "blue",
            description: meeting.description || "",
            attendees: meeting.attendees || [],
          }));
          setGlobalMeetings(formattedMeetings);
          console.log("Meetings fetched:", formattedMeetings.length);
          setLoading(false);
        }
        catch (error) {
          console.error("Error fetching meetings:", error);
          setError("Failed to fetch meetings");
          setLoading(false);
        }
      }
    };
    fetchMeetings();
    return () => {ignore = true;};
  }, [setGlobalMeetings]);
  if (loading || error) {
    return (
      <>
        <div className="toast-overlay" />
        <div className={`toast-message ${error ? "error" : "processing"}`}>
          {error || "Loading meetings..."}
        </div>
      </>
    );
  }  
};

export default MeetingsList;