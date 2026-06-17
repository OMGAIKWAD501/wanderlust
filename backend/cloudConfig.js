const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
    api_key: process.env.CLOUDINARY_KEY || "123456789012345",
    api_secret: process.env.CLOUDINARY_SECRET || "dummysecret123"
});

// Configure Multer storage engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust_DEV',
        allowedFormats: ["png", "jpg", "jpeg"] // supports promises as well
    },
});

module.exports = {
    cloudinary,
    storage
};
