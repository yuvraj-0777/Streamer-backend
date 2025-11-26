import { kafka } from "./client.kafka.js";

async function init() {
  const admin = kafka.admin();
  console.log("Admin connecting...");
  admin.connect();
  console.log("Admin connection SUCCESS");

  console.log("Creating Topic [comment-update]");

  await admin.createTopics({
    topics: [
      {
        topic: "comment-update",
        numPartitions: 2,
      },
    ],
  });

  console.log("Creating Topic SUCCESS [comment-update]");

  console.log("Disconnecting Admin...");
  await admin.disconnect();
}

init();
