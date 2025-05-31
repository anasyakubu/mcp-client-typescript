
```markdown
# MCP Docs Server

This project implements a Model Context Protocol (MCP) server in Node.js that provides a tool to search and fetch documentation snippets for popular AI/ML libraries.

---

## 🚀 Features

✅ MCP-compliant server (using `@modelcontextprotocol/sdk`)  
✅ Tool: **get_docs**  
✅ Searches Google for latest docs using Serper API  
✅ Supports:
- LangChain
- LlamaIndex
- OpenAI

✅ Returns plain text from documentation pages  
✅ Handles timeouts and search failures gracefully  

---

## 📁 Project Structure

```

mcp-docs-server/
├── server.js         # The MCP server implementation
├── .env              # Environment variables
└── README.md         # This file

````

---

## ⚙️ Setup

1. **Clone the repository**  
   ```bash
   git clone <repo-url>
   cd mcp-docs-server
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file**

   ```env
   SERPER_API_KEY=your_serper_api_key
   ```

4. **Run the MCP server**

   ```bash
   node server.js
   ```

---

## 🛠️ Usage

The server exposes one tool:

### get\_docs

* **Description**:
  Searches the latest documentation for a given query and library.

* **Arguments**:

  * `query` (string): e.g. `"Chroma DB"`
  * `library` (string): one of `"langchain"`, `"llama-index"`, `"openai"`

* **Returns**:
  Plain text content fetched from the search results.

Example usage from a compatible MCP client:

```bash
node client.js path/to/server.js
```

---

## 📦 Dependencies

* `@modelcontextprotocol/sdk`
* `dotenv`
* `httpx`
* `jsdom`

---

## 📝 Notes

* The MCP server uses the Serper API for Google search.
* To get a Serper API key, visit [serper.dev](https://serper.dev/).

---

## 🤝 Contributing

Feel free to open issues or submit pull requests!

---

## 📄 License

MIT License.

---

## 🔗 Links

* [Model Context Protocol (MCP)](https://modelcontext.org/)
* [Serper API](https://serper.dev/)

```
