import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Deal, DealSlot, Restaurant } from '../types';

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

export function Slots() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [slots, setSlots] = useState<DealSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    deal_id: '',
    date: toLocalInput(new Date()),
    start_time: '17:00',
    end_time: '18:30',
    total_covers: 12,
    discount_override: '',
    repeat_days: 1,
  });

  const dealById = useMemo(
    () => new Map(deals.map(d => [d.id, d])),
    [deals]
  );

  const loadSlots = async (restaurantId: string) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('deal_slots')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('starts_at', startOfToday.toISOString())
      .order('starts_at', { ascending: true });
    setSlots((data ?? []) as DealSlot[]);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rest } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!rest) { setIsLoading(false); return; }
      setRestaurant(rest as Restaurant);

      const { data: dealsData } = await supabase
        .from('deals')
        .select('*')
        .eq('restaurant_id', rest.id)
        .order('created_at', { ascending: false });
      setDeals((dealsData ?? []) as Deal[]);

      await loadSlots(rest.id);
      setIsLoading(false);

      // Watch covers fill in real time as diners book
      channel = supabase
        .channel('deal_slots_live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'deal_slots', filter: `restaurant_id=eq.${rest.id}` },
          () => loadSlots(rest.id)
        )
        .subscribe();
    }
    load();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const openNewSlot = () => {
    setForm(f => ({ ...f, deal_id: deals[0]?.id ?? '', date: toLocalInput(new Date()) }));
    setShowForm(true);
  };

  const handleCreate = async () => {
    if (!restaurant || !form.deal_id || !form.date || !form.start_time || !form.end_time) return;

    const rows = [];
    for (let i = 0; i < form.repeat_days; i++) {
      const day = new Date(`${form.date}T00:00:00`);
      day.setDate(day.getDate() + i);
      const dateStr = toLocalInput(day);
      rows.push({
        deal_id: form.deal_id,
        restaurant_id: restaurant.id,
        starts_at: new Date(`${dateStr}T${form.start_time}`).toISOString(),
        ends_at: new Date(`${dateStr}T${form.end_time}`).toISOString(),
        total_covers: form.total_covers,
        discount_percent: form.discount_override ? parseInt(form.discount_override) : null,
      });
    }

    const { error } = await supabase.from('deal_slots').insert(rows);
    if (error) {
      alert(error.message.includes('duplicate') ? 'A slot for that deal and time already exists.' : error.message);
      return;
    }
    await loadSlots(restaurant.id);
    setShowForm(false);
  };

  const setStatus = async (slot: DealSlot, status: DealSlot['status']) => {
    await supabase.from('deal_slots').update({ status }).eq('id', slot.id);
    setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, status } : s));
  };

  const adjustCovers = async (slot: DealSlot, delta: number) => {
    const next = Math.max(Math.max(1, slot.booked_covers), slot.total_covers + delta);
    if (next === slot.total_covers) return;
    await supabase.from('deal_slots').update({ total_covers: next }).eq('id', slot.id);
    setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, total_covers: next } : s));
  };

  const byDay = useMemo(() => {
    const map = new Map<string, DealSlot[]>();
    for (const slot of slots) {
      const label = dayLabel(slot.starts_at);
      map.set(label, [...(map.get(label) ?? []), slot]);
    }
    return [...map.entries()];
  }, [slots]);

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-getgrub-navy">Bookable slots</h2>
          <p className="text-gray-500 text-sm">
            Open a window, cap the covers, and pause it the moment you're busy.
          </p>
        </div>
        <button
          onClick={openNewSlot}
          disabled={deals.length === 0}
          className="bg-getgrub-coral text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition disabled:opacity-50"
        >
          + New slots
        </button>
      </div>

      {byDay.map(([label, daySlots]) => (
        <div key={label} className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{label}</h3>
          <div className="space-y-3">
            {daySlots.map(slot => {
              const deal = dealById.get(slot.deal_id);
              const discount = slot.discount_percent ?? deal?.discount_percent ?? 0;
              const fillPct = Math.round((slot.booked_covers / slot.total_covers) * 100);
              const isPast = new Date(slot.ends_at) < new Date();
              return (
                <div key={slot.id} className={`bg-white rounded-2xl p-5 shadow-sm ${isPast || slot.status === 'closed' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="text-getgrub-navy">
                        <div className="font-black text-lg">{fmtTime(slot.starts_at)}–{fmtTime(slot.ends_at)}</div>
                        <div className="text-sm text-gray-500">{deal?.title ?? 'Deal'} · {discount}% off</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        slot.status === 'open' ? 'bg-green-100 text-green-700'
                        : slot.status === 'paused' ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                        {slot.status === 'open' ? 'Open' : slot.status === 'paused' ? 'Paused' : 'Closed'}
                      </span>
                    </div>

                    {!isPast && slot.status !== 'closed' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => adjustCovers(slot, -2)} className="text-sm border border-gray-200 px-2.5 py-1.5 rounded-lg text-getgrub-navy hover:bg-gray-50 transition">−2</button>
                        <button onClick={() => adjustCovers(slot, 2)} className="text-sm border border-gray-200 px-2.5 py-1.5 rounded-lg text-getgrub-navy hover:bg-gray-50 transition">+2</button>
                        {slot.status === 'open' ? (
                          <button onClick={() => setStatus(slot, 'paused')} className="text-sm text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition">Pause</button>
                        ) : (
                          <button onClick={() => setStatus(slot, 'open')} className="text-sm text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition">Reopen</button>
                        )}
                        <button onClick={() => setStatus(slot, 'closed')} className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Close</button>
                      </div>
                    )}
                  </div>

                  {/* Covers fill bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{slot.booked_covers} of {slot.total_covers} covers booked</span>
                      <span>{fillPct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${fillPct >= 100 ? 'bg-green-500' : 'bg-getgrub-coral'}`}
                        style={{ width: `${Math.min(100, fillPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {slots.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">
            {deals.length === 0
              ? 'Create a deal first, then open bookable slots against it.'
              : 'No upcoming slots. Open your first window to start taking bookings.'}
          </p>
        </div>
      )}

      {/* New slots modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-getgrub-navy text-lg mb-5">New slots</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-getgrub-navy mb-1">Deal *</label>
                <select
                  value={form.deal_id}
                  onChange={e => setForm(p => ({ ...p, deal_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                >
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>{d.title} ({d.discount_percent}%)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    min={toLocalInput(new Date())}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">From *</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Until *</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Covers *</label>
                  <input
                    type="number"
                    min="1" max="100"
                    value={form.total_covers}
                    onChange={e => setForm(p => ({ ...p, total_covers: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Discount %</label>
                  <input
                    type="number"
                    min="5" max="100"
                    value={form.discount_override}
                    onChange={e => setForm(p => ({ ...p, discount_override: e.target.value }))}
                    placeholder="Deal default"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Repeat (days)</label>
                  <input
                    type="number"
                    min="1" max="14"
                    value={form.repeat_days}
                    onChange={e => setForm(p => ({ ...p, repeat_days: Math.min(14, Math.max(1, parseInt(e.target.value) || 1)) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Tip: boost the discount on your quietest windows — a 50% Tuesday 8pm slot beats an empty room.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.deal_id || !form.date || form.end_time <= form.start_time}
                className="flex-1 bg-getgrub-coral text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 hover:bg-opacity-90 transition"
              >
                {form.repeat_days > 1 ? `Create ${form.repeat_days} slots` : 'Create slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
