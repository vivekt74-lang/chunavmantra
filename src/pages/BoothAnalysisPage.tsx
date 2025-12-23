// src/pages/BoothAnalysisPage.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
    MapPin,
    GitCompare,
    Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartyBadge from "@/components/ui/PartyBadge";
import { apiService } from "@/services/api";
import { Badge } from "@/components/ui/badge";

const BoothAnalysisPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [clustersData, setClustersData] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any>(null);
    const [demographics, setDemographics] = useState<any>(null);
    const [heatmapData, setHeatmapData] = useState<any>(null);
    const [partyPerformanceData, setPartyPerformanceData] = useState<any>(null);

    useEffect(() => {
        loadAnalysisData();
    }, [id]);

    const loadAnalysisData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            // Load all analysis data in parallel
            const [analysis, clusters, recs, demos, heatmap, partyPerformance] = await Promise.allSettled([
                apiService.getBoothAnalysis(parseInt(id)),
                apiService.getBoothClusters(parseInt(id)),
                apiService.getBoothRecommendations(parseInt(id)),
                apiService.getDemographicAnalysis(parseInt(id)),
                apiService.getHeatmapData(parseInt(id), 'turnout'),
                apiService.getPartyPerformance(parseInt(id), 'Samajwadi Party')
            ]);

            // Handle all results
            setAnalysisData(
                analysis.status === 'fulfilled' ? analysis.value : null
            );
            setClustersData(
                clusters.status === 'fulfilled' ? clusters.value : null
            );
            setRecommendations(
                recs.status === 'fulfilled' ? recs.value : null
            );
            setDemographics(
                demos.status === 'fulfilled' ? demos.value : null
            );
            setHeatmapData(
                heatmap.status === 'fulfilled' ? heatmap.value : null
            );
            setPartyPerformanceData(
                partyPerformance.status === 'fulfilled' ? partyPerformance.value : null
            );

        } catch (error) {
            console.error("Failed to load analysis data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading booth analysis...</p>
                </div>
            </div>
        );
    }

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
                            {analysisData?.summary?.ac_name || "Constituency"}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">Booth Analysis</span>
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
                                    Polling Booth Analysis
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    {analysisData?.summary?.ac_name || "Constituency"} • Advanced Booth Insights
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link to={`/constituency/${id}/compare-booths`}>
                                    <GitCompare className="h-4 w-4 mr-2" />
                                    Compare Booths
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
                {/* Analysis Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="clusters">Booth Clusters</TabsTrigger>
                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                        <TabsTrigger value="demographics">Demographics</TabsTrigger>
                        <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                        <TabsTrigger value="comparison">Compare</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Total Booths</p>
                                        <p className="text-2xl font-bold">{analysisData?.summary?.total_booths || 0}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Total Voters</p>
                                        <p className="text-2xl font-bold">
                                            {(analysisData?.summary?.total_electors || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Avg Turnout</p>
                                        <p className="text-2xl font-bold">{analysisData?.summary?.avg_turnout || 0}%</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Leading Party</p>
                                        <p className="text-2xl font-bold">
                                            {analysisData?.party_dominance?.[0]?.party_name?.substring(0, 10) || "N/A"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Party Dominance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Party Dominance Across Booths</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analysisData?.party_dominance?.map((party: any, index: number) => (
                                        <div key={party.party_name} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <PartyBadge party={party.party_name} />
                                                    <span className="text-sm text-muted-foreground">
                                                        {party.booths_won} booths
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold">
                                                    {((party.booths_won / analysisData?.summary?.total_booths) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(party.booths_won / analysisData?.summary?.total_booths) * 100}%`,
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

                        {/* Turnout Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Turnout Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-700">
                                            {analysisData?.insights?.high_turnout_booths || 0}
                                        </p>
                                        <p className="text-sm text-green-600">High Turnout (≥70%)</p>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <p className="text-2xl font-bold text-yellow-700">
                                            {analysisData?.insights?.total_booths_analyzed -
                                                (analysisData?.insights?.high_turnout_booths + analysisData?.insights?.low_turnout_booths) || 0}
                                        </p>
                                        <p className="text-sm text-yellow-600">Medium Turnout (50-69%)</p>
                                    </div>
                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <p className="text-2xl font-bold text-red-700">
                                            {analysisData?.insights?.low_turnout_booths || 0}
                                        </p>
                                        <p className="text-sm text-red-600">Low Turnout (&lt;50%)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Booth Clusters Tab */}
                    <TabsContent value="clusters" className="space-y-6">
                        {clustersData?.clusters?.map((cluster: any, index: number) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{cluster.cluster_type}</span>
                                        <Badge variant="outline">{cluster.booth_count} booths</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Average Electors</p>
                                            <p className="text-xl font-bold">{cluster.avg_electors}</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Average Turnout</p>
                                            <p className="text-xl font-bold">{cluster.avg_turnout}%</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Percentage</p>
                                            <p className="text-xl font-bold">
                                                {((cluster.booth_count / clustersData.total_booths) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Recommendations Tab */}
                    <TabsContent value="recommendations" className="space-y-6">
                        {recommendations?.recommendations?.slice(0, 10).map((rec: any, index: number) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            Booth {rec.booth_number}: {rec.booth_name}
                                        </CardTitle>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${rec.recommendation_category === 'Highly_Competitive'
                                            ? 'bg-red-100 text-red-800'
                                            : rec.recommendation_category === 'Low_Turnout_Opportunity'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : rec.recommendation_category === 'High_Density_Strategic'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {rec.recommendation_category.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Winning Party</p>
                                            <PartyBadge party={rec.winning_party} />
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Voters</p>
                                            <p className="text-xl font-bold">{rec.total_electors.toLocaleString()}</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Turnout</p>
                                            <p className="text-xl font-bold">{rec.turnout}%</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        <strong>Strategy:</strong> {rec.strategy_suggestion || 'Focus on voter engagement and mobilization.'}
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-4" asChild>
                                        <Link to={`/booth/${rec.booth_id}`}>
                                            View Booth Details
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Demographics Tab */}
                    <TabsContent value="demographics" className="space-y-6">
                        {demographics && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Gender Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                <p className="text-2xl font-bold text-blue-700">
                                                    {demographics.insights?.avg_male_percentage || 0}%
                                                </p>
                                                <p className="text-sm text-blue-600">Male</p>
                                            </div>
                                            <div className="text-center p-4 bg-pink-50 rounded-lg">
                                                <p className="text-2xl font-bold text-pink-700">
                                                    {demographics.insights?.avg_female_percentage || 0}%
                                                </p>
                                                <p className="text-sm text-pink-600">Female</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-gray-700">
                                                    {100 - (demographics.insights?.avg_male_percentage + demographics.insights?.avg_female_percentage) || 0}%
                                                </p>
                                                <p className="text-sm text-gray-600">Other</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Demographic Clusters</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                                <p className="text-2xl font-bold">
                                                    {demographics.insights?.demographic_clusters?.male_dominated || 0}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Male Dominated Booths</p>
                                            </div>
                                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                                <p className="text-2xl font-bold">
                                                    {demographics.insights?.demographic_clusters?.female_dominated || 0}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Female Dominated Booths</p>
                                            </div>
                                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                                <p className="text-2xl font-bold">
                                                    {demographics.insights?.demographic_clusters?.balanced || 0}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Balanced Booths</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </TabsContent>

                    {/* Heatmap Tab */}
                    <TabsContent value="heatmap" className="space-y-6">
                        {heatmapData ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Booth Heatmap</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Visual representation of booth intensity based on {heatmapData.metadata?.metric || 'turnout'}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {heatmapData.heatmap?.slice(0, 24).map((booth: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="p-4 rounded-lg border text-center"
                                                    style={{
                                                        backgroundColor: `rgba(59, 130, 246, ${booth.normalized_intensity / 100})`,
                                                        borderColor: `rgba(59, 130, 246, ${0.3 + (booth.normalized_intensity / 100) * 0.7})`
                                                    }}
                                                >
                                                    <p className="font-bold text-white text-shadow">
                                                        Booth {booth.booth_number}
                                                    </p>
                                                    <p className="text-xs text-white/90">
                                                        {booth.turnout_percentage?.toFixed(1)}% turnout
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">Intensity Legend</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Color intensity represents {heatmapData.metadata?.metric || 'turnout'} level
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs">Low</span>
                                                    <div className="w-32 h-4 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-600 rounded"></div>
                                                    <span className="text-xs">High</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Heatmap data not available</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Comparison Tab */}
                    <TabsContent value="comparison" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Compare Multiple Booths</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Compare performance metrics across multiple polling booths
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        Advanced Booth Comparison
                                    </h3>
                                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                        Use our dedicated booth comparison tool to analyze and compare multiple booths side by side.
                                    </p>
                                    <Button asChild size="lg">
                                        <Link to={`/constituency/${id}/compare-booths`}>
                                            <GitCompare className="mr-2 h-5 w-5" />
                                            Open Comparison Tool
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default BoothAnalysisPage;