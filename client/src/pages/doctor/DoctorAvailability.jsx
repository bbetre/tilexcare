import { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Save,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Input, Select, Badge } from '../../components/ui';
import { doctorsAPI } from '../../services/api';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultSchedule = {
  Monday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
  Tuesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
  Wednesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
  Thursday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
  Friday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
  Saturday: { enabled: false, slots: [] },
  Sunday: { enabled: false, slots: [] },
};

export default function DoctorAvailability() {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [consultationFee, setConsultationFee] = useState('500');
  const [onDemandEnabled, setOnDemandEnabled] = useState(true);
  const [slotDuration, setSlotDuration] = useState('30');
  const [breakTime, setBreakTime] = useState('10');
  const [vacationDates, setVacationDates] = useState([]);
  const [newVacationStart, setNewVacationStart] = useState('');
  const [newVacationEnd, setNewVacationEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleDay = (day) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled }
    });
  };

  const addSlot = (day) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: [...schedule[day].slots, { start: '09:00', end: '17:00' }]
      }
    });
  };

  const removeSlot = (day, index) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: schedule[day].slots.filter((_, i) => i !== index)
      }
    });
  };

  const updateSlot = (day, index, field, value) => {
    const newSlots = [...schedule[day].slots];
    newSlots[index][field] = value;
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], slots: newSlots }
    });
  };

  const addVacation = () => {
    if (newVacationStart && newVacationEnd) {
      setVacationDates([...vacationDates, { start: newVacationStart, end: newVacationEnd }]);
      setNewVacationStart('');
      setNewVacationEnd('');
    }
  };

  const removeVacation = (index) => {
    setVacationDates(vacationDates.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      
      // Generate slots for the next 4 weeks based on schedule
      const slots = [];
      const today = new Date();
      const slotDurationMins = parseInt(slotDuration);
      const breakMins = parseInt(breakTime);
      
      for (let week = 0; week < 4; week++) {
        daysOfWeek.forEach((day, dayIndex) => {
          if (!schedule[day].enabled) return;
          
          // Calculate the date for this day
          const currentDayIndex = today.getDay();
          const targetDayIndex = dayIndex === 6 ? 0 : dayIndex + 1; // Convert to JS day index (0=Sunday)
          let daysUntil = targetDayIndex - currentDayIndex;
          if (daysUntil <= 0) daysUntil += 7;
          daysUntil += week * 7;
          
          const date = new Date(today);
          date.setDate(today.getDate() + daysUntil);
          const dateStr = date.toISOString().split('T')[0];
          
          // Generate individual slots from time ranges
          schedule[day].slots.forEach(timeRange => {
            const [startHour, startMin] = timeRange.start.split(':').map(Number);
            const [endHour, endMin] = timeRange.end.split(':').map(Number);
            
            let currentTime = startHour * 60 + startMin;
            const endTime = endHour * 60 + endMin;
            
            while (currentTime + slotDurationMins <= endTime) {
              const slotStartHour = Math.floor(currentTime / 60);
              const slotStartMin = currentTime % 60;
              const slotEndTime = currentTime + slotDurationMins;
              const slotEndHour = Math.floor(slotEndTime / 60);
              const slotEndMin = slotEndTime % 60;
              
              slots.push({
                date: dateStr,
                startTime: `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`,
                endTime: `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`
              });
              
              currentTime = slotEndTime + breakMins;
            }
          });
        });
      }
      
      if (slots.length > 0) {
        await doctorsAPI.setAvailability(slots);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving availability:', err);
      alert(err.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
            <p className="text-gray-500 mt-1">Set your working hours and consultation settings</p>
          </div>
          <Button icon={saving ? Loader2 : saveSuccess ? Check : Save} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Schedule */}
          <Card className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Schedule</h2>
            <div className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDay(day)}
                        className="text-gray-600 hover:text-primary-500 transition-colors"
                      >
                        {schedule[day].enabled ? (
                          <ToggleRight className="w-8 h-8 text-primary-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                      <span className={`font-medium ${schedule[day].enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                        {day}
                      </span>
                    </div>
                    {schedule[day].enabled && (
                      <button
                        onClick={() => addSlot(day)}
                        className="text-primary-500 text-sm flex items-center gap-1 hover:text-primary-600"
                      >
                        <Plus className="w-4 h-4" /> Add Slot
                      </button>
                    )}
                  </div>

                  {schedule[day].enabled && (
                    <div className="space-y-2 ml-11">
                      {schedule[day].slots.length === 0 ? (
                        <p className="text-sm text-gray-400">No time slots set</p>
                      ) : (
                        schedule[day].slots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateSlot(day, index, 'start', e.target.value)}
                              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateSlot(day, index, 'end', e.target.value)}
                              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              onClick={() => removeSlot(day, index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Settings */}
          <div className="space-y-6">
            {/* Consultation Settings */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultation Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fee (ETB)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slot Duration (minutes)
                  </label>
                  <Select value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)}>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Between Slots (minutes)
                  </label>
                  <Select value={breakTime} onChange={(e) => setBreakTime(e.target.value)}>
                    <option value="0">No break</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                  </Select>
                </div>

                {/* On-Demand Toggle */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">On-Demand Availability</p>
                      <p className="text-sm text-gray-500">Accept instant consultation requests</p>
                    </div>
                    <button
                      onClick={() => setOnDemandEnabled(!onDemandEnabled)}
                      className="text-gray-600"
                    >
                      {onDemandEnabled ? (
                        <ToggleRight className="w-10 h-10 text-success-500" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vacation / Blackout Dates */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vacation / Blackout Dates</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newVacationStart}
                      onChange={(e) => setNewVacationStart(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newVacationEnd}
                      onChange={(e) => setNewVacationEnd(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" icon={Plus} onClick={addVacation}>
                  Add Vacation
                </Button>

                {vacationDates.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    {vacationDates.map((vacation, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <span className="text-sm text-red-700">
                          {vacation.start} → {vacation.end}
                        </span>
                        <button
                          onClick={() => removeVacation(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
