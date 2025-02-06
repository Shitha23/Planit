import React, { useState } from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Modal from "./Components/Modal";
import AuthForm from "./Components/AuthForm";
import "./App.css";
import Home from "./Pages/Home";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [authType, setAuthType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const openLoginModal = () => {
    setModalTitle("Log In");
    setAuthType("login");
    setIsModalOpen(true);
  };

  const openSignupModal = () => {
    setModalTitle("Sign Up");
    setAuthType("signup");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAuthType("");
    setModalTitle("");
  };

  return (
    <div className="App flex flex-col min-h-screen">
      <Header onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />

      <div className="flex-grow">
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

        <Modal isOpen={isModalOpen} onClose={closeModal} Title={modalTitle}>
          <AuthForm
            type={authType}
            onClose={closeModal}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        </Modal>
      </div>

      <Home />
      <Footer onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />
    </div>
  );
}

export default App;
