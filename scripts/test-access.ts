// Unit tests for pure access rule functions
// Run: npx tsx scripts/test-access.ts

import {
  isMemberOfProject,
  getRoleInProject,
  isAdminOfProject,
  canViewProject,
  canAccessAdminDashboard,
} from "../src/lib/access/projectAccess";

const members = [
  { userId: "user-admin-1", role: "admin" as const },
  { userId: "user-member-2", role: "member" as const },
];

let passed = 0;
let failed = 0;

function test(name: string, result: boolean, expected: boolean) {
  const ok = result === expected;
  if (ok) { console.log(`  ✅ ${name}`); passed++; }
  else { console.log(`  ❌ ${name} — expected ${expected}, got ${result}`); failed++; }
}

console.log("\n🧪 Access Rule Tests\n");

test("admin is member of project", isMemberOfProject(members, "user-admin-1"), true);
test("member is member of project", isMemberOfProject(members, "user-member-2"), true);
test("unknown user is NOT member", isMemberOfProject(members, "user-unknown"), false);

test("admin role is 'admin'", getRoleInProject(members, "user-admin-1") === "admin", true);
test("member role is 'member'", getRoleInProject(members, "user-member-2") === "member", true);
test("unknown user role is null", getRoleInProject(members, "nobody") === null, true);

test("admin isAdmin = true", isAdminOfProject(members, "user-admin-1"), true);
test("member isAdmin = false", isAdminOfProject(members, "user-member-2"), false);
test("unknown isAdmin = false", isAdminOfProject(members, "nobody"), false);

test("admin canViewProject", canViewProject(members, "user-admin-1"), true);
test("member canViewProject", canViewProject(members, "user-member-2"), true);
test("unknown cannot view project", canViewProject(members, "nobody"), false);

test("admin canAccessAdminDashboard", canAccessAdminDashboard(members, "user-admin-1"), true);
test("member CANNOT access admin dashboard", canAccessAdminDashboard(members, "user-member-2"), false);
test("unknown CANNOT access admin dashboard", canAccessAdminDashboard(members, "nobody"), false);

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
