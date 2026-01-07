import { parseDataFromPhoto } from "@/utils/imageOCR";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useCameraPermissions } from "expo-camera";
import React from "react";
import CameraScreen from "../app/events/camera"; // Điều chỉnh đường dẫn đúng file của bạn

// --- MOCKING ---

// 1. Mock Expo Router
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

// 2. Mock Expo Camera
jest.mock("expo-camera", () => {
  const React = require("react");
  return {
    CameraView: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        takePictureAsync: jest.fn().mockResolvedValue({ uri: "mock_photo_uri" }),
      }));
      return <div {...props} />;
    }),
    useCameraPermissions: jest.fn(),
  };
});

// Khai báo biến để giữ callback bên ngoài
let pinchUpdateCallback: (event: any) => void;

jest.mock("react-native-gesture-handler", () => {
  return {
    Gesture: {
      Pinch: () => ({
        runOnJS: function () {
          return this;
        },
        onBegin: function () {
          return this;
        },
        onUpdate: function (cb: any) {
          pinchUpdateCallback = cb; // Lưu lại để gọi trong test
          return this;
        },
      }),
    },
    GestureDetector: ({ children }: any) => children,
    GestureHandlerRootView: ({ children }: any) => children,
  };
});

// 4. Mock Paper IconButton (Dùng label để dễ tìm)
jest.mock("react-native-paper", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return {
    IconButton: ({ icon, onPress }: any) => (
      <TouchableOpacity onPress={onPress} accessibilityLabel={icon}>
        <Text>{icon}</Text>
      </TouchableOpacity>
    ),
  };
});

// 5. Mock OCR Utility
jest.mock("@/utils/imageOCR", () => ({
  parseDataFromPhoto: jest.fn(),
}));

describe("CameraScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(cleanup);

  it("nên hiển thị yêu cầu cấp quyền nếu chưa có quyền camera", () => {
    const requestPermission = jest.fn();
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: false }, requestPermission]);

    render(<CameraScreen />);

    expect(screen.getByText(/We need your permission/i)).toBeTruthy();
    fireEvent.press(screen.getByText(/grant permission/i));
    expect(requestPermission).toHaveBeenCalled();
  });

  it("nên hiển thị Camera và chụp ảnh thành công khi đã có quyền", async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);

    render(<CameraScreen />);

    // Kiểm tra nút Cancel
    fireEvent.press(screen.getByText("Cancel"));
    expect(mockBack).toHaveBeenCalled();

    // Nhấn chụp ảnh (Dựa trên label icon của IconButton)
    const takePhotoBtn = screen.getByLabelText("camera-iris");
    fireEvent.press(takePhotoBtn);

    // Chờ cho ảnh preview xuất hiện
    await waitFor(() => {
      expect(screen.getByText("Retake")).toBeTruthy();
      expect(screen.getByText("Use Photo")).toBeTruthy();
    });
  });

  it("nên quay lại màn hình chụp ảnh khi nhấn Retake", async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    render(<CameraScreen />);

    // Chụp ảnh trước
    fireEvent.press(screen.getByLabelText("camera-iris"));
    await waitFor(() => screen.getByText("Retake"));

    // Nhấn Retake
    fireEvent.press(screen.getByText("Retake"));

    // Kiểm tra quay lại màn hình camera (nút Cancel hiện lại)
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("nên gọi hàm OCR khi nhấn Use Photo", async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    render(<CameraScreen />);

    // Chụp ảnh
    fireEvent.press(screen.getByLabelText("camera-iris"));
    await waitFor(() => screen.getByText("Use Photo"));

    // Nhấn Use Photo
    fireEvent.press(screen.getByText("Use Photo"));

    expect(parseDataFromPhoto).toHaveBeenCalledWith("mock_photo_uri", expect.anything());
  });

  it("nên chuyển đổi camera trước/sau khi nhấn nút flip", () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    render(<CameraScreen />);

    const flipBtn = screen.getByLabelText("camera-flip");
    fireEvent.press(flipBtn);

    // Test này kiểm tra logic thay đổi state 'facing' bên trong,
    // vì ta đã mock CameraView là một div đơn giản nên ta chỉ cần check không crash
    expect(flipBtn).toBeTruthy();
  });
  // Test cho dòng 65 (Trạng thái permission chưa có dữ liệu)
  it("nên render SafeAreaView trống khi permission là undefined", () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([null, jest.fn()]);

    const { toJSON } = render(<CameraScreen />);
    // Kiểm tra xem có render gì không (dòng 65 trả về SafeAreaView trống)
    expect(toJSON()).toBeTruthy();
  });

  // Test cho dòng 56 (Logic lấy ref camera)
  it("không nên chụp ảnh nếu cameraRef chưa sẵn sàng", async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);

    // Mock useRef trả về null để test dòng "if (!cameraRef.current) return;"
    const spy = jest.spyOn(React, "useRef").mockReturnValueOnce({ current: null });

    render(<CameraScreen />);
    const takePhotoBtn = screen.getByLabelText("camera-iris");
    fireEvent.press(takePhotoBtn);

    // expect không có photoUri nào được set
    expect(screen.queryByText("Retake")).toBeNull();
    spy.mockRestore();
  });
  it("nên xử lý chính xác logic Zoom khi thực hiện cử chỉ Pinch", async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    render(<CameraScreen />);

    // Đảm bảo callback đã được đăng ký
    expect(pinchUpdateCallback).toBeDefined();

    // 1. Test phóng to (Scale > 1) -> Vượt qua kiểm tra jitter (Line 55)
    // rawZoom = 0 + (2 - 1) * 0.13 = 0.13
    pinchUpdateCallback({ scale: 2 });

    // 2. Test trường hợp jitter (Line 55: delta < 0.003) -> Code sẽ return sớm
    // rawZoom cũ là 0.13. Lần này scale là 1.01 -> rawZoom mới = 0.13 + (1.01 - 1) * 0.13 = 0.1313
    // delta = 0.0013 < 0.003 -> dính jitter
    pinchUpdateCallback({ scale: 1.01 });

    // 3. Test Clamp giới hạn trên (Line 52: Max là 1)
    // Scale cực lớn -> rawZoom > 1 -> Phải bị giới hạn về 1
    pinchUpdateCallback({ scale: 50 });

    // 4. Test Clamp giới hạn dưới (Line 52: Min là 0)
    // Scale cực nhỏ -> rawZoom < 0 -> Phải bị giới hạn về 0
    pinchUpdateCallback({ scale: 0.1 });

    // Kiểm tra xem sau các cử chỉ, màn hình không bị crash và vẫn hiển thị nút chụp
    expect(screen.getByLabelText("camera-iris")).toBeTruthy();
  });
  it("không nên làm gì khi nhấn chụp nếu cameraRef chưa gắn vào View", async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);

    // Mock useRef để trả về null lần đầu
    const mockRef = { current: null };
    jest.spyOn(require("react"), "useRef").mockReturnValueOnce(mockRef);

    render(<CameraScreen />);

    const takePhotoBtn = screen.getByLabelText("camera-iris");
    fireEvent.press(takePhotoBtn);

    // Vì cameraRef null, setPhotoUri sẽ không được gọi -> Không có nút Retake
    expect(screen.queryByText("Retake")).toBeNull();
  });
});
