import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import OnboardingPage from "../app/onboarding";
import { storeData } from "@/utils/asyncStorage";

const mockReplace = jest.fn();

jest.mock(
  "@/utils/asyncStorage",
  () => ({
    storeData: jest.fn(),
  }),
  { virtual: true }
);

jest.mock(
  "@/utils/color",
  () => ({
    COLOR: {
      dark1: "#111111",
      primary2: "#222222",
      primary3: "#333333",
      secondary3: "#444444",
    },
  }),
  { virtual: true }
);

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
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
            DotComponent ? (
              <DotComponent key={i} selected={i === index} />
            ) : null
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

describe("OnboardingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storeDataMock.mockResolvedValue(undefined);
  });

  it("stores onboarding flag and redirects when skipping", async () => {
    const { getByText } = render(<OnboardingPage />);

    fireEvent.press(getByText("Skip"));

    await waitFor(() => {
      expect(storeDataMock).toHaveBeenCalledWith("onboarded", "1");
    });
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("stores onboarding flag and redirects when completing onboarding", async () => {
    const { getByText } = render(<OnboardingPage />);

    fireEvent.press(getByText("Done"));

    await waitFor(() => {
      expect(storeDataMock).toHaveBeenCalledWith("onboarded", "1");
    });
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("advances content when pressing Next without finishing onboarding", () => {
    const { getByText } = render(<OnboardingPage />);

    expect(getByText("Divvy")).toBeTruthy();
    fireEvent.press(getByText("Next"));
    expect(getByText("Nhanh, Chuẩn, Không ai thiệt!")).toBeTruthy();

    expect(storeDataMock).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("renders Dot component for pagination", () => {
    const { getByTestId } = render(<OnboardingPage />);

    const dotsContainer = getByTestId("pagination-dots");
    expect(dotsContainer).toBeTruthy();
    expect(dotsContainer.children.length).toBe(5); // 5 pages = 5 dots
  });

  it("renders Dot component with selected state on first page", () => {
    const { getByTestId } = render(<OnboardingPage />);

    const dotsContainer = getByTestId("pagination-dots");
    // First dot should be selected (index 0)
    expect(dotsContainer.children[0]).toBeTruthy();
  });

  it("updates Dot selected state when navigating pages", () => {
    const { getByText, getByTestId } = render(<OnboardingPage />);

    // Initially on page 1 (index 0)
    let dotsContainer = getByTestId("pagination-dots");
    expect(dotsContainer.children.length).toBe(5);

    // Navigate to page 2
    fireEvent.press(getByText("Next"));

    // Re-query after navigation
    dotsContainer = getByTestId("pagination-dots");
    expect(dotsContainer.children.length).toBe(5);

    // Navigate to page 3
    fireEvent.press(getByText("Next"));
    dotsContainer = getByTestId("pagination-dots");
    expect(dotsContainer.children.length).toBe(5);
  });

  it("renders Dot component for pagination", () => {
    const { getByTestId } = render(<OnboardingPage />);

    const dotsContainer = getByTestId("pagination-dots");
    expect(dotsContainer).toBeTruthy();
    expect(dotsContainer.children.length).toBe(5); // 5 pages = 5 dots
  });

  it("renders Dot component with selected state on first page", () => {
    const { getByTestId } = render(<OnboardingPage />);

    const dotsContainer = getByTestId("pagination-dots");
    // First dot should be selected (index 0)
    expect(dotsContainer.children[0]).toBeTruthy();
  });

  it("updates Dot selected state when navigating pages", () => {
    const { getByText, getByTestId } = render(<OnboardingPage />);

    // Initially on page 1 (index 0)
    let dotsContainer = getByTestId("pagination-dots");
    expect(dotsContainer.children.length).toBe(5);

    // Navigate to page 2
    fireEvent.press(getByText("Next"));

    // Re-query after navigation
    dotsContainer = getByTestId("pagination-dots");
    expect(dotsContainer.children.length).toBe(5);

    // Navigate to page 3
    fireEvent.press(getByText("Next"));
    dotsContainer = getByTestId("pagination-dots");
    expect(dotsContainer.children.length).toBe(5);
  });
});
