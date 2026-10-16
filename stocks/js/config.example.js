// Defaults. Copy this file to config.js and fill in your keys there.
// config.js is git-ignored so your keys never get committed.
// With no keys set (or ?demo=1 in the URL) the app runs on generated demo data.
var CONFIG = {
    // https://finnhub.io/register  (free: live quotes, company data, news)
    FINNHUB_KEY: '',
    // https://twelvedata.com/register  (free: chart history)
    TWELVEDATA_KEY: '',

    // Featured stock rotates through these, and they scroll in the ticker tape.
    WATCHLIST: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX'],

    // Seconds each featured stock stays on screen.
    ROTATE_SEC: 60,

    // Index bar. Free plans have no real index values, so ETFs stand in.
    INDICES: [
        { sym: 'SPY', name: 'S&P 500' },
        { sym: 'QQQ', name: 'NASDAQ' },
        { sym: 'DIA', name: 'DOW JONES' },
        { sym: 'IWM', name: 'RUSSELL 2000' },
        { sym: 'VIXY', name: 'VIX' }
    ]
};
