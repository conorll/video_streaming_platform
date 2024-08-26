import dotenv from "dotenv";
dotenv.config();

import { v1 } from "@google-cloud/pubsub";

import processVideo from "./process-video";
import { setupDirectories } from "./storage";

import express from "express";

const app = express();
const port = 8080;

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

const subscription = process.env.PUBSUB_SUBSCRIPTION!;
const subClient = new v1.SubscriberClient();

async function processMessageAsync(message: any) {
  console.log(`Message recieved`);

  const rawData = message.message?.data?.toString();
  const data = rawData ? JSON.parse(rawData) : null;
  const inputFileName = data?.name;

  if (!inputFileName) {
    throw new Error(`Error: Message is missing filename`);
  }

  const fileExtension = inputFileName.split(".").pop()?.toLowerCase();

  if (!fileExtension || !supportedFormats.includes(fileExtension)) {
    throw new Error(
      `Unsupported file format: ${fileExtension}. Supported formats: ${supportedFormats.join(
        ", "
      )}`
    );
  }

  await processVideo(inputFileName);
  console.log(`Video: ${inputFileName} processed successfully`);
}

async function synchronousPullWithLeaseManagement() {
  const maxMessages = 1;
  const newAckDeadlineSeconds = 600;
  const request = {
    subscription,
    maxMessages,
    allowExcessMessages: false,
  };

  while (true) {
    let isProcessed = false;
    let isError = false;
    const [response] = await subClient.pull(request);
    const message = response.receivedMessages?.[0];

    if (!message) {
      console.log("No messages received. Waiting before next pull...");
      await new Promise((r) => setTimeout(r, 600000)); // Wait for 10 minutes
      continue;
    }

    processMessageAsync(message)
      .then(async () => {
        await subClient.acknowledge({
          subscription,
          ackIds: [message.ackId as string],
        });
        console.log(`Message acknowledged successfully`);
        isProcessed = true;
      })
      .catch((error) => {
        console.error("Error processing video:", error);
        isError = true;
      });

    while (true) {
      await new Promise((r) => setTimeout(r, 300000)); // Wait for 5 minutes
      if (isProcessed || isError) {
        break;
      } else {
        const modifyAckRequest = {
          subscription,
          ackIds: [message.ackId as string],
          ackDeadlineSeconds: newAckDeadlineSeconds,
        };

        await subClient.modifyAckDeadline(modifyAckRequest).catch((error) => {
          console.error("Error modifying acknowledgement deadline:", error);
        });

        console.log(
          `Message acknowledgement deadline reset to ${newAckDeadlineSeconds}s`
        );
      }
    }
  }
}

app.get("/", (req, res) => {
  res.send("Video processing service is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  setupDirectories();
  synchronousPullWithLeaseManagement();
});
