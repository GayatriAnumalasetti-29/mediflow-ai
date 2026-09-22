export interface MealItem {
  mealType: 'BREAKFAST' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER';
  time: string; // e.g. "08:30 AM"
  recommendedFoods: string[];
  hydrationTargetMl?: number;
  specialInstructions?: string;
}

export interface DietPlan {
  id: string;
  patientId: string;
  prescribedByDoctorId?: string;
  dietitianName?: string;
  planName: string; // e.g., "Post-Operative Cardiac Soft Diet", "Diabetic Low Glycemic"
  dailyCalorieTarget: number;
  meals: MealItem[];
  foodsToAvoid: string[];
  allergensRestricted: string[];
  hydrationGoalLiters: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}
