import React, { useEffect, useMemo, useState } from "react";
import { useTable } from "react-table";
import { IoCopy } from "react-icons/io5";
import { useMediaQuery } from "react-responsive";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoQrCodeOutline } from "react-icons/io5";
import {
  IoMdCreate,
  IoMdTrash,
  IoMdCheckmark,
  IoMdClose,
} from "react-icons/io";
import axios from "axios";

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
        <h3 style={{ color: "#fff", marginTop: 0 }}>Edit URL</h3>

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
            onClick={() => onCancel()}
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
  const isMobile = useMediaQuery({ query: "(max-width: 760px)" });
  const [urls, setUrls] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState({
    index: null,
    shortUrl: "",
    longUrl: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/authenticate`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          return response.data.user;
        } else {
          throw new Error("Not authenticated");
        }
      } catch (err) {
        console.log(err);
        window.location.href = "/login";
        return null;
      }
    };

    const fetchUrls = async (user) => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/urls`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const transformedUrls = response.data.urls.newLink.map(
            (newLink, index) => ({
              shortUrl: newLink,
              longUrl: response.data.urls.oldLink[index],
              qrCode:
                user.subscription === "Free" ||
                user.subscription === null ||
                new Date(user.endDateOfSubscription) < new Date()
                  ? "-"
                  : `${
                      process.env.REACT_APP_FRONTEND_URL ||
                      window.location.origin
                    }/linkly/qr/${newLink.split("/").pop()}`,
              clicks:
                user.subscription === "Free" ||
                user.subscription === null ||
                new Date(user.endDateOfSubscription) < new Date()
                  ? "-"
                  : user.Viewer[index] || 0,
            })
          );
          return transformedUrls;
        } else {
          throw new Error("Failed to fetch URLs");
        }
      } catch (error) {
        console.error("Error fetching URLs:", error);
        return [];
      }
    };

    const fetchData = async () => {
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
        const urlsData = await fetchUrls(userData);
        setUrls(urlsData);
      }
    };

    // Fetch initial data AND whenever refresh prop changes
    fetchData();
  }, [refresh]);

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} style={{ backgroundColor: "yellow" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const sortedUrls = useMemo(() => {
    return [...urls].sort((a, b) => {
      const clicksA = a.clicks === "-" ? 0 : a.clicks;
      const clicksB = b.clicks === "-" ? 0 : b.clicks;
      if (clicksB !== clicksA) return clicksB - clicksA;
      if (a.longUrl.length !== b.longUrl.length)
        return a.longUrl.length - b.longUrl.length;
      return 0;
    });
  }, [urls]);

  const filteredData = useMemo(
    () =>
      sortedUrls.filter(
        (url) =>
          url.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.longUrl.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [sortedUrls, searchQuery]
  );

  async function handleDelete(shortUrl) {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/url`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { shortUrl },
        }
      );
      setUrls(urls.filter((u) => u.shortUrl !== shortUrl));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete link.");
    }
  }

  function handleEditStart(idx, shortUrl, longUrl) {
    setCurrentEditing({ index: idx, shortUrl, longUrl });
    setIsEditModalOpen(true);
  }

  async function handleEditSave(newLongUrl) {
    if (!user) return;
    if (
      !newLongUrl.startsWith("http://") &&
      !newLongUrl.startsWith("https://")
    ) {
      alert("Long URL must start with http:// or https://");
      return;
    }

    const idx = currentEditing.index;
    const shortUrl = currentEditing.shortUrl;

    if (urls.some((u, i) => i !== idx && u.longUrl === newLongUrl)) {
      alert("This long URL already exists.");
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/url`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { shortUrl },
        }
      );

      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/redirect`,
        { oldLink: newLongUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/authenticate`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (userData.status === 200) {
        const user = userData.data.user;
        const urlsResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/loggedin/${user._id}/urls`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (urlsResponse.status === 200) {
          setUrls(() => {
            const transformedUrls = urlsResponse.data.urls.newLink.map(
              (newLink, index) => ({
                shortUrl: newLink,
                longUrl: urlsResponse.data.urls.oldLink[index],
                qrCode:
                  user.subscription === "Free" ||
                  user.subscription === null ||
                  new Date(user.endDateOfSubscription) < new Date()
                    ? "-"
                    : `${
                        process.env.REACT_APP_FRONTEND_URL ||
                        window.location.origin
                      }/linkly/qr/${newLink.split("/").pop()}`,
                clicks:
                  user.subscription === "Free" ||
                  user.subscription === null ||
                  new Date(user.endDateOfSubscription) < new Date()
                    ? "-"
                    : user.Viewer[index] || 0,
              })
            );
            return transformedUrls;
          });
        }
      }

      setIsEditModalOpen(false);
      setCurrentEditing({ index: null, shortUrl: "", longUrl: "" });
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to edit long URL.");
    }
  }

  function handleEditCancel() {
    setIsEditModalOpen(false);
    setCurrentEditing({ index: null, shortUrl: "", longUrl: "" });
  }

  const dashboardColumns = useMemo(
    () => [
      {
        Header: "Short Link",
        accessor: "shortUrl",
        Cell: ({ cell: { value } }) => (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {highlightText(value, searchQuery)}
          </a>
        ),
      },
      {
        Header: "Long Link",
        accessor: "longUrl",
        Cell: ({ cell: { value } }) => (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {highlightText(value, searchQuery)}
          </a>
        ),
      },
      {
        Header: "QR Code",
        accessor: "qrCode",
        Cell: ({ cell: { value } }) =>
          value === "-" ? (
            "-"
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <IoQrCodeOutline style={{ fontSize: "24px" }} />
            </a>
          ),
      },
      {
        Header: "Clicks",
        accessor: "clicks",
        Cell: ({ cell: { value } }) => value,
      },
      {
        Header: "Actions",
        id: "actions",
        Cell: ({ row }) => (
          <div
            style={{ display: "flex", justifyContent: "center", gap: "8px" }}
          >
            <button
              title="Edit"
              onClick={() =>
                handleEditStart(
                  row.index,
                  row.original.shortUrl,
                  row.original.longUrl
                )
              }
              style={{
                background: "none",
                border: "none",
                color: "#144EE3",
                cursor: "pointer",
              }}
            >
              <IoMdCreate />
            </button>
            <button
              title="Delete"
              onClick={() => handleDelete(row.original.shortUrl)}
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
    [searchQuery]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns: dashboardColumns,
      data: filteredData,
    });

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert(text + " copied to clipboard");
  }

  return (
    <div style={{ width: "80%", margin: "auto", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>
      <table
        {...getTableProps()}
        className="table"
        style={{ width: "100%", alignItems: "center" }}
      >
        <thead
          style={{
            backgroundColor: "#181E29",
            height: "40px",
            border: "1px solid #181E29",
            borderRadius: "15px 15px 0 0",
          }}
        >
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
                style={{ border: "1px solid #353C4A" }}
              >
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        margin: "auto",
                        padding: "auto",
                        textAlign: "center",
                      }}
                    >
                      {cell.column.id === "shortUrl" && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {cell.render("Cell")}
                          <button
                            onClick={() => copyToClipboard(cell.value)}
                            style={{
                              marginLeft: "10px",
                              backgroundColor: "#181E29",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <IoCopy />
                          </button>
                        </div>
                      )}
                      {cell.column.id === "longUrl" && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {cell.render("Cell")}
                          <button
                            onClick={() => copyToClipboard(cell.value)}
                            style={{
                              marginLeft: "10px",
                              backgroundColor: "#181E29",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <IoCopy />
                          </button>
                        </div>
                      )}
                      {cell.column.id !== "shortUrl" &&
                        cell.column.id !== "longUrl" &&
                        cell.render("Cell")}
                      {isMobile && (
                        <button
                          style={{
                            marginLeft: "120px",
                            backgroundColor: "#0B101B",
                            marginRight: "-180px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <IoIosArrowDropdown />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <EditModal
        isOpen={isEditModalOpen}
        shortUrl={currentEditing.shortUrl}
        longUrl={currentEditing.longUrl}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
      />
    </div>
  );
};

export default Dashboard_Loginned;
