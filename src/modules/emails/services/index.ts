/**
 * Email Services
 *
 * This file exports all email services for easy importing
 * Each service handles a specific type of email (verification, welcome, etc.)
 */

export type { SendInvitationEmailOptions } from "./invitation";
export { sendInvitationEmail } from "./invitation";
export type { SendPasswordResetEmailOptions } from "./password-reset";
export { sendPasswordResetEmail } from "./password-reset";
export type { SendSubscriptionNotificationOptions } from "./subscription";
export { sendSubscriptionNotificationEmail } from "./subscription";

// Export all service types
export type { SendVerificationEmailOptions } from "./verification";
// Export all email services
export { sendVerificationEmail } from "./verification";
export type { SendWelcomeEmailOptions } from "./welcome";
export { sendWelcomeEmail } from "./welcome";
