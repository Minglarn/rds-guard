/**
 * RDS Guard — console.js
 * WebSocket /ws/console, log rendering, pause, filter.
 */

const Console = (() => {
    let ws = null;
    let paused = false;
    let filterText = '';
    let messages = [];
    const MAX_MESSAGES = 500;
    let reconnectTimer = null;

    function init() {
        document.getElementById('console-pause').addEventListener('click', togglePause);
        document.getElementById('console-filter').addEventListener('input', (e) => {
            filterText = e.target.value.toLowerCase();
            renderAll();
        });
    }

    function connect() {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            return;
        }
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${proto}//${location.host}/ws/console`;

        ws = new WebSocket(url);

        ws.onopen = () => {
            App.setWsStatus(true);
            clearReconnectTimer();
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                messages.push(msg);
                if (messages.length > MAX_MESSAGES) {
                    messages.shift();
                }
                updateCount();
                if (!paused) {
                    appendLine(msg);
                }
            } catch (e) {
                // Ignore malformed messages
            }
        };

        ws.onclose = () => {
            App.setWsStatus(false);
            scheduleReconnect();
        };

        ws.onerror = () => {
            App.setWsStatus(false);
        };
    }

    function disconnect() {
        clearReconnectTimer();
        if (ws) {
            ws.close();
            ws = null;
        }
        App.setWsStatus(false);
    }

    function scheduleReconnect() {
        clearReconnectTimer();
        // Only reconnect if console view is active
        const consoleView = document.getElementById('view-console');
        if (consoleView && consoleView.classList.contains('active')) {
            reconnectTimer = setTimeout(() => connect(), 3000);
        }
    }

    function clearReconnectTimer() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    }

    function togglePause() {
        paused = !paused;
        const btn = document.getElementById('console-pause');
        if (paused) {
            btn.textContent = 'Resume';
            btn.classList.add('paused');
        } else {
            btn.textContent = 'Pause';
            btn.classList.remove('paused');
            renderAll();
        }
    }

    function appendLine(msg) {
        if (!matchesFilter(msg)) return;

        const log = document.getElementById('console-log');
        const wasAtBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 50;

        const line = createLine(msg);
        log.appendChild(line);

        // Trim DOM if too many lines
        while (log.children.length > MAX_MESSAGES) {
            log.removeChild(log.firstChild);
        }

        if (wasAtBottom) {
            log.scrollTop = log.scrollHeight;
        }
    }

    function renderAll() {
        const log = document.getElementById('console-log');
        log.innerHTML = '';
        const filtered = messages.filter(matchesFilter);
        filtered.forEach(msg => {
            log.appendChild(createLine(msg));
        });
        log.scrollTop = log.scrollHeight;
    }

    function createLine(msg) {
        const div = document.createElement('div');
        div.className = 'console-line';

        const topic = msg.topic || '';
        if (topic === 'alert' || topic.includes('alert')) {
            div.classList.add('is-alert');
        }

        const ts = formatTs(msg.timestamp);
        const shortTopic = topic.replace(/^0x[0-9A-Fa-f]+\//, '');
        const payload = typeof msg.payload === 'string'
            ? msg.payload
            : JSON.stringify(msg.payload);

        div.innerHTML = `
            <span class="console-ts">${escapeHtml(ts)}</span>
            <span class="console-topic">${escapeHtml(shortTopic)}</span>
            <span class="console-payload">${escapeHtml(truncate(payload, 300))}</span>
        `;
        return div;
    }

    function matchesFilter(msg) {
        if (!filterText) return true;
        const topic = (msg.topic || '').toLowerCase();
        const payload = JSON.stringify(msg.payload || '').toLowerCase();
        return topic.includes(filterText) || payload.includes(filterText);
    }

    function formatTs(iso) {
        if (!iso) return '';
        try {
            // If it's already just a time, return it
            if (iso.length <= 8) return iso;
            return iso.substring(11, 19);
        } catch (e) {
            return '';
        }
    }

    function truncate(str, max) {
        return str.length > max ? str.substring(0, max) + '...' : str;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function updateCount() {
        document.getElementById('console-count').textContent =
            `${messages.length} message${messages.length !== 1 ? 's' : ''}`;
    }

    return { init, connect, disconnect };
})();
