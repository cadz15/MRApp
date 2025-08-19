import { DBProvider } from "@/context/DBProvider";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import CheckAPI from "./checkAPI";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <DBProvider>
      <CheckAPI />
    </DBProvider>
  );
}
