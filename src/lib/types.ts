/**
 * Type definitions for The Great Streaming Quest
 *
 * GAMIFICATION METAPHOR:
 * - Browser       = "Hero"
 * - Server/Worker = "Quest Giver"
 * - <head> tag    = "Map"
 * - CSS/JS assets = "Heavy Armor"
 * - Database/API  = "Dungeon"
 * - <body> data   = "Gold/Treasure"
 */

export interface Env {
	ASSETS?: Fetcher;
}

export interface QuestConfig {
	/** Simulated database delay in milliseconds (Dungeon traversal time) */
	dungeonDelayMs: number;
	/** Simulated asset download time in milliseconds (Heavy Armor equip time) */
	armorDownloadMs: number;
}

export interface StreamWriter {
	write(chunk: Uint8Array): Promise<void>;
	close(): Promise<void>;
}
