import { cleanup, render } from "@testing-library/react-native";
import React from "react";
import LoadingScreen from "../app/bills/loading";

// 1. Mock Reanimated - Sử dụng require trực tiếp để tránh hoisting scope
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

// 2. Mock SVG bằng String - Cách này là "tuyệt chiêu" để tránh lỗi _ReactNativeCSSInterop
// Babel sẽ bỏ qua các chuỗi này, không chèn interop code vào nữa.
jest.mock("react-native-svg", () => ({
  __esModule: true,
  default: "Svg",
  Circle: "Circle",
  Path: "Path",
}));

describe("LoadingScreen Component", () => {
  afterEach(cleanup);

  it('nên hiển thị văn bản "Loading..."', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText("Loading...")).toBeTruthy();
  });

  it("nên render đúng cấu trúc mà không bị lỗi interop", () => {
    const tree = render(<LoadingScreen />).toJSON();
    expect(tree).toBeTruthy();
  });

  it("nên khớp với snapshot", () => {
    const tree = render(<LoadingScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
