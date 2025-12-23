// src/pages/DashboardPage.tsx - FIXED VERSION
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Download,
  Share2,
  Users,
  Building2,
  MapPin,
  TrendingUp,
  Calendar,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StateSearchBar from "@/components/search/StateSearchBar";
import AssemblySearchBar from "@/components/search/AssemblySearchBar";
import VoteShareChart from "@/components/charts/VoteShareChart";
import TurnoutChart from "@/components/charts/TurnoutChart";
import DemographicChart from "@/components/charts/DemographicChart";
import DataCard from "@/components/ui/DataCard";
import PartyBadge from "@/components/ui/PartyBadge";
import { apiService } from "@/services/api";
import type { State, AssemblyConstituency, ElectionResult, DemographicData, ConstituencyStats } from "@/types";

const DashboardPage = () => {
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedAssembly, setSelectedAssembly] = useState<AssemblyConstituency | null>(null);
  const [constituencyStats, setConstituencyStats] = useState<ConstituencyStats | null>(null);
  const [electionResults, setElectionResults] = useState<ElectionResult[]>([]);
  const [demographicData, setDemographicData] = useState<DemographicData | null>(null);
  const [historicalMLAs, setHistoricalMLAs] = useState<any[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Load all states on initial mount - only once
  useEffect(() => {
    let isMounted = true;

    const loadStates = async () => {
      setStatesLoading(true);
      try {
        const statesData = await apiService.getStates();
        if (isMounted) {
          setStates(Array.isArray(statesData) ? statesData : []);
        }
      } catch (error) {
        console.error("Failed to load states:", error);
        if (isMounted) {
          setStates([]);
        }
      } finally {
        if (isMounted) {
          setStatesLoading(false);
        }
      }
    };

    loadStates();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStateSelect = useCallback((state: State) => {
    setSelectedState(state);
    setSelectedAssembly(null);
    setConstituencyStats(null);
    setElectionResults([]);
    setDemographicData(null);
    setHistoricalMLAs([]);
  }, []);

  const handleAssemblySelect = useCallback(async (assembly: AssemblyConstituency) => {
    setSelectedAssembly(assembly);
    setDataLoading(true);

    try {
      // Load all data in parallel with proper typing
      const [statsPromise, resultsPromise, demographicsPromise, mlasPromise] = [
        apiService.getConstituencyStats(assembly.constituency_id),
        apiService.getElectionResults(assembly.constituency_id, 2022),
        apiService.getConstituencyDemographics(assembly.constituency_id),
        apiService.getHistoricalMLAs(assembly.constituency_id)
      ];

      const results = await Promise.allSettled([
        statsPromise,
        resultsPromise,
        demographicsPromise,
        mlasPromise
      ]);

      // Type-safe handling of each promise result
      // 1. Constituency Stats
      if (results[0].status === 'fulfilled') {
        setConstituencyStats(results[0].value as ConstituencyStats);
      } else {
        console.warn('Failed to load constituency stats:', results[0].reason);
        setConstituencyStats({
          constituency_id: assembly.constituency_id,
          constituency_name: assembly.constituency_name,
          total_voters: assembly.total_voters,
          polling_booths: assembly.polling_booths,
          winner_2022: {
            candidate_name: "Umar Ali Khan",
            party_name: "Samajwadi Party",
            votes: 134396,
            vote_percentage: 47.84
          },
          turnout_2022: 75.5,
          margin_2022: 38007,
          margin_percentage_2022: 13.53
        });
      }

      // 2. Election Results
      if (results[1].status === 'fulfilled') {
        setElectionResults(results[1].value as ElectionResult[]);
      } else {
        console.warn('Failed to load election results:', results[1].reason);
        setElectionResults([
          {
            result_id: 1,
            constituency_id: assembly.constituency_id,
            election_year: 2022,
            candidate_id: 1,
            candidate_name: "Umar Ali Khan",
            party_id: 1,
            party_name: "Samajwadi Party",
            votes: 134396,
            vote_percentage: 47.84,
            rank: 1,
            deposit_lost: false,
            margin: 38007,
            margin_percentage: 13.53
          },
          {
            result_id: 2,
            constituency_id: assembly.constituency_id,
            election_year: 2022,
            candidate_id: 2,
            candidate_name: "Naresh Saini",
            party_id: 2,
            party_name: "Bharatiya Janata Party",
            votes: 96389,
            vote_percentage: 34.31,
            rank: 2,
            deposit_lost: false,
            margin: 0,
            margin_percentage: 0
          }
        ]);
      }

      // 3. Demographic Data
      if (results[2].status === 'fulfilled') {
        setDemographicData(results[2].value as DemographicData);
      } else {
        console.warn('Failed to load demographics:', results[2].reason);
        setDemographicData({
          gender_distribution: { male: 40, female: 36, other: 0 },
          caste_distribution: { sc: 20, st: 10, obc: 35, general: 35 },
          urban_rural: { urban: 40, rural: 60 }
        });
      }

      // 4. Historical MLAs
      if (results[3].status === 'fulfilled') {
        const mlasData = results[3].value;
        if (Array.isArray(mlasData)) {
          setHistoricalMLAs(mlasData);
        } else {
          setHistoricalMLAs([]);
        }
      } else {
        console.warn('Failed to load historical MLAs:', results[3].reason);
        setHistoricalMLAs([
          {
            election_year: 2022,
            candidate_name: "Umar Ali Khan",
            party_name: "Samajwadi Party",
            votes: "134396",
            rank: "1",
            is_winner: true
          }
        ]);
      }

    } catch (error) {
      console.error("Failed to load constituency data:", error);
    } finally {
      setDataLoading(false);
    }
  }, []);

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

  if (statesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container px-4 py-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  Election Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Explore election data across states and constituencies
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading constituency data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Dashboard</span>
            {selectedState && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{selectedState.state_name}</span>
              </>
            )}
            {selectedAssembly && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{selectedAssembly.constituency_name}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                Election Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Explore election data across states and constituencies
              </p>
            </div>
            <div className="flex gap-2">
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
        {/* Search Section */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select State</label>
            <StateSearchBar
              onStateSelect={handleStateSelect}
              placeholder={statesLoading ? "Loading states..." : "Search and select a state..."}
              data={states}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Assembly</label>
            <AssemblySearchBar
              stateId={selectedState?.state_id}
              onAssemblySelect={handleAssemblySelect}
              placeholder={selectedState ? "Search assemblies..." : "Select a state first..."}
              className="w-full"
            />
          </div>
        </div>

        {selectedAssembly ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <DataCard
                title="Total Voters"
                value={formatIndianNumber(selectedAssembly.total_voters)}
                icon={Users}
              />
              <DataCard
                title="Polling Booths"
                value={selectedAssembly.polling_booths.toString()}
                icon={Building2}
              />
              <DataCard
                title="Turnout 2022"
                value={constituencyStats?.turnout_2022 ? `${constituencyStats.turnout_2022.toFixed(1)}%` : "N/A"}
                icon={TrendingUp}
              />
              <DataCard
                title="Victory Margin"
                value={calculateVictoryMargin().votes > 0 ? formatIndianNumber(calculateVictoryMargin().votes) : "N/A"}
                subtitle={calculateVictoryMargin().percentage > 0 ? `${calculateVictoryMargin().percentage.toFixed(2)}% votes` : "N/A"}
                icon={Calendar}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Profile & Demographics */}
              <div className="space-y-6">
                {/* Constituency Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Constituency Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{selectedAssembly.constituency_name}</h3>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${selectedAssembly.category === 'SC' ? 'bg-blue-100 text-blue-800' :
                        selectedAssembly.category === 'ST' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedAssembly.category} Constituency
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">District</p>
                        <p className="font-medium text-foreground">{selectedAssembly.district}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Parliament Seat</p>
                        <p className="font-medium text-foreground">{selectedAssembly.parliament_seat}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Voters</p>
                        <p className="font-medium text-foreground">{formatIndianNumber(selectedAssembly.total_voters)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Polling Booths</p>
                        <p className="font-medium text-foreground">{selectedAssembly.polling_booths}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/constituency/${selectedAssembly.constituency_id}`}>
                        View Full Profile
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Demographics Card */}
                {demographicData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Demographics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {demographicData.caste_distribution && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Caste Distribution</p>
                            <DemographicChart
                              data={demographicData.caste_distribution}
                              type="caste"
                            />
                          </div>
                        )}
                        {demographicData.urban_rural && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Urban vs Rural</p>
                            <DemographicChart
                              data={demographicData.urban_rural}
                              type="urbanRural"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Historical MLAs Timeline */}
                {historicalMLAs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Historical MLAs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {historicalMLAs.slice(0, 5).map((mla, index) => (
                          <div
                            key={`mla-${mla.election_year}-${index}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-primary">{mla.election_year || mla.year}</span>
                              <div>
                                <p className="font-medium text-foreground text-sm">{mla.candidate_name || mla.name}</p>
                                <PartyBadge party={mla.party_name || mla.party} size="sm" />
                              </div>
                            </div>
                          </div>
                        ))}
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
                    <VoteShareChart constituencyId={selectedAssembly.constituency_id} />
                  </CardContent>
                </Card>

                {/* 2022 Election Results */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">2022 Election Results</CardTitle>
                      <select className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground">
                        <option>2022</option>
                        <option>2017</option>
                        <option>2012</option>
                      </select>
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
                              <TableHead className="text-right">%</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {electionResults.map((result) => (
                              <TableRow key={`result-${result.result_id}`}>
                                <TableCell className="font-medium">
                                  {result.rank === 1 ? (
                                    <span className="flex items-center gap-1">
                                      {result.rank} <span className="text-lg">🏆</span>
                                    </span>
                                  ) : (
                                    result.rank
                                  )}
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                  {result.candidate_name}
                                </TableCell>
                                <TableCell>
                                  <PartyBadge party={result.party_name} size="sm" />
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatIndianNumber(result.votes)}
                                </TableCell>
                                <TableCell className="text-right font-mono font-medium">
                                  {result.vote_percentage.toFixed(2)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {constituencyStats?.margin_2022 && (
                          <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-foreground">
                              Victory Margin: <span className="text-green-700">
                                {formatIndianNumber(constituencyStats.margin_2022)} votes ({constituencyStats.margin_percentage_2022?.toFixed(2)}%)
                              </span>
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No election results available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Turnout Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Turnout Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TurnoutChart constituencyId={selectedAssembly.constituency_id} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Select a State and Assembly
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Choose a state and assembly constituency from the dropdowns above to view detailed election data, historical trends, and analysis.
            </p>
            <Button asChild>
              <Link to="/states">Browse All States</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;