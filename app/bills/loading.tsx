import { View, Text } from "react-native";

import Svg, { Circle, Path } from "react-native-svg";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import TOKEN from "@/utils/token";

// Animated spinning circle component
function AnimatedLoadingCircle() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={[{ width: "100%", height: "100%" }, animatedStyle]}>
      <Svg viewBox="0 0 127 127" style={{ width: "100%", height: "100%" }}>
        <Path
          d="M117.634 63.5C122.807 63.5 127.071 59.2843 126.31 54.1676C125.548 49.0391 124.159 44.0115 122.166 39.1996C118.975 31.4954 114.298 24.4952 108.401 18.5987C102.505 12.7022 95.5046 8.02482 87.8004 4.83365C82.9885 2.84051 77.9609 1.45152 72.8324 0.689517C67.7157 -0.0707223 63.5 4.19341 63.5 9.36625C63.5 14.5391 67.7381 18.6344 72.7981 19.7087C75.4719 20.2765 78.0944 21.0892 80.6318 22.1402C86.0632 24.39 90.9984 27.6876 95.1554 31.8446C99.3124 36.0016 102.61 40.9368 104.86 46.3682C105.911 48.9056 106.724 51.5281 107.291 54.2019C108.366 59.2619 112.461 63.5 117.634 63.5Z"
          fill={TOKEN.colors.dark1}
        />
      </Svg>
    </Animated.View>
  );
}

export default function LoadingScreen() {
  return (
    <View
      style={{ backgroundColor: TOKEN.colors.primary1, flex: 1 }}
      className="flex flex-col w-full"
    >
      {/* Loading Content */}
      <View className="flex-1 flex-col items-center justify-center">
        <View
          className="relative"
          style={{ width: 128, height: 128, overflow: "hidden" }}
        >
          {/* Background circle */}
          <Svg
            viewBox="0 0 127 127"
            style={{
              width: 128,
              height: 128,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <Circle
              cx="63.5"
              cy="63.5"
              r="52"
              fill="none"
              stroke={TOKEN.colors.dark1}
              strokeOpacity="0.4"
              strokeWidth="18.7"
            />
          </Svg>

          {/* Animated spinning circle */}
          <View
            style={{
              width: 128,
              height: 128,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <AnimatedLoadingCircle />
          </View>
        </View>

        <Text className="text-dark1 text-3xl font-medium text-center mt-4">
          Loading...
        </Text>
      </View>

    </View>
  );
}
