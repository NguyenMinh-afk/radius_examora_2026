# BA in E-Commerce & Retail

## Domain Overview
E-commerce BA work spans the full customer journey: discovery, purchase,
fulfilment, and returns. Requirements must account for peak traffic demands,
complex inventory logic, multi-channel selling, and personalisation. The BA
must understand both the customer experience and the operational back-end
(OMS, WMS, and logistics integrations).

---

## Key Terminology
| Term | Definition |
|---|---|
| OMS | Order Management System — central hub tracking order lifecycle from placement to delivery |
| WMS | Warehouse Management System — manages inventory, picking, packing, and dispatch |
| PIM | Product Information Management — master repository for product data and attributes |
| SKU | Stock Keeping Unit — unique identifier for a specific product variant |
| Catalogue | Collection of products and their attributes available for sale |
| Cart Abandonment | Customer added items to cart but did not complete purchase |
| Checkout Flow | Multi-step process from cart review to order confirmation |
| Payment Gateway | Service that authorises and processes online payments (Stripe, Adyen) |
| 3PL | Third-Party Logistics — outsourced warehousing and fulfilment provider |
| Fulfilment | Process of picking, packing, and shipping an order |
| Split Shipment | Order fulfilled from multiple locations or shipped in multiple parcels |
| Returns / RMA | Return Merchandise Authorisation — structured returns process |
| Marketplace | Platform where multiple sellers list products (e.g., Amazon, eBay model) |
| Drop Shipping | Products shipped directly from supplier to customer; retailer never holds stock |
| Loyalty Points | Customer reward currency earned on purchases, redeemable for discounts |
| Personalisation Engine | System serving product recommendations based on user behaviour |
| A/B Test | Controlled experiment comparing two variants to determine which performs better |
| Conversion Rate | Percentage of visitors who complete a purchase |
| AOV | Average Order Value — total revenue divided by number of orders |
| BOPIS | Buy Online, Pick Up In Store |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| E-commerce Director | Conversion rate, AOV, cart abandonment, revenue targets |
| Merchandising Manager | Product catalogue, pricing, promotions, category management |
| Supply Chain / Logistics | Inventory accuracy, fulfilment SLAs, carrier integration |
| Marketing Manager | Personalisation, promotions, email/SMS journeys, SEO |
| Customer Service | Returns complexity, order enquiries, refund timelines |
| IT / Engineering | Platform scalability, integration with ERP/WMS, payment reliability |
| Finance | Revenue recognition, refund processing time, fraud losses |

---

## Typical Requirements Patterns

**Product Catalogue**
- The PIM must support product hierarchies: Category → Sub-Category → Product → Variant (by size, colour, material).
- Product attributes must be configurable without code deployment; maximum 500 attributes per category.
- Product images: minimum 4 images per SKU; minimum resolution 1,000 × 1,000px; maximum file size 5MB.

**Cart & Checkout**
- Guest checkout must be available without account creation.
- Cart must be persisted across sessions for logged-in users for a minimum of 30 days.
- Checkout must complete in ≤4 steps: Cart Review → Address → Payment → Confirmation.
- System must display estimated delivery date before payment step, based on postcode and current stock location.

**Payment**
- Payment gateway must support: Visa, Mastercard, Amex, Apple Pay, Google Pay, PayPal.
- 3D Secure 2 must be applied for transactions ≥ £30 (PSD2 SCA compliance).
- Payment failure must not clear the cart; customer must be returned to the payment step with an actionable error message.

**Inventory & Fulfilment**
- Available-to-promise (ATP) stock count must be real-time, updated within 60 seconds of any inventory movement.
- Orders placed before 14:00 local time must be dispatched same day (cut-off configurable per fulfilment centre).
- Out-of-stock products must display a "Notify Me" option; notification sent when stock is replenished.

**Returns & Refunds**
- Customer must be able to initiate a return self-serve within 30 days of delivery for eligible items.
- Refund to original payment method must be processed within 5 business days of return receipt.
- Return reasons must be captured (mandatory) and reported to merchandising weekly.

---

## Regulatory & Compliance Considerations
- **Consumer Rights Act (UK) / EU Consumer Rights Directive:** Right to return within 14 days (distance selling); mandatory refund timelines.
- **PCI-DSS:** Payment card data must never be stored; tokenisation required.
- **GDPR / CCPA:** Customer data processing, consent for marketing, right to erasure.
- **Accessibility (WCAG 2.1 AA):** E-commerce sites must meet accessibility standards (screen reader compatibility, colour contrast, keyboard navigation).
- **VAT / Sales Tax:** Tax calculation must support multiple jurisdictions; product tax classifications must be configurable.
- **Age Verification:** Required for restricted products (alcohol, tobacco, adult content); verified before checkout completion.

---

## Common Integrations & Systems
- **E-commerce Platforms:** Shopify, Magento (Adobe Commerce), WooCommerce, Salesforce Commerce Cloud, BigCommerce
- **OMS:** Fluent Commerce, IBM Sterling, Brightpearl, Linnworks
- **WMS:** Manhattan Associates, Blue Yonder, Körber (HighJump), Mintsoft
- **Payment:** Stripe, Adyen, Braintree, Klarna (BNPL), Afterpay
- **Logistics / Carriers:** Royal Mail, DHL, UPS, Evri, DPD (integrated via EasyPost, Shippo, or direct API)
- **Marketing:** Klaviyo, Dotdigital, Salesforce Marketing Cloud (email/SMS)
- **Analytics:** Google Analytics 4, Heap, Hotjar (session recording)
- **Personalisation:** Dynamic Yield, Nosto, Bloomreach

---

## Anti-Patterns to Avoid
1. **No peak traffic requirements:** Define load requirements for Black Friday / Cyber Monday explicitly (e.g., "System must support 10× baseline traffic without degradation").
2. **Assuming single-currency, single-market:** Specify currency, language, tax rules, and logistics per market from the start.
3. **Ignoring cart abandonment recovery:** Define what triggers abandonment emails, timing, and which cart data is retained.
4. **Checkout steps without conversion metrics:** Each checkout step must have a defined success metric (step completion rate); failures must be logged.
5. **No split-payment requirements:** If BNPL (Klarna, Afterpay) is in scope, define the order state machine for split payments explicitly.
6. **Inventory requirements without ATP definition:** "Show stock level" is not enough. Define the ATP calculation (on-hand − reserved − safety stock) explicitly.

---

## Example Deliverable Snippet

**FR-055 — Checkout: Delivery Date Display**
> On the Delivery step of checkout, the system must display an estimated delivery date calculated as follows:
> 1. Identify the fulfilment centre holding ATP stock for each item in the cart.
> 2. Apply the fulfilment centre's cut-off time (configurable; default 14:00 local time).
> 3. Add the carrier's transit time for the customer's postcode (retrieved via carrier API, cached for 24 hours).
> 4. Display: "Estimated delivery: [Day], [Date]" in the format "Wednesday, 5 March".
> 5. If multiple fulfilment centres are required (split shipment), display the latest delivery date with a "(2 parcels)" note.
>
> **Acceptance Criteria:**
> - Given a customer in SW1A 1AA orders before 14:00, When they reach the Delivery step, Then the estimated delivery date displayed is next working day.
> - Given a split shipment, When the delivery date is calculated, Then the displayed date reflects the last parcel's expected arrival, with "(2 parcels)" appended.
