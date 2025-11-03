import AddCirle from "../../assets/icons/add_circle.svg";
import Home from "../../assets/icons/home.svg";
import Search from "../../assets/icons/search.svg";
import History from "../../assets/icons/history.svg";
import Notification from "../../assets/icons/notifications.svg";

import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@react-navigation/elements";
import { ReactElement } from "react";
import { SvgProps } from "react-native-svg";

export default function TabLayout() {
  const router = useRouter();

  const Icon = ({ focused, icon }: { focused: any; icon: any }) => (
    <View
      style={{
        backgroundColor: focused ? "#EAE4FC" : "transparent",
        borderRadius: 9999,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        aspectRatio: 1 / 1,
      }}
    >
      {icon}
    </View>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#996BFF",
          tabBarInactiveTintColor: "#ADB0B9",
          tabBarIconStyle: {
            flex: 1,
            alignItems: "center",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Icon
                focused={focused}
                icon={<Home width={24} height={24} color={color} />}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Icon
                focused={focused}
                icon={<Search width={24} height={24} color={color} />}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="event"
          options={{
            tabBarButton: (props) => {
              const { delayLongPress, ...rest } = props as any;
              const sanitizedProps = delayLongPress == null ? rest : props;
              return (
                <TouchableOpacity
                  {...sanitizedProps}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AddCirle width={28} height={28} color="#996BFF" />
                </TouchableOpacity>
              );
            },
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/events/add");
            },
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Icon
                focused={focused}
                icon={<History width={24} height={24} color={color} />}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Icon
                focused={focused}
                icon={<Notification width={24} height={24} color={color} />}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
