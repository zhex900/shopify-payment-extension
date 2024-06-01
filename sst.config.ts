/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "shopify-payment-extension",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    //Set default props for all the functions
    $transform(sst.aws.Function, (args) => {
      args.runtime = "nodejs20.x";
      args.architecture = "arm64";
    });
    const infra = await import("./infrastructure");

    return {
      appUrl: infra.remix.url,
      appUrlParameterName: infra.appUrlParameter.name,
    };
  },
});
