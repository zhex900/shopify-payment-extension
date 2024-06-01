export const sessionsTable = new sst.aws.Dynamo("SessionsTable", {
  fields: {
    id: "string",
    shop: "string",
  },
  primaryIndex: { hashKey: "id" },
  globalIndexes: {
    shopIndexName: {
      hashKey: "shop",
    },
  },
});
