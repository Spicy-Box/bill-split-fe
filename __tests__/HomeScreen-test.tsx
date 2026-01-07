import HomeScreen from "@/app/(tabs)";
import { getData } from "@/utils/asyncStorage";
import { render, waitFor } from "@testing-library/react-native";

jest.mock("axios", () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  })),
}));

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
  getData: jest.fn(),
  removeData: jest.fn(),
}));

jest.mock("@/stores/useAuthStore", () => ({
  useAuthStore: Object.assign(
    jest.fn((selector) => {
      const state = {
        user: { id: 1, name: "Test User" },
        accessToken: "mock-token",
      };
      return selector ? selector(state) : state;
    }),
    {
      getState: jest.fn(() => ({
        user: { id: 1, name: "Test User" },
        accessToken: "mock-token",
      })),
    }
  ),
}));

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),

  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/assets/images/event-icon.svg", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return function MockEventIcon(props: any) {
    return <View testID="mock-event-icon" {...props} />;
  };
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

describe("<HomeScree/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Redirects to onboarding when onboarded !== 1", async () => {
    (getData as jest.Mock).mockResolvedValue(null);

    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/onboarding");
    });
  });
});
