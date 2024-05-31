import { PolarisTestProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

function ShopifyAppProvider({ children }: { children: ReactNode }) {
  const elements = children as unknown as ReactElement;
  return (
    <PolarisTestProvider i18n={translations}>{elements}</PolarisTestProvider>
  );
}

const shopifyRender = (ui: ReactElement, options: RenderOptions) =>
  render(ui, { wrapper: ShopifyAppProvider, ...options });

// re-export everything
export * from "@testing-library/react";
export const user = userEvent.setup();
// override render method
export { shopifyRender as render };
