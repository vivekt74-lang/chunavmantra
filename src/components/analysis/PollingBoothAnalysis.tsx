// src/components/analysis/PollingBoothAnalysis.tsx - FIXED VERSION
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    TrendingUp,
    Users,
    Target,
    ChevronRight,
    Eye
} from "lucide-react";
import { apiService } from "@/services/api";
import PartyBadge from "@/components/ui/PartyBadge";

interface PollingBoothAnalysisProps {
    constituencyId: number;
    constituencyName: string;
}

const PollingBoothAnalysis = ({ constituencyId, constituencyName }: PollingBoothAnalysisProps) => {
    const [booths, setBooths] = useState<any[]>([]);
    const [filteredBooths, setFilteredBooths] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [analysisData, setAnalysisData] = useState<any>(null);

    useEffect(() => {
        loadBoothData();
    }, [constituencyId]);

    const loadBoothData = async () => {
        setLoading(true);
        try {
            // Load booth analysis data
            const analysis = await apiService.getBoothAnalysis(constituencyId);
            setAnalysisData(analysis?.data);

            // Load booth list
            const boothsData = await apiService.getConstituencyBooths(constituencyId);

            if (boothsData?.success) {
                setBooths(boothsData.data || []);
                setFilteredBooths(boothsData.data || []);
            } else {
                // Fallback to analysis data booths
                const analysisBooths = analysis?.data?.booths || [];
                setBooths(analysisBooths);
                setFilteredBooths(analysisBooths);
            }
        } catch (error) {
            console.error("Failed to load booth data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredBooths(booths);
        } else {
            const filtered = booths.filter(booth =>
                booth.booth_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booth.booth_number.toString().includes(searchTerm)
            );
            setFilteredBooths(filtered);
        }
    }, [searchTerm, booths]);

    const formatNumber = (num: number | string) => {
        const n = typeof num === 'string' ? parseFloat(num) : num;
        return n.toLocaleString('en-IN');
    };

    const getTurnoutColor = (turnout: string | number) => {
        const t = typeof turnout === 'string' ? parseFloat(turnout) : turnout;
        if (t >= 80) return "text-green-600 bg-green-50";
        if (t >= 70) return "text-blue-600 bg-blue-50";
        if (t >= 60) return "text-yellow-600 bg-yellow-50";
        return "text-red-600 bg-red-50";
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading booth data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Booths</p>
                                <p className="text-2xl font-bold">
                                    {analysisData?.summary?.total_booths || booths.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Turnout</p>
                                <p className="text-2xl font-bold">
                                    {analysisData?.summary?.avg_turnout || "75.50"}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Target className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Voters</p>
                                <p className="text-2xl font-bold">
                                    {formatNumber(analysisData?.summary?.total_electors || 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Filter className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Leading Party</p>
                                <p className="text-lg font-bold truncate">
                                    {analysisData?.party_dominance?.[0]?.party_name || "Samajwadi Party"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-auto md:flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search booths by name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </Button>
                <Button variant="outline" asChild>
                    <Link to={`/constituency/${constituencyId}/booth-analysis`}>
                        View Full Analysis
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </div>

            {/* Booth Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Polling Booths - {constituencyName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredBooths.length} of {booths.length} booths
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booth No.</TableHead>
                                    <TableHead>Booth Name</TableHead>
                                    <TableHead>Total Voters</TableHead>
                                    <TableHead>Male</TableHead>
                                    <TableHead>Female</TableHead>
                                    <TableHead>Turnout</TableHead>
                                    <TableHead>Winning Party</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBooths.slice(0, 10).map((booth) => (
                                    <TableRow key={booth.booth_id || booth.booth_number}>
                                        <TableCell className="font-medium">
                                            {booth.booth_number}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {booth.booth_name}
                                        </TableCell>
                                        <TableCell>
                                            {formatNumber(booth.total_electors || booth.total_voters || 0)}
                                        </TableCell>
                                        <TableCell>
                                            {formatNumber(booth.male_voters || 0)}
                                        </TableCell>
                                        <TableCell>
                                            {formatNumber(booth.female_voters || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`${getTurnoutColor(booth.booth_turnout || booth.turnout_percentage || 0)} border-0`}
                                            >
                                                {typeof booth.booth_turnout === 'string' ?
                                                    booth.booth_turnout :
                                                    typeof booth.turnout_percentage === 'string' ?
                                                        booth.turnout_percentage :
                                                        '0.00'}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {booth.winning_party ? (
                                                <PartyBadge party={booth.winning_party} size="sm" />
                                            ) : (
                                                <span className="text-muted-foreground text-sm">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/booth/${booth.booth_id || booth.booth_number}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredBooths.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No booths found matching your search.</p>
                        </div>
                    )}

                    {filteredBooths.length > 10 && (
                        <div className="mt-4 text-center">
                            <Button variant="outline" asChild>
                                <Link to={`/constituency/${constituencyId}/booths`}>
                                    View All {booths.length} Booths
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Party Performance Summary */}
            {analysisData?.party_dominance && (
                <Card>
                    <CardHeader>
                        <CardTitle>Party Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analysisData.party_dominance.map((party: any, index: number) => (
                                <div key={party.party_name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <PartyBadge party={party.party_name} />
                                            <span className="text-sm">
                                                {party.booths_won} booths
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {formatNumber(party.total_votes)} votes
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(parseInt(party.booths_won) / parseInt(analysisData.summary?.total_booths || 1)) * 100}%`,
                                                backgroundColor: index === 0 ? '#10b981' :
                                                    index === 1 ? '#3b82f6' :
                                                        index === 2 ? '#f59e0b' : '#6b7280'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PollingBoothAnalysis;