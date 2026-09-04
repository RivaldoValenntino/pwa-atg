import { createFileRoute, Link } from "@tanstack/react-router";
import CardPengumuman from "../../components/CardPengumuman";
import { pengumumanQueryOptions } from "../../queries/pengumumanQuery";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/pengumuman")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(pengumumanQueryOptions());
  },
});

function RouteComponent() {
  const { data } = useSuspenseQuery<PengumumanResponse[]>(
    pengumumanQueryOptions()
  );

  const truncateHtml = (html: string, maxLength: number): string => {
    if (html.length <= maxLength) return html;
    return html.slice(0, maxLength) + "...";
  };

  return (
    <div className="font-poppins bg-gray-100 min-h-screen relative">
      {/* Background Section */}
      <div className="bg-primary text-white rounded-b-2xl shadow-md p-6 mb-6 h-48 sm:flex sm:flex-col sm:items-start sm:justify-center lg:h-64 relative">
        {/* Back Button */}
        <div className="absolute flex items-center space-x-4">
          <Link to="/info">
            <img
              src="assets/ic_arrow_back_white.svg"
              alt="Back"
              width={30}
              height={30}
            />
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div className="absolute sm:top-4 left-12 flex flex-col items-center space-y-2">
          <p className="text-lg">Daftar Pengumuman</p>
          <p className="text-sm">Baca Pengumuman dan Informasi Terkini</p>
        </div>
      </div>

      {/* Card List Section */}
      <div className="relative left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 space-y-4">
        {data?.map((pengumuman, index) => (
          <CardPengumuman
            key={index}
            imageSrc={pengumuman.image}
            title={pengumuman.title}
            startDate={pengumuman.start_date}
            endDate={pengumuman.end_date}
            description={
              <div
                dangerouslySetInnerHTML={{
                  __html: truncateHtml(pengumuman.description, 220), // Truncate HTML content
                }}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
