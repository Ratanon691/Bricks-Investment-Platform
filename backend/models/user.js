module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
      email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
              isEmail: {
                  msg: "Must be a valid email address"
              }
          }
      },
      firstName: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
              notEmpty: {
                  msg: "First name cannot be empty"
              }
          }
      },
      lastName: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
              notEmpty: {
                  msg: "Last name cannot be empty"
              }
          }
      },
      password: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      idNumber: {
          type: DataTypes.STRING(13),
          allowNull: false,
          unique: true,
          validate: {
              len: {
                  args: [13, 13],
                  msg: "The ID number must be exactly 13 characters long"
              },
              isNumeric: {
                  msg: "The ID number must contain only digits"
              }
          }
      },
      address: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
              notEmpty: {
                  msg: "Address cannot be empty"
              }
          }
      },
      province: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
              notEmpty: {
                  msg: "Province cannot be empty"
              }
          }
      },
      district: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
              notEmpty: {
                  msg: "District cannot be empty"
              }
          }
      },
      subDistrict: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
              notEmpty: {
                  msg: "Sub-district cannot be empty"
              }
          }
      },
      zipCode: {
          type: DataTypes.STRING(5),
          allowNull: false,
          validate: {
              isNumeric: {
                  msg: "Zip code must contain only numbers"
              },
              len: {
                  args: [5, 5],
                  msg: "Zip code must be exactly 5 digits long"
              }
          }
      },
      role: {
          type: DataTypes.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',  
          validate: {
              isIn: {
                  args: [['guest', 'user', 'admin']],
                  msg: "Role must be either guest, user, or admin"
              }
          }
      }
  }, {
      tableName: 'users',
      timestamps: true, 
      indexes: [
          {
              unique: true,
              fields: ['email']
          },
          {
              unique: true,
              fields: ['idNumber']
          }
      ]
  });

  
  model.associate = models => {
      // User can have many transactions
      model.hasMany(models.Transaction, {
          foreignKey: {
              name: 'user_id',
              allowNull: false
          },
          as: 'transactions',
          onDelete: 'CASCADE'
      });

      // User can have many shares in different properties
      model.hasMany(models.Shares, {
          foreignKey: {
              name: 'userId',
              allowNull: false
          },
          as: 'shares',
          onDelete: 'CASCADE'
      });
 };

  // Instance methods
  model.prototype.toJSON = function() {
      const values = { ...this.get() };
      delete values.password; // Don't send password in JSON responses
      return values;
  };

  // Class methods
  model.findByEmail = async function(email) {
      return await this.findOne({
          where: { email: email }
      });
  };

  model.findByIdNumber = async function(idNumber) {
      return await this.findOne({
          where: { idNumber: idNumber }
      });
  };

  return model;
};