import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Deal, Restaurant } from '../types';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function Deals() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    discount_percent: 20,
    includes_drinks: true,
    deal_type: 'dine_in',
    valid_days: [] as string[],
    valid_from: '',
    valid_until: '',
    min_spend: '',
    max_party_size: '',
    max_daily_claims: '',
  });

  useEffect(() => {
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
      setIsLoading(false);
    }
    load();
  }, []);

  const openNewDeal = () => {
    setEditingDeal(null);
    setForm({
      title: '', description: '', discount_percent: 20, includes_drinks: true,
      deal_type: 'dine_in', valid_days: [], valid_from: '', valid_until: '',
      min_spend: '', max_party_size: '', max_daily_claims: '',
    });
    setShowForm(true);
  };

  const openEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setForm({
      title: deal.title,
      description: deal.description ?? '',
      discount_percent: deal.discount_percent,
      includes_drinks: deal.includes_drinks,
      deal_type: deal.deal_type,
      valid_days: deal.valid_days,
      valid_from: deal.valid_from ?? '',
      valid_until: deal.valid_until ?? '',
      min_spend: deal.min_spend?.toString() ?? '',
      max_party_size: deal.max_party_size?.toString() ?? '',
      max_daily_claims: deal.max_daily_claims?.toString() ?? '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!restaurant || !form.title || form.valid_days.length === 0) return;

    const payload = {
      restaurant_id: restaurant.id,
      title: form.title,
      description: form.description || null,
      discount_percent: form.discount_percent,
      includes_drinks: form.includes_drinks,
      deal_type: form.deal_type,
      valid_days: form.valid_days,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      min_spend: form.min_spend ? parseFloat(form.min_spend) : null,
      max_party_size: form.max_party_size ? parseInt(form.max_party_size) : null,
      max_daily_claims: form.max_daily_claims ? parseInt(form.max_daily_claims) : null,
      is_active: true,
    };

    if (editingDeal) {
      await supabase.from('deals').update(payload).eq('id', editingDeal.id);
    } else {
      await supabase.from('deals').insert(payload);
    }

    // Refresh
    const { data } = await supabase
      .from('deals')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });
    setDeals((data ?? []) as Deal[]);
    setShowForm(false);
  };

  const handleToggleActive = async (deal: Deal) => {
    await supabase.from('deals').update({ is_active: !deal.is_active }).eq('id', deal.id);
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, is_active: !d.is_active } : d));
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      valid_days: prev.valid_days.includes(day)
        ? prev.valid_days.filter(d => d !== day)
        : [...prev.valid_days, day],
    }));
  };

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-getgrub-navy">Deals</h2>
          <p className="text-gray-500 text-sm">{deals.length} deals configured</p>
        </div>
        <button
          onClick={openNewDeal}
          className="bg-getgrub-coral text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition"
        >
          + New deal
        </button>
      </div>

      {/* Deal list */}
      <div className="space-y-4">
        {deals.map(deal => (
          <div key={deal.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-getgrub-navy">{deal.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${deal.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {deal.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
                {deal.description && (
                  <p className="text-gray-500 text-sm mt-0.5">{deal.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {deal.valid_days.map(d => d.slice(0, 3)).join(', ')}
                  </span>
                  {deal.valid_from && deal.valid_until && (
                    <span className="text-xs text-gray-500">{deal.valid_from}–{deal.valid_until}</span>
                  )}
                  {deal.includes_drinks && (
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">Drinks incl.</span>
                  )}
                </div>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>Total claims: <strong className="text-getgrub-navy">{deal.total_claims}</strong></span>
                  <span>Today: <strong className="text-getgrub-navy">{deal.claims_today}</strong></span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openEditDeal(deal)}
                  className="text-sm text-getgrub-navy border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(deal)}
                  className={`text-sm px-3 py-1.5 rounded-lg transition ${deal.is_active ? 'text-red-500 border border-red-200 hover:bg-red-50' : 'text-green-600 border border-green-200 hover:bg-green-50'}`}
                >
                  {deal.is_active ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {deals.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-sm">No deals yet. Create your first deal to start appearing in the app.</p>
          </div>
        )}
      </div>

      {/* Deal form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-getgrub-navy text-lg mb-5">
              {editingDeal ? 'Edit deal' : 'New deal'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-getgrub-navy mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. 30% off total bill"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-getgrub-navy mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Discount %</label>
                  <input
                    type="number"
                    min="5" max="100"
                    value={form.discount_percent}
                    onChange={e => setForm(p => ({ ...p, discount_percent: parseInt(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Deal type</label>
                  <select
                    value={form.deal_type}
                    onChange={e => setForm(p => ({ ...p, deal_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  >
                    <option value="dine_in">Dine-in only</option>
                    <option value="takeaway">Takeaway only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-getgrub-navy mb-2">Valid days *</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${form.valid_days.includes(day) ? 'bg-getgrub-coral text-white border-getgrub-coral' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Valid from</label>
                  <input
                    type="time"
                    value={form.valid_from}
                    onChange={e => setForm(p => ({ ...p, valid_from: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-getgrub-navy mb-1">Valid until</label>
                  <input
                    type="time"
                    value={form.valid_until}
                    onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includes_drinks}
                  onChange={e => setForm(p => ({ ...p, includes_drinks: e.target.checked }))}
                  className="w-4 h-4 accent-getgrub-coral"
                />
                <span className="text-sm text-getgrub-navy">Deal includes drinks</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min spend (£)</label>
                  <input
                    type="number"
                    value={form.min_spend}
                    onChange={e => setForm(p => ({ ...p, min_spend: e.target.value }))}
                    placeholder="None"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max party</label>
                  <input
                    type="number"
                    value={form.max_party_size}
                    onChange={e => setForm(p => ({ ...p, max_party_size: e.target.value }))}
                    placeholder="None"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Daily limit</label>
                  <input
                    type="number"
                    value={form.max_daily_claims}
                    onChange={e => setForm(p => ({ ...p, max_daily_claims: e.target.value }))}
                    placeholder="None"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || form.valid_days.length === 0}
                className="flex-1 bg-getgrub-coral text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 hover:bg-opacity-90 transition"
              >
                {editingDeal ? 'Save changes' : 'Create deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
