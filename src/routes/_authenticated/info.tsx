import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth-store";
import BottomNavigation from "../../components/BottomNavigation";

export const Route = createFileRoute("/_authenticated/info")({
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
    to: "/riwayat-absen",
    imgSrc: "assets/ic_riwayat_absen.svg",
    title: "Lihat Riwayat Absen",
    description: "Cek semua data kehadiran Anda",
  },
  // {
  //   to: "/informasi-data-diri",
  //   imgSrc: "assets/ic_data_pribadi.svg",
  //   title: "Data Pribadi",
  //   description: "Menampilkan data pribadi pegawai",
  // },
  // {
  //   to: "/pengumuman",
  //   imgSrc: "assets/ic_pengumuman_perusahaan.svg",
  //   title: "Pengumuman Perusahaan",
  //   description: "Menampilkan informasi yang berkaitan dengan pegawai",
  // },
  // {
  //   to: "/absen-staff-terkait",
  //   imgSrc: "assets/ic_riwayat_absen.svg",
  //   title: "Absen Staff Terkait",
  //   description: "Informasi absen staff",
  // },
];

function RouteComponent() {
  const { user } = useAuthStore();

  console.log(user);

  const filteredNavigationItems = navigationItems.filter((item) => {
    if (item.to === "/absen-staff-terkait") {
      return user ? user.position_level > 4 : false; // Only check if user is defined
    }
    return true;
  });

  return (
    <div className="font-poppins relative h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-primary text-white rounded-b-2xl shadow-md p-6 h-52 relative">
        {/* Back Arrow Section */}
        <div className="absolute sm:top-4 sm:left-4 left-28 flex items-center space-x-4">
          <p className="text-lg">Informasi Pegawai</p>
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
        {/* Navigation Card */}
        <Link
          to="/riwayat-absen"
          className="block bg-white shadow-md rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        >
          <img
            src="assets/ic_riwayat_absen.svg"
            alt="Go"
            width={80}
            height={80}
          />
          <div className="space-y-2">
            <p className="text-md font-bold text-gray-800">
              Lihat Riwayat Absen
            </p>
            <p className="text-xs text-gray-600">
              Cek semua data kehadiran Anda
            </p>
          </div>
        </Link>
      </div>

      <div className="absolute bg-gray-100 w-full h-[70%] p-6 rounded-t-2xl -mt-16">
        {filteredNavigationItems.map((item, index) => (
          <div key={index} className="mb-4">
            <NavigationCard {...item} />
          </div>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}
