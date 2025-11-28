import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";

// Import CSS
import "./dashboard/Dashboard.css";

// Import new dashboard components
import DashboardHeader from "./dashboard/DashboardHeader";
import CollectionsSidebar from "./dashboard/CollectionsSidebar";
import LinkTable from "./dashboard/LinkTable";
import FilterBar from "./dashboard/FilterBar";
import CreateLinkModal from "./dashboard/modals/CreateLinkModal";

// Import existing modal components
import DetailsModal from "./dashboard/modals/DetailsModal";
import EditModal from "./dashboard/modals/EditModal";
import CreateCollectionModal from "./dashboard/modals/CreateCollectionModal";
import AddToCollectionModal from "./dashboard/modals/AddToCollectionModal";
import EditCollectionModal from "./dashboard/modals/EditCollectionModal";
import DeleteCollectionModal from "./dashboard/modals/DeleteCollectionModal";

const Dashboard_Loginned = ({ refresh }) => {
  // State management
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  // const [activeFilters, setActiveFilters] = useState({});

  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentLinkDetails, setCurrentLinkDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState(null);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] =
    useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [currentLinkToAdd, setCurrentLinkToAdd] = useState(null);
  const [isEditCollectionModalOpen, setIsEditCollectionModalOpen] =
    useState(false);
  const [currentEditingCollection, setCurrentEditingCollection] =
    useState(null);
  const [isDeleteCollectionModalOpen, setIsDeleteCollectionModalOpen] =
    useState(false);
  const [currentDeletingCollection, setCurrentDeletingCollection] =
    useState(null);
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);

  // Retry mechanism for rate limit errors
  const retryWithBackoff = async (operation, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (error.response?.status === 429 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(
            `Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  // Fetch dashboard data using the new single endpoint
  const fetchDashboardData = useCallback(async (userId = null) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Try to get user ID from token if not provided
      let targetUserId = userId;
      if (!targetUserId) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          targetUserId = payload.userId || payload.sub || payload.id;
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }

      if (!targetUserId) {
        console.error("No user ID available");
        setIsLoading(false);
        return;
      }

      // console.log("Fetching dashboard data for user:", targetUserId);
      const response = await retryWithBackoff(async () => {
        return await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/loggedin/${targetUserId}/dashboard-data`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      if (response.data.success) {
        const {
          user: userData,
          links: linksData,
          collections: collectionsData,
        } = response.data.data;
        setUser(userData);
        setLinks(linksData);
        setCollections(collectionsData);
        // console.log("Dashboard data loaded successfully");
        // console.log("Data structure:", {
        //   user: userData,
        //   linksCount: linksData.length,
        //   collectionsCount: collectionsData.length,
        //   sampleLink: linksData[0],
        //   sampleCollection: collectionsData[0],
        // });
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);

      if (err.response?.status === 429) {
        alert(
          "Rate limit exceeded while fetching data. Please wait a moment and refresh the page."
        );
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch dashboard data. Please refresh the page.";
        alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (refresh) {
      setIsLoading(true);
      fetchDashboardData();
    }
  }, [refresh, fetchDashboardData]);

  // Fetch data on component mount
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    // console.log(
    //   "Component mount effect - token:",
    //   !!token,
    //   "isLoading:",
    //   isLoading,
    //   "user:",
    //   !!user
    // );
    if (token && !user) {
      // console.log("Fetching data on component mount");
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Memoized functions to prevent unnecessary re-renders
  const handleEditStart = useCallback((linkToEdit) => {
    setCurrentEditing(linkToEdit);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (linkToDelete) => {
      if (!window.confirm("Are you sure you want to delete this link?")) return;

      try {
        const token = localStorage.getItem("jwtToken");
        await retryWithBackoff(async () => {
          return await axios.delete(
            `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/url/${linkToDelete._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        });

        setLinks((prevLinks) =>
          prevLinks.filter((link) => link._id !== linkToDelete._id)
        );
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete link.");
      }
    },
    [user?._id]
  );

  const handleAddToCollection = useCallback((link) => {
    setCurrentLinkToAdd(link);
    setIsAddLinkModalOpen(true);
  }, []);

  const handleViewAnalysis = useCallback((link) => {
    // console.log("Opening DetailsModal for link:", link);
    // console.log("AI fields:", {
    //   aiSummary: link.aiSummary,
    //   aiTags: link.aiTags,
    //   aiSafetyRating: link.aiSafetyRating,
    //   aiClassification: link.aiClassification,
    // });
    setCurrentLinkDetails(link);
    setIsDetailsModalOpen(true);
  }, []);

  const handleEditSave = useCallback(
    async (newLongUrl) => {
      if (
        !newLongUrl ||
        (!newLongUrl.startsWith("http://") &&
          !newLongUrl.startsWith("https://"))
      ) {
        return alert("Please enter a valid URL.");
      }

      try {
        const token = localStorage.getItem("jwtToken");
        const response = await retryWithBackoff(async () => {
          return await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/url/${currentEditing._id}`,
            { newLongUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        });

        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link._id === currentEditing._id ? response.data.link : link
          )
        );
        setIsEditModalOpen(false);
        setCurrentEditing(null);
      } catch (err) {
        console.error("Edit error:", err);
        alert("Failed to update link.");
      }
    },
    [user?._id, currentEditing?._id]
  );

  const handleCreateLink = useCallback(
    async (linkData) => {
      if (!linkData.longUrl) return;

      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await retryWithBackoff(async () => {
          return await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/url`,
            linkData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        });

        if (response.data.message === "Link added successfully") {
          // Wait for 30 seconds before refreshing
          await new Promise((resolve) => setTimeout(resolve, 30000));
          
          // Refresh dashboard data to get the new link
          await fetchDashboardData(user._id);
          setIsCreateLinkModalOpen(false);
        }
      } catch (err) {
        console.error("Create link error:", err);
        if (err.response?.status === 429) {
          alert("Too many requests. Please wait a moment before trying again.");
        } else {
          const errorMessage =
            err.response?.data?.message || "Failed to create link.";
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [user?._id, fetchDashboardData]
  );

  const handleCreateCollection = useCallback(
    async (name) => {
      if (!name || name.trim() === "") {
        alert("Please enter a collection name.");
        return;
      }

      if (isSubmitting) {
        alert("Please wait, request in progress...");
        return;
      }

      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await retryWithBackoff(async () => {
          return await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/collections`,
            { name: name.trim() },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        });

        if (response.data.success) {
          setCollections((prev) =>
            [...prev, response.data.collection].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
          setIsCreateCollectionModalOpen(false);
        }
      } catch (err) {
        console.error("Create collection error:", err);
        if (err.response?.status === 429) {
          alert("Too many requests. Please wait a moment before trying again.");
        } else {
          const errorMessage =
            err.response?.data?.message || "Failed to create collection.";
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [user?._id, isSubmitting]
  );

  const handleEditCollection = useCallback(
    async (newName) => {
      if (!newName || newName.trim() === "") {
        alert("Please enter a collection name.");
        return;
      }

      if (isSubmitting) {
        alert("Please wait, request in progress...");
        return;
      }

      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await retryWithBackoff(async () => {
          return await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/collections/${currentEditingCollection._id}`,
            { name: newName.trim() },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        });

        if (response.data.success) {
          setCollections((prev) =>
            prev
              .map((col) =>
                col._id === currentEditingCollection._id
                  ? response.data.collection
                  : col
              )
              .sort((a, b) => a.name.localeCompare(b.name))
          );
          setIsEditCollectionModalOpen(false);
          setCurrentEditingCollection(null);
        }
      } catch (err) {
        console.error("Edit collection error:", err);
        if (err.response?.status === 429) {
          alert("Too many requests. Please wait a moment before trying again.");
        } else {
          const errorMessage =
            err.response?.data?.message || "Failed to edit collection.";
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [user?._id, currentEditingCollection?._id, isSubmitting]
  );

  const handleDeleteCollection = useCallback(async () => {
    if (!currentDeletingCollection) return;

    if (isSubmitting) {
      alert("Please wait, request in progress...");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await retryWithBackoff(async () => {
        return await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/collections/${currentDeletingCollection._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      if (response.data.success) {
        setCollections((prev) =>
          prev.filter((col) => col._id !== currentDeletingCollection._id)
        );

        if (selectedCollection === currentDeletingCollection._id) {
          setSelectedCollection("all");
        }

        setIsDeleteCollectionModalOpen(false);
        setCurrentDeletingCollection(null);
      }
    } catch (err) {
      console.error("Delete collection error:", err);
      if (err.response?.status === 429) {
        alert("Too many requests. Please wait a moment before trying again.");
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to delete collection.";
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [user?._id, currentDeletingCollection, selectedCollection, isSubmitting]);

  const handleAddLinkToCollections = useCallback(
    async (collectionIds) => {
      if (isSubmitting) {
        alert("Please wait, request in progress...");
        return;
      }

      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await retryWithBackoff(async () => {
          return await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/link/${currentLinkToAdd._id}/collections`,
            { collectionIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        });

        if (response.data.success) {
          setLinks((prev) =>
            prev.map((link) =>
              link._id === currentLinkToAdd._id
                ? { ...link, collections: collectionIds }
                : link
            )
          );

          setCollections((prev) =>
            prev.map((col) => {
              if (collectionIds.includes(col._id)) {
                if (!col.links.includes(currentLinkToAdd._id)) {
                  return {
                    ...col,
                    links: [...col.links, currentLinkToAdd._id],
                  };
                }
              } else {
                if (col.links.includes(currentLinkToAdd._id)) {
                  return {
                    ...col,
                    links: col.links.filter(
                      (id) => id !== currentLinkToAdd._id
                    ),
                  };
                }
              }
              return col;
            })
          );

          setIsAddLinkModalOpen(false);
          setCurrentLinkToAdd(null);
        }
      } catch (err) {
        console.error("Add link to collection error:", err);
        if (err.response?.status === 429) {
          alert("Too many requests. Please wait a moment before trying again.");
        } else {
          const errorMessage =
            err.response?.data?.message || "Failed to update collections.";
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [user?._id, currentLinkToAdd?._id, isSubmitting]
  );

  const handleClearEmptyCollections = useCallback(async () => {
    const emptyCollections = collections.filter(
      (col) => !col.links || col.links.length === 0
    );

    if (emptyCollections.length === 0) {
      alert("No empty collections to remove.");
      return;
    }

    if (
      window.confirm(
        `Remove ${emptyCollections.length} empty collection${
          emptyCollections.length !== 1 ? "s" : ""
        }?`
      )
    ) {
      try {
        const token = localStorage.getItem("jwtToken");

        for (const collection of emptyCollections) {
          await retryWithBackoff(async () => {
            return await axios.delete(
              `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/collections/${collection._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          });
        }

        // Refresh data after bulk operation
        await fetchDashboardData(user._id);
      } catch (err) {
        console.error("Clear empty collections error:", err);
        alert("Failed to clear empty collections.");
      }
    }
  }, [collections, user?._id, fetchDashboardData]);

  // Handle filter changes
  const handleFiltersChange = useCallback(
    async (filters) => {
      // setActiveFilters(filters);

      // Check if any filters are active
      const hasActiveFilters = Object.values(filters).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "object") {
          return Object.values(value).some(
            (v) => v !== "" && v !== 0 && v !== 1
          );
        }
        return value !== "" && value !== "createdAt_desc";
      });

      if (hasActiveFilters) {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("jwtToken");
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId = payload.userId || payload.sub || payload.id;

          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/loggedin/${userId}/links/filter`,
            filters,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            setLinks(response.data.data.links);
            // console.log("Filtered links:", response.data.data.links.length);
          }
        } catch (error) {
          console.error("Error applying filters:", error);
          // Fallback to showing all links
          await fetchDashboardData(user?._id);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No active filters, fetch all data
        await fetchDashboardData(user?._id);
      }
    },
    [user?._id, fetchDashboardData]
  );

  // Handle bulk add to collection
  const handleBulkAddToCollection = useCallback(
    async (collectionId, linkIds) => {
      if (!collectionId || !linkIds || linkIds.length === 0) return;

      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("jwtToken");

        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/collections/${collectionId}/links/bulk-add`,
          { linkIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          // Refresh dashboard data to show updated collection assignments
          await fetchDashboardData(user._id);
          // console.log(`Added ${linkIds.length} links to collection`);
        }
      } catch (error) {
        console.error("Error adding links to collection:", error);
        alert("Failed to add links to collection. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [user?._id, fetchDashboardData]
  );

  // Filter data based on selected collection and search query
  const filteredData = useMemo(() => {
    let filtered = links;

    // console.log("Filtering data:", {
    //   selectedCollection,
    //   totalLinks: links.length,
    //   totalCollections: collections.length,
    //   searchQuery,
    //   sampleLink: links[0],
    //   sampleCollection: collections[0],
    // });

    if (selectedCollection === "uncategorized") {
      // Filter links that don't belong to any collection
      filtered = links.filter((link) => {
        // Check if the link has no collections array or empty collections array
        if (!link.collections || link.collections.length === 0) {
          return true;
        }
        // Also check if all collections in the link's collections array are invalid/removed
        const validCollections = link.collections.filter((collectionId) =>
          collections.some((col) => col._id === collectionId)
        );
        return validCollections.length === 0;
      });
      // console.log("Uncategorized links found:", filtered.length);
    } else if (selectedCollection !== "all") {
      const collection = collections.find((c) => c._id === selectedCollection);
      if (collection && collection.links) {
        const linkIdsInCollection = new Set(collection.links);
        filtered = links.filter((link) => linkIdsInCollection.has(link._id));
        // console.log(
        //   `Collection "${collection.name}" links found:`,
        //   filtered.length
        // );
      } else {
        filtered = []; // No links in this collection
        // console.log("No collection found or collection has no links");
      }
    } else {
      // console.log("Showing all links:", filtered.length);
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (link) =>
          link.longUrl.toLowerCase().includes(lowercasedQuery) ||
          `${process.env.REACT_APP_FRONTEND_URL}/linkly/${link.shortId}`
            .toLowerCase()
            .includes(lowercasedQuery)
      );
      // console.log("After search filter:", filtered.length);
    }

    return filtered;
  }, [links, searchQuery, selectedCollection, collections]);

  // Collection statistics
  const collectionStats = useMemo(() => {
    const totalLinks = links.length;
    const totalCollections = collections.length;
    const averageLinksPerCollection =
      totalCollections > 0 ? (totalLinks / totalCollections).toFixed(2) : 0;

    return {
      totalLinks,
      totalCollections,
      averageLinksPerCollection: parseFloat(averageLinksPerCollection),
    };
  }, [links, collections]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Collections Sidebar */}
      <CollectionsSidebar
        collections={collections}
        selectedCollection={selectedCollection}
        onCollectionSelect={(collectionId) => {
          // console.log("Collection selected:", collectionId);
          // console.log("Previous selection:", selectedCollection);
          setSelectedCollection(collectionId);
          // console.log("New selection set to:", collectionId);
        }}
        onCreateCollection={() => setIsCreateCollectionModalOpen(true)}
        onEditCollection={(collection) => {
          setCurrentEditingCollection(collection);
          setIsEditCollectionModalOpen(true);
        }}
        onDeleteCollection={(collection) => {
          setCurrentDeletingCollection(collection);
          setIsDeleteCollectionModalOpen(true);
        }}
        onClearEmptyCollections={handleClearEmptyCollections}
        totalLinks={links.length}
        collectionStats={collectionStats}
      />

      {/* Main Content */}
      <div className="dashboard-main">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateLink={() => setIsCreateLinkModalOpen(true)}
          totalLinks={filteredData.length}
          selectedCollection={selectedCollection}
        />

        <FilterBar
          onFiltersChange={handleFiltersChange}
          isOpen={isFilterBarOpen}
          onToggle={() => setIsFilterBarOpen(!isFilterBarOpen)}
        />

        <LinkTable
          links={filteredData}
          user={user}
          onEditStart={handleEditStart}
          onDelete={handleDelete}
          onAddToCollection={handleAddToCollection}
          onViewAnalysis={handleViewAnalysis}
          selectedCollection={selectedCollection}
          onBulkAddToCollection={handleBulkAddToCollection}
          collections={collections}
        />
      </div>

      {/* Modals */}
      <DetailsModal
        isOpen={isDetailsModalOpen}
        link={currentLinkDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <EditModal
        isOpen={isEditModalOpen}
        longUrl={currentEditing?.longUrl}
        shortUrl={
          currentEditing
            ? `${process.env.REACT_APP_FRONTEND_URL}/linkly/${currentEditing.shortId}`
            : ""
        }
        onSave={handleEditSave}
        onCancel={() => {
          setIsEditModalOpen(false);
          setCurrentEditing(null);
        }}
      />

      <CreateLinkModal
        isOpen={isCreateLinkModalOpen}
        onClose={() => setIsCreateLinkModalOpen(false)}
        onSave={handleCreateLink}
        isSubmitting={isSubmitting}
      />

      <CreateCollectionModal
        isOpen={isCreateCollectionModalOpen}
        onClose={() => setIsCreateCollectionModalOpen(false)}
        onSave={handleCreateCollection}
        isSubmitting={isSubmitting}
      />

      <AddToCollectionModal
        isOpen={isAddLinkModalOpen}
        onClose={() => {
          setIsAddLinkModalOpen(false);
          setCurrentLinkToAdd(null);
        }}
        collections={collections}
        onSave={handleAddLinkToCollections}
        link={currentLinkToAdd}
      />

      <EditCollectionModal
        isOpen={isEditCollectionModalOpen}
        collection={currentEditingCollection}
        onClose={() => {
          setIsEditCollectionModalOpen(false);
          setCurrentEditingCollection(null);
        }}
        onSave={handleEditCollection}
      />

      <DeleteCollectionModal
        isOpen={isDeleteCollectionModalOpen}
        collection={currentDeletingCollection}
        onClose={() => {
          setIsDeleteCollectionModalOpen(false);
          setCurrentDeletingCollection(null);
        }}
        onConfirm={handleDeleteCollection}
      />
    </div>
  );
};

export default Dashboard_Loginned;
