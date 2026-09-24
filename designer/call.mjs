// Minimal Penpot MCP client.
// Usage: node call.mjs <tool> [json-args | @file.json]
//        node call.mjs exec <file.js> [prelude.js ...]   -> execute_code with concatenated files
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { readFileSync, appendFileSync } from "node:fs";

const url = process.env.PENPOT_MCP_URL || readFileSync(new URL("./.mcp-url", import.meta.url), "utf8").trim();
const [, , tool, ...rest] = process.argv;

const client = new Client({ name: "arasta-builder", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(new URL(url));
await client.connect(transport);

try {
  if (!tool || tool === "list") {
    const { tools } = await client.listTools();
    for (const t of tools) console.log(`- ${t.name}: ${t.description?.slice(0, 300)}\n  args: ${JSON.stringify(t.inputSchema?.properties)}`);
  } else {
    let name = tool, args = {};
    if (tool === "exec") {
      name = "execute_code";
      const files = [...rest.slice(1), rest[0]]; // preludes first, main file last
      args = { code: files.map((f) => readFileSync(f, "utf8")).join("\n;\n") };
    } else if (rest[0]) {
      args = JSON.parse(rest[0].startsWith("@") ? readFileSync(rest[0].slice(1), "utf8") : rest[0]);
    }
    const t0 = Date.now(); let res, err;
    try { res = await client.callTool({ name, arguments: args }, undefined, { timeout: 600000 }); } catch (e) { err = e; }
    const text = res ? (res.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("\n") : String(err);
    appendFileSync(new URL("./mcp-log.jsonl", import.meta.url), JSON.stringify({
      ts: new Date().toISOString(), tool: name, label: process.env.LABEL || rest[0] || "", ms: Date.now() - t0,
      codeBytes: args.code?.length ?? 0, ok: !err && !res.isError, out: text.slice(0, 1500) }) + "\n");
    if (err) { console.error(String(err)); process.exit(2); }
    for (const c of res.content ?? []) {
      if (c.type === "text") console.log(c.text);
      else if (c.type === "image") console.log(`[image ${c.mimeType}, ${c.data.length} b64 chars]`), process.env.IMG_OUT && (await import("node:fs")).writeFileSync(process.env.IMG_OUT, Buffer.from(c.data, "base64"));
      else console.log(JSON.stringify(c).slice(0, 2000));
    }
    if (res.isError) process.exitCode = 1;
  }
} finally {
  try { await transport.terminateSession(); } catch {}
  await client.close();
}
