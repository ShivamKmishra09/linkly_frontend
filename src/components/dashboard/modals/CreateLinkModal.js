import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

const CreateLinkModal = ({ isOpen, onClose, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState({
    longUrl: "",
    customShortId: "",
    useCustomId: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.longUrl.trim()) {
      alert("Please enter a URL");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.longUrl);
    } catch {
      alert("Please enter a valid URL (including http:// or https://)");
      return;
    }

    const linkData = {
      longUrl: formData.longUrl.trim(),
      ...(formData.useCustomId && formData.customShortId.trim() && {
        customShortId: formData.customShortId.trim(),
      }),
    };

    onSave(linkData);
  };

  const handleClose = () => {
    setFormData({
      longUrl: "",
      customShortId: "",
      useCustomId: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content create-link-modal">
        <div className="modal-header">
          <h2>Create New Link</h2>
          <button onClick={handleClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="longUrl" className="form-label">
              Long URL *
            </label>
            <input
              type="url"
              id="longUrl"
              value={formData.longUrl}
              onChange={(e) =>
                setFormData({ ...formData, longUrl: e.target.value })
              }
              placeholder="https://example.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.useCustomId}
                onChange={(e) =>
                  setFormData({ ...formData, useCustomId: e.target.checked })
                }
                className="form-checkbox"
              />
              Use Custom Short ID
            </label>
            {formData.useCustomId && (
              <input
                type="text"
                value={formData.customShortId}
                onChange={(e) =>
                  setFormData({ ...formData, customShortId: e.target.value })
                }
                placeholder="my-custom-link"
                className="form-input custom-id-input"
                pattern="[a-zA-Z0-9-_]+"
                title="Only letters, numbers, hyphens, and underscores allowed"
              />
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                "Create Link"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLinkModal;
