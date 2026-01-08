import { Link, RelativePathString } from "expo-router";
import { Text, View } from "react-native";

interface TitleAuthProps {
  title: string;
  desc: string;
  href?: RelativePathString;
  hrefDesc?: string;
}

export default function TitleAuth({
  title,
  desc,
  href,
  hrefDesc,
}: TitleAuthProps) {
  return (
    <View className="gap-[10px] items-center">
      <Text className="text-[28px] font-inter font-bold">{title}</Text>
      <View className="flex-row items-end gap-2">
        <Text className="font-inter text-lg text-center">{desc}</Text>
        {href && (
          <Link className="text-primary3 text-base" href={href}>
            {hrefDesc}
          </Link>
        )}
      </View>
    </View>
  );
}
