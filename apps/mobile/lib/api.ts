import type { ConciergeResult, FeedbackInput, FeedbackAnalysis, GroupResult, RestaurantCandidate, UserProfile } from '../types';

const WORKER_URL = process.env.EXPO_PUBLIC_WORKER_URL!;

export async function aiConcierge(params: {
  query: string;
  userProfile: UserProfile;
  candidates: RestaurantCandidate[];
}): Promise<ConciergeResult[]> {
  const now = new Date();
  const res = await fetch(`${WORKER_URL}/ai/concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: params.query,
      user_profile: params.userProfile,
      candidates: params.candidates,
      current_day: now.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase(),
      current_time: now.toTimeString().slice(0, 5),
    }),
  });
  const data = await res.json() as { result: string };
  return JSON.parse(data.result) as ConciergeResult[];
}

export async function analyzeFeedback(params: FeedbackInput): Promise<FeedbackAnalysis> {
  const res = await fetch(`${WORKER_URL}/ai/analyze-feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json() as { result: string };
  return JSON.parse(data.result) as FeedbackAnalysis;
}

export async function groupCoordinator(params: {
  group_profiles: Array<{
    dietary_tags: string[];
    allergy_tags: string[];
    budget_max_per_head: number;
  }>;
  candidates: RestaurantCandidate[];
}): Promise<GroupResult[]> {
  const res = await fetch(`${WORKER_URL}/ai/group-coordinator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json() as { result: string };
  return JSON.parse(data.result) as GroupResult[];
}
