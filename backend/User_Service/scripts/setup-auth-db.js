import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const quoteIdent = (value) => `"${String(value).replaceAll('"', '""')}"`;

const getConfig = (database) => ({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database,
});

const createDatabaseIfMissing = async () => {
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    throw new Error("Missing DB_NAME in .env");
  }

  const client = new Client(getConfig("postgres"));
  await client.connect();

  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );

  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE ${quoteIdent(dbName)}`);
    console.log(`Created database: ${dbName}`);
  } else {
    console.log(`Database already exists: ${dbName}`);
  }

  await client.end();
};

const createAuthSchema = async () => {
  const client = new Client(getConfig(process.env.DB_NAME));
  await client.connect();

  await client.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO roles (name, description) VALUES
      ('admin', 'System Administrator'),
      ('teacher', 'Giang vien'),
      ('student', 'Sinh vien'),
      ('staff', 'Nhan vien ho tro')
    ON CONFLICT (name) DO NOTHING;

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      role_id INTEGER REFERENCES roles(id) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      phone_verified BOOLEAN DEFAULT false,
      approval_status VARCHAR(50) DEFAULT 'pending',
      approved_by UUID REFERENCES users(id),
      approved_at TIMESTAMP,
      approval_note TEXT,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    CREATE INDEX IF NOT EXISTS idx_users_approval_status
      ON users(approval_status)
      WHERE approval_status = 'pending';

    CREATE TABLE IF NOT EXISTS oauth_providers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      provider VARCHAR(50) NOT NULL,
      provider_user_id VARCHAR(255) NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(provider, provider_user_id)
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      session_token TEXT UNIQUE NOT NULL,
      refresh_token TEXT UNIQUE,
      device_type VARCHAR(50),
      device_name VARCHAR(255),
      browser VARCHAR(100),
      os VARCHAR(100),
      ip_address INET,
      user_agent TEXT,
      country VARCHAR(100),
      city VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
  `);

  const roles = await client.query("SELECT id, name FROM roles ORDER BY id");
  console.log("Auth schema ready. Roles:");
  console.table(roles.rows);

  await client.end();
};

await createDatabaseIfMissing();
await createAuthSchema();
