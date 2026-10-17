# Grok engine ZIP staging

Upload **jlm-night-rush-grok-sprint01.zip** to this directory on branch `feature/grok-zip-ci` using GitHub's **Add file → Upload files**.

The workflow at `.github/workflows/verify-grok-zip.yml` will unpack, install, typecheck, test, build and produce a standalone HTML artifact if everything passes.

The ZIP must contain `jlm-night-rush/package.json` in its root; never upload `node_modules`.

This does not change `main`. **No Jerusalem OSM dataset is bundled** with the supplied Grok ZIP: the resulting initial HTML uses a clearly labeled synthetic map.
