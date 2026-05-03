// Unit tests for Zod validation schemas
// Run: npx tsx scripts/test-schemas.ts

import { LoginSchema, SendMessageSchema, CreateConversationSchema, UpdateDashboardConfigSchema } from "../src/lib/validations/schemas";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => boolean) {
  try {
    const ok = fn();
    if (ok) { console.log(`  ✅ ${name}`); passed++; }
    else { console.log(`  ❌ ${name}`); failed++; }
  } catch (e) {
    console.log(`  ❌ ${name} — threw: ${e}`);
    failed++;
  }
}

console.log("\n🧪 Zod Schema Tests\n");

// LoginSchema
test("LoginSchema: valid", () => LoginSchema.safeParse({ email: "a@b.com", password: "pass" }).success);
test("LoginSchema: invalid email", () => !LoginSchema.safeParse({ email: "not-email", password: "pass" }).success);
test("LoginSchema: empty password fails", () => !LoginSchema.safeParse({ email: "a@b.com", password: "" }).success);

// SendMessageSchema
test("SendMessageSchema: valid", () => SendMessageSchema.safeParse({ content: "Hello!" }).success);
test("SendMessageSchema: empty content fails", () => !SendMessageSchema.safeParse({ content: "" }).success);
test("SendMessageSchema: optional conversationId", () => SendMessageSchema.safeParse({ content: "Hi", conversationId: "abc" }).success);

// CreateConversationSchema
test("CreateConversationSchema: valid", () => CreateConversationSchema.safeParse({ productInstanceId: "inst-1" }).success);
test("CreateConversationSchema: missing productInstanceId fails", () => !CreateConversationSchema.safeParse({}).success);

// UpdateDashboardConfigSchema
test("UpdateDashboardConfigSchema: partial update ok", () => UpdateDashboardConfigSchema.safeParse({ headerTitle: "New Title" }).success);
test("UpdateDashboardConfigSchema: empty object ok", () => UpdateDashboardConfigSchema.safeParse({}).success);
test("UpdateDashboardConfigSchema: valid sections", () => UpdateDashboardConfigSchema.safeParse({
  sections: [{ id: "s1", title: "Overview", order: 1, visible: true, widgets: [{ id: "w1", type: "stat-card", title: "Total", order: 1, visible: true }] }]
}).success);

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
