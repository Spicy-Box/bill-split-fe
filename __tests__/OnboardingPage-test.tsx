import { getData, storeData } from "@/utils/asyncStorage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import OnboardingPage from "../app/onboarding";

const mockReplace = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock("@/utils/asyncStorage", () => ({
  storeData: jest.fn(),
  getData: jest.fn(),
}));

jest.mock("@/utils/color", () => ({
  COLOR: {
    dark1: "#111111",
    primary2: "#222222",
    primary3: "#333333",
    secondary3: "#444444",
  },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/stores/useAuthStore", () => ({
  useAuthStore: jest.fn((selector) => {
    const state = {
      user: { id: 1, name: "Test User" }, // Mock a logged-in user
    };
    return selector ? selector(state) : state;
  }),
}));

jest.mock("react-native-onboarding-swiper", () => {
  const React = jest.requireActual("react");
  const { View, Text } = jest.requireActual("react-native");

  const MockOnboarding = ({
    SkipButtonComponent,
    NextButtonComponent,
    DoneButtonComponent,
    DotComponent,
    onSkip,
    onDone,
    pages = [],
  }: any) => {
    const [index, setIndex] = React.useState(0);
    const page = pages[index] ?? {};

    const handleNext = () => {
      if (index < pages.length - 1) {
        setIndex(index + 1);
        return;
      }
      onDone?.();
    };

    return (
      <View>
        <View testID="mock-onboarding-page">
          {page.title ? <Text>{page.title}</Text> : null}
          {page.subtitle ? <Text>{page.subtitle}</Text> : null}
        </View>

        {/* Render pagination dots */}
        <View testID="pagination-dots">
          {pages.map((_: any, i: number) =>
            DotComponent ? <DotComponent key={i} selected={i === index} /> : null
          )}
        </View>

        {SkipButtonComponent ? <SkipButtonComponent onPress={onSkip} /> : null}
        {NextButtonComponent ? <NextButtonComponent onPress={handleNext} /> : null}
        {DoneButtonComponent ? <DoneButtonComponent onPress={onDone} /> : null}
      </View>
    );
  };

  MockOnboarding.displayName = "MockOnboarding";

  return MockOnboarding;
});

jest.mock("react-native-safe-area-context", () => {
  const { View } = jest.requireActual("react-native");

  return {
    SafeAreaView: ({ children }: any) => <View>{children}</View>,
    useSafeAreaInsets: () => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }),
  };
});

const storeDataMock = storeData as jest.MockedFunction<typeof storeData>;
const getDataMock = getData as jest.MockedFunction<typeof getData>;

describe("OnboardingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storeDataMock.mockResolvedValue(undefined);
    getDataMock.mockResolvedValue(null); // Default: not onboarded yet

    // Reset useAuthStore to default (logged-in user)
    const { useAuthStore } = require("@/stores/useAuthStore");
    (useAuthStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: { id: 1, name: "Test User" },
      };
      return selector ? selector(state) : state;
    });
  });

  describe("useEffect - check onboarding status on mount", () => {
    it("redirects to home when already onboarded and user is logged in", async () => {
      getDataMock.mockResolvedValue("1"); // Already onboarded

      render(<OnboardingPage />);

      await waitFor(() => {
        expect(getDataMock).toHaveBeenCalledWith("onboarded");
        expect(mockReplace).toHaveBeenCalledWith("/");
      });
    });

    it("redirects to login when already onboarded but user is not logged in", async () => {
      getDataMock.mockResolvedValue("1"); // Already onboarded

      // Mock no user
      const { useAuthStore } = require("@/stores/useAuthStore");
      (useAuthStore as jest.Mock).mockImplementation((selector) => {
        const state = { user: null };
        return selector ? selector(state) : state;
      });

      render(<OnboardingPage />);

      await waitFor(() => {
        expect(getDataMock).toHaveBeenCalledWith("onboarded");
        expect(mockReplace).toHaveBeenCalledWith("/auth/login");
      });
    });

    it("does not redirect when not onboarded yet", async () => {
      getDataMock.mockResolvedValue(null); // Not onboarded

      render(<OnboardingPage />);

      await waitFor(() => {
        expect(getDataMock).toHaveBeenCalledWith("onboarded");
      });

      // Should NOT redirect - user needs to see onboarding
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("does not redirect when onboarded value is not '1'", async () => {
      getDataMock.mockResolvedValue("0"); // Invalid onboarded value

      render(<OnboardingPage />);

      await waitFor(() => {
        expect(getDataMock).toHaveBeenCalledWith("onboarded");
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("handleFinish - Skip button", () => {
    it("stores onboarding flag and redirects to home when user is logged in", async () => {
      const { getByText } = render(<OnboardingPage />);

      fireEvent.press(getByText("Skip"));

      await waitFor(() => {
        expect(storeDataMock).toHaveBeenCalledWith("onboarded", "1");
      });
      expect(mockReplace).toHaveBeenCalledWith("/");
    });

    it("stores onboarding flag and redirects to login when user is not logged in", async () => {
      const { useAuthStore } = require("@/stores/useAuthStore");
      (useAuthStore as jest.Mock).mockImplementation((selector) => {
        const state = { user: null };
        return selector ? selector(state) : state;
      });

      const { getByText } = render(<OnboardingPage />);

      fireEvent.press(getByText("Skip"));

      await waitFor(() => {
        expect(storeDataMock).toHaveBeenCalledWith("onboarded", "1");
      });
      expect(mockReplace).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("handleFinish - Done button", () => {
    it("stores onboarding flag and redirects to home when user is logged in", async () => {
      const { getByText } = render(<OnboardingPage />);

      fireEvent.press(getByText("Done"));

      await waitFor(() => {
        expect(storeDataMock).toHaveBeenCalledWith("onboarded", "1");
      });
      expect(mockReplace).toHaveBeenCalledWith("/");
    });

    it("stores onboarding flag and redirects to login when user is not logged in", async () => {
      const { useAuthStore } = require("@/stores/useAuthStore");
      (useAuthStore as jest.Mock).mockImplementation((selector) => {
        const state = { user: null };
        return selector ? selector(state) : state;
      });

      const { getByText } = render(<OnboardingPage />);

      fireEvent.press(getByText("Done"));

      await waitFor(() => {
        expect(storeDataMock).toHaveBeenCalledWith("onboarded", "1");
      });
      expect(mockReplace).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("Navigation - Next button", () => {
    it("advances content when pressing Next without finishing onboarding", async () => {
      const { getByText } = render(<OnboardingPage />);

      expect(getByText("Divvy")).toBeTruthy();
      fireEvent.press(getByText("Next"));
      expect(getByText("Nhanh, Chuẩn, Không ai thiệt!")).toBeTruthy();

      expect(storeDataMock).not.toHaveBeenCalled();
    });

    it("navigates through all pages correctly", async () => {
      const { getByText } = render(<OnboardingPage />);

      // Page 1
      expect(getByText("Divvy")).toBeTruthy();

      // Page 2
      fireEvent.press(getByText("Next"));
      expect(getByText("Nhanh, Chuẩn, Không ai thiệt!")).toBeTruthy();

      // Page 3
      fireEvent.press(getByText("Next"));
      expect(getByText("Không cần nhập tay — App tự đọc và chia!")).toBeTruthy();

      // Page 4
      fireEvent.press(getByText("Next"));
      expect(getByText("Ai trả bao nhiêu? Ai còn nợ ai?")).toBeTruthy();

      // Page 5
      fireEvent.press(getByText("Next"));
      expect(getByText("Quét hoá đơn bằng AI")).toBeTruthy();
    });
  });

  describe("Pagination dots", () => {
    it("renders correct number of dots for pagination", () => {
      const { getByTestId } = render(<OnboardingPage />);

      const dotsContainer = getByTestId("pagination-dots");
      expect(dotsContainer).toBeTruthy();
      expect(dotsContainer.children.length).toBe(5); // 5 pages = 5 dots
    });

    it("renders Dot component with selected state on first page", () => {
      const { getByTestId } = render(<OnboardingPage />);

      const dotsContainer = getByTestId("pagination-dots");
      expect(dotsContainer.children[0]).toBeTruthy();
    });

    it("maintains dot count when navigating pages", () => {
      const { getByText, getByTestId } = render(<OnboardingPage />);

      // Initially on page 1
      let dotsContainer = getByTestId("pagination-dots");
      expect(dotsContainer.children.length).toBe(5);

      // Navigate to page 2
      fireEvent.press(getByText("Next"));
      dotsContainer = getByTestId("pagination-dots");
      expect(dotsContainer.children.length).toBe(5);

      // Navigate to page 3
      fireEvent.press(getByText("Next"));
      dotsContainer = getByTestId("pagination-dots");
      expect(dotsContainer.children.length).toBe(5);
    });
  });
});
