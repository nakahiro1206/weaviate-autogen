// "use server";

// import { client } from "./client";

// export const summarizeDocument = async (document: File): Promise<undefined> => {
//   const assistant = await client.beta.assistants.create({
//     name: "PDF Summarizer",
//     instructions: "You summarize PDF documents uploaded by the user.",
//     model: "gpt-4-turbo",
//     tools: [{ type: "file_search" }], // important if you want it to handle file input
//   });

//   const file = await client.files.create({
//     file: document,
//     purpose: "assistants", // or "fine-tune" or whatever fits your use case
//   });

//   const thread = await client.beta.threads.create();

//   await client.beta.threads.messages.create(thread.id, {
//     role: "user",
//     attachments: [
//       {
//         file_id: file.id,
//         tools: [{ type: "file_search" }],
//       },
//     ],
//     content: "Please summarize this PDF.",
//   });

//   // const run = await client.beta.threads.runs.create(thread.id, {
//   //   assistant_id: assistant.id,
//   // });

//   const run = await client.beta.threads.runs.createAndPoll(thread.id, {
//     assistant_id: assistant.id,
//   });

//   const allMessages = await client.beta.threads.messages.list(thread.id);
//   console.log("allMessages", allMessages);

//   let runStatus;
//   do {
//     await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2s
//     runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
//   } while (runStatus.status !== "completed" && runStatus.status !== "failed");

//   if (runStatus.status === "completed") {
//     const messages = await client.beta.threads.messages.list(thread.id);
//     const latest = messages.data[0]; // usually most recent first

//     console.log("Assistant reply:\n", latest.content[0]);
//   } else {
//     console.error("Run failed or was incomplete:", runStatus.status);
//   }

//   // const response = await client.chat.completions.create({
//   //   model: "gpt-4o",
//   //   messages: [
//   //     {
//   //       role: "system",
//   //       content: "You are a helpful assistant that summarizes documents.",
//   //     },
//   //     {
//   //       role: "user",
//   //       content: `Please summarize the following document (${file.filename}):\n\n${file}`,
//   //     },
//   //   ],
//   //   // stream: true,
//   // });

//   // return response.choices[0]?.message.content;
// };
