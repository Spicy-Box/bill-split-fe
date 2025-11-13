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
  const { View } = jest.requireActual("react-native");

  const MockOnboarding = ({
    SkipButtonComponent,
    NextButtonComponent,
    DoneButtonComponent,
    onSkip,
    onDone,
  }: any) => (
    <View>
      {SkipButtonComponent ? <SkipButtonComponent onPress={onSkip} /> : null}
      {NextButtonComponent ? <NextButtonComponent onPress={jest.fn()} /> : null}
      {DoneButtonComponent ? <DoneButtonComponent onPress={onDone} /> : null}
    </View>
  );

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

  it("renders Next button without finishing onboarding", () => {
    const { getByText } = render(<OnboardingPage />);

    fireEvent.press(getByText("Next"));

    expect(storeDataMock).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
