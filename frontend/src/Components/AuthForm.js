import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import app from "../firebaseConfig";

const AuthForm = ({ type, onClose, setSuccessMessage, setErrorMessage }) => {
  const auth = getAuth(app);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (type === "signup" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      if (type === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage("Signup Successful!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage("Login Successful!");
      }

      onClose();

      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    } catch (err) {
      setErrorMessage(err.message);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  return (
    <form onSubmit={handleAuth} className="flex flex-col">
      <h2 className="text-xl font-bold mb-4">
        {type === "signup" ? "Signup" : "Login"}
      </h2>
      <input
        type="email"
        placeholder="Email"
        className="border rounded-lg p-2 mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="relative mb-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="border rounded-lg p-2 w-full pr-10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-gray-600"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>

      {type === "signup" && (
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="border rounded-lg p-2 w-full pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-600"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? (
              <EyeOffIcon size={20} />
            ) : (
              <EyeIcon size={20} />
            )}
          </button>
        </div>
      )}

      <button
        type="submit"
        className="bg-mediumBlue text-white py-2 px-4 rounded-lg"
      >
        {type === "signup" ? "Sign Up" : "Log In"}
      </button>
    </form>
  );
};

export default AuthForm;
