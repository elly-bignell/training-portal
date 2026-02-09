// data/trainees.ts

import { Trainee } from "@/types";

export const trainees: Trainee[] = [
  {
    id: "trainee-test",
    name: "Trainee Test",
    slug: "trainee-test",
    startDate: "2026-02-09",
  },
  {
    id: "cindy-rose-rondez-manrique",
    name: "Cindy Rose Rondez Manrique",
    slug: "cindy-rose-rondez-manrique",
    startDate: "2024-01-15",
  },
  {
    id: "krishna-patel",
    name: "Krishna Patel",
    slug: "krishna-patel",
    startDate: "2024-01-15",
  },
];

export function getTraineeBySlug(slug: string): Trainee | undefined {
  return trainees.find((t) => t.slug === slug);
}
