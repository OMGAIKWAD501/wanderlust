import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <div className="trip-card">
                <div className="trip-img-wrapper">
                  <img src={booking.listing.image?.url} alt={booking.listing.title} className="trip-img" />
                </div>
                <div className="trip-info">
                  <h3 className="trip-location">{booking.listing.location}{booking.listing.country ? `, ${booking.listing.country}` : ""}</h3>
                  <p className="trip-title">{booking.listing.title}</p>
                  <div className="trip-dates">
                    {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                  </div>
                  <p className="trip-price">Total: ₹ {booking.totalPrice?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
