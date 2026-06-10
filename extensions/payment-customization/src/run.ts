type RunInput = {
  cart: {
    buyerIdentity?: {
      customer?: {
        hasTags?: Array<{ hasTag: boolean; tag: string }>;
      } | null;
    } | null;
  };
  paymentMethods: Array<{ id: string; name: string }>;
};

type FunctionRunResult = {
  operations: Array<{
    hide: {
      paymentMethodId: string;
    };
  }>;
};

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

/** Customers with this tag see Pay by invoice at checkout. */
export const PAY_BY_INVOICE_TAG = "pay by invoice";

/** Manual payment method shown to tagged customers. */
export const PAY_BY_INVOICE_METHOD = "Pay by invoice";

/**
 * Manual payment methods this function manages.
 * Non-tagged customers have all of these hidden; tagged customers see only PAY_BY_INVOICE_METHOD.
 */
export const MANAGED_MANUAL_PAYMENT_METHODS = [PAY_BY_INVOICE_METHOD] as const;

export function run(input: RunInput): FunctionRunResult {
  try {
    const hasPayByInvoiceTag =
      input.cart.buyerIdentity?.customer?.hasTags?.some(
        (tag) =>
          tag.hasTag &&
          tag.tag.toLowerCase() === PAY_BY_INVOICE_TAG.toLowerCase(),
      ) ?? false;

    const operations = MANAGED_MANUAL_PAYMENT_METHODS.map((method) => {
      const id = input.paymentMethods.find((m) => m.name.includes(method))?.id;
      if (!id || (hasPayByInvoiceTag && method === PAY_BY_INVOICE_METHOD)) {
        return undefined;
      }
      return {
        hide: {
          paymentMethodId: id,
        },
      };
    }).filter((operation) => operation) as FunctionRunResult["operations"];

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
