import { MongoClient } from "mongodb";
import dns from "dns"

dns.setServers(['4.4.4.4' , '1.1.1.1'])

const connectionString = process.env.ATLAS_URI || "";

const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
  console.log("Connected to MongoDB");
} catch (e) {
  console.error(e);
  console.log("2");
}

let db = conn ? conn.db("brawlStarTai") : null;

export default db;