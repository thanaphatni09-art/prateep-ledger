import { PocketIc } from "@dfinity/pic";
import { Principal } from "@icp-sdk/core/principal";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * Backend lane: installs the app's own compiled wasm into the platform's
 * PocketIC replica and calls the real public API.
 *
 * The manager-only and customer-scoped methods are gated by the authorization
 * mixin, whose admin bootstrap is not reachable through the public API on a
 * fresh local install (the installing principal is `guest`, and
 * `assignCallerUserRole` itself requires an admin). This lane therefore covers
 * the public reads a fresh canister answers for an unauthenticated caller, which
 * is enough to catch a canister whose public methods are unimplemented stubs.
 * The manager/customer flows are covered by the frontend suite against a typed
 * actor mock; see `episode.coverageLimits`.
 */
const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers the public reads a fresh canister serves", async () => {
  const settings = await actor.getSettings();
  expect(settings).toMatchObject({
    shopName: expect.any(String),
    invoicePrefix: expect.any(String),
    receiptPrefix: expect.any(String),
  });
  expect(typeof settings.defaultPaymentTermsDays).toBe("bigint");

  await expect(actor.getApiDoc()).resolves.toBeTypeOf("string");
  await expect(actor.schema()).resolves.toBeTypeOf("string");
  await expect(actor.getCallerUserRole()).resolves.toEqual({ guest: null });
  await expect(actor.isCallerAdmin()).resolves.toBe(false);
});

it("returns no customer account for an unbound caller", async () => {
  await expect(actor.getMyCustomer()).resolves.toEqual([]);
});

it("does not leak one caller's customer account to another", async () => {
  const alice = Principal.fromText("aaaaa-aa");
  const bob = Principal.fromText("2vxsx-fae");

  actor.setPrincipal(alice);
  await expect(actor.getMyCustomer()).resolves.toEqual([]);

  actor.setPrincipal(bob);
  await expect(actor.getMyCustomer()).resolves.toEqual([]);
});
