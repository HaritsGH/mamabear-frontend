import { render, waitFor } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { CartInitializer } from "./CartInitializer.ts";

const initializeCart = jest.fn();
const mergeGuestCart = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isLoggedIn: false }),
}));

jest.mock("@/features/cart/store/use-cart-store", () => ({
  useCartStore: (selector: (state: unknown) => unknown) =>
    selector({ initializeCart, mergeGuestCart }),
}));

describe("CartInitializer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not initialize cart state on documentation routes", async () => {
    jest.mocked(usePathname).mockReturnValue("/docs/developer-guide/testing");

    render(<CartInitializer />);

    await waitFor(() => {
      expect(initializeCart).not.toHaveBeenCalled();
      expect(mergeGuestCart).not.toHaveBeenCalled();
    });
  });
});
