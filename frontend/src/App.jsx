import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetails";
// import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeBase from "./pages/KnowledgeBase";
import Analytics from "./pages/Analytics";

import "./styles/app.css";

function ProtectedLayout({ onLogout }) {
  const location = useLocation();

  function isActive(path) {
    if (path === "/tickets") {
      return (
        location.pathname === "/tickets" ||
        location.pathname.startsWith("/tickets/")
      );
    }

    return location.pathname === path;
  }

  return (
    <div className="app-shell">

      <header className="app-header">

        <div className="app-brand">
          <div className="app-brand-icon">
            ✦
          </div>

          <div>
            <h1>SupportAI</h1>
            <span>
              Customer Support Copilot
            </span>
          </div>
        </div>
<nav className="app-navigation">

  <Link
    to="/dashboard"
    className={
      isActive("/dashboard")
        ? "nav-button active"
        : "nav-button"
    }
  >
    <span>📊</span>
    Dashboard
  </Link>

  <Link
    to="/tickets"
    className={
      isActive("/tickets")
        ? "nav-button active"
        : "nav-button"
    }
  >
    <span>🎫</span>
    Tickets
  </Link>

  <Link
    to="/knowledge-base"
    className={
      isActive("/knowledge-base")
        ? "nav-button active"
        : "nav-button"
    }
  >
    <span>📚</span>
    Knowledge Base
  </Link>

  <Link
    to="/analytics"
    className={
      isActive("/analytics")
        ? "nav-button active"
        : "nav-button"
    }
  >
    <span>📈</span>
    AI Analytics
  </Link>

</nav>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </header>

      <main className="app-content">
        <Routes>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/tickets"
            element={<Tickets />}
          />

          <Route
            path="/tickets/:ticketId"
            element={<TicketDetail />}
          />

          <Route
            path="/knowledge-base"
            element={<KnowledgeBase />}
          />
          <Route
  path="/analytics"
  element={<Analytics />}
/>

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </main>

    </div>
  );
}

function AuthenticatedApp() {
  const [isLoggedIn, setIsLoggedIn] =
    useState(
      Boolean(
        localStorage.getItem(
          "access_token"
        )
      )
    );

  const [authPage, setAuthPage] =
    useState("login");

  function handleLogout() {
    localStorage.removeItem(
      "access_token"
    );

    setIsLoggedIn(false);
    setAuthPage("login");
  }

  if (!isLoggedIn) {
    if (authPage === "register") {
      return (
        <Register
          onRegister={() =>
            setAuthPage("login")
          }
        />
      );
    }

    return (
      <Login
        onLogin={() =>
          setIsLoggedIn(true)
        }
        onRegister={() =>
          setAuthPage("register")
        }
      />
    );
  }

  return (
    <ProtectedLayout
      onLogout={handleLogout}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthenticatedApp />
    </BrowserRouter>
  );
}

export default App;