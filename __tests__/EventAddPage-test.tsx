import api from "@/utils/api";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import Toast from "react-native-toast-message";
import AddEventPage from "../app/events/add"; // Điều chỉnh đường dẫn đến file của bạn

// --- MOCKING ---

// 1. Mock Expo Router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Mock API
jest.mock("@/utils/api", () => ({
  post: jest.fn(),
}));

// 3. Mock Toast
jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

// 4. Mock useAuthStore (Giả lập user đã đăng nhập)
jest.mock("@/stores/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { first_name: "Eric", last_name: "Nguyễn" },
  }),
}));

// 5. Mock các Component con (Dùng string mock để tránh lỗi interop CSS/NativeWind)
// Chúng ta mock các hàm callback để test logic của trang cha
jest.mock("@/components/EventAdd", () => {
  const { View, Text, TextInput, TouchableOpacity } = require("react-native");
  return {
    EventHeader: () => (
      <View>
        <Text>Event Header</Text>
      </View>
    ),
    EventNameAndCurrency: ({ onEventNameChange, errors }: any) => (
      <View>
        <TextInput placeholder="Event Name" onChangeText={onEventNameChange} />
        {errors.eventName && <Text>{errors.eventName}</Text>}
      </View>
    ),
    ParticipantsList: ({
      participants,
      onAddParticipant,
      onRemoveParticipant,
      onUpdateParticipant,
    }: any) => (
      <View>
        <Text>Participants Count: {participants.length}</Text>
        {participants.map((p: any) => (
          <View key={p.id}>
            <TextInput
              placeholder={`Participant ${p.id}`}
              value={p.name}
              onChangeText={(txt: string) => onUpdateParticipant(p.id, txt)}
            />
            {!p.isCurrentUser && (
              <TouchableOpacity onPress={() => onRemoveParticipant(p.id)}>
                <Text>Remove {p.id}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={onAddParticipant}>
          <Text>Add Participant</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

describe("AddEventPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(cleanup);

  it("nên hiển thị tên User hiện tại trong danh sách người tham gia mặc định", () => {
    render(<AddEventPage />);

    // Check xem có hiển thị "Eric Nguyễn" (từ auth mock) không
    expect(screen.getByDisplayValue("Eric Nguyễn")).toBeTruthy();
    // Mặc định ban đầu có 2 người (User + 1 ô trống)
    expect(screen.getByText("Participants Count: 2")).toBeTruthy();
  });

  it("nên báo lỗi nếu nhấn Create mà chưa nhập tên Event", async () => {
    render(<AddEventPage />);

    const createBtn = screen.getByText("Create Event");
    fireEvent.press(createBtn);

    await waitFor(() => {
      expect(screen.getByText("Event name is required")).toBeTruthy();
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it("nên thêm và xóa người tham gia chính xác", () => {
    render(<AddEventPage />);

    // Nhấn thêm người
    const addBtn = screen.getByText("Add Participant");
    fireEvent.press(addBtn);
    expect(screen.getByText("Participants Count: 3")).toBeTruthy();

    // Nhấn xóa người thứ 2
    const removeBtn = screen.getByText("Remove 2");
    fireEvent.press(removeBtn);
    expect(screen.getByText("Participants Count: 2")).toBeTruthy();
  });

  it("không nên cho phép xóa User hiện tại", () => {
    render(<AddEventPage />);

    // Theo logic mock ở trên, nút "Remove" chỉ hiện cho ai không phải isCurrentUser
    // Dòng này sẽ không tìm thấy text "Remove 1"
    expect(screen.queryByText("Remove 1")).toBeNull();
  });

  it("nên gọi API thành công và chuyển hướng về trang chủ", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

    render(<AddEventPage />);

    // 1. Nhập tên Event
    const nameInput = screen.getByPlaceholderText("Event Name");
    fireEvent.changeText(nameInput, "Liên hoan cuối năm");

    // 2. Nhập tên người tham gia thứ 2
    const p2Input = screen.getByPlaceholderText("Participant 2");
    fireEvent.changeText(p2Input, "Khánh Lê");

    // 3. Nhấn Create
    fireEvent.press(screen.getByText("Create Event"));

    await waitFor(() => {
      // Kiểm tra payload gửi lên API
      // Lưu ý: Backend tự động thêm chủ sự kiện dựa trên token,
      // nên participants chỉ chứa những người khác (không có "Eric Nguyễn")
      expect(api.post).toHaveBeenCalledWith(
        "/events/",
        expect.objectContaining({
          name: "Liên hoan cuối năm",
          participants: ["Khánh Lê"], // Chỉ có người tham gia khác, không có current user
        })
      );

      // Kiểm tra Toast thành công
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "Add New Event Successfuly",
        })
      );

      // Kiểm tra điều hướng
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("nên hiển thị Toast lỗi khi API trả về lỗi", async () => {
    // Giả lập lỗi Axios
    const errorResponse = {
      isAxiosError: true,
      message: "Network Error",
      response: { data: { message: "Server busy" } },
    };
    (api.post as jest.Mock).mockRejectedValueOnce(errorResponse);

    render(<AddEventPage />);

    fireEvent.changeText(screen.getByPlaceholderText("Event Name"), "Test Event");
    fireEvent.press(screen.getByText("Create Event"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Unable to create event",
          text2: "Server busy",
        })
      );
    });
  });
});
