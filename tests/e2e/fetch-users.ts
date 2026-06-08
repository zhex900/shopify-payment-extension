import * as fs from "fs";

import { ifFileExists, USERS_CREDENTIALS_FILE } from "./utils";

const fetchUsers = async () => {
  if (ifFileExists(USERS_CREDENTIALS_FILE)) {
    return;
  }

  // Test-user credentials are provided via the TEST_USERS_JSON env var
  // (a GitHub Actions secret in CI, or a local value during development).
  const raw = process.env.TEST_USERS_JSON;
  if (!raw) {
    throw new Error("TEST_USERS_JSON env var is required");
  }

  const testUsers = JSON.parse(raw) as {
    username: string;
    password: string;
    role: string;
  }[];

  fs.writeFileSync(USERS_CREDENTIALS_FILE, JSON.stringify(testUsers, null, 2));
};

fetchUsers().then(() => {
  console.log("Users fetched");
});
