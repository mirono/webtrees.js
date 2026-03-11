import { useQuery } from "@tanstack/react-query";

export interface IndividualName {
    id: number;
    full: string;
    given?: string;
    surname?: string;
}

export interface IndividualEvent {
    id: number;
    event_type: string;
    date?: string;
    place?: string;
}

export interface Family {
    id: number;
    gedcom_id: string;
}

export interface FamilyLink {
    id: number;
    role: string;
    family: Family;
    individual: Individual;
}

export interface Individual {
    id: number;
    gedcom_id: string;
    names: IndividualName[];
    events: IndividualEvent[];
    links: FamilyLink[];
}

export const useIndividual = (id: string) => {
    return useQuery<Individual>({
        queryKey: ["individual", id],
        queryFn: async () => {
            const response = await fetch(`http://localhost:3001/api/individuals/${id}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        },
        enabled: !!id,
    });
};
