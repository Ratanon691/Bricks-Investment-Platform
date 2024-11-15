module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define('Property', {
    propertyType: {
      type: DataTypes.ENUM('Condo', 'House', 'Land', 'Others'),
      allowNull: false
    },
    propertyName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    pricePerShare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    propertyValuation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    totalShares: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    availableShares: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    district: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    subDistrict: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    zipCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [5, 5]
      }
    },
    annualDividend: {
      type: DataTypes.DECIMAL(10, 2)
    },
    propertyNote: {
      type: DataTypes.TEXT
    },
    size: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    amenities: {
      type: DataTypes.TEXT
    },
    nearbyPlaces: {
      type: DataTypes.TEXT
    },
    bedrooms: {
      type: DataTypes.INTEGER
    },
    bathrooms: {
      type: DataTypes.INTEGER
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true
    }
  }, {
    tableName: 'properties',
    timestamps: true
  });

model.associate = models => {
  model.hasMany(models.Transaction, {
      foreignKey: 'property_id',
      as: 'transactions'  
  });
  model.hasMany(models.PropertyImage, {
      foreignKey: 'property_id',
      as: 'propertyImages'
  });    
  model.hasMany(models.Shares, {
      foreignKey: 'propertyId',
      as: 'propertyShares'  
  });
}  
  return model;
};