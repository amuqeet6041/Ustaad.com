"use client";
import { useState, useEffect } from "react";

// Placeholder auth hook — replace with real JWT-based session logic.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { user, loading };
}
