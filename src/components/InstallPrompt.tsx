import React, { useEffect, useState } from "react";

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the user is on an iOS device
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isAppleDevice);

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      // Prevent the default browser install prompt
      event.preventDefault();
      // Store the event for later use
      setDeferredPrompt(event);
      // Show the custom popup
      setIsVisible(true);
    };

    // Only add the event listener for non-iOS devices
    if (!isAppleDevice) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger the browser's install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      // Log the result
      console.log(`User response: ${outcome}`);
      // Hide the custom popup
      setIsVisible(false);
      // Clear the deferred prompt
      setDeferredPrompt(null);
    }
  };

  const handleCloseClick = () => {
    // Hide the custom popup
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-lg">
        <h2 className="text-xl font-bold mb-4">Install App</h2>
        {isIOS ? (
          <>
            <p className="text-gray-700 mb-6">
              Untuk install aplikasi ini pada iPhone, tap tombol{" "}
              <strong>Share</strong> pada Safari dan pilih{" "}
              <strong>
                "Add to Home Screen" atau "Tambahkan ke layar beranda
              </strong>
              .
            </p>
            <button
              onClick={handleCloseClick}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Tutup
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-6">
              Install aplikasi absen ke halaman utama!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleInstallClick}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition"
              >
                Install
              </button>
              <button
                onClick={handleCloseClick}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
