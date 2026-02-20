/**
 * ============================================================================
 * THE GREAT STREAMING QUEST - Quest Logger (Heavy Armor)
 * ============================================================================
 *
 * This JavaScript file is part of the "Heavy Armor" that the Hero (Browser)
 * downloads WHILE the Quest Giver (Server) is in the Dungeon (Database).
 *
 * Because the <head> is streamed instantly with a reference to this script,
 * the browser starts downloading it immediately - in parallel with the
 * server's database query!
 */

(function() {
    'use strict';

    // Quest timing state
    const questState = {
        startTime: performance.now(),
        armorEquippedTime: null,
        treasureReceivedTime: null,
        cssLoaded: false,
        jsLoaded: false,
    };

    // Make questState globally accessible for the streamed scripts
    window.questState = questState;

    /**
     * Gets the elapsed time since quest start in milliseconds.
     */
    function getElapsedTime() {
        return performance.now() - questState.startTime;
    }

    /**
     * Formats a timestamp for the quest log.
     */
    function formatTimestamp(ms) {
        return ms.toFixed(0).padStart(4, ' ');
    }

    /**
     * Logs an action to the quest log UI.
     * @param {string} actor - The actor (e.g., "🦸 Hero", "🧙 Quest Giver")
     * @param {string} message - The message to log
     * @param {string} actorType - CSS class for styling (hero, server, system)
     */
    function logToQuest(actor, message, actorType) {
        const log = document.getElementById('quest-entries');
        if (!log) {
            console.warn('[Quest] Log container not found, queuing message:', message);
            return;
        }

        const elapsed = formatTimestamp(getElapsedTime());
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="timestamp">[${elapsed}ms]</span>
            <span class="actor ${actorType}">${actor}:</span>
            <span class="message">${message}</span>
        `;
        log.appendChild(entry);
    }

    /**
     * Marks CSS as loaded and checks if all armor is equipped.
     */
    function onCssLoaded() {
        questState.cssLoaded = true;
        checkArmorEquipped();
    }

    /**
     * Marks JS as loaded and checks if all armor is equipped.
     */
    function onJsLoaded() {
        questState.jsLoaded = true;
        checkArmorEquipped();
    }

    /**
     * Checks if all "Heavy Armor" (CSS + JS) is fully loaded.
     */
    function checkArmorEquipped() {
        if (questState.cssLoaded && questState.jsLoaded && !questState.armorEquippedTime) {
            questState.armorEquippedTime = getElapsedTime();
            logToQuest(
                '🦸 Hero',
                `🛡️ Heavy Armor fully equipped! (CSS + JS downloaded in ${questState.armorEquippedTime.toFixed(0)}ms). Ready and waiting for the Treasure!`,
                'hero'
            );
        }
    }

    /**
     * Called when the treasure (body content) arrives.
     */
    function onTreasureReceived() {
        questState.treasureReceivedTime = getElapsedTime();
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }

        logToQuest(
            '🧙 Quest Giver',
            '🏆 I have returned from the Dungeon! The Treasure (&lt;body&gt; data) is being delivered!',
            'server'
        );
    }

    /**
     * Displays the final quest statistics.
     * @param {number} dungeonDelayMs - The server-side delay in milliseconds
     */
    function showFinalStats(dungeonDelayMs) {
        const totalTime = getElapsedTime();
        const armorTime = questState.armorEquippedTime || 0;
        const timeSaved = armorTime;

        // Update stat elements
        const totalTimeEl = document.getElementById('total-time');
        const armorTimeEl = document.getElementById('armor-time');
        const timeSavedEl = document.getElementById('time-saved');

        if (totalTimeEl) totalTimeEl.textContent = totalTime.toFixed(0) + 'ms';
        if (armorTimeEl) armorTimeEl.textContent = armorTime.toFixed(0) + 'ms';
        if (timeSavedEl) timeSavedEl.textContent = '~' + timeSaved.toFixed(0) + 'ms';

        // Log completion
        logToQuest(
            '🦸 Hero',
            `💰 Treasure received and rendered! Quest complete in ${totalTime.toFixed(0)}ms!`,
            'hero'
        );

        const wouldHaveTaken = dungeonDelayMs + armorTime;
        logToQuest(
            '📊 System',
            `<strong>STREAMING BENEFIT:</strong> The Hero equipped Heavy Armor (${armorTime.toFixed(0)}ms) WHILE the Quest Giver was in the Dungeon (${dungeonDelayMs}ms). Without streaming, total time would be ~${wouldHaveTaken.toFixed(0)}ms. We saved ~${timeSaved.toFixed(0)}ms!`,
            'system'
        );
    }

    // Expose functions globally for use by streamed HTML
    window.QuestLogger = {
        log: logToQuest,
        onCssLoaded: onCssLoaded,
        onJsLoaded: onJsLoaded,
        onTreasureReceived: onTreasureReceived,
        showFinalStats: showFinalStats,
        getElapsedTime: getElapsedTime,
        state: questState,
    };

    // Mark JS as loaded after a brief delay (simulating download time)
    // In production, this would naturally happen as the file downloads
    setTimeout(() => {
        onJsLoaded();
    }, 100);

    console.log('[Quest] quest.js loaded - Heavy Armor (JS) initialized');
})();
