# Admin checks

Build with `make admin-actions`. Load `dist/teh.core.iife.js` first, then
`dist/teh.admin-actions.iife.js`.

The admin-check helpers are currently internal and are not exported by the
package entry point.

The admin-index check loads the server-rendered marker from the current DOM.
Users can modify that DOM or bypass browser code, so it is not an authorization
boundary for sensitive data or operations.
