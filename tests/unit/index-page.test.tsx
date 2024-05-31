import { test, expect } from "vitest";
import { render, screen, user } from "@testing-library/polaris";
import { createRemixStub } from "@remix-run/testing";
import IndexPage from "~/routes/app._index";
import { waitFor } from "@testing-library/dom";

test("display tag and payment value from configuration", async () => {
  const tag = "customer-tag";
  const paymentMethod = "cash";
  const App = createRemixStub([
    {
      path: "/",
      Component: IndexPage,
      loader: () => {
        return {
          customerTags: [tag],
          paymentMethods: [paymentMethod],
          configuration: {
            tag,
            paymentMethod,
            availableManualPaymentMethods: [],
          },
          paymentCustomizationId: "1",
        };
      },
    },
  ]);
  render(<App initialEntries={["/"]} />);
  await waitFor(() => screen.findByText("Configuration"));
  expect(
    screen.getByText(/The selected manual payment method/),
  ).toBeInTheDocument();

  expect(
    screen.getByPlaceholderText("Select a manual payment method"),
  ).toHaveValue(paymentMethod);

  expect(screen.getByPlaceholderText("Select a customer tag")).toHaveValue(tag);

  // no error messages
  expect(
    screen.queryByText(/Selected tag does not exist/),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(/Selected manual payment method does not exist/),
  ).not.toBeInTheDocument();

  // no changes, save button should be disabled
  expect(screen.getByRole("button", { name: /Save/i })).toHaveAttribute(
    "aria-disabled",
    "true",
  );

  expect(screen.getByRole("button", { name: /Cancel/i })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});

test("display error when configuration tag and payment method does not exist", async () => {
  const tag = "customer-tag";
  const paymentMethod = "cash";
  const App = createRemixStub([
    {
      path: "/",
      Component: IndexPage,
      loader: () => {
        return {
          customerTags: [],
          paymentMethods: [],
          configuration: {
            // configuration tag must exist in customerTags
            // since customerTags is empty, this tag is invalid
            tag,
            paymentMethod,
            availableManualPaymentMethods: [],
          },
          paymentCustomizationId: "1",
        };
      },
    },
  ]);
  render(<App initialEntries={["/"]} />);
  await waitFor(() => screen.findByText("Configuration"));
  expect(
    screen.getByText(/The selected manual payment method/),
  ).toBeInTheDocument();

  expect(screen.getByText(/Selected tag does not exist/)).toBeVisible();

  expect(
    screen.getByPlaceholderText("Select a manual payment method"),
  ).toHaveValue(paymentMethod);

  expect(screen.getByPlaceholderText("Select a customer tag")).toHaveValue(tag);
  expect(
    screen.getByText(/Selected manual payment method does not exist/),
  ).toBeVisible();
});

test("save tag and payments", async () => {
  const customerTags = ["customer-tag", "customer-tag-2", "customer-tag-3"];
  const paymentMethods = ["cash", "credit card", "bank deposit"];
  let actionRequest = undefined as Request | undefined;
  const App = createRemixStub([
    {
      path: "/",
      Component: IndexPage,
      loader: () => {
        return {
          customerTags,
          paymentMethods,
          configuration: {
            tag: customerTags[0],
            paymentMethod: paymentMethods[0],
            availableManualPaymentMethods: [],
          },
          paymentCustomizationId: "1",
        };
      },
      action: ({ request }) => {
        actionRequest = request;
        return {
          status: 200,
        };
      },
    },
  ]);
  render(<App initialEntries={["/"]} />);
  await waitFor(() => screen.findByText("Configuration"));
  expect(
    screen.getByText(/The selected manual payment method/),
  ).toBeInTheDocument();

  await user.click(screen.getByPlaceholderText("Select a customer tag"));
  customerTags.slice(1).forEach((tag) => {
    expect(screen.getByText(tag)).toBeVisible();
  });
  await user.click(screen.getByPlaceholderText("Select a customer tag"));
  await user.click(screen.getByText(customerTags[1]));

  await user.click(
    screen.getByPlaceholderText("Select a manual payment method"),
  );
  paymentMethods.slice(1).forEach((paymentMethod) => {
    expect(screen.getByText(paymentMethod)).toBeVisible();
  });
  await user.click(
    screen.getByPlaceholderText("Select a manual payment method"),
  );
  await user.click(screen.getByText(paymentMethods[1]));

  await user.click(screen.getByRole("button", { name: /Save/i }));
  expect(actionRequest).toBeDefined();

  // save should send POST request with the selected tag and payment method
  expect(actionRequest?.method).toBe("POST");
  const formData = await actionRequest?.formData();
  expect(formData).toBeDefined();

  if (!formData) {
    throw new Error("formData is undefined");
  }

  expect(Object.fromEntries(formData)).toMatchObject({
    tagValue: customerTags[1],
    paymentMethodValue: paymentMethods[1],
    paymentCustomizationId: "1",
    paymentMethods: JSON.stringify(paymentMethods),
  });
});

// cancel should reset the form to the initial configuration

// entering a value that is not in the list should show an error message
