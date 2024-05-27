/// <reference path="./.sst/platform/config.d.ts" />

// AWS-Parameters-and-Secrets-Lambda-Extension layer ARN for is from
// https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
// This is a fixed value provided by AWS.
const PARAMETER_STORE_LAYER_ARN =
  "arn:aws:lambda:ap-southeast-2:665172237481:layer:AWS-Parameters-and-Secrets-Lambda-Extension-Arm64:11";

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
      args.layers = [PARAMETER_STORE_LAYER_ARN];
      args.architecture = "arm64";
    });
    const infra = await import("./infrastructure");

    return {
      appUrl: infra.remix.url,
      appUrlParameterName: infra.appUrlParameter.name,
    };
  },
});
