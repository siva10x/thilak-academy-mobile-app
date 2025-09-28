import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading spinner while checking auth state
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0066CC" />
            </View>
        );
    }

    // Redirect based on authentication status
    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    } else {
        return <Redirect href="/login" />;
    }
}