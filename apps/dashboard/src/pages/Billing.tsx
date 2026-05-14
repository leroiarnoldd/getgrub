import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BillingSummary, Invoice, RestaurantBilling, SubscriptionTier } from '../types';

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function FreePeriodBanner({ billing }: { billing: RestaurantBilling }) {
  const endsAt = new Date(billing.free_period_ends_at);
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  if (!billing.is_in_free_period) return null;

  return (
    <div className="bg-getgrub-teal/10 border border-getgrub-teal/30 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-4">
        <span className="text-2xl">🎉</span>
        <div>
          <h3 className="font-bold text-getgrub-teal">You're in your free period!</h3>
          <p className="text-sm text-gray-600 mt-1">
            No charges apply until <strong>{formatDate(billing.free_period_ends_at)}</strong>.
            {daysLeft > 0 ? (
              <> That's <strong>{daysLeft} days</strong> left to get your first deals up and running at no cost.</>
            ) : (
              <> Your free period ends today.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function TierCard({
  tier,
  isCurrentTier,
  onSelect,
}: {
  tier: SubscriptionTier;
  isCurrentTier: boolean;
  onSelect: () => void;
}) {
  return (
    <div className={`rounded-2xl p-6 border-2 transition ${isCurrentTier ? 'border-getgrub-coral bg-getgrub-coral/5' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-black text-getgrub-navy text-lg">{tier.name}</h3>
          {tier.monthly_fee_pence > 0 ? (
            <p className="text-2xl font-black text-getgrub-coral mt-1">{formatPence(tier.monthly_fee_pence)}<span className="text-base font-normal text-gray-500">/mo</span></p>
          ) : (
            <p className="text-2xl font-black text-getgrub-teal mt-1">Free</p>
          )}
          <p className="text-sm text-gray-500 mt-0.5">+ {formatPence(tier.cover_fee_pence)} per cover</p>
        </div>
        {isCurrentTier && (
          <span className="bg-getgrub-coral text-white text-xs font-bold px-3 py-1 rounded-full">Current</span>
        )}
      </div>

      <ul className="space-y-2 mb-5">
        {tier.features.map(feature => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-getgrub-teal font-bold mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {!isCurrentTier && (
        <button
          onClick={onSelect}
          className="w-full bg-getgrub-navy text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-opacity-90 transition"
        >
          Switch to {tier.name}
        </button>
      )}
    </div>
  );
}

function UsageTracker({ summary }: { summary: BillingSummary }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-getgrub-navy mb-4">This month's usage</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-500 text-xs">Covers redeemed</p>
          <p className="text-2xl font-black text-getgrub-navy">{summary.covers_this_month}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Cover fees</p>
          <p className="text-2xl font-black text-getgrub-navy">
            {summary.is_in_free_period
              ? <span className="text-getgrub-teal line-through text-lg">{formatPence(summary.cover_fees_this_month_pence)}</span>
              : formatPence(summary.cover_fees_this_month_pence)
            }
          </p>
          {summary.is_in_free_period && <p className="text-getgrub-teal text-xs font-medium">Waived (free period)</p>}
        </div>
        <div>
          <p className="text-gray-500 text-xs">Estimated bill</p>
          <p className="text-2xl font-black text-getgrub-coral">
            {formatPence(summary.estimated_bill_this_month_pence)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Billing() {
  const [billing, setBilling] = useState<RestaurantBilling | null>(null);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [switchingTier, setSwitchingTier] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get restaurant
      const { data: rest } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!rest) { setIsLoading(false); return; }
      setRestaurantId(rest.id);

      // Load all billing data in parallel
      const [billingRes, summaryRes, tiersRes, invoicesRes] = await Promise.all([
        supabase
          .from('restaurant_billing')
          .select('*')
          .eq('restaurant_id', rest.id)
          .single(),
        supabase
          .from('restaurant_billing_summary')
          .select('*')
          .eq('restaurant_id', rest.id)
          .single(),
        supabase
          .from('subscription_tiers')
          .select('*')
          .order('monthly_fee_pence'),
        supabase
          .from('invoices')
          .select('*')
          .eq('restaurant_id', rest.id)
          .order('period_start', { ascending: false })
          .limit(12),
      ]);

      if (billingRes.data) setBilling(billingRes.data as RestaurantBilling);
      if (summaryRes.data) setSummary(summaryRes.data as BillingSummary);
      if (tiersRes.data) setTiers(tiersRes.data as SubscriptionTier[]);
      if (invoicesRes.data) setInvoices(invoicesRes.data as Invoice[]);

      setIsLoading(false);
    }
    load();
  }, []);

  const handleTierChange = async (tierId: string) => {
    if (!restaurantId || tierId === billing?.tier_id) return;
    setSwitchingTier(tierId);
    await supabase
      .from('restaurant_billing')
      .update({ tier_id: tierId })
      .eq('restaurant_id', restaurantId);

    // Reload billing
    const { data } = await supabase
      .from('restaurant_billing')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();
    if (data) setBilling(data as RestaurantBilling);
    setSwitchingTier(null);
  };

  if (isLoading) return <div className="p-8 text-gray-500">Loading billing information...</div>;

  if (!billing) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 rounded-2xl p-6">
          <h2 className="text-getgrub-navy font-bold">No billing record found</h2>
          <p className="text-gray-500 text-sm mt-1">Contact support to set up your billing account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-getgrub-navy">Billing</h2>
        <p className="text-gray-500 text-sm">Manage your subscription and view invoices</p>
      </div>

      {/* Free period banner */}
      <FreePeriodBanner billing={billing} />

      {/* Current month usage */}
      {summary && (
        <div className="mb-6">
          <UsageTracker summary={summary} />
        </div>
      )}

      {/* Tier comparison */}
      <div className="mb-8">
        <h3 className="font-bold text-getgrub-navy mb-4">Your plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map(tier => (
            <TierCard
              key={tier.id}
              tier={tier}
              isCurrentTier={tier.id === billing.tier_id}
              onSelect={() => handleTierChange(tier.id)}
            />
          ))}
        </div>
        {switchingTier && (
          <p className="text-gray-500 text-sm mt-3 text-center">Switching plan...</p>
        )}
      </div>

      {/* Invoice history */}
      <div>
        <h3 className="font-bold text-getgrub-navy mb-4">Invoice history</h3>
        {invoices.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Period</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Covers</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Cover fees</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Subscription</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Total</th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-sm text-getgrub-navy">
                      {formatDate(inv.period_start)} – {formatDate(inv.period_end)}
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-gray-600">{inv.covers_count}</td>
                    <td className="px-5 py-3 text-sm text-right text-gray-600">{formatPence(inv.cover_fees_pence)}</td>
                    <td className="px-5 py-3 text-sm text-right text-gray-600">{formatPence(inv.subscription_fee_pence)}</td>
                    <td className="px-5 py-3 text-sm text-right font-semibold text-getgrub-navy">{formatPence(inv.total_pence)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'waived' ? 'bg-teal-100 text-teal-700' :
                        inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-400 text-sm">No invoices yet. Your first invoice will appear at the end of your billing period.</p>
          </div>
        )}
      </div>

      {/* Billing email */}
      {billing.billing_email && (
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-getgrub-navy mb-1">Billing contact</h3>
          <p className="text-gray-500 text-sm">Invoices are sent to <strong>{billing.billing_email}</strong></p>
        </div>
      )}
    </div>
  );
}
