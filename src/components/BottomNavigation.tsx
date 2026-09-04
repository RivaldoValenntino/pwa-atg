import { Link, useRouter } from "@tanstack/react-router";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "/assets/ic_dashboard.svg",
    activeIcon: "/assets/ic_dashboard_active.svg",
  },
  {
    href: "/info",
    label: "Info",
    icon: "/assets/ic_info_pegawai.svg",
    activeIcon: "/assets/ic_info_pegawai_active.svg",
  },
  // {
  //   href: "/lainnya",
  //   label: "Lainnya",
  //   icon: "/assets/ic_lainnya.svg",
  //   activeIcon: "/assets/ic_lainnya_active.svg",
  // },
  {
    href: "/akun",
    label: "Akun",
    icon: "/assets/ic_akun.svg",
    activeIcon: "/assets/ic_akun_active.svg",
  },
];

const BottomNavigation = () => {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <div className="fixed bottom-0 w-full h-16 bg-white flex justify-around items-center shadow-lg text-xs font-poppins">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="flex flex-col items-center justify-center gap-1"
        >
          <img
            src={currentPath === item.href ? item.activeIcon : item.icon}
            alt={`${item.label} Icon`}
            className="w-6 h-6" // Ensure consistent icon size
          />
          <span
            className={`text-[10px] font-medium ${currentPath === item.href ? "text-primary" : "text-gray-500"
              }`}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNavigation;
