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

## AI shopping assistant

The AI assistant was built in Sprints 2–3. It answers product questions in the `/chat` page and the home page chat widget. This section covers the whole feature across both repositories. For component, state, and reply-parsing details on the frontend, see the [AI Chat developer guide](content/docs/developer-guide/chat.mdx).

### Problem

Customers are mostly pregnant or breastfeeding mothers. They often describe a need ("I want something to boost breast milk") rather than a product name. Keyword search misses those questions, and a general-purpose chatbot can invent products, mix up product facts, or give medical advice the store is not qualified to give. The assistant aims to:

- Turn a described need into product recommendations from the real MamaBear catalog
- Ask a few clarifying questions when the need is broad, then recommend
- Send health, order, shipping, and payment questions to a human admin on WhatsApp instead of answering them
- Refuse off-topic requests and prompt-injection attempts

### Architecture

All model calls happen in `mamabear-backend`. The frontend only calls the backend chat API with the signed-in user's token.

```text
Frontend (src/features/chat)
  │  POST /chat { sessionId?, message }
  ▼
Backend ChatController            rate limit, session ownership, saves messages, loads last 10 messages
  ▼
ChatService.generateReply
  1. Guardrail       AiChatService.classifyMessage   → MEDIS | TOKO | DILUAR_TOPIK | AMAN
                     MEDIS / TOKO  → fixed reply + "KONTAK ADMIN: <number>"
                     DILUAR_TOPIK  → fixed refusal
  2. Retrieval       SearchService.findProductsBySemanticSearch
                     embeds the message plus the last 3 user messages,
                     returns the 5 nearest products (pgvector cosine distance)
  3. Generation      AiChatService.complete with a system prompt holding the rules
                     and the 5 product blocks (slug, name, price, safety notes, description)
  4. Post-processing formatReply: keeps only valid slugs (max 3) in
                     "REKOMENDASI PRODUK: ...", replaces "Anda" with "Mama"
  ▼
Frontend parseAssistantMessage    strips marker lines, renders product cards and the WhatsApp contact card
```

| Piece | Location | Notes |
| --- | --- | --- |
| Model provider | OpenRouter via `@openrouter/sdk` | Needs `OPENROUTER_API_KEY` in the backend `.env` |
| Guardrail and generation models | `ai_guardrail_model` and `ai_generation_model` settings | Default `nvidia/nemotron-3-super-120b-a12b:free`. Admins change them in **Settings → Model AI**. |
| Embedding model | `EmbeddingsService` in the backend | `nvidia/nemotron-3-embed-1b:free`, 2048 dimensions |
| Vector storage | `Product.embedding vector(2048)` | PostgreSQL `pgvector` extension |
| Related products | `ProductsRepository.findRelated` in the backend | `GET /products/:slug/related` returns the 5 most similar products by the same embeddings, so missing embeddings also affect the product detail page |
| Chat history | `ChatSession` and `ChatMessage` tables | Per user. Each message is cut to 1,000 characters before it goes into the prompt. |

### Guardrails

The assistant uses several layers of protection. Code enforces the layers that matter most, so they do not depend on the model following instructions.

- **Question classifier.** A separate model call labels every message before any answer is generated. Health questions (dosage, allergies, trimester safety, drug interactions) get `MEDIS`, and store-service questions get `TOKO`. Both receive a fixed reply with the admin WhatsApp number. Off-topic and prompt-injection requests (`DILUAR_TOPIK`) get a fixed refusal. `MEDIS` is checked first so a safety question is never downgraded. Unreadable classifier output falls back to `AMAN`, where the topic rules in the generation prompt still apply.
- **Grounded answers.** The generation prompt only allows facts from the retrieved product blocks. It forbids mixing facts between products, changing dosage numbers, and calling a product safe for pregnancy or breastfeeding unless its own block says so.
- **Safety notes.** The backend extracts warning lines (for example `tidak untuk`, `alergi`, `kontraindikasi`, `efek samping`) from each product description. It passes them as a separate field and keeps them even when the description is truncated, so the model always sees and repeats them.
- **Validated recommendations.** `formatReply` drops any slug the model returns that was not in the retrieved products and caps the list at 3. The frontend only accepts `KONTAK ADMIN` numbers that match `62` followed by 8–13 digits, so the model cannot show an invented phone number as a card.
- **Bounded clarifying questions.** After 3 clarifying questions without a recommendation, the code tells the model to recommend instead of asking again.
- **Rate limits.** `POST /chat` allows 10 messages per minute and 100 per day per user. Excess requests get a 429 response.
- **Failure handling.** Model calls time out after 15 s for the classifier and 60 s for generation. Transient 5xx errors are retried up to 3 times. If the configured model is retired or misspelled (400/404), the call falls back to the default model. Any remaining error is saved as a fixed "technical problem" reply, and that reply is filtered out of later prompt history.

### Setup

- Set `OPENROUTER_API_KEY` in the backend `.env`. `AiChatService` throws on startup without it, so the backend does not boot.
- The database needs the `pgvector` extension. Migration `20260516151339_embedding_for_related_products` creates it and adds the `embedding` column, so the PostgreSQL server must have `pgvector` installed.
- The backend seed generates an embedding for every seeded product, so seeding also needs `OPENROUTER_API_KEY` and network access to OpenRouter.

### Maintenance

**Product embeddings.** Product search in the chat depends on `Product.embedding`. A product with no embedding never appears in recommendations.

- The backend generates embeddings automatically when an admin creates or updates a product. Each embedding is a weighted average of separate embeddings for the name (1.0), tags (2.0), ingredients (0.5), description (0.15), and usage instructions (0.1). Tags carry the highest weight, so good tags improve chat recommendations the most.
- If the embedding call fails, the product is still saved without an embedding, and the failure is logged. Run the backfill afterwards.
- The backfill embeds every active product that has no embedding. Call it as an `ADMIN` or `SUPERADMIN`:

  ```bash
  curl -X POST http://localhost:3000/api/admin/products/backfill-embeddings \
    -H "Authorization: Bearer <admin-access-token>"
  ```

  The response reports `total`, `processed`, and `failed`.
- Changing the embedding model requires regenerating **all** product embeddings, because vectors from different models cannot be compared. If the new model's vector size is not 2048, add a migration for the `vector(2048)` column. Then set `embedding` to `NULL` for every product and run the backfill.

**Models.** Change the guardrail or generation model in **Settings → Model AI** with any OpenRouter model ID. No deploy is needed. Free-tier models can be slow or retired. The fallback to the default model keeps the chat working, but check backend logs for `Model "..." is unavailable` warnings.

**Prompts and reply format.** The classifier prompt is in `src/chat/ai-chat.service.ts`, and the generation prompt is in `src/chat/chat.service.ts` in the backend. The `REKOMENDASI PRODUK:` and `KONTAK ADMIN:` markers are a contract between the backend and `src/features/chat/utils/recommendations.ts`. If you change a marker, update both repositories and the test fixtures in `recommendations.test.ts`.

**Contact number.** The WhatsApp number comes from the `contact_phone` store setting.

**Tests.** Backend: `ai-chat.service.spec.ts`, `chat.service.spec.ts`, `chat.controller.spec.ts`, `embeddings.service.spec.ts`, and `search.service.spec.ts`. Frontend: `npm test -- chat`.

### Known limitations

- **Slow replies.** Free-tier models can take up to 60 seconds to answer, and replies are not streamed. The user sees nothing until the full answer arrives.
- **Small retrieval window.** Each answer only considers the 5 nearest products (`PRODUCT_CANDIDATES` in `chat.service.ts`). This matches the current catalog size. Raise it as the catalog grows, keeping in mind that more products make the prompt longer and slower.
- **Short memory.** The model only sees the last 10 messages of a session, and each message is cut to 1,000 characters.
- **No answer without the classifier.** If the classifier call fails after retries, the whole reply fails and the user gets the "technical problem" message. The assistant never answers a question it could not classify.
- **OpenRouter usage per message.** Every product question makes at least 3 OpenRouter calls: classifier, search embedding, and answer. Retries and model fallbacks add more. Medical, store, and off-topic questions stop after the classifier.
- **Keyword-based safety notes.** Warning lines are found by keyword. A warning written without any of the listed keywords is not flagged as a safety note. It gets no special emphasis, and if it sits past the first 1,500 characters of the description it is cut off before the model sees it. Write product warnings with words such as `tidak untuk`, `peringatan`, or `hindari`.

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
