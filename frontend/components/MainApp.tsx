import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MainApp = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome to Webtrees</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The application is configured and ready to use.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default MainApp;
