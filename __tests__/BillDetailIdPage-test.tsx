import api from "@/utils/api";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React from "react";
import Toast from "react-native-toast-message";
import BillDetailPage from "../app/bills/[id]"; // Điều chỉnh đường dẫn

// 1. MOCK CÁC THƯ VIỆN EXPO & ROUTER
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "bill_123" }),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(true),
}));

// Mock FileSystem bao gồm cả StorageAccessFramework cho Android
jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "mock-dir/",
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn().mockResolvedValue("base64-data"),
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest
      .fn()
      .mockResolvedValue({ granted: true, directoryUri: "mock-uri" }),
    createFileAsync: jest.fn().mockResolvedValue("mock-new-file-uri"),
  },
  EncodingType: { Base64: "base64" },
}));

// 2. MOCK API UTILS
jest.mock("@/utils/api", () => ({
  get: jest.fn(),
}));

// 3. MOCK TOAST
jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

// 4. MOCK COMPONENT CON (Dùng string mock để tránh lỗi Interop NativeWind)
jest.mock("@/components/BillDetail", () => ({
  BillDetailHeader: "BillDetailHeader",
  PaidByCard: "PaidByCard",
  BillItemsCard: "BillItemsCard",
  ParticipantsCard: "ParticipantsCard",
  OwedAmountCard: "OwedAmountCard",
  DebtsListCard: "DebtsListCard",
  ExportButton: ({ onPress, isLoading }: any) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>{isLoading ? "Exporting..." : "Export PDF"}</Text>
      </TouchableOpacity>
    );
  },
  TabBar: ({ activeTab, onTabChange }: any) => {
    const { TouchableOpacity, Text, View } = require("react-native");
    return (
      <View>
        <TouchableOpacity onPress={() => onTabChange("overall")}>
          <Text>Overall</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onTabChange("balances")}>
          <Text>Balances</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

// Dữ liệu giả lập từ API
const mockBillDetail = {
  data: {
    data: {
      id: "bill_123",
      title: "Tiệc Buffet",
      totalAmount: 1000,
      subtotal: 900,
      tax: 100,
      paidBy: { name: "Tuấn Anh", id: "1" },
      items: [{ id: "i1", name: "Thịt bò", price: 500, quantity: 1 }],
      perUserShares: [
        { name: "Tuấn Anh", amount: 500 },
        { name: "Khánh Lê", amount: 500 },
      ],
    },
  },
};

const mockBalances = {
  data: {
    data: {
      balances: [{ debtor: { name: "Khánh Lê" }, creditor: { name: "Tuấn Anh" }, amountOwed: 500 }],
    },
  },
};

describe("BillDetailPage Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mặc định cho API
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/balances")) return Promise.resolve(mockBalances);
      if (url.includes("/export-pdf")) return Promise.resolve({ data: new ArrayBuffer(8) });
      return Promise.resolve(mockBillDetail);
    });
  });

  afterEach(cleanup);

  it("nên hiển thị Loading ban đầu và sau đó hiển thị dữ liệu Overall", async () => {
    render(<BillDetailPage />);

    // Kiểm tra API được gọi đúng ID
    expect(api.get).toHaveBeenCalledWith("/bills/bill_123");

    // Đợi dữ liệu load xong
    await waitFor(() => {
      expect(screen.queryByTestId("activity-indicator")).toBeNull();
    });
  });

  it("nên chuyển đổi giữa tab Overall và Balances", async () => {
    render(<BillDetailPage />);

    // Nhấn sang tab Balances
    const balancesTab = screen.getByText("Balances");
    fireEvent.press(balancesTab);

    // Kiểm tra API balances được gọi
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123/balances");
    });
  });

  it("nên xử lý logic Export PDF thành công trên Android", async () => {
    // Ép môi trường giả lập là Android
    const { Platform } = require("react-native");
    Platform.OS = "android";

    render(<BillDetailPage />);

    await waitFor(() => screen.getByText("Export PDF"));

    const exportBtn = screen.getByText("Export PDF");
    fireEvent.press(exportBtn);

    await waitFor(() => {
      // Kiểm tra xem có yêu cầu quyền truy cập thư mục Android không
      expect(FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync).toHaveBeenCalled();
      // Kiểm tra Toast báo thành công
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "PDF ready",
        })
      );
    });
  });

  it("nên xử lý logic Export PDF thành công trên iOS", async () => {
    // Ép môi trường giả lập là iOS
    const { Platform } = require("react-native");
    Platform.OS = "ios";

    render(<BillDetailPage />);

    await waitFor(() => screen.getByText("Export PDF"));

    const exportBtn = screen.getByText("Export PDF");
    fireEvent.press(exportBtn);

    await waitFor(() => {
      // iOS dùng Sharing.shareAsync thay vì StorageAccessFramework
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });
  it("nên hiển thị lỗi Toast khi thực hiện Export PDF thất bại", async () => {
    // 1. Giả lập API Detail/Balances thành công để nút Export hiện ra
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/export-pdf")) {
        return Promise.reject(new Error("API Export Error")); // Chỉ lỗi khi nhấn Export
      }
      return Promise.resolve(mockBillDetail); // Load trang thành công
    });

    render(<BillDetailPage />);

    // 2. Đợi cho Loading biến mất (isLoadingDetail = false)
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).toBeNull();
    });

    // 3. Tìm và nhấn nút Export
    const exportBtn = screen.getByText("Export PDF");
    fireEvent.press(exportBtn);

    // 4. Kiểm tra Toast báo lỗi (đúng như logic trong catch của handleExport)
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Failed to export PDF",
        })
      );
    });
  });
});
