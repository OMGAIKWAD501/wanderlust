# Implementation Plan: Remaining Features

Based on the **Wanderlust Major Project Report** and our previous discussions, several core features and future enhancements have already been implemented (like Reviews UI, Map Integration, and Listing Ownership). However, there are a few key features that are still pending. 

Before we proceed with the implementation, please review the remaining features below and let me know which one(s) you would like me to work on next!

## User Review Required

> [!IMPORTANT]
> Please review the list of remaining features below and reply with which feature(s) you would like to prioritize. 

## Remaining Features to Implement

### 1. Category Filtering
- **Backend**: Add a `category` field to the `Listing` model schema and update routes to handle filtering by category.
- **Frontend**: Connect the existing category buttons in the Navbar to actual filtering logic, allowing users to browse listings by categories (e.g., Trending, Rooms, Iconic Cities).

### 2. Cloud Image Storage
- **Backend**: Integrate **Cloudinary** (or AWS S3) using `multer-storage-cloudinary` to handle scalable image uploads, replacing the current Base64/URL string approach.
- **Frontend**: Update the `ImageUpload` component to support file uploads instead of plain text URLs.

### 3. AI Features Integration
- **Backend/Frontend**: As discussed previously, we can integrate Gemini/OpenAI to add smart features such as an **AI Listing Description Generator** (suggesting descriptions based on title/location) or **AI Review Sentiment Analysis**.

### 4. Booking System
- **Backend**: Create a `Booking` model to track reservations, dates, and link them to users and listings.
- **Frontend**: Add a booking flow to the `ShowListing` page with date selection, availability calendar, and confirmation UI.

### 5. Enhanced Security
- **Backend**: Refactor authentication to use JWT tokens (if desired over sessions), store sensitive credentials in `.env` files, and clean up hardcoded secrets.

## Open Questions

> [!QUESTION]
> Which of the above features would you like me to tackle first? (e.g., "Let's do Category Filtering and Cloud Image Storage")

## Proposed Changes (Example for Category Filtering)

If we proceed with **Category Filtering**, the following files will be modified:

### Backend
#### [MODIFY] [listing.js](file:///c:/Users/OM/Desktop/major%20project%20-%20react.js/backend/models/listing.js)
- Add an `enum` category field to the Listing schema.
#### [MODIFY] [routes/listing.js](file:///c:/Users/OM/Desktop/major%20project%20-%20react.js/backend/routes/listing.js)
- Accept a `category` query parameter and filter database results accordingly.

### Frontend
#### [MODIFY] [Home.jsx](file:///c:/Users/OM/Desktop/major%20project%20-%20react.js/frontend/src/pages/Home.jsx)
- Pass selected category state to the listings fetch logic.

## Verification Plan

Once a feature is selected, I will implement the changes and verify:
1. **Automated/Manual Tests**: Restart the backend/frontend servers and ensure no compilation errors.
2. **UI Verification**: For frontend features, I will verify that the new components render correctly and interact smoothly with the backend API.
