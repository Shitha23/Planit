import React from "react";

const Modal = ({ isOpen, onClose, children, Title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold">{Title}</h2>
          <button
            className="text-gray-600 hover:text-gray-900 text-2xl"
            onClick={onClose}
            aria-label="Close Modal"
          >
            ✖
          </button>
        </div>

        <div className="overflow-y-auto flex-1 max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
};

export default Modal;