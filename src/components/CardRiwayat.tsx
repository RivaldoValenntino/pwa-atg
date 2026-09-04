import React, { useState } from "react";
// import {
//   CalendarIcon,
//   InformationCircleIcon,
//   PaperClipIcon,
// } from "@heroicons/react/24/outline";

interface LeaveCardProps {
  reason: string;
  startDate: string;
  endDate: string;
  description: string;
  attachmentUrl?: string;
  status: "0" | "1" | "2";
  onCancel?: () => void;
}

const LeaveCard: React.FC<LeaveCardProps> = ({
  reason,
  startDate,
  endDate,
  description,
  attachmentUrl,
  status,
  onCancel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative w-full max-w-sm">
      {/* reason & Status Badge */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{reason}</h3>
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${status === "0"
              ? "bg-[#FF8000] text-white" // Menunggu
              : status === "1"
                ? "bg-[#219653] text-white" // Diterima
                : "bg-[#EB5757] text-white" // Ditolak
            }`}
        >
          {status === "0"
            ? "Menunggu"
            : status === "1"
              ? "Diterima"
              : "Ditolak"}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center text-sm text-gray-500 mt-2 gap-2">
        {/* <CalendarIcon className="h-5 w-5 mr-2" /> */}
        <img src="assets/ic_calendar.svg" alt="" width={24} height={24} />
        {startDate} - {endDate}
      </div>

      {/* Description */}
      <div className="flex items-center text-sm text-gray-600 mt-2 gap-2">
        {/* <InformationCircleIcon className="h-5 w-5 mr-2" /> */}
        <img src="assets/ic_duo_info.svg" alt="" width={24} height={24} />
        {description}
      </div>

      {/* Attachment Link */}
      {attachmentUrl && (
        <div className="flex items-center text-sm text-blue-600 mt-2 gap-2">
          {/* <PaperClipIcon className="h-5 w-5 mr-2" /> */}
          <img src="assets/ic_file.svg" alt="" width={24} height={24} />
          <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
            Lihat Lampiran...
          </a>
        </div>
      )}

      {/* Cancel Button - Visible only when status is "Menunggu" */}
      {status === "0" && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-red-600 text-white font-bold py-2 mt-4 rounded-full hover:bg-red-700 transition duration-200"
        >
          Batalkan
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center w-[90%] max-w-sm">
            <p className="text-center mt-2 font-bold">
              Apakah Anda yakin ingin membatalkan izin ini?
            </p>
            <div className="flex justify-center mt-4 gap-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-32 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-200 text-center"
              >
                TIDAK
              </button>
              <button
                onClick={onCancel}
                className="w-32 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-center"
              >
                IYA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCard;
