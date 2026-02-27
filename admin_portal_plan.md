# Admin Portal & Template Architecture Plan

## 1. Domain Resolution
- **Current State**: Admin resolves at `/admin` path on the main application build.
- **Target State**: Admin will eventually resolve on `admin.wedbliss.co`, but run on the exact same build. We will use Next.js middleware to rewrite requests to the correct administrative logic. For now, it will resolve in `/admin`.

## 2. Admin Portal Categories
The `/admin` portal will map to the following distinct categories:

- **Dashboard (Analytics)**: View high-level metrics (signups, active templates, revenue).
- **Customer Management**: List of signed-up customers and their profile/order data.
- **Live Websites**: Table of actively deployed wedding websites with filtering options (by tier, date, status).
- **Template Creator (AI Integration)**: Provide a prompt to Google Gemini, preview the AI-generated template instantly, and push to Template Manager.
- **Template Manager**: List all live templates (Basic and Premium) along with dummy "Coming Soon" templates. Reorder, edit, or replace existing templates so they aren't static.
- **Payment Reports**: Management and history of processed transactions.

## 3. Generative Template Structure
Each generated template will follow this specific sequence and flow to ensure high usability and completeness:

1. **Cover Page**: Envelope design with opening reveal animation.
2. **Inside Page (Details)**: Parent names, bride & groom names.
3. **Event 1**: Details, location, map embedded, "Add to Calendar" button.
4. **Event 2**: Details, location, map embedded, "Add to Calendar" button.
5. **Countdown Timer**: A generic countdown pointing to the earliest occurring event (e.g., "Muhurtham starts in...").
6. **Photo Gallery**: Masonry or grid layout of couple photos.
7. **Hear it From the Couple**: Text/Quotes/Video section.
8. **Interest/RSVP Form**: To view people who are attending.

This structured flow ensures that all generated templates, regardless of visual style, contain the necessary utility features for a comprehensive wedding invitation.
