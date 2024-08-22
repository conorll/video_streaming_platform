import dotenv from "dotenv";
dotenv.config();

import { PubSub, Message } from "@google-cloud/pubsub";
import processVideo from "./process-video";
import { setupDirectories } from "./storage";
import express from "express";

const app = express();
const port = 8080;

const subscriptionName = process.env.PUBSUB_SUBSCRIPTION_NAME!;

const pubSubClient = new PubSub();

const supportedFormats = [
  "mp4",
  "avi",
  "mov",
  "mkv",
  "wmv",
  "flv",
  "webm",
  "mpeg",
  "mts",
  "3gp",
];

function listenForMessages() {
  const subscription = pubSubClient.subscription(subscriptionName, {
    flowControl: {
      maxMessages: 1,
    },
  });

  const messageHandler = async (message: Message) => {
    console.log(`Message recieved`);

    const data = JSON.parse(message.data.toString());
    const inputFileName = data.name;

    if (!inputFileName) {
      message.nack();
      console.error(`Error: Message is missing filename`);
      return;
    }

    const fileExtension = inputFileName.split(".").pop()?.toLowerCase();

    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      message.nack();
      console.error(
        `Unsupported file format: ${fileExtension}. Supported formats: ${supportedFormats.join(
          ", "
        )}`
      );
      return;
    }

    try {
      await processVideo(inputFileName);
    } catch (error) {
      message.nack();
      console.error(`Error processing video`, error);
      return;
    }

    message.ack();
    console.log(`Successfuly proccessed video: ${inputFileName}`);
  };

  subscription.on("message", messageHandler);
}

app.get("/", (req, res) => {
  res.send("Video processing service is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  setupDirectories();
  listenForMessages();
});
