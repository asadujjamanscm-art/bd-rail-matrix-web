# BD Rail Matrix v1.1.1 — Train Finder Route Fix

v1.1.1 keeps the existing working Matrix API/UI unchanged and fixes the Train Finder.

Changes:
- Station dropdown focus bug fixed (`undefined` entries removed).
- Train Finder now uses live ordered train-route data from the Shohoz Railway route endpoint.
- Finder matches intermediate stations, not only endpoint stations.
- Direction is determined by the actual stop order: From → To or To → From.
- Existing `/api/matrix` remains unchanged.

The Finder does not perform booking, OTP, CAPTCHA, payment, or any ticket action.
