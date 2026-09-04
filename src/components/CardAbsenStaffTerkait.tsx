import React from "react";
// import { CheckCircleIcon, MinusCircleIcon } from "@heroicons/react/24/solid";

interface CardAbsenStaffTerkaitProps {
  name: string;
  nup: string;
  position: string;
  department: string;
  subDepartment: string;
  date: string;
  attendanceStatus: "present" | "absent"; // Example: "present" = ✅, "absent" = ⚪
  checkInTime: string;
  checkOutTime: string;
  photoMasuk: string;
  photoKeluar: string;
}

const CardAbsenStaffTerkait: React.FC<CardAbsenStaffTerkaitProps> = ({
  name,
  nup,
  position,
  department,
  subDepartment,
  date,
  attendanceStatus,
  checkInTime,
  checkOutTime,
  photoMasuk,
  photoKeluar,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative w-full max-w-sm">
      <div className="grid grid-cols-9 gap-1 text-gray-700 text-sm">
        <span className="font-semibold col-span-4">Nama</span>
        <span className="col-span-5">: {name}</span>

        <span className="font-semibold col-span-4">NUP</span>
        <span className="col-span-5">: {nup}</span>

        <span className="font-semibold col-span-4">Jabatan</span>
        <span className="col-span-5">: {position}</span>

        <span className="font-semibold col-span-4">Departemen</span>
        <span className="col-span-5">: {department}</span>

        <span className="font-semibold col-span-4">Subdepartemen</span>
        <span className="col-span-5">: {subDepartment}</span>

        <span className="font-semibold col-span-4">Tanggal</span>
        <span className="col-span-5">: {date}</span>

        <span className="font-semibold col-span-4">Status Absensi</span>
        <span className="col-span-5">: {attendanceStatus}</span>
      </div>

      {/* Check-in & Check-out Section */}
      <div className="flex space-x-4 mt-6">
        {/* Left side: Jam Masuk */}
        <div className="flex flex-row items-center w-48">
          <img
            src={photoMasuk}
            alt="Foto Masuk"
            className="w-16 h-16 rounded-lg bg-muted object-cover"
          />
          <div className="ml-1 sm:ml-4 flex flex-col">
            <h3 className="text-[11px] sm:text-sm font-semibold text-textGray mb-1 sm:mb-2">
              Jam Masuk:
            </h3>
            <p className="text-textGray">{checkInTime}</p>
          </div>
        </div>

        {/* Right side: Jam Keluar */}
        <div className="flex flex-row items-center w-48">
          <img
            src={photoKeluar}
            alt="Foto Keluar"
            className="w-16 h-16 rounded-lg bg-muted object-cover"
          />
          <div className="ml-1 sm:ml-4 flex flex-col">
            <h3 className="text-[11px] sm:text-sm font-semibold text-textGray mb-1 sm:mb-2">
              Jam Keluar:
            </h3>
            <p className="text-textGray">{checkOutTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardAbsenStaffTerkait;
