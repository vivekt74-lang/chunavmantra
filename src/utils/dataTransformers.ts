// src/utils/dataTransformers.ts
export const transformVoteShareData = (data: any) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => {
        // If data has parties array, transform it
        if (item.parties && Array.isArray(item.parties)) {
            const formattedItem: any = { year: item.year };
            item.parties.forEach((party: any) => {
                const partyKey = party.party_name?.replace(/\s+/g, '_').toUpperCase() || 'UNKNOWN';
                formattedItem[partyKey] = party.vote_percentage;
            });
            return formattedItem;
        }

        // If data already has direct properties
        return item;
    });
};

export const calculatePartyColors = (partyName: string) => {
    const partyLower = partyName.toLowerCase();

    if (partyLower.includes('bjp')) return '#FF9933';
    if (partyLower.includes('congress') || partyLower.includes('inc')) return '#0066CC';
    if (partyLower.includes('bsp')) return '#0000FF';
    if (partyLower.includes('sp') || partyLower.includes('samajwadi')) return '#FF0000';
    if (partyLower.includes('aap')) return '#00AA00';
    if (partyLower.includes('tmc')) return '#7C24DD';
    if (partyLower.includes('dmk')) return '#FF1493';
    if (partyLower.includes('aiadmk')) return '#800080';

    return '#666666'; // Default gray
};

export const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
};

export const calculateTurnoutInsights = (turnoutData: any[]) => {
    if (!turnoutData || turnoutData.length === 0) return null;

    const latest = turnoutData[turnoutData.length - 1];
    const previous = turnoutData.length > 1 ? turnoutData[turnoutData.length - 2] : null;

    return {
        current: latest.turnout_percentage,
        change: previous ? latest.turnout_percentage - previous.turnout_percentage : 0,
        trend: previous ? (latest.turnout_percentage > previous.turnout_percentage ? 'up' : 'down') : 'stable'
    };
};