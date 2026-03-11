"use client";

import React from "react";
import { useParams } from "next/navigation";
import IndividualProfile from "@/components/gedcom/IndividualProfile";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function IndividualPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card text-card-foreground border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-foreground">webtrees</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <IndividualProfile id={id} />
                </div>
            </main>
        </div>
    );
}
