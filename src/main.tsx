import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/auth-store";

import "./index.css";
import { registerSW } from "virtual:pwa-register";
import InstallPrompt from "./components/InstallPrompt";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
});

const queryClient = new QueryClient();

const createAppRouter = (auth: any) =>
  createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    context: {
      queryClient,
      auth,
    },
  });

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}

function AppWithRouter() {
  const auth = useAuthStore();
  const [router, setRouter] = useState<ReturnType<typeof createAppRouter> | null>(null);

  useEffect(() => {
    setRouter(createAppRouter(auth));
  }, [auth]);

  if (!router) {
    return null;
  }

  return <RouterProvider router={router} />;
}

function App() {
  const [isRehydrated, setIsRehydrated] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    setIsRehydrated(true);
  }, []);

  if (!isRehydrated) {
    return null;
  }

  return <AppWithRouter />;
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
      <InstallPrompt />
    </QueryClientProvider>
  );
}