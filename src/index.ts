import { execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

type DenoMediaType = "TypeScript" | "TSX" | "JavaScript" | "JSX" | "Json";

interface ResolvedInfo {
  kind: "esm";
  local: string;
  size: number;
  mediaType: DenoMediaType;
  specifier: string;
  dependencies: Array<{
    specifier: string;
    code: {
      specifier: string;
      span: { start: unknown; end: unknown };
    };
  }>;
}

interface NpmResolvedInfo {
  kind: "npm";
  specifier: string;
  npmPackage: string;
}

interface ResolveError {
  specifier: string;
  error: string;
}

interface DenoInfoJsonV1 {
  version: 1;
  redirects: Record<string, string>;
  roots: string[];
  modules: Array<NpmResolvedInfo | ResolvedInfo | ResolveError>;
}

function isResolveError(
  info: NpmResolvedInfo | ResolvedInfo | ResolveError,
): info is ResolveError {
  return "error" in info && typeof info.error === "string";
}

let checkedDenoInstall = false;
const DENO_BINARY = process.platform === "win32" ? "deno.exe" : "deno";

function resolveDeno(
  id: string,
  cwd: string,
  resolver = "none",
): ResolvedInfo | NpmResolvedInfo | null {
  if (!checkedDenoInstall) {
    try {
      execSync(`${DENO_BINARY} --version`, { cwd });
      checkedDenoInstall = true;
    } catch {
      throw new Error(
        `Deno binary could not be found. Install Deno to resolve this error.`,
      );
    }
  }

  // There is no JS-API in Deno to get the final file path in Deno's
  // cache directory. The `deno info` command reveals that information
  // though, so we can use that.
  let output: string | null = null;
  try {
    output = execSync(
      `${DENO_BINARY} info --no-lock --node-modules-dir=${resolver} --json '${id}'`,
      { cwd },
    ).toString("utf8");
    // deno-lint-ignore no-empty
  } catch {}

  if (output === null) return null;

  const json = JSON.parse(output) as DenoInfoJsonV1;
  const actualId = json.roots[0];

  // Find the final resolved cache path. First, we need to check
  // if the redirected specifier, which represents the final specifier.
  // This is often used for `http://` imports where a server can do
  // redirects.
  const redirected = json.redirects[actualId] ?? actualId;

  // Find the module information based on the redirected specifier
  const mod = json.modules.find((info) => info.specifier === redirected);
  if (mod === undefined) {
    // I don't understand how Deno module resolution works well enough but this seems
    // to work in cases where the other resolvers fail so let's try this before giving up.
    if (resolver !== "manual") {
      return resolveDeno(id, cwd, "manual");
    }

    return null;
  }

  // Specifier not found by deno
  if (isResolveError(mod)) {
    return null;
  }

  return mod;
}

export const interfaceVersion = 2;

export function resolve(moduleName: string, importer: string) {
  if (!moduleName.startsWith(".") && !moduleName.startsWith("/")) {
    try {
      moduleName = require.resolve(moduleName);
    } catch {
      // Ignore: not resolvable
    }
  }

  const resolved = resolveDeno(moduleName, path.dirname(importer));

  if (resolved === null) {
    return { found: false };
  }

  return { found: true, path: null };
}
