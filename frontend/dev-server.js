/**
 * Starts Next.js dev server with NODE_PATH set to this project's node_modules.
 * Required when distDir is outside the project tree (e.g. outside OneDrive).
 */
const { spawn } = require("child_process");
const path = require("path");

const env = {
  ...process.env,
  NODE_PATH: path.join(__dirname, "node_modules"),
};

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  env,
  shell: true,
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
child.on("exit", (code) => process.exit(code ?? 0));
