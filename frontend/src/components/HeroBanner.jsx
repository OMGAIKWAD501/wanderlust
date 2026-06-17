import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";

function HeroBanner() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/listings?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/listings");
    }
  };

  return (
    <section className="hero-section">
      {/* Blurred background image */}
      <div className="hero-bg-overlay" />

      <div className="hero-content">
        {/* Tag */}
        <div className="hero-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Top-rated stays worldwide
        </div>

        {/* Heading */}
        <h1 className="hero-title">
          Find your next<br />
          <span>perfect stay</span>
        </h1>

        <p className="hero-subtitle">
          Discover unique homes, experiences, and places around the world.
          Book with confidence — every stay is verified.
        </p>

        {/* Search Bar */}
        <form className="hero-search-bar" onSubmit={handleSearch}>
          <span className="hero-search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            className="hero-search-input"
            placeholder="Search destinations, cities, countries…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="hero-search-btn">Search</button>
        </form>

        {/* Stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">10K+</span>
            <span className="hero-stat-label">Listings</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">180+</span>
            <span className="hero-stat-label">Countries</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">2M+</span>
            <span className="hero-stat-label">Happy Guests</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
