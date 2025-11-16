export function buildHeadSnippet(): string {
  return `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" href="/favicon.ico">`;
}

export function getSnippetInstructions(): string {
  return `Instructions:
1. Upload all PNG files to your website's root directory
2. Copy the HTML code above and paste it inside the <head> section of your HTML
3. Your favicon will appear in browser tabs and bookmarks

File locations:
- favicon-16x16.png → /favicon-16x16.png
- favicon-32x32.png → /favicon-32x32.png  
- favicon-48x48.png → /favicon-48x48.png
- apple-touch-icon.png → /apple-touch-icon.png
- android-chrome-192x192.png → /android-chrome-192x192.png
- android-chrome-512x512.png → /android-chrome-512x512.png
- favicon.ico → /favicon.ico`;
}