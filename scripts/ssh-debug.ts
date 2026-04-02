/**
 * SSH debug script — connects to VPS and runs diagnostic commands.
 * Usage: bunx tsx scripts/ssh-debug.ts <IP> <PASSWORD>
 */
import { Client } from "ssh2";

const ip = process.argv[2] || "204.168.226.195";
const password = process.argv[3] || "EautvrgfnuiF";

const commands = [
  "echo '===DOCKER_PS==='",
  "docker ps",
  "echo '===HEALTHZ==='",
  "curl -s http://127.0.0.1:18789/healthz 2>&1",
  "echo ''",
  "echo '===OPENCLAW_LOGS==='",
  "docker logs openclaw-gateway --tail 10 2>&1",
  "echo '===CADDY_LOGS==='",
  "docker logs caddy --tail 10 2>&1",
];

const conn = new Client();
conn.on("ready", () => {
  console.log("SSH connected. Running diagnostics...\n");
  const fullCmd = commands.join(" ; ");
  conn.exec(fullCmd, (err: Error | undefined, stream: any) => {
    if (err) { console.error("exec error:", err); conn.end(); return; }
    let output = "";
    stream.on("data", (data: Buffer) => { output += data.toString(); process.stdout.write(data); });
    stream.stderr.on("data", (data: Buffer) => { output += data.toString(); process.stderr.write(data); });
    stream.on("close", () => { conn.end(); process.exit(0); });
  });
}).on("error", (err: Error) => {
  console.error("SSH connection error:", err.message);
  process.exit(1);
}).connect({
  host: ip,
  port: 22,
  username: "root",
  password: password,
});
