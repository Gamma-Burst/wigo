"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SearchResultCard, { HotelResult } from "./SearchResultCard";
import ActivityCard from "./ActivityCard";
import type { ActivityResult } from "@/app/api/search-activities/route";

const DynamicMap = dynamic(() => import("./MapComponent"), { ssr: false });

interface ResultsGridProps {
    results: HotelResult[];
    activityResults?: ActivityResult[];
    isActivityMode?: boolean;
}

export default function ResultsGrid({ results, activityResults, isActivityMode }: ResultsGridProps) {
    const [activeHotelId, setActiveHotelId] = useState<string>(results[0]?.id || "");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    const activeHotel = results.find(h => h.id === activeHotelId) || results[0];

    if (isActivityMode && activityResults) {
        if (!activityResults || activityResults.length === 0) return null;
        return (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activityResults.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                ))}
            </div>
        );
    }

    if (!results || results.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-6 pr-2 lg:overflow-y-auto lg:max-h-[800px]">
                    {results.map((hotel) => (
                        <div key={hotel.id}
                            className={`transition-all duration-300 rounded-2xl ${activeHotelId === hotel.id ? 'ring-2 ring-accent ring-offset-4 ring-offset-background/50 scale-[1.02]' : ''}`}>
                            <SearchResultCard hotel={hotel} isActive={activeHotelId === hotel.id} onSelect={() => setActiveHotelId(hotel.id)} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden lg:block relative h-[800px] sticky top-24">
                {isMounted && activeHotel && <DynamicMap key={activeHotel.id} hotel={activeHotel} />}
            </div>
            <div className="block lg:hidden h-[400px] mt-8 w-full">
                {isMounted && activeHotel && <DynamicMap key={activeHotel.id} hotel={activeHotel} />}
            </div>
        </div>
    );
}
