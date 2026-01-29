import "@/index.css";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";
import { useState } from "react";

interface Speaker {
  id: number;
  name: string;
  photo: string;
}

interface Session {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  speakers: Speaker[];
}

function BrowseSchedule() {
  const { output, isPending } = useToolInfo<"browse-schedule">();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  if (isPending || !output) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading schedule...</p>
      </div>
    );
  }

  const { sessions } = output;

  // Group sessions by time slot
  const sessionsByTime = sessions.reduce(
    (acc, session) => {
      const time = new Date(session.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (!acc[time]) acc[time] = [];
      acc[time].push(session);
      return acc;
    },
    {} as Record<string, Session[]>
  );

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Session detail view
  if (selectedSession) {
    return (
      <div className="session-detail">
        <button className="back-btn" onClick={() => setSelectedSession(null)}>
          Back to Schedule
        </button>
        <h2>{selectedSession.name}</h2>
        <div className="session-meta">
          <span className="time">
            {formatTime(selectedSession.startTime)} -{" "}
            {formatTime(selectedSession.endTime)}
          </span>
          {selectedSession.location && (
            <span className="location">{selectedSession.location}</span>
          )}
        </div>
        {selectedSession.speakers.length > 0 && (
          <div className="speakers">
            <h4>Speakers</h4>
            <div className="speaker-list-detail">
              {selectedSession.speakers.map((speaker) => (
                <div key={speaker.id} className="speaker-item-detail">
                  {speaker.photo ? (
                    <img src={speaker.photo} alt={speaker.name} className="speaker-avatar-large" />
                  ) : (
                    <div className="speaker-avatar-placeholder-large">
                      {speaker.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  )}
                  <span>{speaker.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedSession.description && (
          <div className="description">
            <h4>About this session</h4>
            <p>{selectedSession.description}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="schedule-container">
      {/* Logo */}
      <div className="schedule-logo">
        <img src="/logo.svg" alt="MCP Connect Day" />
      </div>

      {/* Sessions list */}
      <div className="sessions-list">
        {Object.keys(sessionsByTime).length === 0 ? (
          <p className="no-sessions">No sessions found</p>
        ) : (
          Object.entries(sessionsByTime).map(([time, timeSessions]) => (
            <div key={time} className="time-slot">
              <div className="time-header">{time}</div>
              <div className="time-sessions">
                {timeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="session-card"
                    onClick={() => setSelectedSession(session)}
                  >
                    <h3>{session.name}</h3>
                    {session.speakers.length > 0 && (
                      <div className="session-speakers-row">
                        {session.speakers.map((speaker) => (
                          <div key={speaker.id} className="speaker-chip">
                            {speaker.photo ? (
                              <img src={speaker.photo} alt={speaker.name} className="speaker-avatar" />
                            ) : (
                              <div className="speaker-avatar-placeholder">
                                {speaker.name.split(" ").map(n => n[0]).join("")}
                              </div>
                            )}
                            <span>{speaker.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {session.location && (
                      <div className="session-info">
                        <span className="location">{session.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BrowseSchedule;
mountWidget(<BrowseSchedule />);
