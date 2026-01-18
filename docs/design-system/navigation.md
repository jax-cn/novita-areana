# Navigation Components

## Top Navigation Bar

### Structure
The top navigation bar consists of:
1. **Logo** - Left-aligned
2. **Navigation Items** - Center/Right-aligned
3. **Action Buttons** - Right-aligned (Sign In, Get Started)

### Dimensions
- **Height**: 80px
- **Horizontal padding**: 120px
- **Vertical padding**: 32px
- **Border**: 1px bottom border (`#E7E6E2`)

## Navigation Items

### States

#### Default State
- Background: Transparent
- Text color: Black (`#000000`)
- Font: TT Interphases Pro Mono, 14px
- Icon: Chevron down (Phosphor Icons)
- Padding: 8px

#### Hover State
- Background: Transparent
- Text color: Black (`#000000`)
- Icon: Chevron up (flipped)

#### Active State
- Background: Transparent
- Text color: Brand 1 (`#16B063`)
- Icon: Chevron up (filled with Brand 1)

### Navigation Item Labels
- Model Library
- GPUs
- Playground
- Docs
- Pricing
- Blog

### Implementation
```tsx
interface NavigationItemProps {
  label: string;
  active?: boolean;
  href?: string;
}

export function NavigationItem({ label, active, href }: NavigationItemProps) {
  return (
    <a
      href={href}
      className={`
        flex items-center gap-1 h-8 px-2 rounded-lg
        font-mono text-sm
        ${active ? 'text-[#16B063]' : 'text-black'}
        hover:bg-transparent
      `}
    >
      {label}
      {!active && (
        <CaretDown className="w-6 h-6" />
      )}
      {active && (
        <CaretUp className="w-6 h-6 text-[#16B063]" />
      )}
    </a>
  );
}
```

## Dropdown Menus

### Menu Item Structure

#### Default State
- Background: White (`#FFFFFF`)
- Border: None
- Border radius: 8px
- Padding: 24px
- Gap: 14px between icon and text

#### Hover State
- Background: Gray 3 (`#F5F5F5`)
- Border radius: 8px
- Padding: 24px
- Gap: 14px between icon and text

### Menu Item Content

**Title**
- Font: TT Interphases Pro Regular
- Size: 16px
- Line height: 24px
- Color: Black (`#000000`)

**Description**
- Font: TT Interphases Pro Mono Regular
- Size: 14px
- Line height: 16px
- Color: Dark 2 (`#4F4E4A`)
- Maximum: 2 lines

### Dropdown Container
- Background: White (`#FFFFFF`)
- Border: 1px solid Gray 1 (`#CBC9C4`)
- Border radius: 4px (bottom corners only)
- Padding: 24px
- Gap: 24px between menu items
- Background overlay: Brand 2 (`#CAF6E0`)

### Implementation Example
```tsx
interface MenuItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
}

export function MenuItem({ title, description, icon, href }: MenuItemProps) {
  return (
    <a
      href={href}
      className="
        flex items-center gap-3.5 p-6 rounded-lg
        hover:bg-[#F5F5F5]
        transition-colors
      "
    >
      <div className="w-16 h-16 flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-sans text-base leading-6 text-black">
          {title}
        </p>
        <p className="font-['TT_Interphases_Pro_Mono'] text-sm leading-4 text-[#4F4E4A]">
          {description}
        </p>
      </div>
    </a>
  );
}
```

## Action Buttons

### Sign In Button
- **Variant**: Secondary
- **Size**: M (32px height)
- **Border**: 1px solid Black
- **Padding**: 16px horizontal
- **Text**: "Sign In"

### Get Started Button
- **Variant**: Primary
- **Size**: M (32px height)
- **Background**: Brand 0 (`#23D57C`)
- **Padding**: 16px horizontal
- **Text**: "Get Started"

## Logo

### Structure
The logo consists of:
1. **Icon**: 24px × 24px
2. **Text mark**: Specific width

See [Logo & Branding](./logo.md) for detailed specifications.

## Navigation Contexts

### Above the Fold
- **Background**: White
- **Border**: Bottom border only (`#E7E6E2`)
- **Shadow**: None

### Down the Fold
- **Background**: White
- **Border**: Bottom border only (`#E7E6E2`)
- **Shadow**: None
- **Sticky behavior**: Optional

## Responsive Behavior

### Desktop (1280px+)
- Full navigation with all items
- Horizontal layout
- Dropdown menus on hover

### Tablet (768px - 1279px)
- Condensed navigation
- Some menu items may collapse into dropdown

### Mobile (< 768px)
- Hamburger menu
- Full-screen navigation drawer
- Stacked navigation items

## Best Practices

1. **Keep navigation labels short** - 1-2 words maximum
2. **Use clear, descriptive labels** - Avoid jargon
3. **Show current location** - Use active state
4. **Provide hover feedback** - Visual indicators for interactive items
5. **Group related items** - Use dropdowns logically
6. **Keep dropdown descriptions concise** - Maximum 2 lines
7. **Maintain consistent spacing** - Use 24px padding throughout
8. **Test navigation depth** - Don't nest more than 2 levels deep
