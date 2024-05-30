import { describe, expect, it } from "vitest";

import { run } from "./run";

const mockInput = {
  cart: {
    buyerIdentity: {
      customer: {
        id: "gid://shopify/Customer/7037609377944",
        displayName: "Bob James",
        email: "zhex900+bob@gmail.com",
        hasTags: [
          {
            hasTag: true,
            tag: "pay by invoice",
          },
        ],
        metafield: null,
      },
      purchasingCompany: null,
    },
    cost: {
      totalAmount: {
        amount: "15.95",
      },
    },
  },
  paymentMethods: [
    {
      id: "gid://shopify/PaymentCustomizationPaymentMethod/0",
      name: "Deferred",
    },
    {
      id: "gid://shopify/PaymentCustomizationPaymentMethod/1",
      name: "(for testing) Bogus Gateway",
    },
    {
      id: "gid://shopify/PaymentCustomizationPaymentMethod/2",
      name: "PayPal Express Checkout",
    },
    {
      id: "gid://shopify/PaymentCustomizationPaymentMethod/3",
      name: "Cash on Delivery (COD)",
    },
    {
      id: "gid://shopify/PaymentCustomizationPaymentMethod/4",
      name: "Pay by invoice",
    },
    {
      id: "gid://shopify/PaymentCustomizationPaymentMethod/5",
      name: "Bank Deposit",
    },
  ],
  paymentCustomization: {
    metafield: {
      value:
        '{"tag":"pay by invoice","paymentMethod":"Pay by invoice","paymentMethods":["Bank Deposit","Cash on Delivery (COD)","Pay by invoice"]}',
    },
  },
};

describe("payment customization function", () => {
  // customer has tag, all the manual payment except selected paymentMethod should be hidden
  it("hide payment methods", () => {
    const result = run(mockInput);
    expect(result).toEqual({
      operations: [
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/5",
          },
        },
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/3",
          },
        },
      ],
    });
  });
  it("hide all payment methods", () => {
    const input = { ...mockInput };
    input.cart.buyerIdentity.customer.hasTags = [];
    const result = run(input);

    expect(result).toEqual({
      operations: [
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/5",
          },
        },
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/3",
          },
        },
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/4",
          },
        },
      ],
    });
  });

  it("no config returns no operations", () => {
    const result = run({
      ...mockInput,
      paymentCustomization: { metafield: null },
    });
    expect(result).toEqual({
      operations: [],
    });
  });

  it("incomplete config returns no operations", () => {
    const result = run({
      ...mockInput,
      paymentCustomization: {
        metafield: {
          value: '{"tag":"pay"}',
        },
      },
    });
    expect(result).toEqual({
      operations: [],
    });
  });

  it("invalid config returns no operations", () => {
    const result = run({
      ...mockInput,
      paymentCustomization: {
        metafield: {
          value: "invalid json",
        },
      },
    });
    expect(result).toEqual({
      operations: [],
    });
  });
});
