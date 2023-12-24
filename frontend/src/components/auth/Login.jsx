import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { StyledForm } from "./StyledForm";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const [user, setUser] = useState({
    email: "",
    password: "",
    otp: "",
    isOtpSent: false,
    generatedOTP: "",
    timer: 120,
  });

  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (auth._id) {
      navigate("/cart");
    }
  }, [auth._id, navigate]);

  const sendOTP = async () => {
    try {
      const generatedOTP = Math.floor(100000 + Math.random() * 900000);
      console.log("Generated OTP:", generatedOTP);
      console.log("Mail:", user.email);

      await fetch("https://e-commerce-ylbo.onrender.com/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toMail: user.email,
          otp: generatedOTP.toString(),
        }),
      });

      setUser({
        ...user,
        isOtpSent: true,
        generatedOTP: generatedOTP.toString(),
        timer: 120,
      });

      startTimer();
    } catch (error) {
      console.error("Error sending OTP:", error.message);
    }
  };

  const startTimer = () => {
    const timerInterval = setInterval(() => {
      setUser((prevUser) => ({
        ...prevUser,
        timer: prevUser.timer - 1,
      }));
    }, 1000);

    setTimeout(() => {
      clearInterval(timerInterval);
      setUser({
        ...user,
        isOtpSent: false,
        timer: 0,
      });
    }, 120000);
  };

  const handleResend = () => {
    sendOTP();
  };

  const handleVerifyEmail = () => {
    sendOTP();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.otp === user.generatedOTP) {
      dispatch(loginUser(user));
    } else {
      setOtpError("Invalid OTP. Please enter the correct OTP.");
      setUser({ ...user, otp: "" });
    }
  };

  return (
    <>
      <StyledForm onSubmit={handleSubmit}>
        <h2>Login</h2>
        {!user.isOtpSent ? (
          <>
            <input
              type="email"
              placeholder="email"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <button type="button" onClick={handleVerifyEmail}>
              Verify Email
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={user.otp}
              onChange={(e) => setUser({ ...user, otp: e.target.value })}
            />
            <p style={{ color: "red" }}>{otpError}</p>
            <p>
              Resend OTP in {Math.floor(user.timer / 60)}:
              {user.timer % 60 < 10 ? `0${user.timer % 60}` : user.timer % 60}{" "}
              seconds
            </p>
            <button type="button" onClick={handleResend} disabled={user.timer > 0}>
              Resend OTP
            </button>
            <button type="submit">
              {auth.loginStatus === "pending" ? "Submitting..." : "Submit"}
            </button>
          </>
        )}
      </StyledForm>
    </>
  );
};

export default Login;
