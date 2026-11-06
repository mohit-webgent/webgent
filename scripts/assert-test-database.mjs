// Runs before the test suites. Tests create and delete rows, so refuse anything but a local database.
const url = process.env.DATABASE_URL;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "postgres"]);

let hostname = "";
try {
  hostname = new URL(url).hostname;
} catch {
  console.error("DATABASE_URL is missing or invalid. Copy .env.test.example to .env.test.");
  process.exit(1);
}

if (!LOCAL_HOSTS.has(hostname)) {
  console.error(`Refusing to run tests against "${hostname}". Tests delete data, so use a local database.`);
  process.exit(1);
}
