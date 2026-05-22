import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { router } from "expo-router";
import { DeviceEventEmitter } from "react-native";
import { authService } from "../lib/api/services/auth.service";
import { User, LoginDto } from "../types/auth.types";
import {
  TOKEN_REFRESHED_EVENT,
  setAccessTokenStore,
} from "../lib/api/fetchWithAuth";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Silent refresh on mount
  useEffect(() => {
    authService
      .refreshToken()
      .then(async (data) => {
        setAccessTokenStore(data.accessToken);
        setAccessToken(data.accessToken);
        const profile = await authService.getProfile(data.accessToken);
        setUser(profile);
      })
      .catch(() => {
        setAccessTokenStore(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Token refresh event (Swapped 'window' for 'DeviceEventEmitter')
  useEffect(() => {
    const tokenSub = DeviceEventEmitter.addListener(
      TOKEN_REFRESHED_EVENT,
      (data) => {
        if (data?.accessToken) {
          setAccessTokenStore(data.accessToken);
          setAccessToken(data.accessToken);
        }
      },
    );

    const logoutSub = DeviceEventEmitter.addListener("auth:logout", () => {
      logout();
    });

    return () => {
      tokenSub.remove();
      logoutSub.remove();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      setAccessTokenStore(null);
      setAccessToken(null);
      setUser(null);
      router.replace("/login");
    }
  }, []);

  const login = async (credentials: LoginDto): Promise<User> => {
    const response = await authService.login(credentials);
    setAccessTokenStore(response.accessToken);
    setAccessToken(response.accessToken);
    setUser(response.user);
    return response.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
