export const MOCK_INTEGRATIONS: Record<string, unknown> = {
  shopify_orders: {
    recentOrders: [
      { id: "#1042", customer: "Priya Sharma", amount: 2499, status: "fulfilled", date: "2024-07-10" },
      { id: "#1041", customer: "Rahul Gupta", amount: 899, status: "pending", date: "2024-07-09" },
      { id: "#1040", customer: "Anita Singh", amount: 4200, status: "fulfilled", date: "2024-07-08" },
    ],
    totalRevenue: 45820,
    pendingOrders: 3,
    conversionRate: "3.8%",
  },
  crm_contacts: {
    recentLeads: [
      { name: "Vikram Nair", email: "vikram@example.com", stage: "demo_scheduled", score: 87 },
      { name: "Meera Joshi", email: "meera@example.com", stage: "qualified", score: 72 },
      { name: "Arjun Patel", email: "arjun@example.com", stage: "contacted", score: 55 },
    ],
    totalContacts: 1240,
    hotLeads: 12,
    dealsClosed: 8,
  },
  analytics_data: {
    sessions: 8420,
    bounceRate: "42%",
    avgSessionDuration: "3m 12s",
    topPages: ["/products", "/pricing", "/about"],
  },
  email_campaigns: {
    activeCampaigns: 3,
    openRate: "24%",
    clickRate: "4.2%",
    subscribers: 5200,
  },
};

export function getMockData(key: string): unknown {
  return MOCK_INTEGRATIONS[key] ?? null;
}

export function buildIntegrationContext(integrations: { type: string; enabled: boolean; mockDataKey: string; label: string }[]): string {
  const enabled = integrations.filter((i) => i.enabled);
  if (enabled.length === 0) return "";

  const parts = enabled.map((int) => {
    const data = getMockData(int.mockDataKey);
    return `[${int.label} Data]: ${JSON.stringify(data, null, 2)}`;
  });

  return `\n\nYou have access to the following live integration data:\n${parts.join("\n\n")}`;
}
