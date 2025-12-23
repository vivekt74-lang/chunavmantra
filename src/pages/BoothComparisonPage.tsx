// src/pages/BoothComparisonPage.tsx
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
    GitCompare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api";
import PartyBadge from "@/components/ui/PartyBadge";

const BoothComparisonPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [selectedBooths, setSelectedBooths] = useState<number[]>([]);
    const [comparisonData, setComparisonData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [availableBooths, setAvailableBooths] = useState<any[]>([]);

    useEffect(() => {
        // Load booth IDs from URL params
        const boothIdsParam = searchParams.get('booths');
        if (boothIdsParam) {
            const ids = boothIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            setSelectedBooths(ids);
        }

        loadAvailableBooths();
    }, [id]);

    useEffect(() => {
        if (selectedBooths.length > 0) {
            compareBooths();
        }
    }, [selectedBooths]);

    const loadAvailableBooths = async () => {
        try {
            const data = await apiService.getConstituencyBooths(parseInt(id || '0'), 1, 50);
            setAvailableBooths(data.data || []);
        } catch (error) {
            console.error('Error loading booths:', error);
        }
    };

    const compareBooths = async () => {
        if (selectedBooths.length < 2) {
            setComparisonData(null);
            return;
        }

        setLoading(true);
        try {
            const data = await apiService.compareBooths(selectedBooths);
            setComparisonData(data);
        } catch (error) {
            console.error('Error comparing booths:', error);
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
                            <Button variant="outline" size="sm" onClick={compareBooths} disabled={selectedBooths.length < 2}>
                                <GitCompare className="h-4 w-4 mr-2" />
                                Compare ({selectedBooths.length})
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 py-8">
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
                                                        className="h-4 w-4 p-0 ml-1"
                                                        onClick={() => removeBooth(boothId)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
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
                                                    : 'hover:bg-muted/50'
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
                                                        <Badge variant="default">Selected</Badge>
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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
                                                    {(comparisonData.summary?.total_electors || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Votes</p>
                                                <p className="text-2xl font-bold">
                                                    {(comparisonData.summary?.total_votes || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Avg Turnout</p>
                                                <p className="text-2xl font-bold">
                                                    {comparisonData.summary?.avg_turnout?.toFixed(1) || 0}%
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
                                                        <th className="text-left p-3">Metric</th>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <th key={booth.booth_id} className="text-left p-3">
                                                                Booth {booth.booth_number}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Booth Name</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">{booth.booth_name}</td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Total Electors</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                {booth.total_electors?.toLocaleString()}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Votes Cast</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                {booth.total_votes_cast?.toLocaleString()}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 font-medium">Turnout %</td>
                                                        {comparisonData.booths?.map((booth: any) => (
                                                            <td key={booth.booth_id} className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    {booth.turnout_percentage?.toFixed(1)}%
                                                                    {booth.turnout_percentage >= 70 ? (
                                                                        <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>
                                                                    ) : booth.turnout_percentage >= 50 ? (
                                                                        <Badge variant="outline" className="text-yellow-700">Medium</Badge>
                                                                    ) : (
                                                                        <Badge variant="destructive" className="bg-red-100 text-red-800">Low</Badge>
                                                                    )}
                                                                </div>
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
                            <div className="text-center py-12">
                                <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Select Booths to Compare
                                </h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                    Choose 2 or more polling booths from the left panel to start comparing their performance metrics.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoothComparisonPage;