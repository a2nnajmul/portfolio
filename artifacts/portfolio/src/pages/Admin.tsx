import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function isAuthenticated(): boolean {
  const token = localStorage.getItem("admin_token");
  if (!token) return false;
  try {
    const [payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export default function AdminShell() {
  const [authed, setAuthed] = useState<boolean>(isAuthenticated);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authed) setLocation("/admin");
  }, [authed, setLocation]);

  function handleLogin(token: string) {
    localStorage.setItem("admin_token", token);
    setAuthed(true);
    setLocation("/admin/dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    setAuthed(false);
  }

  if (!authed) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <Switch>
      <Route path="/dashboard">
        <AdminDashboard onLogout={handleLogout} />
      </Route>
      <Route>
        <AdminDashboard onLogout={handleLogout} />
      </Route>
    </Switch>
  );
}
