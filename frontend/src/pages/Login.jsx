import { useState } from "react";

import "../styles/login.css";

function Login({ onLogin ,onRegister}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const API_URL = import.meta.env.VITE_API_URL;

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
      
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(
          "Invalid email or password"
        );
      }

      const data = await response.json();

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      onLogin();

    } catch (error) {
      setError(
        error.message ||
        "Unable to sign in. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* =====================================
            BRAND
        ===================================== */}

        <div className="login-brand">

          <div className="login-logo">
            ✦
          </div>

          <div className="login-brand-text">

            <h2>
              SupportAI
            </h2>

            <span>
              Customer Support Copilot
            </span>

          </div>

        </div>


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="login-header">

          <span className="login-eyebrow">
            SUPPORT WORKSPACE
          </span>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to manage customer tickets,
            analyze requests, and assist your
            support workflow with AI.
          </p>

        </div>


        {/* =====================================
            ERROR
        ===================================== */}

        {error && (

          <div
            className="login-error"
            role="alert"
          >

            <span className="error-icon">
              !
            </span>

            <div>
              <strong>
                Sign in failed
              </strong>

              <span>
                {error}
              </span>
            </div>

          </div>

        )}


        {/* =====================================
            LOGIN FORM
        ===================================== */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="email">
              Email address
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                @
              </span>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                disabled={loading}
                required
              />

            </div>

          </div>


          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                •
              </span>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                disabled={loading}
                required
              />

            </div>

          </div>


          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span className="login-button-arrow">
                  →
                </span>
              </>
            )}

          </button>

        </form>


        {/* =====================================
            SECURITY
        ===================================== */}

        <div className="login-security">

          <span className="security-icon">
            🔒
          </span>

          <span>
            Secure authentication
          </span>

        </div>
        <div className="auth-switch">

  <span>
    Don't have an account?
  </span>

  <button
    type="button"
    onClick={onRegister}
    disabled={loading}
  >
    Create account
  </button>

</div>


        {/* =====================================
            FOOTER
        ===================================== */}

        <div className="login-footer">

          <span>
            ✦
          </span>

          AI-powered customer support workspace

        </div>

      </div>

    </div>
  );
}

export default Login;