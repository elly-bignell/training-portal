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
    id: "dylan-munro",
    name: "Dylan Munro",
    slug: "dylan-munro",
    startDate: "2026-02-11",
  },
  {
    id: "thomas-rennie",
    name: "Thomas Rennie",
    slug: "thomas-rennie",
    startDate: "2026-02-11",
  },
  {
    id: "lucas-tirri",
    name: "Lucas Tirri",
    slug: "lucas-tirri",
    startDate: "2026-02-11",
  },
  {
    id: "felipe-garcia",
    name: "Felipe Garcia",
    slug: "felipe-garcia",
    startDate: "2026-02-11",
  },
  {
    id: "connie-matthews",
    name: "Connie Matthews",
    slug: "connie-matthews",
    startDate: "2026-02-10",
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
