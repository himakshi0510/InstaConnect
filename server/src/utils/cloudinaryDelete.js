const fs = require('fs');
const path = require('path');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;

  // Local fallback check
  if (publicId.startsWith('local-')) {
    const filename = publicId.replace('local-', '');
    const filePath = path.join(__dirname, '../../public/uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Local file deletion error:', err);
      }
    }
    return;
  }

  if (!isConfigured) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Do not throw here so that DB deletions can still succeed
  }
};

module.exports = deleteFromCloudinary;
