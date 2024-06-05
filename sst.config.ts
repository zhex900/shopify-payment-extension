/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ShopifyPayment",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // this should only be deployed once per aws account
    if ($app.stage === "production-static") {
      const { githubDeployRole } = await import(
        "./infrastructure/static-stack"
      );
      return {
        githubDeployRole: githubDeployRole.arn,
      };
    }
    //Set default props for all the functions
    $transform(sst.aws.Function, (args) => {
      args.runtime = "nodejs20.x";
      args.architecture = "arm64";
    });

    const infra = await import("./infrastructure/application-stack");

    return {
      appUrl: infra.remix.url,
      appUrlParameterName: infra.appUrlParameter.name,
    };
  },
});
