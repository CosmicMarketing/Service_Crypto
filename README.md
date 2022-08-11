# Crypto API

[![cloudflare](https://github.com/CosmicMarketing/Service_Crypto/actions/workflows/cloudflare.yml/badge.svg)](https://github.com/CosmicMarketing/Service_Crypto/actions/workflows/cloudflare.yml)


## Requirements:
- `CMC_PRO_API_KEY` Environment Variable on Cloudflare Worker (Settings > Variables)


## Output Example
**Request:** `GET .../btc/usd/`
```json
{
    "retrievedAt": "2022-08-11T19:54:57.087Z",
    "retrievedAgo": 0.019,
    "retrievedFrom": "MIA",
    "coinName": "Bitcoin",
    "coinCode": "BTC",
    "coinSymbol": "₿",
    "currencyCode": "USD",
    "currencySymbol": "$",
    "price": 24189.2748709973,
    "price_formatted": "$24,189.27",
    "priceChange": {
        "1h": {
            "percent": "-0.03%",
            "direction": -1
        },
        "24h": {
            "percent": "2.44%",
            "direction": 1
        },
        "7d": {
            "percent": "7.51%",
            "direction": 1
        },
        "30d": {
            "percent": "23.96%",
            "direction": 1
        },
        "60d": {
            "percent": "-12.16%",
            "direction": -1
        },
        "90d": {
            "percent": "-19.29%",
            "direction": -1
        }
    },
    "marketCap": 462464610952.4264,
    "marketCap_formatted": "$462,464,610,952.43"
}
```
