// src/components/analysis/PollingBoothAnalysis.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Download, ChevronRight, Building2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api";
import PartyBadge from "@/components/ui/PartyBadge";

interface PollingBoothAnalysisProps {
    constituencyId: number;
    constituencyName?: string;
}

const PollingBoothAnalysis = ({ constituencyId, constituencyName }: PollingBoothAnalysisProps) => {
    const [loading, setLoading] = useState(true);
    const [booths, setBooths] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const loadBooths = async (page: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.getConstituencyBooths(constituencyId, page, 10);

            if (result.success) {
                setBooths(Array.isArray(result.data) ? result.data : []);
                setTotalPages(result.meta?.totalPages || 1);
            } else {
                setError(result.error || 'Failed to load booth data');
                setBooths([]);
            }
        } catch (error) {
            console.error('Error loading booths:', error);
            setError('Failed to load booth analysis data');
            setBooths([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooths(currentPage);
    }, [constituencyId, currentPage]);

    const filteredBooths = booths.filter(booth => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            booth.booth_name?.toLowerCase().includes(query) ||
            booth.booth_number?.toString().includes(query) ||
            booth.winning_party?.toLowerCase().includes(query)
        );
    });

    const formatNumber = (num: number) => {
        return num?.toLocaleString('en-IN') || '0';
    };

    const getTurnoutBadge = (turnout: number) => {
        if (turnout >= 70) return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">High</Badge>;
        if (turnout >= 50) return <Badge variant="outline" className="text-yellow-700 border-yellow-300">Medium</Badge>;
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Low</Badge>;
    };

    if (loading && booths.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading booth analysis...</p>
            </div>
        );
    }

    if (error && booths.length === 0) {
        return (
            <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => loadBooths(currentPage)} variant="outline">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search booths by name or number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Total Booths</p>
                            <p className="text-2xl font-bold">{booths.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Average Voters</p>
                            <p className="text-2xl font-bold">
                                {formatNumber(Math.round(booths.reduce((acc, booth) => acc + (booth.total_electors || 0), 0) / booths.length))}
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
                                {booths.length > 0
                                    ? `${(booths.reduce((acc, booth) => acc + parseFloat(booth.booth_turnout || booth.turnout_percentage || 0), 0) / booths.length).toFixed(1)}%`
                                    : '0%'
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <ChevronRight className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Analysis Ready</p>
                            <p className="text-2xl font-bold text-green-600">✓</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Booths Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Polling Booth Analysis</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Detailed analysis of {constituencyName ? `booths in ${constituencyName}` : 'all polling booths'}
                    </p>
                </CardHeader>
                <CardContent>
                    {filteredBooths.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Booth No.</TableHead>
                                            <TableHead>Booth Name</TableHead>
                                            <TableHead>Total Voters</TableHead>
                                            <TableHead>Turnout</TableHead>
                                            <TableHead>Winning Party</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBooths.map((booth) => (
                                            <TableRow key={booth.booth_id || booth.booth_number}>
                                                <TableCell className="font-mono font-medium">
                                                    {booth.booth_number || 'N/A'}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {booth.booth_name || `Booth ${booth.booth_number}`}
                                                </TableCell>
                                                <TableCell>
                                                    {formatNumber(booth.total_electors || 0)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {booth.booth_turnout ? `${parseFloat(booth.booth_turnout).toFixed(1)}%` : 'N/A'}
                                                        {booth.booth_turnout && getTurnoutBadge(parseFloat(booth.booth_turnout))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {booth.winning_party ? (
                                                        <PartyBadge party={booth.winning_party} size="sm" />
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">No data</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link to={`/booth/${booth.booth_id || booth.booth_number}`}>
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
                                {searchQuery ? 'No booths match your search' : 'No booth data available'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center">
                <Button asChild variant="outline">
                    <Link to={`/constituency/${constituencyId}/booth-analysis`}>
                        View Advanced Booth Analysis
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default PollingBoothAnalysis;