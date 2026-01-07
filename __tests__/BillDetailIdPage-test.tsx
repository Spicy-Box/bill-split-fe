import api from "@/utils/api";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React from "react";
import { BackHandler, Platform } from "react-native";
import Toast from "react-native-toast-message";
import BillDetailPage from "../app/bills/[id]";

// 0. MOCK ASYNC STORAGE (PHẢI ĐẶT TRƯỚC TẤT CẢ)
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// 1. MOCK AUTH STORE - Đảm bảo user object stable
const mockUser = {
  first_name: "Tuấn Anh",
  last_name: "Test",
};
jest.mock("@/stores/useAuthStore", () => ({
  useAuthStore: () => ({
    user: mockUser,
    accessToken: "mock-token",
  }),
}));

// 2. MOCK EXPO ROUTER
const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "bill_123" }),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn() }),
}));

// 3. MOCK EXPO SHARING
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(true),
}));

// 4. MOCK FILE SYSTEM
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

// 5. MOCK API
jest.mock("@/utils/api", () => ({
  get: jest.fn(),
}));

// 6. MOCK TOAST
jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

// 7. MOCK COMPONENTS - ExportButton được mock là component có thể tương tác
jest.mock("@/components/BillDetail", () => {
  const React = require("react");
  const { TouchableOpacity, Text, View } = require("react-native");
  return {
    BillDetailHeader: ({ title, eventId }: any) => (
      <View testID="BillDetailHeader">
        <Text>{title}</Text>
      </View>
    ),
    PaidByCard: "PaidByCard",
    BillItemsCard: "BillItemsCard",
    ParticipantsCard: "ParticipantsCard",
    OwedAmountCard: "OwedAmountCard",
    DebtsListCard: "DebtsListCard",
    // ExportButton mock với onPress callback
    ExportButton: ({ onPress, isLoading }: any) => (
      <TouchableOpacity onPress={onPress} testID="ExportButton">
        <Text>{isLoading ? "Exporting..." : "Export PDF"}</Text>
      </TouchableOpacity>
    ),
    // TabBar mock với onTabChange callback
    TabBar: ({ onTabChange }: any) => (
      <View testID="TabBar">
        <TouchableOpacity onPress={() => onTabChange("overall")} testID="OverallTab">
          <Text>Overall</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onTabChange("balances")} testID="BalancesTab">
          <Text>Balances</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

// Dữ liệu giả lập từ API
const mockBillDetail = {
  data: {
    data: {
      id: "bill_123",
      title: "Tiệc Buffet",
      totalAmount: 1000,
      subtotal: 900,
      tax: 100,
      paidBy: { name: "Tuấn Anh", id: "1", is_guest: false },
      items: [{ id: "i1", name: "Thịt bò", price: 500, quantity: 1 }],
      perUserShares: [
        { name: "Tuấn Anh", amount: 500, is_guest: false },
        { name: "Khánh Lê", amount: 500, is_guest: true },
      ],
    },
  },
};

const mockBalances = {
  data: {
    data: {
      balances: [
        {
          debtor: { name: "Khánh Lê", is_guest: true },
          creditor: { name: "Tuấn Anh", is_guest: false },
          amountOwed: 500,
        },
      ],
    },
  },
};

describe("BillDetailPage Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform về default (android)
    (Platform as any).OS = "android";
    // Setup mặc định cho API - resolve ngay lập tức
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/balances")) return Promise.resolve(mockBalances);
      if (url.includes("/export-pdf")) return Promise.resolve({ data: new ArrayBuffer(8) });
      return Promise.resolve(mockBillDetail);
    });
  });

  afterEach(cleanup);

  // ============ BASIC API TESTS ============

  it("nên gọi API để load bill detail khi component mount", async () => {
    render(<BillDetailPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123");
    });
  });

  it("nên gọi API để load balances khi component mount", async () => {
    render(<BillDetailPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123/balances");
    });
  });

  // ============ TAB SWITCHING TESTS ============

  it("nên chuyển đổi giữa tab Overall và Balances", async () => {
    render(<BillDetailPage />);

    // Đợi component load xong
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123");
    });

    // Nhấn sang tab Balances
    const balancesTab = screen.getByText("Balances");
    fireEvent.press(balancesTab);

    // Kiểm tra API balances được gọi
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123/balances");
    });
  });

  // ============ DATA PROCESSING TESTS ============

  it("nên xử lý khi API bill detail trả về dữ liệu với splitBetween", async () => {
    const mockBillWithSplitBetween = {
      data: {
        data: {
          ...mockBillDetail.data.data,
          items: [
            {
              id: "i1",
              name: "Thịt bò",
              price: 500,
              quantity: 1,
              splitBetween: [
                { name: "User", is_guest: false },
                { name: "Guest", is_guest: true },
              ],
            },
          ],
        },
      },
    };

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/balances")) return Promise.resolve(mockBalances);
      return Promise.resolve(mockBillWithSplitBetween);
    });

    render(<BillDetailPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123");
    });
  });

  it("nên xử lý khi API balances trả về dữ liệu với non-guest debtor", async () => {
    const mockBalancesWithNonGuest = {
      data: {
        data: {
          balances: [
            {
              debtor: { name: "User", is_guest: false },
              creditor: { name: "Tuấn Anh", is_guest: false },
              amountOwed: 500,
            },
          ],
        },
      },
    };

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/balances")) return Promise.resolve(mockBalancesWithNonGuest);
      return Promise.resolve(mockBillDetail);
    });

    render(<BillDetailPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123/balances");
    });
  });

  // ============ EXPORT PDF TESTS ============

  it("nên hiển thị ExportButton sau khi loading hoàn tất", async () => {
    render(<BillDetailPage />);

    // Đợi ExportButton xuất hiện (loading hoàn tất)
    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    expect(exportBtn).toBeTruthy();
    expect(screen.getByText("Export PDF")).toBeTruthy();
  });

  it("nên gọi API export-pdf khi nhấn ExportButton", async () => {
    render(<BillDetailPage />);

    // Đợi ExportButton xuất hiện
    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123/export-pdf", {
        responseType: "arraybuffer",
      });
    });
  });

  it("nên gọi FileSystem.writeAsStringAsync khi export PDF", async () => {
    render(<BillDetailPage />);

    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
    });
  });

  it("nên gọi Sharing.shareAsync trên iOS", async () => {
    // Mock Platform là iOS trước khi render
    (Platform as any).OS = "ios";

    render(<BillDetailPage />);

    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

  it("nên gọi StorageAccessFramework trên Android", async () => {
    // Đảm bảo Platform là Android
    (Platform as any).OS = "android";

    render(<BillDetailPage />);

    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync).toHaveBeenCalled();
    });
  });

  it("nên hiển thị Toast success khi export thành công trên Android", async () => {
    (Platform as any).OS = "android";

    render(<BillDetailPage />);

    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "PDF ready",
        })
      );
    });
  });

  it("nên hiển thị Toast error khi Android permission denied", async () => {
    (Platform as any).OS = "android";

    (
      FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock
    ).mockResolvedValueOnce({
      granted: false,
      directoryUri: null,
    });

    render(<BillDetailPage />);

    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Permission to access storage was denied",
        })
      );
    });
  });

  it("nên hiển thị Toast error khi Sharing không available", async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

    render(<BillDetailPage />);

    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Sharing not available",
        })
      );
    });
  });

  it("nên hiển thị Toast error khi export PDF thất bại", async () => {
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/export-pdf")) {
        return Promise.reject(new Error("Export failed"));
      }
      if (url.includes("/balances")) return Promise.resolve(mockBalances);
      return Promise.resolve(mockBillDetail);
    });

    render(<BillDetailPage />);

    const exportBtn = await screen.findByTestId("ExportButton", {}, { timeout: 5000 });
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Failed to export PDF",
        })
      );
    });
  });

  // ============ BACK HANDLER TESTS ============

  it("nên setup BackHandler khi bill có eventId", async () => {
    const mockBillWithEventId = {
      data: {
        data: {
          ...mockBillDetail.data.data,
          eventId: "event_456",
        },
      },
    };

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/balances")) return Promise.resolve(mockBalances);
      return Promise.resolve(mockBillWithEventId);
    });

    const backHandlerSpy = jest.spyOn(BackHandler, "addEventListener");

    render(<BillDetailPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123");
    });

    expect(backHandlerSpy).toHaveBeenCalledWith("hardwareBackPress", expect.any(Function));
    backHandlerSpy.mockRestore();
  });

  it("nên navigate về event page khi back với eventId", async () => {
    const mockBillWithEventId = {
      data: {
        data: {
          ...mockBillDetail.data.data,
          eventId: "event_456",
        },
      },
    };

    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/balances")) return Promise.resolve(mockBalances);
      return Promise.resolve(mockBillWithEventId);
    });

    let backCallback: (() => boolean) | null = null;
    jest.spyOn(BackHandler, "addEventListener").mockImplementation((event, callback) => {
      if (event === "hardwareBackPress") {
        backCallback = callback as () => boolean;
      }
      return { remove: jest.fn() };
    });

    render(<BillDetailPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123");
    });

    // Đợi billDetail được set
    await waitFor(
      () => {
        expect(backCallback).not.toBeNull();
      },
      { timeout: 3000 }
    );

    // Simulate hardware back press
    expect(backCallback).not.toBeNull();
    if (backCallback) {
      const result = (backCallback as () => boolean)();
      expect(result).toBe(true);
      // Verify navigate was called
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/events/event_456");
      });
    }
  });

  // ============ MOCK VERIFICATION TESTS ============

  it("nên verify FileSystem mock được setup đúng", () => {
    expect(FileSystem.documentDirectory).toBe("mock-dir/");
    expect(FileSystem.StorageAccessFramework).toBeDefined();
    expect(FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync).toBeDefined();
    expect(FileSystem.StorageAccessFramework.createFileAsync).toBeDefined();
  });

  it("nên verify Sharing mock được setup đúng", () => {
    expect(Sharing.isAvailableAsync).toBeDefined();
    expect(Sharing.shareAsync).toBeDefined();
  });

  it("nên verify Toast mock được setup đúng", () => {
    expect(Toast.show).toBeDefined();
  });
});
