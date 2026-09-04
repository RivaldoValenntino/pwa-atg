import { createFileRoute, Link } from "@tanstack/react-router";
import { riwayatAbsenQueryOptions } from "../../queries/absenInfoQuery";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth-store";
import { useState } from "react";
import MonthPicker from "../../components/MonthPicker";

export const Route = createFileRoute("/_authenticated/riwayat-absen")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const period = new Date().toISOString().slice(0, 6); // Default to current year-month (YYYY-MM)

    await context.queryClient.prefetchQuery(riwayatAbsenQueryOptions(period));
  },
});

const monthsIndonesian = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function RouteComponent() {
  const currentPeriod = new Date().toISOString().slice(0, 7).replace("-", "");
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);

  const year = selectedPeriod.slice(0, 4);
  const monthIndex = parseInt(selectedPeriod.slice(4, 6), 10) - 1; // Convert MM to index
  const formattedPeriod = `${monthsIndonesian[monthIndex]} ${year}`;

  const { data } = useSuspenseQuery(riwayatAbsenQueryOptions(selectedPeriod));

  const { user } = useAuthStore();

  console.log(data); // Check if data is properly fetched

  return (
    <div className="font-poppins relative h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-primary text-white rounded-b-2xl shadow-md p-6 h-52 relative">
        {/* Back Arrow Section */}
        <div className="absolute top-4 left-4 flex items-center space-x-4">
          <Link to="/info">
            <img
              src="src/assets/ic_arrow_back_white.svg"
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
              src="src/assets/logo.svg"
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

      {/* Attendance History Section */}
      <div className="absolute bg-gray-100 w-full h-[70%] p-6 rounded-t-2xl -mt-16">
        <p className="text-lg font-semibold text-gray-700 mb-4">
          Riwayat Absen
        </p>

        {/* Filter Section */}
        <div className="flex items-center justify-between mb-4">
          <MonthPicker
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            formattedPeriod={formattedPeriod}
          />
          <button className="bg-white p-2 rounded-lg shadow-sm border border-gray-300">
            <img
              src="src/assets/ic_filter-filled.svg"
              alt="Filter Icon"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* Attendance Cards */}
        <div className="space-y-4 w-full max-w-md">
          {data?.length > 0 ? (
            data.map((absen, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4">
                {/* Status Absensi */}
                <div className="space-y-2 mb-4">
                  {/* Tanggal */}
                  <div className="flex items-center">
                    <h2 className="text-sm font-semibold text-gray-800 w-32">
                      Tanggal
                    </h2>
                    <span className="text-sm font-semibold text-gray-800">
                      :{" "}
                    </span>
                    <span className="text-sm ml-3 font-semibold text-gray-800">
                      {absen.date}
                    </span>
                  </div>

                  {/* Status Absensi */}
                  <div className="flex items-center">
                    <h2 className="text-sm font-semibold text-gray-800 w-32">
                      Status Absensi
                    </h2>
                    <span className="text-sm font-semibold text-gray-800">
                      :{" "}
                    </span>
                    <span
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full ml-2"
                      style={{
                        backgroundColor: `#${absen.color}`,
                        color: "#fff",
                      }}
                    >
                      {absen.status}
                    </span>
                  </div>
                </div>

                {/* Attendance Details */}
                <div className="flex space-x-4">
                  {/* Jam Masuk */}
                  <div className="flex items-center w-48">
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      {absen.inphoto ? (
                        <img
                          src={absen.inphoto}
                          alt="Jam Masuk"
                          className="w-full h-full rounded-lg"
                        />
                      ) : (
                        <span className="text-xs">No img</span>
                      )}
                    </div>
                    <div className="ml-2">
                      <h3 className="text-[11px] font-semibold text-gray-800">
                        Jam Masuk:
                      </h3>
                      <p
                        style={{
                          color:
                            absen.inpresent !== "00:00:00"
                              ? `#${absen.color}`
                              : "inherit",
                        }}
                      >
                        {absen.inpresent}
                      </p>
                    </div>
                  </div>

                  {/* Jam Keluar */}
                  <div className="flex items-center w-48">
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      {absen.outphoto ? (
                        <img
                          src={absen.outphoto}
                          alt="Jam Keluar"
                          className="w-full h-full rounded-lg"
                        />
                      ) : (
                        <span className="text-xs">No image</span>
                      )}
                    </div>
                    <div className="ml-2">
                      <h3 className="text-[11px] font-semibold text-gray-800">
                        Jam Keluar:
                      </h3>
                      <p
                        style={{
                          color:
                            absen.outpresent !== "00:00:00"
                              ? `#${absen.color}`
                              : "inherit",
                        }}
                      >
                        {absen.outpresent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Tidak ada data absensi yang tersedia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
