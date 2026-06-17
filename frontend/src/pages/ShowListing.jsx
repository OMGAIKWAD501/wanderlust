import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/ShowListing.css";

/* ── Star selector (for writing reviews) ─────────────────── */
function StarSelector({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-selector">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`star-sel-btn ${s <= (hover || value) ? "filled" : ""}`}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22"
            fill={s <= (hover || value) ? "#FF385C" : "none"}
            stroke={s <= (hover || value) ? "#FF385C" : "#cccccc"}
            strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ── Mini stars display (for showing review ratings) ──────── */
function MiniStars({ rating }) {
  return (
    <div className="mini-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" width="14" height="14"
          fill={s <= rating ? "#FF385C" : "none"}
          stroke={s <= rating ? "#FF385C" : "#dddddd"}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function ShowListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* Review form state */
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  /* Current logged-in user */
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  /* Booking state */
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Helper to calculate total price dynamically
  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !listing?.price) return 0;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const timeDiff = co.getTime() - ci.getTime();
    if (timeDiff <= 0) return 0;
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights * listing.price;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    
    setBookingLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/bookings`,
        {
          booking: {
            listingId: id,
            checkIn,
            checkOut,
            guests
          }
        },
        { withCredentials: true }
      );
      alert("Booking confirmed! Redirecting to your trips...");
      navigate("/trips");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to complete booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/listings/${id}`);
      setListing(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load listing. It may have been removed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/listings/${id}`, {
        withCredentials: true,
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete listing");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  /* ── Submit review ─────────────────────────────── */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/listings/${id}/reviews`,
        { review: { rating: reviewRating, comment: reviewComment.trim() } },
        { withCredentials: true }
      );
      setReviewComment("");
      setReviewRating(5);
      await fetchListing();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ── Delete review ─────────────────────────────── */
  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/listings/${id}/reviews/${reviewId}`,
        { withCredentials: true }
      );
      await fetchListing();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      }
    }
  };

  /* ── Authorization helpers ─────────────────────── */
  const isOwner =
    currentUser &&
    listing?.owner &&
    (listing.owner._id === currentUser._id || listing.owner === currentUser._id);

  const isReviewAuthor = (review) => {
    if (!currentUser) return false;
    const authorId = review.author?._id || review.author;
    return authorId === currentUser._id;
  };

  /* ── Average rating ────────────────────────────── */
  const avgRating = listing?.reviews?.length
    ? (listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null;

  /* ── Map URL ───────────────────────────────────── */
  const mapQuery = listing
    ? encodeURIComponent(`${listing.location || ""}, ${listing.country || ""}`)
    : "";

  /* ── Loading state ─────────────────────────────── */
  if (loading) {
    return (
      <div className="show-listing-page">
        <div className="show-loading">
          <div className="show-loading-spinner" />
          <p>Loading listing…</p>
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────── */
  if (error || !listing) {
    return (
      <div className="show-listing-page">
        <div className="show-error">
          <h2>Listing not found</h2>
          <p>{error || "Something went wrong."}</p>
          <Link to="/" className="show-error-back">
            ← Back to listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="show-listing-page">
      <div className="show-content">

        {/* ── Image ────────────────────────────────── */}
        <img
          src={listing.image?.url}
          className="show-hero-img"
          alt={listing.title}
        />

        {/* ── Title + Actions ──────────────────────── */}
        <div className="show-header">
          <div>
            <h1 className="show-title">{listing.title}</h1>
            {avgRating && (
              <div className="show-rating-badge">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF385C" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{avgRating}</span>
                <span className="show-review-count">
                  · {listing.reviews.length} review{listing.reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Only show Edit/Delete to the listing owner */}
          {isOwner && (
            <div className="show-actions">
              <Link to={`/edit/${listing._id}`} className="show-edit-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </Link>
              <button className="show-delete-btn" onClick={() => setShowDeleteModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="show-layout">
          <div className="show-main-column">
            {/* ── Owner info ───────────────────────────── */}
            {listing.owner && (
              <p className="show-hosted-by">
                Hosted by <strong>{listing.owner.username || listing.owner.email}</strong>
              </p>
            )}

            {/* ── Location ─────────────────────────────── */}
        <div className="show-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {listing.location}{listing.country ? `, ${listing.country}` : ""}
        </div>

        <hr className="show-divider" />

        {/* ── Description ──────────────────────────── */}
        <p className="show-description-label">About this place</p>
        <p className="show-description">{listing.description}</p>

        <hr className="show-divider" />

        {/* ── Price ─────────────────────────────────── */}
        <div className="show-price-row">
          <span className="show-price-amount">
            ₹ {listing.price?.toLocaleString("en-IN")}
          </span>
          <span className="show-price-per">/ night</span>
        </div>

        <hr className="show-divider" />

        {/* ══════════════════════════════════════════════
            LOCATION MAP
        ══════════════════════════════════════════════ */}
        <section className="show-map-section">
          <h2 className="show-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Where you'll be
          </h2>
          <p className="show-map-location-text">
            {listing.location}{listing.country ? `, ${listing.country}` : ""}
          </p>
          <div className="show-map-wrapper">
            <iframe
              title="Listing location"
              className="show-map-iframe"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              loading="lazy"
              allowFullScreen
            />
          </div>
          <a
            className="show-map-link"
            href={`https://www.google.com/maps/search/${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View larger map →
          </a>
        </section>

        <hr className="show-divider" />

        {/* ══════════════════════════════════════════════
            REVIEWS
        ══════════════════════════════════════════════ */}
        <section className="show-reviews-section">
          <h2 className="show-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {avgRating ? `${avgRating} · ${listing.reviews.length} review${listing.reviews.length !== 1 ? "s" : ""}` : "Reviews"}
          </h2>

          {/* ── Review form (only if logged in) ──────── */}
          {currentUser ? (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h3 className="review-form-title">Leave a review</h3>
              <div className="review-form-rating">
                <span className="review-form-label">Rating</span>
                <StarSelector value={reviewRating} onChange={setReviewRating} />
              </div>
              <textarea
                className="review-form-textarea"
                placeholder="Share your experience…"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                rows={3}
              />
              <button
                type="submit"
                className="review-form-submit"
                disabled={submittingReview || !reviewComment.trim()}
              >
                {submittingReview ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          ) : (
            <div className="review-login-prompt">
              <p>
                <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>Log in</Link> to leave a review.
              </p>
            </div>
          )}

          {/* ── Review list ──────────────────────────── */}
          {listing.reviews?.length > 0 ? (
            <div className="review-list">
              {listing.reviews.map((rev) => (
                <div className="review-card" key={rev._id}>
                  <div className="review-card-top">
                    <div className="review-avatar">
                      {(rev.author?.username || rev.comment)?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="review-card-meta">
                      <span className="review-author-name">
                        {rev.author?.username || "Anonymous"}
                      </span>
                      <div className="review-meta-row">
                        <MiniStars rating={rev.rating} />
                        <span className="review-date">
                          {rev.createdAt
                            ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                    {/* Only show delete to review author */}
                    {isReviewAuthor(rev) && (
                      <button
                        className="review-delete-btn"
                        onClick={() => handleDeleteReview(rev._id)}
                        title="Delete review"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews-text">No reviews yet. Be the first to review!</p>
          )}
        </section>
        </div> {/* End show-main-column */}

        {/* ── Booking Widget Sidebar ─────────────────── */}
        <div className="show-sidebar">
          <div className="booking-widget">
            <div className="booking-price-header">
              <span className="booking-price-amount">₹ {listing.price?.toLocaleString("en-IN")}</span>
              <span className="booking-price-per"> / night</span>
            </div>
            
            <form onSubmit={handleBookingSubmit}>
              <div className="booking-inputs">
                <div className="booking-date-row">
                  <div className="booking-input-group">
                    <label>Check-In</label>
                    <input 
                      type="date" 
                      required 
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="booking-input-group">
                    <label>Checkout</label>
                    <input 
                      type="date" 
                      required 
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="booking-guests">
                  <label>Guests</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="booking-submit-btn" disabled={bookingLoading || !checkIn || !checkOut}>
                {bookingLoading ? "Reserving..." : "Reserve"}
              </button>
            </form>

            <p className="booking-no-charge">You won't be charged yet</p>

            {checkIn && checkOut && calculateTotalPrice() > 0 && (
              <>
                <div className="booking-summary-row">
                  <span>₹ {listing.price?.toLocaleString("en-IN")} x {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))} nights</span>
                  <span>₹ {calculateTotalPrice().toLocaleString("en-IN")}</span>
                </div>
                <div className="booking-total-divider">
                  <span>Total</span>
                  <span>₹ {calculateTotalPrice().toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </div>
        </div> {/* End show-sidebar */}
        </div> {/* End show-layout */}
      </div> {/* End show-content */}
      {/* ── Delete Confirmation Modal ─────────────────── */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF385C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <h3>Delete this listing?</h3>
            <p>This action cannot be undone. The listing will be permanently removed.</p>
            <div className="delete-modal-actions">
              <button className="delete-modal-cancel" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="delete-modal-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShowListing;