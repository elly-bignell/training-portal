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
    startDate: "2026-02-23",
  },
  {
    id: "krishna-patel",
    name: "Krishna Patel",
    slug: "krishna-patel",
    startDate: "2026-02-23",
  },
  {
    id: "jeremy-valiente",
    name: "Jeremy Valiente",
    slug: "jeremy-valiente",
    startDate: "2026-03-04",
  },
  {
    id: "dasha-axenova",
    name: "Dasha Axenova",
    slug: "dasha-axenova",
    startDate: "2026-03-06",
  },
  {
    id: "rachel-astachnowicz",
    name: "Rachel Astachnowicz",
    slug: "rachel-astachnowicz",
    startDate: "2026-03-18",
  },
  {
    id: "aston-marsh",
    name: "Aston Marsh",
    slug: "aston-marsh",
    startDate: "2026-03-18",
  },
  {
    id: "reegan-james",
    name: "Reegan James",
    slug: "reegan-james",
    startDate: "2026-03-19",
  },
  {
    id: "shani-thomas",
    name: "Shani Thomas",
    slug: "shani-thomas",
    startDate: "2026-03-24",
  },
  {
    id: "riley-kerrison",
    name: "Riley Kerrison",
    slug: "riley-kerrison",
    startDate: "2026-03-27",
  },
  {
    id: "khushi-patel",
    name: "Khushi Patel",
    slug: "khushi-patel",
    startDate: "2026-04-15",
  },
  {
    id: "lauren-kim",
    name: "Lauren Kim",
    slug: "lauren-kim",
    startDate: "2026-04-15",
  },
  {
    id: "kristy-lee-busk",
    name: "Kristy Lee Busk",
    slug: "kristy-lee-busk",
    startDate: "2026-04-16",
  },
  {
    id: "yashika-sood",
    name: "Yashika Sood",
    slug: "yashika-sood",
    startDate: "2026-04-16",
  },
  {
    id: "caia-cuggy",
    name: "Caia Cuggy",
    slug: "caia-cuggy",
    startDate: "2026-04-16",
  },
  {
    id: "jj-chatrawee",
    name: "JJ Chatrawee",
    slug: "jj-chatrawee",
    startDate: "2026-04-16",
  },
  {
    id: "sushant-maharjan",
    name: "Sushant Maharjan",
    slug: "sushant-maharjan",
    startDate: "2026-04-16",
  },
  {
    id: "maddison-bruce",
    name: "Maddison Bruce",
    slug: "maddison-bruce",
    startDate: "2026-04-16",
  },
  {
    id: "kateryna-bakumenko",
    name: "Kateryna Bakumenko",
    slug: "kateryna-bakumenko",
    startDate: "2026-04-16",
  },
  {
    id: "shahmir-saajad",
    name: "Shahmir Saajad",
    slug: "shahmir-saajad",
    startDate: "2026-04-16",
  },
  {
    id: "ella-smith",
    name: "Ella Smith",
    slug: "ella-smith",
    startDate: "2026-04-16",
  },
  {
    id: "sydney-arnold",
    name: "Sydney Arnold",
    slug: "sydney-arnold",
    startDate: "2026-03-17",
  },
  {
    id: "shian-roux",
    name: "Shian Roux",
    slug: "shian-roux",
    startDate: "2026-05-11",
  },
];

export function getTraineeBySlug(slug: string): Trainee | undefined {
  return trainees.find((t) => t.slug === slug);
}
