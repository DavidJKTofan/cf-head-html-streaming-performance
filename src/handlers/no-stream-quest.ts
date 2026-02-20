/**
 * No-Stream Quest Handler (Traditional Approach)
 *
 * This handler demonstrates the TRADITIONAL (non-streaming) approach where
 * the server waits for ALL data before sending ANY HTML to the browser.
 *
 * PROBLEM: The browser cannot start downloading CSS/JS until the ENTIRE
 * response is ready. This means:
 * - 2 seconds waiting for database
 * - THEN browser starts downloading CSS/JS
 * - Total time = database delay + asset download time (SEQUENTIAL)
 *
 * Compare this to the streaming approach where these happen IN PARALLEL!
 */

import type { Env, QuestConfig } from '../lib/types';
import { DEFAULT_QUEST_CONFIG } from '../lib/constants';
import { simulateDungeonDelay } from '../lib/streaming';

/**
 * Handles the non-streaming quest request.
 * Waits for ALL data before sending response (traditional approach).
 */
export async function handleNoStreamQuest(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
	config: QuestConfig = DEFAULT_QUEST_CONFIG
): Promise<Response> {
	console.log('[No-Stream Quest] Starting - will wait for all data before responding');

	// ═══════════════════════════════════════════════════════════════════════
	// TRADITIONAL APPROACH: Wait for database BEFORE sending ANY HTML
	// ═══════════════════════════════════════════════════════════════════════
	// The browser receives NOTHING during this time. It cannot:
	// - Start downloading CSS
	// - Start downloading JS
	// - Start downloading fonts
	// - Render anything
	const startTime = Date.now();
	await simulateDungeonDelay(config.dungeonDelayMs);
	const dbTime = Date.now() - startTime;

	console.log(`[No-Stream Quest] Database query complete after ${dbTime}ms`);

	// Only NOW do we send the HTML - browser starts from zero
	const html = generateFullPageHTML(config, dbTime);

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'X-Content-Type-Options': 'nosniff',
			'Cache-Control': 'no-store',
		},
	});
}

function generateFullPageHTML(config: QuestConfig, dbTime: number): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>❌ Traditional (No Streaming)</title>
    
    <!-- 
        PROBLEM: The browser only sees this NOW, after waiting ${dbTime}ms!
        It could have been downloading these assets during that time.
    -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=MedievalSharp&family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/styles.css">
    
    <script>
        const pageReceivedTime = performance.now();
        window.noStreamState = { 
            pageReceivedTime,
            cssLoadedTime: null,
            jsLoadedTime: null,
            allReadyTime: null 
        };
    </script>
    <script src="/js/quest.js"></script>
</head>
<body>
    <a href="/" class="home-btn" title="Home">🏠</a>
    <div class="container">
        <h1 style="background: linear-gradient(135deg, #ff4444, #cc0000); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">❌ Traditional Approach (No Streaming)</h1>
        <p class="subtitle">The browser waited ${config.dungeonDelayMs}ms before receiving ANY HTML</p>
        
        <div class="legend" style="border-color: #ff4444;">
            <div class="legend-item"><span class="legend-icon">⏳</span> <strong>Server waited</strong> ${dbTime}ms</div>
            <div class="legend-item"><span class="legend-icon">📥</span> <strong>Then</strong> sent HTML</div>
            <div class="legend-item"><span class="legend-icon">🐌</span> <strong>Then</strong> browser downloads CSS/JS</div>
            <div class="legend-item"><span class="legend-icon">📊</span> <strong>Total</strong> = Sequential time</div>
        </div>
        
        <div class="quest-log">
            <h2>📜 Timeline (Sequential - Slow!)</h2>
            <div id="quest-entries"></div>
            
            <script>
                var log = window.QuestLogger ? QuestLogger.log : window.logToQuest;
                if (!log) {
                    log = function(actor, msg, type) {
                        var el = document.getElementById('quest-entries');
                        el.innerHTML += '<div class="log-entry"><span class="actor ' + type + '">' + actor + ':</span> ' + msg + '</div>';
                    };
                }
                log('⏳ Server', 'I waited ${dbTime}ms in the Dungeon BEFORE sending you anything...', 'server');
                log('🦸 Browser', 'I just received the HTML! NOW I can start downloading CSS/JS...', 'hero');
            </script>
        </div>
        
        <script>
            // Track when CSS/JS finish loading
            var checkCount = 0;
            function checkAssetsLoaded() {
                checkCount++;
                var state = window.noStreamState;
                
                // Check if fonts are loaded (proxy for CSS)
                if (!state.cssLoadedTime && document.fonts && document.fonts.status === 'loaded') {
                    state.cssLoadedTime = performance.now();
                }
                
                // Check if our QuestLogger is ready (proxy for JS)
                if (!state.jsLoadedTime && window.QuestLogger && window.QuestLogger.state) {
                    state.jsLoadedTime = performance.now();
                }
                
                if (state.cssLoadedTime && state.jsLoadedTime) {
                    state.allReadyTime = performance.now();
                    showFinalStats();
                } else if (checkCount < 100) {
                    setTimeout(checkAssetsLoaded, 50);
                } else {
                    // Fallback after 5 seconds
                    state.allReadyTime = performance.now();
                    showFinalStats();
                }
            }
            
            function showFinalStats() {
                var state = window.noStreamState;
                var totalTime = state.allReadyTime;
                var assetTime = totalTime - state.pageReceivedTime;
                
                var log = window.QuestLogger ? QuestLogger.log : window.logToQuest;
                log('🦸 Browser', '🛡️ CSS/JS finally loaded after ' + assetTime.toFixed(0) + 'ms (started AFTER server delay)', 'hero');
                log('📊 System', '<strong style="color:#ff4444">TOTAL TIME: ~' + (${dbTime} + assetTime).toFixed(0) + 'ms</strong> (${dbTime}ms server + ' + assetTime.toFixed(0) + 'ms assets = SEQUENTIAL)', 'system');
                
                // Show comparison box
                document.getElementById('comparison-stats').classList.remove('hidden');
                document.getElementById('server-wait').textContent = '${dbTime}ms';
                document.getElementById('asset-download').textContent = assetTime.toFixed(0) + 'ms';
                document.getElementById('total-sequential').textContent = (${dbTime} + assetTime).toFixed(0) + 'ms';
            }
            
            setTimeout(checkAssetsLoaded, 100);
        </script>
        
        <div id="comparison-stats" class="treasure-box hidden" style="border-color: #ff4444; background: linear-gradient(135deg, #2d0000, #3d0000);">
            <h3 style="color: #ff4444;">❌ Sequential Loading (Slow)</h3>
            <p style="color: #d49494;">Assets downloaded AFTER server finished - time wasted!</p>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-value" id="server-wait" style="color: #ff4444;">--</div>
                    <div class="stat-label">Server Wait</div>
                </div>
                <div class="stat">
                    <div class="stat-value" id="asset-download" style="color: #ff4444;">--</div>
                    <div class="stat-label">Asset Download</div>
                </div>
                <div class="stat">
                    <div class="stat-value" id="total-sequential" style="color: #ff4444;">--</div>
                    <div class="stat-label">Total (Sequential)</div>
                </div>
            </div>
            
            <p style="margin-top: 1rem; color: #888;">
                <a href="/quest" style="color: #3fb950;">→ Try the Streaming version</a> to see the difference!
            </p>
        </div>
        
        <footer class="footer">
            For demonstration and educational purposes only. 
            <a href="https://github.com/DavidJKTofan/cf-head-html-streaming-performance" target="_blank">View on GitHub</a>
        </footer>
    </div>
</body>
</html>`;
}
