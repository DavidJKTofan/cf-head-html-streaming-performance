/**
 * Stream Quest Handler
 *
 * Handles the /quest endpoint that demonstrates HTML streaming.
 * This handler streams HTML in phases to show the performance benefits
 * of early <head> delivery.
 */

import type { Env, QuestConfig } from '../lib/types';
import { DEFAULT_QUEST_CONFIG, RESPONSE_HEADERS } from '../lib/constants';
import {
	createStreamingPipeline,
	encodeChunk,
	simulateDungeonDelay,
} from '../lib/streaming';
import {
	generateHeadChunk,
	generateBodyChunk,
	generateErrorChunk,
} from '../lib/html-templates';

/**
 * Handles the streaming quest request.
 * Demonstrates the 3-phase HTML streaming pattern.
 */
export async function handleStreamQuest(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
	config: QuestConfig = DEFAULT_QUEST_CONFIG
): Promise<Response> {
	const { readable, writer } = createStreamingPipeline();

	// Use ctx.waitUntil to keep Worker alive during async streaming
	// but return the Response immediately for instant TTFB
	ctx.waitUntil(streamQuestContent(writer, config));

	return new Response(readable, {
		headers: RESPONSE_HEADERS,
	});
}

/**
 * Performs the actual streaming in 3 phases.
 * This runs asynchronously after the Response is returned.
 */
async function streamQuestContent(
	writer: { write(chunk: Uint8Array): Promise<void>; close(): Promise<void> },
	config: QuestConfig
): Promise<void> {
	try {
		// ═══════════════════════════════════════════════════════════════════
		// PHASE 1: Stream the <head> immediately (The Map)
		// ═══════════════════════════════════════════════════════════════════
		// The browser receives this instantly and can:
		// - Start downloading CSS, fonts, JS
		// - Parse and apply styles
		// - Execute timer scripts
		console.log('[Quest] Phase 1: Streaming <head> (The Map)');
		await writer.write(encodeChunk(generateHeadChunk(config)));

		// ═══════════════════════════════════════════════════════════════════
		// PHASE 2: Simulate backend delay (The Dungeon)
		// ═══════════════════════════════════════════════════════════════════
		// While the server waits, the browser is actively downloading assets!
		// This parallel execution is the key performance benefit.
		console.log(
			`[Quest] Phase 2: Entering Dungeon (${config.dungeonDelayMs}ms delay)`
		);
		await simulateDungeonDelay(config.dungeonDelayMs);

		// ═══════════════════════════════════════════════════════════════════
		// PHASE 3: Stream the <body> content (The Treasure)
		// ═══════════════════════════════════════════════════════════════════
		// The Quest Giver returns with the treasure!
		console.log('[Quest] Phase 3: Streaming <body> (The Treasure)');
		await writer.write(encodeChunk(generateBodyChunk(config)));
	} catch (error) {
		console.error('[Quest] Error during streaming:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		await writer.write(encodeChunk(generateErrorChunk(errorMessage)));
	} finally {
		// Always close the stream to signal completion
		console.log('[Quest] Stream closed');
		await writer.close();
	}
}
