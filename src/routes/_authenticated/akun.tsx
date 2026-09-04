import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import BottomNavigation from "../../components/BottomNavigation";
import { useAuthStore } from "../../store/auth-store";

export const Route = createFileRoute("/_authenticated/akun")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();
  const auth = useAuthStore();
  const navigate = useNavigate();
  const router = useRouter();
  return (
    <div className="font-sans">
      {/* Header Section */}
      <div className="bg-primary text-white rounded-b-2xl shadow-md p-6 mb-6 h-64 flex flex-col items-center justify-center lg:h-64">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-lg font-semibold">Informasi Akun</p>
          <div className="w-24 h-24 aspect-square rounded-full overflow-hidden shadow-md">
            <img
              src={user?.emp_photo || "assets/ic_akun_avatar.svg"}
              alt="Profile Avatar"
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />
          </div>
          <p className="text-lg font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[80vw]">
            {user?.name}
          </p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="absolute bg-gray-100 w-full h-[50%] p-6 rounded-2xl -mt-12">
        <p className="text-lg font-semibold text-gray-700 mb-4">Pengaturan</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <img
                src="assets/ic_create-outline.svg"
                alt="Edit Icon"
                width={24}
                height={24}
              />
              <p className="text-sm font-medium text-gray-800">Ubah Password</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <img
                src="assets/ic_help-circle-outline.svg"
                alt="About Icon"
                width={24}
                height={24}
              />
              <p className="text-sm font-medium text-gray-800">Tentang</p>
            </div>
          </div>
        </div>
        {/* Logout Button */}
        <div className="flex justify-center mt-24">
          <button
            onClick={async () => {
              auth.logout();
              router.invalidate();
              await navigate({ to: "/login" });
              window.location.reload();
            }}
            className="w-11/12 bg-primary text-white py-3 rounded-3xl font-medium hover:bg-red-600 transition"
          >
            Keluar Akun
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
