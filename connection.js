// const express = require("express");
// const mysql = require("mysql");
// const bcrypt = require("bcrypt");
// const PORT = 4200;
// const dotenv = require("dotenv");
// const multer = require("multer");
// const db = require("./models");
// const path = require("path");
// const fs = require("fs");
// const basicAuth = require("basic-auth");
// const { User, Image } = require("./models");
// dotenv.config();

// const app = express();
// app.use(express.json());

// const checkdbConnection = async (req, res, next) => {
//   try {
//     await db.sequelize.authenticate();
//     console.log("Database connection is healthy");
//     next();
//   } catch (error) {
//     console.error("Database connection failed:", error.message);
//     return res.status(503).json({ message: "Connection Failed" });
//   }
// };

// app.use(checkdbConnection);

// app.head("/healthz", (req, res) => {
//   res.status(405).end();
// });

// app.head("/v1/user/self", (req, res) => {
//   res.status(405).send();
// });

// const authenticate = async (req, res, next) => {
//   const credentials = basicAuth(req);
//   console.log("Credentials", credentials);

//   if (!credentials || !credentials.name || !credentials.pass) {
//     return res.status(401).send("Authentication required");
//   }

//   try {
//     const user = await User.findOne({ where: { email: credentials.name } });

//     if (!user || !(await bcrypt.compare(credentials.pass, user.password))) {
//       return res.status(401).send("Invalid credentials");
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// };

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "uploads");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const userId = req.user ? req.user.id : "guest";
//     const fileName = `${userId}-${Date.now()}-${file.originalname}`;
//     cb(null, fileName);
//   },
// });
// const upload = multer({ storage });

// app.post(
//   "/v1/user/self/pic",
//   authenticate,
//   upload.single("profilePic"),
//   async (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const userId = req.user.id;

//     try {
//       const existingImage = await Image.findOne({ where: { user_id: userId } });

//       if (existingImage) {
//         return res
//           .status(400)
//           .json({ message: "Profile picture already exists for this user." });
//       }

//       // Create a new image record
//       const fileName = req.file.filename;
//       const filePath = path.join("uploads", fileName);
//       const image = await Image.create({
//         file_name: fileName,
//         url: filePath,
//         upload_date: new Date(),
//         user_id: userId,
//       });

//       res.status(201).json({
//         file_name: image.file_name,
//         id: image.id,
//         url: image.url,
//         upload_date: image.upload_date,
//         user_id: image.user_id,
//       });
//     } catch (error) {
//       console.error("Error saving image:", error);
//       res.status(500).json({ message: "Error saving image" });
//     }
//   }
// );

// app.post("/v1/user", async (req, res) => {
//   const { first_name, last_name, email, password } = req.body;
//   if (!first_name || !last_name || !email || !password) {
//     return res.status(400).json({
//       error:
//         "All fields are required: first_name, last_name, email, and password.",
//     });
//   }
//   try {
//     if ("account_created" in req.body || "account_updated" in req.body) {
//       return res.status(400).end();
//     }
//     const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
//     if (!passwordRegex.test(password)) {
//       return res.status(400).json({
//         message:
//           "Password must be at least 8 characters long, contain at least one uppercase letter, and one special character.",
//       });
//     }
//     const hashedPassword = await bcrypt.hash(password, 12);

//     const user = await User.create({
//       first_name: first_name,
//       last_name: last_name,
//       email: email,
//       password: hashedPassword,
//       account_created: new Date(),
//       account_updated: new Date(),
//     });
//     res.status(201).json({
//       id: user.id,
//       first_name: user.first_name,
//       last_name: user.last_name,
//       email: user.email,
//       account_created: user.account_created,
//       account_updated: user.account_updated,
//     });
//   } catch (error) {
//     if (error.name === "SequelizeValidationError") {
//       return res.status(400).end();
//     }
//     if (error.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({ error: "Email already exists" });
//     }
//     return res.status(503).end();
//   }
// });

// app.get("/v1/user/self", authenticate, async (req, res) => {
//   res.setHeader("Cache-Control", "no-cache");

//   const raw_body = Object.keys(req.body).length;
//   if (req.body && raw_body > 0) {
//     return res.status(400).end();
//   }

//   const url_check = Object.keys(req.query).length;
//   if (url_check > 0) {
//     return res.status(400).end();
//   }
//   if (req.headers["content-length"] > 0 || req.headers["transfer-encoding"]) {
//     return res.status(400).end();
//   }

//   const user = req.user;
//   try {
//     res.status(200).json({
//       id: user.id,
//       first_name: user.first_name,
//       last_name: user.last_name,
//       email: user.email,
//       account_created: user.account_created,
//       account_updated: user.account_updated,
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.put("/v1/user/self", authenticate, async (req, res) => {
//   const { first_name, last_name, email, password } = req.body;
//   const user = req.user;
//   if ("account_created" in req.body || "account_updated" in req.body) {
//     return res.status(400).end();
//   }
//   if (email && email !== user.email) {
//     return res.status(400).end();
//   }

//   if (req.body.account_created || req.body.account_updated) {
//     return res.status(400).end();
//   }

//   if (!first_name || !last_name || !email || !password) {
//     return res.status(400).json({
//       error:
//         "All fields are required: first_name, last_name, email, and password.",
//     });
//   }
//   const updatedUser = {};
//   if (first_name) {
//     updatedUser.first_name = first_name;
//   }
//   if (last_name) {
//     updatedUser.last_name = last_name;
//   }
//   if (password) {
//     updatedUser.password = await bcrypt.hash(password, 12);
//   }

//   console.log("updated_user", updatedUser);

//   try {
//     await user.update({
//       ...updatedUser,
//       account_updated: new Date(),
//     });

//     res.status(204).end();
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.get("/healthz", async (req, res) => {
//   res.setHeader("Cache-Control", "no-cache");

//   const raw_body = Object.keys(req.body).length;
//   if (req.body && raw_body > 0) {
//     return res.status(400).end();
//   }

//   const url_check = Object.keys(req.query).length;
//   if (url_check > 0) {
//     return res.status(400).end();
//   }
//   if (req.headers["content-length"] > 0 || req.headers["transfer-encoding"]) {
//     return res.status(400).end();
//   }

//   try {
//     await db.sequelize.authenticate();
//     return res.status(200).end();
//   } catch (error) {
//     return res.status(503).end();
//   }
// });

// app.all("/healthz", (req, res) => {
//   res.setHeader("Cache-Control", "no-cache");
//   return res.status(405).end();
// });

// app.delete("/v1/user/self", (req, res) => {
//   res.status(405).send();
// });

// app.options("/v1/user/self", (req, res) => {
//   res.status(405).send();
// });

// app.patch("/v1/user/self", (req, res) => {
//   res.status(405).send();
// });

// db.sequelize
//   .sync()
//   .then(() => {
//     app.listen(4100, () => {
//       console.log("server running");
//     });
//   })
//   .catch((error) => {
//     console.error("Failed to sync database:", error);
//   });

// module.exports = app;

const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const PORT = 4100;
const dotenv = require("dotenv");
const multer = require("multer");
const AWS = require("aws-sdk");
const db = require("./models");
const basicAuth = require("basic-auth");
const { User, Image } = require("./models");
dotenv.config();

const app = express();
app.use(express.json());

// Initialize AWS SDK for S3
const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const s3BucketName = process.env.S3_BUCKET_NAME;

// Database connection check middleware
const checkdbConnection = async (req, res, next) => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connection is healthy");
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(503).json({ message: "Connection Failed" });
  }
};

app.use(checkdbConnection);

// Health checks
app.head("/healthz", (req, res) => {
  res.status(405).end();
});

app.head("/v1/user/self", (req, res) => {
  res.status(405).send();
});

// Basic Authentication middleware
const authenticate = async (req, res, next) => {
  const credentials = basicAuth(req);
  if (!credentials || !credentials.name || !credentials.pass) {
    return res.status(401).send("Authentication required");
  }

  try {
    const user = await User.findOne({ where: { email: credentials.name } });
    if (!user || !(await bcrypt.compare(credentials.pass, user.password))) {
      return res.status(401).send("Invalid credentials");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// Configure multer to store file in memory and allow only specific image formats
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed."),
        false
      );
    }
  },
});

// S3 Image Upload Function
const uploadImageToS3 = async (fileBuffer, fileName, userId, mimeType) => {
  const params = {
    Bucket: s3BucketName,
    Key: `${userId}/${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
    Metadata: { uploadedBy: userId.toString() },
  };
  return s3.upload(params).promise();
};

// Profile picture upload route
app.post(
  "/v1/user/self/pic",
  authenticate,
  upload.single("profilePic"),
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or unsupported file format." });
    }

    const userId = req.user.id;

    try {
      const existingImage = await Image.findOne({ where: { user_id: userId } });

      if (existingImage) {
        return res
          .status(400)
          .json({ message: "Profile picture already exists for this user." });
      }

      // Upload image to S3
      const fileName = req.file.originalname;
      const s3Response = await uploadImageToS3(
        req.file.buffer,
        fileName,
        userId,
        req.file.mimetype
      );

      // Save image record in the database
      const image = await Image.create({
        file_name: fileName,
        url: s3Response.Location, // URL from S3 response
        upload_date: new Date(),
        user_id: userId,
      });

      res.status(201).json({
        file_name: image.file_name,
        id: image.id,
        url: image.url,
        upload_date: image.upload_date,
        user_id: image.user_id,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Error uploading image" });
    }
  }
);

// S3 Image Delete Function
const deleteImageFromS3 = async (key) => {
  const params = {
    Bucket: s3BucketName,
    Key: key,
  };
  return s3.deleteObject(params).promise();
};

// Route to delete profile picture from S3 and database
app.delete("/v1/user/self/pic", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const existingImage = await Image.findOne({ where: { user_id: userId } });
    if (!existingImage) {
      return res
        .status(404)
        .json({ message: "No profile picture found for this user." });
    }

    const imageKey = `${userId}/${existingImage.file_name}`;
    await deleteImageFromS3(imageKey);
    await existingImage.destroy();

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Error deleting image" });
  }
});

// User Registration Endpoint
app.post("/v1/user", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      error:
        "All fields are required: first_name, last_name, email, and password.",
    });
  }
  try {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, and one special character.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      account_created: new Date(),
      account_updated: new Date(),
    });
    res.status(201).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_created: user.account_created,
      account_updated: user.account_updated,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(503).json({ message: "Server error" });
  }
});

// Fetch User Profile Endpoint
app.get("/v1/user/self", authenticate, async (req, res) => {
  const user = req.user;
  try {
    res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_created: user.account_created,
      account_updated: user.account_updated,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
db.sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to sync database:", error);
  });

module.exports = app;
