# Product

<!-- impeccable:product-schema 1 -->

_Inferred from the launch brief (2026-09-16); no interactive interview was possible in this session._

## Platform

web

## Users

- **Merchants**: approved GUGU sellers in Ghana (often small shops, frequently on a phone between customers) who list products, watch orders arrive and move them from placed to delivered.
- **GUGU staff (admins)**: review seller applications and product listings, curate categories and home banners, look up users and change roles, and watch all orders.

## Product Purpose

The GUGU seller dashboard: the web tool where merchants run their GUGU store and where staff keep the marketplace trustworthy. Success at launch is that a merchant can list a product, get it approved and fulfil an order without help, and that staff can clear the approval queues quickly.

## Positioning

Seller and staff console for GUGU, a Ghanaian multi-merchant marketplace (mobile app plus web storefront) backed by Firebase. Prices are GHS. Payment methods include cash / mobile money on delivery and ExpressPay.

## Operating Context

- Deployed as a static site on Firebase Hosting; all data via the Firebase web SDK, security enforced by Firestore/Storage rules and callable Functions (`gugu_2.0/router/platform_contract.md`).
- Roles come from Auth custom claims: `merchant` (with `merchantId`) and `admin`. Everyone else is a customer and must be told how to apply to sell.
- Mobile-width use is expected (390px), as is desktop at 1280px.

## Capabilities and Constraints

- Merchant: overview KPIs, products CRUD with image upload and approval status, orders with per-merchant lines and status transitions, store profile.
- Admin: merchant applications, product approvals, all orders, categories/subcategories/banners, users and roles.
- Coupons are out of scope for launch.

## Brand Commitments

- Name: GUGU. Brand colors `#0F96C1` (primary) and `#086E8E` (deep). No official logo file in this repo; the template logos are not GUGU's.

## Evidence on Hand

- No real merchant data, testimonials or metrics. Never fabricate numbers; empty states must be honest.

## Product Principles

1. Honest numbers: show what the data says, and say clearly when there is none or it failed to load.
2. Every mutation is confirmed (toast) and every destructive action asks first.
3. Speed over ceremony: the seller's next action is always one click away.
4. Security is the server's job; the UI never asks the user for identity it can read from their session.

## Accessibility & Inclusion

WCAG 2.1 AA: contrast, keyboard-operable navigation, visible focus, labelled controls.
