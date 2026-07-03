const fs = require('fs');
const path = require('path');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const uploadToCloudinary = async (filePath, folder, transformations = []) => {
  if (!isConfigured) {
    // Local fallback: move the file to public/uploads
    const publicUploadsDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(publicUploadsDir)) {
      fs.mkdirSync(publicUploadsDir, { recursive: true });
    }
    const filename = path.basename(filePath);
    const destinationPath = path.join(publicUploadsDir, filename);

    // Copy file
    fs.copyFileSync(filePath, destinationPath);
    
    // Return local URL
    return {
      secure_url: `/uploads/${filename}`,
      public_id: `local-${filename}`
    };
  }

  // Upload to Cloudinary
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: transformations
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

module.exports = uploadToCloudinary;
