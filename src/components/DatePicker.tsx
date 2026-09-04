import { useRef } from "react";

const DatePicker = ({
  selectedDate,
  setSelectedDate,
  formattedDate,
}: {
  selectedDate: string; // Date in yyyy-mm-dd format
  setSelectedDate: (date: string) => void; // Function to update the selected date
  formattedDate: string; // Formatted date string for display (e.g., "15 October 2023")
}) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="flex items-center bg-white rounded-lg p-2 shadow-sm relative cursor-pointer border border-gray-300  px-3"
      onClick={() => datePickerRef.current?.showPicker()}
    >
      {/* Display Formatted Date */}
      <p className="text-[12px] mr-2">{formattedDate}</p>

      {/* Calendar Icon */}
      <img
        src="src/assets/ic_calendar.svg"
        alt="Calendar Icon"
        width={24}
        height={24}
      />

      {/* Hidden Date Picker */}
      <input
        type="date"
        ref={datePickerRef}
        value={selectedDate} // Use the selectedDate in yyyy-mm-dd format
        onChange={(e) => {
          const newDate = e.target.value; // Get the new date in yyyy-mm-dd format
          setSelectedDate(newDate); // Update the selected date
        }}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default DatePicker;
