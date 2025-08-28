import React, { useState } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";

const BulkCollectionModal = ({ isOpen, collections, onClose, onConfirm, selectedLinkIds }) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCollectionId) {
      onConfirm(selectedCollectionId, selectedLinkIds);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedCollectionId("");
    onClose();
  };

  // Filter out system collections for bulk operations
  const userCollections = collections.filter(collection => !collection.isSystem);

  return (
    <div className="modal-overlay">
      <div className="modal-content bulk-collection-modal">
        <div className="modal-header">
          <h2>Add to Collection</h2>
          <button onClick={handleClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <div className="modal-body">
          <div className="bulk-info">
            <p>You are about to add <strong>{selectedLinkIds.length}</strong> selected link{selectedLinkIds.length !== 1 ? 's' : ''} to a collection.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="collection-select" className="form-label">
                Select Collection:
              </label>
              <select
                id="collection-select"
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Choose a collection...</option>
                {userCollections.map((collection) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.name} ({collection.links?.length || 0} links)
                  </option>
                ))}
              </select>
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
                disabled={!selectedCollectionId}
              >
                <IoCheckmark />
                Add to Collection
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkCollectionModal; 