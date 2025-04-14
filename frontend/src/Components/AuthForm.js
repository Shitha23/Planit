import { useState } from "react";
import axios from "../axiosConfig";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import app from "../firebaseConfig";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

const AuthForm = ({ type, onClose, setSuccessMessage, setErrorMessage }) => {
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    ...(type === "signup" && {
      name: "",
      phone: "",
      address: "",
      confirmPassword: "",
    }),
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (
      type === "signup" &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
    }

    if (type === "signup") {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required.";
      } else if (formData.name.length < 3) {
        newErrors.name = "Name must be at least 3 characters long.";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required.";
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone number must be exactly 10 digits.";
      }

      if (!formData.address.trim()) {
        newErrors.address = "Address is required.";
      } else if (formData.address.length < 5) {
        newErrors.address = "Address must be at least 5 characters long.";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      if (type === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: formData.name,
        });

        const firebaseId = user.uid;
        await axios.post("/api/auth/signup", {
          ...formData,
          firebaseId,
        });

        localStorage.setItem("userName", formData.name);
        window.dispatchEvent(new Event("userLoggedIn"));

        setSuccessMessage("Signup Successful! Please log in.");
        await signOut(auth);
        onClose();
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        const response = await axios.get(`/api/auth/user/${user.uid}`);

        if (response.data && response.data.name) {
          localStorage.setItem("userName", response.data.name);
          localStorage.setItem("firebaseId", response.data.firebaseId);
        }

        setSuccessMessage(`Login Successful! Welcome, ${response.data.name}`);
        onClose();
        window.dispatchEvent(new Event("userLoggedIn"));
      }
    } catch (error) {
      setErrorMessage(error.message);
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const { uid, displayName, email } = user;

      let existingUser = await axios
        .get(`/api/auth/user/${uid}`)
        .catch(() => ({}));

      if (!existingUser?.data) {
        await axios.post("/api/auth/signup", {
          firebaseId: uid,
          name: displayName || "Google User",
          email,
        });
        existingUser = {
          data: { name: displayName || "Google User", firebaseId: uid },
        };
      }

      localStorage.setItem("userName", existingUser.data.name);
      localStorage.setItem("firebaseId", existingUser.data.firebaseId);

      window.dispatchEvent(new Event("userLoggedIn"));

      setSuccessMessage(`Login Successful! Welcome, ${existingUser.data.name}`);
      onClose();
    } catch (error) {
      setErrorMessage("Google Sign-In Failed: " + error.message);
      onClose();
    }
  };

  return (
    <form onSubmit={handleAuth} className="flex flex-col space-y-4">
      {type === "signup" && (
        <>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="border p-2 rounded"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="border p-2 rounded"
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone}</p>
          )}

          <input
            type="text"
            name="address"
            placeholder="Address"
            className="border p-2 rounded"
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </>
      )}

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="border p-2 rounded"
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          className="border p-2 rounded w-full pr-10"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-gray-600"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password}</p>
      )}

      {type === "signup" && (
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            className="border p-2 rounded w-full pr-10"
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}

          <button
            type="button"
            className="absolute right-3 top-3 text-gray-600"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? (
              <FaEyeSlash size={20} />
            ) : (
              <FaEye size={20} />
            )}
          </button>
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white py-2 rounded">
        {type === "signup" ? "Sign Up" : "Log In"}
      </button>

      {type === "login" && (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="bg-red-500 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          <FaGoogle size={20} /> Log In with Google
        </button>
      )}
    </form>
  );
};

export default AuthForm;
