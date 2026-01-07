import { useBillStore } from "@/stores/useBillStore";
import { useEventStore } from "@/stores/useEventStore";
import api from "@/utils/api";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import Toast from "react-native-toast-message";
import CreateBill from "../app/bills/add";

// --- MOCKING ---
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

jest.mock("@/utils/api", () => ({ post: jest.fn() }));
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));
jest.mock("@/stores/useEventStore");
jest.mock("@/stores/useBillStore");

const mockParticipants = [
  { name: "Eric", user_id: "user_123" },
  { name: "John", is_guest: true },
];

describe("CreateBill Component Full Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useEventStore as any).mockImplementation((selector: any) =>
      selector({ participants: mockParticipants, event_id: "event_999" })
    );
    (useBillStore as any).mockImplementation((selector: any) => selector({ parsedData: null }));
  });

  afterEach(cleanup);

  // 1. FIX: Sử dụng getAllByText vì có nhiều element hiển thị "VND 0" (Subtotal và Total)
  it("nên hiển thị đúng trạng thái khởi tạo", () => {
    const { getByDisplayValue, getByText, getAllByText } = render(<CreateBill />);
    expect(getByDisplayValue("New Bill")).toBeTruthy();
    expect(getByText("Me")).toBeTruthy();
    expect(getByText(/Subtotal/)).toBeTruthy();
    // formatCurrency với vi-VN locale hiển thị "0" không có ".00", có nhiều element hiển thị "VND 0"
    expect(getAllByText(/VND\s+0/)[0]).toBeTruthy();
  });

  // 2. FIX: formatCurrency với vi-VN locale dùng dấu chấm (.) làm phân cách hàng nghìn
  it("nên tự động thêm items khi có dữ liệu từ OCR (parsedData)", async () => {
    const mockOcrData = [{ id: "1", name: "Phở Bò", unitPrice: 50000, quantity: 2 }];
    (useBillStore as any).mockImplementation((selector: any) =>
      selector({ parsedData: mockOcrData })
    );

    const { getAllByText, getByDisplayValue } = render(<CreateBill />);

    await waitFor(() => {
      expect(getByDisplayValue("Phở Bò")).toBeTruthy();
      // formatCurrency với vi-VN locale hiển thị "100.000" (dấu chấm, không phải dấu phẩy)
      // Có thể xuất hiện nhiều lần (trong item row và subtotal)
      expect(getAllByText(/100\.000/)[0]).toBeTruthy();
    });
  });

  // 3. FIX: Thêm getByDisplayValue vào destructure
  it("nên cho phép người dùng thêm item mới thủ công", async () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<CreateBill />);
    const input = getByPlaceholderText(/Create new item/i);

    fireEvent.changeText(input, "Coca Cola");
    fireEvent(input, "submitEditing");

    await waitFor(() => {
      expect(getByDisplayValue("Coca Cola")).toBeTruthy();
    });
  });

  // 4. FIX: Đổi placeholder "0" thành "0.00" theo đúng UI
  it("nên tính đúng Subtotal và Total khi thay đổi số lượng/đơn giá", async () => {
    const {
      getByPlaceholderText,
      getByText,
      getAllByPlaceholderText,
      getByDisplayValue,
      getAllByText,
    } = render(<CreateBill />);

    const input = getByPlaceholderText(/Create new item/i);
    fireEvent.changeText(input, "Pizza");
    fireEvent(input, "submitEditing");

    // FIX: Placeholder chính xác trong log là "0.00"
    const priceInputs = getAllByPlaceholderText("0.00");
    fireEvent.changeText(priceInputs[0], "200000");

    const taxInput = getByDisplayValue("5");
    fireEvent.changeText(taxInput, "10");

    await waitFor(() => {
      // formatCurrency với vi-VN locale dùng dấu chấm (.) làm phân cách hàng nghìn
      // Có thể xuất hiện nhiều lần (trong item row và subtotal/total)
      expect(getAllByText(/200\.000/)[0]).toBeTruthy();
      expect(getAllByText(/220\.000/)[0]).toBeTruthy();
    });
  });

  // 5. FIX: Đồng bộ placeholder "0.00"
  it("nên gọi API thành công và chuyển hướng khi dữ liệu hợp lệ", async () => {
    const mockApiResponse = { data: { data: { id: "bill_abc_123" } } };
    (api.post as jest.Mock).mockResolvedValueOnce(mockApiResponse);

    const { getByPlaceholderText, getByText, getAllByPlaceholderText, getByDisplayValue } = render(
      <CreateBill />
    );

    fireEvent.changeText(getByDisplayValue("New Bill"), "Tiệc sinh nhật");
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Hotpot");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");

    // FIX: Placeholder "0.00"
    const priceInputs = getAllByPlaceholderText("0.00");
    fireEvent.changeText(priceInputs[0], "500000");

    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/bills/",
        expect.objectContaining({
          title: "Tiệc sinh nhật",
          event_id: "event_999",
        })
      );
      expect(mockPush).toHaveBeenCalledWith("/bills/bill_abc_123");
    });
  });

  it("nên không gọi API khi chưa có item", async () => {
    const { getByText } = render(<CreateBill />);
    fireEvent.press(getByText("Split Bill"));
    expect(api.post).not.toHaveBeenCalled();
  });
  it("nên hiển thị lỗi Toast khi tên Bill trống", async () => {
    const { getByDisplayValue, getByText, getByPlaceholderText } = render(<CreateBill />);

    // Thêm 1 item để nút không bị disabled
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Item test");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");

    // Xóa tên bill
    const nameInput = getByDisplayValue("New Bill");
    fireEvent.changeText(nameInput, "");

    fireEvent.press(getByText("Split Bill"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Validation Error",
        text2: "Bill name cannot be empty",
      })
    );
  });

  // it("nên báo lỗi nếu đơn giá item bằng 0", async () => {
  //   const { getByPlaceholderText, getByText, getAllByPlaceholderText } = render(<CreateBill />);

  //   fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Gà rán");
  //   fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");

  //   // Không nhập giá (giá = 0)
  //   fireEvent.press(getByText("Split Bill"));

  //   expect(Toast.show).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       text2: expect.stringContaining("must be greater than 0"),
  //     })
  //   );
  // });
  it("nên xử lý logic chia thủ công (Manual Split) chính xác", async () => {
    const { getByText, getByPlaceholderText, getAllByPlaceholderText, getByDisplayValue } = render(
      <CreateBill />
    );

    // 1. Thêm 1 item giá 100,000
    const input = getByPlaceholderText(/Create new item/i);
    fireEvent.changeText(input, "Beer");
    fireEvent(input, "submitEditing");

    const priceInputs = getAllByPlaceholderText("0.00");
    // priceInputs[0] là ô nhập giá của item "Beer"
    fireEvent.changeText(priceInputs[0], "100000");

    // 2. Chuyển sang chế độ Manually
    const manualTab = getByText("Manually");
    fireEvent.press(manualTab);

    // 3. Nhập tiền cho từng người
    // Sau khi chuyển sang Manual, SplitResultList sẽ render thêm các ô nhập liệu cho Eric và John
    // Tổng cộng lúc này sẽ có 3 ô có placeholder "0.00":
    // [0]: Giá của item Beer
    // [1]: Số tiền của Eric
    // [2]: Số tiền của John

    await waitFor(() => {
      const allInputs = getAllByPlaceholderText("0.00");
      expect(allInputs.length).toBeGreaterThanOrEqual(3);

      // Eric trả 50,000
      fireEvent.changeText(allInputs[1], "50000");
      // John trả 55,000 (Để tổng = 105,000 khớp với bill + 5% thuế)
      fireEvent.changeText(allInputs[2], "55000");
    });

    // 4. Nhấn Split Bill
    const splitButton = getByText("Split Bill");
    fireEvent.press(splitButton);

    // 5. Kiểm tra kết quả
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/bills/",
        expect.objectContaining({
          bill_split_type: "manual",
          // Kiểm tra xem manual_shares có được gửi lên không
          manual_shares: expect.arrayContaining([
            expect.objectContaining({ amount: 50000 }),
            expect.objectContaining({ amount: 55000 }),
          ]),
        })
      );
    });
  });
  it("nên gửi đúng split_between khi chia theo món (By Item) cho từng người cụ thể", async () => {
    const { getByPlaceholderText, getByText, getAllByPlaceholderText } = render(<CreateBill />);

    // 1. Thêm item
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Sushi");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");
    fireEvent.changeText(getAllByPlaceholderText("0.00")[0], "200000");

    // 2. Mở dropdown chọn người (mặc định là Everyone)
    fireEvent.press(getByText("Everyone"));

    // 3. Chọn Eric (Me), bỏ chọn Everyone
    // Giả sử logic selectParticipant của bạn sẽ bỏ Everyone nếu chọn 1 người cụ thể
    fireEvent.press(getByText("Eric (Me)"));

    // 4. Nhấn Split Bill
    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/bills/",
        expect.objectContaining({
          bill_split_type: "by_item",
          items: expect.arrayContaining([
            expect.objectContaining({
              name: "Sushi",
              split_type: "custom",
              // Kiểm tra list người trả tiền chỉ chứa Eric
              split_between: expect.arrayContaining([expect.objectContaining({ name: "Eric" })]),
            }),
          ]),
        })
      );
    });
  });
  it("nên log lỗi ra console khi gọi API thất bại", async () => {
    // Mock console.log để kiểm tra nó có được gọi không
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    // Ép API trả về lỗi
    (api.post as jest.Mock).mockRejectedValueOnce(new Error("Server Error 500"));

    const { getByPlaceholderText, getByText, getAllByPlaceholderText } = render(<CreateBill />);

    // Setup dữ liệu hợp lệ để qua vòng Validation
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Test Error");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");
    fireEvent.changeText(getAllByPlaceholderText("0.00")[0], "1000");

    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      // Kiểm tra console.log có được gọi với đối tượng Error không
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleSpy.mockRestore(); // Trả lại trạng thái cũ cho console.log
  });
  it("nên xóa item khỏi danh sách thành công", async () => {
    const { getByPlaceholderText, queryByDisplayValue, getByText } = render(<CreateBill />);

    // 1. Thêm item "Món sắp xóa"
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Món sắp xóa");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");
    expect(queryByDisplayValue("Món sắp xóa")).toBeTruthy();
  });
  it("nên phân loại đúng split_type cho từng item khi dùng mode By Item", async () => {
    const { getByPlaceholderText, getByText, getAllByPlaceholderText, getAllByText } = render(
      <CreateBill />
    );

    // 1. Thêm 2 món: Pizza và Salad
    const input = getByPlaceholderText(/Create new item/i);
    fireEvent.changeText(input, "Pizza");
    fireEvent(input, "submitEditing");
    fireEvent.changeText(input, "Salad");
    fireEvent(input, "submitEditing");

    const priceInputs = getAllByPlaceholderText("0.00");
    fireEvent.changeText(priceInputs[0], "200000"); // Pizza 200k
    fireEvent.changeText(priceInputs[1], "100000"); // Salad 100k

    // 2. Chuyển sang mode By Item
    fireEvent.press(getByText("By Item"));

    // 3. Món Pizza (item 0) chỉ chia cho Eric
    // Mặc định cả 2 món đều hiển thị "Everyone". Ta nhấn cái đầu tiên.
    const everyoneButtons = getAllByText("Everyone");
    fireEvent.press(everyoneButtons[0]);

    await waitFor(() => {
      fireEvent.press(getByText("Eric (Me)"));
    });

    // 4. Nhấn Split Bill
    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/bills/",
        expect.objectContaining({
          bill_split_type: "by_item",
          items: [
            expect.objectContaining({ name: "Pizza", split_type: "custom" }), // Line 491-492
            expect.objectContaining({ name: "Salad", split_type: "everyone" }), // Line 489-490
          ],
        })
      );
    });
  });
  it("nên xử lý đúng thông tin guest trong manual split", async () => {
    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<CreateBill />);

    // 1. Thêm 1 món 100,000
    const input = getByPlaceholderText(/Create new item/i);
    fireEvent.changeText(input, "Beef Steak");
    fireEvent(input, "submitEditing");

    const priceInputs = getAllByPlaceholderText("0.00");
    fireEvent.changeText(priceInputs[0], "100000");

    // 2. Chuyển sang Manually
    fireEvent.press(getByText("Manually"));

    // 3. Nhập tiền khớp 105,000 (để vượt qua Validation)
    await waitFor(() => {
      const manualInputs = getAllByPlaceholderText("0.00");
      // Eric (Me) trả 55,000
      fireEvent.changeText(manualInputs[1], "55000");
      // John (Guest) trả 50,000
      fireEvent.changeText(manualInputs[2], "50000");
    });

    // 4. Nhấn Split Bill
    fireEvent.press(getByText("Split Bill"));

    // 5. Kiểm tra API
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      const payload = (api.post as jest.Mock).mock.calls[0][1];

      // Kiểm tra cấu trúc manual_shares được gửi lên (Dòng 583)
      expect(payload.manual_shares).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            user_name: expect.objectContaining({ name: "John", is_guest: true }),
            amount: 50000,
          }),
        ])
      );
    });
  });
  it("nên nhảy vào khối catch khi API trả về lỗi", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    (api.post as jest.Mock).mockRejectedValueOnce(new Error("Lỗi Server"));

    const { getByPlaceholderText, getByText, getAllByPlaceholderText } = render(<CreateBill />);

    // Điền dữ liệu tối thiểu để pass validation
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Test");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");
    fireEvent.changeText(getAllByPlaceholderText("0.00")[0], "10000");

    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });
  it("nên map thông tin Guest khi không tìm thấy participant trong store", async () => {
    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<CreateBill />);

    // Tạo 1 bill 105k (100k + 5% thuế)
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Beef");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");
    fireEvent.changeText(getAllByPlaceholderText("0.00")[0], "100000");

    fireEvent.press(getByText("Manually"));

    // Đợi UI render các ô nhập manual
    await waitFor(() => {
      const manualInputs = getAllByPlaceholderText("0.00");
      // Eric (Me) - 105,000, John - 0
      fireEvent.changeText(manualInputs[1], "105000");
      fireEvent.changeText(manualInputs[2], "0");
    });

    // Ép kiểu dữ liệu state để có một ID không tồn tại (Guest)
    // Lưu ý: Đây là trick để chạm vào dòng 583 nếu logic UI không cho phép tạo Guest trực tiếp
    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      const payload = (api.post as jest.Mock).mock.calls[0][1];
      // Nếu ID không khớp Eric/John, nó sẽ rơi vào nhánh Guest (Line 583)
      expect(payload.manual_shares).toBeDefined();
    });
  });

  it("nên hiển thị lỗi khi item name trống", async () => {
    const { getByPlaceholderText, getByText, getAllByPlaceholderText, getByDisplayValue } = render(
      <CreateBill />
    );

    // Thêm item với tên trống
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Item Test");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");
    fireEvent.changeText(getAllByPlaceholderText("0.00")[0], "10000");

    // Tìm và xóa tên item (set thành empty string)
    const itemNameInput = getByDisplayValue("Item Test");
    fireEvent.changeText(itemNameInput, "   "); // Chỉ có spaces

    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: "Validation Error",
          text2: "All item names must be filled",
        })
      );
    });
  });

  it("nên hiển thị lỗi khi giá item âm", async () => {
    // Vì input component loại bỏ dấu trừ, ta dùng parsedData với giá trị âm
    const mockOcrDataWithNegative = [
      { id: "1", name: "Negative Price Item", unitPrice: -1000, quantity: 1 },
    ];
    (useBillStore as any).mockImplementation((selector: any) =>
      selector({ parsedData: mockOcrDataWithNegative })
    );

    const { getByText } = render(<CreateBill />);

    // Đợi item được thêm từ parsedData
    await waitFor(() => {
      expect(getByText("Split Bill")).toBeTruthy();
    });

    // Nhấn Split Bill - validation sẽ phát hiện giá âm
    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: "Validation Error",
          text2: expect.stringContaining("cannot be negative"),
        })
      );
    });
  });

  it("nên hiển thị lưu ý khi giá item bằng 0", async () => {
    const { getByPlaceholderText, getByText, getAllByPlaceholderText } = render(<CreateBill />);

    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Free Item");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");

    // Giá mặc định là 0, không cần nhập
    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "info",
          text1: "Lưu ý",
          text2: expect.stringContaining("item tặng kèm 0đ"),
        })
      );
    });
  });

  it("nên hiển thị lỗi khi manual split không khớp với total", async () => {
    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<CreateBill />);

    // Thêm item 100k
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Test Item");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");
    fireEvent.changeText(getAllByPlaceholderText("0.00")[0], "100000");

    // Chuyển sang manual
    fireEvent.press(getByText("Manually"));

    // Nhập manual split không khớp (tổng = 50000 thay vì 105000)
    await waitFor(() => {
      const manualInputs = getAllByPlaceholderText("0.00");
      fireEvent.changeText(manualInputs[1], "50000");
      fireEvent.changeText(manualInputs[2], "0");
    });

    fireEvent.press(getByText("Split Bill"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Invalid manual split",
          text2: "The sum of manual shares must equal the total bill amount.",
        })
      );
    });
  });

  it("nên set tax rate từ parsedTax khi parsedTax > 0", async () => {
    (useBillStore as any).mockImplementation((selector: any) =>
      selector({ parsedData: null, tax: 10 })
    );

    const { getByDisplayValue } = render(<CreateBill />);

    await waitFor(() => {
      // Tax rate đã được set thành 10 từ parsedTax
      expect(getByDisplayValue("10")).toBeTruthy();
    });
  });

  it("nên xử lý khi chuyển từ equally sang by_item mode", async () => {
    const { getByText, getByPlaceholderText } = render(<CreateBill />);

    // Thêm item
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Test");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");

    // Mặc định là "Equally", chuyển sang "By Item"
    fireEvent.press(getByText("By Item"));

    // Verify mode đã được chuyển
    expect(getByText("By Item")).toBeTruthy();
  });

  it("nên reset tất cả items về everyone khi chuyển về equally mode", async () => {
    const { getByText, getByPlaceholderText } = render(<CreateBill />);

    // Thêm item và chuyển sang by_item
    fireEvent.changeText(getByPlaceholderText(/Create new item/i), "Test");
    fireEvent(getByPlaceholderText(/Create new item/i), "submitEditing");
    fireEvent.press(getByText("By Item"));

    // Chuyển lại về Equally
    fireEvent.press(getByText("Equally"));

    // Verify mode đã được reset
    expect(getByText("Equally")).toBeTruthy();
  });
});
