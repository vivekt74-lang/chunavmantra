// src/pages/BoothComparisonPage.tsx - FIXED VERSION
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
    ChevronRight,
    ArrowLeft,
    BarChart3,
    TrendingUp,
    Users,
    Target,
    Filter,
    Download,
    Share2,
    Building2,
    X,
    Search,
    GitCompare,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api";
import PartyBadge from "@/components/ui/PartyBadge";

const BoothComparisonPage = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [selectedBooths, setSelectedBooths] = useState<number[]>([]);
    const [comparisonData, setComparisonData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [availableBooths, setAvailableBooths] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load booth IDs from URL params
        const boothIdsParam = searchParams.get('booths');
        if (boothIdsParam) {
            const ids = boothIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            setSelectedBooths(ids);
        }

        loadAvailableBooths();
    }, [id, searchParams]);

    const loadAvailableBooths = async () => {
        if (!id) return;

        try {
            const data = await apiService.getConstituencyBooths(parseInt(id), 1, 50);
            setAvailableBooths(data.data || []);
        } catch (error) {
            console.error('Error loading booths:', error);
            setError('Failed to load booths. Please try again.');
        }
    };

    const compareBooths = async () => {
        if (selectedBooths.length < 2) {
            setComparisonData(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await apiService.compareBooths(selectedBooths);
            // Fix data types - ensure numeric fields are numbers
            if (data && data.booths) {
                const fixedData = {
                    ...data,
                    booths: data.booths.map((booth: any) => ({
                        ...booth,
                        total_electors: Number(booth.total_electors) || 0,
                        total_votes_cast: Number(booth.total_votes_cast) || 0,
                        male_voters: Number(booth.male_voters) || 0,
                        female_voters: Number(booth.female_voters) || 0,
                        turnout_percentage: parseFloat(booth.turnout_percentage) || 0, // Convert string to number
                        winning_votes: Number(booth.winning_votes) || 0
                    })),
                    summary: data.summary ? {
                        ...data.summary,
                        total_booths: Number(data.summary.total_booths) || 0,
                        avg_turnout: data.summary.avg_turnout !== null ?
                            parseFloat(data.summary.avg_turnout) || 0 :
                            data.booths?.reduce((sum: number, booth: any) =>
                                sum + (parseFloat(booth.turnout_percentage) || 0), 0) / data.booths?.length || 0,
                        total_electors: Number(data.summary.total_electors) || 0,
                        total_votes: Number(data.summary.total_votes) || 0
                    } : null
                };
                setComparisonData(fixedData);
            } else {
                setComparisonData(data);
            }
        } catch (error) {
            console.error('Error comparing booths:', error);
            setError('Failed to compare booths. Please try again.');
            setComparisonData(null);
        } finally {
            setLoading(false);
        }
    };

    const addBooth = (boothId: number) => {
        if (!selectedBooths.includes(boothId)) {
            setSelectedBooths([...selectedBooths, boothId]);
        }
    };

    const removeBooth = (boothId: number) => {
        setSelectedBooths(selectedBooths.filter(id => id !== boothId));
    };

    const filteredBooths = availableBooths.filter(booth => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            booth.booth_name?.toLowerCase().includes(query) ||
            booth.booth_number?.toString().includes(query)
        );
    });

    // Helper function to safely format numbers
    const formatNumber = (num: any): string => {
        if (num === null || num === undefined) return 'N/A';
        const number = Number(num);
        return isNaN(number) ? 'N/A' : number.toLocaleString('en-IN');
    };

    // Helper function to safely format percentages
    const formatPercentage = (num: any): string => {
        if (num === null || num === undefined) return 'N/A';
        const number = Number(num);
        return isNaN(number) ? 'N/A' : number.toFixed(1) + '%';
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="container px-4 py-6">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link to={`/constituency/${id}`} className="hover:text-primary transition-colors">
                            Constituency
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">Compare Booths</span>
                    </nav>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link to={`/constituency/${id}`}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                                    Compare Polling Booths
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Compare performance metrics across multiple polling booths
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={compareBooths}
                                disabled={selectedBooths.length < 2 || loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <GitCompare className="h-4 w-4 mr-2" />
                                )}
                                {loading ? 'Comparing...' : `Compare (${selectedBooths.length})`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Booth Selection */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Select Booths to Compare</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Select 2 or more booths to compare their performance
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Input
                                        placeholder="Search booths..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Selected Booths */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Selected Booths ({selectedBooths.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedBooths.map(boothId => {
                                            const booth = availableBooths.find(b => b.booth_id === boothId);
                                            return (
                                                <Badge key={boothId} variant="secondary" className="pl-2 pr-1 py-1">
                                                    {booth?.booth_number || `Booth ${boothId}`}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                                        onClick={() => removeBooth(boothId)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                    {selectedBooths.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedBooths([])}
                                            className="h-8 text-xs"
                                        >
                                            Clear All
                                        </Button>
                                    )}
                                </div>

                                {/* Available Booths List */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Available Booths</h4>
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {filteredBooths.map(booth => (
                                            <div
                                                key={booth.booth_id}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedBooths.includes(booth.booth_id)
                                                    ? 'bg-primary/10 border-primary'
                                                    : 'hover:bg-muted/50 border-border'
                                                    }`}
                                                onClick={() => addBooth(booth.booth_id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Booth {booth.booth_number}</p>
                                                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                            {booth.booth_name}
                                                        </p>
                                                    </div>
                                                    {selectedBooths.includes(booth.booth_id) && (
                                                        <Badge variant="default" className="bg-primary text-primary-foreground">Selected</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Comparison Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                                <p className="text-muted-foreground">Comparing booths...</p>
                            </div>
                        ) : comparisonData ? (
                            <>
                                {/* Comparison Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Comparison Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Booths</p>
                                                <p className="text-2xl font-bold">{comparisonData.summary?.total_booths || 0}</p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Electors</p>
                                                <p className="text-2xl font-bold">
                                                    {formatNumber(comparisonData.summary?.total_electors)}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Votes</p>
                                                <p className="text-2xl font-bold">
                                                    {formatNumber(comparisonData.summary?.total_votes)}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Avg Turnout</p>
                                                <p className="text-2xl font-bold">
                                                    {formatPercentage(comparisonData.summary?.avg_turnout)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Detailed Comparison */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Booth Comparison Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-3 font-medium text-muted-foreground">Metric</th>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <th key={booth.booth_id} className="text-left p-3 font-medium text-muted-foreground">
                                                                Booth {booth.booth_number}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Booth Name</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                <div className="truncate max-w-[200px]" title={booth.booth_name}>
                                                                    {booth.booth_name}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Total Electors</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                {formatNumber(booth.total_electors)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Votes Cast</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                {formatNumber(booth.total_votes_cast)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Turnout %</td>
                                                        {comparisonData.booths?.map((booth: any) => {
                                                            const turnout = booth.turnout_percentage;
                                                            const turnoutNum = Number(turnout);
                                                            const isHigh = turnoutNum >= 70;
                                                            const isMedium = turnoutNum >= 50 && turnoutNum < 70;

                                                            return (
                                                                <td key={booth.booth_id} className="p-3">
                                                                    <div className="flex items-center gap-2">
                                                                        {formatPercentage(turnout)}
                                                                        {isHigh ? (
                                                                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">High</Badge>
                                                                        ) : isMedium ? (
                                                                            <Badge variant="outline" className="text-yellow-700 border-yellow-300 text-xs">Medium</Badge>
                                                                        ) : (
                                                                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">Low</Badge>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Male Voters</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                {formatNumber(booth.male_voters)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Female Voters</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                {formatNumber(booth.female_voters)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 font-medium">Winning Party</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                <PartyBadge party={booth.winning_party} />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-12">
                                <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {selectedBooths.length === 1 ? 'Select More Booths' : 'Select Booths to Compare'}
                                </h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                    {selectedBooths.length === 1
                                        ? 'Select at least one more booth to start comparing.'
                                        : 'Choose 2 or more polling booths from the left panel to start comparing their performance metrics.'}
                                </p>
                                {selectedBooths.length > 0 && (
                                    <div className="flex gap-4 justify-center">
                                        <Button onClick={compareBooths} disabled={selectedBooths.length < 2}>
                                            Compare Selected Booths
                                        </Button>
                                        <Button variant="outline" onClick={() => setSelectedBooths([])}>
                                            Clear Selection
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoothComparisonPage;