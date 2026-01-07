import { useForgotPasswordStore } from "@/stores/useForgotPasswordStore";
import api from "@/utils/api";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AxiosError } from "axios";
import React from "react";
import ForgotPasswordPage from "../app/auth/forgot_password";

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

jest.mock("@/stores/useForgotPasswordStore", () => ({
    useForgotPasswordStore: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
    show: jest.fn(),
}));

const Toast = require("react-native-toast-message");

describe("<ForgotPasswordPage />", () => {
    const mockSetEmail = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
        (useForgotPasswordStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                setEmail: mockSetEmail,
            };
            return selector(state);
        });
    });

    it("renders forgot password form correctly", () => {
        const { getByText, getByTestId } = render(<ForgotPasswordPage />);

        expect(getByText("Forgot password")).toBeTruthy();
        expect(getByText("Please enter your email to reset password")).toBeTruthy();
        expect(getByTestId("text-input-flat")).toBeTruthy();
        expect(getByText("Reset Password")).toBeTruthy();
    });

    it("updates email input when user types", () => {
        const { getByTestId } = render(<ForgotPasswordPage />);

        const emailInput = getByTestId("text-input-flat");
        fireEvent.changeText(emailInput, "test@example.com");

        expect(emailInput.props.value).toBe("test@example.com");
    });

    it("calls API and navigates to OTP on successful request", async () => {
        const { getByTestId, getByText } = render(<ForgotPasswordPage />);

        const emailInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(emailInput, "test@example.com");
        fireEvent.press(resetButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                "http://test-api.com/users/forgot-password",
                { email: "test@example.com" }
            );
            expect(mockSetEmail).toHaveBeenCalledWith("test@example.com");
            expect(Toast.show).toHaveBeenCalledWith({
                type: "success",
                text1: "Send Email successfully",
            });
            expect(mockNavigate).toHaveBeenCalledWith("/auth/otp");
        });
    });

    it("shows loading indicator during API call", async () => {
        (api.post as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        const { getByTestId, getByText, getByRole } = render(<ForgotPasswordPage />);

        const emailInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(emailInput, "test@example.com");
        fireEvent.press(resetButton);

        await waitFor(() => {
            const activityIndicator = getByRole("progressbar");
            expect(activityIndicator).toBeTruthy();
        });
    });

    it("navigates to OTP page on 429 error (too many requests)", async () => {
        const axiosError = {
            isAxiosError: true,
            response: {
                status: 429,
            },
        } as AxiosError;

        (api.post as jest.Mock).mockRejectedValue(axiosError);

        const { getByTestId, getByText } = render(<ForgotPasswordPage />);

        const emailInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(emailInput, "test@example.com");
        fireEvent.press(resetButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/auth/otp");
        });
    });

    it("handles non-429 error gracefully", async () => {
        const axiosError = {
            isAxiosError: true,
            response: {
                status: 500,
            },
        } as AxiosError;

        (api.post as jest.Mock).mockRejectedValue(axiosError);

        const { getByTestId, getByText } = render(<ForgotPasswordPage />);

        const emailInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(emailInput, "test@example.com");
        fireEvent.press(resetButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it("handles non-Axios error gracefully", async () => {
        (api.post as jest.Mock).mockRejectedValue(new Error("Network error"));

        const { getByTestId, getByText } = render(<ForgotPasswordPage />);

        const emailInput = getByTestId("text-input-flat");
        const resetButton = getByText("Reset Password");

        fireEvent.changeText(emailInput, "test@example.com");
        fireEvent.press(resetButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
        });
    });
});
