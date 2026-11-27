# Wedding invitation

## Personalizing the invitation

- Edit names, family names, dates, events, locations, photo paths, and captions in `wedding-config.js`.
- Replace `song.mp3` with another MP3 using the same filename to change the music. Keep it beside `index.html`.
- Replace gallery images in `photos/` and update their paths in `wedding-config.js` if their names change.
- `styles.css` controls appearance and responsive layout. `app.js` controls animation and interaction; everyday content changes should not require editing it.

## Preview

Open the folder in VS Code and use a local HTTP server or the Live Server extension to serve `index.html`. Serving over HTTP is recommended because browsers may block audio when the page is opened directly as a `file://` URL. Music starts when the visitor opens the invitation, subject to the browser's audio policy.

## Publish with GitHub Pages

1. Create a GitHub repository and upload the contents of this folder, keeping `index.html`, `styles.css`, `app.js`, `wedding-config.js`, `song.mp3`, and `photos/` together.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose the branch containing the files and the `/ (root)` folder, then save.
4. Open the published Pages URL after deployment completes.

The site is static and does not require a build step. Anyone who can access a public repository or its Pages site can view the invitation and download its assets; use a private repository if the invitation should not be public.
