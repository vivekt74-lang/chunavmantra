// src/pages/StatePage.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Users,
    Building2,
    BarChart3,
    TrendingUp,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiService } from "@/services/api";
import type { State, AssemblyConstituency } from "@/types";

const StatePage = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [state, setState] = useState<State | null>(null);
    const [assemblies, setAssemblies] = useState<AssemblyConstituency[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                // Check if state data was passed in navigation state
                const stateFromRoute = location.state?.stateData;

                if (stateFromRoute) {
                    setState(stateFromRoute);
                } else {
                    // Fetch state data
                    const stateData = await apiService.getStateById(parseInt(id));
                    setState(stateData);
                }

                // Fetch assemblies for this state
                const assembliesData = await apiService.getStateAssemblies(parseInt(id));
                setAssemblies(assembliesData);

                // Fetch state stats
                const statsData = await apiService.getStateStats(parseInt(id));
                setStats(statsData);

            } catch (error) {
                console.error("Failed to load state data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, location.state]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading state data...</p>
                </div>
            </div>
        );
    }

    if (!state) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        State Not Found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        The state you're looking for doesn't exist.
                    </p>
                    <Button asChild>
                        <Link to="/dashboard">Return to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const formatIndianNumber = (num: number) => {
        return num.toLocaleString('en-IN');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="container px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/dashboard">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                                {state.state_name}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Election Data and Assembly Constituencies
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Assembly Constituencies</p>
                                <p className="text-2xl font-bold">{assemblies.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Total Voters</p>
                                <p className="text-2xl font-bold">
                                    {stats?.total_voters ? formatIndianNumber(stats.total_voters) : "N/A"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Avg Turnout</p>
                                <p className="text-2xl font-bold">{stats?.avg_turnout || 0}%</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Polling Booths</p>
                                <p className="text-2xl font-bold">
                                    {stats?.total_booths ? formatIndianNumber(stats.total_booths) : "N/A"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assembly Constituencies List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assembly Constituencies</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Browse and explore detailed data for each assembly constituency in {state.state_name}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {assemblies.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Constituency</TableHead>
                                            <TableHead>District</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Total Voters</TableHead>
                                            <TableHead className="text-right">Polling Booths</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assemblies.map((assembly) => (
                                            <TableRow key={assembly.constituency_id}>
                                                <TableCell className="font-medium">
                                                    {assembly.constituency_name}
                                                </TableCell>
                                                <TableCell>{assembly.district}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${assembly.category === 'SC' ? 'bg-blue-100 text-blue-800' :
                                                        assembly.category === 'ST' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {assembly.category || 'GEN'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatIndianNumber(assembly.total_voters)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {assembly.polling_booths}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" asChild>
                                                        <Link to={`/constituency/${assembly.constituency_id}`}>
                                                            View Details
                                                            <ExternalLink className="ml-2 h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No assembly constituencies found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StatePage;