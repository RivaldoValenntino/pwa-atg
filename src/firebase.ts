import { initializeApp } from "firebase/app";
import {
    getMessaging,
    getToken,
    isSupported,
    onMessage,
} from "firebase/messaging";
const firebaseConfig = {
    apiKey: "AIzaSyDEjdPYqJ28Wmxi_xFUl8H59Gr0HzER50Y",
    authDomain: "sitampan-atg.firebaseapp.com",
    projectId: "sitampan-atg",
    storageBucket: "sitampan-atg.firebasestorage.app",
    messagingSenderId: "66258014291",
    appId: "1:66258014291:web:9db1aed3b636f5fcd236a6",
    measurementId: "G-6TML1TQB0B"
};

const app = initializeApp(firebaseConfig);

export const requestPermissionAndGenerateToken = async () => {
    try {
        if (!("Notification" in window)) {
            console.log("Browser tidak support Notification");
            return null;
        }

        if (!("serviceWorker" in navigator)) {
            console.log("Browser tidak support Service Worker");
            return null;
        }

        const supported = await isSupported();

        if (!supported) {
            console.log("Firebase Messaging tidak didukung browser ini");
            return null;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Permission:", permission);
            return null;
        }

        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            { type: "module", scope: "/firebase-cloud-messaging-push-scope", }
        );

        const messaging = getMessaging(app);

        const token = await getToken(messaging, {
            vapidKey: "BALp5aXm96UEXXU3aTsE2gPwdTSVj0lodVSfH3YVJRisvlKKudOz76llYUSPfBywu3nlylZuKfN7edIui8MmpFo",
            serviceWorkerRegistration: registration,
        });

        console.log("FCM Token:", token);

        return token || null;
    } catch (error) {
        console.error("Error generating FCM token:", error);
        return null;
    }
};

// export const listenForegroundMessage = async () => {
//     const supported = await isSupported();

//     if (!supported) {
//         return;
//     }

//     const messaging = getMessaging(app);

//     onMessage(messaging, (payload) => {
//         console.log("Message received:", payload);

//         const notificationTitle =
//             payload?.data?.title ||
//             payload?.notification?.title ||
//             "Notifikasi";

//         const notificationOptions: NotificationOptions & { image?: string } = {
//             body: payload?.data?.body || "",
//             icon: `${window.location.origin}/icon-192x192.png`,
//             badge: `${window.location.origin}/badge-72x72-white-transparent.png`,
//         };

//         if (payload?.data?.image) {
//             notificationOptions.image = payload.data.image;
//         }

//         if (Notification.permission === "granted") {
//             new Notification(notificationTitle, notificationOptions);
//         }
//     });
// };


export const listenForegroundMessage = async () => {
    const supported = await isSupported();
    if (!supported) return;

    const messaging = getMessaging(app);

    onMessage(messaging, async (payload) => {
        console.log("Message received:", payload);

        const title =
            payload?.data?.title ||
            payload?.notification?.title ||
            "Notifikasi";

        const options: NotificationOptions & { image?: string } = {
            body: payload?.data?.body || payload?.notification?.body || "",
            icon: `${window.location.origin}/icon-192x192.png`,
            badge: `${window.location.origin}/badge-72x72-white-transparent.png`,
            data: {
                url: payload?.data?.navigationId || "/dashboard",
            },
        };

        if (payload?.data?.image) {
            options.image = payload.data.image;
        }

        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, options);
    });
};