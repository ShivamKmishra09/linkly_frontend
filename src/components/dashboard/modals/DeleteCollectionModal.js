import React from "react";
import { IoClose, IoTrash, IoWarning } from "react-icons/io5";

const DeleteCollectionModal = ({ isOpen, collection, onClose, onConfirm }) => {
  if (!isOpen || !collection) return null;

  const linkCount = collection.links?.length || 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-collection-modal">
        <div className="modal-header">
          <h2>Delete Collection</h2>
          <button onClick={onClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <div className="modal-body">
          {/* Warning Message */}
          <div className="warning-message">
            <IoWarning className="warning-icon" />
            <h3>Are you sure you want to delete this collection?</h3>
            <p>This action cannot be undone.</p>
          </div>

          {/* Collection Details */}
          <div className="collection-details">
            <h3>Collection Information</h3>
            <p>Name: {collection.name}</p>
            <p>Links: {linkCount}</p>
            <p>Created: {new Date(collection.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Warning Text */}
          <div className="warning-text">
            <p>
              <strong>Warning:</strong> Deleting this collection will remove all
              link associations. The links themselves will not be deleted, but
              they will no longer be organized under this collection.
            </p>
            {linkCount > 0 && (
              <p>
                <strong>Note:</strong> This collection contains {linkCount} link
                {linkCount !== 1 ? "s" : ""}. These links will become
                uncategorized.
              </p>
            )}
          </div>

          <div className="form-actions">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-danger"
            >
              <IoTrash />
              Delete Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCollectionModal;
