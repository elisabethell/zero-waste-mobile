import { create } from 'zustand';
import { Coordinates, ImpactStats, SurplusFood } from '../types/food';

export interface FoodState {
  surplusList: SurplusFood[];
  courierLocation: Coordinates | null;
  impactStats: ImpactStats;

  // Actions
  addSurplus: (item: SurplusFood) => void;
  updateFoodStatus: (id: string, status: SurplusFood['status']) => void;
  setCourierLocation: (coords: Coordinates) => void;
}

const INITIAL_MOCK_DATA: SurplusFood[] = [
  {
    id: 'fd-001',
    donorName: 'Hotel Tugu Bakery',
    donorType: 'Hotel',
    foodName: 'Roti & Pastry Surplus',
    quantityKg: 4.5,
    expiresAt: '22:00 WIB',
    status: 'available',
    location: { latitude: -7.9778, longitude: 112.6341 },
  },
  {
    id: 'fd-002',
    donorName: 'Warung Nusantara',
    donorType: 'Restoran',
    foodName: 'Nasi Kotak Layak Konsumsi (15 Box)',
    quantityKg: 6.0,
    expiresAt: '21:30 WIB',
    status: 'available',
    location: { latitude: -7.9553, longitude: 112.6152 },
  },
];

export const useFoodStore = create<FoodState>((set) => ({
  surplusList: INITIAL_MOCK_DATA,
  courierLocation: null,
  impactStats: {
    totalSavedKg: 12.5,
    totalMealsRescued: 32,
    co2PreventedKg: 31.25,
  },

  addSurplus: (item) =>
    set((state) => ({
      surplusList: [item, ...state.surplusList],
    })),

  updateFoodStatus: (id, status) =>
    set((state) => {
      const target = state.surplusList.find((item) => item.id === id);
      const isNewlyDelivered =
        status === 'delivered' && target && target.status !== 'delivered';

      const updatedList = state.surplusList.map((item) =>
        item.id === id ? { ...item, status } : item
      );

      if (!isNewlyDelivered || !target) {
        return { surplusList: updatedList };
      }

      const addedKg = target.quantityKg;
      return {
        surplusList: updatedList,
        impactStats: {
          totalSavedKg: Number((state.impactStats.totalSavedKg + addedKg).toFixed(2)),
          totalMealsRescued: state.impactStats.totalMealsRescued + Math.round(addedKg * 2.5),
          co2PreventedKg: Number((state.impactStats.co2PreventedKg + addedKg * 2.5).toFixed(2)),
        },
      };
    }),

  setCourierLocation: (coords) =>
    set(() => ({
      courierLocation: coords,
    })),
}));

// Precision Selectors untuk mencegah re-render yang tidak perlu (16-ms mandate)
export const selectSurplusList = (state: FoodState) => state.surplusList;
export const selectCourierLocation = (state: FoodState) => state.courierLocation;
export const selectImpactStats = (state: FoodState) => state.impactStats;
export const selectAddSurplus = (state: FoodState) => state.addSurplus;
export const selectUpdateFoodStatus = (state: FoodState) => state.updateFoodStatus;
export const selectSetCourierLocation = (state: FoodState) => state.setCourierLocation;
