import "@/index.css";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";
import { useState } from "react";

function EventGallery() {
  const { output, isPending, responseMetadata } =
    useToolInfo<"event-gallery">();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (isPending || !output) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading gallery...</p>
      </div>
    );
  }

  const { images, totalCount } = output;
  const imageUrls = responseMetadata?.imageUrls || [];

  // Lightbox view
  if (selectedIndex !== null && imageUrls[selectedIndex]) {
    const image = images[selectedIndex];
    const canGoPrev = selectedIndex > 0;
    const canGoNext = selectedIndex < imageUrls.length - 1;

    return (
      <div className="lightbox">
        <button className="close-btn" onClick={() => setSelectedIndex(null)}>
          Close
        </button>
        <div className="lightbox-content">
          <button
            className="nav-btn prev"
            onClick={() => setSelectedIndex(selectedIndex - 1)}
            disabled={!canGoPrev}
          >
            Prev
          </button>
          <div className="lightbox-image-container">
            <img
              src={imageUrls[selectedIndex]}
              alt={image?.caption || `Photo ${selectedIndex + 1}`}
              className="lightbox-image"
            />
            {image?.caption && (
              <p className="lightbox-caption">{image.caption}</p>
            )}
          </div>
          <button
            className="nav-btn next"
            onClick={() => setSelectedIndex(selectedIndex + 1)}
            disabled={!canGoNext}
          >
            Next
          </button>
        </div>
        <div className="lightbox-counter">
          {selectedIndex + 1} / {imageUrls.length}
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2>Event Gallery</h2>
      <p className="photo-count">{totalCount} photos</p>

      <div className="gallery-grid">
        {imageUrls.map((url, index) => (
          <div
            key={images[index]?.id || index}
            className="gallery-item"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={url}
              alt={images[index]?.caption || `Photo ${index + 1}`}
              loading="lazy"
            />
            {images[index]?.caption && (
              <div className="gallery-caption">{images[index].caption}</div>
            )}
          </div>
        ))}
      </div>

      {imageUrls.length === 0 && (
        <p className="no-photos">No photos in the gallery yet</p>
      )}
    </div>
  );
}

export default EventGallery;
mountWidget(<EventGallery />);
