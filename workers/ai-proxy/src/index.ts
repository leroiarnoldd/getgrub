export interface Env {
  OPENAI_API_KEY: string;
  ALLOWED_ORIGINS: string;
}

const corsHeaders = (origin: string, allowedOrigins: string[]) => ({
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

async function callOpenAI(apiKey: string, model: string, messages: object[], temperature = 0.7): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${err}`);
  }
  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

// Handler: AI Concierge - match restaurants to user query
async function handleConcierge(req: Request, env: Env): Promise<Response> {
  const body = (await req.json()) as {
    query: string;
    user_profile: {
      dietary_tags: string[];
      allergy_tags: string[];
      vibe_preferences: string[];
      budget_max_per_head: number;
    };
    candidates: Array<{
      id: string;
      name: string;
      description: string;
      cuisine_tags: string[];
      dietary_tags: string[];
      vibe_tags: string[];
      reliability_score: number;
      deals: Array<{
        title: string;
        discount_percent: number;
        includes_drinks: boolean;
        valid_days: string[];
        valid_from: string;
        valid_until: string;
      }>;
    }>;
    current_day: string;
    current_time: string;
  };

  const systemPrompt = `You are the Get Grub AI concierge. You help diners find the perfect restaurant deal.
Your job is to rank the provided restaurant candidates based on the user's query and preferences.
Always return a valid JSON array. Be concise and friendly in your reasoning.`;

  const userPrompt = `User query: "${body.query}"
Current day: ${body.current_day}, Current time: ${body.current_time}
User preferences: dietary=${JSON.stringify(body.user_profile.dietary_tags)}, allergies=${JSON.stringify(body.user_profile.allergy_tags)}, vibes=${JSON.stringify(body.user_profile.vibe_preferences)}, budget=£${body.user_profile.budget_max_per_head}/head

Restaurant candidates:
${JSON.stringify(body.candidates, null, 2)}

Return a JSON array of up to 5 best matches. Each item: { "id": string, "score": number (0-100), "match_reason": string (1-2 sentences why this fits), "highlight": string (the best deal detail, e.g. "30% off including drinks until 5pm") }
Only include restaurants where a deal is valid today at the current time if possible. Return ONLY the JSON array, no other text.`;

  const result = await callOpenAI(
    env.OPENAI_API_KEY,
    'gpt-4o-mini',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.5
  );

  return Response.json({ result });
}

// Handler: Tag Restaurant - generate cuisine/dietary/vibe tags from description
async function handleTagRestaurant(req: Request, env: Env): Promise<Response> {
  const body = (await req.json()) as {
    name: string;
    description: string;
    menu_highlights?: string;
  };

  const systemPrompt = `You are a restaurant classification expert for Get Grub, a UK dining deals app.
Extract structured tags from restaurant information. Return only valid JSON.`;

  const userPrompt = `Restaurant: ${body.name}
Description: ${body.description}
${body.menu_highlights ? `Menu highlights: ${body.menu_highlights}` : ''}

Return JSON with:
{
  "cuisine_tags": string[] (e.g. ["british", "gastropub", "burgers"] - max 5, lowercase hyphenated),
  "dietary_tags": string[] (from: halal, vegan, vegetarian, vegan-options, vegetarian-options, gluten-free, gluten-free-options, dairy-free, nut-free, kosher),
  "vibe_tags": string[] (from: casual, date-night, family-friendly, group-friendly, quiet, lively, fine-dining, quick-bite, outdoor-seating)
}
Return ONLY the JSON object.`;

  const result = await callOpenAI(
    env.OPENAI_API_KEY,
    'gpt-4o-mini',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.3
  );

  return Response.json({ result });
}

// Handler: Analyze Feedback - sentiment and themes from user review
async function handleAnalyzeFeedback(req: Request, env: Env): Promise<Response> {
  const body = (await req.json()) as {
    freetext: string;
    food_rating: number;
    vibe_rating: number;
    value_rating: number;
  };

  const systemPrompt = `You are a feedback analysis assistant for Get Grub, a UK restaurant deals platform.
Analyse diner feedback and extract structured insights. Return only valid JSON.`;

  const userPrompt = `Feedback:
Text: "${body.freetext}"
Ratings: food=${body.food_rating}/5, vibe=${body.vibe_rating}/5, value=${body.value_rating}/5

Return JSON:
{
  "sentiment": "positive" | "neutral" | "negative",
  "themes": string[] (e.g. ["great service", "portion sizes", "noisy atmosphere"] - max 5, concise),
  "would_improve_score": boolean (true if this feedback suggests reliability/quality is improving),
  "restaurant_insight": string (1 sentence insight the restaurant owner would find actionable)
}
Return ONLY the JSON object.`;

  const result = await callOpenAI(
    env.OPENAI_API_KEY,
    'gpt-4o-mini',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.4
  );

  return Response.json({ result });
}

// Handler: Notification Copy - generate push notification text
async function handleNotificationCopy(req: Request, env: Env): Promise<Response> {
  const body = (await req.json()) as {
    event_type: 'new_deal' | 'deal_expiring' | 'reliability_drop' | 'weekly_roundup';
    context: {
      restaurant_name?: string;
      deal_title?: string;
      discount_percent?: number;
      city?: string;
      deals_count?: number;
      reliability_score?: number;
    };
  };

  const systemPrompt = `You write push notification copy for Get Grub, a UK restaurant deals app.
Copy is friendly, concise, and motivating. Max 60 chars for title, 100 chars for body. UK English. Return only valid JSON.`;

  const userPrompt = `Event type: ${body.event_type}
Context: ${JSON.stringify(body.context)}

Return JSON: { "title": string, "body": string }
Return ONLY the JSON object.`;

  const result = await callOpenAI(
    env.OPENAI_API_KEY,
    'gpt-4o-mini',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.8
  );

  return Response.json({ result });
}

// Handler: Group Coordinator - find restaurants that satisfy a group's mixed preferences
async function handleGroupCoordinator(req: Request, env: Env): Promise<Response> {
  const body = (await req.json()) as {
    group_profiles: Array<{
      dietary_tags: string[];
      allergy_tags: string[];
      budget_max_per_head: number;
    }>;
    candidates: Array<{
      id: string;
      name: string;
      description: string;
      cuisine_tags: string[];
      dietary_tags: string[];
      vibe_tags: string[];
      reliability_score: number;
      deals: Array<{
        title: string;
        discount_percent: number;
        includes_drinks: boolean;
        valid_days: string[];
        valid_from: string;
        valid_until: string;
      }>;
    }>;
  };

  const systemPrompt = `You are a group dining coordinator for Get Grub, a UK restaurant deals app.
Find restaurants that best accommodate everyone in a group, considering all dietary needs and budgets.
Return only valid JSON.`;

  const minBudget = Math.min(...body.group_profiles.map((p) => p.budget_max_per_head));
  const allDietary = [...new Set(body.group_profiles.flatMap((p) => p.dietary_tags))];
  const allAllergies = [...new Set(body.group_profiles.flatMap((p) => p.allergy_tags))];

  const userPrompt = `Group of ${body.group_profiles.length} people.
Combined requirements: dietary=${JSON.stringify(allDietary)}, allergies=${JSON.stringify(allAllergies)}, min shared budget=£${minBudget}/head

Restaurant candidates:
${JSON.stringify(body.candidates, null, 2)}

Return a JSON array of up to 5 best group-friendly matches:
[{ "id": string, "score": number (0-100), "group_fit": string (1-2 sentences why it works for the whole group), "compromise": string | null (any dietary/budget compromise needed, or null if perfect fit) }]
Return ONLY the JSON array.`;

  const result = await callOpenAI(
    env.OPENAI_API_KEY,
    'gpt-4o-mini',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.5
  );

  return Response.json({ result });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:8081'];

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowedOrigins),
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const headers = {
      'Content-Type': 'application/json',
      ...corsHeaders(origin, allowedOrigins),
    };

    try {
      let response: Response;

      switch (url.pathname) {
        case '/ai/concierge':
          response = await handleConcierge(request, env);
          break;
        case '/ai/tag-restaurant':
          response = await handleTagRestaurant(request, env);
          break;
        case '/ai/analyze-feedback':
          response = await handleAnalyzeFeedback(request, env);
          break;
        case '/ai/notification-copy':
          response = await handleNotificationCopy(request, env);
          break;
        case '/ai/group-coordinator':
          response = await handleGroupCoordinator(request, env);
          break;
        default:
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
      }

      // Add CORS headers to the response
      const body = await response.text();
      return new Response(body, {
        status: response.status,
        headers: { ...Object.fromEntries(response.headers), ...headers },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return new Response(JSON.stringify({ error: message }), { status: 500, headers });
    }
  },
};
