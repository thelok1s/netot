import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LAB_ITEMS } from "@/util/config";

export default function LabSelector({
  onSelect,
}: {
  onSelect: (value: string) => void;
}) {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Выбрать лабораторную" />
      </SelectTrigger>
      <SelectContent>
        {LAB_ITEMS.map((value) => (
          <SelectItem key={value} value={value.toString()}>
            {`Лаба ${value}`}
          </SelectItem>
        ))}
        <SelectItem value="exam1">ОТС-1</SelectItem>
        <SelectItem value="exam2">Все лабы</SelectItem>
        <SelectItem value="exam3">Абсолютно всё</SelectItem>
      </SelectContent>
    </Select>
  );
}
