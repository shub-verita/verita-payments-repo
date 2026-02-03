# Verita Payments - Claude Code Setup Prompts

Copy and paste these prompts into Claude Code to set up and extend the project.

---

## 🚀 PROMPT 1: Initial Project Setup

```
I have a Next.js project for a contractor payments portal. The project archive is at ~/Downloads/verita-payments.tar.gz (or wherever you saved it).

Please help me:
1. Extract the archive to ~/projects/verita-payments
2. Install all dependencies with npm install
3. Push the Prisma schema to my Supabase database with `npx prisma db push`
4. Seed the demo data with `npm run db:seed`
5. Start the dev server with `npm run dev`

The .env file already has my Supabase and Clerk credentials configured.

After each step, let me know if there are any errors.
```

---

## 🔧 PROMPT 2: Verify Everything Works

```
The Verita Payments portal should now be running at http://localhost:3000.

Please verify:
1. Check that the login page loads at /login (should show Clerk sign-in)
2. After signing in, check that /dashboard loads with the contractor earnings view
3. Check that /ops loads with the operations dashboard
4. Test the API route GET /api/contractors and confirm it returns data

If any of these fail, help me debug the issue.
```

---

## 🌐 PROMPT 3: Deploy to Vercel

```
I want to deploy verita-payments to Vercel. Please help me:

1. Initialize a git repository if not already done
2. Create a .gitignore that excludes node_modules, .env, .next, etc.
3. Push to a new GitHub repository called verita-payments
4. Deploy to Vercel using the Vercel CLI

For Vercel, I need to set these environment variables:
- DATABASE_URL (Supabase connection string)
- DIRECT_URL (same as DATABASE_URL)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

Guide me through each step.
```

---

## 📊 PROMPT 4: Connect Real Deel Data

```
I want to integrate the Deel API to fetch real contractor and payment data.

The Deel API base URL is https://api.deel.com/rest/v2
I have an API key: [YOUR_DEEL_API_KEY]

Please:
1. Create a Deel API client at src/lib/deel/client.ts
2. Add functions for:
   - getContracts() - list all contracts
   - getPayments(contractId?) - get payment history
3. Create an API route POST /api/sync/deel that:
   - Fetches contracts from Deel
   - Matches them to contractors by email
   - Updates deelContractId in our database
   - Syncs payment history
4. Update the contractor dashboard to use real data instead of mock data

Handle rate limiting and errors gracefully.
```

---

## ⏱️ PROMPT 5: Add Insightful Integration

```
I want to integrate Insightful for time tracking data.

The Insightful API details:
- Base URL: https://api.insightful.io/v1
- API Key: [YOUR_INSIGHTFUL_API_KEY]

Please:
1. Create an Insightful API client at src/lib/insightful/client.ts
2. Add functions for:
   - getTimeEntries(startDate, endDate, userId?) - get time logs
   - getUsers() - list tracked users
3. Create a sync service that:
   - Fetches time entries for all active contractors
   - Converts seconds to hours
   - Upserts into our TimeEntry table
   - Marks source as 'INSIGHTFUL'
4. Create an API route POST /api/sync/insightful to trigger the sync
5. Set up a cron job (or Vercel cron) to run this sync nightly at 2am

The time entries should show productive_time and non_productive_time separately.
```

---

## ✅ PROMPT 6: Build Hours Approval Workflow

```
I need to build the hours approval workflow for the ops team.

Create the following:
1. A page at /ops/hours that shows:
   - All unapproved time entries grouped by contractor
   - Columns: Date, Total Hours, Productive Hours, Screenshots, Source
   - Checkbox to select entries
   - "Approve Selected" button
   - "Approve All" button

2. An API route POST /api/time-entries/approve that:
   - Takes an array of time entry IDs
   - Sets approved=true, approvedBy=currentUserId, approvedAt=now
   - Returns success/failure

3. Update the ops dashboard to show count of pending approvals

Only time entries that are approved should be eligible for payment.
```

---

## 💰 PROMPT 7: Build Batch Payment Processing

```
I need to build the payment processing page for ops.

Create /ops/payments/process that:
1. Shows a date range picker for the payment period (default: current pay period)
2. Lists all contractors with approved, unpaid hours for that period
3. For each contractor shows:
   - Name
   - Checkr status (must be CLEAR to process)
   - Approved hours
   - Hourly rate
   - Calculated amount
   - Checkbox to include in batch

4. "Create Batch Payment" button that:
   - Validates all selected contractors have Checkr CLEAR
   - Creates Payment records in our database
   - Calls Deel API to create the payments
   - Updates payment status to PROCESSING
   - Shows success/failure for each

5. Handle the case where Checkr is not CLEAR:
   - Show warning badge
   - Disable checkbox
   - Cannot be included in batch

This enforces the business rule: no payment without cleared background check.
```

---

## 🔔 PROMPT 8: Add Webhook Handlers

```
I need webhook handlers for Deel and Checkr status updates.

1. Create POST /api/webhooks/deel that:
   - Receives Deel payment status webhooks
   - Updates our Payment record status accordingly:
     - "processing" → PROCESSING
     - "paid" → PAID (set paidAt)
     - "failed" → FAILED (set failedAt, failureReason)
   - Logs the webhook to AuditLog

2. Create POST /api/webhooks/checkr that:
   - Receives Checkr report completion webhooks
   - Updates contractor checkrStatus and checkrCompletedAt
   - If status is CLEAR:
     - Set paymentEligible = true
     - Update status to ACTIVE (if was PENDING_CHECKR)
   - If status is not CLEAR:
     - Set paymentEligible = false
     - Log alert for ops review

Both webhooks should:
- Verify webhook signatures for security
- Return 200 OK quickly
- Handle retries gracefully
```

---

## 📧 PROMPT 9: Add Email Notifications (Optional)

```
I want to add email notifications for key events.

Using Resend (or another email service), create notifications for:

1. Payment Received:
   - Trigger: Payment status changes to PAID
   - To: Contractor email
   - Content: "Your payment of $X has been deposited"

2. Hours Approved:
   - Trigger: Time entries approved
   - To: Contractor email
   - Content: "Your hours for [date range] have been approved"

3. Action Required (to ops):
   - Trigger: Checkr status is CONSIDER
   - To: ops@verita-ai.com
   - Content: "Background check needs review for [contractor]"

Create an email service at src/lib/email.ts and use it from webhooks/API routes.
```

---

## 🎨 PROMPT 10: Polish the UI

```
Help me polish the Verita Payments UI:

1. Add loading states:
   - Skeleton loaders for dashboard cards
   - Spinner for table loading
   - Button loading states during actions

2. Add error handling:
   - Toast notifications for success/error
   - Error boundaries for pages
   - Friendly error messages

3. Improve mobile responsiveness:
   - Collapsible sidebar on mobile
   - Responsive tables (horizontal scroll or card view)
   - Touch-friendly buttons

4. Add empty states:
   - No payments yet
   - No hours logged
   - No contractors (for ops)

5. Add real-time updates (optional):
   - Use Supabase realtime to update payment status
   - Show "just now" timestamps that update

Use shadcn/ui toast component for notifications.
```

---

## Usage Tips

1. **Run prompts in order** - Each builds on the previous
2. **Share errors** - If something fails, paste the full error to Claude Code
3. **Test after each step** - Make sure it works before moving on
4. **Commit often** - Save your progress with git commits

Good luck! 🚀
