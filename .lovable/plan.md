

## Fix: Centralize the Floating Dock

**Root cause:** Framer Motion's `animate={{ y: 0 }}` sets its own `transform` style, which overrides Tailwind's `-translate-x-1/2` (translateX(-50%)). This causes the dock to lose its horizontal centering after the entrance animation completes.

**Fix in `src/components/FloatingDock.tsx`:**

Remove `-translate-x-1/2` from the className and move the horizontal centering into Framer Motion's animation props:

```tsx
// Change initial/animate to include x: "-50%"
initial={{ y: 100, opacity: 0, x: "-50%" }}
animate={{ y: 0, opacity: 1, x: "-50%" }}
```

This ensures Framer Motion maintains `translateX(-50%)` alongside its Y animation, keeping the dock perfectly centered.

Single file change, one line modified.

