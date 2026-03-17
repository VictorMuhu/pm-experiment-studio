import { ProjectFlow } from '@/types/flow';

export const DEMO_FLOWS: ProjectFlow[] = [
  {
    id: 'onboarding-flow',
    name: 'User Onboarding Flow',
    description: 'New user registration and activation sequence',
    createdAt: '2026-03-15',
    problemDefinition: {
      hypothesis: 'A streamlined, OTP-based onboarding flow will increase activation rates by reducing friction in the signup process.',
      targetUser: 'New users arriving from marketing campaigns, typically non-technical, expecting a fast path to value.',
      successMetrics: 'Activation rate >60%, median time-to-value <90s, drop-off rate <25% at OTP step.',
    },
    nodes: [
      { id: 'landing', label: 'Landing', description: 'User arrives at signup page', status: 'validated', type: 'step', x: 80, y: 120 },
      { id: 'email-input', label: 'Email Input', description: 'User enters email address', status: 'validated', type: 'step', x: 320, y: 120 },
      { id: 'otp-verify', label: 'OTP Verify', description: 'User enters verification code', status: 'defined', type: 'step', x: 560, y: 120 },
      { id: 'profile-setup', label: 'Profile Setup', description: 'User completes profile details', status: 'defined', type: 'step', x: 800, y: 120 },
      { id: 'success', label: 'Success', description: 'Onboarding complete, user lands in app', status: 'defined', type: 'step', x: 1040, y: 120 },
    ],
    edges: [
      { from: 'landing', to: 'email-input', label: 'CTA Click' },
      { from: 'email-input', to: 'otp-verify', label: 'Submit' },
      { from: 'otp-verify', to: 'profile-setup', label: 'Verified' },
      { from: 'profile-setup', to: 'success', label: 'Complete' },
    ],
    edgeCases: [
      { id: 'ec-1', nodeId: 'email-input', label: 'Invalid Email Format', description: 'User enters malformed email. Show inline validation with format hint.', severity: 'medium', resolved: false },
      { id: 'ec-2', nodeId: 'email-input', label: 'Existing Account', description: 'Email already registered. Offer login redirect or password reset.', severity: 'high', resolved: false },
      { id: 'ec-3', nodeId: 'otp-verify', label: 'Expired Code', description: 'OTP expires after 5 min. Auto-prompt resend with countdown.', severity: 'high', resolved: false },
      { id: 'ec-4', nodeId: 'otp-verify', label: 'Max Retries Reached', description: 'After 3 failed attempts, lock for 15 min with support link.', severity: 'critical', resolved: false },
      { id: 'ec-5', nodeId: 'profile-setup', label: 'Partial Completion', description: 'User abandons mid-profile. Save draft, re-prompt on next login.', severity: 'medium', resolved: false },
      { id: 'ec-6', nodeId: 'landing', label: 'Bot Detection', description: 'Automated signup attempts. Rate limit + invisible CAPTCHA.', severity: 'low', resolved: false },
    ],
    tradeoffs: [
      { id: 'tr-1', left: 'Security (OTP)', right: 'Friction (Passwordless)', value: 65, impact: 'Higher security reduces bot signups by ~40% but increases drop-off by ~12%' },
      { id: 'tr-2', left: 'Data Collection', right: 'Speed to Value', value: 35, impact: 'Fewer profile fields means faster onboarding but less personalization data' },
      { id: 'tr-3', left: 'Guided Setup', right: 'Self-Discovery', value: 50, impact: 'Wizard pattern ensures completeness; freeform allows power users to skip' },
    ],
  },
  {
    id: 'checkout-flow',
    name: 'Checkout Flow',
    description: 'E-commerce purchase completion sequence',
    createdAt: '2026-03-12',
    problemDefinition: {
      hypothesis: 'A multi-step checkout with clear progress indicators will reduce cart abandonment compared to a single-page form.',
      targetUser: 'Returning customers with items in cart, across desktop and mobile, varying payment literacy.',
      successMetrics: 'Checkout completion >70%, payment failure recovery >50%, average checkout time <3 min.',
    },
    nodes: [
      { id: 'cart', label: 'Cart Review', description: 'User reviews cart items', status: 'validated', type: 'step', x: 80, y: 120 },
      { id: 'shipping', label: 'Shipping', description: 'User enters shipping details', status: 'defined', type: 'step', x: 320, y: 120 },
      { id: 'payment', label: 'Payment', description: 'User enters payment method', status: 'defined', type: 'step', x: 560, y: 120 },
      { id: 'confirm', label: 'Confirmation', description: 'Order summary and confirm', status: 'defined', type: 'step', x: 800, y: 120 },
      { id: 'receipt', label: 'Receipt', description: 'Order placed, show receipt', status: 'defined', type: 'step', x: 1040, y: 120 },
    ],
    edges: [
      { from: 'cart', to: 'shipping' },
      { from: 'shipping', to: 'payment' },
      { from: 'payment', to: 'confirm' },
      { from: 'confirm', to: 'receipt' },
    ],
    edgeCases: [
      { id: 'ec-c1', nodeId: 'cart', label: 'Empty Cart', description: 'User reaches checkout with no items. Redirect to browse.', severity: 'medium', resolved: false },
      { id: 'ec-c2', nodeId: 'payment', label: 'Payment Declined', description: 'Card declined. Show retry with alternative methods.', severity: 'critical', resolved: false },
      { id: 'ec-c3', nodeId: 'shipping', label: 'Invalid Address', description: 'Address validation fails. Suggest corrections.', severity: 'medium', resolved: false },
      { id: 'ec-c4', nodeId: 'cart', label: 'Out of Stock', description: 'Item became unavailable during session.', severity: 'high', resolved: false },
    ],
    tradeoffs: [
      { id: 'tr-c1', left: 'Guest Checkout', right: 'Account Required', value: 30, impact: 'Guest checkout reduces friction but limits remarketing and order tracking' },
      { id: 'tr-c2', left: 'Single Page', right: 'Multi-Step', value: 60, impact: 'Multi-step reduces cognitive load but adds navigation overhead' },
    ],
  },
  {
    id: 'settings-flow',
    name: 'Settings Management',
    description: 'User account and preference management',
    createdAt: '2026-03-10',
    problemDefinition: {
      hypothesis: 'A centralized settings hub with contextual grouping will reduce support tickets related to account configuration.',
      targetUser: 'Existing users managing their account, ranging from casual to power users with security concerns.',
      successMetrics: 'Settings-related support tickets down 30%, 2FA adoption >20%, profile completion >80%.',
    },
    nodes: [
      { id: 'settings-hub', label: 'Settings Hub', description: 'Main settings navigation', status: 'validated', type: 'step', x: 80, y: 120 },
      { id: 'profile-edit', label: 'Edit Profile', description: 'Update personal information', status: 'defined', type: 'step', x: 320, y: 120 },
      { id: 'notifications', label: 'Notifications', description: 'Configure notification preferences', status: 'defined', type: 'step', x: 560, y: 120 },
      { id: 'security', label: 'Security', description: 'Password and 2FA settings', status: 'defined', type: 'step', x: 800, y: 120 },
    ],
    edges: [
      { from: 'settings-hub', to: 'profile-edit' },
      { from: 'settings-hub', to: 'notifications' },
      { from: 'settings-hub', to: 'security' },
    ],
    edgeCases: [
      { id: 'ec-s1', nodeId: 'profile-edit', label: 'Unsaved Changes', description: 'User navigates away with unsaved edits. Prompt confirmation.', severity: 'medium', resolved: false },
      { id: 'ec-s2', nodeId: 'security', label: '2FA Lockout', description: 'User loses authenticator. Provide recovery codes flow.', severity: 'critical', resolved: false },
      { id: 'ec-s3', nodeId: 'notifications', label: 'Permission Denied', description: 'Browser blocks push notifications. Show manual enable guide.', severity: 'low', resolved: false },
    ],
    tradeoffs: [
      { id: 'tr-s1', left: 'Granular Controls', right: 'Simplicity', value: 45, impact: 'More toggles give power users control but overwhelm casual users' },
    ],
  },
];
