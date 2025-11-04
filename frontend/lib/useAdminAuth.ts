"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      router.push("/admin/login");
      setIsAuthenticated(false);
    } else {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, [router]);

  return { token, isAuthenticated };
}

