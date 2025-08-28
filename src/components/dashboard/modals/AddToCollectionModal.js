import React, { useState } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";

const AddToCollectionModal = ({
  isOpen,
  onClose,
  collections,
  onSave,
  link,
}) => {
  const [selectedCollections, setSelectedCollections] = useState(new Set());

  const handleCollectionToggle = (collectionId) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCollections.size === 0) {
      alert("Please select at least one collection");
      return;
    }

    onSave(Array.from(selectedCollections));
  };

  const handleClose = () => {
    setSelectedCollections(new Set());
    onClose();
  };

  if (!isOpen || !link) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content add-to-collection-modal">
        <div className="modal-header">
          <h2>Add to Collection</h2>
          <button onClick={handleClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <div className="modal-body">
          {/* Link Information */}
          <div className="link-info">
            <h3>Link to Add</h3>
            <p className="link-url">{link.longUrl}</p>
          </div>

          {/* Collections Selection */}
          <div className="form-group">
            <label className="form-label">Select Collections</label>
            {collections.length > 0 ? (
              <div className="collections-list">
                {collections
                  .filter((collection) => !collection.isSystem) // Don't show system collections
                  .map((collection) => (
                    <div
                      key={collection._id}
                      className="collection-checkbox"
                      onClick={() => handleCollectionToggle(collection._id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.has(collection._id)}
                        onChange={() => {}} // Controlled by parent div click
                        className="form-checkbox"
                      />
                      <span className="collection-name">{collection.name}</span>
                      <span className="collection-count">
                        ({collection.links?.length || 0} links)
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="no-collections">
                No collections available. Create a collection first.
              </div>
            )}
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
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={selectedCollections.size === 0}
            >
              <IoCheckmark />
              Add to Collections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;
