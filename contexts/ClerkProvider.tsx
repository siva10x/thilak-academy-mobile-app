import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { ReactNode } from "react";

const tokenCache = {
    getToken(key: string) {
        return SecureStore.getItemAsync(key);
    },
    saveToken(key: string, value: string) {
        return SecureStore.setItemAsync(key, value);
    },
};

export function ClerkProvider({ children }: { children: ReactNode }) {
    return (
        <BaseClerkProvider
            publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
            tokenCache={tokenCache}
        >
            {children}
        </BaseClerkProvider>
    );
}
