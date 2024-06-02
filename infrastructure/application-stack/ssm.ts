export const appUrlParameter = new aws.ssm.Parameter(
  `AppUrlParameter${$app.stage.toUpperCase()}`,
  {
    name: `/${$app.name}/${$app.stage}/app-url`,
    type: "String",
    value: "remix.url",
    overwrite: true,
  },
);
