"use client";

import React, { useEffect, useState } from 'react';
import SetupWizard from './SetupWizard';
import MainApp from './MainApp';
import { Loader2 } from 'lucide-react';

const AppWrapper = () => {
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkConfiguration();
    }, []);

    const checkConfiguration = async () => {
        try {
            const response = await fetch('http://localhost:3001/config/status');
            const data = await response.json();
            setIsConfigured(data.isConfigured);
        } catch (error) {
            console.error('Failed to check configuration status:', error);
            // Fallback to setup wizard if backend is unreachable or error occurs
            setIsConfigured(false);
        } finally {
            setIsLoading(false);
        }
    };

    const saveConfiguration = async (configData: any) => {
        try {
            const response = await fetch('http://localhost:3001/config/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(configData),
            });

            if (!response.ok) {
                console.error('Failed to save configuration');
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
        }
    };

    const enterMainApp = () => {
        setIsConfigured(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isConfigured) {
        return <MainApp />;
    }

    return <SetupWizard onSaveConfig={saveConfiguration} onEnterApp={enterMainApp} />;
};

export default AppWrapper;
