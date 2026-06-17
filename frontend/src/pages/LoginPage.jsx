import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill username on page load if it was saved
  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    const wasRemembered = localStorage.getItem("rememberMe") === "true";

    if (savedUsername) {
      setUsername(savedUsername);
    }

    if (savedPassword && wasRemembered) {
      setPassword(savedPassword);
    }

    if (wasRemembered) {
      setRememberMe(true);
    }
  }, []);

  // Auto-save form data to localStorage as user types
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    localStorage.setItem("savedUsername", value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
  };

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    
    if (isChecked) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => {
        throw new Error("Invalid response from server");
      });

      if (!response.ok) {
        throw new Error(data.error || `Login failed (${response.status})`);
      }

      console.log("Login successful:", data);

      // Store user info and token
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Extract redirect URL from query params, or default to "/"
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || "/";

      // Force full page reload so Navbar picks up the new user from localStorage
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err.message || "An error occurred during login. Please check if the backend is running.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            <label htmlFor="rememberMe">Remember me & save password</label>
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <a href="/register">Sign up here</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
