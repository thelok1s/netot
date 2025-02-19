export const LAB_ITEMS = Array.from({ length: 20 }, (_, i) => i + 1);

export const EXAM_CONFIGS = {
  exam1: {
    title: "ОТС",
    labs: [1, 2, 3, 4, 6, 8, 11, 14],
  },
  exam2: {
    title: "Все лабы",
    labs: [1, 2, 3, 4, 6, 8, 11, 14, 26, 28],
  },
  exam3: {
    title: "Абсолютно всё",
    labs: LAB_ITEMS,
  },
} as const;
