# Admin Command Center Redesign Design

Date: 2026-03-21

## Goal

Redesign the admin backend from a vertically stacked configuration UI into an operations-first command center.

The redesign must:

- Make `/admin` the default operations dashboard
- Separate global operations from single-tenant execution
- Keep `/admin/tenants/[tenantId]` as a dedicated tenant workspace
- Reduce long-page scrolling for core admin workflows

## Product Intent

This backend is used by an internal operations team running paid trial customer bot tenants.

Primary jobs:

- Monitor overall operations health
- Identify priority tenants quickly
- Trace content hits back to real conversations
- Enter a tenant workspace only when action is required

## Confirmed Direction

### Admin Information Architecture

- `/admin`
  Operations command center homepage
- `/admin/tenants`
  Tenant queue and list management
- `/admin/tenants/[tenantId]`
  Dedicated tenant workspace
- `/admin/chats`
  Global chat tracing and filtering
- `/admin/leads`
  Global lead center
- `/admin/billing`
  Global billing center

### Dashboard Direction

The dashboard follows the `A2` direction from brainstorming:

- results-first
- operations dispatch center
- tenant actions opened through a dedicated tenant detail page

### Tenant Detail Direction

The tenant detail page becomes a task-oriented workspace rather than a long stacked page.

It should be organized as:

- header summary
- tabbed work areas

Recommended tabs:

- Overview
- Content Ops
- Conversation Trace
- Commercial
- Install & Config

## Section 1: `/admin` Command Center

The homepage should emphasize operations outcomes before configuration.

### Top Layer

Show four fast KPI cards:

- today sessions
- today leads
- active content hits
- attention-needed tenants

### Main Layout

Use a two-column command center:

- left rail for tenant queue, priority segments, and fast filters
- main content for trends, alerts, and operator actions

### Purpose

The page should answer:

- what needs attention today
- which tenant should be handled first
- where conversion or answer quality is weak

## Section 2: Tenant Queue

The tenant list page should feel like a queue, not a passive table.

Useful groups:

- recently active
- low-hit tenants
- high-usage tenants
- disabled tenants

The page still supports tenant creation, but creation should not dominate the layout.

## Section 3: Tenant Workspace

The tenant workspace should no longer render every module in a single scroll.

### Workspace Header

The header should present:

- tenant identity
- package / billing state
- recent activity
- lead count
- top content source
- shortcuts into chats and billing

### Tab Groups

Each tab has a narrow purpose:

- Overview: tenant health and recent changes
- Content Ops: sources, categories, hit ranking
- Conversation Trace: tenant chats and source hits
- Commercial: package, billing, usage
- Install & Config: embed code, runtime config, prompt

## Scope Control

This redesign phase does not add new backend business rules beyond what is needed to support the dashboard and tabbed workspace.

Not in scope for this phase:

- FAQ authoring workflow
- role-based permissions
- custom charts library adoption
- tenant self-service
- visual analytics drilldowns beyond current metrics

## Implementation Notes

- Reuse existing admin APIs where practical
- Add a small admin overview aggregation layer if needed
- Prefer tabbed sections over expanding accordions
- Preserve current operational functionality while changing layout and navigation

## Validation

Success means:

- `/admin` feels like an operations dashboard, not a redirect
- tenant details no longer require long vertical scrolling for routine tasks
- an operator can move from global signal to tenant action in two clicks or fewer
