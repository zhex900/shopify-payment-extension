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
  it("shows only Pay by invoice for tagged customers", () => {
    const result = run(mockInput);
    expect(result.operations).toHaveLength(2);
    expect(result.operations).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it("hides all managed manual methods for customers without the tag", () => {
    const result = run({
      ...mockInput,
      cart: {
        buyerIdentity: {
          customer: {
            hasTags: [],
          },
        },
      },
    });

    expect(result.operations).toHaveLength(3);
    expect(result.operations).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it("hides all managed manual methods for guests", () => {
    const result = run({
      ...mockInput,
      cart: {
        buyerIdentity: null,
      },
    });

    expect(result.operations).toHaveLength(3);
    expect(result.operations).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });
});
