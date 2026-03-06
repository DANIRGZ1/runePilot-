# Icon Setup

Before building the installer, replace the placeholder icons:

## Required files
- `electron/icon.png`    — 512×512 app icon (shown in window title bar and taskbar)
- `electron/tray-icon.png` — 22×22 system tray icon (white/gold on transparent background)
- `electron/icon.ico`    — Windows installer icon (256×256, ICO format)

## Quick way to generate icon.ico from icon.png
```
# Install globally once
npm install -g png-to-ico

# Then run
png-to-ico electron/icon.png > electron/icon.ico
```

## Tools
- Free online: https://convertio.co/png-ico/
- Photoshop / Figma: export as 512×512 PNG, then convert
