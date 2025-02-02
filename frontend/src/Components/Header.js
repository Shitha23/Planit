import React, { useState } from "react";

const Header = ({ onOpenLogin, onOpenSignup }) => {
  return (
    <header className="bg-white shadow-lg p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/Images/logo-header.png"
            alt="Company Logo"
            className="h-10 rounded-full mr-2"
          />
          <span className="text-navyBlue font-bold text-xl">Plan-It</span>
        </div>

        <nav className="space-x-4">
          <button
            onClick={onOpenLogin}
            className="bg-mediumBlue text-white py-2 px-4 rounded-lg hover:bg-deepBlue"
          >
            Login
          </button>
          <button
            onClick={onOpenSignup}
            className="bg-navyBlue text-white py-2 px-4 rounded-lg hover:bg-deepBlue"
          >
            Signup
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
