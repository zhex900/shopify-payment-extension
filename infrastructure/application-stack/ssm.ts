export const appUrlParameter = new aws.ssm.Parameter("AppUrlParameter", {
  name: `/${$app.name}/${$app.stage}/app-url`,
  type: "String",
  value: "remix.url",
  overwrite: true,
});
