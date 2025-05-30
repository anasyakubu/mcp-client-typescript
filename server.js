// server.js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Echo Server",
  version: "1.0.0"
});

// Add AI-powered question answering tool
server.tool(
  "ask_ai",
  {
    question: z.string().describe("The question you want to ask the AI"),
    context: z.string().optional().describe("Additional context for the question")
  },
  async ({ question, context }) => {
    try {
      // Call OpenAI API or another AI service
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return {
          content: [{
            type: "text",
            text: "Error: OpenAI API key not found. Please set OPENAI_API_KEY environment variable."
          }]
        };
      }

      const prompt = context
        ? `Context: ${context}\n\nQuestion: ${question}\n\nPlease provide a helpful and accurate answer.`
        : `Question: ${question}\n\nPlease provide a helpful and accurate answer.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant. Provide accurate, concise, and useful answers to questions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          content: [{
            type: "text",
            text: `API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
          }]
        };
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'No response generated';

      return {
        content: [{ type: "text", text: aiResponse }]
      };

    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error calling AI service: ${error.message}`
        }]
      };
    }
  }
);

// Alternative: Use Anthropic Claude API
server.tool(
  "ask_claude",
  {
    question: z.string().describe("The question you want to ask Claude AI"),
    context: z.string().optional().describe("Additional context for the question")
  },
  async ({ question, context }) => {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return {
          content: [{
            type: "text",
            text: "Error: Anthropic API key not found. Please set ANTHROPIC_API_KEY environment variable."
          }]
        };
      }

      const prompt = context
        ? `Context: ${context}\n\nQuestion: ${question}\n\nPlease provide a helpful and accurate answer.`
        : question;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          content: [{
            type: "text",
            text: `API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
          }]
        };
      }

      const data = await response.json();
      const aiResponse = data.content[0]?.text || 'No response generated';

      return {
        content: [{ type: "text", text: aiResponse }]
      };

    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error calling Claude API: ${error.message}`
        }]
      };
    }
  }
);

server.tool(
  "calculate",
  {
    expression: z.string().describe("Mathematical expression to calculate (e.g., '2 + 2', '10 * 5', 'sqrt(16)')"),
  },
  async ({ expression }) => {
    try {
      // Simple math evaluation (be careful with eval in production!)
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return {
        content: [{ type: "text", text: `${expression} = ${result}` }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error calculating "${expression}": ${error.message}` }]
      };
    }
  }
);

server.tool(
  "get_time",
  {},
  async () => {
    const now = new Date();
    return {
      content: [{
        type: "text",
        text: `Current time: ${now.toLocaleString()} (${now.toISOString()})`
      }]
    };
  }
);

server.tool(
  "generate_password",
  {
    length: z.number().min(4).max(50).default(12).describe("Length of the password"),
    includeSymbols: z.boolean().default(true).describe("Include special characters")
  },
  async ({ length, includeSymbols }) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const charset = includeSymbols ? chars + symbols : chars;

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return {
      content: [{ type: "text", text: `Generated password: ${password}` }]
    };
  }
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);