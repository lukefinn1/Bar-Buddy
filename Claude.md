# Bar Buddy — Inventory Intelligence

## What this project is
A mobile-first bar inventory management web app built in React. 
It helps bar managers track stock, log weekly sales, generate 
order suggestions, and run monthly variance reports.

## Tech stack
- React (single file component — App.jsx)
- Vite for bundling
- Deployed on Vercel
- Storage uses window.storage API (artifact environment) 
  which is polyfilled with localStorage in main.jsx for production

## Project structure
bar-buddy/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx   (entry point + localStorage polyfill)
    └── App.jsx    (entire application — all logic and UI here)

## Key rules — read before editing anything
- All code lives in App.jsx — do not split into multiple files
- NumInput, TextInput, Select, CategoryFilter, SearchBar and 
  all other components must be defined at MODULE level, never 
  inside the BarBuddy function — this prevents focus loss on re-render
- Inputs must use type="text" with inputMode="decimal", never 
  type="number" — iOS/browser number inputs break React controlled values
- Always use functional state updaters: setState(prev => ({...prev, [id]: val}))
  never setState({...currentState, [id]: val}) — prevents stale closure bugs
- Storage keys are bb-lib-v3 and bb-period-v3
- Do not change storage key versions unless seed data changes

## Monthly/weekly logic
- Opening stock: entered once per month after physical count
- Deliveries: running total updated throughout the month
- Weekly sales: entered each week, logged via "Log This Week" 
  button which adds to monthly running total
- New Month: closing count becomes new opening stock, everything resets
- Order suggestions always calculated against full monthly accumulated data

## Ingredient/recipe data
- 64 real ingredients from a real bar — specific brands matter, do not genericise
- 55 recipes: 15 cocktails, 5 beers, 35 wine pour sizes
- Vermouth is categorised as Liqueurs despite being a wine product
- Bitters tracked in ml not dashes

## UI pattern
- Bottom navigation bar: Home, Stock, Orders, Variance, Setup
- Stock page has 3 sub-tabs: Opening Stock, Deliveries, Sales
- Variance page has 2 sub-tabs: Closing Count, Results
- Setup page has 2 sub-tabs: Ingredients, Recipes
- Modals slide up as bottom sheets
- CSS variables defined in :root — always use var(--gold) etc not hardcoded colours
- Fonts: Cormorant Garant (headings), IBM Plex Mono (data/labels)
