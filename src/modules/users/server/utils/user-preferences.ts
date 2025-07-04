import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import type { NewUserPreferences, UserPreferences } from "@/lib/db/schema";
import * as schema from "@/lib/db/schema";
import {
	defaultLocale,
	type SupportedLocale,
	supportedLocales,
} from "@/modules/i18n/routing";

/**
 * User Preferences Utilities
 *
 * This module provides utility functions for managing user preferences:
 * - Getting user preferences
 * - Updating user preferences
 * - Creating default preferences
 * - Language detection from headers
 */

// Default theme options
export const AVAILABLE_THEMES = ["light", "dark", "system"] as const;
export type SupportedTheme = (typeof AVAILABLE_THEMES)[number];

/**
 * Get user preferences by user ID and organization
 * Creates default preferences if none exist
 */
export async function getUserPreferences(
	userId: string,
	organizationId?: string | null,
): Promise<UserPreferences | null> {
	try {
		if (!organizationId) {
			// Return null if no organization context
			return null;
		}

		// Try to get existing preferences
		const existingPreferences = await db
			.select()
			.from(schema.userPreferences)
			.where(
				and(
					eq(schema.userPreferences.userId, userId),
					eq(schema.userPreferences.organizationId, organizationId),
				),
			)
			.limit(1);

		if (existingPreferences.length > 0) {
			return existingPreferences[0];
		}

		// Create default preferences if none exist
		const defaultPreferences: NewUserPreferences = {
			id: `pref_${userId}_${organizationId}`,
			userId,
			organizationId,
			language: "en",
			theme: "system",
			timezone: "UTC",
			emailNotifications: true,
			additionalPreferences: JSON.stringify({}),
		};

		const createdPreferences = await db
			.insert(schema.userPreferences)
			.values(defaultPreferences)
			.returning();

		return createdPreferences[0];
	} catch (error) {
		console.error("Error getting user preferences:", error);
		throw new Error("Failed to get user preferences");
	}
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
	userId: string,
	updates: Partial<Omit<UserPreferences, "id" | "userId" | "createdAt">>,
): Promise<UserPreferences> {
	try {
		const updatedPreferences = await db
			.update(schema.userPreferences)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(schema.userPreferences.userId, userId))
			.returning();

		if (updatedPreferences.length === 0) {
			throw new Error("User preferences not found");
		}

		return updatedPreferences[0];
	} catch (error) {
		console.error("Error updating user preferences:", error);
		throw new Error("Failed to update user preferences");
	}
}

/**
 * Update user language preference
 */
export async function updateUserLanguage(
	userId: string,
	language: SupportedLocale,
): Promise<UserPreferences> {
	// Validate language
	if (!supportedLocales.includes(language)) {
		throw new Error(`Unsupported language: ${language}`);
	}

	return updateUserPreferences(userId, { language });
}

/**
 * Update user theme preference
 */
export async function updateUserTheme(
	userId: string,
	theme: SupportedTheme,
): Promise<UserPreferences> {
	// Validate theme
	if (!AVAILABLE_THEMES.includes(theme)) {
		throw new Error(`Unsupported theme: ${theme}`);
	}

	return updateUserPreferences(userId, { theme });
}

/**
 * Parse additional preferences from JSON string
 */
export function parseAdditionalPreferences(
	additionalPreferences: string | null,
): Record<string, unknown> {
	if (!additionalPreferences) {
		return {};
	}

	try {
		return JSON.parse(additionalPreferences);
	} catch (error) {
		console.error("Error parsing additional preferences:", error);
		return {};
	}
}

/**
 * Set additional preference value
 */
export async function setAdditionalPreference(
	userId: string,
	organizationId: string,
	key: string,
	value: unknown,
): Promise<UserPreferences | null> {
	// Get current preferences
	const preferences = await getUserPreferences(userId, organizationId);
	if (!preferences) {
		return null;
	}

	const additionalPrefs = parseAdditionalPreferences(
		preferences.additionalPreferences,
	);

	// Update the specific preference
	additionalPrefs[key] = value;

	// Save back to database
	return updateUserPreferences(userId, {
		additionalPreferences: JSON.stringify(additionalPrefs),
	});
}

/**
 * Get additional preference value
 */
export async function getAdditionalPreference(
	userId: string,
	organizationId: string,
	key: string,
	defaultValue: unknown = null,
): Promise<unknown> {
	const preferences = await getUserPreferences(userId, organizationId);
	if (!preferences) {
		return defaultValue;
	}

	const additionalPrefs = parseAdditionalPreferences(
		preferences.additionalPreferences,
	);

	return additionalPrefs[key] ?? defaultValue;
}

/**
 * Create default preferences for a new user in an organization
 * Note: This requires an organization context
 */
export async function createDefaultPreferences(
	userId: string,
	options: {
		organizationId: string; // Required for multi-tenant preferences
		language?: SupportedLocale;
		theme?: SupportedTheme;
		timezone?: string;
		emailNotifications?: boolean;
	},
): Promise<UserPreferences> {
	const defaultPreferences: NewUserPreferences = {
		id: `pref_${userId}_${options.organizationId}`,
		userId,
		organizationId: options.organizationId,
		language: options.language || defaultLocale,
		theme: options.theme || "system",
		timezone: options.timezone || "UTC",
		emailNotifications: options.emailNotifications ?? true,
		additionalPreferences: JSON.stringify({}),
	};

	try {
		const createdPreferences = await db
			.insert(schema.userPreferences)
			.values(defaultPreferences)
			.returning();

		return createdPreferences[0];
	} catch (error) {
		console.error("Error creating default preferences:", error);
		throw new Error("Failed to create default preferences");
	}
}
