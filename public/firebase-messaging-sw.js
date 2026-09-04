import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getMessaging,
  onBackgroundMessage,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-sw.js";

// ========== CACHE CONFIGURATION ==========
const CACHE_NAME = "aurora-v1";
const RUNTIME_CACHE = "aurora-runtime";

// Assets to cache on install
const urlsToCache = ["/", "/index.html"];

// ========== INSTALL EVENT ==========
self.addEventListener("install", (e) => {
  console.log("[SW] Installing...");

  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.log("[SW] Some assets failed to cache:", err);
      });
    }),
  );

  self.skipWaiting();
});

// ========== ACTIVATE EVENT ==========
self.addEventListener("activate", (e) => {
  console.log("[SW] Activating...");

  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );

  e.waitUntil(clients.claim());
});

// ========== FETCH EVENT ==========
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // ===== NAVIGATION REQUESTS (HTML) =====
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((response) => {
            return response || caches.match("/index.html");
          });
        }),
    );
    return;
  }

  // ===== ASSET REQUESTS (CSS, JS, Images, Fonts) =====
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response; // Return from cache
        }

        return fetch(request).then((fetchResponse) => {
          if (fetchResponse && fetchResponse.status === 200) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, fetchResponse.clone()));
          }
          return fetchResponse;
        });
      }),
    );
    return;
  }

  // ===== API REQUESTS (JSON, etc) =====
  if (request.destination === "empty" || request.destination === "") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Default: try network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});

// ========== FIREBASE MESSAGING ==========
const app = initializeApp({
  apiKey: "AIzaSyDEjdPYqJ28Wmxi_xFUl8H59Gr0HzER50Y",
  authDomain: "sitampan-atg.firebaseapp.com",
  projectId: "sitampan-atg",
  storageBucket: "sitampan-atg.firebasestorage.app",
  messagingSenderId: "66258014291",
  appId: "1:66258014291:web:9db1aed3b636f5fcd236a6",
});

const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("[SW] Background message received:", payload);

  const title =
    payload.data?.title || payload.notification?.title || "Notifikasi";
  const body = payload.data?.body || payload.notification?.body || "";
  const image = payload.data?.image || "";

  const options = {
    body: body,
    icon: `${self.location.origin}/icon-192x192.png`,
    badge: `${self.location.origin}/badge-72x72-white-transparent.png`,
    vibrate: [200, 100, 200],
    tag: "aurora-notification", // Prevent duplicate notifications
    renotify: false,
    data: {
      url: payload.data?.navigationId || "/dashboard",
    },
  };

  if (image) {
    options.image = image;
  }

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if window already open
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window if not found
      return clients.openWindow(url);
    }),
  );
});
