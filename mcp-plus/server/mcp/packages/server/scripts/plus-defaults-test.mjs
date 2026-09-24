import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { WebSocket } from "ws";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const env={...process.env,PENPOT_MCP_SERVER_HOST:"127.0.0.1",PENPOT_MCP_SERVER_PORT:"4501",PENPOT_MCP_WEBSOCKET_PORT:"4502",PENPOT_MCP_REPL_PORT:"4503",PENPOT_MCP_LOG_LEVEL:"warn"};
const s=spawn(process.execPath,["dist/index.js","--multi-user"],{env,stdio:["ignore","pipe","pipe"]});
let out="";s.stdout.on("data",d=>out+=d);s.stderr.on("data",d=>out+=d);
try{
await sleep(1500);
const c=new Client({name:"d",version:"1"});await c.connect(new StreamableHTTPClientTransport(new URL("http://127.0.0.1:4501/mcp?userToken=tok")));
const tools=(await c.listTools()).tools.map(t=>t.name);
assert.deepEqual(tools.sort(),["execute_code","export_shape","high_level_overview","penpot_api_info"]);
console.log("default tools:",tools.join(","));
const r=await fetch("http://127.0.0.1:4501/mcp?userToken=tok",{method:"POST",headers:{"content-type":"application/json",accept:"application/json, text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"ping",params:{pad:"y".repeat(150000)}})});
assert.equal(r.status,413);console.log("150KB body with default limit ->",r.status);
const st=await fetch("http://127.0.0.1:4501/stats");assert.equal(st.status,404);console.log("/stats disabled by default ->",st.status);
const a=new WebSocket("ws://127.0.0.1:4502/?userToken=tok");await new Promise(r=>a.once("open",r));
const b=new WebSocket("ws://127.0.0.1:4502/?userToken=tok");const closed=await new Promise(r=>b.once("close",(code,reason)=>r([code,reason.toString()])));
assert.equal(closed[0],1008);console.log("duplicate connection with default policy ->",closed.join(" "));
assert.equal(a.readyState,1);a.close();
console.log("DEFAULTS OK");
}catch(e){console.error("FAIL",e,out);process.exitCode=1}finally{s.kill("SIGTERM");await new Promise(r=>s.once("exit",r));console.log("server stopped")}
