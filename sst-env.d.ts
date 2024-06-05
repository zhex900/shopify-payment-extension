/* tslint:disable */
/* eslint-disable */
import "sst";
declare module "sst" {
  export interface Resource {
    ApiKey: {
      type: "sst.sst.Secret";
      value: string;
    };
    ApiSecret: {
      type: "sst.sst.Secret";
      value: string;
    };
    SessionsShopifyPaymentJAKEHE: {
      name: string;
      type: "sst.aws.Dynamo";
    };
  }
}
export {};
