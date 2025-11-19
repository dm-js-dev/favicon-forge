export function buildHeadSnippet(): string {
  // Comprehensive favicon + PWA related icons
  return `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
<link rel="icon" href="/favicon.ico">`;
}

export function getSnippetInstructions(): string {
  return `Instructions:
1. Upload all generated PNG files + favicon.ico to your site's public root (or adjust paths).
2. Copy the HTML code above into the <head> of every page.
3. Optional: Add a web app manifest if you need PWA features.

Included files:
• favicon-16x16.png   → /favicon-16x16.png (classic small tab icon)
• favicon-32x32.png   → /favicon-32x32.png (standard tab icon)
• favicon-48x48.png   → /favicon-48x48.png (legacy / some platforms)
• apple-touch-icon.png → /apple-touch-icon.png (iOS home screen)
• android-chrome-192x192.png → /android-chrome-192x192.png (PWA icon medium)
• android-chrome-512x512.png → /android-chrome-512x512.png (PWA icon large)
• favicon.ico → /favicon.ico (fallback for older browsers)`;
}