import { useState } from "react";
import axios from "axios";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (type === "signup") {
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage("Passwords do not match!");
          return;
        }

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
        await axios.post("http://localhost:5000/api/auth/signup", {
          ...formData,
          firebaseId,
        });

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

        const response = await axios.get(
          `http://localhost:5000/api/auth/user/${user.uid}`
        );

        if (response.data && response.data.name) {
          localStorage.setItem("userName", response.data.name);
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
        .get(`http://localhost:5000/api/auth/user/${uid}`)
        .catch(() => ({}));

      if (!existingUser?.data) {
        await axios.post("http://localhost:5000/api/auth/signup", {
          firebaseId: uid,
          name: displayName || "Google User",
          email,
        });
        existingUser = { data: { name: displayName || "Google User" } };
      }

      localStorage.setItem("userName", existingUser.data.name);

      setSuccessMessage(`Login Successful! Welcome, ${existingUser.data.name}`);
      onClose();
      window.dispatchEvent(new Event("userLoggedIn"));
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
      <button
        type="submit"
        className="bg-mediumBlue text-white py-2 px-4 rounded-lg hover:bg-deepBlue"
      >
        {type === "signup" ? "Sign Up" : "Log In"}
      </button>
      {type === "login" && (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="bg-red-500 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700"
        >
          <FaGoogle size={20} /> Log In with Google
        </button>
      )}
    </form>
  );
};

export default AuthForm;
