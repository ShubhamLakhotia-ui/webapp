const { timeStamp } = require("console");
const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.CHAR(36),
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Email address already in use!",
        },
        validate: {
          isGmail(value) {
            if (!value.endsWith("@gmail.com")) {
              throw new Error("Email must be a @gmail.com address");
            }
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          is: {
            args: [/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/],
            msg: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
          },
        },
      },

      account_created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Set current timestamp by default
      },
      account_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Automatically set to current timestamp
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to false, meaning unverified
      },
    },
    { timestamps: false }
  );

  User.associate = (models) => {
    User.hasOne(models.Image, { foreignKey: "user_id", as: "profileImage" });
    User.hasMany(models.Token, { foreignKey: "user_id", as: "tokens" });
  };

  return User;
};
