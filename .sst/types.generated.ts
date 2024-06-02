/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    ApiKeyJAKEHE: {
      type: "sst.sst.Secret"
      value: string
    }
    ApiSecretJAKEHE: {
      type: "sst.sst.Secret"
      value: string
    }
    SessionsTableJAKEHE: {
      name: string
      type: "sst.aws.Dynamo"
    }
    ShopifyAppJAKEHE: {
      type: "sst.aws.Remix"
      url: string
    }
  }
}
export {}