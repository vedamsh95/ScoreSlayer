import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Bungee_400Regular } from "@expo-google-fonts/bungee";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GameProvider } from "@/context/GameContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#1A0533" } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="setup/[gameId]"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="game/[id]"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="results/[id]"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="uno/index"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="uno/[variantId]"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Bungee_400Regular,
  });

  const [isAppReady, setIsAppReady] = React.useState(false);
  const [isSplashVisible, setIsSplashVisible] = React.useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide native splash screen immediately when fonts are loaded
      // Our custom AnimatedSplashScreen will take over
      SplashScreen.hideAsync().then(() => {
        setIsAppReady(true);
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {isSplashVisible && (
        <AnimatedSplashScreen 
          onAnimationComplete={() => setIsSplashVisible(false)} 
        />
      )}
      <View style={{ flex: 1, display: isAppReady ? 'flex' : 'none' }}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GameProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </GameProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}
