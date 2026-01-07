import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import { cleanup, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import BillDetail from "../app/bills/detail";

// 1. FIX ASYNCSTORAGE
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// 2. MOCK AUTH STORE
jest.mock("@/stores/useAuthStore", () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { id: "1", name: "Tuấn Anh" },
      token: "mock-token",
    }),
}));

// 3. MOCK SAFE AREA
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// 4. MOCK TOÀN BỘ COMPONENT CON
// Việc mock này giúp cô lập logic của trang Detail, không bị crash do component con thiếu data
jest.mock("@/components/BillDetail", () => {
  const { Text, View, TouchableOpacity } = require("react-native");
  return {
    BillDetailHeader: ({ title }: any) => (
      <View>
        <Text>{title}</Text>
      </View>
    ),
    PaidByCard: ({ participant }: any) => (
      <View>
        <Text>Paid by {participant?.name}</Text>
      </View>
    ),
    // Ép hiển thị số total để test logic tính toán của trang Detail
    BillItemsCard: ({ total }: any) => (
      <View>
        <Text>Total Amount: {total}</Text>
      </View>
    ),
    ParticipantsCard: ({ participants }: any) => (
      <View>
        {participants.map((p: any) => (
          <Text key={p.id}>{p.name}</Text>
        ))}
      </View>
    ),
    OwedAmountCard: ({ amount }: any) => (
      <View>
        <Text>Owed Amount: {amount}</Text>
      </View>
    ),
    DebtsListCard: ({ debts }: any) => (
      <View>
        {debts.map((d: any, i: number) => (
          <Text key={i}>
            {d.from} owes {d.to}
          </Text>
        ))}
      </View>
    ),
    ExportButton: () => (
      <TouchableOpacity>
        <Text>Export PDF</Text>
      </TouchableOpacity>
    ),
    TabBar: ({ activeTab, onTabChange }: any) => (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={() => onTabChange("overall")}>
          <Text>Overall</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onTabChange("balances")}>
          <Text>Balances</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

describe("BillDetail Screen", () => {
  afterEach(cleanup);

  it("nên hiển thị đúng tab Overall và thông tin tổng tiền 19.0", () => {
    render(<BillDetail />);

    // Kiểm tra Header
    expect(screen.getByText("Grocery")).toBeTruthy();

    // Kiểm tra "Paid by"
    expect(screen.getByText(/Paid by Tuấn Anh/i)).toBeTruthy();

    // Kiểm tra logic tính toán: 9.5 * 2 = 19
    // Trong file BillDetail của bạn: subtotal = price * quantity
    expect(screen.getByText(/Total Amount: 19/)).toBeTruthy();

    // Kiểm tra danh sách người tham gia
    expect(screen.getByText("Khánh Lê")).toBeTruthy();
    expect(screen.getByText("Tú Dương")).toBeTruthy();
  });

  it("nên chuyển sang tab Balances và hiển thị số tiền nợ 6.65", () => {
    render(<BillDetail />);

    // Tìm và nhấn tab Balances
    const balancesTab = screen.getByText("Balances");
    fireEvent.press(balancesTab);

    // Kiểm tra OwedAmountCard hiển thị myAmount (6.65)
    expect(screen.getByText(/Owed Amount: 6.65/)).toBeTruthy();

    // Kiểm tra danh sách nợ (DebtsListCard)
    expect(screen.getByText(/Khánh Lê owes Tuấn Anh/)).toBeTruthy();
    expect(screen.getByText(/Tú Dương owes Tuấn Anh/)).toBeTruthy();
  });

  it("không nên hiển thị các món ăn khi đang ở tab Balances", () => {
    render(<BillDetail />);

    fireEvent.press(screen.getByText("Balances"));

    // "Total Amount" chỉ có ở tab Overall (BillItemsCard)
    expect(screen.queryByText(/Total Amount/)).toBeNull();
  });
});
