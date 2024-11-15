const db = require('../models');
const Property = db.Property;
const PropertyImage = db.PropertyImage;
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).array('images', 20);  // Allow up to 20 images

const getProperties = async (req, res) => {
  try {
    const { propertyType, search } = req.query;
    let whereClause = {};

    if (propertyType && propertyType !== 'All') {
      whereClause.propertyType = propertyType;
    }

    if (search) {
      whereClause[Op.or] = [
        { propertyName: { [Op.like]: `%${search}%` } },
        { province: { [Op.like]: `%${search}%` } },
        { district: { [Op.like]: `%${search}%` } },
        { subDistrict: { [Op.like]: `%${search}%` } }
      ];
    }

    const properties = await Property.findAll({
      where: whereClause,
      attributes: [
        'id', 'propertyName', 'propertyType', 'pricePerShare',
        'propertyValuation', 'totalShares', 'availableShares',
        'address', 'province', 'district', 'subDistrict',
        'zipCode', 'annualDividend', 'propertyNote', 'size',
        'amenities', 'nearbyPlaces', 'bedrooms', 'bathrooms',
        'latitude', 'longitude'
      ],
      include: [{ model: PropertyImage, as: 'propertyImages' }]
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Failed to fetch properties', error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  const targetId = req.params.id;
  try {
    const property = await Property.findByPk(targetId, {
      attributes: [
        'id', 'propertyName', 'propertyType', 'pricePerShare',
        'propertyValuation', 'totalShares', 'availableShares',
        'address', 'province', 'district', 'subDistrict',
        'zipCode', 'annualDividend', 'propertyNote', 'size',
        'amenities', 'nearbyPlaces', 'bedrooms', 'bathrooms',
        'latitude', 'longitude'
      ],
      include: [
        { model: PropertyImage, as: 'propertyImages' }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Failed to fetch property', error: error.message });
  }
};

const createNewProperty = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'Unknown error', error: err.message });
    }

    try {
      const {
        name, type, pricePerShare, valuation, totalShares, 
        availableShares, address, province, district, subdistrict, 
        zipCode, latitude, longitude, annualDividend, propertyNote, 
        size, amenities, nearbyPlaces, bedrooms, bathrooms
      } = req.body;

      // Validate coordinates if provided
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return res.status(400).json({ message: 'Invalid coordinates' });
        }
      }

      const newProperty = await Property.create({
        propertyType: type,
        propertyName: name,
        pricePerShare,
        propertyValuation: valuation,
        totalShares,
        availableShares,
        address,
        province,
        district,
        subDistrict: subdistrict,
        zipCode,
        latitude,
        longitude,
        annualDividend,
        propertyNote,
        size,
        amenities,
        nearbyPlaces,
        bedrooms,
        bathrooms
      });

      if (req.files && req.files.length > 0) {
        const imagePromises = req.files.map(file => 
          PropertyImage.create({
            imageUrl: file.path,
            property_id: newProperty.id
          })
        );
        await Promise.all(imagePromises);
      }

      res.status(201).json(newProperty);
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({ message: 'Failed to create property', error: error.message });
    }
  });
};

const updateProperty = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'Unknown error', error: err.message });
    }

    const targetId = req.params.id;
    const transaction = await db.sequelize.transaction();

    try {
      const {
        name, type, pricePerShare, valuation, totalShares, 
        availableShares, address, province, district, subdistrict, 
        zipCode, latitude, longitude, annualDividend, propertyNote, 
        size, amenities, nearbyPlaces, bedrooms, bathrooms,
        retainedImageIds
      } = req.body;

      // Validate coordinates if provided
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return res.status(400).json({ message: 'Invalid coordinates' });
        }
      }

      // Parse retained image IDs
      const retainedIds = JSON.parse(retainedImageIds || '[]');
      console.log('Retained Image IDs:', retainedIds);

      // Find images that should be deleted
      const imagesToDelete = await PropertyImage.findAll({
        where: {
          property_id: targetId,
          id: { [Op.notIn]: retainedIds }
        },
        transaction
      });

      console.log('Images to delete:', imagesToDelete.length);

      // Delete unretained images
      for (const img of imagesToDelete) {
        try {
          const fullPath = path.resolve(img.imageUrl);
          await fs.unlink(fullPath);
          await img.destroy({ transaction });
          console.log(`Deleted image: ${img.id}`);
        } catch (error) {
          console.error(`Failed to delete image ${img.id}:`, error);
        }
      }

      // Update property details
      await Property.update({
        propertyType: type,
        propertyName: name,
        pricePerShare,
        propertyValuation: valuation,
        totalShares,
        availableShares,
        address,
        province,
        district,
        subDistrict: subdistrict,
        zipCode,
        latitude,
        longitude,
        annualDividend,
        propertyNote,
        size,
        amenities,
        nearbyPlaces,
        bedrooms,
        bathrooms
      }, {
        where: { id: targetId },
        transaction
      });

      // Add new images
      if (req.files && req.files.length > 0) {
        const imagePromises = req.files.map(file => 
          PropertyImage.create({
            imageUrl: file.path,
            property_id: targetId
          }, { transaction })
        );
        await Promise.all(imagePromises);
      }

      await transaction.commit();
      console.log('Update completed successfully');
      
      res.status(200).json({ 
        message: `Property id ${targetId} was updated`,
        deletedImages: imagesToDelete.length,
        newImages: req.files ? req.files.length : 0
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating property:', error);
      res.status(500).json({ message: 'Failed to update property', error: error.message });
    }
  });
};

const deleteProperty = async (req, res) => {
  const targetId = req.params.id;
  const transaction = await db.sequelize.transaction();

  try {
    // Find all images associated with the property
    const images = await PropertyImage.findAll({ 
      where: { property_id: targetId },
      transaction
    });
    
    // Delete image files
    for (const img of images) {
      try {
        const fullPath = path.resolve(img.imageUrl);
        await fs.unlink(fullPath);
        await img.destroy({ transaction });
      } catch (error) {
        console.error(`Failed to delete image file: ${img.imageUrl}`, error);
      }
    }

    // Delete the property
    await Property.destroy({ 
      where: { id: targetId },
      transaction
    });

    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Failed to delete property', error: error.message });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createNewProperty,
  updateProperty,
  deleteProperty
};