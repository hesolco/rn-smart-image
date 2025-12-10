# rn-smart-image

A powerful, intelligent image loading library for React Native with built-in caching, prioritization, and full-screen preview capabilities.

## 🚀 Features

- **Smart Caching**: Automatically caches images to the local filesystem using `react-native-fs`. Offline support out of the box.
- **Progressive Loading**: Displays a placeholder (color or image) while the main image is loading, with a smooth fade-in transition.
- **Full-Screen Preview**: Built-in support for tapping to view images in full-screen mode.
- **Pinch-to-Zoom**: Supports pinch gestures to zoom in/out (max 2x) and pan around the image in full-screen mode.
- **Priority Queue**: Efficiently manages downloads with priority levels (HIGH, NORMAL, LOW) and concurrency handling.
- **TypeScript**: Fully typed API for excellent developer experience.

## 📦 Installation

```bash
npm install rn-smart-image react-native-fs @react-native-community/netinfo crypto-js @babel/runtime
```
*Note: Make sure to install peer dependencies properly.*

## 📱 Usage

### 1. Basic Usage
Simply replace `Image` with `SmartImage`:

```tsx
import { SmartImage } from 'rn-smart-image';

<SmartImage 
  source={{ uri: 'https://example.com/photo.jpg' }} 
  style={{ width: 200, height: 200, borderRadius: 10 }} 
/>
```

### 2. Full-Screen Preview with Zoom
Enable tap-to-expand and pinch-to-zoom features effortlessly:

```tsx
<SmartImage 
  source={{ uri: 'https://example.com/detail.jpg' }} 
  style={{ width: '100%', height: 300 }}
  preview={true}   // Enable full-screen on tap
  zoomable={true}  // Enable pinch-to-zoom in full-screen
/>
```

### 3. Advanced Styling & Placeholder
Customize styling for both the container and the image itself.

```tsx
<SmartImage 
  source={{ uri: 'https://example.com/banner.jpg' }} 
  placeholder="#E1E1E1"  // Show gray color while loading
  // or placeholder={require('./loading.png')}
  
  style={{ width: '100%', height: 200, borderRadius: 8 }} // Container style
  imageStyle={{ tintColor: 'rgba(0,0,0,0.1)' }} // Inner image style (optional)
  
  resizeMode="cover"
  priority="high" // Load this image before others
/>
```

## 🛠 API

### SmartImage Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `{ uri: string }` \| `number` | **required** | The image source (remote URL or local require). |
| `placeholder` | `string` (color) \| `ImageSource` | `null` | Shown while the image is loading. |
| `style` | `ViewStyle` | `null` | Style for the container view. |
| `imageStyle` | `ImageStyle` | `null` | Style applied directly to the inner Image component. |
| `resizeMode` | `'cover' \| 'contain' \| 'stretch'` | `'cover'` | How the image should be resized. |
| `priority` | `'low' \| 'normal' \| 'high'` | `'normal'` | Download priority for the queue manager. |
| `useCache` | `boolean` | `true` | Enable or disable local caching. |
| `preview` | `boolean` | `false` | Enable full-screen modal on tap. |
| `zoomable` | `boolean` | `true` | Enable pinch-to-zoom in full-screen mode. |
| `onLoadStart` | `function` | `undefined` | Callback when loading starts. |
| `onLoad` | `function` | `undefined` | Callback when loading completes. |
| `onError` | `function` | `undefined` | Callback when an error occurs. |

## 🧩 Utilities

### Preloading Images
You can preload critical images (like banners) before they appear on screen:

```tsx
import { DownloadManager } from 'rn-smart-image';

// Queue a high-priority download
DownloadManager.getInstance().download(
  'https://example.com/banner.jpg', 
  'high'
);
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## ☕ Support

If you find this library helpful, you can buy me a coffee 😊

[![](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=hesolco&button_colour=5F7FFF&font_colour=ffffff&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/hesolco)


## 📄 License
MIT
