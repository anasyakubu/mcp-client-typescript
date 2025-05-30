// server.js
import { createServer } from "@modelcontextprotocol/sdk/server/index.js";

const tools = [
  {
    name: "echo",
    description: "Echoes the input text",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string" },
      },
      required: ["text"],
    },
    execute: async ({ text }) => {
      return { content: `Echo: ${text}` };
    },
  },
];

const server = createServer({ tools });

server.start();
