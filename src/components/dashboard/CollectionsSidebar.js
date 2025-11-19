import React, { useState } from "react";
import { IoAdd, IoCreate, IoTrash, IoStatsChart } from "react-icons/io5";
import { FaBrain, FaFolder } from "react-icons/fa";

const CollectionsSidebar = ({
  collections,
  selectedCollection,
  onCollectionSelect,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  onClearEmptyCollections,
  totalLinks,
  collectionStats,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  // const [expandedCollections, setExpandedCollections] = useState(new Set());

  // const toggleCollectionExpansion = (collectionId) => {
  //   const newExpanded = new Set(expandedCollections);
  //   if (newExpanded.has(collectionId)) {
  //     newExpanded.delete(collectionId);
  //   } else {
  //     newExpanded.add(collectionId);
  //   }
  //   setExpandedCollections(newExpanded);
  // };

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("Filtered Collections:", filteredCollections);
  const systemCollections = filteredCollections.filter((c) => c.isSystem);
  const userCollections = filteredCollections.filter((c) => !c.isSystem);

  const totalLinksInCollections = collections.reduce(
    (sum, collection) => sum + (collection.links?.length || 0),
    0
  );

  const renderCollectionItem = (collection) => {
    // const isExpanded = expandedCollections.has(collection._id);
    const isSelected = selectedCollection === collection._id;
    const linkCount = collection.links?.length || 0;

    return (
      <div
        key={collection._id}
        className={`collection-item ${isSelected ? "selected" : ""} ${
          collection.isSystem ? "system-collection" : ""
        }`}
      >
        <div className="collection-header">
          <div
            className="collection-content"
            onClick={() => onCollectionSelect(collection._id)}
          >
            {collection.isSystem ? (
              <FaBrain className="system-collection-icon" />
            ) : (
              <FaFolder />
            )}
            <span className="collection-name">{collection.name}</span>
            <span className="collection-count">({linkCount})</span>
          </div>
          {!collection.isSystem && (
            <div className="collection-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCollection(collection);
                }}
                className="action-btn edit-btn"
                title="Edit Collection"
              >
                <IoCreate />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCollection(collection);
                }}
                className="action-btn delete-btn"
                title="Delete Collection"
              >
                <IoTrash />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="collections-sidebar">
      {/*
      <div className="sidebar-header">
        <h3 className="sidebar-title">Collections</h3>
      </div>

      <div className="collection-stats">
        <div className="stats-header">
          <IoStatsChart />
          Overview
        </div>
        <div className="stats-content">
          <span>Total Links</span>
          <span>{totalLinks}</span>
        </div>
        <div className="stats-content">
          <span>Collections</span>
          <span>{collections.length}</span>
        </div>
        <div className="stats-content">
          <span>Avg per Collection</span>
          <span>
            {collections.length > 0
              ? (totalLinks / collections.length).toFixed(1)
              : "0"}
          </span>
        </div>
      </div>
      */}

      {/* Collection Search */}
      <div className="collection-search">
        <input
          type="text"
          placeholder="Search collections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* System Collections Section */}
      {systemCollections.length > 0 && (
        <div className="collections-section">
          <h4 className="section-title system-collection">
            <FaBrain /> AI-Generated Collections
          </h4>
          <div className="collections-list">
            {systemCollections.map(renderCollectionItem)}
          </div>
        </div>
      )}

      {/* User Collections Section */}
      <div className="collections-section">
        <h4 className="section-title">Your Collections</h4>
        <div className="collections-list">
          {/* All Links Option */}
          <div
            className={`collection-item all-links ${
              selectedCollection === "all" ? "selected" : ""
            }`}
            onClick={() => onCollectionSelect("all")}
          >
            <FaFolder />
            <span>All Links</span>
            <span className="collection-count">({totalLinks})</span>
          </div>

          {/* Uncategorized Option */}
          <div
            className={`collection-item uncategorized ${
              selectedCollection === "uncategorized" ? "selected" : ""
            }`}
            onClick={() => onCollectionSelect("uncategorized")}
          >
            <FaFolder />
            <span>Uncategorized</span>
            <span className="collection-count">
              ({totalLinks - totalLinksInCollections})
            </span>
          </div>

          {/* User Collections */}
          {userCollections.map(renderCollectionItem)}
        </div>
      </div>

      {/* Collection Management */}
      <div className="collection-management">
        <button onClick={onCreateCollection} className="create-collection-btn">
          <IoAdd />
          Create Collection
        </button>
        <button onClick={onClearEmptyCollections} className="clear-empty-btn">
          Clear Empty Collections
        </button>
      </div>
    </div>
  );
};

export default CollectionsSidebar;
