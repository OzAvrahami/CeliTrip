// Better Auth 1.7.7 schema, generated from getSchema(authOptions), reviewed locally.
exports.up=pgm=>pgm.sql(`
CREATE TABLE "user" ("id" text PRIMARY KEY,
"name" text NOT NULL,
"email" text NOT NULL UNIQUE,
"emailVerified" boolean NOT NULL,
"image" text,
"createdAt" timestamptz NOT NULL,
"updatedAt" timestamptz NOT NULL,
"twoFactorEnabled" boolean);
CREATE TABLE "session" ("id" text PRIMARY KEY,
"expiresAt" timestamptz NOT NULL,
"token" text NOT NULL UNIQUE,
"createdAt" timestamptz NOT NULL,
"updatedAt" timestamptz NOT NULL,
"ipAddress" text,
"userAgent" text,
"userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
"mfaVerified" boolean);
CREATE INDEX ON "session" ("userId");
CREATE TABLE "account" ("id" text PRIMARY KEY,
"accountId" text NOT NULL,
"providerId" text NOT NULL,
"userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
"accessToken" text,
"refreshToken" text,
"idToken" text,
"accessTokenExpiresAt" timestamptz,
"refreshTokenExpiresAt" timestamptz,
"scope" text,
"password" text,
"createdAt" timestamptz NOT NULL,
"updatedAt" timestamptz NOT NULL);
CREATE INDEX ON "account" ("userId");
CREATE TABLE "verification" ("id" text PRIMARY KEY,
"identifier" text NOT NULL,
"value" text NOT NULL,
"expiresAt" timestamptz NOT NULL,
"createdAt" timestamptz NOT NULL,
"updatedAt" timestamptz NOT NULL);
CREATE INDEX ON "verification" ("identifier");
CREATE TABLE "twoFactor" ("id" text PRIMARY KEY,
"secret" text NOT NULL,
"backupCodes" text NOT NULL,
"userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
"verified" boolean,
"failedVerificationCount" integer,
"lockedUntil" timestamptz);
CREATE INDEX ON "twoFactor" ("secret");
CREATE INDEX ON "twoFactor" ("userId");
CREATE TABLE "rateLimit" ("id" text PRIMARY KEY,
"key" text NOT NULL UNIQUE,
"count" integer NOT NULL,
"lastRequest" bigint NOT NULL);
`);
exports.down=pgm=>pgm.sql('DROP TABLE "twoFactor", "rateLimit", "verification", "account", "session", "user" CASCADE;');
