import { storeData } from "@/utils/asyncStorage";
import { COLOR } from "@/utils/color";
import { useRouter } from "expo-router";
import { Image, TouchableOpacity, View, Text } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const Btn = ({ label, onPress }: { label: string; onPress?: () => void }) =>
    label === "Next" || label === "Done" ? (
      <TouchableOpacity
        onPress={onPress}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 75,
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 999,
          backgroundColor: label === "Next" ? COLOR.dark1 : COLOR.primary3,
          marginRight: 16,
          marginBottom: 0,
        }}
      >
        <Text className="text-light1 font-bold">{label}</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={onPress}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 75,
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 999,
          backgroundColor: COLOR.dark1,
          marginLeft: 16,
          marginBottom: 0,
        }}
      >
        <Text className="text-light1 font-bold">{label}</Text>
      </TouchableOpacity>
    );

  const Dot = ({ selected }: { selected: boolean }) => {
    return (
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 6,
          marginHorizontal: 4,
          backgroundColor: selected ? COLOR.primary3 : COLOR.primary2, // active / inactive color
          opacity: selected ? 1 : 0.5,
          transform: [{ scale: selected ? 1.1 : 1 }],
        }}
      />
    );
  };

  const handleFinish = async () => {
    await storeData("onboarded", "1");
    router.replace("/");
  };

  return (
    <>
      <Onboarding
        onSkip={handleFinish}
        onDone={handleFinish}
        bottomBarHeight={60 + insets.bottom}
        titleStyles={{
          color: COLOR.dark1,
          fontWeight: 700,
        }}
        subTitleStyles={{
          width: 300,
          fontSize: 16,
        }}
        SkipButtonComponent={(props) => (
          <Btn label="Skip" onPress={props.onPress} />
        )}
        NextButtonComponent={(props) => (
          <Btn label="Next" onPress={props.onPress} />
        )}
        DoneButtonComponent={(props) => (
          <Btn label="Done" onPress={props.onPress} />
        )}
        DotComponent={Dot}
        pages={[
          {
            backgroundColor: COLOR.secondary3,
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/Logo.png")}
              />
            ),
            title: "Divvy",
            subtitle: "Chia chuẩn, vui cùng nhau.",
          },
          {
            backgroundColor: COLOR.secondary3,
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/onboard-1.png")}
              />
            ),
            title: "Nhanh, Chuẩn, Không ai thiệt!",
            subtitle:
              "Dù là đi ăn, đi chơi, hay du lịch cùng bạn bè, chỉ cần chụp hoá đơn — mọi chi phí được tự động nhận dạng và chia đều hoặc tuỳ chỉnh linh hoạt.",
          },
          {
            backgroundColor: COLOR.secondary3,
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/onboard-2.png")}
              />
            ),
            title: "Không cần nhập tay — App tự đọc và chia!",
            subtitle:
              "Công nghệ OCR thông minh giúp bạn nhận diện hoá đơn, tổng tiền, từng món và người chi trả chỉ trong vài giây.",
          },
          {
            backgroundColor: COLOR.secondary3,
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/onboard-3.png")}
              />
            ),
            title: "Ai trả bao nhiêu? Ai còn nợ ai?",
            subtitle:
              "Ứng dụng tự động tổng hợp chi tiết các khoản chi, hiển thị rõ ràng. Dễ dàng xuất file Excel hoặc PDF để lưu lại.",
          },
          {
            backgroundColor: COLOR.secondary3,
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/onboard-4.png")}
              />
            ),
            title: "Quét hoá đơn bằng AI",
            subtitle:
              "Công nghệ OCR thông minh giúp bạn nhận diện hoá đơn, tổng tiền, từng món và người chi trả chỉ trong vài giây.",
          },
        ]}
      />
    </>
  );
}
