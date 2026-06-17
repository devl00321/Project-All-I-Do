module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'BUSY', 'OFFLINE'),
      defaultValue: 'AVAILABLE',
    },
    current_lat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    current_lng: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  return Worker;
};
