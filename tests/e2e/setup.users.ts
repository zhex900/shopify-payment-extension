import { SSM } from "@aws-sdk/client-ssm";
import { test as setup } from "@playwright/test";
import * as fs from "fs";

const DEFAULT_REGION = "ap-southeast-2";

const ssm = new SSM({
  region: DEFAULT_REGION,
});

// github action only allows /tmp folder to be written
export const USERS_CREDENTIALS_FILE = "/tmp/dev-store-test-users.json";

setup(`fetch test users credentials from AWS ssm`, async () => {
  const testUsersData = await ssm.getParameter({
    Name: "/dev-store/test-users",
  });

  const testUsers = JSON.parse(testUsersData.Parameter?.Value || "[]") as {
    username: string;
    password: string;
    role: string;
  }[];

  console.log("testUsers", testUsers);
  //write to file
  fs.writeFileSync(USERS_CREDENTIALS_FILE, JSON.stringify(testUsers, null, 2));
});
