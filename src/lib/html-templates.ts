/**
 * HTML Templates for The Great Streaming Quest
 *
 * These templates are streamed in phases:
 * - Phase 1: The Map (<head>) - sent instantly
 * - Phase 2: Dungeon delay (server waits for backend)
 * - Phase 3: The Treasure (<body> content) - sent after delay
 *
 * Static Assets (Heavy Armor):
 * - /css/styles.css - Main stylesheet
 * - /js/quest.js    - Quest logging utilities
 */

import type { QuestConfig } from './types';

/**
 * Generates the <head> HTML chunk (The Map).
 * This is streamed INSTANTLY so the browser can start downloading assets.
 *
 * The browser will immediately begin downloading:
 * - Google Fonts (external)
 * - /css/styles.css (Heavy Armor - CSS)
 * - /js/quest.js (Heavy Armor - JS)
 */
export function generateHeadChunk(config: QuestConfig): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚔️ The Great Streaming Quest</title>
    
    <!-- 
        HEAVY ARMOR: External assets that the Hero (Browser) downloads
        WHILE the Quest Giver (Server) is in the Dungeon (Database).
        This parallel downloading is the KEY performance benefit!
    -->
    
    <!-- Fonts (External Heavy Armor) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=MedievalSharp&family=Fira+Code:wght@400;700&display=swap" rel="stylesheet" onload="if(window.QuestLogger) QuestLogger.onCssLoaded();">
    
    <!-- Main Stylesheet (Heavy Armor - CSS) -->
    <link rel="stylesheet" href="/css/styles.css" onload="if(window.QuestLogger) QuestLogger.onCssLoaded();">
    
    <!-- Quest Logger (Heavy Armor - JS) -->
    <script src="/js/quest.js"></script>
    
    <!-- Inline fallback timer (in case JS hasn't loaded yet) -->
    <script>
        // Fallback: Define basic logging if quest.js hasn't loaded yet
        if (!window.QuestLogger) {
            window.questStartTime = performance.now();
            window.logToQuest = function(actor, message, type) {
                var log = document.getElementById('quest-entries');
                if (!log) return;
                var elapsed = (performance.now() - window.questStartTime).toFixed(0).padStart(4, ' ');
                var entry = document.createElement('div');
                entry.className = 'log-entry';
                entry.innerHTML = '<span class="timestamp">[' + elapsed + 'ms]</span> <span class="actor ' + type + '">' + actor + ':</span> <span class="message">' + message + '</span>';
                log.appendChild(entry);
            };
        }
    </script>
</head>
<body>
    <a href="/" class="home-btn" title="Home">🏠</a>
    <div class="container">
        <h1>⚔️ The Great Streaming Quest 🏰</h1>
        <p class="subtitle">Demonstrating HTML &lt;head&gt; Streaming for Faster Page Loads</p>
        
        ${getLegendHTML()}
        
        <div class="quest-log">
            <h2>📜 Quest Log</h2>
            <div id="quest-entries"></div>
            
            <script>
                // Log initial messages - use QuestLogger if available, fallback otherwise
                var log = window.QuestLogger ? QuestLogger.log : window.logToQuest;
                log('🧙 Quest Giver', 'The Map (&lt;head&gt;) has been delivered! I am now descending into the Dungeon to fetch your Treasure...', 'server');
                log('🦸 Hero', 'Map received! I can see the quest layout. Now downloading my Heavy Armor (CSS, Fonts, JS)...', 'hero');
            </script>
            
            <div id="loading-indicator" class="loading">
                <div class="spinner"></div>
                <span>🧙 Quest Giver is battling Database Dragons in the Dungeon... (${config.dungeonDelayMs / 1000} second simulated delay)</span>
            </div>
        </div>
`;
}

/**
 * Generates the <body> HTML chunk (The Treasure).
 * This is streamed AFTER the backend delay completes.
 */
export function generateBodyChunk(config: QuestConfig): string {
	return `
        <script>
            // Notify QuestLogger that treasure has arrived
            if (window.QuestLogger) {
                QuestLogger.onTreasureReceived();
            } else {
                document.getElementById('loading-indicator').classList.add('hidden');
                logToQuest('🧙 Quest Giver', '🏆 I have returned from the Dungeon! The Treasure is being delivered!', 'server');
            }
        </script>
        
        <div class="treasure-box">
            <h3>🏆 TREASURE ACQUIRED! 🏆</h3>
            <p>The Quest Giver successfully retrieved the data from the Dungeon (Database)!</p>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-value" id="total-time">--</div>
                    <div class="stat-label">Total Quest Time</div>
                </div>
                <div class="stat">
                    <div class="stat-value" id="armor-time">--</div>
                    <div class="stat-label">Armor Equipped</div>
                </div>
                <div class="stat">
                    <div class="stat-value" id="time-saved">--</div>
                    <div class="stat-label">Time Saved by Streaming</div>
                </div>
            </div>
        </div>
        
        <script>
            // Display final statistics using QuestLogger or fallback
            if (window.QuestLogger) {
                QuestLogger.showFinalStats(${config.dungeonDelayMs});
            } else {
                var totalTime = (performance.now() - window.questStartTime).toFixed(0);
                document.getElementById('total-time').textContent = totalTime + 'ms';
                document.getElementById('armor-time').textContent = '~${config.armorDownloadMs}ms';
                document.getElementById('time-saved').textContent = '~${config.armorDownloadMs}ms';
                logToQuest('🦸 Hero', '💰 Treasure received! Quest complete in ' + totalTime + 'ms!', 'hero');
            }
        </script>
        
        <footer class="footer">
            For demonstration and educational purposes only. 
            <a href="https://github.com/DavidJKTofan/cf-head-html-streaming-performance" target="_blank">View on GitHub</a>
        </footer>
    </div>
</body>
</html>
`;
}

/**
 * Generates error HTML for failed quests.
 */
export function generateErrorChunk(errorMessage: string): string {
	return `<div style="color:red;padding:2rem;">⚠️ Quest Failed: ${errorMessage}</div></body></html>`;
}

/**
 * Generates the legend HTML showing the gamification metaphor.
 */
function getLegendHTML(): string {
	return `
        <div class="legend">
            <div class="legend-item"><span class="legend-icon">🦸</span> <strong>Hero</strong> = Browser</div>
            <div class="legend-item"><span class="legend-icon">🧙</span> <strong>Quest Giver</strong> = Server</div>
            <div class="legend-item"><span class="legend-icon">🗺️</span> <strong>Map</strong> = &lt;head&gt; tag</div>
            <div class="legend-item"><span class="legend-icon">🛡️</span> <strong>Heavy Armor</strong> = CSS/JS/Fonts</div>
            <div class="legend-item"><span class="legend-icon">🏔️</span> <strong>Dungeon</strong> = Database</div>
            <div class="legend-item"><span class="legend-icon">💰</span> <strong>Treasure</strong> = &lt;body&gt; data</div>
        </div>
    `;
}
