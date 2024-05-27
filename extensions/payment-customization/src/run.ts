import type { RunInput, FunctionRunResult } from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  const hasTags = input.cart.buyerIdentity?.customer?.hasTags;

  // pay by invoice tag is present
  if (
    hasTags &&
    hasTags.length > 0 &&
    hasTags.filter((tag) => !tag.hasTag).length === 0
  ) {
    return NO_CHANGES;
  }

  // Find the payment method to hide
  const hidePaymentMethod = input.paymentMethods.find((method) =>
    method.name.includes("Pay by invoice"),
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
