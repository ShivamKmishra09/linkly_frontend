import React, { useEffect, useMemo, useState } from "react";
import { useTable } from "react-table";
import { IoCopy, IoQrCodeOutline, IoEye } from "react-icons/io5";
import {
  IoMdCreate,
  IoMdTrash,
  IoMdCheckmark,
  IoMdClose,
} from "react-icons/io";
import {
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTag,
} from "react-icons/fa";
import axios from "axios";

// --- DetailsModal Component (for AI Analysis) ---
const DetailsModal = ({ isOpen, link, onClose }) => {
  if (!isOpen || !link) return null;

  const getSafetyColor = (rating) => {
    if (rating >= 4) return "#28a745";
    if (rating >= 3) return "#ffc107";
    return "#dc3545";
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.75) return "#28a745";
    if (confidence >= 0.5) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#181E29",
          padding: "25px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "600px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          border: "1px solid #353C4A",
        }}
      >
        <h3
          style={{
            color: "#fff",
            marginTop: 0,
            borderBottom: "1px solid #353C4A",
            paddingBottom: "10px",
          }}
        >
          AI Link Analysis
        </h3>

        {link.analysisStatus === "PENDING" && (
          <div style={{ color: "#ccc", textAlign: "center", padding: "20px" }}>
            <FaSpinner className="animate-spin" /> Analysis is in progress...
          </div>
        )}

        {link.analysisStatus === "FAILED" && (
          <div
            style={{ color: "#dc3545", textAlign: "center", padding: "20px" }}
          >
            <FaExclamationTriangle /> Analysis could not be completed for this
            link.
          </div>
        )}

        {link.analysisStatus === "COMPLETED" && (
          <div>
            {/* Summary */}
            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#fff" }}>AI Summary:</strong>
              <p
                style={{
                  color: "#ccc",
                  margin: "5px 0 0 0",
                  fontStyle: "italic",
                }}
              >
                "{link.aiSummary}"
              </p>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#fff" }}>Content Tags:</strong>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "5px",
                }}
              >
                {(link.aiTags || []).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "#353C4A",
                      color: "#fff",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Safety Analysis */}
            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#fff" }}>Safety Analysis:</strong>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "5px",
                }}
              >
                <FaShieldAlt
                  style={{
                    color: getSafetyColor(link.aiSafetyRating),
                    fontSize: "24px",
                  }}
                />
                <div>
                  <div
                    style={{
                      color: getSafetyColor(link.aiSafetyRating),
                      fontWeight: "bold",
                    }}
                  >
                    Safety Score: {link.aiSafetyRating}/5
                  </div>
                  <div style={{ color: "#ccc", fontSize: "12px" }}>
                    {link.aiSafetyJustification}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Classification */}
            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#fff" }}>Content Classification:</strong>
              <div
                style={{
                  marginTop: "5px",
                  backgroundColor: "#353C4A",
                  borderRadius: "6px",
                  padding: "10px",
                }}
              >
                <div style={{ color: "#fff", fontWeight: "bold" }}>
                  Category: {link.aiClassification?.category || "Other"}
                </div>
                <div
                  style={{
                    color: getConfidenceColor(
                      link.aiClassification?.confidence
                    ),
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  Confidence:{" "}
                  {Math.round((link.aiClassification?.confidence || 0) * 100)}%
                </div>
                <div
                  style={{ color: "#ccc", fontSize: "12px", marginTop: "6px" }}
                >
                  {link.aiClassification?.reason ||
                    "Analysis has not been completed."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#144EE3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 15px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- EditModal Component (Unchanged) ---
const EditModal = ({ isOpen, longUrl, shortUrl, onSave, onCancel }) => {
  const [editValue, setEditValue] = useState(longUrl);
  useEffect(() => {
    setEditValue(longUrl);
  }, [longUrl]);
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#181E29",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ color: "#fff", marginTop: 0 }}>Edit Destination URL</h3>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ color: "#fff", display: "block", marginBottom: "5px" }}
          >
            Short URL (Read-only):
          </label>
          <input
            value={shortUrl}
            readOnly
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#222",
              color: "#ccc",
              border: "1px solid #444",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{ color: "#fff", display: "block", marginBottom: "5px" }}
          >
            Long URL:
          </label>
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#222",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "4px",
            }}
          />
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button
            onClick={onCancel}
            style={{
              backgroundColor: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoMdClose style={{ marginRight: "5px" }} /> Cancel
          </button>
          <button
            onClick={() => onSave(editValue)}
            style={{
              backgroundColor: "#144EE3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoMdCheckmark style={{ marginRight: "5px" }} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard_Loginned = ({ refresh }) => {
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentLinkDetails, setCurrentLinkDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const authResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/authenticate`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(authResponse.data.user);
      const linksResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/loggedin/${authResponse.data.user._id}/urls`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLinks(linksResponse.data.urls);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [refresh]);

  const handleDelete = async (linkToDelete) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/url/${linkToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLinks((prevLinks) =>
        prevLinks.filter((link) => link._id !== linkToDelete._id)
      );
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete link.");
    }
  };

  const handleEditStart = (linkToEdit) => {
    setCurrentEditing(linkToEdit);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (newLongUrl) => {
    if (
      !newLongUrl ||
      (!newLongUrl.startsWith("http://") && !newLongUrl.startsWith("https://"))
    ) {
      return alert(
        "Please enter a valid URL starting with http:// or https://"
      );
    }
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/url/${currentEditing._id}`,
        { newLongUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
  };

  const filteredData = useMemo(
    () =>
      links.filter(
        (link) =>
          link.longUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${process.env.REACT_APP_FRONTEND_URL}/linkly/${link.shortId}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      ),
    [links, searchQuery]
  );

  const dashboardColumns = useMemo(
    () => [
      {
        Header: "Short Link",
        accessor: "shortId",
        Cell: ({ row }) => {
          const fullUrl = `${process.env.REACT_APP_FRONTEND_URL}/linkly/${row.original.shortId}`;
          return (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
              {fullUrl}
            </a>
          );
        },
      },
      {
        Header: "Long Link",
        accessor: "longUrl",
        Cell: ({ value }) => (
          <div
            style={{
              maxWidth: "300px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              title={value}
            >
              {value}
            </a>
          </div>
        ),
      },
      { Header: "Clicks", accessor: "viewerCount" },
      {
        Header: "QR Code",
        id: "qrCode",
        Cell: ({ row }) => {
          const isPremium =
            user &&
            user.subscription === "Premium" &&
            new Date(user.endDateOfSubscription) > new Date();
          if (!isPremium) return "-";
          const qrUrl = `${process.env.REACT_APP_FRONTEND_URL}/linkly/qr/${row.original.shortId}`;
          return (
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IoQrCodeOutline style={{ fontSize: "24px" }} />
            </a>
          );
        },
      },
      {
        Header: "AI Status",
        accessor: "analysisStatus",
        Cell: ({ value }) => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {value === "PENDING" && (
              <FaSpinner
                className="animate-spin"
                title="Analysis in progress..."
              />
            )}
            {value === "COMPLETED" && (
              <FaCheckCircle
                style={{ color: "green" }}
                title="Analysis complete"
              />
            )}
            {value === "FAILED" && (
              <FaExclamationTriangle
                style={{ color: "red" }}
                title="Analysis failed"
              />
            )}
          </div>
        ),
      },
      {
        Header: "Actions",
        id: "actions",
        Cell: ({ row }) => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              fontSize: "20px",
            }}
          >
            <button
              title="View AI Analysis"
              onClick={() => {
                setCurrentLinkDetails(row.original);
                setIsDetailsModalOpen(true);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#144EE3",
                cursor: "pointer",
              }}
            >
              <IoEye />
            </button>
            <button
              title="Edit"
              onClick={() => handleEditStart(row.original)}
              style={{
                background: "none",
                border: "none",
                color: "orange",
                cursor: "pointer",
              }}
            >
              <IoMdCreate />
            </button>
            <button
              title="Delete"
              onClick={() => handleDelete(row.original)}
              style={{
                background: "none",
                border: "none",
                color: "red",
                cursor: "pointer",
              }}
            >
              <IoMdTrash />
            </button>
          </div>
        ),
      },
    ],
    [user] // user is a dependency for the QR code logic
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns: dashboardColumns, data: filteredData });

  if (isLoading) {
    return (
      <div style={{ color: "white", textAlign: "center", paddingTop: "50px" }}>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div style={{ width: "95%", margin: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search links..."
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #353C4A",
            backgroundColor: "#181E29",
            color: "white",
            minWidth: "300px",
          }}
        />
      </div>

      <table
        {...getTableProps()}
        className="table"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead style={{ backgroundColor: "#181E29" }}>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  style={{
                    padding: "12px",
                    borderBottom: "1-px solid #353C4A",
                  }}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                style={{ borderBottom: "1px solid #353C4A" }}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    style={{ padding: "12px", textAlign: "center" }}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

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
    </div>
  );
};

export default Dashboard_Loginned;
