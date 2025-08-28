import React, { useState, useEffect } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";

const EditCollectionModal = ({ isOpen, collection, onClose, onSave }) => {
  const [collectionName, setCollectionName] = useState("");

  useEffect(() => {
    if (isOpen && collection) {
      setCollectionName(collection.name);
    }
  }, [isOpen, collection]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      alert("Please enter a collection name");
      return;
    }

    if (collectionName.trim() === collection.name) {
      alert("No changes made");
      return;
    }

    onSave(collectionName.trim());
  };

  const handleClose = () => {
    setCollectionName(collection?.name || "");
    onClose();
  };

  if (!isOpen || !collection) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-collection-modal">
        <div className="modal-header">
          <h2>Edit Collection</h2>
          <button onClick={handleClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <div className="modal-body">
          {/* Collection Information */}
          <div className="collection-info">
            <h3>Collection Details</h3>
            <p>Current Name: {collection.name}</p>
            <p>Links: {collection.links?.length || 0}</p>
            <p>Created: {new Date(collection.createdAt).toLocaleDateString()}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newCollectionName" className="form-label">
                New Name *
              </label>
              <input
                type="text"
                id="newCollectionName"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Enter new collection name"
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
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!collectionName.trim() || collectionName.trim() === collection.name}
              >
                <IoCheckmark />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCollectionModal;
