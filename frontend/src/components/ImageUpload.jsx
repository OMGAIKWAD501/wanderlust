import { useRef, useState } from "react";

/**
 * ImageUpload – drag-and-drop + click-to-browse image uploader.
 *
 * Props:
 *   value        – current image URL (string) or null
 *   onChange     – called with (dataURL | objectURL | "") when image changes
 *   existingUrl  – URL of existing image (for edit mode preview)
 */
function ImageUpload({ value, onChange, existingUrl }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  /* The preview to show: a newly picked file OR the existing saved URL */
  const previewSrc = value || existingUrl || null;

  /* ── helpers ────────────────────────────────────────────── */
  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result); // base64 data URL
    reader.readAsDataURL(file);
  };

  /* ── drag-and-drop handlers ─────────────────────────────── */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  /* ── click to browse ────────────────────────────────────── */
  const handleZoneClick = () => {
    if (!previewSrc) inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = ""; // reset so same file can be re-selected
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div
      className={`img-upload-zone ${dragOver ? "drag-over" : ""} ${previewSrc ? "has-image" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {previewSrc ? (
        /* ── Image preview ─────────────────────────── */
        <div className="img-preview-wrap">
          <img src={previewSrc} alt="Preview" />

          {/* Hover overlay */}
          <div className="img-preview-overlay">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Click or drag to change</span>
          </div>

          {/* Remove button */}
          <button
            type="button"
            className="img-remove-btn"
            onClick={handleRemove}
            title="Remove image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Clicking the preview area also opens file picker */}
          <div
            style={{ position: "absolute", inset: 0, cursor: "pointer" }}
            onClick={() => inputRef.current?.click()}
          />
        </div>
      ) : (
        /* ── Empty upload prompt ───────────────────── */
        <>
          <div className="upload-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
          </div>
          <p className="upload-label">
            Drag &amp; drop an image here, or{" "}
            <span
              className="upload-browse"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            >
              browse
            </span>
          </p>
          <p className="upload-sub">PNG, JPG, WEBP up to 10 MB</p>
        </>
      )}
    </div>
  );
}

export default ImageUpload;
