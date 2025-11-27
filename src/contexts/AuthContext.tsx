import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  userType: "SCHOOL" | "TEACHER";
  school?: {
    id: string;
    name: string;
    contactName: string;
    verified: boolean;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    verified: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  timeUntilExpiry: number | null;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
    setTimeUntilExpiry(null);
    setShowLogoutModal(false);
    navigate("/");
  }, [navigate]);

  // Auto-logout functionality
  const handleAutoLogout = useCallback(() => {
    setShowLogoutModal(true);
    setTimeout(() => {
      logout();
    }, 5000); // Give user 5 seconds to see the message
  }, [logout]);

  // Check token expiry and setup auto-logout
  const setupTokenExpiry = useCallback(
    (token: string) => {
      try {
        // Validate token format
        if (!token || typeof token !== "string") {
          console.error("Invalid token: token is empty or not a string");
          handleAutoLogout();
          return;
        }

        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
          console.error(
            "Invalid token: JWT should have 3 parts separated by dots",
          );
          localStorage.removeItem("authToken");
          handleAutoLogout();
          return;
        }

        const payload = JSON.parse(atob(tokenParts[1]));

        if (!payload.exp) {
          console.error("Invalid token: no expiry time found");
          localStorage.removeItem("authToken");
          handleAutoLogout();
          return;
        }

        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        setTimeUntilExpiry(Math.max(0, timeUntilExpiry));

        if (timeUntilExpiry <= 0) {
          // Token already expired
          localStorage.removeItem("authToken");
          handleAutoLogout();
          return;
        }

        // Set up auto-logout timer (60 minutes = 3,600,000 ms)
        const autoLogoutTime = Math.min(timeUntilExpiry, 60 * 60 * 1000);

        const timeoutId = setTimeout(() => {
          handleAutoLogout();
        }, autoLogoutTime);

        // Update countdown every minute
        const intervalId = setInterval(() => {
          const remaining = expiryTime - Date.now();
          setTimeUntilExpiry(Math.max(0, remaining));

          if (remaining <= 0) {
            clearInterval(intervalId);
          }
        }, 60000); // Update every minute

        return () => {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error("Error parsing token:", error);
        localStorage.removeItem("authToken");
        handleAutoLogout();
      }
    },
    [handleAutoLogout],
  );

  const validateToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      validateToken(token);
      const cleanup = setupTokenExpiry(token);
      return cleanup;
    } else {
      setLoading(false);
    }
  }, [setupTokenExpiry]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        setUser(data.user);

        // Setup auto-logout for new token
        setupTokenExpiry(data.token);

        // Navigate to appropriate dashboard
        navigate(data.redirectUrl);
        return true;
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    timeUntilExpiry,
    showLogoutModal,
    setShowLogoutModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
