import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import "../styles/UserProfile.css";

function UserProfile() {
  const { id } = useParams();
  const toast = useToast();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "", bio: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Check if current user owns this profile
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = currentUser && currentUser._id === id;

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/users/${id}`);
      setProfileData(res.data);
      setEditForm({
        username: res.data.user.username,
        email: res.data.user.email,
        bio: res.data.user.bio || ""
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [id]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("username", editForm.username);
    formData.append("email", editForm.email);
    formData.append("bio", editForm.bio);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/users/${id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      // Update local storage user
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
      
      // Optionally trigger a navbar refresh by dispatching an event, or just reload
      window.dispatchEvent(new Event("storage"));
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-container">
        <h2>User not found</h2>
      </div>
    );
  }

  const { user, listings, reviews } = profileData;
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const displayAvatar = avatarPreview || user.avatar?.url?.replace("/upload/", "/upload/w_200,h_200,c_fill/") || `https://ui-avatars.com/api/?name=${user.username}&background=FF385C&color=fff&size=200`;

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        
        {/* Profile Header Card */}
        <div className="profile-card">
          <div className="profile-card-left">
            <div className="profile-avatar-wrapper">
              <img src={displayAvatar} alt={user.username} className="profile-avatar" />
              {isEditing && (
                <label className="avatar-upload-overlay">
                  <span>Change</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                </label>
              )}
            </div>
            
            {!isEditing ? (
              <div className="profile-info">
                <h1>{user.username}</h1>
                <p className="profile-email">{user.email}</p>
                <div className="profile-stats">
                  <span><strong>{listings.length}</strong> Listings</span>
                  <span><strong>{reviews.length}</strong> Reviews</span>
                </div>
                <p className="profile-join">Joined in {joinDate}</p>
                {user.bio && <p className="profile-bio">{user.bio}</p>}
                
                {isOwner && (
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
            ) : (
              <form className="profile-edit-form" onSubmit={handleSave}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={editForm.username} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea name="bio" value={editForm.bio} onChange={handleEditChange} placeholder="Tell us about yourself..." rows="3"></textarea>
                </div>
                <div className="profile-edit-actions">
                  <button type="button" className="cancel-edit-btn" onClick={() => { setIsEditing(false); setAvatarPreview(null); }}>
                    Cancel
                  </button>
                  <button type="submit" className="save-profile-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="profile-content">
          
          {/* Listings Section */}
          <div className="profile-section">
            <h2>{isOwner ? "Your Listings" : `Listings by ${user.username}`}</h2>
            {listings.length === 0 ? (
              <p className="empty-state">No listings hosted yet.</p>
            ) : (
              <div className="profile-listings-grid">
                {listings.map(listing => (
                  <Link to={`/listings/${listing._id}`} key={listing._id} className="profile-listing-card">
                    <img src={listing.image?.url?.replace("/upload/", "/upload/w_400,h_300,c_fill/")} alt={listing.title} />
                    <div className="profile-listing-info">
                      <h3>{listing.title}</h3>
                      <p>{listing.location}{listing.country ? `, ${listing.country}` : ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="profile-section">
            <h2>{isOwner ? "Your Reviews" : `Reviews by ${user.username}`}</h2>
            {reviews.length === 0 ? (
              <p className="empty-state">No reviews written yet.</p>
            ) : (
              <div className="profile-reviews-list">
                {reviews.map(review => (
                  <div key={review._id} className="profile-review-card">
                    <div className="review-header">
                      <Link to={`/listings/${review.listing._id}`} className="review-listing-link">
                        <img src={review.listing?.image?.url?.replace("/upload/", "/upload/w_100,h_100,c_fill/")} alt="" className="review-listing-img" />
                        <span>{review.listing?.title}</span>
                      </Link>
                      <div className="review-rating">
                        {"⭐".repeat(review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">"{review.comment}"</p>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserProfile;
