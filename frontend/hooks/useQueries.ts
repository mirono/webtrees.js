import { useQuery } from "@tanstack/react-query";
import {
  individualsApi,
  familiesApi,
  statsApi,
  searchApi,
  treesApi,
  calendarApi,
  placesApi,
  mediaApi,
  type Individual,
  type Family,
  type TreeStats,
  type Tree,
  type CalendarEvent,
  type Place,
  type MediaObject,
} from "@/lib/api";

export const useIndividual = (id: string) =>
  useQuery<Individual>({
    queryKey: ["individual", id],
    queryFn: () => individualsApi.get(id),
    enabled: !!id,
  });

export const useIndividuals = () =>
  useQuery<Individual[]>({
    queryKey: ["individuals"],
    queryFn: () => individualsApi.list(),
  });

export const useAncestors = (id: string, depth = 3) =>
  useQuery<Individual[]>({
    queryKey: ["ancestors", id, depth],
    queryFn: () => individualsApi.ancestors(id, depth),
    enabled: !!id,
  });

export const useDescendants = (id: string, depth = 3) =>
  useQuery<Individual[]>({
    queryKey: ["descendants", id, depth],
    queryFn: () => individualsApi.descendants(id, depth),
    enabled: !!id,
  });

export const useFamily = (id: string) =>
  useQuery<Family>({
    queryKey: ["family", id],
    queryFn: () => familiesApi.get(id),
    enabled: !!id,
  });

export const useFamilies = () =>
  useQuery<Family[]>({
    queryKey: ["families"],
    queryFn: () => familiesApi.list(),
  });

export const useSearch = (q: string, treeId?: number) =>
  useQuery({
    queryKey: ["search", q, treeId],
    queryFn: () => searchApi.search({ q, treeId }),
    enabled: q.length >= 2,
  });

export const useStats = (treeId?: number) =>
  useQuery<TreeStats>({
    queryKey: ["stats", treeId],
    queryFn: () => statsApi.get(treeId),
  });

export const useTrees = () =>
  useQuery<Tree[]>({
    queryKey: ["trees"],
    queryFn: () => treesApi.list(),
  });

export const usePlaces = () =>
  useQuery<Place[]>({
    queryKey: ["places"],
    queryFn: () => placesApi.list(),
  });

export const useMedia = (treeId?: number, type?: string) =>
  useQuery<MediaObject[]>({
    queryKey: ["media", treeId, type],
    queryFn: () => mediaApi.list({ treeId, type }),
  });
