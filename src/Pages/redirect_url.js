import React, { useEffect } from "react";
import { FaSpinner } from "react-icons/fa";

const Redirect_URL = () => {
  useEffect(() => {
    // This function will now be much simpler.
    const handleRedirect = () => {
      // 1. Get the short code (e.g., "abcde") from the browser's URL.
      const currentUrl = window.location.href;
      const webId = currentUrl.substring(
        currentUrl.indexOf("linkly/") + "linkly/".length
      );

      // 2. If we have a webId, construct the full backend URL.
      if (webId) {
        // 3. Directly navigate the browser to the backend endpoint.
        // The backend will now handle the 302 redirect automatically.
        // The browser will follow it to the final long URL.
        // No 'fetch' or API call is needed from the frontend anymore.
        window.location.href = `${process.env.REACT_APP_BACKEND_URL}/linkly/${webId}`;
      } else {
        console.error("Could not extract a valid webId from the URL.");
        // Optional: Redirect to a 'not found' page or the homepage.
        // window.location.href = '/not-found';
      }
    };

    handleRedirect();
  }, []); // The empty dependency array ensures this runs only once.

  // This loading spinner is perfect. It will show while the browser
  // is being redirected by the backend.
  return (
    <div
      className="Loader_icon_1"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <FaSpinner className="loading-spinner" style={{ fontSize: "5em" }} />
      <div className="loading-text">
        <h1>Redirecting...</h1>
      </div>
    </div>
  );
};

export default Redirect_URL;
