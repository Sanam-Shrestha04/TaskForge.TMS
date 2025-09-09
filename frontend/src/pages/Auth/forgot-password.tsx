import React, { useState } from "react";
import Input from "../../components/Inputs/Input";
import AuthLayout from "../../components/layouts/AuthLayout";
import axios from "axios";
import { API_PATHS } from "../../utils/apiPaths";
import { validateEmail } from "../../utils/validation";

// Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // Or your backend port
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter an email address.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });

      // Backend always responds with same message for security
      setMessage(response.data.msg || "If an account with this email exists, a password reset link has been sent.");
    } catch (err) {
      console.error("Forgot password request error:", err);

      // Backend error fallback
      setError("Please enter a valid email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%]">
        <h3 className="text-xl font-semibold text-black">Forgot Password</h3>
        <p className="text-xs text-slate-700 mt-[7px] mb-5 capitalize">
          Enter your email and we’ll send you a password reset link.
        </p>

        <form onSubmit={handleForgotPassword}>
          <Input
            type="email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="Email"
          />

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          {message && <p className="text-green-500 text-xs mt-2">{message}</p>}

          <button
            type="submit"
            className="btn-primary mt-3"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
