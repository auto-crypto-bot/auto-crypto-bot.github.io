
// State
let currentPrice = 0.00;
let positions = [];
let chartData = [];
let chartCandles = []; // {t: ms, label: string}

// DOM Elements
const priceEl = document.getElementById('price-display');
const profitEl = document.getElementById('total-pl');
const ordersEl = document.getElementById('active-orders');
const runtimeEl = document.getElementById('runtime');
const cyclesEl = document.getElementById('cycles-count');
const bagCountEl = document.getElementById('bag-count');
const posListEl = document.getElementById('positions-list');
const settingsModal = document.getElementById('settings-modal');

// Chart Setup
const ctx = document.getElementById('mainChart').getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

const chart = new Chart(ctx, {
    data: {
        labels: [],
        datasets: [
            {
                type: 'line',
                label: 'BTC/USDC',
                data: [], // will be {x: timestamp, y: price}
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.2,
                pointRadius: 0,
                pointHoverRadius: 4,
                order: 2
            },
            {
                type: 'scatter',
                label: 'Active Bags',
                data: [], // will be {x: timestamp, y: price}
                backgroundColor: '#ef4444',
                borderColor: '#fff',
                borderWidth: 1,
                pointRadius: 6,
                pointHoverRadius: 8,
                order: 1
            }
        ]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    displayFormats: {
                        minute: 'HH:mm'
                    }
                },
                grid: { display: false },
                ticks: {
                    maxTicksLimit: 6,
                    color: '#94a3b8'
                }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            }
        },
        animation: { duration: 0 },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    }
});

async function fetchChartData() {
    try {
        // MEXC Public API via CORS Proxy
        // Interval: 5m for high precision
        // Limit: 1000 (approx 3.5 days) to ensure we cover older active bags
        const targetUrl = 'https://api.mexc.com/api/v3/klines?symbol=BTCUSDC&interval=5m&limit=1000';
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const data = await res.json();
        const candlePoints = [];

        data.forEach(candle => {
            // candle[0] is timestamp, candle[4] is close
            candlePoints.push({
                x: candle[0],
                y: parseFloat(candle[4])
            });
        });

        // Update Chart Line (Dataset 0)
        chart.data.datasets[0].data = candlePoints;
        chart.update();

        // Trigger bag update if we have positions
        if (positions.length > 0) updateChartBags();

    } catch (e) {
        console.error("Chart Fetch Error:", e);
    }
}

function updateChartBags() {
    if (!positions.length) return;

    // Dataset 1 is Scatter
    // We map exact buy_time to X axis (Time Scale)
    const bagPoints = positions.map(pos => ({
        x: pos.buy_time * 1000,
        y: pos.buy_price
    }));

    chart.data.datasets[1].data = bagPoints;
    chart.update();
}

async function fetchData() {
    try {
        // Fetch Stats
        const statsRes = await fetch('/api/stats');
        const stats = await statsRes.json();

        if (stats.total_pl !== undefined) {
            profitEl.innerText = `${stats.total_pl >= 0 ? '+' : ''}${stats.total_pl.toFixed(4)} USDC`;
            cyclesEl.innerText = stats.cycles_24h || 0;
            priceEl.innerText = stats.current_price ? stats.current_price.toFixed(2) : "--";

            const rt = stats.runtime_seconds;
            const hrs = Math.floor(rt / 3600);
            const mins = Math.floor((rt % 3600) / 60);
            runtimeEl.innerText = `${hrs}h:${mins}m`;
        }

        // Fetch Balances
        const balRes = await fetch('/api/balances');
        const balances = await balRes.json();

        let totalVal = 0;
        let usdcVal = 0;
        let btcAmt = 0;

        if (balances.USDC) {
            usdcVal = balances.USDC.free + balances.USDC.frozen;
            const el = document.getElementById('bal-usdt');
            if (el) el.innerText = usdcVal.toFixed(2);
        }
        if (balances.BTC) {
            btcAmt = balances.BTC.free + balances.BTC.frozen;
            const el = document.getElementById('bal-btc');
            if (el) el.innerText = btcAmt.toFixed(6);
        }

        if (stats.current_price > 0) {
            totalVal = usdcVal + (btcAmt * stats.current_price);
            document.getElementById('total-balance-val').innerText = `$${totalVal.toFixed(2)}`;
        }

        // Fetch Positions
        const posRes = await fetch('/api/positions');
        const posData = await posRes.json();

        positions = posData; // Update global
        ordersEl.innerText = posData.length;
        bagCountEl.innerText = posData.length;

        renderPositions(posData);
        updateChartBags(); // Update chart overlay

    } catch (e) {
        console.error("Fetch error", e);
    }
}

function renderPositions(data) {
    posListEl.innerHTML = data.map(p => {
        const timeStr = new Date(p.buy_time * 1000).toLocaleTimeString();
        return `
            <div class="pos-item">
                <div class="pos-info">
                    <span class="pos-price">${p.buy_price.toFixed(2)}</span>
                    <span class="pos-time">${timeStr}</span>
                </div>
                <div class="pos-pnl pnl-pos">
                   ${p.status}
                </div>
            </div>
        `;
    }).join('');
}

// Config Management
function openSettings() {
    loadConfig();
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

async function loadConfig() {
    try {
        const res = await fetch('/api/config');
        const cfg = await res.json();

        document.getElementById('grid-interval').value = cfg.grid_interval;
        document.getElementById('quantity').value = cfg.quantity;
        document.getElementById('profit-target').value = cfg.profit_target;
        document.getElementById('max-positions').value = cfg.max_positions;

        const isRunning = cfg.status === "RUNNING";
        document.getElementById('status-toggle').checked = isRunning;
        document.getElementById('status-label').innerText = cfg.status || "RUNNING";

    } catch (e) {
        alert("Failed to load config");
    }
}

async function saveConfig() {
    const status = document.getElementById('status-toggle').checked ? "RUNNING" : "PAUSED";
    const payload = {
        grid_interval: parseFloat(document.getElementById('grid-interval').value),
        quantity: parseFloat(document.getElementById('quantity').value),
        profit_target: parseFloat(document.getElementById('profit-target').value),
        max_positions: parseInt(document.getElementById('max-positions').value),
        status: status
    };

    try {
        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        closeSettings();
        // Feedback
        alert("Settings Saved! Bot will reload in a few seconds.");
    } catch (e) {
        alert("Failed to save settings");
    }
}

// UI Event Listeners
document.getElementById('status-toggle').addEventListener('change', (e) => {
    document.getElementById('status-label').innerText = e.target.checked ? "RUNNING" : "PAUSED";
});

// Init
fetchData();
fetchChartData(); // Initial Chart Load
setInterval(fetchData, 2000);
setInterval(fetchChartData, 60000); // Update chart every 1 minute
