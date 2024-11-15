module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define('Transaction', {
        type: {
            type: DataTypes.ENUM('buy', 'sell'),
            allowNull: false
        },
        shares: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),  
            allowNull: false,
            validate: {  
                min: 0
            }
        },
        user_id: {  
            type: DataTypes.INTEGER,
            allowNull: false
        },
        property_id: {  
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'transactions',  
        timestamps: true
    });
      
    model.associate = models => {
        model.belongsTo(models.User, { 
            foreignKey: 'user_id',
            as: 'user'
        });
        model.belongsTo(models.Property, { 
            foreignKey: 'property_id',
            as: 'Property'
        });
    }
    return model;
};