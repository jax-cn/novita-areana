# Typography System

## Font Families

### Primary Font: TT Interphases Pro
- **Weights Available**: Regular (400), Medium (500), DemiBold (600)
- **Usage**: Headings, body text, UI elements

### Secondary Font: TT Interphases Pro Mono
- **Weight Available**: Regular (400)
- **Usage**: Code, captions, labels, technical text

### Tertiary Font: TT Interfaces
- **Weight Available**: Regular (400)
- **Usage**: Secondary body text

## Typography Scale

### Headings

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **H1 / Hero** | 80px | DemiBold (600) | 74px | -1.6px | Main page titles, hero sections |
| **H2** | 56px | DemiBold (600) | 56px | -1.12px | Section titles, major headings |
| **H3** | 48px | DemiBold (600) | 48px | -0.96px | Subsection titles |
| **H4 / Title Sections DT** | 32px | DemiBold (600) | 40px | -0.64px | Desktop section titles |
| **H5 / Subtitles** | 20px | DemiBold (600) | 24px | -0.4px | Subtitles, small headings |

### Body Text

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **Body M** | 16px | Medium (500) | 20px | 0 | Primary body text (Hero) |
| **Body S** | 16px | Regular (400) | 20px | 0 | Standard body text |
| **Body XS** | 14px | Regular (400) | 20px | 0 | Secondary body text, details |

### Technical Text

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **Captions** | 12px | Regular (400) | 14.4px | 1.92px (uppercase) | Labels, metadata |
| **Details** | 10px | Regular (400) | 12px | 1.6px (uppercase) | Fine print, technical details |

## Typography Implementation

### H1 Example
```css
font-family: 'TT Interphases Pro', sans-serif;
font-size: 80px;
font-weight: 600;
line-height: 74px;
letter-spacing: -1.6px;
color: #292827;
```

### H2 Example
```css
font-family: 'TT Interphases Pro', sans-serif;
font-size: 56px;
font-weight: 600;
line-height: 56px;
letter-spacing: -1.12px;
color: #292827;
```

### Body Text Example
```css
font-family: 'TT Interphases Pro', sans-serif;
font-size: 16px;
font-weight: 500;
line-height: 20px;
color: #292827;
```

### Mono/Caption Example
```css
font-family: 'TT Interphases Pro Mono', monospace;
font-size: 12px;
font-weight: 400;
line-height: 1.2;
letter-spacing: 1.92px;
text-transform: uppercase;
color: #292827;
```

## Font Loading

The fonts are loaded locally using Next.js `next/font/local`:

```typescript
import localFont from "next/font/local";

const interphases = localFont({
  src: [
    {
      path: "./fonts/TT_Interphases_Pro/TT_Interphases_Pro_Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/TT_Interphases_Pro/TT_Interphases_Pro_Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/TT_Interphases_Pro/TT_Interphases_Pro_Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/TT_Interphases_Pro/TT_Interphases_Pro_DemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-interphases",
  display: "swap",
});
```

## Best Practices

1. **Use DemiBold (600)** for all headings and titles
2. **Use Medium (500)** for emphasized body text
3. **Use Regular (400)** for standard body text
4. **Apply negative letter-spacing** to large headings (32px and above)
5. **Use uppercase** for captions and details with increased letter-spacing
6. **Maintain proper line-height** ratios for readability
