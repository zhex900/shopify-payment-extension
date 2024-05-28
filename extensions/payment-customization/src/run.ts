import type { RunInput, FunctionRunResult } from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  const hasTags = input.cart.buyerIdentity?.customer?.hasTags;

  // pay by invoice tag is present
  if (
    (hasTags &&
      hasTags.length > 0 &&
      hasTags.filter((tag) => !tag.hasTag).length === 0) ||
    !input.paymentCustomization.metafield
  ) {
    return NO_CHANGES;
  }

  const configuration = JSON.parse(
    input.paymentCustomization.metafield?.value,
  ) as {
    tag: string;
    paymentMethod: string;
  };

  if (!configuration.tag || !configuration.paymentMethod) {
    return NO_CHANGES;
  }

  // Find the payment method to hide
  const hidePaymentMethod = input.paymentMethods.find((method) =>
    method.name.includes(configuration.paymentMethod),
  );

  if (!hidePaymentMethod) {
    return NO_CHANGES;
  }

  // Return the operations to hide the payment method
  return {
    operations: [
      {
        hide: {
          paymentMethodId: hidePaymentMethod.id,
        },
      },
    ],
  };
}
