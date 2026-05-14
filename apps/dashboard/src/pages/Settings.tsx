import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Restaurant } from '../types';

export function Settings() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    postcode: '',
    phone: '',
    website: '',
    cover_image_url: '',
    is_active: true,
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

      if (rest) {
        setRestaurant(rest as Restaurant);
        setForm({
          name: rest.name,
          description: rest.description ?? '',
          address: rest.address ?? '',
          postcode: rest.postcode ?? '',
          phone: rest.phone ?? '',
          website: rest.website ?? '',
          cover_image_url: rest.cover_image_url ?? '',
          is_active: rest.is_active,
        });
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!restaurant) return;
    setIsSaving(true);
    setSaveSuccess(false);

    await supabase
      .from('restaurants')
      .update({
        name: form.name,
        description: form.description || null,
        address: form.address || null,
        postcode: form.postcode || null,
        phone: form.phone || null,
        website: form.website || null,
        cover_image_url: form.cover_image_url || null,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', restaurant.id);

    setSaveSuccess(true);
    setIsSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  if (!restaurant) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 rounded-2xl p-6">
          <h2 className="text-getgrub-navy font-bold">No restaurant found</h2>
          <p className="text-gray-500 text-sm mt-1">Contact support to get your restaurant set up.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-getgrub-navy">Restaurant settings</h2>
        <p className="text-gray-500 text-sm">Update your restaurant information shown in the app</p>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-5">
          Changes saved successfully.
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        {/* Active toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <label className="font-semibold text-getgrub-navy">Restaurant active</label>
            <p className="text-gray-400 text-xs mt-0.5">Toggle to show or hide your restaurant in the app</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-getgrub-coral"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-getgrub-navy mb-1">Restaurant name</label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-getgrub-navy mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Address</label>
            <input
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Postcode</label>
            <input
              value={form.postcode}
              onChange={e => setForm(p => ({ ...p, postcode: e.target.value.toUpperCase() }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              type="tel"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Website</label>
            <input
              value={form.website}
              onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
              type="url"
              placeholder="https://"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-getgrub-navy mb-1">Cover image URL</label>
          <input
            value={form.cover_image_url}
            onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
            type="url"
            placeholder="https://..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !form.name}
          className="w-full bg-getgrub-coral text-white font-semibold py-3 rounded-xl disabled:opacity-50 hover:bg-opacity-90 transition"
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {/* Read-only info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mt-5">
        <h3 className="font-bold text-getgrub-navy mb-3">Account info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Restaurant ID</span>
            <span className="font-mono text-xs text-gray-600">{restaurant.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Slug</span>
            <span className="font-mono text-xs text-gray-600">{restaurant.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member since</span>
            <span className="text-gray-600">{new Date(restaurant.created_at).toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
