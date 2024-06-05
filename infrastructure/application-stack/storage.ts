export const sessionsTable = new sst.aws.Dynamo(
  `Sessions${$app.name}${$app.stage.toUpperCase()}`,
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
    transform: {
      table: {
        name: `Sessions${$app.name}${$app.stage.toUpperCase()}`,
      },
    },
  },
);
