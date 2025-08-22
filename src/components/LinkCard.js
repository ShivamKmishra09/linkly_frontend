import React from "react";
import {
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTag,
} from "react-icons/fa";

// A simple function to determine the color for the safety score
const getSafetyColor = (rating) => {
  if (rating >= 8) return "text-green-500"; // Safe
  if (rating >= 5) return "text-yellow-500"; // Moderate
  return "text-red-500"; // Potentially Unsafe
};

const LinkCard = ({ link }) => {
  // Construct the full short URL to be displayed and copied
  const fullShortUrl = `${process.env.REACT_APP_FRONTEND_URL}/linkly/${link.shortId}`;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        {/* URLs */}
        <div className="flex-grow">
          <p className="font-semibold text-blue-600 truncate">
            <a href={fullShortUrl} target="_blank" rel="noopener noreferrer">
              {fullShortUrl}
            </a>
          </p>
          <p className="text-sm text-gray-500 truncate">{link.longUrl}</p>
        </div>
        {/* Analysis Status Icon */}
        <div className="flex-shrink-0 ml-4">
          {link.analysisStatus === "PENDING" && (
            <FaSpinner
              className="animate-spin text-gray-400"
              title="Analysis in progress..."
            />
          )}
          {link.analysisStatus === "COMPLETED" && (
            <FaCheckCircle
              className="text-green-500"
              title="Analysis complete"
            />
          )}
          {link.analysisStatus === "FAILED" && (
            <FaExclamationTriangle
              className="text-red-500"
              title="Analysis failed"
            />
          )}
        </div>
      </div>

      {/* AI Analysis Section - only shown when complete */}
      {link.analysisStatus === "COMPLETED" && (
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-700 mb-2">
            <strong>AI Summary:</strong> {link.aiSummary}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-600">
            {/* Tags */}
            <div className="flex items-center space-x-2">
              <FaTag />
              {link.aiTags.map((tag) => (
                <span key={tag} className="bg-gray-200 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            {/* Safety Score */}
            <div
              className={`flex items-center space-x-1 font-bold ${getSafetyColor(
                link.aiSafetyRating
              )}`}
            >
              <FaShieldAlt />
              <span>Safety: {link.aiSafetyRating}/10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkCard;
