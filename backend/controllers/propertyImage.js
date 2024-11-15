const {sequelize, Sequelize} = require('../models')
const db = require('../models')

const Op = Sequelize.Op

const getPropertyImage =  async (req,res) => {
    const allImg = await db.PropertyImage.findAll()
    res.status(200).send(allImg)
}

const getImgByPropertyId =  async (req,res) => {
    const propertyId = req.params.id
    const propertyImgByid = await db.PropertyImage.findAll({where:{property_id: propertyId}})
    res.status(200).send(propertyImgByid)
}

const addPropertyImg =  async (req,res) => {
    const {imageUrl, property_id} = req.body
    const newPropertyImg = await db.PropertyImage.create({
        imageUrl: imageUrl,
        property_id: property_id
    })
    res.status(200).send(newPropertyImg)
}

const deletePropertyImg = async (req,res) => {
    const targetId = req.params.id
    await db.PropertyImage.destroy({where: {id: targetId}})
    res.status(204).send()
}


module.exports = {
    getPropertyImage,
    getImgByPropertyId,
    addPropertyImg,
    deletePropertyImg
}