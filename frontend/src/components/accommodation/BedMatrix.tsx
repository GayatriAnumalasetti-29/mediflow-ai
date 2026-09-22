import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Room, RoomCategory, BedStatus, Bed } from '@mediflow/shared';
import {
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  Check,
  ChevronRight
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const BedMatrix: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBed, setSelectedBed] = useState<{ room: Room; bed: Bed } | null>(null);
  const [isAllocating, setIsAllocating] = useState(false);

  useEffect(() => {
    api.getRooms().then(setRooms).catch(console.error);
  }, []);

  const categories = ['ALL', 'GENERAL', 'SEMI_PRIVATE', 'DELUXE', 'ICU'];

  const filteredRooms =
    selectedCategory === 'ALL'
      ? rooms
      : rooms.filter((r) => r.category === selectedCategory);

  const getStatusColor = (status: BedStatus) => {
    switch (status) {
      case BedStatus.AVAILABLE:
        return '#34d399';
      case BedStatus.OCCUPIED:
        return '#f87171';
      case BedStatus.RESERVED:
        return '#fbbf24';
      case BedStatus.MAINTENANCE:
        return '#94a3b8';
      default:
        return '#94a3b8';
    }
  };

  const handleConfirmBedAllocation = async () => {
    if (!selectedBed) return;
    setIsAllocating(true);
    try {
      await api.allocateBed(selectedBed.bed.id, 'pat-001');
      // Update local state
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === selectedBed.room.id) {
            return {
              ...r,
              beds: (r.beds || []).map((b) =>
                b.id === selectedBed.bed.id ? { ...b, status: BedStatus.OCCUPIED, currentPatientId: 'pat-001' } : b
              )
            };
          }
          return r;
        })
      );
      setSelectedBed(null);
      alert(`Bed ${selectedBed.bed.bedNumber} in ${selectedBed.room.roomNumber} (${selectedBed.room.category}) allocated successfully!`);
    } catch (err) {
      console.error('Allocation failed', err);
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="flex items-center gap-2">
            <Building size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
              Hospital Inpatient Wards & Bed Occupancy Matrix
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            Live status of ICU, Deluxe, Semi-Private, and General ward beds.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: selectedCategory === cat ? '#0ea5e9' : 'rgba(255,255,255,0.06)',
                color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                border: selectedCategory === cat ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
        {filteredRooms.map((room) => (
          <div key={room.id} className="glass-card" style={{ padding: '1.35rem' }}>
            {/* Room Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', marginBottom: '6px' }}>
                  {room.category.replace(/_/g, ' ')}
                </span>
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>
                  Room {room.roomNumber} ({room.floor})
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                  ₹{room.dailyRate.toLocaleString()}
                </span>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>per day</div>
              </div>
            </div>

            {/* Amenities Pills */}
            <div className="flex flex-wrap gap-1" style={{ margin: '0.85rem 0' }}>
              {room.amenities.map((amenity, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.72rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    color: '#cbd5e1'
                  }}
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>

            {/* Beds in Room */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                Bed Allocations in Room:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(room.beds || []).map((bed) => {
                  const isAvailable = bed.status === BedStatus.AVAILABLE;
                  return (
                    <div
                      key={bed.id}
                      className="glass-card flex items-center justify-between"
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: `1px solid ${isAvailable ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255,255,255,0.06)'}`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(bed.status),
                            boxShadow: `0 0 8px ${getStatusColor(bed.status)}`
                          }}
                        />
                        <div>
                          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.88rem' }}>
                            Bed {bed.bedNumber}
                          </span>
                          {bed.currentPatientId && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>
                              (Occupied)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status={bed.status}
                          variant={isAvailable ? 'success' : bed.status === BedStatus.OCCUPIED ? 'danger' : 'warning'}
                        />

                        {isAvailable && (
                          <button
                            onClick={() => setSelectedBed({ room, bed })}
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                          >
                            <span>Allocate Bed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bed Allocation Modal */}
      {selectedBed && (
        <Modal
          isOpen={!!selectedBed}
          onClose={() => setSelectedBed(null)}
          title="Confirm Room & Bed Admission Allocation"
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.05rem' }}>
                  Room {selectedBed.room.roomNumber} • Bed {selectedBed.bed.bedNumber}
                </span>
                <span className="badge badge-routine">Available</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                Category: {selectedBed.room.category.replace(/_/g, ' ')} ({selectedBed.room.floor})
              </p>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34d399', marginTop: '6px' }}>
                Tariff: ₹{selectedBed.room.dailyRate.toLocaleString()} / day
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              Allocating this bed will register the patient admission under Dr. Priya Varma (Cardiology) and initiate nursing station readiness.
            </p>

            <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedBed(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleConfirmBedAllocation}
                disabled={isAllocating}
                className="btn btn-emerald flex items-center gap-2"
              >
                <ShieldCheck size={18} />
                <span>{isAllocating ? 'Allocating...' : 'Confirm Inpatient Bed Allocation'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
