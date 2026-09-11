import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticateWithPassword,
  hashPassword,
  invalidateSession,
  refreshSession,
  verifyPassword,
} from "@/features/auth/services/auth-service";
import { verifyAccessToken } from "@/features/auth/services/jwt-service";
import { prisma } from "@/lib/prisma";

test("Auth Service & JWT Stateless Integration Suite", async (t) => {
  // Clean up any existing test records before starting
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Seed a test user
  const passwordHash = await hashPassword("adminSecurePassword123!");
  const user = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@maturex.test",
      passwordHash,
      role: "admin",
      active: true,
    },
  });

  await t.test("Password hashing and verification", async () => {
    const rawPassword = "superSecretPassword123!";
    const hashed = await hashPassword(rawPassword);

    assert.match(hashed, /^[0-9a-f]{32}:[0-9a-f]{128}$/);
    const valid = await verifyPassword(rawPassword, hashed);
    assert.strictEqual(valid, true);

    const invalid = await verifyPassword("wrongPassword123!", hashed);
    assert.strictEqual(invalid, false);
  });

  await t.test(
    "Authentication with password returns JWT and Refresh Token",
    async () => {
      const result = await authenticateWithPassword(
        "admin@maturex.test",
        "adminSecurePassword123!",
      );

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      assert.strictEqual(result.user.email, "admin@maturex.test");

      // Verify JWT Access Token statelessly
      const payload = await verifyAccessToken(result.accessToken);
      assert.ok(payload);
      assert.strictEqual(payload.sub, user.id);
      assert.strictEqual(payload.email, "admin@maturex.test");
      assert.strictEqual(payload.role, "admin");

      // Test token refresh
      const refreshed = await refreshSession(result.refreshToken);
      assert.ok(refreshed.accessToken);
      assert.ok(refreshed.refreshToken);
      assert.notStrictEqual(refreshed.refreshToken, result.refreshToken); // rotated

      // Old refresh token must now be invalid
      await assert.rejects(
        async () => {
          await refreshSession(result.refreshToken);
        },
        { status: 401 },
      );

      // Invalidate refresh token (logout)
      await invalidateSession(refreshed.refreshToken);
      await assert.rejects(
        async () => {
          await refreshSession(refreshed.refreshToken);
        },
        { status: 401 },
      );
    },
  );

  await t.test("Invalid credentials authentication handling", async () => {
    await assert.rejects(
      async () => {
        await authenticateWithPassword(
          "admin@maturex.test",
          "wrongPasswordHere123!",
        );
      },
      { status: 401 },
    );
  });

  // Re-seed default user for local testing
  const defaultAdminHash = await hashPassword("12345678");
  await prisma.user.upsert({
    where: { email: "tatuanthanh2105nd@gmail.com" },
    update: { passwordHash: defaultAdminHash },
    create: {
      name: "Admin",
      email: "tatuanthanh2105nd@gmail.com",
      passwordHash: defaultAdminHash,
      role: "admin",
      active: true,
    },
  });
});
