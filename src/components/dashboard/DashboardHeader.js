import React from "react";
import { IoSearch, IoAdd } from "react-icons/io5";

const DashboardHeader = ({
  searchQuery,
  onSearchChange,
  onCreateLink,
  totalLinks,
  selectedCollection,
}) => {
  const getHeaderTitle = () => {
    if (selectedCollection === "all") {
      return "All Links";
    } else if (selectedCollection === "uncategorized") {
      return "Uncategorized Links";
    }
    return "Collection Links";
  };

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <h1 className="dashboard-title">
          {getHeaderTitle()}
          <span className="link-count">({totalLinks})</span>
        </h1>
      </div>
      <div className="header-right">
        <div className="search-container">
          <IoSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          onClick={onCreateLink}
          className="create-link-btn"
          title="Create New Link"
        >
          <IoAdd />
          Create Link
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
