import { z } from "zod";

import type { FunctionRunResult, RunInput } from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

const Configuration = z.object({
  tag: z.string(),
  paymentMethod: z.string(),
  paymentMethods: z.string().array(),
});

export function run(input: RunInput): FunctionRunResult {
  try {
    const hasTags = input.cart.buyerIdentity?.customer?.hasTags;

    // authorized if the customer has the required tags
    const authorized =
      hasTags &&
      hasTags.length > 0 &&
      hasTags.filter((tag) => !tag.hasTag).length === 0;

    if (!input.paymentCustomization.metafield) {
      return NO_CHANGES;
    }

    const { data: configuration, success } = Configuration.safeParse(
      JSON.parse(input.paymentCustomization.metafield?.value),
    );

    if (!success) {
      return NO_CHANGES;
    }

    const operations = configuration.paymentMethods
      .map((method) => {
        // find the payment method id
        const id = input.paymentMethods.find((m) =>
          m.name.includes(method),
        )?.id;
        if (
          // this should not happen
          !id ||
          // if authorized, hide all payment methods except the one specified
          (authorized && method === configuration.paymentMethod)
        ) {
          return undefined;
        }
        return {
          hide: {
            paymentMethodId: id!,
          },
        };
      })
      // filter out empty operations
      .filter((operation) => operation) as FunctionRunResult["operations"];

    if (operations.length === 0) {
      return NO_CHANGES;
    }

    return {
      operations,
    };
  } catch (e) {
    console.error(e);
    return NO_CHANGES;
  }
}
