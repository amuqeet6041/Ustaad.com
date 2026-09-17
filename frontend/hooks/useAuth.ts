"use client";
import { useState, useEffect, useCallback } from "react";
import { AuthUser, getToken, getUser, clearAuth } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    const u = getUser();
    setToken(t);
    setUser(u);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, loading, logout };
}
