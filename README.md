# FoodOps ERP — Blue Enterprise Edition

**Manage Every Ingredient. Control Every Cost. Perfect Every Operation.**

FoodOps ERP is a frontend-only food operations workspace for restaurants, cafeterias, cloud kitchens, catering teams and food production businesses. This edition uses a navy, royal-blue and white enterprise visual system with React, Vite, Tailwind CSS, Recharts, Lucide React and browser `localStorage`. It has no Python, Flask, SQL database, Node/Express backend or paid API dependency.

## Run locally (one terminal)

**Requirements:** Node.js 20 LTS or newer (Node 18.18+ is the minimum supported by this Vite version) and npm.

1. Extract this ZIP into a folder, for example `Downloads\foodops-erp`.
2. In VS Code, open the extracted folder that contains `package.json` directly. Do not open a parent folder that contains another nested `foodops-erp` folder.
3. Open one VS Code terminal in that folder and run:

```bash
npm install
npm run dev
```

4. Open the local URL printed by Vite, normally `http://localhost:5173`.

Both commands run in the same terminal. Keep that terminal open while using the site. No backend terminal or database service is needed.

## Demo sign-in accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@foodops.local` | `FoodOps@123` |
| Manager | `manager@foodops.local` | `Manager@123` |
| Kitchen Staff | `kitchen@foodops.local` | `Kitchen@123` |
| Inventory Staff | `inventory@foodops.local` | `Stock@123` |

These are demonstration-only accounts. The sign-in and role checks run in the browser and are not a security boundary. Do not use these accounts or this local-only authentication design for a public production system.

## Included modules

- **Dashboard:** stored-data KPIs, purchase and waste trends, inventory category value, food-cost chart, recent activity and alerts.
- **Inventory:** ingredient CRUD, stock additions/deductions, minimum levels, expiry/batch information and movement history.
- **Recipe & Costing:** recipe CRUD, ingredient-level cost breakdown, per-serving cost, food-cost percentage, gross profit, margin and target-price recommendation. Recipe costs use current inventory purchase prices.
- **AI Menu Studio:** clearly labelled local AI-assisted suggestions using ingredient matching, rule-based dish templates, dietary filters and costing. It is not a generative AI model. Generated drafts can be edited, saved and exported.
- **Purchases:** purchase-order creation, status tracking and receipt of stock into inventory.
- **Suppliers:** supplier records, edits and linked purchasing information.
- **SOP Management:** structured controlled documents covering purpose, scope, batch/yield, ingredients, equipment, preparation, quality standards, troubleshooting, storage, hygiene, allergens, final checks and staff training. Includes draft/review/approval states, version history, document print/PDF, and separate staff execution checklists. The sample Classic Milk Bubble Tea SOP is based on the provided reference document; verify outlet-specific details before operational use.
- **Waste Management:** wastage records with inventory deduction when confirmed and sufficient stock is available.
- **Reports & Analytics:** stored-data charts, filters and CSV downloads.
- **Settings:** business preferences, currency, JSON backup and restore, and demonstration-data reset.

## Data storage and backups

- The application saves data in the current browser's `localStorage`. Refreshing the page does not remove saved records.
- Data belongs to that browser profile and device. It does not automatically sync between computers or browsers. Clearing browser site data can remove it.
- Use **Settings → Data Management → Export backup** to download a complete JSON backup. Use **Restore backup** to import it later.
- CSV exports are available in the relevant modules and reports.
- **Reset demonstration data** restores the original sample workspace and clears the current demo session. Confirm before using it.

## Project structure

```text
foodops-erp/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   ├── services.js       # localStorage data layer and business rules
│   └── index.css
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Production build

To create an optimized static build, run in the same project folder:

```bash
npm run build
```

The generated static site is placed in `dist/`. Because this is a browser-only version, hosting the static build does not create shared server-side data, central user accounts or cross-device synchronization. Each visitor's data remains in their own browser storage.

## Important limitations

This frontend-only edition is appropriate for a local internship demonstration and workflow prototype. `localStorage` is not a relational database, client-side role checks are not secure access control, and the local menu engine is rules-based rather than generative AI. A real multi-user commercial deployment would require a secured backend, database, server-side authentication and audited permissions; those components are intentionally excluded from this version per the project brief.


## Daily Billing Updates
A daily billing register is available in the Operations navigation. It records bills issued through an existing counter or external billing process, tracks payment mode and collection status, supports edits/deletion, date filtering and CSV export. Records are stored in browser localStorage and are not shared across devices. This is intentionally a billing log, not a POS checkout or inventory-deduction workflow.
