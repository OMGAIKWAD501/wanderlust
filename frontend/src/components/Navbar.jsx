import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsMenuOpen(false);
    window.location.href = "/";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/listings");
    }
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-container">

        {/* ── Left: Logo + Explore ──────────────────────── */}
        <Link className="navbar-brand" to="/">
          <span className="brand-icon">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#FF385C"/>
              <path d="M16 7C13.5 7 11 9.5 11 13.5C11 16.5 14 20.5 16 23C18 20.5 21 16.5 21 13.5C21 9.5 18.5 7 16 7ZM16 15.5C14.9 15.5 14 14.6 14 13.5C14 12.4 14.9 11.5 16 11.5C17.1 11.5 18 12.4 18 13.5C18 14.6 17.1 15.5 16 15.5Z" fill="white"/>
            </svg>
          </span>
          <span className="brand-text">Explore</span>
        </Link>

        {/* ── Centre: Search Bar ────────────────────────── */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search destinations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span className="search-btn-text">Search</span>
          </button>
        </form>

        {/* ── Right: Auth (Desktop) ─────────────────────── */}
        <div className="navbar-auth desktop-only">
          {/* "Add your listing" always visible */}
          <Link className="nav-host-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} to="/create">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add your listing
          </Link>

          {user ? (
            <>
              <span className="nav-user">Welcome, {user.email}</span>
              <Link className="nav-host-link" style={{ marginLeft: "8px" }} to="/trips">
                My Trips
              </Link>
              <button className="nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-signup" to={`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`}>
                Sign up
              </Link>
              <Link className="nav-login" to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}>
                Log in
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger Icon ─────────────────────── */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

      </div>

      {/* ── Mobile Menu Overlay ─────────────────────────── */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <Link className="mobile-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} to="/create">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add your listing
            </Link>
            {user ? (
              <>
                <Link className="mobile-nav-link" to="/trips">My Trips</Link>
                <button className="mobile-nav-link logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="mobile-nav-link" to={`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`}>Sign up</Link>
                <Link className="mobile-nav-link" to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}>Log in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;