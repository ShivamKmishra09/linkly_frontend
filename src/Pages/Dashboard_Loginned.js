import React, { useState } from "react";
import { useLinks, useDeleteLink } from "../hooks/useDashboard";
import { FaSpinner, FaTrash, FaExternalLinkAlt } from "react-icons/fa";

const Dashboard_Loginned = () => {
  const [search, setSearch] = useState("");

  // 1. Data Fetching (Managed by React Query)
  const { data, isLoading, isError } = useLinks({ search });

  // 2. Mutations
  const deleteLink = useDeleteLink();

  if (isLoading)
    return (
      <div className="text-white text-center mt-10">Loading your brain...</div>
    );
  if (isError)
    return (
      <div className="text-red-500 text-center mt-10">
        Failed to load links.
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search links..."
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Link Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.links?.map((link) => (
          <div
            key={link._id}
            className="bg-gray-800 p-4 rounded border border-gray-700 relative group"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <h3
                className="font-bold text-white text-lg truncate"
                title={link.customAlias}
              >
                {link.customAlias || link.shortCode}
              </h3>
              <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                {link.domain}
              </span>
            </div>

            {/* Long URL */}
            <p className="text-gray-400 text-sm truncate mb-3">
              {link.metaId?.longUrl}
            </p>

            {/* Status & Actions */}
            <div className="flex justify-between items-center mt-4">
              {/* AI Status Badge */}
              {link.metaId?.aiData?.status === "PENDING" ? (
                <span className="flex items-center text-yellow-500 text-xs gap-1">
                  <FaSpinner className="animate-spin" /> Analyzing
                </span>
              ) : (
                <span className="text-green-500 text-xs">Safe</span>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    window.open(
                      `${process.env.REACT_APP_BACKEND_URL}/${link.shortCode}`,
                      "_blank"
                    )
                  }
                  className="text-blue-400 hover:text-blue-300"
                >
                  <FaExternalLinkAlt />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Delete this link?")) {
                      deleteLink.mutate(link._id);
                    }
                  }}
                  disabled={deleteLink.isPending}
                  className="text-red-500 hover:text-red-400"
                >
                  {deleteLink.isPending ? "..." : <FaTrash />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard_Loginned;
