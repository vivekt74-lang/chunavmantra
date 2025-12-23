// src/pages/BoothDetailsPage.tsx - UPDATED VERSION
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    ChevronRight,
    ArrowLeft,
    Users,
    TrendingUp,
    Target,
    MapPin,
    BarChart3,
    Download,
    Share2,
    Printer,
    Building2,
    GitCompare,
    Calendar,
    Trophy,
    Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartyBadge from "@/components/ui/PartyBadge";
import { apiService } from "@/services/api";

const BoothDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [booth, setBooth] = useState<any>(null);
    const [results, setResults] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [trends, setTrends] = useState<any[]>([]);
    const [constituencyBooths, setConstituencyBooths] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            loadBoothDetails();
        }
    }, [id]);

    const loadBoothDetails = async () => {
        if (!id) return;

        setLoading(true);
        try {
            // Load booth details
            const boothData = await apiService.getBoothDetails(parseInt(id));
            setBooth(boothData.booth || boothData);

            // Load booth results
            const resultsData = await apiService.getBoothResults(parseInt(id));
            setResults(resultsData || []);

            // Load trends if available
            try {
                const trendsData = await apiService.getBoothTrends(parseInt(id));
                setTrends(trendsData.trends || []);
            } catch (error) {
                console.log("Trends not available:", error);
            }

            // Load other booths from same constituency for comparison
            if (boothData.booth?.ac_id) {
                const boothsData = await apiService.getConstituencyBooths(boothData.booth.ac_id, 1, 10);
                setConstituencyBooths(boothsData.data || []);
            }

        } catch (error) {
            console.error("Failed to load booth details:", error);
            // Redirect to 404 if booth not found
            navigate('/404');
        } finally {
            setLoading(false);
        }
    };

    const formatIndianNumber = (num: number) => {
        return num?.toLocaleString('en-IN') || '0';
    };

    const getWinner = () => {
        return results[0];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading booth details...</p>
                </div>
            </div>
        );
    }

    if (!booth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        Booth Not Found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        The polling booth you're looking for doesn't exist.
                    </p>
                    <Button asChild>
                        <Link to="/dashboard">Return to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const winner = getWinner();
    const totalVotes = results.reduce((sum, result) => sum + (result.votes_secured || result.votes || 0), 0);

    // Calculate some statistics
    const turnout = booth.turnout_percentage ||
        (booth.total_votes_cast && booth.total_electors ?
            ((booth.total_votes_cast / booth.total_electors) * 100).toFixed(1) : 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="container px-4 py-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        {booth.ac_id && (
                            <>
                                <Link to={`/constituency/${booth.ac_id}`} className="hover:text-primary transition-colors">
                                    {booth.ac_name || "Constituency"}
                                </Link>
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                        <span className="text-foreground font-medium">Booth {booth.booth_number}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link to={booth.ac_id ? `/constituency/${booth.ac_id}` : "/dashboard"}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                                        Booth {booth.booth_number}
                                    </h1>
                                    <Badge variant="outline" className="text-xs">
                                        Polling Station
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1">
                                    {booth.booth_name} • {booth.ac_name || booth.constituency_name}, {booth.state_name || "State"}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link to={`/constituency/${booth.ac_id}/booth-analysis`}>
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Analysis
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="results">Election Results</TabsTrigger>
                        <TabsTrigger value="demographics">Demographics</TabsTrigger>
                        <TabsTrigger value="comparison">Compare</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Booth Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Booth Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Booth Number</p>
                                                <p className="font-semibold text-lg">{booth.booth_number}</p>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Constituency</p>
                                                <p className="font-semibold">{booth.ac_name || booth.constituency_name || "N/A"}</p>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">District</p>
                                                <p className="font-semibold">{booth.district_name || booth.district || "N/A"}</p>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">State</p>
                                                <p className="font-semibold">{booth.state_name || "N/A"}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Voter Demographics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Voter Demographics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Total Electors</p>
                                                <p className="text-2xl font-bold">
                                                    {formatIndianNumber(booth.total_electors || 0)}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-center p-2 bg-blue-50 rounded">
                                                    <p className="text-lg font-bold text-blue-700">
                                                        {booth.male_voters && booth.total_electors
                                                            ? Math.round((booth.male_voters / booth.total_electors) * 100)
                                                            : 52}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Male</p>
                                                </div>
                                                <div className="text-center p-2 bg-pink-50 rounded">
                                                    <p className="text-lg font-bold text-pink-700">
                                                        {booth.female_voters && booth.total_electors
                                                            ? Math.round((booth.female_voters / booth.total_electors) * 100)
                                                            : 48}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Female</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <p className="text-lg font-bold text-gray-700">
                                                        {booth.other_voters && booth.total_electors
                                                            ? Math.round((booth.other_voters / booth.total_electors) * 100)
                                                            : 0}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Other</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Performance Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">Total Voters</p>
                                                <p className="text-2xl font-bold">
                                                    {formatIndianNumber(booth.total_electors || 0)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">Turnout</p>
                                                <p className="text-2xl font-bold">
                                                    {typeof turnout === 'number' ? turnout.toFixed(1) : turnout}%
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">Votes Cast</p>
                                                <p className="text-2xl font-bold">
                                                    {formatIndianNumber(booth.total_votes_cast || totalVotes)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">Candidates</p>
                                                <p className="text-2xl font-bold">{results.length}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Quick Winner Info */}
                                {winner && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">2022 Election Winner</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-lg">
                                                        <Trophy className="h-8 w-8 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Winning Candidate</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <PartyBadge party={winner.party_name} />
                                                            <span className="font-semibold text-lg">{winner.candidate_name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Votes Secured</p>
                                                    <p className="text-xl font-bold text-green-700">
                                                        {formatIndianNumber(winner.votes_secured || winner.votes)} votes
                                                    </p>
                                                    <p className="text-sm text-green-600">
                                                        {totalVotes > 0
                                                            ? ((winner.votes_secured || winner.votes) * 100 / totalVotes).toFixed(1)
                                                            : 0}% vote share
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Results Tab */}
                    <TabsContent value="results" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">2022 Election Results</CardTitle>
                                    <div className="text-sm text-muted-foreground">
                                        Total Votes: {formatIndianNumber(totalVotes)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {results.length > 0 ? (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Rank</TableHead>
                                                    <TableHead>Candidate</TableHead>
                                                    <TableHead>Party</TableHead>
                                                    <TableHead className="text-right">Votes</TableHead>
                                                    <TableHead className="text-right">Vote Share</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.map((result, index) => (
                                                    <TableRow key={index} className={index === 0 ? "bg-green-50" : ""}>
                                                        <TableCell className="font-medium">
                                                            {index === 0 ? (
                                                                <span className="flex items-center gap-1">
                                                                    {index + 1} <span className="text-lg">🏆</span>
                                                                </span>
                                                            ) : (
                                                                index + 1
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {result.candidate_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <PartyBadge party={result.party_name} size="sm" />
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {formatIndianNumber(result.votes_secured || result.votes || 0)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary rounded-full"
                                                                        style={{
                                                                            width: `${totalVotes > 0
                                                                                ? ((result.votes_secured || result.votes || 0) * 100 / totalVotes).toFixed(1)
                                                                                : 0}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="font-mono font-medium w-12 text-right">
                                                                    {totalVotes > 0
                                                                        ? ((result.votes_secured || result.votes || 0) * 100 / totalVotes).toFixed(1)
                                                                        : 0}%
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No election data available for this booth</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Demographics Tab */}
                    <TabsContent value="demographics" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Voter Demographics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-blue-700">Male Voters</span>
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-blue-800">
                                            {formatIndianNumber(booth.male_voters || 0)}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            {booth.total_electors
                                                ? `${Math.round((booth.male_voters / booth.total_electors) * 100)}% of total`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-pink-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-pink-700">Female Voters</span>
                                            <Users className="h-5 w-5 text-pink-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-pink-800">
                                            {formatIndianNumber(booth.female_voters || 0)}
                                        </p>
                                        <p className="text-sm text-pink-600">
                                            {booth.total_electors
                                                ? `${Math.round((booth.female_voters / booth.total_electors) * 100)}% of total`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Other Voters</span>
                                            <Users className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formatIndianNumber(booth.other_voters || 0)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {booth.total_electors
                                                ? `${Math.round((booth.other_voters / booth.total_electors) * 100)}% of total`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Comparison Tab */}
                    <TabsContent value="comparison" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Compare with Other Booths</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Compare this booth with others from the same constituency
                                </p>
                            </CardHeader>
                            <CardContent>
                                {constituencyBooths.length > 1 ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="font-medium text-blue-800 mb-2">Current Booth: Booth {booth.booth_number}</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-blue-600">Voters: {formatIndianNumber(booth.total_electors || 0)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-blue-600">Turnout: {turnout}%</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-4">
                                            <h4 className="font-medium">Other Booths in {booth.ac_name || "Constituency"}</h4>
                                            {constituencyBooths
                                                .filter(b => b.booth_id !== booth.booth_id)
                                                .slice(0, 5)
                                                .map(otherBooth => (
                                                    <div key={otherBooth.booth_id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">Booth {otherBooth.booth_number}</p>
                                                                <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                                                    {otherBooth.booth_name}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium">
                                                                        {formatIndianNumber(otherBooth.total_electors || 0)} voters
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {otherBooth.turnout_percentage || otherBooth.booth_turnout || 0}% turnout
                                                                    </p>
                                                                </div>
                                                                <Button size="sm" variant="outline" asChild>
                                                                    <Link to={`/booth/${otherBooth.booth_id}`}>
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        <div className="pt-4 border-t">
                                            <Button className="w-full" asChild>
                                                <Link to={`/constituency/${booth.ac_id}/compare-booths?booths=${booth.booth_id}`}>
                                                    <GitCompare className="mr-2 h-4 w-4" />
                                                    Compare with Selected Booths
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No other booths available for comparison</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default BoothDetailsPage;