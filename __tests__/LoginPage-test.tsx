import { useAuthStore } from "@/stores/useAuthStore";
import { getData } from "@/utils/asyncStorage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import LoginPage from "../app/auth/login";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("@/utils/asyncStorage", () => ({
    getData: jest.fn(),
    storeData: jest.fn(),
    removeData: jest.fn(),
}));

jest.mock("expo-router", () => ({
    useRouter: () => ({
        replace: mockReplace,
        push: mockPush,
    }),
    Link: ({ children, href }: any) => <>{children}</>,
}));

jest.mock("@/stores/useAuthStore", () => ({
    useAuthStore: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
    show: jest.fn(),
}));

const Toast = require("react-native-toast-message");

describe("<LoginPage />", () => {
    const mockLogin = jest.fn();
    const mockGetState = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (getData as jest.Mock).mockResolvedValue("1");

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                login: mockLogin,
                isLoading: false,
                error: null,
                hasHydrated: true,
                user: null,
                accessToken: null,
            };
            return selector(state);
        });

        useAuthStore.getState = mockGetState.mockReturnValue({
            user: null,
            accessToken: null,
        });
    });

    it("renders login form correctly", () => {
        const { getByText } = render(<LoginPage />);

        expect(getByText("Get Started Now")).toBeTruthy();
        expect(getByText("Created an account or login to explore")).toBeTruthy();
        expect(getByText("Login")).toBeTruthy();
        expect(getByText("Don't have an account?")).toBeTruthy();
    });

    it("updates email input when user types", () => {
        const { getAllByTestId } = render(<LoginPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const emailInput = textInputs[0];
        fireEvent.changeText(emailInput, "test@example.com");

        expect(emailInput.props.value).toBe("test@example.com");
    });

    it("updates password input when user types", () => {
        const { getAllByTestId } = render(<LoginPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const passwordInput = textInputs[1];
        fireEvent.changeText(passwordInput, "password123");

        expect(passwordInput.props.value).toBe("password123");
    });

    it("calls login function when Login button is pressed", async () => {
        const { getAllByTestId, getByText } = render(<LoginPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const emailInput = textInputs[0];
        const passwordInput = textInputs[1];
        const loginButton = getByText("Login");

        fireEvent.changeText(emailInput, "test@example.com");
        fireEvent.changeText(passwordInput, "password123");
        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
        });
    });

    it("redirects to home page on successful login", async () => {
        mockGetState.mockReturnValue({
            user: { id: "1", email: "test@example.com" },
            accessToken: "fake-token",
        });

        const { getAllByTestId, getByText } = render(<LoginPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const emailInput = textInputs[0];
        const passwordInput = textInputs[1];
        const loginButton = getByText("Login");

        fireEvent.changeText(emailInput, "test@example.com");
        fireEvent.changeText(passwordInput, "password123");
        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith({
                type: "success",
                text1: "Login successfully",
            });
            expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
        });
    });

    it("shows error toast when login fails", async () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                login: mockLogin,
                isLoading: false,
                error: "Invalid credentials",
                hasHydrated: true,
                user: null,
                accessToken: null,
            };
            return selector(state);
        });

        const { rerender } = render(<LoginPage />);

        rerender(<LoginPage />);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith({
                type: "error",
                text1: "Login failed",
                text2: "Invalid credentials",
            });
        });
    });

    it("toggles Remember Me checkbox", () => {
        const { getByLabelText } = render(<LoginPage />);

        const checkbox = getByLabelText("Remember Me");

        fireEvent.press(checkbox);
        expect(checkbox).toBeTruthy();
    });

    it("redirects to onboarding if not onboarded", async () => {
        (getData as jest.Mock).mockResolvedValue(null);

        render(<LoginPage />);

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/onboarding");
        });
    });

    it("shows loading indicator when isLoading is true", () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                login: mockLogin,
                isLoading: true,
                error: null,
                hasHydrated: true,
                user: null,
                accessToken: null,
            };
            return selector(state);
        });

        const { getByRole } = render(<LoginPage />);

        const activityIndicator = getByRole("progressbar");
        expect(activityIndicator).toBeTruthy();
    });

    it("shows loading indicator when not hydrated", () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                login: mockLogin,
                isLoading: false,
                error: null,
                hasHydrated: false,
                user: null,
                accessToken: null,
            };
            return selector(state);
        });

        const { getByRole } = render(<LoginPage />);

        const activityIndicator = getByRole("progressbar");
        expect(activityIndicator).toBeTruthy();
    });
});
