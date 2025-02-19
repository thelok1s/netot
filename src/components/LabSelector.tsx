import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const LAB_ITEMS = Array.from({ length: 20 }, (_, i) => i + 1);

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
      </SelectContent>
    </Select>
  );
}
