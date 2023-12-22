const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUploads, (result) => {
      resolve(
        { url: result.secure_url, asset_id: result.asset_id, public_id: result.public_id },
        {
          resource_type: "auto",
        }
      );
    });
  });
};
const cloudinaryDeleteImg = (fileToDelete) => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(fileToDelete, (result) => {
      if (result.result === "ok" && result.deleted === "true") {
        resolve({ message: "Image deleted successfully" });
      } else {
        const errorMessage = result ? result.error : "Failed to delete image";
        resolve({ error: errorMessage });
      }
    });
  });
};

module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };
