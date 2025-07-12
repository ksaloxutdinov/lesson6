import { Pool } from "pg";
import dotenvConfig from "../helpers/dotenv-config.js";

dotenvConfig();

const db = new Pool({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    user: process.env.PG_USER,
    password: String(process.env.PG_PASS),
    database: process.env.PG_DB
});

export default db;