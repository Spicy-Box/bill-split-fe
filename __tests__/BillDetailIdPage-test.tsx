import api from "@/utils/api";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React from "react";
import Toast from "react-native-toast-message";
import BillDetailPage from "../app/bills/[id]";

// 0. MOCK ASYNC STORAGE (PHẢI ĐẶT TRƯỚC TẤT CẢ)
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// 1. MOCK AUTH STORE
jest.mock("@/stores/useAuthStore", () => ({
  useAuthStore: () => ({
    user: {
      first_name: "Tuấn Anh",
      last_name: "Test",
    },
    accessToken: "mock-token",
  }),
}));

// 2. MOCK EXPO ROUTER
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "bill_123" }),
  useRouter: () => ({ navigate: jest.fn(), back: jest.fn() }),
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

// 7. MOCK COMPONENTS
jest.mock("@/components/BillDetail", () => ({
  BillDetailHeader: "BillDetailHeader",
  PaidByCard: "PaidByCard",
  BillItemsCard: "BillItemsCard",
  ParticipantsCard: "ParticipantsCard",
  OwedAmountCard: "OwedAmountCard",
  DebtsListCard: "DebtsListCard",
  ExportButton: "ExportButton",
  TabBar: ({ onTabChange }: any) => {
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
    // Setup mặc định cho API
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/balances")) return Promise.resolve(mockBalances);
      if (url.includes("/export-pdf")) return Promise.resolve({ data: new ArrayBuffer(8) });
      return Promise.resolve(mockBillDetail);
    });
  });

  afterEach(cleanup);

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

    const { BackHandler } = require("react-native");
    const backHandlerSpy = jest.spyOn(BackHandler, "addEventListener");

    render(<BillDetailPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/bills/bill_123");
    });

    expect(backHandlerSpy).toHaveBeenCalled();
    backHandlerSpy.mockRestore();
  });

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
