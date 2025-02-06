import React from "react";

const Modal = ({ isOpen, onClose, children, Title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative grid grid-rows-[auto,1fr] gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{Title}</h2>
          <button
            className="text-gray-600 hover:text-gray-900 text-2xl"
            onClick={onClose}
            aria-label="Close Modal"
          >
            ✖
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
