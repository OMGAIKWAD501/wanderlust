import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill form data on page load
  useEffect(() => {
    const savedUsername = localStorage.getItem("registerUsername");
    const savedEmail = localStorage.getItem("registerEmail");
    
    if (savedUsername) setUsername(savedUsername);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // Auto-save form data to localStorage as user types
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    localStorage.setItem("registerUsername", value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    localStorage.setItem("registerEmail", value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json().catch(() => {
        throw new Error("Invalid response from server");
      });

      if (!response.ok) {
        throw new Error(data.error || `Registration failed (${response.status})`);
      }

      console.log("Registration successful:", data);
      
      // Store user info and token
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      // Clear saved form data on successful registration
      localStorage.removeItem("registerUsername");
      localStorage.removeItem("registerEmail");
      
      // Extract redirect URL from query params, or default to "/"
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || "/";

      // Redirect to home page (full reload so Navbar picks up user)
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err.message || "An error occurred during registration. Please check if the backend is running.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create Account</h1>
        
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
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
              placeholder="Enter your email"
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
                placeholder="Create a password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="register-button">
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
