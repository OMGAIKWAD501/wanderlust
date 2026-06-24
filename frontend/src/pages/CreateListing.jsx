import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import ImageUpload from "../components/ImageUpload";
import "../styles/ListingForm.css";

function CreateListing() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [listing, setListing] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    country: "",
    category: "trending",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setListing({ ...listing, [e.target.name]: e.target.value });
  };

  const handleImageChange = (fileOrString, objectUrl) => {
    if (fileOrString instanceof File) {
      setImageFile(fileOrString);
      setImagePreview(objectUrl);
    } else {
      // Fallback for direct URL input
      setImageFile(null);
      setImagePreview(fileOrString);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("You must be logged in to create a listing.");
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", listing.title);
      formData.append("description", listing.description);
      formData.append("price", listing.price);
      formData.append("location", listing.location);
      formData.append("country", listing.country);
      formData.append("category", listing.category);
      
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imagePreview && !imagePreview.startsWith("blob:")) {
        formData.append("imageUrl", imagePreview);
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/listings`, 
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true 
        }
      );
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      } else {
        const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
        toast.error(`Failed to add listing: ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const [generatingAI, setGeneratingAI] = useState(false);

  const generateDescription = async () => {
    if (!listing.title) {
      toast.error("Please enter a title first to generate a description.");
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/ai/generate-description`, {
        title: listing.title,
        location: listing.location,
        country: listing.country,
        category: listing.category
      });
      setListing((prev) => ({ ...prev, description: res.data.description }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate description. Please try again.");
    } finally {
      setGeneratingAI(false);
    }
  };

  // Redirect if not logged in initially
  if (!localStorage.getItem("user")) {
    return (
      <div className="form-page">
        <div className="form-card" style={{ textAlign: "center", padding: "40px" }}>
          <h2>You must be logged in to create a listing.</h2>
          <p style={{ marginTop: "16px", color: "#717171" }}>
            Please <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`} style={{ color: "#FF385C", fontWeight: "600", textDecoration: "none" }}>log in</Link> or <Link to={`/register?redirect=${encodeURIComponent(location.pathname)}`} style={{ color: "#FF385C", fontWeight: "600", textDecoration: "none" }}>sign up</Link> to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Add New Listing</h1>

        <form onSubmit={handleSubmit}>
          {/* Image Upload Component */}
          <div className="form-group full-width">
            <label className="form-label">Upload Image</label>
            <ImageUpload 
              value={imagePreview} 
              onChange={handleImageChange} 
            />

            {/* Optional: also accept a URL directly */}
            <div className="img-url-fallback">
              <span className="divider-text">or paste an image URL</span>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/photo.jpg"
                value={imagePreview && !imagePreview.startsWith("blob:") ? imagePreview : ""}
                onChange={(e) => handleImageChange(e.target.value, e.target.value)}
              />
            </div>
          </div>

          {/* ── Title ───────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Cozy Beachfront Cottage"
              value={listing.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* ── Description ─────────────────────────── */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Description</label>
              <button 
                type="button" 
                onClick={generateDescription}
                disabled={generatingAI}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "0.85rem",
                  cursor: generatingAI ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: generatingAI ? 0.7 : 1
                }}
              >
                {generatingAI ? "Generating..." : "✨ Auto-generate with AI"}
              </button>
            </div>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Describe your property..."
              value={listing.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* ── Price ───────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">Price per Night (₹)</label>
            <div className="input-with-symbol">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                name="price"
                className="form-input"
                placeholder="e.g. 4000"
                value={listing.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          {/* ── Category ────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-input"
              value={listing.category}
              onChange={handleChange}
              required
            >
              <option value="trending">Trending</option>
              <option value="rooms">Rooms</option>
              <option value="iconic-cities">Iconic Cities</option>
              <option value="mountains">Mountains</option>
              <option value="castles">Castles</option>
              <option value="amazing-pools">Amazing Pools</option>
              <option value="camping">Camping</option>
              <option value="farms">Farms</option>
              <option value="arctic">Arctic</option>
              <option value="domes">Domes</option>
              <option value="boats">Boats</option>
              <option value="beachfront">Beachfront</option>
              <option value="treehouses">Treehouses</option>
              <option value="mansions">Mansions</option>
            </select>
          </div>

          {/* ── Location + Country ──────────────────── */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="City, State"
                value={listing.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                className="form-input"
                placeholder="e.g. India"
                value={listing.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="form-submit-btn"
            disabled={loading}
          >
            {loading ? "Adding Listing…" : "Add Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateListing;