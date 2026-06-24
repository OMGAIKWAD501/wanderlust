import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import "../styles/MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login?redirect=/trips");
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/bookings/user`, {
        withCredentials: true,
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate("/login?redirect=/trips");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setIsCancelling(true);
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/bookings/${bookingId}/cancel`, {}, {
        withCredentials: true,
      });
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: "cancelled" } : b
      ));
      setCancellingBooking(null);
      toast.success("Booking cancelled successfully.");
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      toast.error(err.response?.data?.error || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRemove = async (bookingId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/bookings/${bookingId}`, {
        withCredentials: true,
      });
      setBookings(bookings.filter(b => b._id !== bookingId));
      toast.success("Trip removed from your list.");
    } catch (err) {
      console.error("Failed to remove booking:", err);
      toast.error(err.response?.data?.error || "Failed to remove trip");
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  if (loading) {
    return <div className="trips-loading">Loading your trips...</div>;
  }

  return (
    <div className="trips-page">
      <h1 className="trips-title">My Trips</h1>
      
      {bookings.length === 0 ? (
        <div className="no-trips">
          <p>No trips booked... yet!</p>
          <p>Time to dust off your bags and start planning your next adventure.</p>
          <Link to="/" style={{ color: "#FF385C", fontWeight: "600", textDecoration: "none", display: "inline-block", marginTop: "16px" }}>
            Start searching
          </Link>
        </div>
      ) : (
        <div className="trips-grid">
          {bookings.map((booking) => (
            <Link to={`/listings/${booking.listing._id}`} key={booking._id} style={{ textDecoration: 'none' }}>
              <div className="trip-card" style={{ position: "relative" }}>
                {booking.status === "cancelled" && (
                  <button
                    className="trip-remove-cross"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(booking._id);
                    }}
                    title="Remove Trip"
                  >
                    &times;
                  </button>
                )}
                <div className="trip-img-wrapper">
                  <img src={booking.listing.image?.url?.replace("/upload/", "/upload/q_auto,f_auto,c_fill,w_800,h_600/")} alt={booking.listing.title} className="trip-img" />
                </div>
                <div className="trip-info">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3 className="trip-location">{booking.listing.location}{booking.listing.country ? `, ${booking.listing.country}` : ""}</h3>
                    {booking.status === "cancelled" && (
                      <span className="booking-status cancelled">Cancelled</span>
                    )}
                    {booking.status === "completed" && (
                      <span className="booking-status completed">Completed</span>
                    )}
                  </div>
                  <p className="trip-title">{booking.listing.title}</p>
                  <div className="trip-dates">
                    {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                  </div>
                  <div className="trip-footer">
                    <p className="trip-price">Total: ₹ {booking.totalPrice?.toLocaleString("en-IN")}</p>
                    {booking.status !== "cancelled" && booking.status !== "completed" && (
                      <button 
                        className="cancel-booking-btn" 
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigating to listing
                          setCancellingBooking(booking._id);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="cancel-modal-overlay" onClick={() => !isCancelling && setCancellingBooking(null)}>
          <div className="cancel-modal" onClick={e => e.stopPropagation()}>
            <div className="cancel-modal-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h3>Cancel your trip?</h3>
            <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="cancel-modal-actions">
              <button 
                className="cancel-modal-close-btn" 
                onClick={() => setCancellingBooking(null)}
                disabled={isCancelling}
              >
                Keep Booking
              </button>
              <button 
                className="cancel-modal-confirm-btn" 
                onClick={() => handleCancel(cancellingBooking)}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
