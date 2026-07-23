import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const astroCli = fileURLToPath(
  new URL("../node_modules/astro/bin/astro.mjs", import.meta.url)
);

const child = spawn(process.execPath, [astroCli, ...process.argv.slice(2)], {
  env: {
    ...process.env,
    ASTRO_TELEMETRY_DISABLED: "1"
  },
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
