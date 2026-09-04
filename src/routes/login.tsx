import * as React from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form"; // ✅ Import React Hook Form
import api from "../lib/api";
import { LoginResponse } from "../types/responses/login";
import { useAuthStore } from "../store/auth-store";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import { ErrorResponse } from "../types/responses/error";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  beforeLoad: ({ context }) => {
    const token = context.auth.token;
    if (token && context.auth.validateToken()) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

type LoginFormInputs = {
  username: string;
  password: string;
};

function LoginComponent() {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = React.useState(false);

  // ✅ Use React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const { mutate, error } = useMutation({
    mutationFn: async (data: LoginFormInputs) => {
      const response = await api.post<LoginResponse>("/mobile-v2/login", data);
      return response.data;
    },
    onSuccess: async (data) => {
      auth.setToken(data.token);
      auth.setUser(data.user);
      setIsNavigating(true);

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Anda akan dialihkan ke dashboard.",
        timer: 1500,
        showConfirmButton: false,
      });

      await navigate({ to: "/dashboard" });
      setIsNavigating(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error.response?.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text:
            error.response.data?.message ||
            "Periksa kembali username dan password Anda!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Terjadi Kesalahan",
          text: "Login Failed! Please check your credentials.",
        });
      }
      console.log(error);
    },
  });

  // ✅ Handle form submission
  const onSubmit = (data: LoginFormInputs) => {
    mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-poppins">
      <div className="max-w-md p-6 mb-4 text-center">
        {/* Header Section */}
        <div className="relative flex flex-row items-center justify-between my-4">
          <div className="flex-1">
            <a href="/">
              <img
                src="src/assets/ic_arrow_back.svg"
                className="self-start"
                alt="Back"
                width={30}
                height={30}
              />
            </a>
          </div>

          <div className="flex-1 text-center">
            <p className="text-lg">Masuk Akun</p>
          </div>

          <div className="flex-1"></div>
        </div>

        {/* Login Illustration */}
        <div className="flex items-center justify-center mb-6">
          <img
            src="src/assets/ic_masuk_akun.svg"
            alt="Login"
            width={200}
            height={200}
          />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Masuk ke Aplikasi
        </h1>
        <p className="px-2 mb-2 text-sm text-gray-600">
          Masukan informasi pengguna Anda di bawah ini untuk melanjutkan
        </p>

        {/* ✅ Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-4">
          {/* {error && (
            <p className="my-2 mb-4 text-left text-center text-primary ">
              Login gagal. Coba lagi.
            </p>
          )} */}

          {/* Username Input */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="flex mb-1 text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username", { required: "Username is required" })} // ✅ Register input
              placeholder="Username"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-none"
            />
            {errors.username && (
              <p className="my-2 text-sm text-left text-primary ">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="flex mb-1 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukan Password"
              {...register("password", { required: "Password is required" })} // ✅ Register input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-none"
            />
            {errors.password && (
              <p className="my-2 text-sm text-left text-primary ">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 font-medium text-white transition bg-primary rounded-3xl hover:bg-red-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Masuk"}
          </button>

          {/* Forgot Password */}
          {/* <p className="mt-4 text-sm text-gray-500">
            <a href="#" className="text-primary hover:underline">
              Lupa Password?
            </a>
          </p> */}
        </form>
      </div>
    </div>
  );
}

export default LoginComponent;
