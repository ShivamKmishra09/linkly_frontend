import React from "react";
import { IoClose, IoInformationCircle, IoAnalytics, IoAlbums } from "react-icons/io5";
const DetailsModal = ({ isOpen, link, onClose }) => {
  if (!isOpen || !link) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // const getSafetyColor = (rating) => {
  //   if (rating >= 4) return "safety-safe";
  //   if (rating >= 3) return "safety-warning";
  //   return "safety-dangerous";
  // };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "COMPLETED":
        return "status-completed";
      case "FAILED":
        return "status-failed";
      default:
        return "";
    }
  };

  const renderAIField = (value, label) => {
    if (!value) return null;

    let displayValue = value;
    if (typeof value === "object") {
      displayValue = JSON.stringify(value, null, 2);
    }

    return (
      <div className="detail-row">
        <span className="detail-label">{label}:</span>
        <span className="detail-value">{displayValue}</span>
      </div>
    );
  };

  const renderClassification = (classification) => {
    if (!classification) return null;

    let data = classification;
    if (typeof classification === "string") {
      try {
        data = JSON.parse(classification);
      } catch (e) {
        console.error("Failed to parse classification:", e);
        return renderAIField(classification, "Classification");
      }
    }

    if (typeof data !== "object") {
      return renderAIField(data, "Classification");
    }

    return (
      <div className="detail-row">
        <span className="detail-label">Classification:</span>
        <div className="detail-value classification-container">
          <span className="category-text">{data.category}</span>
          <div className="tooltip-container">
            <span className="view-more">View More</span>
            <div className="tooltip-text">
              <div className="tooltip-row">
                <strong>Confidence:</strong> {data.confidence}
              </div>
              <div className="tooltip-row">
                <strong>Reason:</strong> {data.reason}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content details-modal">
        <div className="modal-header">
          <h2>Link Details</h2>
          <button onClick={onClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <div className="modal-body">
          {/* Basic Information */}
          <div className="detail-section">
            <h3><IoInformationCircle /> Basic Information</h3>
            <div className="detail-row">
              <span className="detail-label">Short URL:</span>
              <span className="detail-value short-url">

                <a 
                  href={`/linkly/${process.env.REACT_APP_FRONTEND_URL}/linkly/{link.shortId}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-value long-url"
                >
                  {process.env.REACT_APP_FRONTEND_URL}/linkly/{link.shortId}
                </a>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Long URL:</span>
              <a
                href={link.longUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-value long-url"
              >
                {link.longUrl}
              </a>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{formatDate(link.createdAt)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Clicks:</span>
              <span className="detail-value">
                 {link.viewerCount || 0}
              </span>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="detail-section">
            <h3><IoAnalytics /> AI Analysis</h3>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span
                className={`detail-value ${getStatusClass(
                  link.analysisStatus
                )}`}
              >
                {link.analysisStatus || "Not analyzed"}
              </span>
            </div>

            {renderAIField(link.aiSummary, "Summary")}
            {renderClassification(link.aiClassification)}
            {renderAIField(link.aiSafetyRating, "Safety Rating")}

            {link.aiTags && link.aiTags.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Tags:</span>
                <div className="detail-value">
                  <div className="tags-container">
                    {link.aiTags.map((tag, index) => (
                      <span key={index} className="tag">
                        {typeof tag === "object" ? JSON.stringify(tag) : tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collections */}
          {link.collections && link.collections.length > 0 && (
            <div className="detail-section">
              <h3><IoAlbums /> Collections</h3>
              <div className="detail-row">
                <span className="detail-label">Assigned to:</span>
                <div className="detail-value">
                  <div className="tags-container">
                    {link.collections.map((collectionId, index) => (
                      <span key={index} className="tag">
                        {collectionId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
