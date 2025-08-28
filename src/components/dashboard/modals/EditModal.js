import React, { useState, useEffect } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";

const EditModal = ({ isOpen, longUrl, shortUrl, onSave, onCancel }) => {
  const [newLongUrl, setNewLongUrl] = useState("");

  useEffect(() => {
    if (isOpen && longUrl) {
      setNewLongUrl(longUrl);
    }
  }, [isOpen, longUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newLongUrl.trim()) {
      alert("Please enter a URL");
      return;
    }

    // Validate URL format
    try {
      new URL(newLongUrl);
    } catch {
      alert("Please enter a valid URL (including http:// or https://)");
      return;
    }

    onSave(newLongUrl.trim());
  };

  const handleClose = () => {
    setNewLongUrl(longUrl || "");
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-modal">
        <div className="modal-header">
          <h2>Edit Link</h2>
          <button onClick={handleClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="shortUrl" className="form-label">
              Short URL
            </label>
            <input
              type="text"
              id="shortUrl"
              value={shortUrl || ""}
              className="form-input disabled"
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="newLongUrl" className="form-label">
              New Long URL *
            </label>
            <input
              type="url"
              id="newLongUrl"
              value={newLongUrl}
              onChange={(e) => setNewLongUrl(e.target.value)}
              placeholder="https://example.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <IoCheckmark />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
