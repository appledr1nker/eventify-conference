import "@/index.css";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";
import { useState } from "react";

interface Speaker {
  id: number;
  name: string;
  bio?: string;
  company?: string;
  title?: string;
  sessions: { id: number; name: string; startTime: string }[];
}

function ExploreSpeakers() {
  const { output, isPending, responseMetadata } =
    useToolInfo<"explore-speakers">();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  if (isPending || !output) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading speakers...</p>
      </div>
    );
  }

  const { speakers } = output;
  const photos = responseMetadata?.photos || [];

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Speaker detail view
  if (selectedSpeaker) {
    const speakerIndex = speakers.findIndex((s) => s.id === selectedSpeaker.id);
    const photo = photos[speakerIndex];

    return (
      <div className="speaker-detail">
        <button className="back-btn" onClick={() => setSelectedSpeaker(null)}>
          Back to Speakers
        </button>
        <div className="speaker-header">
          {photo && (
            <img src={photo} alt={selectedSpeaker.name} className="speaker-photo-large" />
          )}
          <div className="speaker-info">
            <h2>{selectedSpeaker.name}</h2>
            {selectedSpeaker.title && (
              <p className="speaker-title">{selectedSpeaker.title}</p>
            )}
            {selectedSpeaker.company && (
              <p className="speaker-company">{selectedSpeaker.company}</p>
            )}
          </div>
        </div>
        {selectedSpeaker.bio && (
          <div className="speaker-bio">
            <h4>About</h4>
            <p>{selectedSpeaker.bio}</p>
          </div>
        )}
        {selectedSpeaker.sessions.length > 0 && (
          <div className="speaker-sessions">
            <h4>Sessions</h4>
            <ul>
              {selectedSpeaker.sessions.map((session) => (
                <li key={session.id}>
                  <span className="session-name">{session.name}</span>
                  <span className="session-time">
                    {formatTime(session.startTime)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="speakers-container">
      <h2>Conference Speakers</h2>
      <p className="speakers-count">{speakers.length} speakers</p>

      <div className="speakers-grid">
        {speakers.map((speaker, index) => (
          <div
            key={speaker.id}
            className="speaker-card"
            onClick={() => setSelectedSpeaker(speaker)}
          >
            {photos[index] ? (
              <img
                src={photos[index]}
                alt={speaker.name}
                className="speaker-photo"
              />
            ) : (
              <div className="speaker-photo-placeholder">
                {speaker.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <h3>{speaker.name}</h3>
            {speaker.title && <p className="title">{speaker.title}</p>}
            {speaker.company && <p className="company">{speaker.company}</p>}
            {speaker.sessions.length > 0 && (
              <p className="session-count">
                {speaker.sessions.length} session
                {speaker.sessions.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreSpeakers;
mountWidget(<ExploreSpeakers />);
