// src/components/analysis/PollingBoothAnalysis.tsx - OPTIMIZED
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Download,
    ChevronRight,
    Building2,
    Users,
    TrendingUp,
    AlertCircle,
    Trophy,
    BarChart3,
    RefreshCw,
    GitCompare,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/services/api";
import PartyBadge from "@/components/ui/PartyBadge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PollingBoothAnalysisProps {
    constituencyId: number;
    constituencyName?: string;
}

const PollingBoothAnalysis = ({ constituencyId, constituencyName }: PollingBoothAnalysisProps) => {
    const [loading, setLoading] = useState(true);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [booths, setBooths] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [filterParty, setFilterParty] = useState<string>("all");
    const [filterTurnout, setFilterTurnout] = useState<string>("all");
    const ITEMS_PER_PAGE = 10;

    // Helper functions for safe data handling
    const getSafeNumber = (value: any, defaultValue: number = 0): number => {
        if (value === null || value === undefined) return defaultValue;
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    };

    const getSafeString = (value: any, defaultValue: string = ""): string => {
        if (value === null || value === undefined) return defaultValue;
        return String(value);
    };

    const formatNumber = (num: any): string => {
        const number = getSafeNumber(num);
        return number.toLocaleString('en-IN');
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Only load booth analysis (contains booths data)
            const analysis = await apiService.getBoothAnalysis(constituencyId);

            if (analysis) {
                setAnalysisData(analysis);

                // Extract booths from analysis data if available
                if (analysis.booths && Array.isArray(analysis.booths)) {
                    setBooths(analysis.booths);
                    setTotalPages(Math.ceil(analysis.booths.length / ITEMS_PER_PAGE));
                } else {
                    // Fallback: load booths separately
                    const boothsData = await apiService.getConstituencyBooths(constituencyId, currentPage, ITEMS_PER_PAGE);
                    if (boothsData.data && Array.isArray(boothsData.data)) {
                        setBooths(boothsData.data);
                        if (boothsData.meta) {
                            setTotalPages(getSafeNumber(boothsData.meta.totalPages, 1));
                        }
                    }
                }
            } else {
                throw new Error('No data received from API');
            }

        } catch (error) {
            console.error('Error loading booth data:', error);
            setError('Failed to load booth analysis data. Please try again.');
            setBooths([]);
            setAnalysisData(null);
        } finally {
            setLoading(false);
        }
    }, [constituencyId, currentPage]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Memoized filtered booths
    const filteredBooths = useMemo(() => {
        if (!booths || booths.length === 0) return [];

        return booths
            .filter(booth => {
                // Search filter
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    const boothName = getSafeString(booth.booth_name).toLowerCase();
                    const boothNumber = getSafeString(booth.booth_number).toLowerCase();
                    const winningParty = getSafeString(booth.winning_party).toLowerCase();

                    if (!(
                        boothName.includes(query) ||
                        boothNumber.includes(query) ||
                        winningParty.includes(query)
                    )) {
                        return false;
                    }
                }

                // Party filter
                if (filterParty !== "all" && getSafeString(booth.winning_party) !== filterParty) {
                    return false;
                }

                // Turnout filter
                if (filterTurnout !== "all") {
                    const turnout = getSafeNumber(booth.turnout_percentage || booth.booth_turnout);
                    switch (filterTurnout) {
                        case "high":
                            if (turnout < 70) return false;
                            break;
                        case "medium":
                            if (turnout < 50 || turnout >= 70) return false;
                            break;
                        case "low":
                            if (turnout >= 50) return false;
                            break;
                    }
                }

                return true;
            })
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [booths, searchQuery, filterParty, filterTurnout, currentPage]);

    // Extract unique parties for filter
    const uniqueParties = useMemo(() => {
        return Array.from(new Set(
            booths
                .map(b => getSafeString(b.winning_party))
                .filter(party => party && party !== 'undefined' && party !== 'null' && party.trim() !== '')
        )).sort();
    }, [booths]);

    const getTurnoutBadge = (turnout: any) => {
        const turnoutNum = getSafeNumber(turnout);
        if (turnoutNum >= 70) return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">High</Badge>;
        if (turnoutNum >= 50) return <Badge variant="outline" className="text-yellow-700 border-yellow-300">Medium</Badge>;
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Low</Badge>;
    };

    // Loading state
    if (loading && booths.length === 0) {
        return (
            <div className="space-y-6">
                {/* Search and Filter Skeleton */}
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>

                {/* Table Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error && booths.length === 0) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search booths by name, number, or party..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-4">
                    <div className="w-full sm:w-auto">
                        <Select value={filterParty} onValueChange={setFilterParty}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by party" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Parties</SelectItem>
                                {uniqueParties.map(party => (
                                    <SelectItem key={party} value={party}>{party}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <Select value={filterTurnout} onValueChange={setFilterTurnout}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by turnout" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Turnout</SelectItem>
                                <SelectItem value="high">High (≥70%)</SelectItem>
                                <SelectItem value="medium">Medium (50-69%)</SelectItem>
                                <SelectItem value="low">Low (&lt;50%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Analysis Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Total Booths</p>
                            <p className="text-2xl font-bold">
                                {getSafeNumber(analysisData?.summary?.total_booths || booths.length)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Total Voters</p>
                            <p className="text-2xl font-bold">
                                {formatNumber(analysisData?.summary?.total_electors ||
                                    booths.reduce((sum, b) => sum + getSafeNumber(b.total_electors), 0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Avg Turnout</p>
                            <p className="text-2xl font-bold">
                                {analysisData?.summary?.avg_turnout
                                    ? `${getSafeNumber(analysisData.summary.avg_turnout).toFixed(1)}%`
                                    : booths.length > 0
                                        ? `${(booths.reduce((sum, b) => sum + getSafeNumber(b.turnout_percentage || b.booth_turnout), 0) / booths.length).toFixed(1)}%`
                                        : 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Leading Party</p>
                            <p className="text-2xl font-bold truncate">
                                {getSafeString(analysisData?.party_dominance?.[0]?.party_name, "N/A").substring(0, 12)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Booths Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle>Polling Booths</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {filteredBooths.length} of {booths.length} booths showing
                                {constituencyName && ` in ${constituencyName}`}
                            </p>
                        </div>
                        <Badge variant="outline" className="w-fit">
                            Page {currentPage} of {totalPages}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredBooths.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-20">Booth No.</TableHead>
                                            <TableHead className="min-w-[200px]">Booth Name</TableHead>
                                            <TableHead className="w-24">Voters</TableHead>
                                            <TableHead className="w-32">Turnout</TableHead>
                                            <TableHead className="w-40">Winning Party</TableHead>
                                            <TableHead className="w-32 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBooths.map((booth, index) => {
                                            const turnout = booth.turnout_percentage || booth.booth_turnout;
                                            const turnoutNum = getSafeNumber(turnout);

                                            return (
                                                <TableRow key={`${booth.booth_id}-${index}`}>
                                                    <TableCell className="font-mono font-medium">
                                                        {getSafeString(booth.booth_number, 'N/A')}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs">
                                                        <div className="truncate" title={getSafeString(booth.booth_name)}>
                                                            {getSafeString(booth.booth_name, `Booth ${booth.booth_number}`)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatNumber(booth.total_electors)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span>
                                                                {!isNaN(turnoutNum) ? `${turnoutNum.toFixed(1)}%` : 'N/A'}
                                                            </span>
                                                            {getTurnoutBadge(turnout)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {booth.winning_party ? (
                                                            <PartyBadge party={getSafeString(booth.winning_party)} size="sm" />
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">No data</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="ghost" asChild>
                                                                <Link to={`/booth/${booth.booth_id || booth.booth_number}`}>
                                                                    View Details
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery || filterParty !== "all" || filterTurnout !== "all"
                                    ? 'No booths match your filters'
                                    : 'No booth data available'}
                            </p>
                            {(searchQuery || filterParty !== "all" || filterTurnout !== "all") && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setFilterParty("all");
                                        setFilterTurnout("all");
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* CTA to Advanced Analysis */}
            <div className="text-center">
                <Button asChild variant="default" size="lg">
                    <Link to={`/constituency/${constituencyId}/booth-analysis`}>
                        <BarChart3 className="mr-2 h-5 w-5" />
                        View Advanced Booth Analysis
                        <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="mt-4 ml-4">
                    <Link to={`/constituency/${constituencyId}/compare-booths`}>
                        <GitCompare className="mr-2 h-5 w-5" />
                        Compare Booths
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default PollingBoothAnalysis;