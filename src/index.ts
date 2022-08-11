/*** Framework: ***/
import { Hono, Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
const app = new Hono();

import getSymbolFromCurrency from 'currency-symbol-map';

/*** Global Middleware: ***/
app.use('*', cors());
app.use('*', prettyJSON());
app.post('*', async (c: Context, next: Next) => {
    if (!c.req.header('Content-Type')?.includes('application/json'))
        { return c.json({ message: `Method not allowed.` }, 405); }
    await next();
});

const cmcAPI = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';

/*** Routes: ***/

// Homepage
app.get('/:coin/:currency', async (c: Context) => {

    let { coin, currency } = c.req.param();
    coin = coin.toUpperCase();
    currency = currency.toUpperCase();

    const cmcURL = `${cmcAPI}?symbol=${coin}&convert=${currency}`;
    const cacheKey = `${cmcAPI}:${currency}:${c.event.request.cf.country}`;
    const cacheLength = 1 * (60 * 60);

    let response = await fetch(cmcURL, {
        method: 'GET',
        headers: {
            "X-CMC_PRO_API_KEY": CMC_PRO_API_KEY,
        },
        cf: {
            cacheTtl: cacheLength,
            cacheEverything: true,
            cacheKey: cacheKey,
        },
    });

    let responseJson = await response.json();

    // Validate Response
    if (!!responseJson.status.error_code) {
        return c.json({ error: responseJson.status.error_message }, 400);
    }

    const coinData = responseJson.data[coin][0];
    const currencyData = coinData.quote[currency];

    try {
        const coinResponse = {
            // Cache Info:
            retrievedAt: responseJson.status.timestamp,
            retrievedAgo: (Date.now() - (new Date(responseJson.status.timestamp)).getTime()) / 1000,
            retrievedFrom: c.event.request.cf.colo,
            // Coin Info:
            coinName: coinData.name,
            coinCode: coin,
            coinSymbol: getSymbolFromCurrency(coin),
            currencyCode: currency,
            currencySymbol: getSymbolFromCurrency(currency),
            // Price Info:
            price: currencyData.price,
            price_formatted: new Intl.NumberFormat(c.event.request.cf, { style: 'currency', currency: currency }).format(currencyData.price),
            priceChange: {
                "1h": {
                    percent: Number(currencyData.percent_change_1h/100).toLocaleString(c.event.request.cf, { style: 'percent', minimumFractionDigits: 2 }),
                    direction: Math.sign(currencyData.percent_change_1h),
                },
                "24h": {
                    percent: Number(currencyData.percent_change_24h/100).toLocaleString(c.event.request.cf, { style: 'percent', minimumFractionDigits: 2 }),
                    direction: Math.sign(currencyData.percent_change_24h),
                },
                "7d": {
                    percent: Number(currencyData.percent_change_7d/100).toLocaleString(c.event.request.cf, { style: 'percent', minimumFractionDigits: 2 }),
                    direction: Math.sign(currencyData.percent_change_7d),
                },
                "30d": {
                    percent: Number(currencyData.percent_change_30d/100).toLocaleString(c.event.request.cf, { style: 'percent', minimumFractionDigits: 2 }),
                    direction: Math.sign(currencyData.percent_change_30d),
                },
                "60d": {
                    percent: Number(currencyData.percent_change_60d/100).toLocaleString(c.event.request.cf, { style: 'percent', minimumFractionDigits: 2 }),
                    direction: Math.sign(currencyData.percent_change_60d),
                },
                "90d": {
                    percent: Number(currencyData.percent_change_90d/100).toLocaleString(c.event.request.cf, { style: 'percent', minimumFractionDigits: 2 }),
                    direction: Math.sign(currencyData.percent_change_90d),
                },
            },
            marketCap: currencyData.market_cap,
            marketCap_formatted: new Intl.NumberFormat(c.event.request.cf, { style: 'currency', currency: currency }).format(currencyData.market_cap),
        };


        // Reconstruct the Response object to make its headers mutable.
        response = new Response(JSON.stringify(coinResponse), response);
        // Set cache control headers to cache on browser for 25 minutes
        response.headers.set('Cache-Control', `max-age=${cacheLength}`);

        return response;

    } catch(e) {
        return c.json({ error: e.message }, 500);
    }

});

app.fire();
