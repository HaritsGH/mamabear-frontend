# MamaBear Frontend

MamaBear is an e-commerce platform for pregnancy, postpartum recovery, nursing, and childcare needs. This repository contains the customer storefront, account and checkout flows, administration interface, and product-assistance chat experience built for the RevoU x MamaBear Virtual Internship project.

## Documentation

Run the application and open [http://localhost:3001/docs](http://localhost:3001/docs) for the searchable documentation site.

The documentation is also readable directly in the repository:

- [Documentation home](content/docs/index.mdx)
- [User Guide](content/docs/user-guide)
- [Developer Guide](content/docs/developer-guide)

## Features

### Customer experience

- Registration, email verification, login, password recovery, and token refresh
- Homepage merchandising, category browsing, product listing, filtering, detail, and search
- Chat-assisted product discovery with product recommendation cards
- Cart and mini-cart management, promotional codes, and free-shipping progress
- Address and shipping selection, checkout, payment, and order confirmation
- Customer profile, saved addresses, order history, order details, and PDF invoices

### Administration

- Store overview with sales metrics, recent orders, top products, and low-stock alerts
- Product and category creation, editing, listing, filtering, deletion, and supported bulk actions
- Promotion code management
- Order listing, filtering, detail, timeline, and supported status updates
- Customer listing, detail, statistics, order history, and supported status controls
- Business reports and charts
- Store, payment, shipping, and tax settings
- Administrator listing and account creation
- Role protection for `ADMIN` and `SUPERADMIN`

## Technology

| Technology | Purpose |
| --- | --- |
| Next.js 14 App Router | Application framework and routing |
| React 18 and TypeScript | UI and type safety |
| Tailwind CSS and shadcn/ui | Styling and reusable UI primitives |
| Zustand | Client-side state management |
| NextAuth | Credentials sessions, token refresh, and authorization |
| React Hook Form | Form state and validation flows |
| Recharts | Administration charts and reporting |
| Fumadocs | Searchable user and developer documentation |
| Jest and Testing Library | Automated tests |

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- The sibling `mamabear-backend` repository when working on API-backed flows

### Installation

```bash
git clone https://github.com/HaritsGH/mamabear-frontend.git
cd mamabear-frontend
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure the backend URL and a long random NextAuth secret:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXTAUTH_SECRET="replace-with-a-long-random-local-secret"
```

Do not commit `.env.local` or real credentials.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Lint and start the development server on port 3001 |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Next.js ESLint checks |
| `npm test` | Run the Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run generate:api` | Regenerate API types from the local sibling backend OpenAPI schema |

## Architecture

The application uses Next.js route groups for authentication and storefront experiences, a role-protected admin area, and feature-based modules for product behavior. Pages compose feature components and hooks; feature services communicate with the backend; shared authenticated requests use `src/lib/api.ts`.

```text
content/docs/                    # User and developer documentation
src/
├── app/
│   ├── (auth)/                  # Login, registration, verification, recovery
│   ├── (shop)/                  # Storefront, chat, cart, checkout, account
│   ├── admin/                   # Administration routes
│   ├── api/                     # NextAuth and documentation search endpoints
│   └── docs/                    # Fumadocs presentation routes
├── components/                  # Shared layout and UI components
├── features/
│   ├── account/
│   ├── address/
│   ├── admin/                   # Catalog, promos, orders, customers, reports, settings
│   ├── auth/
│   ├── cart/
│   ├── categories/
│   ├── chat/
│   ├── checkout/
│   ├── home/
│   ├── orders/
│   └── products/
├── lib/                         # Authentication, API, config, docs, utilities
├── providers/                   # Application providers
├── store/                       # Shared Zustand state
├── types/                       # Shared and generated API types
└── middleware.ts                # Session and admin-role route protection
```

See the [Developer Guide](content/docs/developer-guide) for architecture, authentication, API, and testing details.

## Testing and verification

Run all tests:

```bash
npm test -- --runInBand
```

Run a focused test:

```bash
npm test -- --runInBand src/features/cart/services/cartService.test.ts
```

Before handing off a change, run:

```bash
npm test -- --runInBand
npm run lint
npm run build
```

Update the relevant documentation whenever a change affects user-visible behavior, setup, architecture, or contributor workflows.

## Credits

MamaBear was developed as part of the RevoU x MamaBear Virtual Internship program.
