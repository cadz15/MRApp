import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";

const TabBar = (props: BottomTabBarProps) => {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  return (
    <View style={styles.tabbar}>
      {props.state.routes.map((route, index) => {
        const { options } = props.descriptors[route.key];
        const label: any =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = props.state.index === index;

        const onPress = () => {
          const event = props.navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            props.navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          props.navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <Text style={{ color: isFocused ? colors.primary : colors.text }}>
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#5EB492",
    width: 500,
    borderRadius: 50,
    height: 50,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0,
  },
});

export default TabBar;
