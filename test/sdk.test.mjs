import { test } from "node:test";
import assert from "node:assert/strict";

import { createHost, ok } from "../dist/index.js";

test("creates a scoped host helper", () => {
  const host = createHost({
    permissions: ["runtime.read"],
    context: { runtime: { version: "0.1.0" } },
  });

  assert.equal(host.hasPermission("runtime.read"), true);
  assert.equal(host.hasPermission("sessions.read"), false);
  assert.deepEqual(host.getContext("runtime"), { version: "0.1.0" });
  assert.throws(() => host.requirePermission("sessions.read"), /Plugin permission required/);
});

test("creates ok results", () => {
  assert.deepEqual(ok({ value: 1 }), { ok: true, output: { value: 1 } });
});
