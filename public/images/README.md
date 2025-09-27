# Logo Setup Instructions

## Adding Your Custom Logo

1. **Add your logo image** to this directory (`public/images/`)
   - Rename your logo file to: `logo.png` (or update the path in the Logo component)
   - Recommended formats: PNG, SVG, or JPG
   - Recommended size: 512x512 pixels or larger (square format works best)

2. **Enable the custom logo** by editing `/src/components/Logo.tsx`:
   - Change line 26 from: `const hasCustomLogo = false`
   - To: `const hasCustomLogo = true`

3. **Update the logo path** if needed:
   - If your logo has a different name, update the `src` path in the Logo component
   - Current path is set to: `/images/logo.png`

## Current Logo Usage

The Logo component is now used throughout the application in:

- Home page (header and footer)
- HCP Login page
- HCP Register page  
- HCP Dashboard
- Pharma Login page
- Pharma Register page
- Pharma Dashboard

## Logo Component Options

The Logo component supports different variants:
- `variant="icon"` - Only the logo icon
- `variant="text"` - Only the "NotiVet" text
- `variant="full"` - Icon + text (default)

And different sizes:
- `size="sm"` - Small (32px)
- `size="md"` - Medium (40px) - default
- `size="lg"` - Large (48px)
- `size="xl"` - Extra large (64px)

## Fallback

If no custom logo is provided, the component will fallback to the blue stethoscope icon currently used throughout the application.