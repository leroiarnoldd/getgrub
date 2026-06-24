import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Claim, Restaurant } from '../types';

interface BookingRow extends Claim {
  deal: { title: string; discount_percent: number } | null;
  slot: { starts_at: string; ends_at: string; discount_percent: number | null } | null;
}

function fmtTime(iso: string | null): string {
  if (!iso) return '';
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

export function Bookings() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState('');
  const [bill, setBill] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const load = async (restaurantId: string) => {
    const { data } = await supabase
      .from('claims')
      .select('*, deal:deals(title, discount_percent), slot:deal_slots(starts_at, ends_at, discount_percent)')
      .eq('restaurant_id', restaurantId)
      .order('claimed_at', { ascending: false })
      .limit(100);
    setRows((data ?? []) as BookingRow[]);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: rest } = await supabase
        .from('restaurants').select('*').eq('owner_id', user.id).single();
      if (!rest) { setIsLoading(false); return; }
      setRestaurant(rest as Restaurant);
      await load(rest.id);
      setIsLoading(false);
      channel = supabase
        .channel('claims_live')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'claims', filter: `restaurant_id=eq.${rest.id}` },
          () => load(rest.id))
        .subscribe();
    }
    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const redeem = async (voucherCode: string, billValue: string) => {
    const billNum = parseFloat(billValue);
    if (!voucherCode.trim()) { setMessage({ kind: 'err', text: 'Enter a voucher code.' }); return; }
    if (!billNum || billNum <= 0) { setMessage({ kind: 'err', text: 'Enter the bill total.' }); return; }
    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase.rpc('redeem_claim', {
      p_voucher_code: voucherCode.trim(),
      p_actual_bill: billNum,
    });
    setBusy(false);
    if (error) {
      const map: Record<string, string> = {
        CLAIM_NOT_FOUND: 'No booking found with that code.',
        NOT_YOUR_VENUE: 'That voucher is for a different venue.',
        ALREADY_REDEEMED: 'That voucher has already been redeemed.',
        CLAIM_NOT_ACTIVE: 'That booking is cancelled or expired.',
      };
      const key = Object.keys(map).find(k => error.message.includes(k));
      setMessage({ kind: 'err', text: key ? map[key] : error.message });
      return;
    }
    const saved = (data as Claim)?.amount_saved ?? 0;
    setMessage({ kind: 'ok', text: `Redeemed. Diner saved £${Number(saved).toFixed(2)}.` });
    setCode(''); setBill(''); setRedeemingId(null);
    if (restaurant) load(restaurant.id);
  };

  const grouped = useMemo(() => {
    const active = rows.filter(r => r.status === 'claimed');
    const map = new Map<string, BookingRow[]>();
    for (const r of active) {
      const key = r.slot ? dayLabel(r.slot.starts_at) : dayLabel(r.claimed_at);
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()];
  }, [rows]);

  const redeemedToday = rows.filter(r =>
    r.status === 'redeemed' && r.redeemed_at &&
    new Date(r.redeemed_at).toDateString() === new Date().toDateString());

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  if (!restaurant) {
    return <div className="p-8 text-gray-500">No restaurant linked to this account yet.</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-2xl font-black text-getgrub-navy">Bookings</h2>
      <p className="text-gray-500 text-sm mb-6">Redeem a diner's voucher when they pay.</p>

      {/* Quick redeem */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h3 className="font-bold text-getgrub-navy mb-3">Redeem a voucher</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Voucher code</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7F3A9C2B"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-getgrub-navy"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-500 mb-1">Bill total (£)</label>
            <input
              type="number" min="0" step="0.01"
              value={bill}
              onChange={e => setBill(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-navy"
            />
          </div>
          <button
            onClick={() => redeem(code, bill)}
            disabled={busy}
            className="bg-getgrub-navy text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {busy ? 'Redeeming…' : 'Redeem'}
          </button>
        </div>
        {message && (
          <div className={`mt-3 text-sm rounded-xl px-4 py-2.5 ${message.kind === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Upcoming bookings */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center mb-6">
          <p className="text-gray-400 text-sm">No active bookings yet. They'll appear here as diners book.</p>
        </div>
      ) : (
        grouped.map(([label, dayRows]) => (
          <div key={label} className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{label}</h3>
            <div className="space-y-3">
              {dayRows.map(r => {
                const discount = r.slot?.discount_percent ?? r.deal?.discount_percent ?? 0;
                return (
                  <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="font-bold text-getgrub-navy">
                          {r.slot ? `${fmtTime(r.slot.starts_at)}–${fmtTime(r.slot.ends_at)}` : 'Walk-in'}
                          <span className="text-gray-400 font-normal"> · party of {r.party_size}</span>
                        </div>
                        <div className="text-sm text-gray-500">{r.deal?.title ?? 'Deal'} · {discount}% off</div>
                        <div className="mt-1 font-mono text-sm tracking-widest text-getgrub-navy">{r.voucher_code}</div>
                      </div>
                      {redeemingId === r.id ? (
                        <div className="flex items-end gap-2">
                          <div className="w-28">
                            <label className="block text-xs text-gray-500 mb-1">Bill (£)</label>
                            <input
                              type="number" min="0" step="0.01" autoFocus
                              value={bill}
                              onChange={e => setBill(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-navy"
                            />
                          </div>
                          <button onClick={() => redeem(r.voucher_code, bill)} disabled={busy}
                            className="bg-getgrub-navy text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                            Confirm
                          </button>
                          <button onClick={() => { setRedeemingId(null); setBill(''); }}
                            className="text-sm text-gray-500 px-2 py-2">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setRedeemingId(r.id); setBill(''); setMessage(null); }}
                          className="text-sm text-getgrub-navy border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                          Redeem
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Redeemed today summary */}
      {redeemedToday.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Redeemed today ({redeemedToday.length})
          </h3>
          <div className="space-y-2">
            {redeemedToday.map(r => (
              <div key={r.id} className="flex justify-between text-sm">
                <span className="text-getgrub-navy">{r.deal?.title ?? 'Deal'} · party of {r.party_size}</span>
                <span className="text-gray-500">
                  bill £{Number(r.actual_bill ?? 0).toFixed(2)} · saved £{Number(r.amount_saved ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
