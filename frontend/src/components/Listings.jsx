import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import SkeletonGrid from "./SkeletonGrid";
import "./Listings.css";

/* ── Category definitions ───────────────────────────────── */
const CATEGORIES = [
  { id: "trending", label: "Trending", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22 L10 14 L16 18 L24 8 L30 12"/><polyline points="24 8 30 8 30 12"/></svg>) },
  { id: "rooms", label: "Rooms", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="24" height="18" rx="2"/><path d="M4 18h24M16 10V4M10 4h12M12 22v6M20 22v6"/></svg>) },
  { id: "iconic-cities", label: "Iconic Cities", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="10" height="14"/><rect x="12" y="8" width="8" height="20"/><rect x="20" y="18" width="10" height="10"/><line x1="2" y1="28" x2="30" y2="28"/></svg>) },
  { id: "mountains", label: "Mountains", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 28 12 8 18 18 22 14 30 28"/><line x1="2" y1="28" x2="30" y2="28"/></svg>) },
  { id: "castles", label: "Castles", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="20" height="18"/><rect x="6" y="4" width="4" height="6"/><rect x="14" y="4" width="4" height="6"/><rect x="22" y="4" width="4" height="6"/><rect x="12" y="20" width="8" height="8"/></svg>) },
  { id: "amazing-pools", label: "Amazing Pools", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20 Q8 16 14 20 Q20 24 26 20 Q29 18 30 20"/><path d="M2 26 Q8 22 14 26 Q20 30 26 26 Q29 24 30 26"/><circle cx="16" cy="10" r="3"/></svg>) },
  { id: "camping", label: "Camping", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 4 2 28 30 28"/><line x1="9" y1="28" x2="16" y2="14"/></svg>) },
  { id: "farms", label: "Farms", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 28V16L10 8l8 8 8-6v18"/><line x1="2" y1="28" x2="30" y2="28"/><rect x="13" y="20" width="6" height="8"/></svg>) },
  { id: "arctic", label: "Arctic", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="16" y1="2" x2="16" y2="30"/><line x1="2" y1="16" x2="30" y2="16"/><line x1="6" y1="6" x2="26" y2="26"/><line x1="26" y1="6" x2="6" y2="26"/><circle cx="16" cy="16" r="3" fill="currentColor" stroke="none"/></svg>) },
  { id: "domes", label: "Domes", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22 A12 14 0 0 1 28 22"/><line x1="4" y1="22" x2="28" y2="22"/><line x1="4" y1="22" x2="4" y2="28"/><line x1="28" y1="22" x2="28" y2="28"/><line x1="2" y1="28" x2="30" y2="28"/></svg>) },
  { id: "boats", label: "Boats", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22 L6 28 L26 28 L28 22 Z"/><path d="M16 4 L16 22"/><path d="M16 4 L28 18 L4 18"/></svg>) },
  { id: "beachfront", label: "Beachfront", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="22" cy="8" r="4"/><path d="M6 28 Q10 20 16 24 Q20 26 22 22"/><path d="M2 28 Q8 22 16 26 Q22 28 30 24"/><line x1="2" y1="28" x2="30" y2="28"/></svg>) },
  { id: "treehouses", label: "Treehouses", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="12" r="8"/><line x1="16" y1="20" x2="16" y2="30"/><line x1="10" y1="26" x2="22" y2="26"/><rect x="12" y="14" width="8" height="6" rx="1"/></svg>) },
  { id: "mansions", label: "Mansions", icon: (<svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 2 2 12 2 28 30 28 30 12"/><rect x="12" y="18" width="8" height="10"/><rect x="4" y="14" width="6" height="6"/><rect x="22" y="14" width="6" height="6"/></svg>) },
];

/* ── Star Rating ────────────────────────────────────────── */
function StarRating({ rating }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="star-rating">
      {stars.map((s) => (
        <svg
          key={s}
          className={`star ${s <= Math.round(rating) ? "filled" : ""}`}
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill={s <= Math.round(rating) ? "#FF385C" : "none"}
          stroke={s <= Math.round(rating) ? "#FF385C" : "#cccccc"}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="star-value">{rating?.toFixed(1) ?? "New"}</span>
    </div>
  );
}

/* ── Price Filter Sidebar ───────────────────────────────── */
function FilterSidebar({ maxPrice, priceRange, onChange, onClose }) {
  return (
    <div className="filter-overlay" onClick={onClose}>
      <div className="filter-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="filter-header">
          <h2 className="filter-title">Filters</h2>
          <button className="filter-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="filter-section">
          <h3 className="filter-section-title">Price range</h3>
          <p className="filter-section-sub">Nightly prices before taxes and fees</p>

          <div className="price-range-display">
            <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
            <span>—</span>
            <span>₹{priceRange[1].toLocaleString("en-IN")}+</span>
          </div>

          <div className="price-slider-wrap">
            <label className="slider-label">Min price</label>
            <input
              type="range" min={0} max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => onChange([+e.target.value, priceRange[1]])}
              className="price-slider"
            />
            <label className="slider-label">Max price</label>
            <input
              type="range" min={0} max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => onChange([priceRange[0], +e.target.value])}
              className="price-slider"
            />
          </div>
        </div>

        <div className="filter-footer">
          <button className="filter-clear" onClick={() => onChange([0, maxPrice])}>
            Clear all
          </button>
          <button className="filter-apply" onClick={onClose}>
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
function Listings() {
  const [listings, setListings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [showTaxes, setShowTaxes]         = useState(false);
  const [showFilter, setShowFilter]       = useState(false);
  const [priceRange, setPriceRange]       = useState([0, 100000]);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 100000]);
  const location = useLocation();

  const searchQuery = new URLSearchParams(location.search).get("search") || "";

  // Instant real-time update for price slider
  useEffect(() => {
    setAppliedPriceRange(priceRange);
  }, [priceRange]);

  useEffect(() => { 
    fetchListings(); 
  }, [searchQuery, appliedPriceRange, activeCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (appliedPriceRange[0] > 0) params.append("minPrice", appliedPriceRange[0]);
      if (appliedPriceRange[1] < 100000) params.append("maxPrice", appliedPriceRange[1]);
      if (activeCategory) params.append("category", activeCategory);

      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/listings?${params.toString()}`);
      setListings(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const maxPrice = 100000;

  /* Real rating calculation */
  const getRating = (listingReviews) => {
    if (!listingReviews || listingReviews.length === 0) return null;
    const sum = listingReviews.reduce((acc, rev) => acc + rev.rating, 0);
    return sum / listingReviews.length;
  };

  const displayPrice = (price) => {
    if (!price) return "—";
    const final = showTaxes ? Math.round(price * 1.18) : price;
    return `₹ ${final.toLocaleString("en-IN")}`;
  };

  const activeFilters = appliedPriceRange[0] > 0 || appliedPriceRange[1] < maxPrice;

  return (
    <div className="listings-wrapper">

      {/* ── Category + Tax Bar ───────────────────────────── */}
      <div className="category-bar-outer">
        <div className="category-bar">
          <div className="category-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`category-item ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(activeCategory === cat.id ? "" : cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="category-bar-right">
            {/* Filter button */}
            <button
              className={`filter-btn ${activeFilters ? "filter-btn--active" : ""}`}
              onClick={() => setShowFilter(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters{activeFilters ? " ●" : ""}
            </button>

            {/* Tax toggle */}
            <div className="tax-toggle-wrap">
              <span className="tax-toggle-label">Display total after taxes</span>
              <button
                className={`tax-toggle-btn ${showTaxes ? "on" : ""}`}
                onClick={() => setShowTaxes((v) => !v)}
                aria-label="Toggle total after taxes"
              >
                <span className="tax-toggle-thumb" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Sidebar (modal) ───────────────────────── */}
      {showFilter && (
        <FilterSidebar
          maxPrice={maxPrice}
          priceRange={priceRange}
          onChange={setPriceRange}
          onClose={() => {
            setAppliedPriceRange(priceRange);
            setShowFilter(false);
          }}
        />
      )}

      {/* ── Grid ─────────────────────────────────────────── */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="listings-page">
          {searchQuery && (
            <p className="search-result-info">
              {listings.length} result{listings.length !== 1 ? "s" : ""} for{" "}
              <strong>"{searchQuery}"</strong>
            </p>
          )}

          {listings.length === 0 ? (
            <div className="no-results">
              <span className="no-results-emoji">🔍</span>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or search a different destination.</p>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((listing) => (
                <Link
                  to={`/listings/${listing._id}`}
                  className="listing-card-link"
                  key={listing._id}
                >
                  <div className="listing-card">
                    <div className="listing-img-wrapper">
                      <img
                        src={listing.image?.url}
                        className="listing-img"
                        alt={listing.title}
                      />
                    </div>
                    <div className="listing-info">
                      <div className="listing-info-row">
                        <h5 className="listing-title-text">{listing.title}</h5>
                        <StarRating rating={getRating(listing.reviews)} />
                      </div>
                      <p className="listing-location">{listing.location}{listing.country ? `, ${listing.country}` : ""}</p>
                      <p className="listing-price">
                        <strong>{displayPrice(listing.price)}</strong>{" "}
                        <span className="listing-per-night">/ night</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Listings;