import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckAbsenRequest } from "../types/requests/check-absen";
import { useAuthStore } from "../store/auth-store";
import {
  postCheckAbsen,
  postUploadPhoto,
  postAbsenUpload,
  getRefKelainan,
} from "../queries/absenQueryFn";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import * as faceapi from "face-api.js";
import LoadingOverlay from "./LoadingOverlay";

interface AbsenCardProps {
  date: string;
  currentTime: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  is_absen_in: number;
  is_absen_out: number;
  potongan?: string;
}

const AbsenCard: React.FC<AbsenCardProps> = ({
  date,
  currentTime,
  is_absen_in,
  is_absen_out,
}) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isFaceScanActive, setIsFaceScanActive] = useState<boolean>(false);

  const { token } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [absenType, setAbsenType] = useState<0 | 1 | null>(null); // 1: Masuk, 0: Pulang
  const [location, setLocation] = useState<0 | 1 | null>(null); // 1: Kantor, 0: Luar
  const [latitude, setLatitude] = useState<string>("0");
  const [longitude, setLongitude] = useState<string>("0");
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<string | null>(null);
  const [capturedLetter, setCapturedLetter] = useState<string | null>(null);
  const [filenames, setFilenames] = useState<{
    filename_image: string;
    filename_location: string;
    filename_letter: string;
  } | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "face" | "location" | "letter"
  >("face"); // Track current step
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [showKelainanModal, setShowKelainanModal] = useState<boolean>(false);
  const [kelainanOptions, setKelainanOptions] = useState<any[]>([]); // Store fetched kelainan options
  const [selectedKelainan, setSelectedKelainan] = useState<string | null>(null);
  const [kelainanType, setKelainanType] = useState<string | undefined>(
    undefined
  );

  const webcamRef = useRef<Webcam>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraDeviceId, setCameraDeviceId] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (!isFaceScanActive) return;
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
    };

    loadModels();
  }, [isFaceScanActive]);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const cameras = mediaDevices.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(cameras);

        // Find the back camera (usually labeled "environment" or "back")
        const backCamera = cameras.find(
          (camera) =>
            camera.label.toLowerCase().includes("back") ||
            camera.label.toLowerCase().includes("environment")
        );

        if (backCamera) {
          setCameraDeviceId(backCamera.deviceId);
        }
      } catch (err) {
        console.error("Failed to enumerate devices:", err);
      }
    };

    getCameras();
  }, []);

  // Switch camera based on current step
  useEffect(() => {
    if (currentStep === "location" || currentStep === "letter") {
      // Use the back camera for location and letter steps
      if (cameraDeviceId) {
        console.log("Switching to back camera:", cameraDeviceId);
      } else {
        console.warn("Back camera not found. Using default camera.");
      }
    } else {
      // Use the default (front) camera for the face step
      console.log("Switching to default (front) camera.");
    }
  }, [currentStep, cameraDeviceId]);
  useEffect(() => {
    if (
      !showCameraModal ||
      !modelsLoaded ||
      currentStep !== "face" ||
      !isFaceScanActive
    )
      return;

    const interval = setInterval(async () => {
      if (!webcamRef.current || !canvasRef.current) return;

      const video = webcamRef.current.video as HTMLVideoElement;
      const canvas = canvasRef.current;

      if (!video || video.readyState !== 4 || video.videoWidth === 0) {
        return;
      }

      // FIX untuk iOS: gunakan display dimensions
      const displayWidth = video.offsetWidth;
      const displayHeight = video.offsetHeight;

      // Set canvas size sesuai display size
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          })
        )
        .withFaceExpressions();

      if (detection) {
        // FIX: Scale detection ke display dimensions
        const scaleX = displayWidth / video.videoWidth;
        const scaleY = displayHeight / video.videoHeight;

        const resized = faceapi.resizeResults(detection, {
          width: displayWidth,
          height: displayHeight,
        });

        faceapi.draw.drawDetections(canvas, [resized]);
        setIsSmiling(resized.expressions.happy > 0.7);
      } else {
        setIsSmiling(false);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [showCameraModal, modelsLoaded, currentStep]);

  const fetchKelainanOptions = async (type?: string) => {
    try {
      const data = await getRefKelainan(type || "");
      console.log("Fetched Kelainan Options:", data); // Log the response
      setKelainanOptions(data); // Store the fetched kelainan options
    } catch (err) {
      console.error("Failed to fetch kelainan options:", err);
      alert("Gagal mengambil data kelainan.");
    }
  };

  // Mutation for handling the API call
  const { mutate: checkAbsen, isPending: isCheckPending } = useMutation({
    mutationFn: (data: CheckAbsenRequest) => postCheckAbsen(data),
    onSuccess: (data, variables) => {
      console.log("Check absen successful:", data);
      console.log("Is Late:", data.is_late);
      if (data.is_active_face_scan == "1") {
        setIsFaceScanActive(true);
      } else {
        setIsFaceScanActive(false);
      }
      if (data.is_late === "1") {
        const type =
          variables.location === 0
            ? variables.type === 1
              ? "luar-masuk"
              : "luar-pulang"
            : undefined;
        fetchKelainanOptions(type); // Fetch kelainan options
        setShowKelainanModal(true); // Show the kelainan modal
        setKelainanType(type);
      } else {
        setShowModal(false); // Close the location modal
        setShowCameraModal(true); // Open the camera modal
        setCurrentStep("face"); // Start with face capture
      }
    },

    onError: (err: Error) => {
      console.error("Absen failed:", err.message);
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
  const { mutate: uploadPhoto, isPending: isUploadPending } = useMutation({
    mutationFn: (formData: FormData) => postUploadPhoto(formData),
    onSuccess: (data) => {
      console.log("Upload successful:", data);

      // Use the correct field from the response
      const filenames = {
        filename_image: data.filename_image,
        filename_location: data.filename_location,
        filename_letter: data.filename_letter,
      };

      setFilenames(filenames); // Save the filenames for the next API call
      handleAbsenUpload(filenames); // Call the absen-upload API
    },
    onError: (err: Error) => {
      console.error("Upload failed:", err.message);
      alert(`Upload foto gagal: ${err.message}`);
    },
  });

  // Mutation for absen-upload API
  const { mutate: absenUpload, isPending: isAbsenUploadPending } = useMutation({
    mutationFn: (data: any) => postAbsenUpload(data),
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

  // Handle Absen button click
  const handleAbsenClick = (type: 0 | 1) => {
    setAbsenType(type);
    setShowModal(true); // Show the modal for location selection
  };

  // Handle photo upload
  // Declare handleUploadPhoto first
  // const capturePhoto = useCallback(() => {
  //   const imageSrc = webcamRef.current?.getScreenshot();
  //   console.log("Captured Image Src:", imageSrc); // Debugging

  //   if (imageSrc) {
  //     if (currentStep === "face") {
  //       console.log("Before setting Captured Face:", capturedFace); // Debugging
  //       setCapturedFace(imageSrc);

  //       if (location === 1) {
  //         setShowCameraModal(false);
  //       } else {
  //         setCurrentStep("location");
  //       }
  //     } else if (currentStep === "location") {
  //       setCapturedLocation(imageSrc);
  //       console.log("Captured Location:", imageSrc);
  //       setCurrentStep("letter");
  //     } else if (currentStep === "letter") {
  //       setCapturedLetter(imageSrc);
  //       console.log("Captured Letter:", imageSrc);
  //       setShowCameraModal(false);
  //     }
  //   } else {
  //     console.error("Failed to capture image.");
  //   }
  // }, [currentStep, location]);
  const capturePhoto = useCallback(() => {
    if (currentStep === "face" && isFaceScanActive && !isSmiling) {
      Swal.fire({
        icon: "warning",
        title: "Belum Senyum 🙂",
        text: "Silakan senyum dulu sebelum mengambil foto wajah.",
        confirmButtonColor: "#B90101",
      });
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      alert("Gagal mengambil foto.");
      return;
    }

    if (currentStep === "face") {
      setCapturedFace(imageSrc);
      setIsSmiling(false);

      if (location === 1) {
        setShowCameraModal(false);
      } else {
        setCurrentStep("location");
      }
    } else if (currentStep === "location") {
      setCapturedLocation(imageSrc);
      setCurrentStep("letter");
    } else if (currentStep === "letter") {
      setCapturedLetter(imageSrc);
      setShowCameraModal(false);
    }
  }, [currentStep, isSmiling, location, isFaceScanActive]);

  const handleUploadPhoto = useCallback(() => {
    if (!capturedFace) {
      alert("Silakan ambil foto wajah terlebih dahulu.");
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

    formData.append("filename_image", faceFile);
    formData.append("type", absenType?.toString() || "");

    if (location === 0) {
      if (!capturedLocation || !capturedLetter) {
        alert("Silakan ambil foto lokasi dan surat terlebih dahulu.");
        return;
      }

      const locationFile = dataURLtoFile(capturedLocation, "location.jpg");
      const letterFile = dataURLtoFile(capturedLetter, "letter.jpg");

      if (!locationFile || !letterFile) {
        console.error("Failed to process location or letter image");
        alert("Terjadi kesalahan saat memproses foto lokasi atau surat.");
        return;
      }

      formData.append("filename_location", locationFile);
      formData.append("filename_letter", letterFile);
    }

    uploadPhoto(formData);
  }, [
    capturedFace,
    capturedLocation,
    capturedLetter,
    location,
    absenType,
    uploadPhoto,
  ]);

  useEffect(() => {
    if (capturedFace && location === 1) {
      handleUploadPhoto();
    } else if (
      capturedFace &&
      capturedLocation &&
      capturedLetter &&
      location === 0
    ) {
      handleUploadPhoto();
    }
  }, [
    capturedFace,
    capturedLocation,
    capturedLetter,
    location,
    handleUploadPhoto,
  ]);

  // Handle location selection
  const handleLocationSelect = async (selectedLocation: 0 | 1) => {
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

    const data: CheckAbsenRequest = {
      type: absenType!,
      location: selectedLocation,
      latitude: lat, // Use updated lat
      longitude: long, // Use updated long
    };

    checkAbsen(data);
  };

  // const handleLocationSelect = async (selectedLocation: 0 | 1) => {
  //   setLocation(selectedLocation);

  //   // Static latitude and longitude
  //   const lat = "-6.778739706289086";
  //   const long = "107.4883826256423";

  //   setLatitude(lat);
  //   setLongitude(long);
  //   setGeolocationError(null); // Clear any previous errors

  //   const data: CheckAbsenRequest = {
  //     type: absenType!,
  //     location: selectedLocation,
  //     latitude: lat,
  //     longitude: long,
  //   };

  //   checkAbsen(data);
  // };

  // Handle absen-upload API call
  const handleAbsenUpload = (filenames: {
    filename_image: string | null;
    filename_location: string | null;
    filename_letter: string | null;
  }) => {
    const data = {
      latitude: latitude,
      longitude: longitude,
      filename_face: filenames.filename_image || "",
      filename_location:
        location === 1 ? null : filenames.filename_location || "",
      filename_letter: location === 1 ? null : filenames.filename_letter || "",
      type: absenType?.toString() || "",
      location: location?.toString() || "",
      device_token: token || "''",
      anomaly: selectedKelainan || "",
      is_pwa: 1,
    };

    console.log("Sending Absen Upload:", data);
    absenUpload(data);
  };

  // Convert data URL to File
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

  const formatDateIndonesian = () => {
    const dateObj = new Date();
    const day = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
    const formattedDate = dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return { day, date: formattedDate };
  };


  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex items-center justify-center -mt-28 sm:mt-0">
      <div className="w-full max-w-md p-4 bg-white shadow-md rounded-xl">
        <LoadingOverlay
          isLoading={isCheckPending || isUploadPending || isAbsenUploadPending}
          message={
            isCheckPending ? "Sedang memeriksa absen..." :
              isUploadPending ? "Mengupload foto..." :
                "Menyimpan data absen..."
          }
        />
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-bold sm:text-lg">
            <p>{formatDateIndonesian().day},</p>
            <p>{formatDateIndonesian().date}</p>
          </div>
          <div className="flex items-center space-x-2">
            {Object.values(currentTime).map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="flex items-center justify-center border border-gray-300 rounded-lg w-9 h-9 bg-muted">
                  <span className="font-normal text-md sm:text-lg">{unit}</span>
                </div>
                {index < 2 && (
                  <span className="mx-1 text-xl font-bold sm:text-lg">:</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-around">
          {/* Absen Masuk Button */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src="src/assets/ic_absen_masuk.svg"
              alt="Absen Masuk"
              width={120}
              height={64}
            />
            {is_absen_in ? (
              <button className="bg-[#6FCF9740] text-[#219653] px-8 py-4 text-[11px] sm:text-sm font-semibold rounded-full mt-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                ✅ Sudah Absen
              </button>
            ) : (
              <button
                onClick={() => handleAbsenClick(1)}
                disabled={isCheckPending}
                className="bg-primary text-white hover:bg-red-600 px-8 py-4 text-[11px] sm:text-sm font-semibold rounded-full mt-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckPending ? "Loading..." : "Absen Masuk"}
              </button>
            )}
          </div>

          {/* Absen Keluar Button */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src="src/assets/ic_absen_keluar.svg"
              alt="Absen Keluar"
              width={120}
              height={64}
            />

            {is_absen_out ? (
              <button className="bg-[#6FCF9740] text-[#219653] px-8 py-4 text-[11px] sm:text-sm font-semibold rounded-full mt-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                ✅ Sudah Absen
              </button>
            ) : (
              <button
                onClick={() => handleAbsenClick(0)}
                disabled={isCheckPending}
                className="bg-primary text-white text-[11px] sm:text-sm font-semibold px-8 py-4 rounded-full mt-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckPending ? "Loading..." : "Absen Pulang"}
              </button>
            )}
          </div>
        </div>

        {/* Location Selection Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
            onClick={() => setShowModal(false)}
          >
            <div
              className="w-full max-w-md p-6 bg-white rounded-lg"
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
              <h2 className="mb-4 text-lg font-bold text-center">
                Konfirmasi Lokasi Absen
              </h2>
              <h3 className="mb-4 text-center">
                {absenType === 1
                  ? "Dimana kamu melakukan Absen Masuk?"
                  : "Dimana kamu melakukan Absen Pulang?"}
              </h3>
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => handleLocationSelect(1)}
                  className="bg-[#B90101] text-white px-4 py-2 rounded-2xl w-full"
                >
                  Absen di Dalam Kantor
                </button>
                <button
                  onClick={() => handleLocationSelect(0)}
                  className="bg-[#550003] text-white px-4 py-2 rounded-2xl w-full"
                >
                  Absen di Luar Kantor
                </button>
              </div>
              {geolocationError && (
                <p className="mt-4 text-red-500">{geolocationError}</p>
              )}
            </div>
          </div>
        )}

        {/* Camera Modal */}
        {showCameraModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
              <h2 className="mb-4 text-lg font-bold text-center">
                {currentStep === "face" && "Ambil Foto Wajah"}
                {currentStep === "location" && "Ambil Foto Lokasi"}
                {currentStep === "letter" && "Ambil Foto Surat"}
              </h2>
              <div className="relative w-full mb-4">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  mirrored={currentStep === "face"}
                  className="w-full rounded-lg"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover'
                  }}
                  videoConstraints={{
                    deviceId: currentStep === "face" ? undefined : cameraDeviceId,
                    facingMode: currentStep === "face" ? "user" : "environment",
                  }}
                />

                {currentStep === "face" && isFaceScanActive && (
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>

              <h3 className="text-center text-[#828282] mb-2">
                {currentStep === "face" &&
                  "Pastikan wajah kamu terlihat jelas."}
                {currentStep === "location" &&
                  "Pastikan lokasi terlihat jelas."}
                {currentStep === "letter" && "Pastikan surat terlihat jelas."}
              </h3>
              {currentStep === "face" && isFaceScanActive && (
                <p className="text-center text-sm mb-2">
                  {isSmiling
                    ? "😄 Senyum terdeteksi, silakan foto"
                    : "🙂 Senyum dulu ya supaya bisa foto"}
                </p>
              )}

              <button
                onClick={capturePhoto}
                className="flex items-center justify-center px-6 py-3 mx-auto mb-4 text-white rounded-2xl"
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

        {showKelainanModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
              <img
                src="src/assets/ic_terlambat.svg"
                alt="Lokasi Absen"
                className="mx-auto mb-4"
              />
              <h2 className="mb-4 text-lg font-bold text-center">
                {kelainanType === "luar-masuk" || kelainanType === "luar-pulang"
                  ? "Wah, kamu absen di luar!"
                  : "Ups. Kamu Datang Terlambat!"}
              </h2>
              <p className="mb-4 text-center">
                {kelainanType === "luar-masuk" || kelainanType === "luar-pulang"
                  ? "Pilih alasan absen di luar disini :"
                  : "Pilih alasan terlambat disini :"}
              </p>
              <div className="flex flex-col space-y-2">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) => {
                    setSelectedKelainan(e.target.value);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {kelainanType === "luar-masuk" ||
                      kelainanType === "luar-pulang"
                      ? "Pilih alasan absen di luar disini :"
                      : "Pilih alasan terlambat disini :"}
                  </option>
                  {kelainanOptions.map((option) => (
                    <option key={option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (selectedKelainan) {
                      setShowKelainanModal(false);
                      setShowModal(false);
                      setShowCameraModal(true);
                      setCurrentStep("face");
                    } else {
                      alert("Silakan pilih alasan terlebih dahulu.");
                    }
                  }}
                  className="w-full px-4 py-2 text-white rounded-full bg-primary"
                >
                  Simpan Alasan
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Error Message */}
        {/* {isError && (
          <div className="mt-4 text-center text-red-500">
            Error: {error.message}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AbsenCard;
