// src/types/index.ts - Fixed with no duplicate definitions
export interface State {
    state_id: number;
    state_name: string;
    capital?: string;
    region?: string;
    total_assemblies?: number;
    population?: number;
    area_sqkm?: number;
}

export interface AssemblyConstituency {
    constituency_id: number;
    constituency_name: string;
    state_id: number;
    state_name?: string;
    district: string;
    parliament_seat: string;
    category: 'GEN' | 'SC' | 'ST';
    total_voters: number;
    polling_booths: number;
    area_sqkm?: number;
    reserved_for?: string;
    created_at?: string;
}

export interface Candidate {
    candidate_id: number;
    candidate_name: string;
    party_id: number;
    party_name: string;
    party_symbol?: string;
    age?: number;
    gender?: 'M' | 'F' | 'O';
    education?: string;
    criminal_cases?: number;
    assets?: number;
    liabilities?: number;
}

export interface ElectionResult {
    result_id: number;
    constituency_id: number;
    election_year: number;
    candidate_id: number;
    candidate_name: string;
    party_id: number;
    party_name: string;
    votes: number;
    vote_percentage: number;
    rank: number;
    deposit_lost: boolean;
    margin?: number;
    margin_percentage?: number;
}

// SINGLE VoteShareTrend interface definition
export interface VoteShareTrend {
    year: number;
    parties?: Array<{
        party_name: string;
        vote_percentage: number;
    }>;
    // Allow party-specific properties for alternative format
    BJP?: number;
    INC?: number;
    BSP?: number;
    SP?: number;
    Others?: number;
    [key: string]: any; // Allow any other party properties
}

export interface FormattedVoteShareTrend {
    year: number;
    BJP: number;
    INC: number;
    BSP: number;
    SP: number;
    Others: number;
    [key: string]: number; // Allow dynamic party keys
}

export interface Booth {
    booth_id: number;
    booth_number: string;
    booth_name: string;
    constituency_id: number;
    location: string;
    latitude?: number;
    longitude?: number;
    total_voters: number;
    male_voters?: number;
    female_voters?: number;
    other_voters?: number;
    sensitive?: boolean;
}

export interface Party {
    party_id: number;
    party_name: string;
    party_symbol?: string;
    abbreviation: string;
    ideology?: string;
    founded_year?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface ConstituencyStats {
    constituency_id: number;
    constituency_name: string;
    total_voters: number;
    polling_booths: number;
    winner_2022?: {
        candidate_name: string;
        party_name: string;
        votes: number;
        vote_percentage: number;
    };
    turnout_2022?: number;
    margin_2022?: number;
    margin_percentage_2022?: number;
}

export interface TurnoutTrend {
    year: number;
    turnout_percentage: number;
    total_voters: number;
    votes_cast: number;
}

export interface DemographicData {
    caste_distribution?: {
        sc: number;
        st: number;
        obc: number;
        general: number;
    };
    urban_rural?: {
        urban: number;
        rural: number;
    };
    gender_distribution?: {
        male: number;
        female: number;
        other: number;
    };
}

// New types for better organization
export interface ElectionYearResult {
    year: number;
    results: ElectionResult[];
    total_votes: number;
    turnout_percentage: number;
}

export interface PartyPerformance {
    party_name: string;
    total_votes: number;
    vote_percentage: number;
    seats_won: number;
    seats_contested: number;
}

export interface SearchResult {
    type: 'state' | 'constituency' | 'candidate' | 'party';
    id: number;
    name: string;
    description?: string;
    score?: number;
}


// Update in src/types/index.ts
export interface BoothAnalysisData {
    booths: Booth[];
    party_dominance: PartyDominance[];
    summary: {
        ac_name: string;
        total_booths: string;
        total_electors: string;
        total_votes_cast: string;
        avg_turnout: string;
    };
    insights: {
        high_turnout_booths: number;
        low_turnout_booths: number;
        large_booths: number;
        total_booths_analyzed: number;
    };
}

export interface PartyDominance {
    party_name: string;
    booths_won: string;
    total_votes: string;
}

export interface ClusterData {
    cluster_type: string;
    booth_count: string;
    avg_electors: string;
    avg_turnout: string;
}