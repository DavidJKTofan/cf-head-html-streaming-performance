/**
 * Configuration constants for The Great Streaming Quest
 */

import type { QuestConfig } from './types';

export const DEFAULT_QUEST_CONFIG: QuestConfig = {
	dungeonDelayMs: 2000, // 2 seconds simulated database query
	armorDownloadMs: 800, // 800ms simulated asset download
};

export const RESPONSE_HEADERS: HeadersInit = {
	'Content-Type': 'text/html; charset=utf-8',
	'Transfer-Encoding': 'chunked',
	'X-Content-Type-Options': 'nosniff',
	'Cache-Control': 'no-store', // Prevent caching so demo works every refresh
};
