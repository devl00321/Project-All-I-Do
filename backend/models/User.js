const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aadhaar_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    voter_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pan_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    face_photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aadhaar_photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pan_photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    edit_permission_status: {
      type: DataTypes.ENUM('NONE', 'REQUESTED', 'GRANTED'),
      defaultValue: 'NONE',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'),
      defaultValue: 'APPROVED',
    },
    role: {
      type: DataTypes.ENUM('CUSTOMER', 'DEALER', 'HQ'),
      defaultValue: 'CUSTOMER',
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  return User;
};

