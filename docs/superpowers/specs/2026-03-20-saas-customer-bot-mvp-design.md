# SaaS Customer Bot MVP Design

Date: 2026-03-20

## Goal

Build a SaaS MVP of the current customer bot for paid pilot operation.

The MVP must support:

- Internal admin operations only
- Real tenant isolation
- Tenant-specific embed configuration
- Server-side chat handling
- Chat history and lead persistence
- Unified token-based billing with monthly aggregation

The MVP explicitly does not include:

- Tenant self-service accounts
- Online payments
- Tiered pricing
- Different per-model pricing
- Balance deduction
- Attachment uploads
- Product parameter sheet import
- Human agent workbench

## Product Scope

This MVP is intended for external paid trial operation with a small number of customers managed by the internal team.

The system should let the team:

- Create and manage tenants
- Configure bot settings for each tenant
- Generate tenant-specific embed code
- View tenant chat records
- View tenant leads
- Track token usage and monthly charges

## Recommended Approach

Use a single admin backend with a real tenant model.

Why this approach:

- It keeps the data model correct from day one
- It supports billing and auditability
- It avoids the rework cost of fake multi-tenancy
- It keeps scope controlled by excluding tenant self-service

## Architecture

The MVP is split into four modules:

### 1. Admin Backend

Used only by the internal operations team.

Responsibilities:

- Admin login
- Tenant CRUD
- Tenant bot configuration
- Tenant knowledge and product management
- Chat record viewing
- Lead viewing
- Billing viewing

### 2. Tenant Configuration Service

Provides runtime configuration for the embedded widget.

Responsibilities:

- Validate `tenantId` or `embedKey`
- Return tenant-specific bot configuration
- Return tenant-specific knowledge entries
- Return tenant-specific product data
- Return tenant status and runtime restrictions

### 3. Chat Service

Handles chat requests from embedded widgets.

Responsibilities:

- Receive user messages with tenant identity
- Create or continue chat sessions
- Load tenant configuration and context
- Call the LLM on the server side
- Save messages and lead records
- Record token usage and billing details

### 4. Billing Service

Aggregates usage records into monthly billing views.

Responsibilities:

- Calculate usage cost from token counts
- Aggregate billing by tenant and month
- Expose detailed usage records
- Expose monthly summaries

## Runtime Flow

### Widget Boot Flow

1. Customer website embeds the widget script with `tenantId` or `embedKey`
2. The widget loads tenant runtime configuration from the backend
3. The widget renders using tenant-specific branding and bot settings

### Chat Flow

1. User sends a message in the widget
2. The widget posts the message to the backend
3. The backend resolves the tenant and session
4. The backend loads recent conversation history
5. The backend calls the LLM
6. The backend stores messages and usage records
7. The backend returns the assistant reply to the widget

### Billing Flow

1. Each LLM call stores input tokens, output tokens, total tokens, and computed cost
2. Billing views aggregate those records by tenant and month
3. Admin users inspect monthly charges and detailed usage records

## Billing Model

The first version uses a single global pricing rule.

Pricing inputs:

- `input_token_price`
- `output_token_price`

Per-request charge formula:

`amount = input_tokens * input_token_price + output_tokens * output_token_price`

Rules:

- All tenants use the same input and output token prices
- All models are billed using the same unified pricing rule
- Charges are recorded per LLM request
- Monthly bills are aggregated from request-level usage records
- Payment remains offline and manual in the MVP

Not included in v1:

- Free quota
- Balance system
- Per-model pricing
- Tiered discounts
- Payment gateway integration

## Data Model

The MVP requires the following core entities.

### `admin_users`

Fields:

- `id`
- `email`
- `password_hash`
- `status`
- `created_at`

### `tenants`

Fields:

- `id`
- `name`
- `status`
- `brand_name`
- `theme_color`
- `contact_phone`
- `contact_email`
- `contact_address`
- `system_prompt`
- `embed_key`
- `created_at`
- `updated_at`

### `tenant_knowledge_entries`

Fields:

- `id`
- `tenant_id`
- `title`
- `keywords`
- `one_liner`
- `what_is`
- `problems`
- `workflow`
- `scenarios`
- `outcomes`
- `source`

### `tenant_products`

Fields:

- `id`
- `tenant_id`
- `name`
- `category`
- `summary`
- `price_text`

### `chat_sessions`

Fields:

- `id`
- `tenant_id`
- `visitor_id`
- `started_at`
- `last_message_at`

### `chat_messages`

Fields:

- `id`
- `session_id`
- `tenant_id`
- `role`
- `content`
- `created_at`

### `llm_usage_records`

Fields:

- `id`
- `tenant_id`
- `session_id`
- `provider`
- `model`
- `input_tokens`
- `output_tokens`
- `total_tokens`
- `amount`
- `status`
- `created_at`

### `lead_records`

Fields:

- `id`
- `tenant_id`
- `session_id`
- `name`
- `company`
- `contact`
- `demand_type`
- `message`
- `created_at`

## Admin Pages

The MVP admin UI should include only the following pages:

### Login

Internal admin authentication only.

### Tenant List

Show:

- Tenant name
- Status
- Created time
- Current month token usage
- Current month billable amount

### Tenant Detail / Configuration

Manage:

- Basic brand settings
- Contact settings
- System prompt
- Knowledge entries
- Product data
- Embed code

### Chat Records

Filter by tenant and time range.

Show:

- Session list
- Message timeline

### Lead Records

Filter by tenant and time range.

Show submitted lead forms.

### Billing

Filter by tenant and month.

Show:

- Input tokens
- Output tokens
- Total tokens
- Billable amount
- Usage detail list

## Error Handling and Boundaries

### Invalid `tenantId` or `embedKey`

- Widget should not crash
- Backend should return a controlled invalid-tenant response
- Widget should show a safe fallback message

### Disabled Tenant

- Widget may still show static contact details if available
- Chat requests should be rejected with a controlled response
- No new billable LLM usage should be created

### LLM Failure

- Return a fallback assistant message
- Store the failed usage attempt with `status=failed`
- Do not bill failed calls unless usage data explicitly indicates billable consumption

### Missing Usage Data

- Store usage status as `unknown`
- Expose that status in admin billing views
- Do not silently convert unknown usage to zero

### Config Changes

- New config affects only new requests
- Historical messages and historical bills remain immutable

### Client vs Server Chat History

- Browser-local history is only for UX continuity
- Server-side session records are the source of truth for audit and billing

## MVP Acceptance Criteria

The MVP is ready for trial operation when all of the following are true:

1. An admin can create a tenant and generate embed code.
2. An embedded widget loads tenant-specific configuration correctly.
3. Chat requests go through the backend rather than direct browser-to-LLM calls.
4. Chat sessions and messages are stored per tenant.
5. Lead submissions are stored per tenant.
6. Every successful LLM call records token usage.
7. Monthly billing can be viewed per tenant.
8. Tenant configuration, chat data, lead data, and billing data are isolated.
9. Invalid tenants, disabled tenants, and LLM failures all have controlled behavior.

## Implementation Notes

To keep scope contained, implementation should prioritize:

- Correct tenant boundaries
- Reliable server-side chat orchestration
- Usage tracking and bill aggregation
- Minimal admin operability

Avoid adding extra product features until the above flow works end to end.
