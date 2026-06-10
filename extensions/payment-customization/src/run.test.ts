import { describe, expect, it } from "vitest";

import { run } from "./run";

const mockInput = {
  cart: {
    buyerIdentity: {
      customer: {
        hasTags: [
          {
            hasTag: true,
            tag: "pay by invoice",
          },
        ],
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
};

describe("payment customization function", () => {
  it("shows pay by invoice and hides other managed manual methods for tagged customers", () => {
    const result = run(mockInput);
    expect(result).toEqual({
      operations: [
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/3",
          },
        },
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/5",
          },
        },
      ],
    });
  });

  it("hides all managed manual methods when customer lacks the tag", () => {
    const result = run({
      ...mockInput,
      cart: {
        buyerIdentity: {
          customer: {
            hasTags: [
              {
                hasTag: false,
                tag: "pay by invoice",
              },
            ],
          },
        },
      },
    });

    expect(result).toEqual({
      operations: [
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/4",
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
              "gid://shopify/PaymentCustomizationPaymentMethod/5",
          },
        },
      ],
    });
  });

  it("hides all managed manual methods for guests", () => {
    const result = run({
      ...mockInput,
      cart: {
        buyerIdentity: {
          customer: null,
        },
      },
    });

    expect(result).toEqual({
      operations: [
        {
          hide: {
            paymentMethodId:
              "gid://shopify/PaymentCustomizationPaymentMethod/4",
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
              "gid://shopify/PaymentCustomizationPaymentMethod/5",
          },
        },
      ],
    });
  });
});
