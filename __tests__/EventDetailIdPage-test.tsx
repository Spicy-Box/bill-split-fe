import api from "@/utils/api";
import { parseDataFromPhoto } from "@/utils/imageOCR";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert } from "react-native";
import EventDetailScreen from "../app/events/[id]"; // Điều chỉnh đường dẫn

// --- MOCKING ---

// 1. Mock Expo Router
const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, navigate: mockNavigate }),
  useLocalSearchParams: () => ({ id: "event_999" }),
}));

// 2. Mock API
jest.mock("@/utils/api", () => ({
  get: jest.fn(),
}));

// 3. Mock Zustand Store
const mockSetParticipants = jest.fn();
const mockSetEventId = jest.fn();
jest.mock("@/stores/useEventStore", () => ({
  useEventStore: (selector: any) =>
    selector({
      setParticipants: mockSetParticipants,
      setEventId: mockSetEventId,
    }),
}));

// 4. Mock Image Picker & OCR
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/utils/imageOCR", () => ({
  parseDataFromPhoto: jest.fn(),
}));

jest.mock("react-native-paper", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return {
    // Biến IconButton thành một TouchableOpacity đơn giản có nhãn để tìm kiếm
    IconButton: ({ onPress, icon }: any) => (
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={icon} // Dùng tên icon làm nhãn tìm kiếm
      >
        <Text>{icon}</Text>
      </TouchableOpacity>
    ),
    ActivityIndicator: "ActivityIndicator",
  };
});

// 5. Mock Component con bằng String (để tránh lỗi Interop/CSS)
jest.mock("@/components/EventOverall", () => ({
  EventHeader: "EventHeader",
  StatsCard: "StatsCard",
  BillsList: ({ bills }: any) => {
    const { Text, View } = require("react-native");
    return (
      <View>
        {bills.map((b: any) => (
          <Text key={b.id}>{b.title}</Text>
        ))}
      </View>
    );
  },
  AddBillMenuModal: ({ visible, onOpenCamera, onUploadBill, onCreateBill }: any) => {
    if (!visible) return null;
    const { TouchableOpacity, Text, View } = require("react-native");
    return (
      <View>
        <TouchableOpacity onPress={onOpenCamera}>
          <Text>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onUploadBill}>
          <Text>Upload Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCreateBill}>
          <Text>Manual Entry</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

// Dữ liệu giả lập
const mockEventData = {
  data: {
    data: {
      name: "Camping 2026",
      createdAt: "2026-01-07T10:00:00Z",
      totalAmount: 5000,
      participants: [{ id: "1", name: "Eric" }],
    },
  },
};

const mockBillsData = {
  data: {
    data: [{ id: "b1", title: "Dinner", totalAmount: 1000, paidBy: "Eric" }],
  },
};

describe("EventDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/bills/")) return Promise.resolve(mockBillsData);
      return Promise.resolve(mockEventData);
    });
  });

  afterEach(cleanup);

  it("nên load dữ liệu event và danh sách bill khi render", async () => {
    render(<EventDetailScreen />);

    await waitFor(() => {
      // Kiểm tra API detail được gọi
      expect(api.get).toHaveBeenCalledWith("/events/event_999");
      // Kiểm tra store được cập nhật
      expect(mockSetEventId).toHaveBeenCalledWith("event_999");
      expect(mockSetParticipants).toHaveBeenCalled();
    });

    // Kiểm tra danh sách bill hiển thị (thông qua BillsList mock)
    expect(screen.getByText("Dinner")).toBeTruthy();
  });

  it("nên mở menu 'Add Bill' khi nhấn nút FAB", async () => {
    render(<EventDetailScreen />);

    const fabButton = screen.getByText("Add Bill");
    fireEvent.press(fabButton);

    // Menu Modal hiện lên
    expect(screen.getByText("Open Camera")).toBeTruthy();
    expect(screen.getByText("Upload Photo")).toBeTruthy();
  });

  it("nên chuyển hướng khi chọn 'Open Camera' hoặc 'Manual Entry'", async () => {
    render(<EventDetailScreen />);
    fireEvent.press(screen.getByText("Add Bill"));

    // Nhấn Open Camera
    fireEvent.press(screen.getByText("Open Camera"));
    expect(mockPush).toHaveBeenCalledWith("/events/camera");

    // Mở lại menu và nhấn Manual
    fireEvent.press(screen.getByText("Add Bill"));
    fireEvent.press(screen.getByText("Manual Entry"));
    expect(mockPush).toHaveBeenCalledWith("/bills/add");
  });

  it("nên xử lý upload ảnh và gọi OCR thành công", async () => {
    // Giả lập cấp quyền và chọn ảnh
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "photo_uri_123" }],
    });

    render(<EventDetailScreen />);
    fireEvent.press(screen.getByText("Add Bill"));

    const uploadBtn = screen.getByText("Upload Photo");
    fireEvent.press(uploadBtn);

    await waitFor(() => {
      // Kiểm tra OCR được gọi với đúng URI ảnh
      expect(parseDataFromPhoto).toHaveBeenCalledWith("photo_uri_123", expect.anything());
    });
  });

  it("nên báo lỗi nếu người dùng từ chối quyền truy cập thư viện ảnh", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });

    render(<EventDetailScreen />);
    fireEvent.press(screen.getByText("Add Bill"));
    fireEvent.press(screen.getByText("Upload Photo"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Permission required", expect.any(String));
    });
  });

  it("nên quay về trang chủ khi nhấn nút đóng (X)", async () => {
    render(<EventDetailScreen />);

    // 1. Đợi các hàm fetch dữ liệu ban đầu hoàn tất để tránh lỗi act()
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    // 2. Tìm nút Close dựa trên accessibilityLabel "close" (từ props icon="close")
    const closeBtn = screen.getByLabelText("close");

    // 3. Thực hiện nhấn nút
    fireEvent.press(closeBtn);

    // 4. Kiểm tra xem router.navigate có được gọi đúng không
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
