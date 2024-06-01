export const sessionsTable = new sst.aws.Dynamo(
  `SessionsTable${$app.stage.toUpperCase()}`,
  {
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
  },
);
