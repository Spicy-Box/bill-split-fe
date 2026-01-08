import HomeScreen from "@/app/(tabs)";
import { getData } from "@/utils/asyncStorage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock child components to avoid complex dependencies
jest.mock("@/components/HomePage/WelcomePanel", () => {
  const { View, Text } = jest.requireActual("react-native");
  return function MockWelcomePanel() {
    return (
      <View testID="mock-welcome-panel">
        <Text>Welcome Panel</Text>
      </View>
    );
  };
});

jest.mock("@/components/HomePage/CreateNewEvent", () => {
  const { View, Text } = jest.requireActual("react-native");
  return function MockCreateNewEvent() {
    return (
      <View testID="mock-create-new-event">
        <Text>Create New Event</Text>
      </View>
    );
  };
});

jest.mock("@/components/HomePage/EventList", () => {
  const { View, Text } = jest.requireActual("react-native");
  return function MockEventList() {
    return (
      <View testID="mock-event-list">
        <Text>Event List</Text>
      </View>
    );
  };
});

jest.mock("@/utils/asyncStorage", () => ({
  getData: jest.fn(),
  removeData: jest.fn(),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

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

describe("<HomeScreen />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Redirects to onboarding when onboarded !== 1", async () => {
    (getData as jest.Mock).mockResolvedValue(null);

    render(<HomeScreen />);

    await waitFor(() => {
      expect(getData).toHaveBeenCalledWith("onboarded");
      expect(mockReplace).toHaveBeenCalledWith("/onboarding");
    });
  });

  test("Does not redirect when user is already onboarded", async () => {
    (getData as jest.Mock).mockResolvedValue("1");

    const { getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getData).toHaveBeenCalledWith("onboarded");
      expect(mockReplace).not.toHaveBeenCalled();
    });

    expect(getByTestId("mock-welcome-panel")).toBeTruthy();
    expect(getByTestId("mock-create-new-event")).toBeTruthy();
    expect(getByTestId("mock-event-list")).toBeTruthy();
  });

  test("Renders all child components", async () => {
    (getData as jest.Mock).mockResolvedValue("1");

    const { getByTestId, getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByTestId("mock-welcome-panel")).toBeTruthy();
      expect(getByTestId("mock-create-new-event")).toBeTruthy();
      expect(getByTestId("mock-event-list")).toBeTruthy();
      expect(getByText("Welcome Panel")).toBeTruthy();
      expect(getByText("Create New Event")).toBeTruthy();
      expect(getByText("Event List")).toBeTruthy();
    });
  });
});
