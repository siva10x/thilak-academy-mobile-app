import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <View style={rootLayoutStyles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

function RootLayoutNav() {
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Show loading screen while determining auth state
  if (isLoading) {
    return <LoadingScreen />;
  }



  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

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

function CourseProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <CourseProvider user={user}>
      {children}
    </CourseProvider>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CourseProviderWithAuth>
        {children}
      </CourseProviderWithAuth>
    </AuthProvider>
  );
}

function ClientSafeLayout() {

  return (
    <SafeAreaProvider>
      <AppProviders>
        <GestureHandlerRootView style={rootLayoutStyles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AppProviders>
    </SafeAreaProvider>
  );
}

const rootLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientSafeLayout />
    </QueryClientProvider>
  );
}