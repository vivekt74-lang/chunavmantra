// src/components/ui/LoadingSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-card">
                <div className="container px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-32" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="container px-4 py-8">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <Skeleton className="h-64 rounded-lg" />
                        <Skeleton className="h-64 rounded-lg" />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 rounded-lg" />
                        <Skeleton className="h-96 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
};