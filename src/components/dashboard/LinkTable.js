import React, { useMemo, useState } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { IoQrCodeOutline, IoEye } from "react-icons/io5";
import { IoMdCreate, IoMdTrash } from "react-icons/io";
import {
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFolderPlus,
} from "react-icons/fa";
import BulkCollectionModal from "./modals/BulkCollectionModal";

const LinkTable = ({
  links,
  user,
  onEditStart,
  onDelete,
  onAddToCollection,
  onViewAnalysis,
  selectedCollection,
  onBulkAddToCollection,
  collections,
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isBulkCollectionModalOpen, setIsBulkCollectionModalOpen] =
    useState(false);

  // Add select all functionality
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = links.map((link) => link._id);
      setSelectedRows(new Set(allIds));
      console.log("Select all checked:", allIds);
    } else {
      setSelectedRows(new Set());
      console.log("Select all unchecked");
    }
  };

  // Create columns outside of useTable to prevent infinite re-renders
  const columns = useMemo(
    () => [
      {
        Header: "Select",
        id: "selection",
        Cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.has(row.original._id)}
            onChange={(e) => {
              const newSelected = new Set(selectedRows);
              if (e.target.checked) {
                newSelected.add(row.original._id);
                console.log("Row selected:", row.original._id);
              } else {
                newSelected.delete(row.original._id);
                console.log("Row deselected:", row.original._id);
              }
              setSelectedRows(newSelected);
              console.log("Updated selected rows:", Array.from(newSelected));
            }}
          />
        ),
        width: 50,
      },
      {
        Header: "Short Link",
        accessor: "shortId",
        Cell: ({ row }) => (
          <a
            href={`${process.env.REACT_APP_FRONTEND_URL}/linkly/${row.original.shortId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="short-link"
          >
            {`${process.env.REACT_APP_FRONTEND_URL}/linkly/${row.original.shortId}`}
          </a>
        ),
      },
      {
        Header: "Long Link",
        accessor: "longUrl",
        Cell: ({ value }) => (
          <div className="long-link-cell">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              title={value}
              className="long-link"
            >
              {value}
            </a>
          </div>
        ),
      },
      {
        Header: "Clicks",
        accessor: "viewerCount",
        Cell: ({ value }) => <span className="click-count">{value || 0}</span>,
      },
      {
        Header: "QR Code",
        id: "qrCode",
        Cell: ({ row }) => {
          const isPremium =
            user &&
            user.subscription === "Premium" &&
            new Date(user.endDateOfSubscription) > new Date();

          if (!isPremium) return <span className="premium-required">-</span>;

          return (
            <a
              href={`${process.env.REACT_APP_FRONTEND_URL}/linkly/qr/${row.original.shortId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="qr-code-link"
              title="View QR Code"
            >
              <IoQrCodeOutline />
            </a>
          );
        },
      },
      {
        Header: "AI Status",
        accessor: "analysisStatus",
        Cell: ({ value }) => (
          <div className="ai-status-cell">
            {value === "PENDING" && (
              <FaSpinner
                className="animate-spin"
                title="Analysis in progress..."
              />
            )}
            {value === "COMPLETED" && (
              <FaCheckCircle
                className="status-completed"
                title="Analysis complete"
              />
            )}
            {value === "FAILED" && (
              <FaExclamationTriangle
                className="status-failed"
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
          <div className="action-buttons">
            <button
              title="Add to Collection"
              onClick={() => onAddToCollection(row.original)}
              className="action-btn add-to-collection-btn"
            >
              <FaFolderPlus />
            </button>
            <button
              title="View AI Analysis"
              onClick={() => onViewAnalysis(row.original)}
              className="action-btn view-analysis-btn"
            >
              <IoEye />
            </button>
            <button
              title="Edit"
              onClick={() => onEditStart(row.original)}
              className="action-btn edit-btn"
            >
              <IoMdCreate />
            </button>
            <button
              title="Delete"
              onClick={() => onDelete(row.original)}
              className="action-btn delete-btn"
            >
              <IoMdTrash />
            </button>
          </div>
        ),
      },
    ],
    [
      user,
      onEditStart,
      onDelete,
      onAddToCollection,
      onViewAnalysis,
      selectedRows,
    ]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: links,
      initialState: { pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  const handleBulkAction = (action) => {
    const selectedLinkIds = Array.from(selectedRows);

    switch (action) {
      case "delete":
        if (
          window.confirm(
            `Are you sure you want to delete ${selectedLinkIds.length} selected links?`
          )
        ) {
          selectedLinkIds.forEach((linkId) => {
            const link = links.find((l) => l._id === linkId);
            if (link) onDelete(link);
          });
          setSelectedRows(new Set());
        }
        break;
      case "add-to-collection":
        // Open modal to select collection for bulk add
        if (selectedLinkIds.length > 0) {
          setIsBulkCollectionModalOpen(true);
        }
        break;
      default:
        break;
    }
  };

  // Custom header for selection column
  const SelectionHeader = () => {
    const allVisibleSelected =
      page.length > 0 &&
      page.every((row) => selectedRows.has(row.original._id));
    const someVisibleSelected = page.some((row) =>
      selectedRows.has(row.original._id)
    );

    return (
      <input
        type="checkbox"
        checked={allVisibleSelected}
        ref={(input) => {
          if (input) {
            input.indeterminate = someVisibleSelected && !allVisibleSelected;
          }
        }}
        onChange={(e) => handleSelectAll(e.target.checked)}
        className="select-all-checkbox"
      />
    );
  };

  return (
    <div className="link-table-container">
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="bulk-actions-bar">
          <span className="selected-count">
            {selectedRows.size} link{selectedRows.size !== 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="bulk-actions">
            <button
              onClick={() => handleBulkAction("add-to-collection")}
              className="bulk-action-btn"
            >
              <FaFolderPlus /> Add to Collection
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="bulk-action-btn delete"
            >
              <IoMdTrash /> Delete Selected
            </button>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="bulk-action-btn clear"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table {...getTableProps()} className="link-table">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="table-header"
                  >
                    {column.id === "selection" ? (
                      <SelectionHeader />
                    ) : (
                      column.render("Header")
                    )}
                    {column.isSorted && (
                      <span className="sort-indicator">
                        {column.isSortedDesc ? " ↓" : " ↑"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className={`table-row ${
                    selectedRows.has(row.original._id) ? "selected" : ""
                  }`}
                >
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="table-cell">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="pagination">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="pagination-btn"
          >
            {"<<"}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="pagination-btn"
          >
            {"<"}
          </button>
          <span className="pagination-info">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="pagination-btn"
          >
            {">"}
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="pagination-btn"
          >
            {">>"}
          </button>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="page-size-select"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bulk Collection Selection Modal */}
      <BulkCollectionModal
        isOpen={isBulkCollectionModalOpen}
        collections={collections}
        selectedLinkIds={Array.from(selectedRows)}
        onClose={() => setIsBulkCollectionModalOpen(false)}
        onConfirm={(collectionId, linkIds) => {
          if (onBulkAddToCollection) {
            onBulkAddToCollection(collectionId, linkIds);
            setSelectedRows(new Set());
          }
        }}
      />
    </div>
  );
};

export default LinkTable;
