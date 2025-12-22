// Mock data for election dashboard

export const indianStates = [
  { id: "up", name: "Uttar Pradesh", abbreviation: "UP", assemblies: 403 },
  { id: "mh", name: "Maharashtra", abbreviation: "MH", assemblies: 288 },
  { id: "wb", name: "West Bengal", abbreviation: "WB", assemblies: 294 },
  { id: "br", name: "Bihar", abbreviation: "BR", assemblies: 243 },
  { id: "tn", name: "Tamil Nadu", abbreviation: "TN", assemblies: 234 },
  { id: "mp", name: "Madhya Pradesh", abbreviation: "MP", assemblies: 230 },
  { id: "rj", name: "Rajasthan", abbreviation: "RJ", assemblies: 200 },
  { id: "ka", name: "Karnataka", abbreviation: "KA", assemblies: 224 },
  { id: "gj", name: "Gujarat", abbreviation: "GJ", assemblies: 182 },
  { id: "ap", name: "Andhra Pradesh", abbreviation: "AP", assemblies: 175 },
  { id: "od", name: "Odisha", abbreviation: "OD", assemblies: 147 },
  { id: "kl", name: "Kerala", abbreviation: "KL", assemblies: 140 },
  { id: "jh", name: "Jharkhand", abbreviation: "JH", assemblies: 81 },
  { id: "as", name: "Assam", abbreviation: "AS", assemblies: 126 },
  { id: "pb", name: "Punjab", abbreviation: "PB", assemblies: 117 },
  { id: "ct", name: "Chhattisgarh", abbreviation: "CT", assemblies: 90 },
  { id: "hr", name: "Haryana", abbreviation: "HR", assemblies: 90 },
  { id: "dl", name: "Delhi", abbreviation: "DL", assemblies: 70 },
  { id: "uk", name: "Uttarakhand", abbreviation: "UK", assemblies: 70 },
  { id: "hp", name: "Himachal Pradesh", abbreviation: "HP", assemblies: 68 },
];

export const assemblies = [
  { id: "ajagara", name: "Ajagara (SC)", stateId: "up", district: "Varanasi", category: "SC", parliamentSeat: "Chandauil" },
  { id: "varanasi-north", name: "Varanasi North", stateId: "up", district: "Varanasi", category: "General", parliamentSeat: "Varanasi" },
  { id: "varanasi-south", name: "Varanasi South", stateId: "up", district: "Varanasi", category: "General", parliamentSeat: "Varanasi" },
  { id: "pindra", name: "Pindra", stateId: "up", district: "Varanasi", category: "General", parliamentSeat: "Chandauil" },
  { id: "rohaniya", name: "Rohaniya", stateId: "up", district: "Varanasi", category: "General", parliamentSeat: "Varanasi" },
  { id: "gorakhpur-urban", name: "Gorakhpur Urban", stateId: "up", district: "Gorakhpur", category: "General", parliamentSeat: "Gorakhpur" },
  { id: "lucknow-east", name: "Lucknow East", stateId: "up", district: "Lucknow", category: "General", parliamentSeat: "Lucknow" },
  { id: "lucknow-west", name: "Lucknow West", stateId: "up", district: "Lucknow", category: "General", parliamentSeat: "Lucknow" },
];

export const partyColors: Record<string, string> = {
  BJP: "hsl(24, 100%, 50%)",
  INC: "hsl(145, 80%, 32%)",
  BSP: "hsl(220, 100%, 43%)",
  SP: "hsl(0, 92%, 53%)",
  AAP: "hsl(210, 100%, 50%)",
  SBSP: "hsl(270, 60%, 50%)",
  AD: "hsl(180, 60%, 40%)",
  OTHERS: "hsl(0, 0%, 42%)",
};

export const electionResults2022 = [
  { rank: 1, candidate: "Tribhuwan Ram", party: "BJP", votes: 101088, percentage: 41.25 },
  { rank: 2, candidate: "Sunil Kumar Sonkar", party: "SBSP", votes: 91928, percentage: 37.52 },
  { rank: 3, candidate: "Mashu Ram Saroj", party: "BSP", votes: 42301, percentage: 17.27 },
  { rank: 4, candidate: "Ram Prakash", party: "INC", votes: 6823, percentage: 2.79 },
  { rank: 5, candidate: "Others", party: "OTHERS", votes: 2877, percentage: 1.17 },
];

export const historicalVoteShare = [
  { year: "2012", BJP: 28, SP: 32, BSP: 25, INC: 8, OTHERS: 7 },
  { year: "2017", BJP: 35, SP: 28, BSP: 22, INC: 6, OTHERS: 9 },
  { year: "2022", BJP: 41, SP: 8, BSP: 17, SBSP: 38, INC: 3, OTHERS: 1 },
];

export const turnoutData = [
  { year: "2007", assembly: 48.2, parliament: 45.6 },
  { year: "2009", assembly: 0, parliament: 47.8 },
  { year: "2012", assembly: 52.4, parliament: 0 },
  { year: "2014", assembly: 0, parliament: 56.2 },
  { year: "2017", assembly: 58.7, parliament: 0 },
  { year: "2019", assembly: 0, parliament: 62.3 },
  { year: "2022", assembly: 61.5, parliament: 0 },
  { year: "2024", assembly: 0, parliament: 64.8 },
];

export const constituencyProfile = {
  id: "ajagara",
  name: "Ajagara (SC)",
  category: "SC Reserved",
  district: "Varanasi",
  parliamentSeat: "Chandauil",
  totalVoters: 549918,
  pollingBooths: 309,
  demographics: {
    sc: 32,
    st: 5,
    general: 63,
    rural: 65,
    urban: 35,
  },
  electedMLAs: [
    { year: 2022, name: "Tribhuwan Ram", party: "BJP", isWinner: true },
    { year: 2017, name: "Malash Nath Sonkar", party: "SBSP", isWinner: false },
    { year: 2012, name: "Tribhuwan Ram", party: "BSP", isWinner: false },
    { year: 2007, name: "Durga Prasad", party: "BSP", isWinner: false },
  ],
};

export const recentSearches = [
  "Varanasi North",
  "Uttar Pradesh",
  "Lucknow East",
  "Gorakhpur Urban",
];
