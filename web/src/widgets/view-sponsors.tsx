import "@/index.css";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";
import { useState } from "react";

interface Sponsor {
  id: number;
  name: string;
  description?: string;
  website?: string;
  categoryId: number;
  categoryName?: string;
}


function ViewSponsors() {
  const { output, isPending, responseMetadata } =
    useToolInfo<"view-sponsors">();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  if (isPending || !output) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading sponsors...</p>
      </div>
    );
  }

  const { categories, sponsors } = output;
  const logos = responseMetadata?.logos || [];

  // Filter by selected category
  const filteredSponsors = selectedCategory
    ? sponsors.filter((s) => s.categoryId === selectedCategory)
    : sponsors;

  // Sponsor detail view
  if (selectedSponsor) {
    const sponsorIndex = sponsors.findIndex((s) => s.id === selectedSponsor.id);
    const logo = logos[sponsorIndex];

    return (
      <div className="sponsor-detail">
        <button className="back-btn" onClick={() => setSelectedSponsor(null)}>
          Back to Sponsors
        </button>
        <div className="sponsor-header">
          {logo && (
            <img src={logo} alt={selectedSponsor.name} className="sponsor-logo-large" />
          )}
          <div className="sponsor-info">
            <h2>{selectedSponsor.name}</h2>
            {selectedSponsor.categoryName && (
              <span className="category-badge">
                {selectedSponsor.categoryName}
              </span>
            )}
          </div>
        </div>
        {selectedSponsor.description && (
          <div className="sponsor-description">
            <p>{selectedSponsor.description}</p>
          </div>
        )}
        {selectedSponsor.website && (
          <a
            href={selectedSponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="sponsor-website"
          >
            Visit Website
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="sponsors-container">
      <h2>Our Sponsors</h2>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="category-filter">
          <button
            className={!selectedCategory ? "active" : ""}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={selectedCategory === cat.id ? "active" : ""}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Sponsors grid */}
      <div className="sponsors-grid">
        {filteredSponsors.map((sponsor) => {
          const sponsorIndex = sponsors.findIndex((s) => s.id === sponsor.id);
          const logo = logos[sponsorIndex];

          return (
            <div
              key={sponsor.id}
              className="sponsor-card"
              onClick={() => setSelectedSponsor(sponsor)}
            >
              {logo ? (
                <img src={logo} alt={sponsor.name} className="sponsor-logo" />
              ) : (
                <div className="sponsor-logo-placeholder">{sponsor.name[0]}</div>
              )}
              <h3>{sponsor.name}</h3>
              {sponsor.categoryName && (
                <span className="category-badge">{sponsor.categoryName}</span>
              )}
            </div>
          );
        })}
      </div>

      {filteredSponsors.length === 0 && (
        <p className="no-sponsors">No sponsors in this category</p>
      )}
    </div>
  );
}

export default ViewSponsors;
mountWidget(<ViewSponsors />);
