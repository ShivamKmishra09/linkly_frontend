import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const redirect_register = () => {
    try {
      window.location.href = "/signup";
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let resp = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/login`,
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      if (resp.status === 200) {
        const token = resp.data.token;
        const previousToken = localStorage.getItem("jwtToken");
        if (previousToken) {
          // If a previous token exists, remove it
          localStorage.removeItem("jwtToken");
        }

        // Store the new token in localStorage
        localStorage.setItem("jwtToken", token);
        alert("You have been Logged in!!");
        window.location.href = "/home";
      }
    } catch (err) {
      alert("Error signing in", err);
      console.log(err);
    }
  };

  const responseGoogle = async (response) => {
    try {
      const decoded = jwtDecode(response.credential);
      const { email, name } = decoded;

      try {
        const resp = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/google-auth`,
          {
            email,
            username: name,
          },
          {
            withCredentials: true,
          }
        );

        if (resp.status === 200) {
          const token = resp.data.token;
          localStorage.setItem("jwtToken", token);
          alert("You have been Logged in!!");
          window.location.href = "/home";
        }
      } catch (loginErr) {
        alert("Error signing in with Google", loginErr);
        console.log(loginErr);
      }
    } catch (decodeErr) {
      console.error("JWT decode error:", decodeErr);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Container className="login-box">
      <h1>Welcome Back</h1>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <div className="google-loginbox">
          <GoogleLogin
            buttonText="Login with Google"
            onSuccess={responseGoogle}
            onError={(err) => {
              if (err.error === "popup_closed_by_user") {
                alert("Popup closed by user before completing login.");
              } else if (err.error === "idpiframe_initialization_failed") {
                alert(
                  "Initialization failed. Please check your Client ID and authorized origins."
                );
              } else {
                console.error("Google login error:", err);
              }
            }}
          />
        </div>
      </GoogleOAuthProvider>
      <div className="login-form">
        <h3 className="emailSignin">Sign in with your email</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group controlId="formBasicEmail">
            <Form.Control
              className="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group
            controlId="formBasicPassword"
            style={{ position: "relative" }}
          >
            <Form.Control
              className="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#999",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </Form.Group>

          <Button className="login-button" type="submit" variant="primary">
            Login
          </Button>
        </Form>
      </div>
      <div className="noaccount">
        <p>
          Don't have an account ?{" "}
          <span className="gotosignup" onClick={redirect_register}>
            Sign Up
          </span>
        </p>
      </div>
    </Container>
  );
};

export default LoginPage;
