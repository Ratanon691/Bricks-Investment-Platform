const fs = require('fs').promises;
const path = require('path');

const handleBase64Upload = async (req, res, next) => {
  console.log('Received body:', JSON.stringify(req.body, null, 2));

  // Check if it's a single image upload (for FeaturedLocation) or multiple images
  const images = req.body.image ? [{ data: req.body.image }] : req.body.images;

  if (!images || !Array.isArray(images) || images.length === 0) {
    console.log('No images found in request body');
    req.processedImages = [];
    return next();
  }

  if (images.length > 20) {
    return res.status(400).json({ message: 'Maximum 20 images allowed' });
  }

  try {
    const uploadPromises = images.map(async (imageObj, index) => {
      console.log(`Processing image ${index}:`, imageObj);

      if (typeof imageObj !== 'object' || !imageObj.data) {
        throw new Error(`Invalid image object at index ${index}`);
      }

      const base64String = imageObj.data;
      
      if (typeof base64String !== 'string') {
        throw new Error(`Image data at index ${index} is not a string`);
      }

      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        console.log(`Invalid base64 string for image ${index}:`, base64String.substring(0, 100) + '...');
        throw new Error(`Invalid base64 string for image ${index}`);
      }

      const fileType = matches[1].split('/')[1];
      const base64Data = matches[2];
      const fileName = `image_${Date.now()}_${index}.${fileType}`;
      const filePath = path.join(__dirname, '..', 'uploads', fileName);

      await fs.writeFile(filePath, base64Data, 'base64');
      return `/uploads/${fileName}`;
    });

    req.processedImages = await Promise.all(uploadPromises);
    console.log('Processed images:', req.processedImages);
    
    // If it's a single image upload (for FeaturedLocation), set imageUrl in req.body
    if (req.body.image) {
      req.body.imageUrl = req.processedImages[0];
    }
    
    next();
  } catch (error) {
    console.error('Error processing base64 images:', error);
    res.status(400).json({ message: 'Error processing images', error: error.message });
  }
};

module.exports = {
  handleBase64Upload
};