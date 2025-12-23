// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, BarChart3, Users, Building2, TrendingUp, MapPin, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import StateSearchBar from "@/components/search/StateSearchBar";
import DataCard from "@/components/ui/DataCard";
import VoteShareChart from "@/components/charts/VoteShareChart";
import { apiService } from "@/services/api";
import type { State } from "@/types";

const HomePage = () => {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStates: 0,
    totalAssemblies: 0,
    totalElections: 0,
    totalVoters: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load states
        const statesData = await apiService.getStates();
        setStates(statesData);

        // Load stats (you'll need to create this endpoint in your backend)
        // For now, using mock data
        setStats({
          totalStates: statesData.length,
          totalAssemblies: 4120, // You should create an API for this
          totalElections: 15,
          totalVoters: 950000000
        });
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStateSelect = async (state: State) => {
    try {
      navigate(`/state/${state.state_id}`);
    } catch (error) {
      console.error("Failed to navigate:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/20 py-12 md:py-20 lg:py-32">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <Vote className="h-3 w-3 md:h-4 md:w-4" />
              <span className="truncate">India's Most Comprehensive Election Data Platform</span>
            </div>
            <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
              Explore <span className="text-primary">Election Insights</span> Like Never Before
            </h1>
            <p className="text-sm md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto px-2">
              Dive deep into constituency data, historical trends, booth-level analysis, and voting patterns across all Indian states and assemblies.
            </p>

            {/* Search Bar - Fixed for mobile */}
            <div className="flex justify-center mb-6 md:mb-8 px-2">
              <StateSearchBar
                onStateSelect={handleStateSelect}
                placeholder={loading ? "Loading states..." : "Search for a state..."}
                data={states}
                className="w-full max-w-md md:max-w-lg"
              />
            </div>

            {/* CTA Buttons - Fixed for mobile */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-2">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto flex-1 sm:flex-none min-w-[140px]"
              >
                <Link to="/dashboard" className="flex items-center justify-center">
                  <span className="truncate">Explore Dashboard</span>
                  <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto flex-1 sm:flex-none min-w-[140px]"
              >
                <Link to="/states" className="flex items-center justify-center">
                  <span className="truncate">Browse All States</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl hidden md:block" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl hidden md:block" />
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-card border-y border-border">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <DataCard
              title="States Covered"
              value={stats.totalStates.toString()}
              subtitle="+ 8 Union Territories"
              icon={MapPin}
            />
            <DataCard
              title="Assemblies"
              value={stats.totalAssemblies.toLocaleString()}
              subtitle="Constituency profiles"
              icon={Building2}
            />
            <DataCard
              title="Elections"
              value={stats.totalElections.toString() + "+"}
              subtitle="Years of historical data"
              icon={BarChart3}
            />
            <DataCard
              title="Voters"
              value={(stats.totalVoters / 1000000000).toFixed(1) + "B+"}
              subtitle="Registered voters"
              icon={Users}
            />
          </div>
        </div>
      </section>

      {/* Featured Chart Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4">
                Historical Vote Share Analysis
              </h2>
              <p className="text-xs md:text-sm lg:text-base text-muted-foreground px-2">
                Track party performance trends across elections with interactive visualizations
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 md:mb-6">
                <h3 className="font-semibold text-foreground text-sm md:text-base">Sample Vote Share Analysis</h3>
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <Link to="/dashboard" className="flex items-center justify-center">
                    Explore Data
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
              {/* Example chart with sample data */}
              <div className="h-[250px] md:h-[300px] lg:h-[350px]">
                <VoteShareChart constituencyId={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4">
              Powerful Features for Election Analysis
            </h2>
            <p className="text-xs md:text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Access comprehensive tools designed for researchers, analysts, and political enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                <BarChart3 className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm md:text-base mb-2">Interactive Charts</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Visualize vote shares, turnout trends, and victory margins with dynamic charts
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                <TrendingUp className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm md:text-base mb-2">Trend Analysis</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Compare party performance across multiple election cycles and regions
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                <Building2 className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm md:text-base mb-2">Booth-Level Data</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Drill down to individual polling booths for granular insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
            Ready to Explore Election Data?
          </h2>
          <p className="text-primary-foreground/80 mb-6 md:mb-8 max-w-xl mx-auto text-sm md:text-base px-2">
            Start exploring constituency profiles, historical trends, and detailed electoral analysis
          </p>
          <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
            <Link to="/dashboard" className="flex items-center justify-center">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;