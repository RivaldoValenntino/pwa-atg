import { createFileRoute, Link } from "@tanstack/react-router";
import CardAbsenStaffTerkait from "../../components/CardAbsenStaffTerkait";
import { absenStaffTerkaitQueryOptions } from "../../queries/absenStaffTerkaitQueryFn";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthStore } from "../../store/auth-store";
import DatePicker from "../../components/DatePicker";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/absen-staff-terkait")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const start_date = new Date().toISOString().slice(0, 10); // Default to current year-month (YYYY-MM)
    const end_date = new Date().toISOString().slice(0, 10); // Default to current year-month (YYYY-MM)
    await context.queryClient.prefetchQuery(
      absenStaffTerkaitQueryOptions(start_date, end_date)
    );
  },
});

function RouteComponent() {
  const { user } = useAuthStore();

  const [selectedStartDate, setSelectedStartDate] = useState(
    new Date().toISOString().slice(0, 10) // Default to current date (YYYY-MM-DD)
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date().toISOString().slice(0, 10) // Default to current date (YYYY-MM-DD)
  );

  const formatDateForDisplay = (date: string) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  const { data } = useSuspenseQuery(
    absenStaffTerkaitQueryOptions(selectedStartDate, selectedEndDate)
  );

  return (
    <div className="font-poppins relative h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-primary text-white rounded-b-2xl shadow-md p-6 h-52 relative">
        {/* Back Arrow Section */}
        <div className="absolute top-4 left-4 flex items-center space-x-4">
          <Link to="/info">
            <img
              src="assets/ic_arrow_back_white.svg"
              alt="Back"
              width={30}
              height={30}
            />
          </Link>

          <p className="text-lg font-semibold">Informasi Absen</p>
        </div>

        {/* Left-Aligned Content */}
        <div className="flex flex-col items-start justify-center h-32">
          <div className="flex flex-row items-center space-x-4">
            {/* Profile Avatar */}
            <img
              src="assets/logo.svg"
              alt="Profile Avatar"
              width={60}
              height={60}
            />

            {/* Name and NIP in Column */}
            <div className="flex flex-col">
              <p className="text-lg font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[65vw]">
                {user?.name}
              </p>
              <p className="text-sm text-gray-100">NUP : {user?.nup}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Card Section */}
      <div className="absolute bg-gray-100 w-full h-[70%] p-6 rounded-t-2xl -mt-16">
        <h2 className="flex sm:justify-center text-sm sm:text-xl font-bold mb-4">
          Riwayat Pengajuan Izin
        </h2>

        <div className="flex items-center justify-between mb-4 gap-2">
          {/* Tanggal Awal */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Awal
            </label>
            <DatePicker
              selectedDate={selectedStartDate}
              setSelectedDate={setSelectedStartDate}
              formattedDate={formatDateForDisplay(selectedStartDate)}
            />
          </div>

          {/* Tanggal Akhir */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <DatePicker
              selectedDate={selectedEndDate}
              setSelectedDate={setSelectedEndDate}
              formattedDate={formatDateForDisplay(selectedEndDate)}
            />
          </div>
        </div>

        <div className="space-y-4 w-full max-w-md">
          {data.map((item: any) => (
            <CardAbsenStaffTerkait
              key={item.id}
              name={item.name}
              nup={item.nup}
              position={item.occupation}
              department={item.department}
              subDepartment={item.subdepartment}
              date={item.date}
              attendanceStatus={item.status}
              checkInTime={item.inpresent}
              checkOutTime={item.outpresent}
              photoMasuk={item.inphoto}
              photoKeluar={item.outphoto}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
