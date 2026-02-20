/**
 * ============================================================================
 * THE GREAT STREAMING QUEST - Main Entry Point
 * ============================================================================
 *
 * This is the main router for the Worker. It delegates requests to the
 * appropriate handlers based on the URL path.
 *
 * Architecture:
 * - /              → Static landing page (served from public/index.html)
 * - /quest         → Streaming HTML demo endpoint
 * - /api/config    → Returns quest configuration (for debugging)
 *
 * GAMIFICATION METAPHOR:
 * - Browser       = "Hero"         (receives and processes the streamed HTML)
 * - Server/Worker = "Quest Giver"  (streams HTML chunks to the Hero)
 * - <head> tag    = "Map"          (sent instantly so Hero can prepare)
 * - CSS/JS assets = "Heavy Armor"  (downloaded by Hero while waiting)
 * - Database/API  = "Dungeon"      (slow backend the Quest Giver must traverse)
 * - <body> data   = "Gold/Treasure" (the valuable payload from the Dungeon)
 */

import type { Env } from './lib/types';
import { DEFAULT_QUEST_CONFIG } from './lib/constants';
import { handleStreamQuest } from './handlers/stream-quest';
import { handleNoStreamQuest } from './handlers/no-stream-quest';

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		console.log(`[Router] ${request.method} ${path}`);

		// Route: /quest - The streaming HTML demo (FAST - parallel loading)
		if (path === '/quest') {
			return handleStreamQuest(request, env, ctx);
		}

		// Route: /quest/no-stream - Traditional approach (SLOW - sequential loading)
		if (path === '/quest/no-stream') {
			return handleNoStreamQuest(request, env, ctx);
		}

		// Route: /compare - Side-by-side comparison of both approaches
		if (path === '/compare') {
			return new Response(getComparisonHTML(), {
				headers: { 'Content-Type': 'text/html; charset=utf-8' },
			});
		}

		// Route: /api/config - Debug endpoint to view configuration
		if (path === '/api/config') {
			return Response.json({
				quest: 'The Great Streaming Quest',
				config: DEFAULT_QUEST_CONFIG,
				metaphor: {
					hero: 'Browser',
					questGiver: 'Server/Worker',
					map: '<head> tag',
					heavyArmor: 'CSS/JS/Fonts',
					dungeon: 'Database/API',
					treasure: '<body> data',
				},
			});
		}

		// All other routes fall through to static assets (public/index.html)
		// This is handled by Wrangler's assets configuration
		return env.ASSETS?.fetch(request) ?? new Response('Not Found', { status: 404 });
	},
};

/**
 * Generates the side-by-side comparison page with visual waterfall timeline.
 */
function getComparisonHTML(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ Streaming vs Traditional - Visual Race</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=MedievalSharp&family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Fira Code', monospace;
            background: #0d1117;
            color: #e6edf3;
            padding: 1rem;
            overflow-x: hidden;
        }
        h1 {
            font-family: 'MedievalSharp', cursive;
            text-align: center;
            font-size: 1.8rem;
            margin-bottom: 0.25rem;
            background: linear-gradient(135deg, #ffd700, #ff9500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle { text-align: center; color: #8b949e; margin-bottom: 0.75rem; font-size: 0.85rem; }
        .controls {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        button {
            font-family: 'MedievalSharp', cursive;
            font-size: 1.1rem;
            padding: 0.6rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .start-btn {
            background: linear-gradient(135deg, #ffd700, #ff9500);
            color: #000;
            font-size: 1.3rem;
            padding: 0.8rem 2.5rem;
        }
        .reset-btn { background: #30363d; color: #e6edf3; }
        
        /* Timeline Visualization */
        .timeline-section {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .timeline-header h2 {
            font-family: 'MedievalSharp', cursive;
            font-size: 1.2rem;
            color: #58a6ff;
        }
        .timer {
            font-size: 1.5rem;
            font-weight: bold;
            color: #ffd700;
            font-variant-numeric: tabular-nums;
        }
        .timeline-grid {
            display: grid;
            grid-template-columns: 120px 1fr 80px;
            gap: 0.5rem;
            align-items: center;
        }
        .timeline-label {
            font-size: 0.75rem;
            color: #8b949e;
            text-align: right;
            padding-right: 0.5rem;
        }
        .timeline-track {
            height: 32px;
            background: #21262d;
            border-radius: 6px;
            position: relative;
            overflow: hidden;
        }
        .timeline-bar {
            height: 100%;
            border-radius: 6px;
            position: absolute;
            left: 0;
            top: 0;
            display: flex;
            align-items: center;
            padding-left: 8px;
            font-size: 0.7rem;
            font-weight: bold;
            color: #000;
            transition: width 0.1s linear;
            white-space: nowrap;
            overflow: hidden;
        }
        .timeline-time {
            font-size: 0.75rem;
            color: #8b949e;
            text-align: left;
            padding-left: 0.5rem;
            font-variant-numeric: tabular-nums;
        }
        
        /* Bar colors */
        .bar-server { background: linear-gradient(90deg, #58a6ff, #388bfd); }
        .bar-css { background: linear-gradient(90deg, #a371f7, #8957e5); }
        .bar-js { background: linear-gradient(90deg, #f0883e, #d18616); }
        .bar-body { background: linear-gradient(90deg, #3fb950, #238636); }
        .bar-waiting { background: repeating-linear-gradient(45deg, #30363d, #30363d 10px, #21262d 10px, #21262d 20px); }
        
        /* Phase indicators */
        .phase-row { margin-bottom: 0.25rem; }
        .phase-row:last-child { margin-bottom: 0; }
        
        /* Time markers */
        .time-markers {
            display: grid;
            grid-template-columns: 120px 1fr 80px;
            margin-top: 0.5rem;
            font-size: 0.65rem;
            color: #484f58;
        }
        .markers-track {
            display: flex;
            justify-content: space-between;
            padding: 0 4px;
        }
        
        /* Comparison panels */
        .comparison-panels {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        .panel-box {
            border-radius: 12px;
            overflow: hidden;
        }
        .panel-header {
            padding: 0.5rem 1rem;
            font-weight: bold;
            text-align: center;
            font-size: 0.9rem;
        }
        .streaming-panel .panel-header {
            background: linear-gradient(135deg, #1a4d1a, #0d260d);
            color: #3fb950;
            border: 2px solid #3fb950;
            border-bottom: none;
        }
        .traditional-panel .panel-header {
            background: linear-gradient(135deg, #4d1a1a, #260d0d);
            color: #ff4444;
            border: 2px solid #ff4444;
            border-bottom: none;
        }
        .panel-content {
            background: #161b22;
            padding: 1rem;
            border: 2px solid #30363d;
            border-top: none;
            min-height: 180px;
        }
        .streaming-panel .panel-content { border-color: #3fb950; }
        .traditional-panel .panel-content { border-color: #ff4444; }
        
        /* Status indicators */
        .status-list { list-style: none; }
        .status-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 0;
            font-size: 0.8rem;
            opacity: 0.4;
            transition: opacity 0.3s;
        }
        .status-item.active { opacity: 1; }
        .status-item.done { opacity: 1; }
        .status-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            background: #30363d;
        }
        .status-item.active .status-icon { background: #58a6ff; animation: pulse 1s infinite; }
        .status-item.done .status-icon { background: #3fb950; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        
        /* Results */
        .results-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 1rem;
        }
        .result-box {
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }
        .result-streaming {
            background: rgba(63, 185, 80, 0.1);
            border: 2px solid #3fb950;
        }
        .result-traditional {
            background: rgba(255, 68, 68, 0.1);
            border: 2px solid #ff4444;
        }
        .result-time {
            font-size: 2rem;
            font-weight: bold;
            font-variant-numeric: tabular-nums;
        }
        .result-streaming .result-time { color: #3fb950; }
        .result-traditional .result-time { color: #ff4444; }
        .result-label { font-size: 0.75rem; color: #8b949e; margin-top: 0.25rem; }
        .result-saved {
            font-size: 1rem;
            color: #ffd700;
            margin-top: 0.5rem;
            font-weight: bold;
        }
        .hidden { display: none !important; }
        
        /* Legend */
        .legend {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid #30363d;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.7rem;
            color: #8b949e;
        }
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 3px;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            body { padding: 0.75rem; }
            h1 { font-size: 1.4rem; }
            .subtitle { font-size: 0.75rem; }
            .controls { gap: 0.5rem; flex-wrap: wrap; }
            .start-btn { font-size: 1rem; padding: 0.6rem 1.5rem; }
            .reset-btn { font-size: 0.9rem; padding: 0.5rem 1rem; }
            
            .timeline-section { padding: 0.75rem; }
            .timeline-header { flex-direction: column; gap: 0.5rem; align-items: flex-start; }
            .timeline-header h2 { font-size: 1rem; }
            .timer { font-size: 1.2rem; }
            
            .timeline-grid {
                grid-template-columns: 80px 1fr 50px;
                gap: 0.25rem;
            }
            .timeline-label { font-size: 0.65rem; padding-right: 0.25rem; }
            .timeline-track { height: 24px; }
            .timeline-bar { font-size: 0.6rem; padding-left: 4px; }
            .timeline-time { font-size: 0.65rem; padding-left: 0.25rem; }
            
            .time-markers { display: none; }
            
            .legend { gap: 0.5rem; margin-top: 0.5rem; padding-top: 0.5rem; }
            .legend-item { font-size: 0.6rem; gap: 0.25rem; }
            .legend-color { width: 10px; height: 10px; }
            
            .comparison-panels { grid-template-columns: 1fr; gap: 0.75rem; }
            .panel-header { font-size: 0.8rem; padding: 0.4rem 0.75rem; }
            .panel-content { padding: 0.75rem; min-height: auto; }
            .status-item { font-size: 0.7rem; padding: 0.3rem 0; }
            .status-icon { width: 16px; height: 16px; font-size: 0.6rem; }
            
            .results-row { grid-template-columns: 1fr 1fr; gap: 0.5rem; }
            .result-box { padding: 0.75rem; }
            .result-time { font-size: 1.5rem; }
            .result-label { font-size: 0.65rem; }
            .result-saved { font-size: 0.85rem; }
        }
        
        @media (max-width: 480px) {
            body { padding: 0.5rem; }
            h1 { font-size: 1.2rem; }
            .start-btn { width: 100%; }
            
            .timeline-grid {
                grid-template-columns: 60px 1fr 40px;
            }
            .timeline-label { font-size: 0.55rem; }
            .timeline-track { height: 20px; }
            .timeline-bar { font-size: 0.5rem; }
            .timeline-time { font-size: 0.55rem; }
            
            .legend { flex-direction: column; align-items: flex-start; }
            
            .results-row { grid-template-columns: 1fr; }
            .result-time { font-size: 1.3rem; }
        }
        /* Home Button */
        .home-btn {
            position: fixed;
            top: 1rem;
            left: 1rem;
            width: 44px;
            height: 44px;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: #e6edf3;
            font-size: 1.25rem;
            transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
            z-index: 1000;
        }
        .home-btn:hover {
            background: #30363d;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        @media (max-width: 480px) {
            .home-btn { width: 38px; height: 38px; top: 0.5rem; left: 0.5rem; font-size: 1rem; }
        }
    </style>
</head>
<body>
    <a href="/" class="home-btn" title="Home">🏠</a>
    <h1>⚡ Streaming vs Traditional Race</h1>
    <p class="subtitle">Watch how streaming enables parallel loading</p>
    
    <div class="controls">
        <button class="start-btn" onclick="startRace()">🏁 Start Race!</button>
        <button class="reset-btn" onclick="resetRace()">🔄 Reset</button>
    </div>
    
    <!-- Visual Timeline -->
    <div class="timeline-section">
        <div class="timeline-header">
            <h2>📊 Live Waterfall Timeline</h2>
            <div class="timer" id="global-timer">0ms</div>
        </div>
        
        <!-- Streaming Timeline -->
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #3fb950; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.85rem;">✅ STREAMING (Parallel Loading)</div>
            <div class="timeline-grid phase-row">
                <div class="timeline-label">🧙 Server Work</div>
                <div class="timeline-track">
                    <div class="timeline-bar bar-server" id="stream-server" style="width: 0%;">Fetching data...</div>
                </div>
                <div class="timeline-time" id="stream-server-time">-</div>
            </div>
            <div class="timeline-grid phase-row">
                <div class="timeline-label">🎨 CSS Download</div>
                <div class="timeline-track">
                    <div class="timeline-bar bar-css" id="stream-css" style="width: 0%;">Loading styles...</div>
                </div>
                <div class="timeline-time" id="stream-css-time">-</div>
            </div>
            <div class="timeline-grid phase-row">
                <div class="timeline-label">⚡ JS Download</div>
                <div class="timeline-track">
                    <div class="timeline-bar bar-js" id="stream-js" style="width: 0%;">Loading scripts...</div>
                </div>
                <div class="timeline-time" id="stream-js-time">-</div>
            </div>
            <div class="timeline-grid phase-row">
                <div class="timeline-label">💰 Body Render</div>
                <div class="timeline-track">
                    <div class="timeline-bar bar-body" id="stream-body" style="width: 0%;">Rendering content...</div>
                </div>
                <div class="timeline-time" id="stream-body-time">-</div>
            </div>
        </div>
        
        <!-- Traditional Timeline -->
        <div>
            <div style="color: #ff4444; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.85rem;">❌ TRADITIONAL (Sequential Loading)</div>
            <div class="timeline-grid phase-row">
                <div class="timeline-label">⏳ Server Wait</div>
                <div class="timeline-track">
                    <div class="timeline-bar bar-waiting" id="trad-wait" style="width: 0%;">Waiting for response...</div>
                </div>
                <div class="timeline-time" id="trad-wait-time">-</div>
            </div>
            <div class="timeline-grid phase-row">
                <div class="timeline-label">🎨 CSS Download</div>
                <div class="timeline-track">
                    <div class="timeline-bar bar-css" id="trad-css" style="width: 0%;">Loading styles...</div>
                </div>
                <div class="timeline-time" id="trad-css-time">-</div>
            </div>
            <div class="timeline-grid phase-row">
                <div class="timeline-label">⚡ JS Download</div>
                <div class="timeline-track">
                    <div class="timeline-bar bar-js" id="trad-js" style="width: 0%;">Loading scripts...</div>
                </div>
                <div class="timeline-time" id="trad-js-time">-</div>
            </div>
            <div class="timeline-grid phase-row">
                <div class="timeline-label">💰 Body Render</div>
                <div class="timeline-track">
                    <div class="timeline-bar bar-body" id="trad-body" style="width: 0%;">Rendering content...</div>
                </div>
                <div class="timeline-time" id="trad-body-time">-</div>
            </div>
        </div>
        
        <!-- Time scale markers -->
        <div class="time-markers">
            <div></div>
            <div class="markers-track">
                <span>0s</span>
                <span>0.5s</span>
                <span>1s</span>
                <span>1.5s</span>
                <span>2s</span>
                <span>2.5s</span>
                <span>3s</span>
            </div>
            <div></div>
        </div>
        
        <div class="legend">
            <div class="legend-item"><div class="legend-color bar-server"></div> Server processing</div>
            <div class="legend-item"><div class="legend-color bar-css"></div> CSS download</div>
            <div class="legend-item"><div class="legend-color bar-js"></div> JS download</div>
            <div class="legend-item"><div class="legend-color bar-body"></div> Body rendered</div>
            <div class="legend-item"><div class="legend-color bar-waiting"></div> Browser waiting</div>
        </div>
    </div>
    
    <!-- Results -->
    <div class="results-row hidden" id="results">
        <div class="result-box result-streaming">
            <div class="result-time" id="result-stream">--</div>
            <div class="result-label">Streaming Total</div>
        </div>
        <div class="result-box result-traditional">
            <div class="result-time" id="result-trad">--</div>
            <div class="result-label">Traditional Total</div>
        </div>
    </div>
    <div class="result-saved hidden" id="time-saved" style="text-align: center; margin-top: 0.5rem;"></div>
    
    <!-- Status Panels -->
    <div class="comparison-panels">
        <div class="panel-box streaming-panel">
            <div class="panel-header">✅ Streaming Status</div>
            <div class="panel-content">
                <ul class="status-list" id="stream-status">
                    <li class="status-item" id="s1"><span class="status-icon">1</span> Request sent to server</li>
                    <li class="status-item" id="s2"><span class="status-icon">2</span> &lt;head&gt; received instantly!</li>
                    <li class="status-item" id="s3"><span class="status-icon">3</span> CSS/JS downloading (parallel)</li>
                    <li class="status-item" id="s4"><span class="status-icon">4</span> Server still fetching data...</li>
                    <li class="status-item" id="s5"><span class="status-icon">5</span> Assets ready! (while waiting)</li>
                    <li class="status-item" id="s6"><span class="status-icon">6</span> &lt;body&gt; received & rendered</li>
                </ul>
            </div>
        </div>
        <div class="panel-box traditional-panel">
            <div class="panel-header">❌ Traditional Status</div>
            <div class="panel-content">
                <ul class="status-list" id="trad-status">
                    <li class="status-item" id="t1"><span class="status-icon">1</span> Request sent to server</li>
                    <li class="status-item" id="t2"><span class="status-icon">2</span> Waiting for server... ⏳</li>
                    <li class="status-item" id="t3"><span class="status-icon">3</span> Still waiting...</li>
                    <li class="status-item" id="t4"><span class="status-icon">4</span> HTML finally received!</li>
                    <li class="status-item" id="t5"><span class="status-icon">5</span> NOW downloading CSS/JS</li>
                    <li class="status-item" id="t6"><span class="status-icon">6</span> Assets ready, rendering...</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        const CONFIG = { serverDelay: 2000, assetDelay: 800, maxTime: 3000 };
        let raceInterval = null;
        let startTime = null;
        
        function startRace() {
            resetRace();
            startTime = performance.now();
            
            // Start the global timer
            raceInterval = setInterval(updateTimer, 50);
            
            // Simulate streaming timeline
            simulateStreaming();
            
            // Simulate traditional timeline
            simulateTraditional();
        }
        
        function updateTimer() {
            const elapsed = performance.now() - startTime;
            document.getElementById('global-timer').textContent = Math.floor(elapsed) + 'ms';
            
            if (elapsed > CONFIG.maxTime + 500) {
                clearInterval(raceInterval);
            }
        }
        
        function simulateStreaming() {
            const t = startTime;
            
            // Step 1: Request sent (instant)
            setStatus('s1', 'active');
            
            // Step 2: <head> received instantly (50ms simulated network)
            setTimeout(() => {
                setStatus('s1', 'done');
                setStatus('s2', 'done');
                setStatus('s3', 'active');
                setStatus('s4', 'active');
                
                // Start CSS bar immediately
                animateBar('stream-css', 0, CONFIG.assetDelay, 'stream-css-time');
                // Start JS bar immediately  
                animateBar('stream-js', 0, CONFIG.assetDelay, 'stream-js-time');
                // Server bar runs for full duration
                animateBar('stream-server', 0, CONFIG.serverDelay, 'stream-server-time');
            }, 50);
            
            // Step 5: Assets ready (after ~800ms)
            setTimeout(() => {
                setStatus('s3', 'done');
                setStatus('s5', 'done');
            }, 50 + CONFIG.assetDelay);
            
            // Step 6: Body received (after ~2000ms server delay)
            setTimeout(() => {
                setStatus('s4', 'done');
                setStatus('s6', 'done');
                animateBar('stream-body', 0, 100, 'stream-body-time');
                
                const total = Math.floor(performance.now() - startTime);
                document.getElementById('result-stream').textContent = total + 'ms';
                checkRaceComplete();
            }, 50 + CONFIG.serverDelay);
        }
        
        function simulateTraditional() {
            // Step 1: Request sent
            setStatus('t1', 'active');
            
            // Start the waiting bar immediately
            animateBar('trad-wait', 0, CONFIG.serverDelay, 'trad-wait-time');
            
            setTimeout(() => {
                setStatus('t1', 'done');
                setStatus('t2', 'active');
            }, 100);
            
            setTimeout(() => {
                setStatus('t2', 'done');
                setStatus('t3', 'active');
            }, CONFIG.serverDelay / 2);
            
            // Step 4: HTML received after server delay
            setTimeout(() => {
                setStatus('t3', 'done');
                setStatus('t4', 'done');
                setStatus('t5', 'active');
                
                // NOW start downloading CSS/JS (sequential!)
                animateBar('trad-css', CONFIG.serverDelay, CONFIG.assetDelay, 'trad-css-time');
                animateBar('trad-js', CONFIG.serverDelay, CONFIG.assetDelay, 'trad-js-time');
            }, CONFIG.serverDelay);
            
            // Step 6: Assets ready (after server + asset delay)
            setTimeout(() => {
                setStatus('t5', 'done');
                setStatus('t6', 'done');
                animateBar('trad-body', CONFIG.serverDelay + CONFIG.assetDelay, 100, 'trad-body-time');
                
                const total = Math.floor(performance.now() - startTime);
                document.getElementById('result-trad').textContent = total + 'ms';
                checkRaceComplete();
            }, CONFIG.serverDelay + CONFIG.assetDelay);
        }
        
        function animateBar(barId, startOffset, duration, timeId) {
            const bar = document.getElementById(barId);
            const timeEl = document.getElementById(timeId);
            const startMs = performance.now();
            const startPct = (startOffset / CONFIG.maxTime) * 100;
            const endPct = ((startOffset + duration) / CONFIG.maxTime) * 100;
            
            bar.style.left = startPct + '%';
            bar.style.width = '0%';
            
            function animate() {
                const elapsed = performance.now() - startMs;
                const progress = Math.min(elapsed / duration, 1);
                const width = (endPct - startPct) * progress;
                
                bar.style.width = width + '%';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    timeEl.textContent = Math.floor(startOffset + duration) + 'ms';
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        function setStatus(id, state) {
            const el = document.getElementById(id);
            el.classList.remove('active', 'done');
            if (state) el.classList.add(state);
        }
        
        let streamDone = false, tradDone = false;
        function checkRaceComplete() {
            const streamResult = document.getElementById('result-stream').textContent;
            const tradResult = document.getElementById('result-trad').textContent;
            
            if (streamResult !== '--') streamDone = true;
            if (tradResult !== '--') tradDone = true;
            
            if (streamDone && tradDone) {
                document.getElementById('results').classList.remove('hidden');
                
                const streamMs = parseInt(streamResult);
                const tradMs = parseInt(tradResult);
                const saved = tradMs - streamMs;
                
                document.getElementById('time-saved').classList.remove('hidden');
                document.getElementById('time-saved').innerHTML = 
                    '🏆 <span style="color:#3fb950">Streaming saved ~' + saved + 'ms</span> by loading assets in parallel!';
            }
        }
        
        function resetRace() {
            clearInterval(raceInterval);
            startTime = null;
            streamDone = false;
            tradDone = false;
            
            document.getElementById('global-timer').textContent = '0ms';
            document.getElementById('results').classList.add('hidden');
            document.getElementById('time-saved').classList.add('hidden');
            document.getElementById('result-stream').textContent = '--';
            document.getElementById('result-trad').textContent = '--';
            
            // Reset all bars
            ['stream-server', 'stream-css', 'stream-js', 'stream-body',
             'trad-wait', 'trad-css', 'trad-js', 'trad-body'].forEach(id => {
                const bar = document.getElementById(id);
                bar.style.width = '0%';
                bar.style.left = '0%';
            });
            
            // Reset all times
            ['stream-server-time', 'stream-css-time', 'stream-js-time', 'stream-body-time',
             'trad-wait-time', 'trad-css-time', 'trad-js-time', 'trad-body-time'].forEach(id => {
                document.getElementById(id).textContent = '-';
            });
            
            // Reset all status items
            ['s1','s2','s3','s4','s5','s6','t1','t2','t3','t4','t5','t6'].forEach(id => {
                setStatus(id, null);
            });
        }
    </script>
    
    <footer style="margin-top: 1.5rem; padding: 1rem; text-align: center; font-size: 0.7rem; color: #484f58; border-top: 1px solid #30363d;">
        For demonstration and educational purposes only. 
        <a href="https://github.com/DavidJKTofan/cf-head-html-streaming-performance" target="_blank" style="color: #58a6ff; text-decoration: none;">View on GitHub</a>
    </footer>
</body>
</html>`;
}