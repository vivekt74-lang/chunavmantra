// src/services/stateService.ts
import { apiService } from './api';
import type { State } from '@/types';

export const stateService = {
    getAllStates: async (): Promise<State[]> => {
        return await apiService.getStates();
    },

    getStateById: async (id: number): Promise<State> => {
        return await apiService.getStateById(id);
    },

    getStateAssemblies: async (stateId: number) => {
        return await apiService.getStateAssemblies(stateId);
    }
};