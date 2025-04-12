import React from "react";

const TicketViewer = ({ previewUrl, onDownload, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 font-bold text-xl"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4">Ticket Preview</h2>

        <iframe
          src={previewUrl}
          className="w-full h-[500px]"
          frameBorder="0"
          title="Ticket Preview"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onDownload}
            className="bg-navyBlue text-white px-4 py-2 rounded hover:bg-deepBlue"
          >
            Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketViewer;
