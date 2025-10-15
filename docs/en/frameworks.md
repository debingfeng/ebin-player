# Frameworks Overview

A summary of how to integrate Ebin Player across popular frontend frameworks.

## Compatibility Matrix

| Framework | Package | Min Version | SSR | Styles |
|---|---|---|---|---|
| React | `@ebin-player/react` | React 18 | Supported (instantiate on client) | Auto by default, manual import supported |
| Vue 2 | `@ebin-player/vue2` | Vue 2.6/2.7 | Supported | Same as above |
| Vue 3 | `@ebin-player/vue3` | Vue 3+ | Supported | Same as above |
| Angular | `@ebin-player/angular` | Angular 17/20 | Supported (Angular Universal) | Auto by default, manual supported |

## Notes
- Prefer official framework packages for integration.
- For SSR, avoid instantiating on server. Our components guard for client-only DOM access.
- For production, consider pinning `@ebin-player/core` styles or self-hosting.

## Quick Links
- React: `packages/react/README.md`
- Vue 2: `packages/vue2/README.md`
- Vue 3: `packages/vue3/README.md`
- Angular: `packages/angular/README.md`
