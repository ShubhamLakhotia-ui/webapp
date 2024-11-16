module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    "Token",
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to unverified
      },
    },
    { timestamps: false }
  );

  Token.associate = (models) => {
    Token.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return Token;
};
