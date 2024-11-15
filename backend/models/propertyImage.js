module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define('PropertyImage', {
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    tableName: 'property_images',
    timestamps: false
  });  

  model.associate = models => {
    model.belongsTo(models.Property, {foreignKey: 'property_id',as: 'property'});
  }

  return model;
};