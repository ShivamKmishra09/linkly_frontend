import React, { useState } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";

const CreateCollectionModal = ({ isOpen, onClose, onSave, isSubmitting }) => {
  const [collectionName, setCollectionName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      alert("Please enter a collection name");
      return;
    }

    onSave(collectionName.trim());
  };

  const handleClose = () => {
    setCollectionName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content create-collection-modal">
        <div className="modal-header">
          <h2>Create New Collection</h2>
          <button onClick={handleClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="collectionName" className="form-label">
              Collection Name *
            </label>
            <input
              type="text"
              id="collectionName"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
              className="form-input"
              required
              maxLength="100"
            />
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
              disabled={isSubmitting || !collectionName.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <IoCheckmark />
                  Create Collection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCollectionModal;
