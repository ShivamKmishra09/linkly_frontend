import React, { useState, useEffect } from "react";
import {
  IoFilter,
  IoClose,
  IoCalendar,
  IoStatsChart,
  IoShieldCheckmark,
} from "react-icons/io5";
import axios from "axios";

const FilterBar = ({ onFiltersChange, isOpen, onToggle }) => {
  const [filters, setFilters] = useState({
    searchQuery: "",
    tags: [],
    dateRange: {
      startDate: "",
      endDate: "",
    },
    safetyScore: {
      min: 1,
      max: 5,
    },
    clicks: {
      min: 0,
    },
    sortBy: "createdAt_desc",
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Fetch available tags when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchAvailableTags();
    }
  }, [isOpen]);

  const fetchAvailableTags = async () => {
    try {
      setIsLoadingTags(true);
      const token = localStorage.getItem("jwtToken");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId || payload.sub || payload.id;

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/loggedin/${userId}/tags`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAvailableTags(response.data.data.tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];

    handleFilterChange("tags", newTags);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchQuery: "",
      tags: [],
      dateRange: { startDate: "", endDate: "" },
      safetyScore: { min: 1, max: 5 },
      clicks: { min: 0 },
      sortBy: "createdAt_desc",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange.startDate || filters.dateRange.endDate) count++;
    if (filters.safetyScore.min > 1 || filters.safetyScore.max < 5) count++;
    if (filters.clicks.min > 0) count++;
    if (filters.sortBy !== "createdAt_desc") count++;
    return count;
  };

  const getSafetyLabel = (score) => {
    if (score >= 4) return "Safe";
    if (score >= 3) return "Caution";
    return "Unsafe";
  };

  return (
    <div className="filter-bar">
      <div className="filter-header" onClick={onToggle}>
        <div className="filter-title">
          <IoFilter />
          <span>Advanced Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="active-filters-badge">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <button className="toggle-btn">
          {isOpen ? <IoClose /> : <IoFilter />}
        </button>
      </div>

      {isOpen && (
        <div className="filter-content">
          <div className="filter-row">
            {/* Search Query */}
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search in URLs and summaries..."
                value={filters.searchQuery}
                onChange={(e) =>
                  handleFilterChange("searchQuery", e.target.value)
                }
                className="filter-input"
              />
            </div>

            {/* Tags */}
            <div className="filter-group">
              <label>Tags</label>
              <div className="tags-container">
                {isLoadingTags ? (
                  <div className="loading-tags">Loading tags...</div>
                ) : availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`tag-btn ${
                        filters.tags.includes(tag) ? "selected" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))
                ) : (
                  <div className="no-tags">No tags available</div>
                )}
              </div>
            </div>
          </div>

          <div className="filter-row">
            {/* Date Range */}
            <div className="filter-group">
              <label>
                <IoCalendar />
                Date Range
              </label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={filters.dateRange.startDate}
                  onChange={(e) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      startDate: e.target.value,
                    })
                  }
                  className="filter-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={filters.dateRange.endDate}
                  onChange={(e) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      endDate: e.target.value,
                    })
                  }
                  className="filter-input"
                />
              </div>
            </div>

            {/* Safety Score */}
            <div className="filter-group">
              <label>
                <IoShieldCheckmark />
                Safety Score
              </label>
              <div className="range-inputs">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={filters.safetyScore.min}
                  onChange={(e) =>
                    handleFilterChange("safetyScore", {
                      ...filters.safetyScore,
                      min: parseInt(e.target.value),
                    })
                  }
                  className="range-slider"
                />
                <span className="range-label">
                  {getSafetyLabel(filters.safetyScore.min)} -{" "}
                  {getSafetyLabel(filters.safetyScore.max)}
                </span>
              </div>
            </div>
          </div>

          <div className="filter-row">
            {/* Clicks */}
            <div className="filter-group">
              <label>
                <IoStatsChart />
                Min Clicks
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.clicks.min}
                onChange={(e) =>
                  handleFilterChange("clicks", {
                    ...filters.clicks,
                    min: parseInt(e.target.value) || 0,
                  })
                }
                className="filter-input"
              />
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="filter-select"
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="clicks_desc">Most Clicks</option>
                <option value="clicks_asc">Least Clicks</option>
                <option value="safety_desc">Safest First</option>
                <option value="safety_asc">Least Safe First</option>
              </select>
            </div>

            {/* Apply Filters */}
            <div className="filter-group">
              <button onClick={applyFilters} className="apply-filters-btn">
                Apply Filters
              </button>
            </div>

            {/* Clear Filters */}
            <div className="filter-group">
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
