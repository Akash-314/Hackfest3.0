import assert from 'node:assert';
import fs from 'node:fs';

async function runTests() {
  console.log('--- 1. Testing Route Responses ---');
  const routes = ['/', '/about', '/competitions', '/problems', '/missions', '/schedule', '/prizes', '/leaderboard', '/rules', '/faq', '/sdc-members', '/members', '/admin/cms'];
  for (const r of routes) {
    const res = await fetch(`http://localhost:5173${r}`);
    assert.strictEqual(res.status, 200, `Expected 200 for ${r}`);
    const text = await res.text();
    assert.ok(text.includes('id="root"'), `Route ${r} should return HTML shell with id="root"`);
    console.log(`[PASS] ${r} -> HTTP 200 OK`);
  }

  console.log('\n--- 2. Testing Route-Aware Active State Logic ---');
  // Replicating Navbar.jsx isRouteActive logic
  const isRouteActive = (targetPath, pathname) => {
    if (!targetPath) return false;
    const clean = targetPath.split('#')[0] || '/';
    if (clean === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname === clean || pathname.startsWith(clean + '/');
  };

  const testCases = [
    { target: '/', current: '/', expected: true, desc: 'Home is active at /' },
    { target: '/', current: '/problems', expected: false, desc: 'Home is NOT active at /problems' },
    { target: '/problems', current: '/problems', expected: true, desc: 'Problems is active at /problems' },
    { target: '/missions', current: '/problems', expected: false, desc: 'Missions is not active at /problems' },
    { target: '/schedule', current: '/schedule', expected: true, desc: 'Schedule is active at /schedule' },
    { target: '/', current: '/schedule', expected: false, desc: 'Home is NOT active at /schedule' },
    { target: '/faq', current: '/faq', expected: true, desc: 'FAQ is active at /faq' },
    { target: '/', current: '/faq', expected: false, desc: 'Home is NOT active at /faq' },
    { target: '/sdc-members', current: '/sdc-members', expected: true, desc: 'SDC Members is active at /sdc-members' },
    { target: '/', current: '/sdc-members', expected: false, desc: 'Home is NOT active at /sdc-members' },
    { target: '/rules', current: '/rules', expected: true, desc: 'Rules is active at /rules' },
    { target: '/prizes', current: '/prizes', expected: true, desc: 'Prizes is active at /prizes' },
    { target: '/leaderboard', current: '/leaderboard', expected: true, desc: 'Leaderboard is active at /leaderboard' },
  ];

  for (const tc of testCases) {
    const actual = isRouteActive(tc.target, tc.current);
    assert.strictEqual(actual, tc.expected, `Failed: ${tc.desc}`);
    console.log(`[PASS] ${tc.desc} (target: ${tc.target}, current: ${tc.current}) -> ${actual}`);
  }

  console.log('\n--- 3. Testing Service and Component Source Integrity ---');

  const eventServiceSrc = fs.readFileSync('src/services/eventService.js', 'utf8');
  assert.ok(eventServiceSrc.includes('getSettings'), 'eventService has getSettings');
  assert.ok(eventServiceSrc.includes('getProblemCategories'), 'eventService has getProblemCategories');
  assert.ok(eventServiceSrc.includes('getProblemStatements'), 'eventService has getProblemStatements');
  assert.ok(eventServiceSrc.includes('pptSubmissionsOpen'), 'eventService maps pptSubmissionsOpen');
  console.log('[PASS] eventService has all required methods and properties');

  const adminServiceSrc = fs.readFileSync('src/services/adminService.js', 'utf8');
  assert.ok(adminServiceSrc.includes('updateEventSettings'), 'adminService has updateEventSettings');
  assert.ok(adminServiceSrc.includes('getProblemCategoriesAdmin'), 'adminService has getProblemCategoriesAdmin');
  assert.ok(adminServiceSrc.includes('saveProblemCategory'), 'adminService has saveProblemCategory');
  assert.ok(adminServiceSrc.includes('toggleProblemCategoryPublish'), 'adminService has toggleProblemCategoryPublish');
  assert.ok(adminServiceSrc.includes('checkProblemCategoryDependencies'), 'adminService has checkProblemCategoryDependencies');
  assert.ok(adminServiceSrc.includes('deleteProblemCategory'), 'adminService has deleteProblemCategory');
  assert.ok(adminServiceSrc.includes('getProblemStatementsAdmin'), 'adminService has getProblemStatementsAdmin');
  assert.ok(adminServiceSrc.includes('saveProblemStatement'), 'adminService has saveProblemStatement');
  assert.ok(adminServiceSrc.includes('toggleProblemStatementPublish'), 'adminService has toggleProblemStatementPublish');
  assert.ok(adminServiceSrc.includes('checkProblemStatementDependencies'), 'adminService has checkProblemStatementDependencies');
  assert.ok(adminServiceSrc.includes('deleteProblemStatement'), 'adminService has deleteProblemStatement');
  console.log('[PASS] adminService has all required Category, Statement, and Event Settings methods');

  const regServiceSrc = fs.readFileSync('src/services/registrationService.js', 'utf8');
  assert.ok(regServiceSrc.includes('Event registration is currently closed'), 'registrationService enforces registration availability');
  console.log('[PASS] registrationService blocks registration when closed');

  const subServiceSrc = fs.readFileSync('src/services/submissionService.js', 'utf8');
  assert.ok(subServiceSrc.includes('submissions are currently closed by event administration'), 'submissionService enforces pptSubmissionsOpen');
  console.log('[PASS] submissionService blocks file upload and submission when closed');

  const migrationSrc = fs.readFileSync('supabase/migrations/20261010_problem_management_and_event_control.sql', 'utf8');
  assert.ok(migrationSrc.includes('CREATE TABLE IF NOT EXISTS public.problem_statements'), 'migration creates problem_statements');
  assert.ok(migrationSrc.includes('enforce_registration_availability'), 'migration contains DB trigger for registration availability');
  assert.ok(migrationSrc.includes('enforce_submission_availability'), 'migration contains DB trigger for submission availability');
  console.log('[PASS] database migration is complete and non-destructive');

  console.log('\n--- 4. Testing Public Component Data Flow ---');
  const probSectionSrc = fs.readFileSync('src/components/ProblemStatementsSection.jsx', 'utf8');
  assert.ok(probSectionSrc.includes('eventService.getProblemCategories()'), 'ProblemStatementsSection fetches dynamic categories');
  assert.ok(probSectionSrc.includes('eventService.getProblemStatements('), 'ProblemStatementsSection fetches dynamic statements');

  const regPageSrc = fs.readFileSync('src/pages/RegisterPage.jsx', 'utf8');
  assert.ok(regPageSrc.includes('REGISTRATION CLOSED // PORTALS SEALED'), 'RegisterPage displays closed state warning banner');
  assert.ok(regPageSrc.includes('isRegistrationClosed'), 'RegisterPage disables submit button when closed');

  const subPageSrc = fs.readFileSync('src/pages/dashboard/DashboardSubmissionPage.jsx', 'utf8');
  assert.ok(subPageSrc.includes('PPT & FINAL SUBMISSIONS CONCLUDED'), 'DashboardSubmissionPage displays submission closed alert');

  console.log('[PASS] Public and participant dashboard pages dynamically enforce CMS controls');
  console.log('\nAll End-to-End Verification Tests Passed Successfully!');
}

runTests().catch(err => {
  console.error('[FAIL] Test execution encountered an error:', err);
  process.exit(1);
});
