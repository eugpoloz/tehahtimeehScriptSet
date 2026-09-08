# Store

Auto-initializing catalog and cart controls for the store markup in
`posts/unk_store.txt`.

Loading the bundle initializes the first matching store automatically and
exposes the initializer as `teh.store()` for explicit reuse.

Build with:

```sh
make store
```

The generated bundle is `dist/teh.store.iife.js`.
