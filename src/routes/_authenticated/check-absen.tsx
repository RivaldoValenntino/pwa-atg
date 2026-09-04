import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { postCheckAbsen } from "../../queries/absenQueryFn";

export const Route = createFileRoute("/_authenticated/check-absen")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mutate, isPending, error } = useMutation({
    mutationFn: postCheckAbsen,
    onSuccess: (res) => {
      console.log(res);
    },
    onError: (err) => {
      alert(err.message);
    },
  });
  return (
    <div>
      Hello "/_authenticated/check-absen"!
      <div className="mt-2">
        <button
          onClick={() =>
            mutate({
              type: 0,
              location: 0,
              latitude: "-6.86319860599689",
              longitude: "107.5080000787116",
            })
          }
        >
          Check Absen
        </button>
      </div>
    </div>
  );
}
