const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    "Image",
    {
      id: {
        type: DataTypes.CHAR(36),
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.CHAR(36), // Updated to match User's id data type
        allowNull: false,
        unique: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    { timestamps: false }
  );

  // Define associations
  Image.associate = (models) => {
    Image.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return Image;
};
