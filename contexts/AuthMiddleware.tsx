import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

// This hook will protect the route access based on user authentication.
function useProtectedRoute() {
    const { isSignedIn, isLoaded } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;

        const inAuthGroup = segments[0] === "auth";

        if (isSignedIn && inAuthGroup) {
            // Redirect away from auth group if authenticated
            router.replace("/");
        } else if (!isSignedIn && !inAuthGroup) {
            // Redirect to login if not authenticated and trying to access protected routes
            router.replace("/auth/login");
        }
    }, [isSignedIn, segments, isLoaded]);
}

// This middleware will wrap the entire app
export function AuthMiddleware({ children }: { children: React.ReactNode }) {
    useProtectedRoute();
    return <>{children}</>;
}
