import { Feather } from "@expo/vector-icons";
import { reloadAppAsync } from "expo";
import React, { useState, useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  Dimensions,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { GestureHandlerRootView, Gesture, GestureDetector, NativeViewGestureHandler } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const theme = {
    background: isDark ? "#000000" : "#FFFFFF",
    backgroundSecondary: isDark ? "#1C1C1E" : "#F2F2F7",
    text: isDark ? "#FFFFFF" : "#000000",
    textSecondary: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
    link: "#007AFF",
    buttonText: "#FFFFFF",
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animation State
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const scrollRef = React.useRef<any>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleDismiss = React.useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(() => setIsModalVisible(false))();
    });
  }, []);

  const panGesture = useMemo(() => Gesture.Pan()
    .simultaneousWithExternalGesture(scrollRef)
    .activeOffsetY([-10, 10])
    .onUpdate((event) => {
      'worklet';
      if (scrollY.value <= 1 && event.translationY > 0) {
        translateY.value = event.translationY;
      } else if (translateY.value > 0) {
        translateY.value = Math.max(0, event.translationY);
      }
      backdropOpacity.value = interpolate(translateY.value, [0, 400], [1, 0], 'clamp');
    })
    .onEnd((event) => {
      'worklet';
      if (event.translationY > 150 || event.velocityY > 500) {
        backdropOpacity.value = withTiming(0, { duration: 250 });
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
          'worklet';
          runOnJS(setIsModalVisible)(false);
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    }), [SCREEN_HEIGHT]);

  React.useEffect(() => {
    if (isModalVisible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 120 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [isModalVisible]);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch (restartError) {
      console.error("Failed to restart app:", restartError);
      resetError();
    }
  };

  const formatErrorDetails = (): string => {
    let details = `Error: ${error.message}\n\n`;
    if (error.stack) {
      details += `Stack Trace:\n${error.stack}`;
    }
    return details;
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {__DEV__ ? (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityLabel="View error details"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.topButton,
            {
              top: insets.top + 16,
              backgroundColor: theme.backgroundSecondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="alert-circle" size={20} color={theme.text} />
        </Pressable>
      ) : null}

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Something went wrong
        </Text>

        <Text style={[styles.message, { color: theme.textSecondary }]}>
          Please reload the app to continue.
        </Text>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.link,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Try Again
          </Text>
        </Pressable>
      </View>

      {__DEV__ ? (
        <Modal
          visible={isModalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={handleDismiss}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.modalOverlay}>
            <Animated.View style={[styles.backdrop, backdropStyle]}>
              <Pressable style={{ flex: 1 }} onPress={handleDismiss} />
            </Animated.View>

            <GestureDetector gesture={panGesture}>
              <Animated.View 
                style={[styles.sheetWrap, { paddingBottom: Math.max(insets.bottom, 16) }, animatedStyle]}
              >
                <View
                  style={[
                    styles.modalContainer,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <View style={styles.gestureHeader}>
                    <View style={styles.grabBarContainer}>
                      <View style={styles.grabBar} />
                    </View>
                    
                    <View
                      style={[
                        styles.modalHeader,
                        {
                          borderBottomColor: isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                        },
                      ]}
                    >
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        Error Details
                      </Text>
                      <Pressable
                        onPress={handleDismiss}
                        accessibilityLabel="Close error details"
                        accessibilityRole="button"
                        style={({ pressed }) => [
                          styles.closeButton,
                          { opacity: pressed ? 0.6 : 1 },
                        ]}
                      >
                        <Feather name="x" size={24} color={theme.text} />
                      </Pressable>
                    </View>
                  </View>

                <NativeViewGestureHandler ref={scrollRef}>
                  <Animated.ScrollView
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                  bounces={false}
                  style={styles.modalScrollView}
                  contentContainerStyle={[
                    styles.modalScrollContent,
                    { paddingBottom: insets.bottom + 16 },
                  ]}
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    style={[
                      styles.errorContainer,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.errorText,
                        {
                          color: theme.text,
                          fontFamily: monoFont,
                        },
                      ]}
                      selectable
                    >
                      {formatErrorDetails()}
                    </Text>
                  </View>
                </Animated.ScrollView>
              </NativeViewGestureHandler>
              </View>
            </Animated.View>
          </GestureDetector>
          </View>
          </GestureHandlerRootView>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    width: "100%",
    maxWidth: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 40,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  topButton: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    paddingHorizontal: 24,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  sheetWrap: {
    width: "100%",
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  gestureHeader: {
    paddingTop: 8,
  },
  grabBarContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
  },
  grabBar: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
  },
  errorContainer: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
    width: "100%",
  },
});
