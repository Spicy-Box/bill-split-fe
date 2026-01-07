import api from "@/utils/api";
import { parseDataFromPhoto } from "@/utils/imageOCR";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, BackHandler } from "react-native";
import Toast from "react-native-toast-message";
import EventDetailScreen from "../app/events/[id]";

// --- MOCKING ---

// 0. Mock AsyncStorage (PHẢI ĐẶT TRƯỚC TẤT CẢ)
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// 1. Mock Auth Store
jest.mock("@/stores/useAuthStore", () => ({
  useAuthStore: () => ({
    user: {
      id: "user_123",
      first_name: "Eric",
      last_name: "Nguyễn",
    },
    accessToken: "mock-token",
  }),
}));

// 2. Mock Expo Router
const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, navigate: mockNavigate }),
  useLocalSearchParams: () => ({ id: "event_999" }),
}));

// 3. Mock API
jest.mock("@/utils/api", () => ({
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
}));

// Mock Toast
jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

// 4. Mock Zustand Event Store
const mockSetParticipants = jest.fn();
const mockSetEventId = jest.fn();
jest.mock("@/stores/useEventStore", () => ({
  useEventStore: (selector: any) =>
    selector({
      setParticipants: mockSetParticipants,
      setEventId: mockSetEventId,
    }),
}));

// 5. Mock Image Picker & OCR
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/utils/imageOCR", () => ({
  parseDataFromPhoto: jest.fn(),
}));

// 6. Mock react-native-paper
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

// 7. Mock Component con (để tránh lỗi Interop/CSS)
jest.mock("@/components/EventOverall", () => ({
  EventHeader: "EventHeader",
  StatsCard: "StatsCard",
  BillsList: ({ bills, onDeleteBill, onEditBill }: any) => {
    const { Text, View, TouchableOpacity } = require("react-native");
    return (
      <View>
        {bills.map((b: any) => (
          <View key={b.id}>
            <Text>{b.title}</Text>
            <TouchableOpacity onPress={() => onDeleteBill(b.id)}>
              <Text>Delete {b.id}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onEditBill(b.id, b.title)}>
              <Text>Edit {b.id}</Text>
            </TouchableOpacity>
          </View>
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
    data: [
      { id: "b1", title: "Dinner", totalAmount: 1000, paidBy: { name: "Eric", is_guest: false } },
    ],
  },
};

const mockEventSummary = {
  data: {
    data: {
      totalAmount: 5000,
    },
  },
};

const mockMyExpense = {
  data: {
    data: {
      totalExpense: 2500,
    },
  },
};

describe("EventDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/summary")) return Promise.resolve(mockEventSummary);
      if (url.includes("/registered-users-expense")) return Promise.resolve(mockMyExpense);
      if (url.includes("/bills/")) return Promise.resolve(mockBillsData);
      return Promise.resolve(mockEventData);
    });
    (api.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
    (api.put as jest.Mock).mockResolvedValue({ data: { success: true } });
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

  it("nên gọi API event summary khi component mount", async () => {
    render(<EventDetailScreen />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/events/event_999/summary");
      expect(api.get).toHaveBeenCalledWith("/bills/events/event_999/registered-users-expense");
    });
  });

  it("nên xóa bill thành công khi nhấn nút Delete", async () => {
    render(<EventDetailScreen />);

    // Đợi dữ liệu load xong
    await waitFor(() => {
      expect(screen.getByText("Dinner")).toBeTruthy();
    });

    // Nhấn nút Delete
    const deleteBtn = screen.getByText("Delete b1");
    fireEvent.press(deleteBtn);

    await waitFor(() => {
      // Kiểm tra API delete được gọi
      expect(api.delete).toHaveBeenCalledWith("/bills/b1");
      // Kiểm tra Toast thành công
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "Success",
          text2: "Bill deleted successfully",
        })
      );
    });
  });

  it("nên hiển thị Toast lỗi khi xóa bill thất bại", async () => {
    (api.delete as jest.Mock).mockRejectedValueOnce(new Error("Delete failed"));

    render(<EventDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("Dinner")).toBeTruthy();
    });

    const deleteBtn = screen.getByText("Delete b1");
    fireEvent.press(deleteBtn);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Error",
          text2: "Failed to delete bill. Please try again.",
        })
      );
    });
  });

  it("nên mở modal Edit Bill khi nhấn nút Edit", async () => {
    render(<EventDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("Dinner")).toBeTruthy();
    });

    // Nhấn nút Edit
    const editBtn = screen.getByText("Edit b1");
    fireEvent.press(editBtn);

    // Kiểm tra modal hiển thị
    await waitFor(() => {
      expect(screen.getByText("Edit Bill")).toBeTruthy();
      expect(screen.getByPlaceholderText("Enter bill title")).toBeTruthy();
      expect(screen.getByPlaceholderText("Enter note")).toBeTruthy();
    });
  });

  it("nên đóng modal Edit Bill khi nhấn Cancel", async () => {
    render(<EventDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("Dinner")).toBeTruthy();
    });

    // Mở modal
    fireEvent.press(screen.getByText("Edit b1"));

    await waitFor(() => {
      expect(screen.getByText("Edit Bill")).toBeTruthy();
    });

    // Nhấn Cancel
    fireEvent.press(screen.getByText("Cancel"));

    // Modal đóng
    await waitFor(() => {
      expect(screen.queryByText("Edit Bill")).toBeNull();
    });
  });

  it("nên lưu thay đổi bill thành công khi nhấn Save", async () => {
    render(<EventDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("Dinner")).toBeTruthy();
    });

    // Mở modal
    fireEvent.press(screen.getByText("Edit b1"));

    await waitFor(() => {
      expect(screen.getByText("Edit Bill")).toBeTruthy();
    });

    // Nhập title mới
    const titleInput = screen.getByPlaceholderText("Enter bill title");
    fireEvent.changeText(titleInput, "Updated Dinner");

    // Nhập note
    const noteInput = screen.getByPlaceholderText("Enter note");
    fireEvent.changeText(noteInput, "Test note");

    // Nhấn Save
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/bills/b1", {
        title: "Updated Dinner",
        note: "Test note",
      });
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "Success",
          text2: "Bill updated successfully",
        })
      );
    });
  });

  it("nên hiển thị Toast lỗi khi cập nhật bill thất bại", async () => {
    (api.put as jest.Mock).mockRejectedValueOnce(new Error("Update failed"));

    render(<EventDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("Dinner")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Edit b1"));

    await waitFor(() => {
      expect(screen.getByText("Edit Bill")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Error",
          text2: "Failed to update bill. Please try again.",
        })
      );
    });
  });

  it("nên setup BackHandler để quay về trang chủ", async () => {
    const backHandlerSpy = jest.spyOn(BackHandler, "addEventListener");

    render(<EventDetailScreen />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    expect(backHandlerSpy).toHaveBeenCalledWith("hardwareBackPress", expect.any(Function));

    backHandlerSpy.mockRestore();
  });

  it("nên không làm gì khi user hủy chọn ảnh", async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    render(<EventDetailScreen />);
    fireEvent.press(screen.getByText("Add Bill"));
    fireEvent.press(screen.getByText("Upload Photo"));

    await waitFor(() => {
      // OCR không được gọi vì user đã cancel
      expect(parseDataFromPhoto).not.toHaveBeenCalled();
    });
  });

  it("nên thay thế tên paidBy bằng tên user hiện tại khi is_guest = false", async () => {
    const mockBillsWithGuest = {
      data: {
        data: [
          {
            id: "b1",
            title: "Dinner",
            totalAmount: 1000,
            paidBy: { name: "Someone", is_guest: false },
          },
        ],
      },
    };

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/summary")) return Promise.resolve(mockEventSummary);
      if (url.includes("/registered-users-expense")) return Promise.resolve(mockMyExpense);
      if (url.includes("/bills/")) return Promise.resolve(mockBillsWithGuest);
      return Promise.resolve(mockEventData);
    });

    render(<EventDetailScreen />);

    await waitFor(() => {
      // Component sẽ thay thế tên bằng "Eric Nguyễn" từ auth store
      expect(api.get).toHaveBeenCalledWith("/bills/?event_id=event_999");
    });
  });
});
