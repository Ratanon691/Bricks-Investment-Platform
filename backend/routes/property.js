const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property');
const { handleBase64Upload } = require('../middleware/uploadMiddleware');

router.get('/', propertyController.getProperties); // fetch properties with filters and search
router.get('/:id', propertyController.getPropertyById);
router.post('/', handleBase64Upload, propertyController.createNewProperty); // POST route with middleware for creating a new property
router.put('/:id', handleBase64Upload, propertyController.updateProperty); // PUT route with middleware for updating a property
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;