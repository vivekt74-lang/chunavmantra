// src/pages/BoothDetailsPage.tsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
    Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PartyBadge from "@/components/ui/PartyBadge";
import { apiService } from "@/services/api";

const BoothDetailsPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [booth, setBooth] = useState<any>(null);
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        loadBoothDetails();
    }, [id]);

    const loadBoothDetails = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await apiService.getBoothDetails(parseInt(id));
            setBooth(data.booth);
            setResults(data.results || []);
        } catch (error) {
            console.error("Failed to load booth details:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatIndianNumber = (num: number) => {
        return num.toLocaleString('en-IN');
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
                        <Link to={`/constituency/${booth.ac_id}`} className="hover:text-primary transition-colors">
                            {booth.ac_name}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">Booth {booth.booth_number}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link to={`/constituency/${booth.ac_id}`}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                                        Booth {booth.booth_number}
                                    </h1>
                                    <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
                                        Polling Station
                                    </span>
                                </div>
                                <p className="text-muted-foreground mt-1">
                                    {booth.booth_name} • {booth.ac_name}, {booth.state_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm">
                                <Printer className="h-4 w-4 mr-2" />
                                Print
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
                                        <p className="font-semibold">{booth.ac_name}</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">District</p>
                                        <p className="font-semibold">{booth.district_name}</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">State</p>
                                        <p className="font-semibold">{booth.state_name}</p>
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
                                            {formatIndianNumber(booth.total_electors)}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 bg-blue-50 rounded">
                                            <p className="text-lg font-bold text-blue-700">
                                                {booth.male_voters ? Math.round((booth.male_voters / booth.total_electors) * 100) : 52}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">Male</p>
                                        </div>
                                        <div className="text-center p-2 bg-pink-50 rounded">
                                            <p className="text-lg font-bold text-pink-700">
                                                {booth.female_voters ? Math.round((booth.female_voters / booth.total_electors) * 100) : 48}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">Female</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-lg font-bold text-gray-700">
                                                {booth.other_voters ? Math.round((booth.other_voters / booth.total_electors) * 100) : 0}%
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
                                            {formatIndianNumber(booth.total_electors)}
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
                                            {booth.turnout_percentage ? booth.turnout_percentage.toFixed(1) : 0}%
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
                                            {formatIndianNumber(booth.total_votes_cast)}
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

                        {/* Election Results */}
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
                                                                            width: `${((result.votes_secured || result.votes || 0) * 100 / totalVotes).toFixed(1)}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="font-mono font-medium w-12 text-right">
                                                                    {((result.votes_secured || result.votes || 0) * 100 / totalVotes).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* Winner Highlight */}
                                        {winner && (
                                            <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Winning Candidate</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <PartyBadge party={winner.party_name} />
                                                            <span className="font-semibold text-lg">{winner.candidate_name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-muted-foreground">Votes Secured</p>
                                                        <p className="text-xl font-bold text-green-700">
                                                            {formatIndianNumber(winner.votes_secured || winner.votes)} votes
                                                        </p>
                                                        <p className="text-sm text-green-600">
                                                            {((winner.votes_secured || winner.votes) * 100 / totalVotes).toFixed(1)}% vote share
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No election data available for this booth</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Comparison with Constituency */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Comparison with {booth.ac_name} Constituency</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Turnout Comparison</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Booth Turnout</span>
                                                <span className="font-semibold">{booth.turnout_percentage?.toFixed(1) || 0}%</span>
                                            </div>
                                            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${booth.turnout_percentage || 0}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Constituency Avg</span>
                                                <span className="font-semibold">{booth.constituency_turnout?.toFixed(1) || 0}%</span>
                                            </div>
                                            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${booth.constituency_turnout || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Performance Indicator</h4>
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted-foreground">Voter Density</span>
                                                <Badge variant={booth.voter_density > 800 ? "destructive" : "default"}>
                                                    {booth.voter_density > 800 ? "High" : "Normal"}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Average voters per booth in constituency: {booth.constituency_avg_voters?.toFixed(0) || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoothDetailsPage;