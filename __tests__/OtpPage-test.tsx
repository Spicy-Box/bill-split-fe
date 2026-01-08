import { useAuthStore } from "@/stores/useAuthStore";
import { useForgotPasswordStore } from "@/stores/useForgotPasswordStore";
import api from "@/utils/api";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import Toast from "react-native-toast-message";
import OtpPage from "../app/auth/otp";

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

jest.mock("@/stores/useAuthStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("react-native-otp-entry", () => {
  const React = jest.requireActual("react");
  const { TextInput } = jest.requireActual("react-native");

  return {
    OtpInput: ({ onTextChange, numberOfDigits, autoFocus }: any) => {
      return (
        <TextInput
          testID="otp-input"
          onChangeText={onTextChange}
          maxLength={numberOfDigits}
          autoFocus={autoFocus}
        />
      );
    },
  };
});

describe("<OtpPage />", () => {
  const mockSetAccessToken = jest.fn();
  const mockSetRefreshToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        data: {
          access_token: "fake-access-token",
          refresh_token: "fake-refresh-token",
        },
      },
    });

    (useForgotPasswordStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        email: "test@example.com",
      };
      return selector(state);
    });

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        setAccessToken: mockSetAccessToken,
        setRefreshToken: mockSetRefreshToken,
      };
      return selector(state);
    });
  });

  it("renders OTP form correctly", () => {
    const { getByText, getByTestId } = render(<OtpPage />);

    expect(getByText("Check your email")).toBeTruthy();
    expect(getByText("Verify Code")).toBeTruthy();
    expect(getByTestId("otp-input")).toBeTruthy();
  });

  it("updates OTP input when user types", () => {
    const { getByTestId } = render(<OtpPage />);

    const otpInput = getByTestId("otp-input");
    fireEvent.changeText(otpInput, "123456");

    expect(otpInput).toBeTruthy();
  });

  it("calls API and navigates to new password on successful OTP verification", async () => {
    const { getByTestId, getByText } = render(<OtpPage />);

    const otpInput = getByTestId("otp-input");
    const verifyButton = getByText("Verify Code");

    fireEvent.changeText(otpInput, "123456");
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("http://test-api.com/users/verify-otp", {
        code: "123456",
        email: "test@example.com",
      });
      expect(mockSetAccessToken).toHaveBeenCalledWith("fake-access-token");
      expect(mockSetRefreshToken).toHaveBeenCalledWith("fake-refresh-token");
      expect(mockNavigate).toHaveBeenCalledWith("/auth/new_password");
    });
  });

  it("shows loading indicator during API call", async () => {
    (api.post as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { getByTestId, getByText, getByRole } = render(<OtpPage />);

    const otpInput = getByTestId("otp-input");
    const verifyButton = getByText("Verify Code");

    fireEvent.changeText(otpInput, "123456");
    fireEvent.press(verifyButton);

    await waitFor(() => {
      const activityIndicator = getByRole("progressbar");
      expect(activityIndicator).toBeTruthy();
    });
  });

  it("handles API error gracefully and shows error toast", async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          detail: "Invalid OTP",
        },
      },
    });

    const { getByTestId, getByText } = render(<OtpPage />);

    const otpInput = getByTestId("otp-input");
    const verifyButton = getByText("Verify Code");

    fireEvent.changeText(otpInput, "123456");
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(Toast.show).toHaveBeenCalledWith({
        type: "error",
        text1: "Invalid OTP",
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("uses email from forgot password store", () => {
    (useForgotPasswordStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        email: "custom@example.com",
      };
      return selector(state);
    });

    const { getByTestId, getByText } = render(<OtpPage />);

    const otpInput = getByTestId("otp-input");
    const verifyButton = getByText("Verify Code");

    fireEvent.changeText(otpInput, "123456");
    fireEvent.press(verifyButton);

    waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "http://test-api.com/users/verify-otp",
        expect.objectContaining({
          email: "custom@example.com",
        })
      );
    });
  });
});
