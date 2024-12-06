const express = require("express");
const StatsD = require("node-statsd");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const multer = require("multer");
const AWS = require("aws-sdk");
const db = require("./models");
const basicAuth = require("basic-auth");
const { User, Image, Token } = require("./models");
const crypto = require("crypto");
dotenv.config();

const app = express();
const PORT = 4100;

// StatsD client for logging metrics
const client = new StatsD();

// Initialize AWS SDK for S3
const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const s3BucketName = process.env.S3_BUCKET_NAME;

const sns = new AWS.SNS({
  region: process.env.AWS_REGION,
});

app.use(express.json());

const logApiMetrics = (req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    client.increment(`api.${req.method}.${req.originalUrl}`);
    client.timing(`api.${req.method}.${req.originalUrl}.duration`, duration);
  });
  next();
};
app.use(logApiMetrics);

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

app.head("/v1/user/self/pic", (req, res) => {
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

const checkVerified = async (req, res, next) => {
  try {
    const latestToken = await Token.findOne({
      where: { user_id: req.user.id },
      order: [["expires_at", "DESC"]], // Get the most recent token
    });

    if (!latestToken) {
      return res.status(403).json({ error: "Verification token not found" });
    }

    if (!latestToken.verified) {
      return res.status(403).json({ error: "Email not verified" });
    }

    next();
  } catch (error) {
    console.error("Error checking verification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Configure multer to store file in memory and allow only specific image format

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed."));
    }
  },
  limits: {
    files: 1, // Only one file allowed at a time
  },
});

// S3 Image Upload Function
const uploadImageToS3 = async (fileBuffer, fileName, userId, mimeType) => {
  const params = {
    Bucket: s3BucketName,
    Key: `${userId}/${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
    Metadata: {
      uploadedBy: userId.toString(),
      fileType: mimeType,
      uploadDate: new Date().toISOString(),
    },
  };
  return s3.upload(params).promise();
};

app.get("/v1/user/self/pic", authenticate, checkVerified, async (req, res) => {
  try {
    const userId = req.user.id;
    const image = await db.Image.findOne({ where: { user_id: userId } });
    if (!image)
      return res.status(404).json({ error: "No profile picture found." });

    res.status(200).json({
      file_name: image.file_name,
      id: userId,
      url: image.url,
      upload_date: image.upload_date,
      user_id: userId,
    });
  } catch (error) {
    console.error("Error retrieving profile picture:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Profile picture upload route
// app.post(
//   "/v1/user/self/pic",
//   authenticate,
//   upload.single("profilePic"),
//   async (req, res) => {
//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ message: "No file uploaded or unsupported file format." });
//     }

//     const userId = req.user.id;

//     try {
//       const existingImage = await Image.findOne({ where: { user_id: userId } });

//       if (existingImage) {
//         return res
//           .status(400)
//           .json({ message: "Profile picture already exists for this user." });
//       }
//       const fileType = req.file.mimetype;
//       const validMimeTypes = ["image/png", "image/jpeg", "image/jpg"];

//       if (!validMimeTypes.includes(fileType)) {
//         return res.status(400).json({
//           error: "Only .png, .jpg, and .jpeg files are supported.",
//         });
//       }
//       const imageUrl = `${s3BucketName}/${userId}/${req.file.originalname}`;
//       const metadata = JSON.stringify({
//         uploadedBy: userId,
//         uploadDate,
//         fileType: req.file.mimetype,
//       });

//       // Upload image to S3
//       const fileName = req.file.originalname;
//       const s3Response = await uploadImageToS3(
//         req.file.buffer,
//         fileName,
//         userId,
//         req.file.mimetype
//       );

//       // Save image record in the database
//       const image = await Image.create({
//         file_name: fileName,
//         url: imageUrl,
//         upload_date: new Date(),
//         user_id: userId,
//         metadata,
//       });

//       res.status(201).json({
//         file_name: image.file_name,
//         id: image.id,
//         url: image.url,
//         upload_date: image.upload_date,
//         user_id: image.user_id,
//       });
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       if (error.message.includes("Invalid file type")) {
//         return res.status(400).json({ error: error.message });
//       }
//       next(error);
//     }
//   }
// );

app.post(
  "/v1/user/self/pic",
  authenticate,
  checkVerified,
  upload.single("profilePic"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        // This message will be shown if no file was uploaded
        return res.status(400).json({ error: "No file uploaded." });
      }

      const fileType = req.file.mimetype;
      const validMimeTypes = ["image/png", "image/jpeg", "image/jpg"];

      if (!validMimeTypes.includes(fileType)) {
        return res.status(400).json({
          error: "Only .png, .jpg, and .jpeg files are supported.",
        });
      }

      const userId = req.user.id;

      // Check if a profile picture already exists
      const existingImage = await db.Image.findOne({
        where: { user_id: userId },
      });
      if (existingImage) {
        return res.status(400).json({
          error:
            "A profile picture already exists. Delete it to upload a new one.",
        });
      }

      const fileName = req.file.originalname;
      const uploadDate = new Date().toISOString();

      const imageUrl = `${s3BucketName}/${userId}/${fileName}`;
      const s3Response = await uploadImageToS3(
        req.file.buffer,
        fileName,
        userId,
        req.file.mimetype
      );

      const image = await db.Image.create({
        file_name: fileName,
        url: imageUrl,
        upload_date: uploadDate,
        user_id: userId,
      });

      res.status(201).json({
        file_name: fileName,
        id: image.id,
        url: imageUrl,
        upload_date: uploadDate,
        user_id: userId,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.message.includes("Invalid file type")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
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
app.delete(
  "/v1/user/self/pic",
  authenticate,
  checkVerified,
  async (req, res) => {
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
  }
);

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

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await Token.create({ token, expires_at: expiresAt, user_id: user.id });
    const verificationLink = `https://${process.env.DOMAIN_NAME}/verify?user=${email}&token=${token}`;

    console.log("verificationLink", verificationLink);

    const message = {
      email,
      verification_link: verificationLink,
    };

    try {
      await sns
        .publish({
          TopicArn: process.env.SNS_TOPIC_ARN,
          Message: JSON.stringify(message),
        })
        .promise();
    } catch (snsError) {
      console.error("SNS Publish Error:", snsError); // Logs detailed error
      return res.status(500).json({
        error: "Failed to send verification email",
        details:
          snsError.message || "An error occurred while publishing to SNS",
      });
    }

    // await sns
    //   .publish({
    //     TopicArn: process.env.SNS_TOPIC_ARN,
    //     Message: JSON.stringify(message),
    //   })
    //   .promise();

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

app.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const tokenRecord = await Token.findOne({ where: { token } });
    if (!tokenRecord || new Date() > tokenRecord.expires_at) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    tokenRecord.verified = true;
    await tokenRecord.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch User Profile Endpoint
app.get("/v1/user/self", authenticate, checkVerified, async (req, res) => {
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

app.get("/healthz", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache");

  try {
    await db.sequelize.authenticate();
    return res.status(200).end();
  } catch (error) {
    return res.status(503).end();
  }
});

app.get("/CICD", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache");

  try {
    await db.sequelize.authenticate();
    return res.status(200).end();
  } catch (error) {
    return res.status(503).end();
  }
});

// app.get("/cicd", async (req, res) => {
//   res.setHeader("Cache-Control", "no-cache");

//   try {
//     await db.sequelize.authenticate();
//     return res.status(200).end();
//   } catch (error) {
//     return res.status(503).end();
//   }
// });

app.all("/healthz", (req, res) => {
  res.set("Cache-Control", "no-cache");
  res.status(405).send();
});

app.options("/v1/user/self/pic", (req, res) => {
  res.status(405).send();
});

app.patch("/v1/user/self/pic", (req, res) => {
  res.status(405).send();
});

app.put("/v1/user/self/pic", (req, res) => {
  res.status(405).send();
});

app.delete("/v1/user/self", (req, res) => {
  res.status(405).send();
});

app.options("/v1/user/self", (req, res) => {
  res.status(405).send();
});

app.patch("/v1/user/self", (req, res) => {
  res.status(405).send();
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

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ error: "Only one file can be uploaded at a time." });
    }
    return res.status(400).json({ error: err.message });
  } else if (
    err.message === "Invalid file type. Only JPG, JPEG, and PNG are allowed."
  ) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
