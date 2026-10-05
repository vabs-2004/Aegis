import { initializeDatabase } from "../lib/db/store";

async function main() {
  console.log("Initializing AEGIS database...");
  try {
    const res = await initializeDatabase();
    console.log(res.message);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.log("Database init note:", errorMsg);
  }
  process.exit(0);
}

main();
