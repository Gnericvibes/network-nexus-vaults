
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomDurationSelectorProps {
  onChange: (duration: { value: number; unit: "days" | "weeks" | "months" }) => void;
  className?: string;
}

const CustomDurationSelector: React.FC<CustomDurationSelectorProps> = ({
  onChange,
  className,
}) => {
  const [value, setValue] = useState<number>(30);
  const [unit, setUnit] = useState<"days" | "weeks" | "months">("days");

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue > 0) {
      setValue(newValue);
      onChange({ value: newValue, unit });
    }
  };

  const handleUnitChange = (newUnit: "days" | "weeks" | "months") => {
    setUnit(newUnit);
    onChange({ value, unit: newUnit });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Input
          type="number"
          value={value}
          onChange={handleValueChange}
          min={1}
          className={className}
        />
      </div>
      <div>
        <Select value={unit} onValueChange={handleUnitChange}>
          <SelectTrigger className={className}>
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent className="bg-teal-800 border-teal-600">
            <SelectItem value="days" className="text-teal-300">Days</SelectItem>
            <SelectItem value="weeks" className="text-teal-300">Weeks</SelectItem>
            <SelectItem value="months" className="text-teal-300">Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CustomDurationSelector;
