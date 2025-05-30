// server.js
import { MCPServer } from "@modelcontextprotocol/sdk/server";
import { createTool } from "@modelcontextprotocol/sdk/server";
import dotenv from "dotenv";
import httpx from "httpx";
import { JSDOM } from "jsdom";

dotenv.config();

const USER_AGENT = "docs-app/1.0";
const SERPER_URL = "https://google.serper.dev/search";

const docsUrls = {
  langchain: "python.langchain.com/docs",
  "llama-index": "docs.llamaindex.ai/en/stable",
  openai: "platform.openai.com/docs",
};

async function searchWeb(query) {
  const payload = JSON.stringify({
    q: query,
    num: 2,
  });

  const headers = {
    "X-API-KEY": process.env.SERPER_API_KEY,
    "Content-Type": "application/json",
  };

  try {
    const response = await httpx.post(SERPER_URL, {
      headers,
      body: payload,
      timeout: 30_000,
    });
    return await response.json();
  } catch (e) {
    console.error("Error in searchWeb:", e);
    return { organic: [] };
  }
}

async function fetchUrl(url) {
  try {
    const response = await httpx.get(url, { timeout: 30_000 });
    const dom = new JSDOM(response.body);
    const text = dom.window.document.body.textContent;
    return text;
  } catch (e) {
    console.error("Error in fetchUrl:", e);
    return "Timeout or fetch error";
  }
}

const getDocs = createTool({
  name: "get_docs",
  description: `
  Search the latest docs for a given query and library.
  Supports langchain, openai, and llama-index.
  
  Args:
    query: The query to search for (e.g. "Chroma DB")
    library: The library to search in (e.g. "langchain")
  
  Returns:
    Text from the docs
  `,
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" },
      library: { type: "string" },
    },
    required: ["query", "library"],
  },
  execute: async ({ query, library }) => {
    if (!docsUrls[library]) {
      throw new Error(`Library ${library} not supported by this tool`);
    }

    const searchQuery = `site:${docsUrls[library]} ${query}`;
    const results = await searchWeb(searchQuery);

    if (results.organic.length === 0) {
      return { content: "No results found" };
    }

    let text = "";
    for (const result of results.organic) {
      text += await fetchUrl(result.link);
    }

    return { content: text };
  },
});

// Create the MCP server
const server = new MCPServer({
  name: "docs",
  version: "1.0.0",
  tools: [getDocs],
});

server.run({ transport: "stdio" });
