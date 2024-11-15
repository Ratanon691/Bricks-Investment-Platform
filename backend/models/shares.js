module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define('Shares', {
      userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
              model: 'users',  
              key: 'id'
          }
      },
      propertyId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
              model: 'properties',  
              key: 'id'
          }
      },
      amount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
      }
  }, {
      tableName: 'shares',
      timestamps: true,
      indexes: [{
          unique: true,
          fields: ['userId', 'propertyId']
      }]
  });

model.associate = (models) => {
  model.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
  });
  model.belongsTo(models.Property, { 
      foreignKey: 'propertyId',
      as: 'property' 
  });
};
  return model;
};