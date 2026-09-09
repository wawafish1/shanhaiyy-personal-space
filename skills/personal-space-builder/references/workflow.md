# Build, review, and release workflow

Read the sections that match the requested mode.

## Content and structure

1. Inventory the supplied resume, screenshots, links, photographs, and current implementation.
2. Build an evidence map: claim, supporting artifact, permission status, and destination section.
3. Draft the homepage narrative and wireframe. Make the first screen answer who the person is, what value they offer, and what the visitor can do next.
4. Confirm copy, contact visibility, image selection, and external-link behavior before visual polish.

Keep raw claims traceable to supplied evidence. Remove filler disclaimers unless they are legally or ethically necessary, but never remove meaningful safety or privacy boundaries just to make the page cleaner.

## Design and implementation

- Establish typography, spacing, color, shape, motion, and image-treatment rules before styling isolated components.
- Use animation to clarify focus or sequence, not as decoration that delays access to content.
- Keep photo crops responsive and review important subjects at desktop, tablet, and narrow-phone widths.
- Provide direct controls for manual carousel navigation even when autoplay is requested. Respect reduced-motion preferences and page visibility.
- Preserve scroll position and focus when opening and closing dialogs. Make card, button, and external-link hit areas unambiguous.
- Keep the static production bundle independent of local preview or test dependencies.

## Quality review

Verify the actual latest build at representative desktop, tablet, and mobile widths:

- Page load, missing resources, console errors, horizontal overflow, and font fallback.
- Navigation, menu, focus states, keyboard access, contrast, semantic headings, and alternative text.
- Carousel autoplay, previous/next controls, touch gestures, captions, crop focal points, and reduced motion.
- Dialog open/close, background scroll, focus restoration, and external-link separation.
- Mail, telephone, social, project, resume-download, and copy-to-clipboard actions without actually sending messages or placing calls.
- Existing server sites after proxy changes.

Record limitations honestly. A responsive visual review is not a comprehensive accessibility certification.

## Public repository preparation

1. Define the intended repository root; do not publish a broader parent workspace by accident.
2. Add an allowlist-oriented `.gitignore` for internal notes, source documents, temporary previews, environment files, keys, and deployment bundles.
3. Run `python skills/personal-space-builder/scripts/publication_audit.py .` from the repository root.
4. Review `git status`, the staged file list, large binaries, asset rights, and every occurrence of contact data.
5. Create or push a public repository only after explicit authorization. Do not infer an open-source license merely from public visibility.

## Server release

- Check operating system, privileges, existing containers/services, occupied ports, firewall/security-group access, and current proxy configuration.
- Prefer a separate static service behind the existing reverse proxy instead of competing for ports 80/443.
- Back up only the exact configuration being changed. Validate the candidate configuration before hot reload.
- Verify the new site and every previously served host after reload.
- If the domain is pending, deploy and verify by IP or a temporary hostname without claiming HTTPS is finished.
- After DNS points to the server, enable the canonical domain, redirects, and automatic HTTPS; then test certificate validity and both apex/www behavior.
- Remove uploaded archives and temporary authorized keys at the end of each access window.

Provide the live URL first in the handoff, followed by verification results, remaining DNS/HTTPS work, and the rollback location when relevant.
