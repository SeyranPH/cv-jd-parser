import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "http";
import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const PORT = process.env.MCP_PORT || 4000;
const BACKEND_URL = process.env.BACKEND_URL || "http://cv-backend:3000";

const server = new McpServer({
  name: "cv-jd-mcp",
  version: "1.0.0",
});

server.registerTool(
  "cv.parse",
  {
    title: "CV Parser",
    description: "Parse a CV/Resume file (PDF/DOCX) and return structured JSON.",
    inputSchema: z
      .object({
        fileUrl: z.string().optional().describe("Public or presigned URL to the file"),
        filePath: z.string().optional().describe("Absolute path in the MCP container"),
      })
      .refine((data) => data.fileUrl || data.filePath, {
        message: "Either fileUrl or filePath must be provided",
      }),
  },
  async ({ fileUrl, filePath }) => {
    const form = new FormData();

    if (fileUrl) {
      const resp = await axios.get(fileUrl, { responseType: "stream" });
      const filename = path.basename(new URL(fileUrl).pathname || "cv.pdf");
      form.append("file", resp.data, { filename });
    } else {
      const filename = path.basename(filePath);
      form.append("file", fs.createReadStream(filePath), { filename });
    }

    const res = await axios.post(`${BACKEND_URL}/cv-parser/parse`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data, null, 2),
        },
      ],
    };
  }
);

server.registerTool(
  "jd.parse",
  {
    title: "Job Description Parser",
    description: "Parse a job description text into structured JSON.",
    inputSchema: z.object({
      text: z.string().describe("Raw job description text"),
    }),
  },
  async ({ text }) => {
    const res = await axios.post(`${BACKEND_URL}/jd-parser/parse`, { text }, {
      headers: { "Content-Type": "application/json" },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data, null, 2),
        },
      ],
    };
  }
);

const httpServer = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "MCP server running" }));
    return;
  }

  if (req.method === "POST" && req.url === "/mcp") {
    const transport = new StreamableHTTPServerTransport();
    await server.connect(transport);
    await transport.handleRequest(req, res);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

httpServer.listen(PORT, () => {
  console.log(`🔌 MCP server ready on port ${PORT}`);
  console.log(`↔️  Proxying to backend at ${BACKEND_URL}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
});
