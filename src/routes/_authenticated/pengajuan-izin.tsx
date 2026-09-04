import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth-store";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  deletePengajuanIzin,
  fetchCutiQuota,
  postPengajuanInsert,
  riwayatListIzinQueryOptions,
} from "../../queries/pengajuanIzinQueryFn";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import api from "../../lib/api";
import Swal from "sweetalert2";
import { PengajuanIzinInsertRequest } from "../../types/requests/pengajuan-izin";
import LeaveCard from "../../components/CardRiwayat";
import MonthPicker from "../../components/MonthPicker";

// Define types for the form data
type FormData = {
  alasan: string;
  tanggal_awal: string;
  tanggal_akhir: string;
  keterangan: string;
  dokumen: FileList;
};

// Define the type for the file upload response
type FileUploadResponse = {
  filename: string;
};

export const Route = createFileRoute("/_authenticated/pengajuan-izin")({
  component: RouteComponent,

  loader: async ({ context }) => {
    const period = new Date().toISOString().slice(0, 6); // Default to current year-month (YYYY-MM)
    await context.queryClient.prefetchQuery(
      riwayatListIzinQueryOptions(period)
    );
  },
});

// File upload function
// File upload function for binary payload
const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const response = await api.post(
    "https://devcharisma.aurorasystem.co.id/tirta-wibawa-mukti/kepegawaian-api/files/upload/pengajuan_izin",
    file, // Send the file directly as the request body
    {
      headers: {
        "Content-Type": file.type, // Set the content type to the file's MIME type
      },
    }
  );

  return response.data; // Return the API response
};

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
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"Pengajuan" | "Riwayat">(
    "Pengajuan"
  );
  const currentPeriod = new Date().toISOString().slice(0, 7).replace("-", "");
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [tanggalAwal, setTanggalAwal] = useState<string>("");
  const [tanggalAkhir, setTanggalAkhir] = useState<string>("");
  const [fileName, setFileName] = useState<string>("Belum terpilih");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  const [akhirSisaKuota, setAkhirSisaKuota] = useState<string>("");
  const [isCutiSelected, setIsCutiSelected] = useState<boolean>(false);

  const year = selectedPeriod.slice(0, 4);
  const monthIndex = parseInt(selectedPeriod.slice(4, 6), 10) - 1; // Convert MM to index
  const formattedPeriod = `${monthsIndonesian[monthIndex]} ${year}`;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const alasan = watch("alasan");

  const {
    data: cutiQuotaData,
    isError,
    isLoading,
  } = useQuery<KuotaCutiResponse, Error>({
    queryKey: ["cutiQuota", alasan], // Unique key for the query
    queryFn: fetchCutiQuota,
    enabled: alasan === "CUTI", // Only fetch when `alasan` is "CUTI"
  });

  useEffect(() => {
    if (cutiQuotaData) {
      setAkhirSisaKuota(cutiQuotaData.akhir_sisa_kuota);
      setIsCutiSelected(true);
    }
  }, [cutiQuotaData]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching cuti quota");
      setAkhirSisaKuota("");
      setIsCutiSelected(false);
    }
  }, [isError]);

  useEffect(() => {
    if (alasan !== "CUTI") {
      setAkhirSisaKuota("");
      setIsCutiSelected(false);
    }
  }, [alasan]);

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setDate: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
  };

  //   const onSubmit: SubmitHandler<FormData> = (data) => {
  //     const formattedData = {
  //       ...data,
  //       tanggal_awal: formatDate(data.tanggal_awal),
  //       tanggal_akhir: formatDate(data.tanggal_akhir),
  //       dokumen: uploadedFileName,
  //     };
  //     console.log(formattedData); // Form data with formatted dates
  //   };

  const { data } = useSuspenseQuery(
    riwayatListIzinQueryOptions(selectedPeriod)
  );

  const queryClient = useQueryClient();

  const fileUploadMutation = useMutation<FileUploadResponse, Error, File>({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      setUploadedFileName(data.filename);
      console.log("File uploaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error uploading file:", error);
    },
  });

  const { mutate: pengajuanIzinInsert, isPending: isAbsenUploadPending } =
    useMutation({
      mutationFn: (data: any) => postPengajuanInsert(data),
      onSuccess: (data) => {
        console.log("Pengajuan Izin upload successful:", data);
        Swal.fire({
          icon: "success",
          title: "Pengajuan Izin Berhasil!",
          text: "Data berhasil diunggah.",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload();
        });
      },
      onError: (err: Error) => {
        console.error("Pengajuan Izin upload failed:", err.message);
        Swal.fire({
          icon: "error",
          title: "Pengajuan Izin Gagal!",
          text: `Terjadi kesalahan: ${err.message}`,
          confirmButtonColor: "#d33",
          confirmButtonText: "Coba Lagi",
        });
      },
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name); // Update the displayed file name
      fileUploadMutation.mutate(file); // Trigger the file upload mutation
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const formattedStartDate = format(
      new Date(data.tanggal_awal),
      "dd MMMM yyyy",
      {
        locale: id,
      }
    );
    const formattedEndDate = format(
      new Date(data.tanggal_akhir),
      "dd MMMM yyyy",
      {
        locale: id,
      }
    );

    // Map form data to the expected request structure
    const requestData: PengajuanIzinInsertRequest = {
      reason: data.alasan,
      description: data.keterangan,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      filename: uploadedFileName,
    };

    // Call the mutation
    pengajuanIzinInsert(requestData);
  };

  return (
    <div className="font-poppins relative h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-primary text-white shadow-md p-6 h-52 relative overflow-hidden">
        {/* Back Arrow Section */}
        <div className="absolute top-4 left-4 flex items-center space-x-4">
          <Link to="/lainnya">
            <img
              src="src/assets/ic_arrow_back_white.svg"
              alt="Back"
              width={30}
              height={30}
            />
          </Link>
          <p className="text-lg font-semibold">Pengajuan Izin</p>
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

        {/* Tabs */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around bg-primary pb-4">
          <button
            className={`px-6 py-2 rounded-t-lg relative transition-all duration-300 ${
              activeTab === "Pengajuan"
                ? "text-white -mb-[2px] font-bold"
                : "bg-primary text-white opacity-50 font-light"
            }`}
            onClick={() => setActiveTab("Pengajuan")}
          >
            Pengajuan
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg relative transition-all duration-300 ${
              activeTab === "Riwayat"
                ? "text-white -mb-[2px] font-bold"
                : "bg-primary text-white opacity-50 font-light"
            }`}
            onClick={() => setActiveTab("Riwayat")}
          >
            Riwayat
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {activeTab === "Pengajuan" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-md font-bold">Form Pengajuan Izin / Cuti</h2>

            {/* Alasan Izin */}
            <div>
              <label className="block font-semibold">Alasan Izin</label>
              <select
                {...register("alasan", { required: "Pilih alasan izin" })}
                className="border border-gray-300 rounded-2xl px-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue=""
              >
                <option value="" disabled>
                  -- Pilih --
                </option>
                {data?.form?.map((item: any) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.alasan && (
                <p className="text-red-500">{errors.alasan.message}</p>
              )}
            </div>

            {isCutiSelected && (
              <div>
                <label className="block font-semibold">Akhir Sisa Kuota</label>
                <input
                  type="text"
                  value={akhirSisaKuota}
                  readOnly
                  className="border border-gray-300 rounded-2xl px-4 py-4 w-full bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}

            {/* Tanggal Awal */}
            <div className="relative">
              <label className="block font-semibold">Tanggal Awal</label>
              <div className="relative">
                <input
                  type="date"
                  {...register("tanggal_awal", {
                    required: "Tanggal Awal Diperlukan",
                  })}
                  onChange={(e) => handleDateChange(e, setTanggalAwal)}
                  className="border border-gray-300 rounded-2xl px-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                />
                {!tanggalAwal && (
                  <span className="absolute left-4 top-4 text-gray-500 pointer-events-none">
                    Pilih tanggal
                  </span>
                )}
              </div>
              {errors.tanggal_awal && (
                <p className="text-red-500">{errors.tanggal_awal.message}</p>
              )}
            </div>

            {/* Tanggal Akhir */}
            <div className="relative">
              <label className="block font-semibold">Tanggal Akhir</label>
              <div className="relative">
                <input
                  type="date"
                  {...register("tanggal_akhir", {
                    required: "Tanggal Akhir Diperlukan",
                  })}
                  onChange={(e) => handleDateChange(e, setTanggalAkhir)}
                  className="border border-gray-300 rounded-2xl px-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                />
                {!tanggalAkhir && (
                  <span className="absolute left-4 top-4 text-gray-500 pointer-events-none">
                    Pilih tanggal
                  </span>
                )}
              </div>
              {errors.tanggal_akhir && (
                <p className="text-red-500">{errors.tanggal_akhir.message}</p>
              )}
            </div>

            {/* Keterangan */}
            <div>
              <label className="block font-semibold">Keterangan</label>
              <textarea
                {...register("keterangan", { required: "Masukkan keterangan" })}
                className="border border-gray-300 rounded-2xl px-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Masukkan Keterangan"
              />
              {errors.keterangan && (
                <p className="text-red-500">{errors.keterangan.message}</p>
              )}
            </div>

            {/* Dokumen Lampiran */}
            <div>
              <label className="block font-semibold">Dokumen Lampiran</label>
              <div className="relative w-full flex items-center border border-gray-300 rounded-2xl">
                <input
                  type="file"
                  {...register("dokumen")}
                  id="fileUpload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="flex items-center gap-2 px-4 py-3 w-full text-gray-400 flex-1 overflow-hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h9a2.25 2.25 0 002.25-2.25V12l-3-3z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <span
                      id="fileName"
                      className="block truncate text-ellipsis overflow-hidden whitespace-nowrap"
                      title={fileName} // Tooltip for full filename
                    >
                      {fileName || "Pilih File"}
                    </span>
                  </div>
                </div>
                <label
                  htmlFor="fileUpload"
                  className="bg-red-600 text-white px-4 py-3 rounded-r-2xl cursor-pointer hover:bg-red-700 text-center whitespace-nowrap"
                >
                  Pilih File
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-3 text-white bg-primary rounded-full hover:bg-red-700 focus:ring-2 focus:ring-red-500"
            >
              Kirim Pengajuan
            </button>
          </form>
        )}

        {activeTab === "Riwayat" && (
          <div>
            <h2 className="flex sm:justify-center text-sm sm:text-xl font-bold mb-4">
              Riwayat Pengajuan Izin
            </h2>

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
            <div className="space-y-4">
              {data.history.map((item: any) => (
                <LeaveCard
                  key={item.id} // Use the unique id as the key
                  reason={item.reason}
                  startDate={item.date.split(" - ")[0]} // Extract start date from the date range
                  endDate={item.date.split(" - ")[1]} // Extract end date from the date range
                  description={item.description}
                  attachmentUrl={item.file} // Pass the file URL as attachmentUrl
                  status={item.status}
                  onCancel={async () => {
                    try {
                      await deletePengajuanIzin(item.id);
                      console.log("Successfully deleted item:", item.id);

                      // ✅ Invalidate the same query used in `useSuspenseQuery`
                      queryClient.invalidateQueries({
                        queryKey: ["riwayatListIzin", selectedPeriod],
                      });
                    } catch (error) {
                      console.error("Failed to delete item:", error);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
