import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert } from "react-native";
import OverallScreen from "../app/events/overall"; // Điều chỉnh đường dẫn đúng file của bạn

// --- MOCKING ---

// 1. Mock Router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// 2. Mock Image Picker
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// 3. Mock Icons & Thư viện UI (Tránh lỗi interop CSS)
jest.mock("lucide-react-native", () => ({
  Plus: "PlusIcon",
}));

jest.mock("react-native-paper", () => ({
  Button: "Button",
}));

// 4. Mock Component con bằng String/Simple Function
// Việc này giúp test tập trung vào logic của OverallScreen mà không bị crash do component con
jest.mock("@/components/EventOverall", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return {
    EventHeader: "EventHeader",
    StatsCard: "StatsCard",
    BillsList: "BillsList",
    AddBillMenuModal: ({ visible, onOpenCamera, onUploadBill, onCreateBill, onClose }: any) => {
      if (!visible) return null;
      return (
        <View>
          <TouchableOpacity onPress={onOpenCamera}>
            <Text>Open Camera Btn</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onUploadBill}>
            <Text>Upload Bill Btn</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCreateBill}>
            <Text>Create Bill Btn</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text>Close Modal</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

describe("OverallScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(cleanup);

  it("nên hiển thị màn hình với nút 'Add Bill'", () => {
    render(<OverallScreen />);
    expect(screen.getByText("Add Bill")).toBeTruthy();
  });

  it("nên mở Modal menu khi nhấn vào nút FAB", () => {
    render(<OverallScreen />);

    const fab = screen.getByText("Add Bill");
    fireEvent.press(fab);

    // Kiểm tra xem các nút trong Modal đã xuất hiện chưa
    expect(screen.getByText("Open Camera Btn")).toBeTruthy();
    expect(screen.getByText("Upload Bill Btn")).toBeTruthy();
  });

  it("nên điều hướng đến màn hình Camera khi chọn Open Camera", () => {
    render(<OverallScreen />);
    fireEvent.press(screen.getByText("Add Bill"));

    fireEvent.press(screen.getByText("Open Camera Btn"));
    expect(mockPush).toHaveBeenCalledWith("/events/camera");
  });

  it("nên điều hướng đến màn hình Add Bill khi chọn Create Bill", () => {
    render(<OverallScreen />);
    fireEvent.press(screen.getByText("Add Bill"));

    fireEvent.press(screen.getByText("Create Bill Btn"));
    expect(mockPush).toHaveBeenCalledWith("/bills/add");
  });

  describe("Logic pickImage (Thư viện ảnh)", () => {
    it("nên hiển thị Alert cảnh báo nếu không có quyền truy cập thư viện ảnh", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });

      render(<OverallScreen />);
      fireEvent.press(screen.getByText("Add Bill"));
      fireEvent.press(screen.getByText("Upload Bill Btn"));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "Permission required",
          "Permission to access the media library is required."
        );
      });
    });

    it("nên đóng Modal và lưu ảnh khi người dùng chọn ảnh thành công", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "mock-image-uri.jpg" }],
      });

      render(<OverallScreen />);
      fireEvent.press(screen.getByText("Add Bill"));
      fireEvent.press(screen.getByText("Upload Bill Btn"));

      await waitFor(() => {
        // Kiểm tra xem modal đã đóng chưa (nút này sẽ biến mất)
        expect(screen.queryByText("Upload Bill Btn")).toBeNull();
      });
    });
  });
});
