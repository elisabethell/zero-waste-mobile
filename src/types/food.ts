export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SurplusFood {
  id: string;
  donorName: string;
  donorType: 'Restoran' | 'Hotel' | 'Toko Kelontong';
  foodName: string;
  quantityKg: number;
  expiresAt: string;
  status: 'available' | 'claimed' | 'delivered';
  location: Coordinates;
}

export interface ImpactStats {
  totalSavedKg: number;
  totalMealsRescued: number;
  co2PreventedKg: number; // Estimasi ~2.5 kg CO2 per 1 kg makanan
}