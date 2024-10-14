import { exec } from "node:child_process";
import path from "node:path";
import { before, describe, it } from "node:test";
import util from "node:util";

const execAsync = util.promisify(exec);

const rootPath = path.resolve(import.meta.dirname, "../");
const fixturePath = path.resolve(import.meta.dirname, "./fixture");
const eslintBinPath = path.resolve(fixturePath, "./node_modules/.bin/eslint");

describe("eslint-import-resolver-deno", () => {
  before(() =>
    Promise.all([
      execAsync("deno install", {
        cwd: fixturePath,
      }),
      execAsync("npm run build", {
        cwd: rootPath,
      }),
    ]),
  );

  it("works", () =>
    execAsync(`${eslintBinPath} test-success.ts`, {
      cwd: fixturePath,
    }));

  it("works in subdir", () =>
    execAsync(`${eslintBinPath} subdir/test-success.ts`, {
      cwd: fixturePath,
    }));

  it("works with importmaps", () =>
    execAsync(`${eslintBinPath} importmap/subdir/test-success.ts`, {
      cwd: fixturePath,
    }));
});
