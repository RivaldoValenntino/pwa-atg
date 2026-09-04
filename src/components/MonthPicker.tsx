import { useRef } from "react";

const MonthPicker = ({
  selectedPeriod,
  setSelectedPeriod,
  formattedPeriod,
}: {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  formattedPeriod: string;
}) => {
  const monthPickerRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="flex items-center bg-white rounded-lg p-2 shadow-sm relative cursor-pointer border border-gray-300 min-w-[290px] px-3"
      onClick={() => monthPickerRef.current?.showPicker()}
    >
      <img
        src="assets/ic_calendar.svg"
        alt="Calendar Icon"
        width={24}
        height={24}
      />
      <p className="text-[15px] ml-2">{formattedPeriod}</p>

      {/* Dropdown Icon aligned to the right */}
      <img
        src="assets/ic_dropdown.svg"
        alt="Dropdown Icon"
        className="ml-auto text-gray-500"
      />

      {/* Hidden Month-Year Picker */}
      <input
        type="month"
        ref={monthPickerRef}
        value={`${selectedPeriod.slice(0, 4)}-${selectedPeriod.slice(4, 6)}`}
        onChange={(e) => {
          const newPeriod = e.target.value.replace("-", "");
          setSelectedPeriod(newPeriod);
        }}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default MonthPicker;
