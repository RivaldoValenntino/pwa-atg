import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-poppins">
      <div className="p-6 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center">
            <img
              src="/assets/logo.svg"
              alt="Logo"
              width={160}
              height={160}
            />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Selamat Datang di aplikasi Aurora Absensi
        </h1>
        <div className="flex justify-center items-center mb-6">
          <img
            src="assets/ic_splash_screen.svg"
            alt="Calendar Illustration"
            width={300}
            height={300}
          />
        </div>

        <p className="text-gray-600 mb-6">
          Silahkan masuk untuk menggunakan aplikasi absen.
        </p>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="w-full bg-primary text-white py-3 rounded-3xl font-medium hover:bg-red-600 transition"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
