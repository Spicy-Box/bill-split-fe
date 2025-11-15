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

  it("displays the first page title and subtitle on initial render", () => {
    const { getByText } = render(<OnboardingPage />);

    expect(getByText("Divvy")).toBeTruthy();
    expect(getByText("Chia chuẩn, vui cùng nhau.")).toBeTruthy();
  });

  it("navigates through all pages correctly with Next button", () => {
    const { getByText } = render(<OnboardingPage />);

    // Page 1
    expect(getByText("Divvy")).toBeTruthy();
    fireEvent.press(getByText("Next"));

    // Page 2
    expect(getByText("Nhanh, Chuẩn, Không ai thiệt!")).toBeTruthy();
    fireEvent.press(getByText("Next"));

    // Page 3
    expect(getByText("Không cần nhập tay — App tự đọc và chia!")).toBeTruthy();
    fireEvent.press(getByText("Next"));

    // Page 4
    expect(getByText("Ai trả bao nhiêu? Ai còn nợ ai?")).toBeTruthy();
    fireEvent.press(getByText("Next"));

    // Page 5 (last page)
    expect(getByText("Quét hoá đơn bằng AI")).toBeTruthy();

    expect(storeDataMock).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("displays all subtitles correctly", () => {
    const { getByText } = render(<OnboardingPage />);

    // Page 1 subtitle
    expect(getByText("Chia chuẩn, vui cùng nhau.")).toBeTruthy();
    fireEvent.press(getByText("Next"));

    // Page 2 subtitle
    expect(
      getByText(
        "Dù là đi ăn, đi chơi, hay du lịch cùng bạn bè, chỉ cần chụp hoá đơn — mọi chi phí được tự động nhận dạng và chia đều hoặc tuỳ chỉnh linh hoạt."
      )
    ).toBeTruthy();
    fireEvent.press(getByText("Next"));

    // Page 3 subtitle
    expect(
      getByText(
        "Công nghệ OCR thông minh giúp bạn nhận diện hoá đơn, tổng tiền, từng món và người chi trả chỉ trong vài giây."
      )
    ).toBeTruthy();
    fireEvent.press(getByText("Next"));

    // Page 4 subtitle
    expect(
      getByText(
        "Ứng dụng tự động tổng hợp chi tiết các khoản chi, hiển thị rõ ràng. Dễ dàng xuất file Excel hoặc PDF để lưu lại."
      )
    ).toBeTruthy();
    fireEvent.press(getByText("Next"));

    // Page 5 subtitle
    expect(
      getByText(
        "Công nghệ OCR thông minh giúp bạn nhận diện hoá đơn, tổng tiền, từng món và người chi trả chỉ trong vài giây."
      )
    ).toBeTruthy();
  });

  it("calls handleFinish when pressing Done on last page", async () => {
    const { getByText } = render(<OnboardingPage />);

    // Navigate to last page
    fireEvent.press(getByText("Next")); // Page 2
    fireEvent.press(getByText("Next")); // Page 3
    fireEvent.press(getByText("Next")); // Page 4
    fireEvent.press(getByText("Next")); // Page 5

    // Press Done on last page
    fireEvent.press(getByText("Done"));

    await waitFor(() => {
      expect(storeDataMock).toHaveBeenCalledWith("onboarded", "1");
    });
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("calls handleFinish when pressing Next on last page", async () => {
    const { getByText } = render(<OnboardingPage />);

    // Navigate to last page
    fireEvent.press(getByText("Next")); // Page 2
    fireEvent.press(getByText("Next")); // Page 3
    fireEvent.press(getByText("Next")); // Page 4
    fireEvent.press(getByText("Next")); // Page 5

    // Press Next on last page should trigger onDone
    fireEvent.press(getByText("Next"));

    await waitFor(() => {
      expect(storeDataMock).toHaveBeenCalledWith("onboarded", "1");
    });
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("renders Skip button on all pages", () => {
    const { getByText } = render(<OnboardingPage />);

    // Check Skip button is present
    expect(getByText("Skip")).toBeTruthy();

    // Navigate through pages and verify Skip is still available
    fireEvent.press(getByText("Next"));
    expect(getByText("Skip")).toBeTruthy();

    fireEvent.press(getByText("Next"));
    expect(getByText("Skip")).toBeTruthy();
  });

  it("renders Next button on non-last pages", () => {
    const { getByText } = render(<OnboardingPage />);

    // First page should have Next button
    expect(getByText("Next")).toBeTruthy();

    // Navigate and verify Next button is present until last page
    fireEvent.press(getByText("Next"));
    expect(getByText("Next")).toBeTruthy();

    fireEvent.press(getByText("Next"));
    expect(getByText("Next")).toBeTruthy();

    fireEvent.press(getByText("Next"));
    expect(getByText("Next")).toBeTruthy();
  });

  it("renders Done button on last page", () => {
    const { getByText } = render(<OnboardingPage />);

    // Navigate to last page
    fireEvent.press(getByText("Next")); // Page 2
    fireEvent.press(getByText("Next")); // Page 3
    fireEvent.press(getByText("Next")); // Page 4
    fireEvent.press(getByText("Next")); // Page 5

    // Last page should have Done button
    expect(getByText("Done")).toBeTruthy();
  });
});
