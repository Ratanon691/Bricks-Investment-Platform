const express = require('express')
const router =  express.Router()
const propertyImgController = require('../controllers/propertyImage')

//http://localhost:8000/propertyImage
router.get('/', propertyImgController.getPropertyImage)
router.get('/:id', propertyImgController.getImgByPropertyId)
router.post('/', propertyImgController.addPropertyImg)
router.delete('/:id', propertyImgController.deletePropertyImg)

module.exports = router