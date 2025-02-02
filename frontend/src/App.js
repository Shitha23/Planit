import React, { useState } from "react";
import Header from "./Components/Header";
import Modal from "./Components/Modal";
import AuthForm from "./Components/AuthForm";
import "./App.css";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="App">
      <Header
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSignup={() => setIsSignupOpen(true)}
      />

      {successMessage && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md transition-opacity duration-300">
          {successMessage}
          <button
            className="ml-4 text-lg font-bold"
            onClick={() => setSuccessMessage("")}
          >
            ✖
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md transition-opacity duration-300">
          {errorMessage}
          <button
            className="ml-4 text-lg font-bold"
            onClick={() => setErrorMessage("")}
          >
            ✖
          </button>
        </div>
      )}

      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <AuthForm
          type="login"
          onClose={() => setIsLoginOpen(false)}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
        />
      </Modal>

      <Modal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)}>
        <AuthForm
          type="signup"
          onClose={() => setIsSignupOpen(false)}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
        />
      </Modal>
    </div>
  );
}

export default App;
