import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { CheckAbsenLemburRequest } from "../types/requests/check-absen-lembur";
import {
  postAbsenLemburUpload,
  postCheckAbsenLembur,
  postUploadPhotoLembur,
} from "../queries/absenLemburQueryFn";
import { useMutation } from "@tanstack/react-query";
import Webcam from "react-webcam";
import { useAuthStore } from "../store/auth-store";

interface AbsenLemburCardProps {
  date: string;
  currentTime: {
    hours: string;
    minutes: string;
    seconds: string;
  };
}

const AbsenLemburCard: React.FC<AbsenLemburCardProps> = ({
  date,
  currentTime,
}) => {
  const { token } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [absenType, setAbsenType] = useState<0 | 1 | null>(null); // 1: Masuk, 0: Pulang
  const [location, setLocation] = useState<"luar" | "dalam" | null>(null); // 1: Kantor, 0: Luar
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>("0");
  const [longitude, setLongitude] = useState<string>("0");
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<string | null>(null);
  const [filenames, setFilenames] = useState<{
    filename_image: string;
    filename_location: string;
  } | null>(null);
  const [currentStep, setCurrentStep] = useState<"face" | "location">("face"); // Track current step

  const webcamRef = useRef<Webcam>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraDeviceId, setCameraDeviceId] = useState<string | undefined>(
    undefined
  );

  const { mutate: checkAbsenLembur, isPending: isCheckPending } = useMutation({
    mutationFn: (data: CheckAbsenLemburRequest) => postCheckAbsenLembur(data),
    onSuccess: (data) => {
      console.log("Check absen successful:", data);

      setShowModal(false);
      setShowCameraModal(true);
      setCurrentStep("face");

      // Swal.fire({
      //   icon: "success",
      //   title: "Check Absen Berhasil",
      //   text: "Check absen lembur berhasil dilakukan!",
      //   confirmButtonText: "OK",
      //   confirmButtonColor: "#28a745",
      // });
    },
    onError: (err: Error) => {
      console.error("Check Absen failed:", err.message);

      Swal.fire({
        icon: "error",
        title: "Absen Gagal",
        text: err.message,
        confirmButtonText: "OK",
        confirmButtonColor: "#B90101",
      });
    },
  });

  // Mutation for uploading the photo
  const { mutate: uploadPhotoLembur, isPending: isUploadPending } = useMutation(
    {
      mutationFn: (formData: FormData) => postUploadPhotoLembur(formData),
      onSuccess: (data) => {
        console.log("Upload successful:", data);

        // Use the correct field from the response
        const filenames = {
          filename_image: data.filename_image,
          filename_location: data.filename_location,
        };

        setFilenames(filenames); // Save the filenames for the next API call
        handleAbsenUpload(filenames); // Call the absen-upload API
      },
      onError: (err: Error) => {
        console.error("Upload failed:", err.message);
        alert(`Upload foto gagal: ${err.message}`);
      },
    }
  );

  const { mutate: absenLemburUpload, isPending: isAbsenUploadPending } =
    useMutation({
      mutationFn: (data: any) => postAbsenLemburUpload(data),
      onSuccess: (data) => {
        console.log("Absen upload successful:", data);
        Swal.fire({
          icon: "success",
          title: "Absen berhasil!",
          text: "Data berhasil diunggah.",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        }).then(() => {
          setShowCameraModal(false);
          window.location.reload();
        });
      },
      onError: (err: Error) => {
        console.error("Absen upload failed:", err.message);
        Swal.fire({
          icon: "error",
          title: "Absen upload gagal!",
          text: `Terjadi kesalahan: ${err.message}`,
          confirmButtonColor: "#d33",
          confirmButtonText: "Coba Lagi",
        });
      },
    });

  const handleLocationSelect = async (selectedLocation: "luar" | "dalam") => {
    setLocation(selectedLocation);

    let lat = "0";
    let long = "0";

    // if (selectedLocation === 1) {
    try {
      const position = await getCurrentPosition();
      lat = position.coords.latitude.toString();
      long = position.coords.longitude.toString();
      setGeolocationError(null);
    } catch (err) {
      setGeolocationError("Gagal mendapatkan lokasi perangkat.");
      return;
    }
    // }

    setLatitude(lat);
    setLongitude(long);

    const data: CheckAbsenLemburRequest = {
      type: absenType!,
      is_location: selectedLocation,
      latitude: lat, // Use updated lat
      longitude: long, // Use updated long
    };

    checkAbsenLembur(data);
  };

  const handleAbsenClick = (type: 0 | 1) => {
    setAbsenType(type);
    setShowModal(true); // Show the modal for location selection
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    console.log("Captured Image Src:", imageSrc); // Debugging

    if (!imageSrc) {
      console.error("Failed to capture image.");
      return;
    }

    if (currentStep === "face") {
      console.log("Before setting Captured Face:", capturedFace); // Debugging
      setCapturedFace(imageSrc);
      setCurrentStep("location"); // Always proceed to location step
    } else if (currentStep === "location") {
      setCapturedLocation(imageSrc);
      console.log("Captured Location:", imageSrc);

      // Close modal after both images are captured
      setShowCameraModal(false);
    }
  }, [currentStep]);

  const handleUploadPhoto = useCallback(() => {
    if (!capturedFace) {
      alert("Silakan ambil foto wajah terlebih dahulu.");
      return;
    }

    if (!capturedLocation) {
      alert("Silakan ambil foto lokasi terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    const faceFile = dataURLtoFile(capturedFace, "face.jpg");
    console.log("Processed Face File:", faceFile);

    if (!faceFile) {
      console.error("Failed to process face image");
      alert("Terjadi kesalahan saat memproses foto wajah.");
      return;
    }

    const locationFile = dataURLtoFile(capturedLocation, "location.jpg");

    if (!locationFile) {
      console.error("Failed to process location image");
      alert("Terjadi kesalahan saat memproses foto lokasi.");
      return;
    }

    // Append both images to FormData
    formData.append("filename_image", faceFile);
    formData.append("filename_location", locationFile);
    formData.append("type", absenType?.toString() || "");

    uploadPhotoLembur(formData);
  }, [capturedFace, capturedLocation, absenType, uploadPhotoLembur]);

  useEffect(() => {
    if (capturedFace && capturedLocation) {
      handleUploadPhoto();
    }
  }, [capturedFace, capturedLocation, location, handleUploadPhoto]);

  const handleAbsenUpload = (filenames: {
    filename_image: string | null;
    filename_location: string | null;
  }) => {
    const data = {
      latitude: latitude,
      longitude: longitude,
      filename_face: filenames.filename_image || "",
      filename_location: filenames.filename_location,
      type: absenType?.toString() || "",
      location: location?.toString() || "",
      device_token: token || "''",
      is_pwa: 1,
    };

    console.log("Sending Absen Upload:", data);
    absenLemburUpload(data);
  };

  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Get device location using Geolocation API
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation tidak didukung oleh browser ini."));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  const formatDateIndonesian = (date: string) => {
    const dateObj = new Date(date);
    const day = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
    const formattedDate = dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return { day, date: formattedDate };
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white shadow-md p-4 rounded-xl w-full max-w-md">
        <h2 className="mb-6 text-lg sm:text-2xl font-bold text-center">
          Absensi Lembur
        </h2>
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm sm:text-lg font-bold">
            <p>{formatDateIndonesian(date).day},</p>
            <p>{formatDateIndonesian(date).date}</p>
          </div>
          <div className="flex items-center space-x-2">
            {Object.values(currentTime).map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg bg-muted">
                  <span className="text-md sm:text-lg font-normal">{unit}</span>
                </div>
                {index < 2 && (
                  <span className="text-xl sm:text-lg font-bold mx-1">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Absen Masuk & Absen Pulang Button */}
        <div className="flex rounded-xl overflow-hidden">
          <button
            onClick={() => handleAbsenClick(1)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-white sm:text-base text-xs bg-primary hover:bg-red-800 transition"
          >
            <img
              src="src/assets/ic_enter_outline.svg"
              alt="Absen Masuk Lembur"
            />
            Absen Masuk
          </button>
          <button
            onClick={() => handleAbsenClick(0)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-500 sm:text-base text-xs bg-muted hover:bg-gray-300 transition"
          >
            <img src="src/assets/ic_sign_out.svg" alt="Absen Keluar Lembur" />
            Absen Pulang
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                absenType === 1
                  ? "src/assets/ic_lokasi_absen_masuk.svg"
                  : "src/assets/ic_lokasi_absen_keluar.svg"
              }
              alt="Lokasi Absen"
              className="mx-auto mb-4"
            />
            <h2 className="text-lg font-bold mb-4 text-center">
              Konfirmasi Lokasi Absen
            </h2>
            <h3 className="text-center mb-4">
              {absenType === 1
                ? "Dimana kamu melakukan Absen Masuk?"
                : "Dimana kamu melakukan Absen Pulang?"}
            </h3>
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleLocationSelect("dalam")}
                className="bg-[#B90101] text-white px-4 py-2 rounded-2xl w-full"
              >
                Absen di Dalam Kantor
              </button>
              <button
                onClick={() => handleLocationSelect("luar")}
                className="bg-[#550003] text-white px-4 py-2 rounded-2xl w-full"
              >
                Absen di Luar Kantor
              </button>
            </div>
            {geolocationError && (
              <p className="text-red-500 mt-4">{geolocationError}</p>
            )}
          </div>
        </div>
      )}

      {showCameraModal && (
        <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center">
              {currentStep === "face" && "Ambil Foto Wajah"}
              {currentStep === "location" && "Ambil Foto Lokasi"}
            </h2>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full mb-4"
              videoConstraints={{
                deviceId: currentStep === "face" ? undefined : cameraDeviceId, // Use back camera for location and letter
                facingMode: currentStep === "face" ? "user" : "environment", // Fallback if deviceId is not available
              }}
            />
            <h3 className="text-center text-[#828282] mb-2">
              {currentStep === "face" && "Pastikan wajah kamu terlihat jelas."}
              {currentStep === "location" && "Pastikan lokasi terlihat jelas."}
            </h3>
            <button
              onClick={capturePhoto}
              className="text-white px-6 py-3 rounded-2xl mb-4 flex items-center justify-center mx-auto"
            >
              <img
                src="src/assets/ic_button_camera.svg"
                alt="Capture Photo"
                className="w-24 h-24"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenLemburCard;
