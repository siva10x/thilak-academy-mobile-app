// import { useAuth } from "@clerk/clerk-expo";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as SplashScreen from "expo-splash-screen";
import { StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const authContext = useAuth();
  const isLoading = authContext?.isLoading ?? true;

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen
        name="course/[id]"
        options={{
          headerShown: true,
          headerTitle: "Course Details",
        }}
      />
      <Stack.Screen
        name="video/[id]"
        options={{
          headerShown: true,
          headerTitle: "Video Player",
        }}
      />
    </Stack>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CourseProvider>
        {children}
      </CourseProvider>
    </AuthProvider>
  );
}

function ClientSafeLayout() {

  return (
    <AppProviders>
      <GestureHandlerRootView style={rootLayoutStyles.container}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </AppProviders>
  );
}

const rootLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientSafeLayout />
    </QueryClientProvider>
  );
}