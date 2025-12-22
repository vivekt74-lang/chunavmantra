// src/pages/ConstituencyPage.tsx - UPDATED WITH REAL DATA
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  Download,
  Share2,
  Printer,
  Users,
  Building2,
  MapPin,
  TrendingUp,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Trophy,
  Percent,
  Target,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import VoteShareChart from "@/components/charts/VoteShareChart";
import TurnoutChart from "@/components/charts/TurnoutChart";
import DemographicChart from "@/components/charts/DemographicChart";
import DataCard from "@/components/ui/DataCard";
import PartyBadge from "@/components/ui/PartyBadge";
import { apiService } from "@/services/api";
import type { AssemblyConstituency, ElectionResult, DemographicData } from "@/types";
import PollingBoothAnalysis from "@/components/analysis/PollingBoothAnalysis";

const ConstituencyPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [constituency, setConstituency] = useState<AssemblyConstituency | null>(null);
  const [electionResults, setElectionResults] = useState<ElectionResult[]>([]);
  const [demographicData, setDemographicData] = useState<DemographicData | null>(null);
  const [historicalMLAs, setHistoricalMLAs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [constituencyData, results, demographics, mlas, constituencyStats] = await Promise.all([
          apiService.getConstituencyById(parseInt(id)),
          apiService.getElectionResults(parseInt(id), 2022),
          apiService.getConstituencyDemographics(parseInt(id)),
          apiService.getHistoricalMLAs(parseInt(id)),
          apiService.getConstituencyStats(parseInt(id))
        ]);

        setConstituency(constituencyData?.constituency || constituencyData);
        setElectionResults(results);
        setDemographicData(demographics);
        setHistoricalMLAs(mlas);
        setStats(constituencyStats);
      } catch (error) {
        console.error("Failed to load constituency data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getWinner = () => {
    return electionResults.find(result => result.rank === 1);
  };

  const getRunnerUp = () => {
    return electionResults.find(result => result.rank === 2);
  };

  const calculateVictoryMargin = () => {
    const winner = getWinner();
    const runnerUp = getRunnerUp();

    if (winner && runnerUp) {
      return {
        votes: winner.votes - runnerUp.votes,
        percentage: winner.vote_percentage - runnerUp.vote_percentage
      };
    }
    return { votes: 0, percentage: 0 };
  };

  const getLeadingPartyBooths = () => {
    // Calculate which party leads in most booths (simplified)
    const partyCounts: Record<string, number> = {};
    electionResults.forEach(result => {
      if (result.rank === 1) {
        partyCounts[result.party_name] = (partyCounts[result.party_name] || 0) + 1;
      }
    });

    return Object.entries(partyCounts)
      .map(([party, count]) => ({ party, count }))
      .sort((a, b) => b.count - a.count);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading constituency data...</p>
        </div>
      </div>
    );
  }

  if (!constituency) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Constituency Not Found
          </h3>
          <p className="text-muted-foreground mb-6">
            The constituency you're looking for doesn't exist or could not be loaded.
          </p>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const victoryMargin = calculateVictoryMargin();
  const winner = getWinner();
  const leadingParties = getLeadingPartyBooths();
  const margin = stats?.margin_2022 || victoryMargin.votes;
  const marginPercentage = stats?.margin_percentage_2022 || victoryMargin.percentage;

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
            <span className="text-foreground font-medium">{constituency.state_name || "State"}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{constituency.constituency_name}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                    {constituency.constituency_name}
                  </h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${constituency.category === 'SC' ? 'bg-blue-100 text-blue-800' :
                    constituency.category === 'ST' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {constituency.category} Constituency
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">
                  {constituency.district} • {constituency.state_name}
                  {constituency.parliament_seat && ` • ${constituency.parliament_seat} Parliament`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/constituency/${constituency.constituency_id}/booth-analysis`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Booth Analysis
                </Link>
              </Button>
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
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DataCard
            title="Total Voters"
            value={formatIndianNumber(constituency.total_voters)}
            icon={Users}
            trend={{ value: 5.2, isPositive: true }}
          />
          <DataCard
            title="Polling Booths"
            value={constituency.polling_booths.toString()}
            icon={Building2}
          />
          <DataCard
            title="Turnout 2022"
            value={stats?.turnout_2022 ? `${stats.turnout_2022.toFixed(1)}%` : "N/A"}
            icon={TrendingUp}
            trend={{ value: 2.8, isPositive: true }}
          />
          <DataCard
            title="Victory Margin"
            value={margin > 0 ? formatIndianNumber(margin) : "N/A"}
            subtitle={marginPercentage > 0 ? `${marginPercentage.toFixed(2)}% votes` : "N/A"}
            icon={Trophy}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Constituency Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Constituency Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">Category</p>
                    <p className="font-semibold text-foreground">{constituency.category || "GEN"}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">District</p>
                    <p className="font-semibold text-foreground">{constituency.district}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">Parliament Seat</p>
                    <p className="font-semibold text-foreground">{constituency.parliament_seat || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">State</p>
                    <p className="font-semibold text-foreground">{constituency.state_name || "N/A"}</p>
                  </div>
                </div>
                {constituency.reserved_for && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">Reserved For</p>
                    <p className="font-semibold text-foreground">{constituency.reserved_for}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demographics Card */}
            {demographicData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {demographicData.caste_distribution && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Caste Distribution</p>
                        <DemographicChart data={demographicData.caste_distribution} type="caste" />
                      </div>
                    )}
                    {demographicData.urban_rural && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Urban vs Rural</p>
                        <DemographicChart data={demographicData.urban_rural} type="urbanRural" />
                      </div>
                    )}
                    {demographicData.gender_distribution && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Gender Distribution</p>
                        <DemographicChart data={demographicData.gender_distribution} type="gender" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Turnout Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Turnout Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <TurnoutChart constituencyId={constituency.constituency_id} />
              </CardContent>
            </Card>

            {/* Historical MLAs Timeline */}
            {historicalMLAs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Elected Representatives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-4">
                      {historicalMLAs.slice(0, 5).map((mla, index) => (
                        <div key={index} className="relative pl-10">
                          <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                          <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-bold text-primary">{mla.election_year || mla.year}</span>
                                <p className="font-medium text-foreground">{mla.candidate_name || mla.name}</p>
                                <PartyBadge party={mla.party_name || mla.party} size="sm" className="mt-1" />
                              </div>
                              {mla.is_winner && (
                                <span className="text-2xl">🏆</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Charts & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Historical Vote Share */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Historical Vote Share</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Chart
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <VoteShareChart constituencyId={constituency.constituency_id} />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Party-wise vote share percentage across elections
                </p>
              </CardContent>
            </Card>

            {/* Election Results */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">2022 Election Results</CardTitle>
                  <div className="flex gap-2">
                    <select className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground">
                      <option>2022</option>
                      <option>2017</option>
                      <option>2012</option>
                    </select>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {electionResults.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Rank</TableHead>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead className="text-right">Votes</TableHead>
                          <TableHead className="text-right">Vote Share</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {electionResults.map((result) => (
                          <TableRow key={result.result_id} className={result.rank === 1 ? "bg-green-50" : ""}>
                            <TableCell className="font-medium">
                              {result.rank === 1 ? (
                                <span className="flex items-center gap-1">
                                  {result.rank} <span className="text-lg">🏆</span>
                                </span>
                              ) : (
                                result.rank
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{result.candidate_name}</TableCell>
                            <TableCell>
                              <PartyBadge party={result.party_name} />
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatIndianNumber(result.votes)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${result.vote_percentage}%` }}
                                  />
                                </div>
                                <span className="font-mono font-medium w-12 text-right">
                                  {result.vote_percentage.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Victory Margin</p>
                          <p className="text-xl font-bold text-green-700">
                            {formatIndianNumber(margin)} votes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Margin Percentage</p>
                          <p className="text-xl font-bold text-green-700">
                            {marginPercentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      {winner && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-sm text-muted-foreground">Winning Candidate</p>
                          <div className="flex items-center gap-2 mt-1">
                            <PartyBadge party={winner.party_name} />
                            <span className="font-medium text-foreground">{winner.candidate_name}</span>
                            <span className="text-sm text-muted-foreground">
                              ({winner.vote_percentage.toFixed(1)}% votes)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No election results available for this constituency
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voting Pattern Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voting Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Key Insights</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Total registered voters: {formatIndianNumber(constituency.total_voters)}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Number of polling booths: {constituency.polling_booths}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Category: {constituency.category} Constituency</span>
                      </li>
                      {winner && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Winner: {winner.candidate_name} ({winner.party_name}) with {winner.vote_percentage.toFixed(1)}% votes
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Party Performance</h4>
                    <div className="space-y-3">
                      {leadingParties.slice(0, 3).map((party, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-center justify-between">
                            <PartyBadge party={party.party} />
                            <span className="text-sm font-medium text-foreground">
                              {party.count} {party.count === 1 ? 'booth' : 'booths'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Leading in polling stations
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <Button className="w-full" variant="outline" asChild>
                    <Link to={`/dashboard?constituency=${constituency.constituency_id}`}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Detailed Analysis
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Polling Booth Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed analysis of all polling booths in {constituency.constituency_name}
              </p>
            </CardHeader>
            <CardContent>
              <PollingBoothAnalysis
                constituencyId={constituency.constituency_id}
                constituencyName={constituency.constituency_name}
              />
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
};

export default ConstituencyPage;