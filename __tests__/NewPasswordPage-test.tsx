import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/utils/api";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import SetNewPasswordPage from "../app/auth/new_password";

const mockNavigate = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({
        navigate: mockNavigate,
    }),
}));

jest.mock("@/utils/api", () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    },
    apiUrl: "http://test-api.com",
}));

jest.mock("@/stores/useAuthStore", () => ({
    useAuthStore: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
    show: jest.fn(),
}));

const Toast = require("react-native-toast-message");

describe("<SetNewPasswordPage />", () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
        mockLogout.mockResolvedValue(undefined);

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                logout: mockLogout,
                hasHydrated: true,
            };
            return selector(state);
        });
    });

    it("renders new password form correctly", () => {
        const { getByText, getByTestId } = render(<SetNewPasswordPage />);

        expect(getByText("Forgot password")).toBeTruthy();
        expect(getByText("Please enter your email to reset password")).toBeTruthy();
        expect(getByTestId("text-input-flat")).toBeTruthy();
        expect(getByText("Reset Password")).toBeTruthy();
    });

    it("updates new password input when user types", () => {
        const { getByTestId } = render(<SetNewPasswordPage />);

        const passwordInput = getByTestId("text-input-flat");
        fireEvent.changeText(passwordInput, "newPassword123");

        expect(passwordInput.props.value).toBe("newPassword123");
    });

    it("calls API, logs out and navigates to login on successful password reset", async () => {
        const { getByTestId, getByText } = render(<SetNewPasswordPage />);

        const passwordInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(passwordInput, "newPassword123");
        fireEvent.press(resetButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                "http://test-api.com/users/change-password",
                { new_password: "newPassword123" }
            );
            expect(mockLogout).toHaveBeenCalled();
            expect(Toast.show).toHaveBeenCalledWith({
                type: "success",
                text1: "Change password successfully",
            });
            expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
        });
    });

    it("shows loading indicator during API call", async () => {
        (api.post as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        const { getByTestId, getByText, getByRole } = render(<SetNewPasswordPage />);

        const passwordInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(passwordInput, "newPassword123");
        fireEvent.press(resetButton);

        await waitFor(() => {
            const activityIndicator = getByRole("progressbar");
            expect(activityIndicator).toBeTruthy();
        });
    });

    it("shows loading indicator when not hydrated", () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                logout: mockLogout,
                hasHydrated: false,
            };
            return selector(state);
        });

        const { getByRole } = render(<SetNewPasswordPage />);

        const activityIndicator = getByRole("progressbar");
        expect(activityIndicator).toBeTruthy();
    });

    it("shows error toast on API failure", async () => {
        mockLogout.mockResolvedValue(undefined);

        (api.post as jest.Mock).mockRejectedValue({
            response: {
                data: {
                    message: "Password too weak",
                },
            },
        });

        const { getByTestId, getByText } = render(<SetNewPasswordPage />);

        const passwordInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(passwordInput, "weak");
        fireEvent.press(resetButton);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith({
                type: "error",
                text1: "Failed to reset password",
                text2: "Password too weak",
            });
        });
    });

    it("shows generic error message when API error has no message", async () => {
        (api.post as jest.Mock).mockRejectedValue(new Error("Network error"));

        const { getByTestId, getByText } = render(<SetNewPasswordPage />);

        const passwordInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(passwordInput, "newPassword123");
        fireEvent.press(resetButton);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith({
                type: "error",
                text1: "Failed to reset password",
                text2: "Please try again",
            });
        });
    });
});
