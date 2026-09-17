import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const LAB_ITEMS = Array.from({ length: 20 }, (_, i) => i + 1);

export default function LabSelector({
  value,
  onSelect,
  onReset,
}: {
  value: string;
  onSelect: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <section className="lab-selector" aria-labelledby="lab-selector-title">
      <div className="lab-selector-header">
        <label id="lab-selector-title" htmlFor="lab-selector">
          Лабораторная работа
        </label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lab-reset"
            onClick={onReset}
            aria-label="Сбросить выбранную лабораторную работу"
            title="Вернуться к главному экрану"
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        )}
      </div>
      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger id="lab-selector" className="lab-select-trigger">
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
    </section>
  );
}
