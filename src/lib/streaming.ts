/**
 * Streaming utilities for HTML chunked transfer
 *
 * Uses TransformStream and TextEncoder to enable progressive HTML delivery.
 * The browser can start rendering content before the full response is complete.
 */

import type { StreamWriter } from './types';

export interface StreamingPipeline {
	readable: ReadableStream<Uint8Array>;
	writer: StreamWriter;
}

/**
 * Creates a streaming pipeline for chunked HTML responses.
 * Returns a readable stream (for the Response) and a writer (for sending chunks).
 */
export function createStreamingPipeline(): StreamingPipeline {
	const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
	const rawWriter = writable.getWriter();

	const writer: StreamWriter = {
		async write(chunk: Uint8Array): Promise<void> {
			await rawWriter.write(chunk);
		},
		async close(): Promise<void> {
			await rawWriter.close();
		},
	};

	return { readable, writer };
}

/**
 * Encodes a string as UTF-8 bytes for streaming.
 */
export function encodeChunk(content: string): Uint8Array {
	return new TextEncoder().encode(content);
}

/**
 * Simulates a slow backend operation (the "Dungeon").
 * In production, this would be a database query, API call, etc.
 */
export function simulateDungeonDelay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
