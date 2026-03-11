"use client";

import React from "react";
import { useIndividual } from "@/hooks/useIndividual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";

interface IndividualProfileProps {
    id: string;
}

const IndividualProfile: React.FC<IndividualProfileProps> = ({ id }) => {
    const { data: individual, isLoading, error } = useIndividual(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !individual) {
        return (
            <div className="p-8 text-center text-destructive">
                Error loading individual: {(error as Error)?.message || "Not found"}
            </div>
        );
    }

    const primaryName = individual.names?.[0]?.full || "Unknown";
    const birthEvent = individual.events?.find(e => e.event_type === 'BIRT');
    const deathEvent = individual.events?.find(e => e.event_type === 'DEAT');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-muted p-3 rounded-full">
                        <User className="h-8 w-8" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">{primaryName}</CardTitle>
                        <CardDescription>{individual.gedcom_id}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Birth</span>
                            <p>{birthEvent ? `${birthEvent.date || ''} ${birthEvent.place || ''}` : 'Not recorded'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Death</span>
                            <p>{deathEvent ? `${deathEvent.date || ''} ${deathEvent.place || ''}` : 'Not recorded'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Events</CardTitle>
                </CardHeader>
                <CardContent>
                    {individual.events && individual.events.length > 0 ? (
                        <ul className="space-y-3">
                            {individual.events.map((event) => (
                                <li key={event.id} className="flex justify-between border-b pb-2 last:border-0">
                                    <span className="font-medium">{event.event_type}</span>
                                    <span className="text-muted-foreground text-sm">
                                        {event.date} {event.place && `at ${event.place}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">No other events recorded.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Family</CardTitle>
                </CardHeader>
                <CardContent>
                    {individual.links && individual.links.length > 0 ? (
                        <ul className="space-y-3">
                            {individual.links.map((link) => (
                                <li key={link.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <div>
                                        <span className="font-medium mr-2">{link.role}</span>
                                        <span className="text-sm text-muted-foreground">Family: {link.family.gedcom_id}</span>
                                    </div>
                                    {/* TODO: Add link to the family member if possible */}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">No family links recorded.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default IndividualProfile;
