import "@/index.css";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";
import { useState } from "react";

interface Speaker {
  id: number;
  name: string;
  bio?: string;
  photo?: string;
  company?: string;
  title?: string;
}

function ExploreSpeakers() {
  const { output, isPending } = useToolInfo<"explore-speakers">();
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

  // Speaker detail view
  if (selectedSpeaker) {
    return (
      <div className="speaker-detail">
        <button className="back-btn" onClick={() => setSelectedSpeaker(null)}>
          Back to Speakers
        </button>
        <div className="speaker-header">
          {selectedSpeaker.photo ? (
            <img src={selectedSpeaker.photo} alt={selectedSpeaker.name} className="speaker-photo-large" />
          ) : (
            <div className="speaker-photo-placeholder" style={{ width: 120, height: 120, fontSize: '2rem' }}>
              {selectedSpeaker.name.split(" ").map((n) => n[0]).join("")}
            </div>
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
      </div>
    );
  }

  return (
    <div className="speakers-container">
      <h2>Conference Speakers</h2>
      <p className="speakers-count">{speakers.length} speakers</p>

      <div className="speakers-grid">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="speaker-card"
            onClick={() => setSelectedSpeaker(speaker)}
          >
            {speaker.photo ? (
              <img
                src={speaker.photo}
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreSpeakers;
mountWidget(<ExploreSpeakers />);
