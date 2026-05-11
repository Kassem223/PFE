import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Inline free time selector component
const FreeTimeSelector = ({ dayReservations, onConfirm, onCancel }) => {
  const [timeStart, setTimeStart] = useState('08:00');
  const [timeEnd, setTimeEnd] = useState('09:00');
  const [error, setError] = useState('');

  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const validate = (start, end) => {
    if (toMinutes(end) <= toMinutes(start)) {
      return 'L\'heure de fin doit être après l\'heure de début.';
    }
    for (const r of dayReservations) {
      const rStart = toMinutes(r.time_start);
      const rEnd = toMinutes(r.time_end);
      const sMin = toMinutes(start);
      const eMin = toMinutes(end);
      if (sMin < rEnd && eMin > rStart) {
        return `Conflit avec une réservation existante (${r.time_start} → ${r.time_end}).`;
      }
    }
    return '';
  };

  const handleStartChange = (val) => {
    setTimeStart(val);
    setError(validate(val, timeEnd));
  };

  const handleEndChange = (val) => {
    setTimeEnd(val);
    setError(validate(timeStart, val));
  };

  const handleConfirm = () => {
    const err = validate(timeStart, timeEnd);
    if (err) { setError(err); return; }
    onConfirm(timeStart, timeEnd);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Début</label>
          <input
            type="time"
            value={timeStart}
            onChange={e => handleStartChange(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="pb-3 text-slate-400 font-bold">→</div>
        <div className="flex-1">
          <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Fin</label>
          <input
            type="time"
            value={timeEnd}
            onChange={e => handleEndChange(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {!error && toMinutes(timeEnd) > toMinutes(timeStart) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-700 dark:text-green-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Créneau disponible — {Math.round((toMinutes(timeEnd) - toMinutes(timeStart)) / 60 * 10) / 10}h
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!!error || toMinutes(timeEnd) <= toMinutes(timeStart)}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-slate-500 rounded-xl font-semibold text-sm transition-all"
      >
        Confirmer ce créneau
      </button>
      
      {onCancel && (
        <button
          onClick={() => {
            console.log('Cancel button clicked in FreeTimeSelector');
            onCancel();
          }}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all mt-3"
        >
          Annuler reservation
        </button>
      )}
    </div>
  );
};

export const ReservationCalendar = ({ equipmentId, equipmentName, onReservationClick, canMakeReservation = true, categoryType }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  useEffect(() => {
    fetchReservations();
  }, [equipmentId, currentDate]);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/equipment/${equipmentId}/reservations`);
      setReservations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setLoading(false);
    }
  };

  const handleCancelReservation = () => {
    console.log('handleCancelReservation called, navigating to /category');
    navigate('/category');
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateReserved = (date) => {
    return reservations.some(reservation => {
      const reservationDate = new Date(reservation.date_reservation);
      return reservationDate.toDateString() === date.toDateString();
    });
  };

  const getReservationsForDate = (date) => {
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date_reservation);
      return reservationDate.toDateString() === date.toDateString();
    });
  };

  const getAvailabilityForDate = (date) => {
    const dayReservations = getReservationsForDate(date);
    const totalSlots = 10; // 8:00 to 18:00 = 10 hours
    const bookedSlots = dayReservations.reduce((total, reservation) => {
      const startHour = parseInt(reservation.time_start.split(':')[0]);
      const endHour = parseInt(reservation.time_end.split(':')[0]);
      return total + (endHour - startHour);
    }, 0);
    
    return {
      available: totalSlots - bookedSlots,
      total: totalSlots,
      percentage: ((totalSlots - bookedSlots) / totalSlots) * 100
    };
  };

  const getAvailabilityColor = (percentage) => {
    if (percentage === 0) return 'bg-red-100 text-red-700 border-red-300';
    if (percentage <= 30) return 'bg-orange-100 text-orange-700 border-orange-300';
    if (percentage <= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getAvailabilityText = (percentage) => {
    if (percentage === 0) return 'Complet';
    if (percentage <= 30) return 'Peu disponible';
    if (percentage <= 60) return 'Disponible';
    return 'Très disponible';
  };

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const handleDateClick = (date) => {
    if (!isDateInPast(date)) {
      setSelectedDate(date);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate) - 1; // Adjust for Monday start
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const availability = getAvailabilityForDate(date);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = isDateInPast(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-16 border rounded-lg p-2 transition-all ${
            isPast
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
              : isSelected 
                ? 'bg-blue-500 text-white border-blue-500' 
                : isToday
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : availability.percentage === 0
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer'
          }`}
        >
          <div className="flex justify-start items-start">
            <div className="text-sm font-medium">{day}</div>
          </div>
          <div className="text-xs mt-1 opacity-70">
            {isPast ? 'Passé' : getAvailabilityText(availability.percentage)}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderTimeSlots = () => {
    if (!selectedDate) return null;

    if (isDateInPast(selectedDate)) {
      return (
        <div className="text-center py-8 text-slate-500">
          <div className="text-lg font-medium">Date passée</div>
          <div className="text-sm mt-2">Veuillez sélectionner une date future</div>
        </div>
      );
    }

    const dayReservations = getReservationsForDate(selectedDate);

    return (
      <div className="space-y-4">
        {/* Existing reservations */}
        {dayReservations.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Créneaux déjà réservés</p>
            <div className="space-y-1">
              {dayReservations.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {r.time_start} → {r.time_end}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free time input */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Choisir votre créneau</p>
          <FreeTimeSelector
            dayReservations={dayReservations}
            onConfirm={(timeStart, timeEnd) => onReservationClick(selectedDate, timeStart, timeEnd)}
            onCancel={handleCancelReservation}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </div>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex justify-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
          {weekDays.map(day => (
            <div key={day} className="font-medium">{day}</div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-6">
          {renderCalendarDays()}
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {getAvailabilityForDate(selectedDate).available}h disponibles
              </div>
            </div>
            
            {/* Time Slots */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Créneaux disponibles:</h5>
              <div>
                {renderTimeSlots()}
              </div>
            </div>

            {canMakeReservation && !isDateInPast(selectedDate) && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
                Saisissez votre créneau ci-dessus puis cliquez sur "Confirmer ce créneau"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
