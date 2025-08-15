import { Link } from "expo-router";
import React, { ReactNode } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type AppButtonType = {
  onPress: () => void;
  asLink: boolean;
  style: {} | null;
  link: any | null;
  children: ReactNode;
};

const AppButton = ({
  onPress,
  asLink,
  style = null,
  link = null,
  children,
}: AppButtonType) => {
  return (
    <>
      {asLink === true ? (
        <Link href={link} onPress={onPress} style={[styles.button, style]}>
          {children}
        </Link>
      ) : (
        <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
          {children}
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 10,
  },
});

export default AppButton;
