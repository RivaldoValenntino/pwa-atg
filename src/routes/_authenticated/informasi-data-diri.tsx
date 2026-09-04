import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth-store";
import { useState } from "react";
import { informasiDataDiriQueryOptions } from "../../queries/informasiDataDiriQueryFn";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/informasi-data-diri")({
  component: RouteComponent,

  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(informasiDataDiriQueryOptions());
  },
});

function RouteComponent() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"Diri" | "Pekerjaan">("Diri");

  const { data } = useSuspenseQuery(informasiDataDiriQueryOptions());

  return (
    <div className="font-poppins relative h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-primary text-white shadow-md p-6 h-52 relative overflow-hidden">
        {/* Back Arrow Section */}
        <div className="absolute top-4 left-4 flex items-center space-x-4">
          <Link to="/lainnya">
            <img
              src="assets/ic_arrow_back_white.svg"
              alt="Back"
              width={30}
              height={30}
            />
          </Link>
          <p className="text-lg font-semibold">Diri Izin</p>
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

            {/* Name and NUP */}
            <div className="flex flex-col">
              <p className="text-lg font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[65vw]">
                {user?.name}
              </p>
              <p className="text-sm text-gray-100">NUP : {user?.nup}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around bg-primary pb-4">
          <button
            className={`px-6 py-2 rounded-t-lg relative transition-all duration-300 ${activeTab === "Diri"
                ? "text-white -mb-[2px] font-bold"
                : "bg-primary text-white opacity-50 font-light"
              }`}
            onClick={() => setActiveTab("Diri")}
          >
            Data Diri
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg relative transition-all duration-300 ${activeTab === "Pekerjaan"
                ? "text-white -mb-[2px] font-bold"
                : "bg-primary text-white opacity-50 font-light"
              }`}
            onClick={() => setActiveTab("Pekerjaan")}
          >
            Data Pekerjaan
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 bg-white shadow-md rounded-lg mx-4 mt-4">
        {activeTab === "Diri" && (
          <div className="space-y-4">
            <DataRow label="Tempat Lahir" value={data?.employee?.birth_place} />
            <DataRow label="Tanggal Lahir" value={data?.employee?.birth_date} />
            <DataRow label="Kontak" value={data?.employee?.contact} />
            <DataRow label="Alamat" value={data?.employee?.address} />
            <DataRow
              label="Status Nikah"
              value={data?.employee?.married_status}
            />
            <DataRow
              label="Golongan Darah"
              value={data?.employee?.blood_type}
            />
            <DataRow label="Agama" value={data?.employee?.religion} />
            <DataRow
              label="Pendidikan Terakhir"
              value={data?.employee?.last_education}
            />
          </div>
        )}

        {activeTab === "Pekerjaan" && (
          <div className="space-y-4">
            <DataRow label="Tanggal Masuk" value={data?.work?.entry_date} />
            <DataRow label="Golongan" value={data?.work?.group} />
            <DataRow
              label="Jumlah Anak"
              value={data?.work?.dependent_children}
            />
            <DataRow label="Kantor" value={data?.work?.office} />
            <DataRow label="Posisi" value={data?.work?.position} />
            <DataRow label="Departemen" value={data?.work?.department} />
            <DataRow label="Sub Departemen" value={data?.work?.subdepartment} />
            <DataRow
              label="Masa Kerja Seluruh (THN)"
              value={`${data?.work?.year_work_period} thn`}
            />
            <DataRow
              label="Masa Kerja Seluruh (BLN)"
              value={`${data?.work?.month_work_period} bln`}
            />
            <DataRow
              label="Masa Kerja Golongan (THN)"
              value={`${data?.work?.year_work_group} thn`}
            />
            <DataRow
              label="Masa Kerja Golongan (BLN)"
              value={`${data?.work?.month_work_group} bln`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Component for Data Display
const DataRow = ({ label, value }) => (
  <div className="flex justify-between border-b pb-2">
    <p className="text-gray-600">{label}</p>
    <p className="text-gray-900 font-medium">{value || "-"}</p>
  </div>
);

export default RouteComponent;
