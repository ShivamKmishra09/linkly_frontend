import React from "react";
import { useSearchParams } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const WarningPage = () => {
  const [searchParams] = useSearchParams();
  const destinationUrl = searchParams.get("destination");
  const reason = searchParams.get("reason");

  const handleContinue = () => {
    if (destinationUrl) {
      window.location.href = destinationUrl;
    }
  };

  const handleGoBack = () => {
    // A simple way to go back, or you can redirect to the homepage
    window.history.back();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#181E29",
        color: "white",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <FaExclamationTriangle style={{ fontSize: "5em", color: "#ffc107" }} />
      <h1 style={{ color: "#ffc107", marginTop: "20px" }}>
        Warning: Potentially Unsafe Link
      </h1>
      <p style={{ maxWidth: "600px", color: "#ccc", marginTop: "10px" }}>
        Our AI analysis has flagged this link as potentially unsafe for the
        following reason:
      </p>
      <p
        style={{
          maxWidth: "600px",
          color: "#fff",
          fontStyle: "italic",
          backgroundColor: "#222938",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "10px",
          border: "1px solid #353C4A",
        }}
      >
        "{reason || "No specific reason provided."}"
      </p>
      <p style={{ maxWidth: "600px", color: "#ccc", marginTop: "20px" }}>
        You can choose to go back to safety or proceed to the destination at
        your own risk.
      </p>
      <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
        <button
          onClick={handleGoBack}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            border: "1px solid #fff",
            backgroundColor: "transparent",
            color: "white",
            borderRadius: "5px",
          }}
        >
          Go Back
        </button>
        <button
          onClick={handleContinue}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            border: "none",
            backgroundColor: "#dc3545",
            color: "white",
            borderRadius: "5px",
          }}
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
};

export default WarningPage;
