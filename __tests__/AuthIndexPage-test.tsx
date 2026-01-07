import { getData } from "@/utils/asyncStorage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import AuthIndexPage from "../app/auth/index";

const mockReplace = jest.fn();

jest.mock("@/utils/asyncStorage", () => ({
    getData: jest.fn(),
}));

jest.mock("expo-router", () => ({
    useRouter: () => ({
        replace: mockReplace,
    }),
}));

describe("<AuthIndexPage />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects to onboarding when onboarded !== 1", async () => {
        (getData as jest.Mock).mockResolvedValue(null);

        render(<AuthIndexPage />);

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/onboarding");
        });
    });

    it("redirects to login when onboarded === 1", async () => {
        (getData as jest.Mock).mockResolvedValue("1");

        render(<AuthIndexPage />);

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/auth/login");
        });
    });

    it("checks onboarding status on mount", async () => {
        (getData as jest.Mock).mockResolvedValue("1");

        render(<AuthIndexPage />);

        await waitFor(() => {
            expect(getData).toHaveBeenCalledWith("onboarded");
        });
    });

    it("renders empty view with gradient background", () => {
        (getData as jest.Mock).mockResolvedValue("1");

        const { toJSON } = render(<AuthIndexPage />);

        expect(toJSON()).toBeTruthy();
    });
});
