import React from "react";

interface CardPengumumanProps {
  imageSrc: string;
  title: string;
  startDate: string;
  endDate: string;
  description: React.ReactNode; // Allow ReactNode for description
}

const CardPengumuman: React.FC<CardPengumumanProps> = ({
  imageSrc,
  title,
  startDate,
  endDate,
  description,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex w-full max-w-md -mt-16 h-40">
      {/* Image Section */}
      <div className="w-1/3">
        <img src={imageSrc} alt="News" className="h-full w-full object-cover" />
      </div>
      {/* Content Section */}
      <div className="w-2/3 p-4">
        <h3 className="text-lg font-semibold">{title}</h3>

        {/* Date */}
        <div className="flex items-center text-gray-500 text-[10px] my-1">
          <img
            src="/src/assets/ic_clock.svg"
            alt="Clock"
            width={12}
            height={12}
            className="shrink-0 mr-1"
          />
          <span className="font-bold">{startDate}</span>
          <span className="font-bold">-{endDate}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm">
          {description}{" "}
          <a href="#" className="text-red-500 font-semibold">
            baca selengkapnya...
          </a>
        </p>
      </div>
    </div>
  );
};

export default CardPengumuman;
