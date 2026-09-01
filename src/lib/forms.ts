// src/lib/forms.ts
// Qualification-form schemas (desired-state §4.4 / Website 3 §5).
//
// Every form's field set is declared here and rendered from it, so the UI can
// never drift from the schema. The Guava BI waitlist schema (C4) deliberately
// declares NO pricing / payment-method / purchase-commit / checkout field
// (Website 3 §5.3, §7; desired-state D7, invariant 12).

// ---------------------------------------------------------------------------
// C4 — Guava BI closed-beta waitlist (§5.3). Not purchasable, not priced.
// ---------------------------------------------------------------------------

export type RoleFunction =
  | 'inventory'
  | 'procurement'
  | 'category'
  | 'analyst'
  | 'location'
  | 'operations';

export type PainStage = 'visibility' | 'detection' | 'recommendation';

/**
 * The waitlist payload. The type is the schema-level guarantee (D7): the only
 * keys here are the qualification fields in §5.3 — there is intentionally no
 * `price`, `payment_method`, `purchase_commit`, `card`, or `checkout` member,
 * so no code path can submit one.
 */
export interface GuavaBiWaitlistPayload {
  full_name: string;
  work_email: string;
  company: string;
  role_function: RoleFunction;
  inventory_scale: string;
  pain_stage: PainStage;
  /** Truth check: "I understand Guava BI is in closed beta" (truth rule). */
  closed_beta_ack: boolean;
  /** Optional C7: subscribe to product updates (not beta access). */
  subscribe_updates: boolean;
}

/**
 * Structural enforcement of D7 / invariant 12 ("no purchase/payment fields in
 * the Guava BI funnel, even implied"). If a payment-style key is ever added to
 * `GuavaBiWaitlistPayload`, this produces a compile-time error naming it, so no
 * code path can render or submit a price/payment/checkout field on P4-S7.
 */
type GuavaBiForbiddenKey =
  | 'price'
  | 'amount'
  | 'billing'
  | 'payment'
  | 'payment_method'
  | 'card'
  | 'card_number'
  | 'checkout'
  | 'purchase'
  | 'purchase_commit'
  | 'plan'
  | 'seat'
  | 'coupon';

type _AssertNoPaymentInWaitlist<Keys extends keyof GuavaBiWaitlistPayload> =
  Extract<Keys, GuavaBiForbiddenKey> extends never
    ? true
    : `REJECTED (D7): Guava BI waitlist must not collect '${Extract<Keys, GuavaBiForbiddenKey>}'`;

const _assertNoPayment: _AssertNoPaymentInWaitlist<keyof GuavaBiWaitlistPayload> = true;

export type WaitlistFieldType = 'input' | 'select' | 'checkbox';

export interface WaitlistField {
  name: keyof GuavaBiWaitlistPayload;
  label: string;
  type: WaitlistFieldType;
  inputType?: 'text' | 'email';
  placeholder?: string;
  required?: boolean;
  /** @internal support copy rendered under the field. */
  hint?: string;
  options?: { value: string; label: string }[];
}

export const WAITLIST_FIELDS: WaitlistField[] = [
  { name: 'full_name', label: 'Full name', type: 'input', inputType: 'text', placeholder: 'Your full name', required: true },
  { name: 'work_email', label: 'Work email', type: 'input', inputType: 'email', placeholder: 'you@company.com', required: true },
  { name: 'company', label: 'Company', type: 'input', inputType: 'text', placeholder: 'Your company name', required: true },
  {
    name: 'role_function',
    label: 'Role or function',
    type: 'select',
    placeholder: 'Select your role',
    required: true,
    options: [
      { value: 'inventory', label: 'Inventory Management' },
      { value: 'procurement', label: 'Procurement' },
      { value: 'category', label: 'Category Management' },
      { value: 'analyst', label: 'Analyst' },
      { value: 'location', label: 'Location / Site Operations' },
      { value: 'operations', label: 'Operations Leadership' },
    ],
  },
  {
    name: 'inventory_scale',
    label: 'Inventory scale',
    type: 'select',
    placeholder: 'Approximate SKU count',
    required: true,
    options: [
      { value: 'under-1k', label: 'Under 1,000 SKUs' },
      { value: '1k-10k', label: '1,000–10,000 SKUs' },
      { value: '10k-50k', label: '10,000–50,000 SKUs' },
      { value: '50k-100k', label: '50,000–100,000 SKUs' },
      { value: 'over-100k', label: 'Over 100,000 SKUs' },
    ],
  },
  {
    name: 'pain_stage',
    label: 'Where does your inventory operation need the most help?',
    type: 'select',
    placeholder: 'Select your biggest challenge',
    required: true,
    options: [
      { value: 'visibility', label: 'Visibility: I can\u2019t see what\u2019s happening clearly' },
      { value: 'detection', label: 'Detection: I don\u2019t know what deserves attention' },
      { value: 'recommendation', label: 'Recommendation: I know the problems but not what to do' },
    ],
  },
  {
    name: 'closed_beta_ack',
    label: 'I understand Guava BI is in closed beta, and joining the waitlist is not a purchase and doesn\u2019t guarantee a seat.',
    type: 'checkbox',
    required: true,
  },
  { name: 'subscribe_updates', label: 'Also subscribe me to occasional product updates (not beta access)', type: 'checkbox' },
];

// ---------------------------------------------------------------------------
// C8 — Contact (§5.4). Route selector + qualification fields.
// ---------------------------------------------------------------------------

export type ContactRoute = 'diagnostic' | 'validation' | 'general';

export interface ContactPayload {
  route: ContactRoute;
  full_name: string;
  work_email: string;
  company: string;
  role: string;
  reason: string;
}

export const CONTACT_ROUTES: { value: ContactRoute; label: string }[] = [
  { value: 'diagnostic', label: 'Operational Diagnostic' },
  { value: 'validation', label: 'Data & AI validation' },
  { value: 'general', label: 'General inquiry' },
];