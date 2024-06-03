import * as fs from "fs";

export const isExpired = (timestamp: number, now: number = Date.now()) => {
  return new Date(timestamp * 1000).getTime() < now;
};
// github action only allows /tmp folder to be written
export const USERS_CREDENTIALS_FILE = "/tmp/dev-store-test-users.json";

export const ifFileExists = (path: string) => {
  try {
    if (fs.existsSync(path)) {
      return true;
    }
  } catch (err) {}
  return false;
};
