import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DietPlan } from '@mediflow/shared';
import { Apple, Utensils, AlertTriangle, Droplets } from 'lucide-react';

export const DietPlanCard: React.FC = () => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);

  useEffect(() => {
    api.getDietPlan('pat-001').then(setDietPlan).catch(console.error);
  }, []);

  if (!dietPlan) {
    return <div className="glass-panel" style={{ padding: '1.5rem' }}>Loading diet plan...</div>;
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
            {dietPlan.planName}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Authorized by {dietPlan.dietitianName} • Target: {dietPlan.dailyCalorieTarget} kcal/day
          </p>
        </div>

        <div className="flex items-center gap-2 glass-card" style={{ padding: '0.4rem 0.8rem' }}>
          <Droplets size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Hydration: {dietPlan.hydrationGoalLiters} L</span>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        {dietPlan.meals.map((meal) => (
          <div key={meal.mealType} className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.9rem' }}>
                {meal.mealType.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{meal.time}</span>
            </div>

            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.6' }}>
              {meal.recommendedFoods.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            {meal.specialInstructions && (
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '6px' }}>
                * {meal.specialInstructions}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Avoid List */}
      <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '1rem' }}>
        <div className="flex items-center gap-2" style={{ color: '#f87171', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
          <AlertTriangle size={16} />
          <span>Restricted / Foods to Avoid</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {dietPlan.foodsToAvoid.map((food, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.78rem',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              ✕ {food}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
