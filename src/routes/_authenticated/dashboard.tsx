import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth-store";
import { absenInfoQueryOptions } from "../../queries/absenInfoQuery";
import { useSuspenseQuery } from "@tanstack/react-query";
import BottomNavigation from "../../components/BottomNavigation";
import AbsenCard from "../../components/Absen";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { listenForegroundMessage, requestPermissionAndGenerateToken } from "../../firebase";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(absenInfoQueryOptions());
  },
});

function RouteComponent() {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const router = useRouter();
  const saveFcmToken = async (token: string) => {
    const oldToken = localStorage.getItem("fcm_token");

    if (oldToken === token) {
      console.log("FCM token sudah pernah disimpan, skip save");
      return;
    }

    try {
      const response = await api.post(
        "/mobile-v2/save-device-token",
        {
          device_token: token,
          pgw_id: auth.user?.emp_id,
        },
        {
          headers: {
            token: auth.token,
          },
        }
      );

      console.log("Save FCM token response:", response.data);

      localStorage.setItem("fcm_token", token);
    } catch (error) {
      console.error("Gagal menyimpan FCM token:", error);
      throw error;
    }
  };
  useEffect(() => {
    const initFcmToken = async () => {
      try {
        await listenForegroundMessage();

        if (!("Notification" in window)) {
          console.log("Browser tidak support Notification");
          return;
        }

        if (!auth.token) {
          console.log("Auth token belum ada, skip FCM");
          return;
        }

        // Kalau permission masih default, ini akan munculin popup izinkan notifikasi.
        // Kalau sudah granted, tidak akan popup lagi.
        // Kalau denied, tidak bisa dipaksa lagi dari JS.
        if (
          Notification.permission === "granted" ||
          Notification.permission === "default"
        ) {
          const token = await requestPermissionAndGenerateToken();

          if (token) {
            await saveFcmToken(token);
          }
        } else {
          console.log("Notification permission denied");
        }
      } catch (error) {
        console.error("Init FCM token error:", error);
      }
    };

    initFcmToken();
  }, [auth.token]);
  const [greeting, setGreeting] = useState("");

  const [currentTime, setCurrentTime] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime({
        hours: String(now.getHours()).padStart(2, "0"),
        minutes: String(now.getMinutes()).padStart(2, "0"),
        seconds: String(now.getSeconds()).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { data } = useSuspenseQuery(absenInfoQueryOptions());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Pagi!");
    } else if (hour >= 12 && hour < 15) {
      setGreeting("Siang!");
    } else if (hour >= 15 && hour < 18) {
      setGreeting("Sore!");
    } else {
      setGreeting("Malam!");
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-100 font-poppins pb-20">
      <div className="h-48 p-6 mb-6 text-white shadow-md bg-primary rounded-b-2xl sm:flex sm:flex-col sm:items-center sm:justify-center lg:h-64">
        <div className="flex items-center mb-4 ">
          <div className="flex items-center justify-center w-12 h-12 mr-4 text-red-500 bg-white rounded-full">
            <img src="/assets/logo.svg" alt="Logo" />
          </div>
          <div>
            <p className="text-xs">Halo, Selamat {greeting}</p>
            <h2 className="text-lg font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[65vw]">
              {data.name}
            </h2>
          </div>
        </div>
        <div className="flex flex-row items-center justify-around -mt-2">
          {/* Left Side: Icon with Text */}
          <div className="flex flex-row items-center">
            <img
              src="assets/ic_jabatan_dashboard.svg"
              alt="Icon"
              className="mr-2" // Add spacing between the icon and the text
            />
            <p className="text-[13px]">
              {data.position} {data.department}
            </p>
          </div>

          {/* Divider */}
          <span className="mx-2 text-lg font-thin">|</span>

          {/* Right Side: Text */}
          <div className="flex flex-row items-center">
            <img
              src="assets/ic_cabang_dashboard.svg"
              alt="Icon"
              className="mr-2" // Add spacing between the icon and the text
            />
            <p className="text-[13px]">{data.office}</p>
          </div>
        </div>
      </div>
      <div className="container px-6 py-4 mx-auto sm:px-6 md:px-8">
        <AbsenCard
          date={new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          currentTime={currentTime}
          is_absen_in={data.is_absen_in}
          is_absen_out={data.is_absen_out}
        />
        <h2 className="flex mt-4 text-sm font-bold sm:justify-center sm:text-xl">
          Riwayat Absen Hari ini
        </h2>
        <div className="flex gap-4 my-2 text-sm font-bold sm:justify-center sm:text-xl">
          <h2 className="text-sm font-semibold text-gray-800">
            Total Potongan Bulan{" "}
            {new Date().toLocaleString("id-ID", { month: "long" })} :
          </h2>
          <span className="text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100">
            Rp {parseInt(data.total_pot).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="w-full max-w-md p-4 mx-auto mt-4 bg-white rounded-lg shadow-md">
          <div className="grid gap-3 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Status Absensi :
              </h2>
              <span className="text-white text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-500">
                {data.absent_status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Potongan Hari Ini :
              </h2>
              <span className="text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100">
                Rp {parseInt(data.potongan).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="flex mt-6 space-x-4">
            {/* Left side: Jam Masuk */}
            <div className="flex flex-row items-center w-48">
              <img
                src={data.inphoto}
                alt="Foto Masuk"
                className="object-cover w-16 h-16 rounded-lg bg-muted"
              />
              <div className="flex flex-col ml-1 sm:ml-4">
                <h3 className="text-[11px] sm:text-sm font-semibold text-textGray mb-1 sm:mb-2">
                  Jam Masuk:
                </h3>
                <p className="text-textGray">{data.inpresent}</p>
              </div>
            </div>

            {/* Right side: Jam Keluar */}
            <div className="flex flex-row items-center w-48">
              <img
                src={data.outphoto}
                alt="Foto Keluar"
                className="object-cover w-16 h-16 rounded-lg bg-muted"
              />
              <div className="flex flex-col ml-1 sm:ml-4">
                <h3 className="text-[11px] sm:text-sm font-semibold text-textGray mb-1 sm:mb-2">
                  Jam Keluar:
                </h3>
                <p className="text-textGray">{data.outpresent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {/* <div className="mt-2">
          <button
            onClick={async () => {
              auth.logout();
              router.invalidate();
              await navigate({ to: "/login" });
            }}
          >
            Logout
          </button>
        </div> */}
      <BottomNavigation />
    </div>
  );
}
