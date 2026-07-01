import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://user:123456@localhost:5432/hello_pg"
});

async function query(text, params) {
  return pool.query(text, params);
}

export { pool, query };
