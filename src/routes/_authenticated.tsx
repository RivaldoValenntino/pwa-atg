import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const token = context.auth.token;
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
