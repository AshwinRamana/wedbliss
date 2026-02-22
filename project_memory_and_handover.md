# Vaazh - Project Memory & Handover Document

## 📖 Introduction
This document serves as the persistent memory and technical handover for **Vaazh**, a digital wedding invitation platform. It contains the architectural overview, implemented features, bugs resolved, and future roadmap. **Provide this file to any future AI assistants or developers to instantly resume development or testing from the exact state documented here.**

---

## 🏗️ Technology Stack
- **Frontend Framework**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS (with custom emerald/gold themed gradients and utilities in `globals.css`)
- **UI Interactions**: Framer Motion (page transitions, scrolling animations)
- **Database & Auth**: Supabase (PostgreSQL, Authentication)
- **Backend API**: Node.js & Express (Running on port `4000`)
- **Email Service**: Nodemailer integrated with Gmail SMTP (`ashwinramana17@gmail.com`)

---

## ⚙️ Architecture & Data Flow

### 1. Authentication Flow (Custom OTP & Silent Signup)
To bypass complex Supabase public registration flows and minimize friction, a custom OTP system was engineered:
- **Phase 1 (OTP Send)**: The Frontend posts to the Node.js `/api/auth/send-otp` route. The Node server checks if it's a `login` or `signup` request by performing a silent `signInWithPassword` check against Supabase using a deterministic dummy password. If valid, an OTP is emailed via Gmail SMTP.
- **Phase 2 (OTP Verify)**: The user submits the OTP. The Node server verifies it, and implicitly provisions/logs-in the user in Supabase by returning a securely generated `dummyPassword`.
- **Phase 3 (Session Est.)**: The Frontend receives the `sessionPassword` and calls `supabase.auth.signInWithPassword()` to silently establish a secure browser-cookie session.
- **Deduplication Check**: The `type` parameter sent to `/send-otp` ensures that unregistered users cannot log in, and existing users cannot sign up twice.

### 2. File Routing (Next.js App Router)
- `/` - Main Landing Page (Hero, Features, Templates, Pricing, FAQs)
- `/login` & `/signup` - Standalone authentication forms handling OTP.
- `/dashboard` - User portal fetching live Supabase session to display user data and current invitations.
- `/admin/login` & `/admin` - Secure backend admin portal.
- `/checkout/templates` - First step of the booking flow. Bypasses auth if a session exists.
- `/checkout/auth` - Intermediary OTP gateway if a user selects a template while logged out.
- `/checkout/form` - Multi-step interactive mega-form capturing Wedding details (Bride/Groom, Events, Venues).

### 3. Multi-Tenant Template Engine & AWS Flow
The template engine is deployed entirely separate from the main marketing application.
- **Multi-Tenant Resolution**: The engine resolves which template and what user data to display based on the domain being requested.
- **Workflow Pipeline**:
  - The couple fills the `/checkout/form`, storing Bride/Groom, Event data, and chosen Domain in the Supabase DB.
  - Payment completes, triggering an event broker.
  - The standalone template build is deployed to an AWS S3 bucket behind AWS CloudFront.
  - An AWS SDK automation script programmatically adds the couple's chosen custom domain to the CloudFront distribution origin pointed to the S3 build.
  - When the guest visits the domain, the template engine fetches the config, template ID, and DB data dynamically at runtime to load the personalized wedding website.

## 🚀 Features Built (To-Date)
1. **Responsive Marketing Site**: Fully mapped homepage with animated Hero, Value Propositions, Pricing tiers, and a Template visualizer using pure SVG illustrations (Elegance, Royal, Minimal, Floral, Heritage, Ocean).
2. **Persistent Navbar**: A floating, blurring NavBar that checks the active Supabase session to toggle between "Log In / Sign Up" buttons and a "Profile" / "Logout" state. Mobile hamburger menu parity achieved.
3. **Full OTP Email Delivery**: Transitioned from sandbox (Ethereal) to real-world Gmail SMTP delivery.
4. **Interactive Dashboard**: Dynamically fetches the user's First Name from the JWT metadata or email prefix. Renders a structured empty state ("No Invitations Yet").
5. **Checkout Flow Engine**: An uninterrupted sequence capturing user flow: `Pricing -> Templates -> (Auth Intercept) -> Data Collection Form`.

---

## 🐛 Bugs Resolved & Lessons Learned
1. **Nav Bar Session Lag**: *Bug*: Nav bar showed "Log In" immediately after OTP success. *Fix*: Implemented the dummy-password Supabase session hand-off on the frontend instead of relying purely on a Node cookie.
2. **Supabase Email Confirmation Block**: *Bug*: "Session establishment failed" upon silent auto-login. *Fix*: "Enable Email Confirmations" was disabled in the Supabase dashboard to prevent Supabase from waiting for an email click, allowing immediate session provision via our custom OTP.
3. **Duplicate User Registration**: *Bug*: OTP allowed duplicate identical signups and unregistered logins. *Fix*: Wired a `type` param (`login`/`signup`) to the backend. The Node API now uses the deterministic dummy password to quietly probe Supabase Auth existence *before* ever sending an OTP.
4. **Checkout Redundancy**: *Bug*: Users were asked to log in again during checkout. *Fix*: Evaluated session state on the `/checkout/templates` page and manipulated `<Link href...>` to instantly skip the `/checkout/auth` page if authorized.
5. **Dashboard Mock Data**: *Fix*: Stripped out static dummy orders and hardcoded names, replacing them with live API hooks.

---

## 🧪 Automation Tester Notes
If building Playwright or Cypress tests, note the following element behaviors:
- **OTP Inputs**: 4 distinct `<input>` nodes. Focus auto-advances. Test scenarios must sequence keystrokes linearly.
- **Supabase Auth**: Mocking session states via standard local storage injection won't work perfectly due to SSR considerations; prefer testing via UI login flows using standard test accounts.
- **Form State**: The `/checkout/form` relies heavily on React component state for step transitions.

---

## 🎯 Next Steps & Future Roadmap
1. **Database Schema Design**: Initialize the `Invitations` and `Events` public tables in Supabase to save the payload from the `/checkout/form` mega-form.
2. **Payment Gateway Integration**: Wire up Razorpay or Stripe at the end of the Checkout flow.
3. **Template Rendering Engine**: Build the actual standalone invitation pages (e.g., `vaazh.co/[invite-id]`) that render the designs dynamically using the DB data.
4. **Admin Approval Flow**: Build out the `/admin` dashboard to view user orders, approve them, and publish links.
