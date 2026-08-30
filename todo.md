# Follow-up fixes

- [x] Inspect why the landing page is not visible in the user's preview.
- [x] Confirm the root route renders the portfolio entry point.
- [x] Make the landing page entry point more explicit and resilient.
- [x] Decide and document the safest treatment for public contact details; do not claim that client-visible static content is encrypted.
- [x] Rebuild, preview, and push the corrected state to Botlizzy/Proxy-.

## Current contact-protection follow-up

- [x] Remove readable email and phone literals from the JSX source.
- [x] Keep visible mail, phone, WhatsApp, and GitHub actions working.
- [x] Verify the source/build and push the protected-contact update.

## Netlify deployment follow-up

- [ ] Inspect `mydevbio.netlify.app` and the selected repository's build structure.
- [ ] Add Netlify build configuration and SPA fallback rules if needed.
- [ ] Build and push the deployment fix.
- [ ] Verify the public Netlify URL after deployment completes.
