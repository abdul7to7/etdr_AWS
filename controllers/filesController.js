const express = require("express");
const AWS = require("aws-sdk");
const Expense = require("../models/Expense");
const app = express();
const crypto = require("crypto");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const bucketName = "etdr";
let fileName;

const generateFileHash = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

exports.downloadReport = async (req, res) => {
  try {
    data = await Expense.findAll({ where: { userId: req.user.id } });
    data = JSON.stringify(data);
    dataHash = generateFileHash(data);
    fileName = dataHash + ".json";
    await s3.headObject({ Bucket: bucketName, Key: fileName }).promise();
    const url = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: fileName,
      Expires: 60,
    });
    res.json({ url });
  } catch (err) {
    if (err.code === "NotFound") {
      const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: data,
        ContentType: "application/json",
      };
      await s3.putObject(params).promise();
      const url = s3.getSignedUrl("getObject", {
        Bucket: bucketName,
        Key: fileName,
        Expires: 60,
      });
      res.json({ url });
    } else {
      res.status(500).send(`Error: ${err.message}`);
    }
  }
};
