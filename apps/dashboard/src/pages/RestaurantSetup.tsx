import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface City { id: string; name: string; slug: string }

const CUISINES = ['British','Italian','Indian','Chinese','Japanese','Thai','American','Mexican','Mediterranean','Pizza','Burgers','Vegan','Cafe','Pub','Seafood','Steakhouse'];
const DIETARY = ['vegetarian-options','vegan-options','gluten-free-options','halal'];

function slugify(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export function RestaurantSetup({ onCreated }: { onCreated: () => void }) {
  const [cities, setCities] = useState<City[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', city_id: '', cuisine: [] as string[], dietary: [] as string[],
    address: '', postcode: '', description: '',
  });

  useEffect(() => {
    supabase.from('cities').select('id, name, slug').eq('active', true).order('name')
      .then(({ data }) => {
        const list = (data ?? []) as City[];
        setCities(list);
        setForm(f => ({ ...f, city_id: list[0]?.id ?? '' }));
      });
  }, []);

  const toggle = (key: 'cuisine' | 'dietary', val: string) =>
    setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));

  const handleCreate = async () => {
    setError('');
    if (!form.name.trim() || !form.city_id) { setError('Add a name and city.'); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not signed in.'); setSaving(false); return; }

    const { error: insErr } = await supabase.from('restaurants').insert({
      owner_id: user.id,
      city_id: form.city_id,
      name: form.name.trim(),
      slug: slugify(form.name),
      description: form.description || null,
      cuisine_tags: form.cuisine.map(c => c.toLowerCase()),
      dietary_tags: form.dietary,
      address: form.address || null,
      postcode: form.postcode || null,
      is_active: true,
    });
    setSaving(false);
    if (insErr) { setError(insErr.message); return; }
    onCreated();
  };

  return (
    <div className="min-h-screen bg-getgrub-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-sm">
        <h1 className="text-2xl font-black text-getgrub-navy">Set up your restaurant</h1>
        <p className="text-gray-500 text-sm mb-6">A few details and you're ready to post off-peak deals.</p>

        {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Restaurant name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-navy" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-getgrub-navy mb-1">City *</label>
              <select value={form.city_id} onChange={e => setForm(p => ({ ...p, city_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-navy">
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-getgrub-navy mb-1">Postcode</label>
              <input value={form.postcode} onChange={e => setForm(p => ({ ...p, postcode: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-navy" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Address</label>
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-navy" />
          </div>

          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-2">Cuisine</label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <button key={c} type="button" onClick={() => toggle('cuisine', c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${form.cuisine.includes(c) ? 'bg-getgrub-navy text-white border-getgrub-navy' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-2">Dietary options</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY.map(c => (
                <button key={c} type="button" onClick={() => toggle('dietary', c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${form.dietary.includes(c) ? 'bg-getgrub-navy text-white border-getgrub-navy' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {c.replace('-options','')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Short description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-getgrub-navy" />
          </div>
        </div>

        <button onClick={handleCreate} disabled={saving}
          className="w-full mt-6 bg-getgrub-navy text-white font-semibold py-3 rounded-xl hover:bg-opacity-90 transition disabled:opacity-50">
          {saving ? 'Creating…' : 'Create restaurant'}
        </button>
      </div>
    </div>
  );
}
