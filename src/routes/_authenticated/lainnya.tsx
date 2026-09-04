import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth-store";
import BottomNavigation from "../../components/BottomNavigation";

export const Route = createFileRoute("/_authenticated/lainnya")({
  component: RouteComponent,
});

type NavigationCardProps = {
  to: string;
  imgSrc: string;
  title: string;
  description: string;
};

const NavigationCard: React.FC<NavigationCardProps> = ({
  to,
  imgSrc,
  title,
  description,
}) => {
  return (
    <Link
      to={to}
      className="block bg-white shadow-md rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
    >
      <img src={imgSrc} alt={title} width={80} height={80} />
      <div className="space-y-2 text-right">
        <p className="text-md font-bold text-gray-800">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </Link>
  );
};

const navigationItems = [
  {
    to: "/absen-lembur",
    imgSrc: "assets/ic_riwayat_absen.svg",
    title: "Absen Lembur",
    description: "Lakukan absen lembur pegawai",
  },
  // {
  //   to: "/pengajuan-izin",
  //   imgSrc: "assets/ic_pengajuan_izin.svg",
  //   title: "Pengajuan Izin",
  //   description: "Ajukan proses izin pegawai",
  // },
];

function RouteComponent() {
  const { user } = useAuthStore();

  return (
    <div className="font-poppins relative h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-primary text-white rounded-b-2xl shadow-md p-6 h-52 relative">
        {/* Back Arrow Section */}
        <div className="absolute  left-28 flex items-center text-center space-x-4">
          <p className="text-lg">Transaksi Lainnya</p>
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
              <p className="text-xl font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[65vw]">
                {user?.name}
              </p>

              <p className="text-[13px] font-light text-gray-100">
                NUP : {user?.nup}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Section */}

      <div className="absolute bg-gray-100 w-full h-[70%] p-6 rounded-t-2xl -mt-16">
        {navigationItems.map((item, index) => (
          <div key={index} className="mb-4">
            <NavigationCard {...item} />
          </div>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}
