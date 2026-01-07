import api from "@/utils/api";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import SignUpPage from "../app/auth/signup";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({
        replace: mockReplace,
    }),
    Link: ({ children, href }: any) => <>{children}</>,
}));

jest.mock("@/utils/api", () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    },
    apiUrl: "http://test-api.com",
}));

jest.mock("react-native-paper-dates", () => {
    const React = jest.requireActual("react");
    const { TextInput } = jest.requireActual("react-native-paper");

    return {
        DatePickerInput: ({ label, value, onChange }: any) => {
            return (
                <TextInput
                    label={label}
                    value={value ? value.toISOString() : ""}
                    onChangeText={(text: string) => {
                        if (text) {
                            onChange(new Date(text));
                        }
                    }}
                    testID="date-picker-input"
                />
            );
        },
    };
});

describe("<SignUpPage />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    });

    it("renders signup form correctly", () => {
        const { getByText, getAllByTestId } = render(<SignUpPage />);

        expect(getByText("Sign Up")).toBeTruthy();
        expect(getByText("Already have an account?")).toBeTruthy();
        expect(getAllByTestId("text-input-flat").length).toBeGreaterThanOrEqual(4);
    });

    it("updates first name input when user types", () => {
        const { getAllByTestId } = render(<SignUpPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const firstNameInput = textInputs[0];
        fireEvent.changeText(firstNameInput, "John");

        expect(firstNameInput.props.value).toBe("John");
    });

    it("updates last name input when user types", () => {
        const { getAllByTestId } = render(<SignUpPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const lastNameInput = textInputs[1];
        fireEvent.changeText(lastNameInput, "Doe");

        expect(lastNameInput.props.value).toBe("Doe");
    });

    it("updates email input when user types", () => {
        const { getAllByTestId } = render(<SignUpPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const emailInput = textInputs[3];
        fireEvent.changeText(emailInput, "john@example.com");

        expect(emailInput.props.value).toBe("john@example.com");
    });

    it("updates password input when user types", () => {
        const { getAllByTestId } = render(<SignUpPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const passwordInput = textInputs[4];
        fireEvent.changeText(passwordInput, "password123");

        expect(passwordInput.props.value).toBe("password123");
    });

    it("updates phone input when user types", () => {
        const { getAllByTestId } = render(<SignUpPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const phoneInput = textInputs[2];
        fireEvent.changeText(phoneInput, "0123456789");

        expect(phoneInput.props.value).toBe("0123456789");
    });

    it("updates date of birth when user selects a date", () => {
        const { getByTestId } = render(<SignUpPage />);

        const dateInput = getByTestId("date-picker-input");
        const testDate = new Date("1990-01-01");

        fireEvent.changeText(dateInput, testDate.toISOString());

        expect(dateInput.props.value).toBe(testDate.toISOString());
    });

    it("calls API and redirects on successful signup", async () => {
        const { getAllByTestId, getByText, getByTestId } = render(<SignUpPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const firstNameInput = textInputs[0];
        const lastNameInput = textInputs[1];
        const phoneInput = textInputs[2];
        const emailInput = textInputs[3];
        const passwordInput = textInputs[4];
        const dateInput = getByTestId("date-picker-input");
        const signupButton = getByText("Signup");

        fireEvent.changeText(firstNameInput, "John");
        fireEvent.changeText(lastNameInput, "Doe");
        fireEvent.changeText(emailInput, "john@example.com");
        fireEvent.changeText(passwordInput, "password123");
        fireEvent.changeText(phoneInput, "0123456789");
        fireEvent.changeText(dateInput, new Date("1990-01-01").toISOString());

        fireEvent.press(signupButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                "http://test-api.com/users/create-user",
                expect.objectContaining({
                    first_name: "John",
                    last_name: "Doe",
                    email: "john@example.com",
                    password: "password123",
                    phone: "0123456789",
                    dob: "1990-01-01",
                })
            );
            expect(mockReplace).toHaveBeenCalledWith("/auth/login");
        });
    });

    it("shows loading indicator during signup", async () => {
        (api.post as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        const { getAllByTestId, getByText, getByTestId, getByRole } = render(<SignUpPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const firstNameInput = textInputs[0];
        const dateInput = getByTestId("date-picker-input");
        const signupButton = getByText("Signup");

        fireEvent.changeText(firstNameInput, "John");
        fireEvent.changeText(dateInput, new Date("1990-01-01").toISOString());
        fireEvent.press(signupButton);

        await waitFor(() => {
            const activityIndicator = getByRole("progressbar");
            expect(activityIndicator).toBeTruthy();
        });
    });

    it("API is called when Signup button is pressed", async () => {
        const { getAllByTestId, getByText, getByTestId } = render(<SignUpPage />);

        const textInputs = getAllByTestId("text-input-flat");
        const firstNameInput = textInputs[0];
        const lastNameInput = textInputs[1];
        const phoneInput = textInputs[2];
        const emailInput = textInputs[3];
        const passwordInput = textInputs[4];
        const dateInput = getByTestId("date-picker-input");
        const signupButton = getByText("Signup");

        fireEvent.changeText(firstNameInput, "John");
        fireEvent.changeText(lastNameInput, "Doe");
        fireEvent.changeText(emailInput, "john@example.com");
        fireEvent.changeText(passwordInput, "password123");
        fireEvent.changeText(phoneInput, "0123456789");
        fireEvent.changeText(dateInput, new Date("1990-01-01").toISOString());

        fireEvent.press(signupButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                "http://test-api.com/users/create-user",
                expect.objectContaining({
                    first_name: "John",
                    last_name: "Doe",
                    email: "john@example.com",
                })
            );
        });
    });
});
