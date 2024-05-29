import type { RunInput, FunctionRunResult } from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};
// TODO write tests
export function run(input: RunInput): FunctionRunResult {
  const hasTags = input.cart.buyerIdentity?.customer?.hasTags;

  // pay by invoice tag is present
  const authorized =
    hasTags &&
    hasTags.length > 0 &&
    hasTags.filter((tag) => !tag.hasTag).length === 0;

  if (!input.paymentCustomization.metafield) {
    return NO_CHANGES;
  }

  const configuration = JSON.parse(
    input.paymentCustomization.metafield?.value,
  ) as {
    tag: string;
    paymentMethod: string;
    paymentMethods: string[];
  };

  if (!configuration.tag || !configuration.paymentMethod) {
    return NO_CHANGES;
  }

  const operations = configuration.paymentMethods
    .map((method) => {
      const id = input.paymentMethods.find((m) => m.name.includes(method))?.id;
      if (!id || (authorized && method === configuration.paymentMethod)) {
        return undefined;
      }
      return {
        hide: {
          paymentMethodId: id!,
        },
      };
    })
    .filter(
      (operation) => operation !== undefined,
    ) as FunctionRunResult["operations"];

  if (operations.length === 0) {
    return NO_CHANGES;
  }

  return {
    operations,
  };
}
