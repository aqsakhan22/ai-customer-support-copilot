import { useState } from "react";

import "../styles/login.css";

function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to create account."
        );
      }

      setSuccess(
        "Account created successfully. You can now sign in."
      );

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        onRegister();
      }, 1200);

    } catch (error) {
      setError(
        error.message ||
        "Unable to create account. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* BRAND */}

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


        {/* HEADER */}

        <div className="login-header">

          <span className="login-eyebrow">
            SUPPORT WORKSPACE
          </span>

          <h1>
            Create your account
          </h1>

          <p>
            Create an account to manage customer
            tickets and use AI-powered support tools.
          </p>

        </div>


        {/* ERROR */}

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
                Registration failed
              </strong>

              <span>
                {error}
              </span>

            </div>

          </div>

        )}


        {/* SUCCESS */}

        {success && (

          <div
            className="login-success"
            role="status"
          >

            <span className="success-icon">
              ✓
            </span>

            <div>

              <strong>
                Account created
              </strong>

              <span>
                {success}
              </span>

            </div>

          </div>

        )}


        {/* REGISTER FORM */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="name">
              Full name
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                👤
              </span>

              <input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
                disabled={loading}
                required
              />

            </div>

          </div>


          <div className="form-group">

            <label htmlFor="register-email">
              Email address
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                @
              </span>

              <input
                id="register-email"
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

            <label htmlFor="register-password">
              Password
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                •
              </span>

              <input
                id="register-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
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
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <span className="login-button-arrow">
                  →
                </span>
              </>
            )}

          </button>

        </form>


        {/* LOGIN LINK */}

        <div className="auth-switch">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={onRegister}
            disabled={loading}
          >
            Sign in
          </button>

        </div>


        {/* SECURITY */}

        <div className="login-security">

          <span className="security-icon">
            🔒
          </span>

          <span>
            Secure authentication
          </span>

        </div>


        {/* FOOTER */}

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

export default Register;