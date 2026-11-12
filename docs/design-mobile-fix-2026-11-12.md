# Design mobile containment fix
- Removed the fixed 460px minimum from the detail progress guide; uses two columns below 640px, five above.
- Design dialogs use full dynamic viewport height/width below 768px, safe-area padding, a minmax(0,1fr) grid track and constrained children so intrinsic content cannot widen the dialog.
- Detail tabs scroll inside their container. Save footer stacks on narrow screens.
- Design filter sheet fills the mobile viewport. Inputs use 16px text and 44px minimum hit sizes.
- Main search occupies its own mobile row; view switch stays aligned, summary cards use smaller padding and wrappable labels.
- All overrides are scoped to Design; desktop rules, permissions, data and transitions are unchanged.
- TypeScript and production build checked before release. Visual browser preview could not be completed in the isolated browser; the user's screenshot remains useful to confirm the exact reported symptom.
