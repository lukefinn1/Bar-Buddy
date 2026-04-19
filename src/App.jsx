import { useState, useEffect, useCallback, useRef } from "react";

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Spirits", "Liqueurs", "Wine", "Beer & Cider",
  "Bitters", "Juice & Cordials", "Syrups", "Garnishes", "Dry Goods", "Other"
];

// ─── SEED DATA — Real bar data ────────────────────────────────────────────────
const SEED_INGREDIENTS = [
  // Spirits
  { id: 1,  name: "Chivas Regal 12",               category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 3 },
  { id: 2,  name: "Yellow Rose Rye",                category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 3,  name: "Maker's Mark",                   category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 4 },
  { id: 4,  name: "Jameson",                        category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 4 },
  { id: 5,  name: "Toki Blended Whisky",            category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 3 },
  { id: 6,  name: "Olmeca Tequila",                 category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 3 },
  { id: 7,  name: "Havana Club 3",                  category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 3 },
  { id: 8,  name: "Beefeater Gin",                  category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 4 },
  { id: 9,  name: "Absolut Vanilla",                category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 3 },
  { id: 10, name: "Absolut Vodka",                  category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 11, name: "Vida Mezcal",                    category: "Spirits",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  // Liqueurs (inc. vermouth)
  { id: 12, name: "Amaro Montenegro",               category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 13, name: "Campari",                        category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 14, name: "Baileys",                        category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 15, name: "Pavan",                          category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 16, name: "Marie Brizard Cacao Blanc",      category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 17, name: "Marie Brizard Elderflower",      category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 3 },
  { id: 18, name: "DeKuyper Peach",                 category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 19, name: "DeKuyper Butterscotch",          category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 20, name: "DeKuyper Sour Apple Puckers",    category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 21, name: "Malibu",                         category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 22, name: "Triple Sec",                     category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 3 },
  { id: 23, name: "Martini Bianco",                 category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 2 },
  { id: 24, name: "Sweet Vermouth",                 category: "Liqueurs",         recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 2 },
  // Syrups
  { id: 25, name: "Monin Caramel Syrup",            category: "Syrups",           recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 26, name: "Monin Strawberry Syrup",         category: "Syrups",           recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 2 },
  { id: 27, name: "Maple Syrup",                    category: "Syrups",           recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 2 },
  { id: 28, name: "Orgeat (Crawley's)",             category: "Syrups",           recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 500,  par: 2 },
  { id: 29, name: "Sugar Syrup (house)",            category: "Syrups",           recipeUnit: "ml",   purchaseUnit: "2kg bag", purchaseSize: 3000, par: 3 },
  // Juice & Cordials
  { id: 30, name: "Lemon Juice",                    category: "Juice & Cordials", recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 4 },
  { id: 31, name: "Lime Juice",                     category: "Juice & Cordials", recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 4 },
  { id: 32, name: "Apple Juice",                    category: "Juice & Cordials", recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 3 },
  { id: 33, name: "Passionfruit Pulp",              category: "Juice & Cordials", recipeUnit: "ml",   purchaseUnit: "can",     purchaseSize: 500,  par: 3 },
  { id: 34, name: "Cranberry Juice",                category: "Juice & Cordials", recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 3 },
  { id: 35, name: "Pineapple Juice",                category: "Juice & Cordials", recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 3 },
  { id: 36, name: "Aquafaba",                       category: "Juice & Cordials", recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 4 },
  // Bitters
  { id: 37, name: "Chocolate Bitters",              category: "Bitters",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 200,  par: 2 },
  { id: 38, name: "Orange Bitters",                 category: "Bitters",          recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 200,  par: 2 },
  // Beer & Cider (ordered by case/24, counted individually)
  { id: 39, name: "Corona (355ml)",                 category: "Beer & Cider",     recipeUnit: "unit", purchaseUnit: "case",    purchaseSize: 24,   par: 2 },
  { id: 40, name: "Great Northern Original (330ml)",category: "Beer & Cider",     recipeUnit: "unit", purchaseUnit: "case",    purchaseSize: 24,   par: 2 },
  { id: 41, name: "Great Northern Supercrisp (330ml)",category:"Beer & Cider",    recipeUnit: "unit", purchaseUnit: "case",    purchaseSize: 24,   par: 2 },
  { id: 42, name: "Heineken Zero (330ml)",          category: "Beer & Cider",     recipeUnit: "unit", purchaseUnit: "case",    purchaseSize: 24,   par: 1 },
  { id: 43, name: "James Squire Orchard Crush (345ml)",category:"Beer & Cider",   recipeUnit: "unit", purchaseUnit: "case",    purchaseSize: 24,   par: 2 },
  // Wine — Sparkling & Champagne
  { id: 44, name: "Clover Hill NV",                 category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  { id: 45, name: "Bianca Vigna Prosecco",          category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 12 },
  { id: 46, name: "Taittinger",                     category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 3 },
  // Wine — Aromatic & Lighter White
  { id: 47, name: "Fiore Moscato",                  category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  { id: 48, name: "Hay Shed Hill Sauvignon Semillon",category:"Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  { id: 49, name: "Hesketh Sauvignon Blanc",        category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  { id: 50, name: "Josef Chromy Sgr Riesling",      category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 4 },
  { id: 51, name: "Rockburn Pinot Gris",            category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 4 },
  // Wine — Full Bodied White & Rosé
  { id: 52, name: "Haha Chardonnay",                category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  { id: 53, name: "Dalrymple Chardonnay",           category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 3 },
  { id: 54, name: "Maison Saint AIX Rosé",          category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  { id: 55, name: "Santa Cristina Sangiovese Rosé", category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  // Wine — Lighter & Medium Red
  { id: 56, name: "Fickle Mistress Pinot Noir",     category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  { id: 57, name: "Torres Ibericos Tempranillo",    category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 4 },
  { id: 58, name: "Domaine Beaurenard Grenache Syrah",category:"Wine",            recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 4 },
  // Wine — Full Bodied Red
  { id: 59, name: "Little Berry Cabernet Sauvignon",category:"Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 6 },
  { id: 60, name: "Langmeil Valley Floor Shiraz",   category: "Wine",             recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 4 },
  { id: 61, name: "Leeuwin Estate Art Series Shiraz",category:"Wine",            recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 3 },
  { id: 62, name: "Penfolds Bin 389 Cabernet Shiraz",category:"Wine",            recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 750,  par: 2 },
  // Dry Goods
  { id: 63, name: "Tajin",                          category: "Dry Goods",        recipeUnit: "g",    purchaseUnit: "bottle",  purchaseSize: 142,  par: 2 },
  { id: 64, name: "Fever-Tree Lime & Yuzu Soda",    category: "Dry Goods",        recipeUnit: "ml",   purchaseUnit: "4-pack",  purchaseSize: 800,  par: 5 },
];

const SEED_RECIPES = [
  // ── Cocktails ──
  { id: 1,  name: "Smoke & Silk",
    ingredients: [{ ingredientId: 1, quantity: 60 }, { ingredientId: 27, quantity: 15 }, { ingredientId: 37, quantity: 2.4 }] },
  { id: 2,  name: "Fifth Avenue",
    ingredients: [{ ingredientId: 2, quantity: 45 }, { ingredientId: 12, quantity: 15 }, { ingredientId: 38, quantity: 1.8 }] },
  { id: 3,  name: "Crimson Bloom",
    ingredients: [{ ingredientId: 3, quantity: 20 }, { ingredientId: 24, quantity: 20 }, { ingredientId: 13, quantity: 20 }] },
  { id: 4,  name: "Velour Drift",
    ingredients: [{ ingredientId: 4, quantity: 40 }, { ingredientId: 14, quantity: 20 }, { ingredientId: 25, quantity: 10 }] },
  { id: 5,  name: "Kisetsu",
    ingredients: [{ ingredientId: 3, quantity: 40 }, { ingredientId: 16, quantity: 20 }, { ingredientId: 30, quantity: 25 }, { ingredientId: 26, quantity: 10 }] },
  { id: 6,  name: "Golden Pulse",
    ingredients: [{ ingredientId: 4, quantity: 30 }, { ingredientId: 17, quantity: 30 }, { ingredientId: 32, quantity: 60 }, { ingredientId: 33, quantity: 30 }, { ingredientId: 36, quantity: 30 }] },
  { id: 7,  name: "Jasmine Mist",
    ingredients: [{ ingredientId: 8, quantity: 45 }, { ingredientId: 17, quantity: 15 }, { ingredientId: 23, quantity: 5 }] },
  { id: 8,  name: "Yuzu High",
    ingredients: [{ ingredientId: 5, quantity: 60 }, { ingredientId: 64, quantity: 90 }] },
  { id: 9,  name: "Neon Collins",
    ingredients: [{ ingredientId: 10, quantity: 30 }] },
  { id: 10, name: "First Light",
    ingredients: [{ ingredientId: 6, quantity: 30 }, { ingredientId: 21, quantity: 30 }, { ingredientId: 31, quantity: 30 }, { ingredientId: 28, quantity: 10 }, { ingredientId: 22, quantity: 5 }] },
  { id: 11, name: "Hikari Muse",
    ingredients: [{ ingredientId: 9, quantity: 45 }, { ingredientId: 18, quantity: 15 }, { ingredientId: 26, quantity: 20 }, { ingredientId: 30, quantity: 25 }, { ingredientId: 36, quantity: 30 }] },
  { id: 12, name: "Kin Bite",
    ingredients: [{ ingredientId: 8, quantity: 30 }, { ingredientId: 19, quantity: 15 }, { ingredientId: 20, quantity: 15 }, { ingredientId: 30, quantity: 30 }, { ingredientId: 29, quantity: 30 }, { ingredientId: 36, quantity: 30 }] },
  { id: 13, name: "Blush Rose",
    ingredients: [{ ingredientId: 15, quantity: 30 }, { ingredientId: 30, quantity: 20 }, { ingredientId: 34, quantity: 40 }, { ingredientId: 45, quantity: 90 }] },
  { id: 14, name: "Ember Flame",
    ingredients: [{ ingredientId: 7, quantity: 30 }, { ingredientId: 22, quantity: 30 }, { ingredientId: 31, quantity: 30 }, { ingredientId: 35, quantity: 30 }, { ingredientId: 28, quantity: 10 }, { ingredientId: 11, quantity: 15 }] },
  { id: 15, name: "Japanese Highball",
    ingredients: [{ ingredientId: 5, quantity: 60 }] },
  // ── Beer ──
  { id: 16, name: "Corona",                         ingredients: [{ ingredientId: 39, quantity: 1 }] },
  { id: 17, name: "Great Northern Original",        ingredients: [{ ingredientId: 40, quantity: 1 }] },
  { id: 18, name: "Great Northern Supercrisp",      ingredients: [{ ingredientId: 41, quantity: 1 }] },
  { id: 19, name: "Heineken Zero",                  ingredients: [{ ingredientId: 42, quantity: 1 }] },
  { id: 20, name: "James Squire Orchard Crush",     ingredients: [{ ingredientId: 43, quantity: 1 }] },
  // ── Sparkling & Champagne (120ml) ──
  { id: 21, name: "Clover Hill NV 120ml",           ingredients: [{ ingredientId: 44, quantity: 120 }] },
  { id: 22, name: "Bianca Vigna Prosecco 120ml",    ingredients: [{ ingredientId: 45, quantity: 120 }] },
  { id: 23, name: "Taittinger 120ml",               ingredients: [{ ingredientId: 46, quantity: 120 }] },
  // ── Aromatic & Lighter White (150ml / 250ml) ──
  { id: 24, name: "Fiore Moscato 150ml",            ingredients: [{ ingredientId: 47, quantity: 150 }] },
  { id: 25, name: "Fiore Moscato 250ml",            ingredients: [{ ingredientId: 47, quantity: 250 }] },
  { id: 26, name: "Hay Shed Hill Sauv Sem 150ml",   ingredients: [{ ingredientId: 48, quantity: 150 }] },
  { id: 27, name: "Hay Shed Hill Sauv Sem 250ml",   ingredients: [{ ingredientId: 48, quantity: 250 }] },
  { id: 28, name: "Hesketh Sauvignon Blanc 150ml",  ingredients: [{ ingredientId: 49, quantity: 150 }] },
  { id: 29, name: "Hesketh Sauvignon Blanc 250ml",  ingredients: [{ ingredientId: 49, quantity: 250 }] },
  { id: 30, name: "Josef Chromy Riesling 150ml",    ingredients: [{ ingredientId: 50, quantity: 150 }] },
  { id: 31, name: "Josef Chromy Riesling 250ml",    ingredients: [{ ingredientId: 50, quantity: 250 }] },
  { id: 32, name: "Rockburn Pinot Gris 150ml",      ingredients: [{ ingredientId: 51, quantity: 150 }] },
  { id: 33, name: "Rockburn Pinot Gris 250ml",      ingredients: [{ ingredientId: 51, quantity: 250 }] },
  // ── Full Bodied White & Rosé (150ml / 250ml) ──
  { id: 34, name: "Haha Chardonnay 150ml",          ingredients: [{ ingredientId: 52, quantity: 150 }] },
  { id: 35, name: "Haha Chardonnay 250ml",          ingredients: [{ ingredientId: 52, quantity: 250 }] },
  { id: 36, name: "Dalrymple Chardonnay 150ml",     ingredients: [{ ingredientId: 53, quantity: 150 }] },
  { id: 37, name: "Dalrymple Chardonnay 250ml",     ingredients: [{ ingredientId: 53, quantity: 250 }] },
  { id: 38, name: "Maison Saint AIX Rosé 150ml",    ingredients: [{ ingredientId: 54, quantity: 150 }] },
  { id: 39, name: "Maison Saint AIX Rosé 250ml",    ingredients: [{ ingredientId: 54, quantity: 250 }] },
  { id: 40, name: "Santa Cristina Rosé 150ml",      ingredients: [{ ingredientId: 55, quantity: 150 }] },
  { id: 41, name: "Santa Cristina Rosé 250ml",      ingredients: [{ ingredientId: 55, quantity: 250 }] },
  // ── Lighter & Medium Red (150ml / 250ml) ──
  { id: 42, name: "Fickle Mistress Pinot Noir 150ml",  ingredients: [{ ingredientId: 56, quantity: 150 }] },
  { id: 43, name: "Fickle Mistress Pinot Noir 250ml",  ingredients: [{ ingredientId: 56, quantity: 250 }] },
  { id: 44, name: "Torres Tempranillo 150ml",           ingredients: [{ ingredientId: 57, quantity: 150 }] },
  { id: 45, name: "Torres Tempranillo 250ml",           ingredients: [{ ingredientId: 57, quantity: 250 }] },
  { id: 46, name: "Domaine Beaurenard Grenache 150ml",  ingredients: [{ ingredientId: 58, quantity: 150 }] },
  { id: 47, name: "Domaine Beaurenard Grenache 250ml",  ingredients: [{ ingredientId: 58, quantity: 250 }] },
  // ── Full Bodied Red (150ml / 250ml) ──
  { id: 48, name: "Little Berry Cabernet Sauv 150ml",   ingredients: [{ ingredientId: 59, quantity: 150 }] },
  { id: 49, name: "Little Berry Cabernet Sauv 250ml",   ingredients: [{ ingredientId: 59, quantity: 250 }] },
  { id: 50, name: "Langmeil Valley Floor Shiraz 150ml", ingredients: [{ ingredientId: 60, quantity: 150 }] },
  { id: 51, name: "Langmeil Valley Floor Shiraz 250ml", ingredients: [{ ingredientId: 60, quantity: 250 }] },
  { id: 52, name: "Leeuwin Art Series Shiraz 150ml",    ingredients: [{ ingredientId: 61, quantity: 150 }] },
  { id: 53, name: "Leeuwin Art Series Shiraz 250ml",    ingredients: [{ ingredientId: 61, quantity: 250 }] },
  { id: 54, name: "Penfolds Bin 389 150ml",             ingredients: [{ ingredientId: 62, quantity: 150 }] },
  { id: 55, name: "Penfolds Bin 389 250ml",             ingredients: [{ ingredientId: 62, quantity: 250 }] },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const RECIPE_UNITS   = ["ml", "g", "unit", "dash", "tsp", "tbsp"];
const PURCHASE_UNITS = ["bottle", "litre", "kg", "kg bag", "2kg bag", "can", "keg", "bag", "each", "case", "4-pack", "crate", "punnet", "bunch", "jar"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const num     = (v) => parseFloat(v) || 0;
const fmtB    = (unit, qty) => {
  qty = Math.round(num(qty) * 10) / 10;
  if (unit === "ml" && Math.abs(qty) >= 1000) return `${(qty/1000).toFixed(2)}L`;
  if (unit === "g"  && Math.abs(qty) >= 1000) return `${(qty/1000).toFixed(2)}kg`;
  return `${qty}${unit}`;
};
const fmtP    = (unit, qty, dp=2) => `${num(qty).toFixed(dp)} ${unit}`;
const toBase  = (ing, v) => num(v) * num(ing?.purchaseSize);
const toPurch = (ing, v) => num(ing?.purchaseSize) > 0 ? num(v) / num(ing.purchaseSize) : 0;
const dateStr = () => new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STOR_LIB = "bb-lib-v3", STOR_PERIOD = "bb-period-v3";
async function sGet(key) {
  try { const r = await window.storage.get(key); return r?.value ? JSON.parse(r.value) : null; } catch { return null; }
}
async function sSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─── CATEGORY FILTER BAR (module level) ───────────────────────────────────────
function CategoryFilter({ selected, onChange, counts }) {
  const all = ["All", ...CATEGORIES];
  return (
    <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:16, scrollbarWidth:"none" }}>
      <style>{`.cf::-webkit-scrollbar{display:none}`}</style>
      {all.map(cat => {
        const count = cat === "All" ? (counts ? Object.values(counts).reduce((a,b)=>a+b,0) : null) : (counts?.[cat] || 0);
        const active = selected === cat;
        return (
          <button key={cat} onClick={() => onChange(cat)} style={{
            background: active ? "var(--gold)" : "var(--surface2)",
            color: active ? "#0e0e0f" : "var(--text-dim)",
            border: active ? "none" : "1px solid var(--border)",
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".06em",
            padding: "8px 14px", borderRadius: 20, cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s",
          }}>
            {cat}{count !== null && count !== undefined ? ` ${count}` : ""}
          </button>
        );
      })}
    </div>
  );
}

// ─── SEARCH BAR (module level) ─────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position:"relative", marginBottom:10 }}>
      <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-dim)", pointerEvents:"none" }}
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text" placeholder={placeholder || "Search..."} value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
        style={{
          background:"var(--input-bg)", border:"1.5px solid var(--border)",
          color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:13,
          padding:"11px 12px 11px 36px", borderRadius:10, width:"100%", outline:"none",
          WebkitAppearance:"none",
        }}
        onFocus={e => e.target.style.borderColor="var(--gold)"}
        onBlur={e  => e.target.style.borderColor="var(--border)"}
      />
      {value && (
        <button onClick={() => onChange("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--text-dim)", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
      )}
    </div>
  );
}

// ─── NUM INPUT (module level) ─────────────────────────────────────────────────
function NumInput({ value, onChange, placeholder, suffix, sublabel }) {
  return (
    <div style={{ position:"relative" }}>
      <input
        type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
        placeholder={placeholder || "0"} value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
        style={{
          background:"var(--input-bg)", border:"1.5px solid var(--border)",
          color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:15,
          padding:"14px 16px", paddingRight: suffix ? 80 : 16,
          borderRadius:10, width:"100%", outline:"none", transition:"border-color .15s",
          WebkitAppearance:"none",
        }}
        onFocus={e => e.target.style.borderColor="var(--gold)"}
        onBlur={e  => e.target.style.borderColor="var(--border)"}
      />
      {suffix && <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:"var(--text-dim)", pointerEvents:"none", fontFamily:"var(--font-mono)" }}>{suffix}</span>}
      {sublabel && <div style={{ fontSize:11, color:"var(--gold-dim)", marginTop:4, paddingLeft:2 }}>{sublabel}</div>}
    </div>
  );
}

// ─── TEXT INPUT (module level) ─────────────────────────────────────────────────
function TextInput({ value, onChange, placeholder }) {
  return (
    <input type="text" placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      autoComplete="off" autoCorrect="off" autoCapitalize="words" spellCheck={false}
      style={{ background:"var(--input-bg)", border:"1.5px solid var(--border)", color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:15, padding:"14px 16px", borderRadius:10, width:"100%", outline:"none", WebkitAppearance:"none" }}
      onFocus={e => e.target.style.borderColor="var(--gold)"}
      onBlur={e  => e.target.style.borderColor="var(--border)"}
    />
  );
}

// ─── SELECT (module level) ─────────────────────────────────────────────────────
function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ background:"var(--input-bg)", border:"1.5px solid var(--border)", color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:15, padding:"14px 16px", borderRadius:10, width:"100%", outline:"none", appearance:"none", WebkitAppearance:"none", cursor:"pointer" }}
      onFocus={e => e.target.style.borderColor="var(--gold)"}
      onBlur={e  => e.target.style.borderColor="var(--border)"}
    >{children}</select>
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  home:     () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  stock:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  order:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.67l1.62-9.33H6"/></svg>,
  variance: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  setup:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  trash:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  alert:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function BarBuddy() {
  const [tab,      setTab]      = useState("home");
  const [subTab,   setSubTab]   = useState("ingredients"); // Setup sub-tabs
  const [varTab,   setVarTab]   = useState("sales");       // Variance sub-tabs: sales | results
  const [loaded, setLoaded] = useState(false);
  const [toast,  setToast]  = useState("");
  const [modal,  setModal]  = useState(null);

  // Library
  const [ingredients, setIngredients] = useState(SEED_INGREDIENTS);
  const [recipes,     setRecipes]     = useState(SEED_RECIPES);

  // Period
  const [openingStock, setOpeningStock] = useState({});
  const [deliveries,   setDeliveries]   = useState({});
  const [monthlySales, setMonthlySales] = useState({});
  const [weeklyLog,    setWeeklyLog]    = useState([]);
  const [closingStock, setClosingStock] = useState({});
  const [monthStart,   setMonthStart]   = useState("");
  const [weekNum,      setWeekNum]      = useState(1);

  // Transient
  const [weekSales, setWeekSales] = useState({});
  const [newIng,    setNewIng]    = useState({ name:"", category:"Spirits", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:"", par:"" });
  const [newRec,    setNewRec]    = useState({ name:"", ings:[] });
  const [newRI,     setNewRI]     = useState({ ingredientId:"", quantity:"" });
  const [csvError,  setCsvError]  = useState("");

  // Edit state
  const [editIngId,  setEditIngId]  = useState(null); // id of ingredient being edited
  const [editIng,    setEditIng]    = useState({});    // edit form values
  const [editRecId,  setEditRecId]  = useState(null); // id of recipe being edited

  // Filter / search state — one set per screen
  // Stock page: stockCat + stockSearch shared across Opening Stock & Deliveries sub-tabs
  const [stockCat,    setStockCat]    = useState("All");
  const [stockSearch, setStockSearch] = useState("");
  const [orderCat,    setOrderCat]    = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [varCat,      setVarCat]      = useState("All");
  const [varSearch,   setVarSearch]   = useState("");
  const [libCat,      setLibCat]      = useState("All");
  const [libSearch,   setLibSearch]   = useState("");
  const [recSearch,   setRecSearch]   = useState(""); // recipe builder ingredient search

  const saveTimer = useRef(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Scroll to top whenever main tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  // ── LOAD ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const lib = await sGet(STOR_LIB);
      if (lib?.ingredients) setIngredients(lib.ingredients);
      if (lib?.recipes)     setRecipes(lib.recipes);
      const p = await sGet(STOR_PERIOD);
      if (p) {
        if (p.openingStock) setOpeningStock(p.openingStock);
        if (p.deliveries)   setDeliveries(p.deliveries);
        if (p.monthlySales) setMonthlySales(p.monthlySales);
        if (p.weeklyLog)    setWeeklyLog(p.weeklyLog);
        if (p.closingStock) setClosingStock(p.closingStock);
        if (p.monthStart)   setMonthStart(p.monthStart);
        if (p.weekNum)      setWeekNum(p.weekNum);
      }
      setLoaded(true);
    })();
  }, []);

  const saveLib    = (ings, recs) => sSet(STOR_LIB, { ingredients:ings, recipes:recs });
  const savePeriod = (snap) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => sSet(STOR_PERIOD, snap), 600);
  };
  const periodSnap = (o={}) => ({ openingStock, deliveries, monthlySales, weeklyLog, closingStock, monthStart, weekNum, ...o });

  // ── FILTER HELPER ─────────────────────────────────────────────────────────
  const filterIngs = (ings, cat, search) =>
    ings.filter(i =>
      (cat === "All" || i.category === cat) &&
      (search === "" || i.name.toLowerCase().includes(search.toLowerCase()))
    );

  // Category counts for a given ingredient list
  const catCounts = (ings) => {
    const counts = {};
    ings.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1; });
    return counts;
  };

  // ── MATHS ─────────────────────────────────────────────────────────────────
  const calcUsage = useCallback(() => {
    const u = {}; ingredients.forEach(i => { u[i.id]=0; });
    Object.entries(monthlySales).forEach(([rid,qty]) => {
      const r = recipes.find(x => x.id===parseInt(rid));
      if (!r||!qty) return;
      r.ingredients.forEach(({ingredientId,quantity}) => { u[ingredientId]=(u[ingredientId]||0)+quantity*num(qty); });
    });
    return u;
  }, [monthlySales, recipes, ingredients]);

  const calcTheoClose = useCallback(() => {
    const u = calcUsage(); const res = {};
    ingredients.forEach(ing => { res[ing.id]=toBase(ing,openingStock[ing.id])+toBase(ing,deliveries[ing.id])-(u[ing.id]||0); });
    return res;
  }, [openingStock, deliveries, calcUsage, ingredients]);

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  const logWeek = () => {
    const label = `Week ${weekNum} — ${dateStr()}`;
    const updSales = {...monthlySales};
    Object.entries(weekSales).forEach(([rid,qty]) => {
      if (!qty||num(qty)===0) return;
      updSales[rid] = String(num(updSales[rid]||0)+num(qty));
    });
    const updLog = [...weeklyLog, {label, weekOf:dateStr(), sales:{...weekSales}}];
    const newWk = weekNum+1;
    setMonthlySales(updSales); setWeeklyLog(updLog); setWeekNum(newWk); setWeekSales({});
    setModal(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    sSet(STOR_PERIOD, periodSnap({monthlySales:updSales, weeklyLog:updLog, weekNum:newWk}));
    showToast(`${label} logged`);
  };

  const doNewMonth = () => {
    const tc = calcTheoClose(); const newOp = {};
    ingredients.forEach(ing => {
      const has = closingStock[String(ing.id)]!==undefined && closingStock[String(ing.id)]!=="";
      newOp[String(ing.id)] = has ? String(num(closingStock[String(ing.id)])) : String(Math.max(0,toPurch(ing,tc[ing.id]??0)));
    });
    const ns = dateStr();
    setOpeningStock(newOp); setDeliveries({}); setMonthlySales({}); setWeeklyLog([]);
    setClosingStock({}); setWeekSales({}); setWeekNum(1); setMonthStart(ns);
    setModal(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    sSet(STOR_PERIOD, {openingStock:newOp,deliveries:{},monthlySales:{},weeklyLog:[],closingStock:{},monthStart:ns,weekNum:1});
    showToast("New month started");
  };

  const doReset = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIngredients(SEED_INGREDIENTS); setRecipes(SEED_RECIPES);
    setOpeningStock({}); setDeliveries({}); setMonthlySales({}); setWeeklyLog([]);
    setClosingStock({}); setWeekSales({}); setWeekNum(1); setMonthStart("");
    await sSet(STOR_LIB,    {ingredients:SEED_INGREDIENTS,recipes:SEED_RECIPES});
    await sSet(STOR_PERIOD, {openingStock:{},deliveries:{},monthlySales:{},weeklyLog:[],closingStock:{},monthStart:"",weekNum:1});
    setModal(null); showToast("Reset to demo data");
  };

  const handleCSV = (e) => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const lines=ev.target.result.trim().split("\n"); const upd={...weekSales}; const errs=[];
      lines.forEach((line,i)=>{
        if(i===0&&line.toLowerCase().includes("drink")) return;
        const [name,qty]=line.split(",").map(s=>s.trim());
        if(!name||!qty) return;
        const r=recipes.find(x=>x.name.toLowerCase()===name.toLowerCase());
        if(!r){errs.push(name);return;}
        upd[r.id]=String(num(upd[r.id]||0)+num(qty));
      });
      setWeekSales(upd);
      errs.length ? setCsvError(`Unmatched: ${errs.join(", ")}`) : (setCsvError(""),showToast("CSV loaded"));
    };
    reader.readAsText(file);
  };

  // ── DERIVED ───────────────────────────────────────────────────────────────
  const usage        = calcUsage();
  const theoClose    = calcTheoClose();
  const totalMonthly = Object.values(monthlySales).reduce((a,b)=>a+num(b),0);
  const weekTotal    = Object.values(weekSales).reduce((a,b)=>a+num(b),0);
  const orderSugs    = ingredients.map(ing=>({
    ...ing,
    remP: toPurch(ing, theoClose[ing.id]??0),
    toOrder: Math.max(0, Math.ceil(ing.par - toPurch(ing, theoClose[ing.id]??0))),
  }));
  const orderItems   = orderSugs.filter(i=>i.toOrder>0);
  const topUsed      = [...ingredients].filter(i=>(usage[i.id]||0)>0)
    .sort((a,b)=>toPurch(b,usage[b.id]||0)-toPurch(a,usage[a.id]||0)).slice(0,4);

  if (!loaded) return (
    <div style={{minHeight:"100vh",background:"#0e0e0f",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:32,fontWeight:700,color:"#c9a96e"}}>Bar Buddy</div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
      <div style={{width:32,height:2,background:"#c9a96e",borderRadius:2,animation:"pulse 1s ease-in-out infinite"}}/>
    </div>
  );

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:wght@400;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
    :root {
      --gold:#c9a96e; --gold-dim:#7a6340; --gold-bg:#c9a96e12;
      --green:#4ade80; --green-bg:#4ade8012;
      --red:#f87171; --red-bg:#f8717112;
      --blue:#7dd3fc; --blue-bg:#7dd3fc12;
      --bg:#0e0e0f; --surface:#161618; --surface2:#1e1e21;
      --border:#2a2a2e; --border-light:#333338;
      --text:#f0ece4; --text-mid:#9a9590; --text-dim:#55524e;
      --input-bg:#111113;
      --font-serif:'Cormorant Garant',Georgia,serif;
      --font-mono:'IBM Plex Mono','Courier New',monospace;
      --radius:14px; --radius-sm:10px; --nav-h:72px;
    }
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:2px}
    .page{padding:16px 16px;padding-bottom:calc(var(--nav-h) + 20px);max-width:600px;margin:0 auto}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px}
    .card+.card{margin-top:10px}
    .sect{font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-dim);margin-bottom:10px;display:block}
    .row{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--border)}
    .row:last-child{border-bottom:none}.row:first-child{padding-top:0}
    .tag  {display:inline-flex;align-items:center;gap:4px;background:var(--gold-bg); color:var(--gold); font-family:var(--font-mono);font-size:10px;padding:4px 10px;border-radius:20px}
    .tag-g{display:inline-flex;align-items:center;gap:4px;background:var(--green-bg);color:var(--green);font-family:var(--font-mono);font-size:10px;padding:4px 10px;border-radius:20px}
    .tag-r{display:inline-flex;align-items:center;gap:4px;background:var(--red-bg);  color:var(--red);  font-family:var(--font-mono);font-size:10px;padding:4px 10px;border-radius:20px}
    .tag-b{display:inline-flex;align-items:center;gap:4px;background:var(--blue-bg); color:var(--blue); font-family:var(--font-mono);font-size:10px;padding:4px 10px;border-radius:20px}
    .tag-d{display:inline-flex;align-items:center;gap:4px;background:#ffffff08;color:var(--text-dim);font-family:var(--font-mono);font-size:10px;padding:4px 10px;border-radius:20px}
    .tag-cat{display:inline-block;background:var(--surface2);border:1px solid var(--border);color:var(--text-dim);font-family:var(--font-mono);font-size:9px;padding:2px 8px;border-radius:10px;letter-spacing:.06em}
    .btn-primary{background:var(--gold);color:#0e0e0f;font-family:var(--font-mono);font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;padding:15px 24px;border-radius:var(--radius-sm);border:none;cursor:pointer;width:100%}
    .btn-primary:hover{background:#d9ba7f}
    .btn-secondary{background:transparent;color:var(--gold);font-family:var(--font-mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:14px 24px;border-radius:var(--radius-sm);border:1.5px solid var(--gold);cursor:pointer}
    .btn-secondary:hover{background:var(--gold-bg)}
    .btn-blue{background:transparent;color:var(--blue);font-family:var(--font-mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:14px 24px;border-radius:var(--radius-sm);border:1.5px solid var(--blue);cursor:pointer}
    .btn-blue:hover{background:var(--blue-bg)}
    .btn-ghost{background:transparent;border:none;color:var(--red);font-family:var(--font-mono);font-size:11px;cursor:pointer;padding:8px 4px;opacity:.7}
    .btn-ghost:hover{opacity:1}
    .btn-icon{background:var(--surface2);border:1px solid var(--border);color:var(--text-mid);border-radius:8px;padding:8px;cursor:pointer;display:flex;align-items:center;justify-content:center}
    .btn-icon:hover{border-color:var(--border-light);color:var(--text)}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
    .pill{display:inline-flex;background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:3px 10px;font-family:var(--font-mono);font-size:10px;color:var(--text-dim)}
    .hr{border:none;border-top:1px solid var(--border);margin:14px 0}
    .nav{position:fixed;bottom:0;left:0;right:0;height:var(--nav-h);background:var(--surface);border-top:1px solid var(--border);display:flex;align-items:stretch;z-index:50;padding-bottom:env(safe-area-inset-bottom)}
    .nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;border:none;background:none;color:var(--text-dim);transition:color .15s;padding:8px 0}
    .nav-item.active{color:var(--gold)}
    .nav-item span{font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase}
    .header{padding:16px 16px 0;max-width:600px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
    .overlay{position:fixed;inset:0;background:#000000cc;z-index:100;display:flex;align-items:flex-end;justify-content:center}
    .sheet{background:var(--surface);border-radius:20px 20px 0 0;padding:24px 20px 40px;width:100%;max-width:600px}
    .sheet-handle{width:36px;height:4px;background:var(--border-light);border-radius:2px;margin:0 auto 18px}
    .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--surface2);border:1px solid var(--border-light);color:var(--text);font-family:var(--font-mono);font-size:12px;padding:12px 20px;border-radius:var(--radius-sm);z-index:200;white-space:nowrap;box-shadow:0 8px 32px #00000060}
    .cbar{background:var(--input-bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;font-family:var(--font-mono);font-size:11px;color:var(--text-dim);margin-top:8px;line-height:1.6}
    .cbar b{color:var(--gold);font-weight:400}
    .alert-banner{background:linear-gradient(135deg,#c9a96e18,#c9a96e08);border:1px solid var(--gold-dim);border-radius:var(--radius);padding:18px}
    .field{margin-bottom:14px}
    .field-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;display:block}
    .subtabs{display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:18px}
    .subtab{background:none;border:none;cursor:pointer;font-family:var(--font-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:10px 16px;color:var(--text-dim);border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap}
    .subtab.on{color:var(--gold);border-bottom-color:var(--gold)}
    .wk{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:8px}
    .no-results{text-align:center;padding:32px 16px;color:var(--text-dim);font-size:13px}
  `;

  const navItems = [
    { id:"home",     label:"Home",    icon:Icon.home },
    { id:"stock",    label:"Stock",   icon:Icon.stock },
    { id:"orders",   label:"Orders",  icon:Icon.order },
    { id:"variance", label:"Variance",icon:Icon.variance },
    { id:"setup",    label:"Setup",   icon:Icon.setup },
  ];

  return (
    <div style={{background:"var(--bg)",minHeight:"100vh",fontFamily:"var(--font-mono)",color:"var(--text)"}}>
      <style>{css}</style>

      {/* HEADER */}
      <div className="header">
        <div>
          <div style={{fontFamily:"var(--font-serif)",fontSize:26,fontWeight:700,color:"var(--gold)",lineHeight:1}}>Bar Buddy</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-dim)",letterSpacing:".15em",textTransform:"uppercase",marginTop:3}}>
            {monthStart ? `Month from ${monthStart} · Wk ${weekNum}` : "Set up your opening stock to begin"}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {weekTotal>0&&<button className="tag" style={{cursor:"pointer",border:"none"}} onClick={()=>setModal("logWeek")}>Log Wk {weekNum}</button>}
          <button className="btn-blue" style={{padding:"10px 14px",fontSize:11}} onClick={()=>setModal("newMonth")}>New Month</button>
        </div>
      </div>

      {/* ══ HOME ══ */}
      {tab==="home" && (
        <div className="page">
          {orderItems.length>0 ? (
            <div className="alert-banner" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--gold)"}}>
                  <Icon.alert/>
                  <span style={{fontFamily:"var(--font-serif)",fontSize:18,fontWeight:600}}>Order Needed</span>
                </div>
                <span className="tag">{orderItems.length} item{orderItems.length!==1?"s":""}</span>
              </div>
              {orderItems.slice(0,5).map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                  <div>
                    <span style={{fontSize:14}}>{item.name}</span>
                    <span className="tag-cat" style={{marginLeft:8}}>{item.category}</span>
                  </div>
                  <span style={{fontFamily:"var(--font-serif)",fontSize:18,fontWeight:600,color:"var(--gold)"}}>{item.toOrder} <span style={{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:400}}>{item.purchaseUnit}{item.toOrder!==1?"s":""}</span></span>
                </div>
              ))}
              {orderItems.length>5&&<div style={{fontSize:11,color:"var(--text-dim)",padding:"8px 0"}}>+{orderItems.length-5} more items...</div>}
              <button className="btn-primary" style={{marginTop:14}} onClick={()=>setTab("orders")}>View Full Order Report</button>
            </div>
          ):(
            <div className="card" style={{marginBottom:10,borderColor:"var(--green-bg)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"var(--green)",fontSize:20}}>✓</span>
                <div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:16,fontWeight:600,color:"var(--green)"}}>All Stock Above Par</div>
                  <div style={{fontSize:11,color:"var(--text-dim)",marginTop:2}}>No orders needed this week</div>
                </div>
              </div>
            </div>
          )}
          <div className="g3" style={{marginBottom:10}}>
            {[{l:"Ingredients",v:ingredients.length},{l:"Sales",v:totalMonthly},{l:"Week",v:weekNum}].map(s=>(
              <div key={s.l} className="card" style={{textAlign:"center",padding:"14px 8px"}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:28,fontWeight:700,color:"var(--gold)",lineHeight:1}}>{s.v}</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--text-dim)",letterSpacing:".12em",textTransform:"uppercase",marginTop:4}}>{s.l}</div>
              </div>
            ))}
          </div>
          {topUsed.length>0&&(
            <div className="card" style={{marginBottom:10}}>
              <span className="sect">Top Usage This Month</span>
              {topUsed.map(ing=>(
                <div key={ing.id} className="row">
                  <div>
                    <span style={{fontSize:14}}>{ing.name}</span>
                    <span className="tag-cat" style={{marginLeft:8}}>{ing.category}</span>
                  </div>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--gold)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,usage[ing.id]||0))}</span>
                </div>
              ))}
            </div>
          )}
          <div className="card">
            <span className="sect">Workflow</span>
            {[["Monthly","var(--blue)","Physical count → Opening Stock"],["Weekly","var(--gold)","Update deliveries → log sales → check Orders"],["Monthly","var(--blue)","Closing count → Variance → New Month"]].map(([c,col,t],i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:i<2?10:0,alignItems:"flex-start"}}>
                <span style={{color:col,fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:".12em",textTransform:"uppercase",minWidth:52,paddingTop:2}}>{c}</span>
                <span style={{fontSize:12,color:"var(--text-mid)",lineHeight:1.5}}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:14}}>
            <button className="btn-ghost" onClick={()=>setModal("reset")}>Reset app to demo data</button>
          </div>
        </div>
      )}

      {/* ══ STOCK ══ */}
      {tab==="stock" && (
        <div className="page">
          {/* Shared search + filter across all three stock sections */}
          <SearchBar value={stockSearch} onChange={setStockSearch} placeholder="Search ingredients..." />
          <CategoryFilter selected={stockCat} onChange={setStockCat} counts={catCounts(ingredients)} />

          {/* ── Opening Stock ── */}
          <div className="card" style={{marginBottom:10,borderColor:"#7dd3fc22"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:20,fontWeight:600,color:"var(--blue)"}}>Opening Stock</div>
              <span className="tag-b">Monthly</span>
            </div>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:14,lineHeight:1.5}}>Enter once per month after your physical count.</div>
            {(() => {
              const filtered = filterIngs(ingredients, stockCat, stockSearch);
              return filtered.length===0
                ? <div className="no-results">No ingredients match</div>
                : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {filtered.map(ing=>(
                      <div key={ing.id}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <label className="field-label" style={{margin:0}}>{ing.name}</label>
                          <span className="tag-cat">{ing.category}</span>
                        </div>
                        <NumInput
                          value={openingStock[String(ing.id)]??""}
                          suffix={`${ing.purchaseUnit}s`}
                          placeholder="0"
                          sublabel={openingStock[String(ing.id)] ? `= ${fmtB(ing.recipeUnit,toBase(ing,openingStock[String(ing.id)]))}` : ""}
                          onChange={val=>{
                            if(!monthStart) setMonthStart(dateStr());
                            setOpeningStock(prev=>{const u={...prev,[String(ing.id)]:val};savePeriod(periodSnap({openingStock:u}));return u;});
                          }}
                        />
                      </div>
                    ))}
                  </div>;
            })()}
          </div>

          {/* ── Deliveries ── */}
          <div className="card" style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:20,fontWeight:600,color:"var(--gold)"}}>Deliveries</div>
              <span className="tag">Running total</span>
            </div>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:14,lineHeight:1.5}}>Increase as stock arrives throughout the month.</div>
            {(() => {
              const filtered = filterIngs(ingredients, stockCat, stockSearch);
              return filtered.length===0
                ? <div className="no-results">No ingredients match</div>
                : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {filtered.map(ing=>(
                      <div key={ing.id}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <label className="field-label" style={{margin:0}}>{ing.name}</label>
                          <span className="tag-cat">{ing.category}</span>
                        </div>
                        <NumInput
                          value={deliveries[String(ing.id)]??""}
                          suffix={`${ing.purchaseUnit}s`}
                          placeholder="0"
                          sublabel={deliveries[String(ing.id)] ? `= ${fmtB(ing.recipeUnit,toBase(ing,deliveries[String(ing.id)]))}` : ""}
                          onChange={val=>{
                            setDeliveries(prev=>{const u={...prev,[String(ing.id)]:val};savePeriod(periodSnap({deliveries:u}));return u;});
                          }}
                        />
                      </div>
                    ))}
                  </div>;
            })()}
          </div>

          {/* ── Closing Stock ── */}
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:20,fontWeight:600,color:"var(--blue)"}}>Closing Stock</div>
              <span className="tag-b">Monthly</span>
            </div>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:14,lineHeight:1.5}}>Enter at month end. Used for variance report and next month's opening stock.</div>
            {(() => {
              const filtered = filterIngs(ingredients, stockCat, stockSearch);
              return filtered.length===0
                ? <div className="no-results">No ingredients match</div>
                : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {filtered.map(ing=>(
                      <div key={ing.id}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <label className="field-label" style={{margin:0}}>{ing.name}</label>
                          <span className="tag-cat">{ing.category}</span>
                        </div>
                        <NumInput
                          value={closingStock[String(ing.id)]??""}
                          suffix={`${ing.purchaseUnit}s`}
                          placeholder="e.g. 1.5"
                          sublabel={closingStock[String(ing.id)] ? `= ${fmtB(ing.recipeUnit,toBase(ing,closingStock[String(ing.id)]))}` : ""}
                          onChange={val=>{
                            setClosingStock(prev=>{const u={...prev,[String(ing.id)]:val};savePeriod(periodSnap({closingStock:u}));return u;});
                          }}
                        />
                      </div>
                    ))}
                  </div>;
            })()}
            {ingredients.some(i=>closingStock[String(i.id)]!==undefined&&closingStock[String(i.id)]!=="") && (
              <button className="btn-blue" style={{width:"100%",marginTop:20}} onClick={()=>{ setTab("variance"); setVarTab("results"); }}>
                View Variance Results →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ ORDERS ══ */}
      {tab==="orders" && (
        <div className="page">
          <div className="card" style={{marginBottom:10,borderColor:"#c9a96e44"}}>
            <div style={{fontFamily:"var(--font-serif)",fontSize:22,fontWeight:700,color:"var(--gold)",marginBottom:4}}>Order Suggestion</div>
            <div style={{fontSize:12,color:"var(--text-dim)",lineHeight:1.6}}>Opening + deliveries − sales = remaining → vs par → order in whole units</div>
            {weekTotal>0&&<div style={{marginTop:10,fontSize:11,color:"#fb923c",background:"#fb923c0a",border:"1px solid #fb923c22",borderRadius:10,padding:"10px 14px"}}>⚠ {weekTotal} drinks not yet logged this week</div>}
          </div>

          <SearchBar value={orderSearch} onChange={setOrderSearch} placeholder="Search ingredients..." />
          <CategoryFilter
            selected={orderCat} onChange={setOrderCat}
            counts={(() => { const c={}; orderSugs.forEach(i=>{c[i.category]=(c[i.category]||0)+1;}); return c; })()}
          />

          {(() => {
            const filtered = filterIngs(orderSugs, orderCat, orderSearch);
            return filtered.length===0
              ? <div className="no-results">No ingredients match</div>
              : filtered.map(ing=>{
                const ob=toBase(ing,openingStock[String(ing.id)]);
                const db=toBase(ing,deliveries[String(ing.id)]);
                const ub=usage[ing.id]||0;
                const rb=ob+db-ub;
                return (
                  <div key={ing.id} className="card" style={{marginBottom:8,borderColor:ing.toOrder>0?"var(--gold-dim)":"var(--border)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1,paddingRight:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                          <span style={{fontFamily:"var(--font-serif)",fontSize:16,fontWeight:600}}>{ing.name}</span>
                          <span className="tag-cat">{ing.category}</span>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:3,fontSize:11,color:"var(--text-dim)",fontFamily:"var(--font-mono)"}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span>Opening</span><span style={{color:"var(--text-mid)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,ob))}</span></div>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span>Delivered</span><span style={{color:"var(--text-mid)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,db))}</span></div>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span>Used</span><span style={{color:"var(--text-mid)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,ub))}</span></div>
                          <div style={{borderTop:"1px solid var(--border)",marginTop:3,paddingTop:3,display:"flex",justifyContent:"space-between"}}>
                            <span>Remaining</span><span style={{color:"var(--text)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,rb))}</span>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span>Par</span><span style={{color:"var(--text)"}}>{ing.par} {ing.purchaseUnit}s</span></div>
                        </div>
                      </div>
                      <div style={{textAlign:"right",minWidth:80}}>
                        {ing.toOrder>0?(
                          <div style={{background:"var(--gold-bg)",border:"1px solid var(--gold-dim)",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                            <div style={{fontFamily:"var(--font-serif)",fontSize:30,fontWeight:700,color:"var(--gold)",lineHeight:1}}>{ing.toOrder}</div>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--gold)",marginTop:2}}>{ing.purchaseUnit}{ing.toOrder!==1?"s":""}</div>
                          </div>
                        ):<span className="tag-g"><Icon.check/> Par</span>}
                      </div>
                    </div>
                  </div>
                );
              });
          })()}
        </div>
      )}

      {/* ══ VARIANCE ══ */}
      {tab==="variance" && (
        <div className="page">
          <div className="subtabs">
            <button className={`subtab ${varTab==="sales"?"on":""}`} onClick={()=>setVarTab("sales")}>
              Sales{weekTotal>0?` (${weekTotal})`:""}</button>
            <button className={`subtab ${varTab==="results"?"on":""}`} onClick={()=>setVarTab("results")}>
              Results{ingredients.some(i=>closingStock[String(i.id)]!==undefined&&closingStock[String(i.id)]!=="")?" ●":""}
            </button>
          </div>

          {/* ── Sales ── */}
          {varTab==="sales" && (
            <div>
              <div className="card" style={{marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:20,fontWeight:600,color:"var(--gold)"}}>Week {weekNum} Sales</div>
                  <span className="tag-d">Not logged</span>
                </div>
                <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:14,lineHeight:1.5}}>Enter this week's sales then log them to add to the monthly total.</div>
                <div style={{marginBottom:14}}>
                  <label className="field-label">Import CSV from POS</label>
                  <div style={{fontSize:11,color:"var(--text-dim)",marginBottom:8}}>Format: DrinkName, Quantity</div>
                  <input type="file" accept=".csv" style={{color:"var(--text-mid)",fontSize:12,fontFamily:"var(--font-mono)"}} onChange={handleCSV} />
                  {csvError&&<div style={{color:"var(--red)",fontSize:11,marginTop:6}}>{csvError}</div>}
                </div>
                <hr className="hr"/>
                <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
                  {recipes.map(recipe=>(
                    <div key={recipe.id}>
                      <label className="field-label">{recipe.name}</label>
                      <input type="text" inputMode="decimal" placeholder="0 sold"
                        autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
                        value={weekSales[recipe.id]??""}
                        onChange={e=>setWeekSales(prev=>({...prev,[recipe.id]:e.target.value}))}
                        style={{background:"var(--input-bg)",border:"1.5px solid var(--border)",color:"var(--text)",fontFamily:"var(--font-mono)",fontSize:15,padding:"14px 16px",borderRadius:10,width:"100%",outline:"none",WebkitAppearance:"none"}}
                        onFocus={e=>e.target.style.borderColor="var(--gold)"}
                        onBlur={e=>e.target.style.borderColor="var(--border)"}
                      />
                    </div>
                  ))}
                  {recipes.length===0&&<div style={{fontSize:13,color:"var(--text-dim)"}}>Add recipes in Setup first.</div>}
                </div>
                {weekTotal>0&&<button className="btn-primary" onClick={()=>setModal("logWeek")}>Log Week {weekNum} — {weekTotal} drinks</button>}
              </div>
              {weeklyLog.length>0&&(
                <div className="card">
                  <span className="sect">Monthly Sales Log</span>
                  {weeklyLog.map((entry,i)=>(
                    <div key={i} className="wk">
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{fontSize:12,color:"var(--text-mid)"}}>{entry.label}</span>
                        <span style={{fontSize:11,color:"var(--text-dim)"}}>{Object.values(entry.sales).reduce((a,b)=>a+num(b),0)} drinks</span>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {Object.entries(entry.sales).filter(([,v])=>num(v)>0).map(([rid,qty])=>{
                          const r=recipes.find(x=>x.id===parseInt(rid));
                          return r?<span key={rid} className="tag">{r.name}: {qty}</span>:null;
                        })}
                      </div>
                    </div>
                  ))}
                  <div style={{fontSize:11,color:"var(--text-dim)",paddingTop:10,borderTop:"1px solid var(--border)"}}>
                    Monthly total: <span style={{color:"var(--gold)"}}>{totalMonthly} drinks</span> across {weeklyLog.length} week{weeklyLog.length!==1?"s":""}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Variance Results ── */}
          {varTab==="results" && (
            <div>
              {!ingredients.some(i=>closingStock[String(i.id)]!==undefined&&closingStock[String(i.id)]!=="") ? (
                <div className="card">
                  <div className="no-results" style={{padding:"40px 16px"}}>
                    <div style={{marginBottom:8}}>No closing counts entered yet</div>
                    <div style={{fontSize:11,color:"var(--text-dim)",marginBottom:16}}>Enter closing stock on the Stock page first</div>
                    <button className="btn-secondary" style={{margin:"0 auto",display:"block"}} onClick={()=>setTab("stock")}>
                      Go to Stock →
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <SearchBar value={varSearch} onChange={setVarSearch} placeholder="Search ingredients..." />
                  <CategoryFilter selected={varCat} onChange={setVarCat} counts={catCounts(ingredients)} />
                  {filterIngs(ingredients, varCat, varSearch)
                    .filter(item=>closingStock[String(item.id)]!==undefined&&closingStock[String(item.id)]!=="")
                    .map(item=>{
                      const tP  = toPurch(item, theoClose[item.id]??0);
                      const aP  = num(closingStock[String(item.id)]);
                      const vP  = aP - tP;
                      const pct = tP!==0 ? ((vP/tP)*100).toFixed(1) : "—";
                      const isNeg = vP < -0.1, isPos = vP > 0.1;
                      return (
                        <div key={item.id} className="card" style={{marginBottom:8,borderColor:isNeg?"var(--red-bg)":isPos?"var(--green-bg)":"var(--border)"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                                <span style={{fontFamily:"var(--font-serif)",fontSize:15,fontWeight:600}}>{item.name}</span>
                                <span className="tag-cat">{item.category}</span>
                              </div>
                              {/* Bottle quantities — prominent */}
                              <div style={{display:"flex",flexDirection:"column",gap:3,fontSize:11,fontFamily:"var(--font-mono)"}}>
                                <div style={{display:"flex",justifyContent:"space-between",color:"var(--text-dim)"}}>
                                  <span>Theoretical</span>
                                  <span style={{color:"var(--text-mid)"}}>{fmtP(item.purchaseUnit, tP)} {item.purchaseUnit}s</span>
                                </div>
                                <div style={{display:"flex",justifyContent:"space-between",color:"var(--text-dim)"}}>
                                  <span>Actual count</span>
                                  <span style={{color:"var(--text)"}}>{fmtP(item.purchaseUnit, aP)} {item.purchaseUnit}s</span>
                                </div>
                                <div style={{display:"flex",justifyContent:"space-between",paddingTop:4,marginTop:2,borderTop:"1px solid var(--border)",color:"var(--text-dim)"}}>
                                  <span>Difference</span>
                                  <span style={{color:isNeg?"var(--red)":isPos?"var(--green)":"var(--text-dim)",fontWeight:500}}>
                                    {vP>0?"+":""}{fmtP(item.purchaseUnit, vP)} {item.purchaseUnit}s
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div style={{textAlign:"right",minWidth:70,paddingTop:22}}>
                              <div style={{fontFamily:"var(--font-serif)",fontSize:26,fontWeight:700,color:isNeg?"var(--red)":isPos?"var(--green)":"var(--text-dim)",lineHeight:1}}>
                                {vP>0?"+":""}{Math.abs(vP).toFixed(2)}
                              </div>
                              <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-dim)",marginTop:2}}>{item.purchaseUnit}s</div>
                              <div style={{fontSize:10,color:"var(--text-dim)",marginTop:2}}>{pct}%</div>
                              <div style={{marginTop:6}}>
                                {isNeg&&<span className="tag-r">Investigate ⚠</span>}
                                {isPos&&<span className="tag-g">Surplus</span>}
                                {!isNeg&&!isPos&&<span className="tag-d">On Track</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  <div style={{marginTop:14}}>
                    <button className="btn-blue" style={{width:"100%"}} onClick={()=>setModal("newMonth")}>Close Month & Roll Over →</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ SETUP ══ */}
      {tab==="setup" && (
        <div className="page">
          <div className="subtabs">
            <button className={`subtab ${subTab==="ingredients"?"on":""}`} onClick={()=>setSubTab("ingredients")}>Ingredients</button>
            <button className={`subtab ${subTab==="recipes"?"on":""}`} onClick={()=>setSubTab("recipes")}>Recipes</button>
          </div>

          {subTab==="ingredients" && (
            <div>
              <div className="card" style={{marginBottom:10}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:18,fontWeight:600,color:"var(--gold)",marginBottom:16}}>Add Ingredient</div>
                <div className="field">
                  <label className="field-label">Name</label>
                  <TextInput placeholder="e.g. Aperol" value={newIng.name} onChange={v=>setNewIng(p=>({...p,name:v}))} />
                </div>
                <div className="field">
                  <label className="field-label">Category</label>
                  <Select value={newIng.category} onChange={v=>setNewIng(p=>({...p,category:v}))}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div className="g2" style={{marginBottom:14}}>
                  <div>
                    <label className="field-label">Recipe Unit</label>
                    <Select value={newIng.recipeUnit} onChange={v=>setNewIng(p=>({...p,recipeUnit:v}))}>
                      {RECIPE_UNITS.map(u=><option key={u}>{u}</option>)}
                    </Select>
                  </div>
                  <div>
                    <label className="field-label">Purchase Unit</label>
                    <Select value={newIng.purchaseUnit} onChange={v=>setNewIng(p=>({...p,purchaseUnit:v}))}>
                      {PURCHASE_UNITS.map(u=><option key={u}>{u}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="g2" style={{marginBottom:14}}>
                  <div>
                    <label className="field-label">{newIng.recipeUnit} per {newIng.purchaseUnit}</label>
                    <NumInput value={newIng.purchaseSize} placeholder="e.g. 700" onChange={v=>setNewIng(p=>({...p,purchaseSize:v}))} />
                  </div>
                  <div>
                    <label className="field-label">Par ({newIng.purchaseUnit}s)</label>
                    <NumInput value={newIng.par} placeholder="e.g. 6" onChange={v=>setNewIng(p=>({...p,par:v}))} />
                  </div>
                </div>
                {newIng.purchaseSize&&newIng.par&&(
                  <div className="cbar">1 <b>{newIng.purchaseUnit}</b> = <b>{newIng.purchaseSize}{newIng.recipeUnit}</b><br/>Par = <b>{newIng.par} {newIng.purchaseUnit}s</b> = <b>{(num(newIng.par)*num(newIng.purchaseSize)).toLocaleString()}{newIng.recipeUnit}</b></div>
                )}
                <button className="btn-primary" style={{marginTop:14}} onClick={()=>{
                  if(!newIng.name||!newIng.purchaseSize||!newIng.par) return showToast("Fill all fields");
                  const upd=[...ingredients,{id:Date.now(),name:newIng.name,category:newIng.category,recipeUnit:newIng.recipeUnit,purchaseUnit:newIng.purchaseUnit,purchaseSize:num(newIng.purchaseSize),par:num(newIng.par)}];
                  setIngredients(upd); saveLib(upd,recipes);
                  setNewIng({name:"",category:"Spirits",recipeUnit:"ml",purchaseUnit:"bottle",purchaseSize:"",par:""});
                  showToast("Ingredient saved");
                }}>Add Ingredient</button>
              </div>

              {/* Library with search + filter */}
              <div className="card">
                <span className="sect">Library — {ingredients.length} ingredients</span>
                <SearchBar value={libSearch} onChange={setLibSearch} placeholder="Search ingredients..." />
                <CategoryFilter selected={libCat} onChange={setLibCat} counts={catCounts(ingredients)} />
                {(() => {
                  const filtered = filterIngs(ingredients, libCat, libSearch);
                  return filtered.length===0
                    ? <div className="no-results">No ingredients match</div>
                    : filtered.map(ing=>(
                      <div key={ing.id}>
                        {editIngId===ing.id ? (
                          /* ── EDIT MODE ── */
                          <div style={{padding:"14px 0",borderBottom:"1px solid var(--border)"}}>
                            <div className="field">
                              <label className="field-label">Name</label>
                              <TextInput value={editIng.name} onChange={v=>setEditIng(p=>({...p,name:v}))} placeholder="Name" />
                            </div>
                            <div className="field">
                              <label className="field-label">Category</label>
                              <Select value={editIng.category} onChange={v=>setEditIng(p=>({...p,category:v}))}>
                                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                              </Select>
                            </div>
                            <div className="g2" style={{marginBottom:12}}>
                              <div>
                                <label className="field-label">Recipe Unit</label>
                                <Select value={editIng.recipeUnit} onChange={v=>setEditIng(p=>({...p,recipeUnit:v}))}>
                                  {RECIPE_UNITS.map(u=><option key={u}>{u}</option>)}
                                </Select>
                              </div>
                              <div>
                                <label className="field-label">Purchase Unit</label>
                                <Select value={editIng.purchaseUnit} onChange={v=>setEditIng(p=>({...p,purchaseUnit:v}))}>
                                  {PURCHASE_UNITS.map(u=><option key={u}>{u}</option>)}
                                </Select>
                              </div>
                            </div>
                            <div className="g2" style={{marginBottom:12}}>
                              <div>
                                <label className="field-label">{editIng.recipeUnit} per {editIng.purchaseUnit}</label>
                                <NumInput value={editIng.purchaseSize} placeholder="e.g. 700" onChange={v=>setEditIng(p=>({...p,purchaseSize:v}))} />
                              </div>
                              <div>
                                <label className="field-label">Par ({editIng.purchaseUnit}s)</label>
                                <NumInput value={editIng.par} placeholder="e.g. 6" onChange={v=>setEditIng(p=>({...p,par:v}))} />
                              </div>
                            </div>
                            <div style={{display:"flex",gap:8}}>
                              <button className="btn-primary" style={{flex:1}} onClick={()=>{
                                if(!editIng.name||!editIng.purchaseSize||!editIng.par) return showToast("Fill all fields");
                                const upd=ingredients.map(i=>i.id===ing.id?{...i,...editIng,purchaseSize:num(editIng.purchaseSize),par:num(editIng.par)}:i);
                                setIngredients(upd); saveLib(upd,recipes);
                                setEditIngId(null); showToast("Ingredient updated");
                              }}>Save Changes</button>
                              <button className="btn-secondary" onClick={()=>setEditIngId(null)}>Cancel</button>
                              <button className="btn-icon" onClick={()=>{
                                const upd=ingredients.filter(i=>i.id!==ing.id);
                                setIngredients(upd); saveLib(upd,recipes);
                                setEditIngId(null); showToast("Removed");
                              }}><Icon.trash/></button>
                            </div>
                          </div>
                        ) : (
                          /* ── VIEW MODE ── */
                          <div className="row" style={{alignItems:"flex-start",gap:12}}>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                                <span style={{fontSize:14}}>{ing.name}</span>
                                <span className="tag-cat">{ing.category}</span>
                              </div>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                <span className="pill">{ing.recipeUnit}</span>
                                <span className="pill">{ing.purchaseUnit}</span>
                                <span className="pill">1 {ing.purchaseUnit} = {ing.purchaseSize}{ing.recipeUnit}</span>
                                <span className="tag">par: {ing.par}</span>
                              </div>
                            </div>
                            <button className="btn-icon" style={{flexShrink:0}} onClick={()=>{
                              setEditIngId(ing.id);
                              setEditIng({name:ing.name,category:ing.category,recipeUnit:ing.recipeUnit,purchaseUnit:ing.purchaseUnit,purchaseSize:String(ing.purchaseSize),par:String(ing.par)});
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ));
                })()}
              </div>
            </div>
          )}

          {subTab==="recipes" && (
            <div>
              <div className="card" style={{marginBottom:10}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:18,fontWeight:600,color:"var(--gold)",marginBottom:16}}>
                  {editRecId ? "Edit Recipe" : "Build Recipe Spec"}
                </div>
                <div className="field">
                  <label className="field-label">Drink Name</label>
                  <TextInput placeholder="e.g. Aperol Spritz" value={newRec.name} onChange={v=>setNewRec(p=>({...p,name:v}))} />
                </div>

                {/* Ingredient picker with search */}
                <div style={{marginBottom:12}}>
                  <label className="field-label">Ingredient</label>
                  <SearchBar value={recSearch} onChange={v=>{setRecSearch(v);setNewRI(p=>({...p,ingredientId:""}));}} placeholder="Type to search ingredients..." />
                  <select
                    value={newRI.ingredientId}
                    onChange={e=>setNewRI(p=>({...p,ingredientId:e.target.value}))}
                    style={{background:"var(--input-bg)",border:"1.5px solid var(--border)",color:newRI.ingredientId?"var(--text)":"var(--text-dim)",fontFamily:"var(--font-mono)",fontSize:15,padding:"14px 16px",borderRadius:10,width:"100%",outline:"none",appearance:"none",WebkitAppearance:"none",cursor:"pointer"}}
                    onFocus={e=>e.target.style.borderColor="var(--gold)"}
                    onBlur={e=>e.target.style.borderColor="var(--border)"}
                  >
                    <option value="">— select ingredient —</option>
                    {ingredients
                      .filter(i => recSearch==="" || i.name.toLowerCase().includes(recSearch.toLowerCase()))
                      .map(i=><option key={i.id} value={i.id}>{i.name} ({i.category} · {i.recipeUnit})</option>)
                    }
                  </select>
                </div>
                <div style={{marginBottom:12}}>
                  <label className="field-label">
                    Quantity {newRI.ingredientId&&`(${ingredients.find(i=>i.id===parseInt(newRI.ingredientId))?.recipeUnit})`}
                  </label>
                  <NumInput value={newRI.quantity} placeholder="e.g. 50"
                    sublabel={newRI.ingredientId&&newRI.quantity?(()=>{const ing=ingredients.find(i=>i.id===parseInt(newRI.ingredientId));return ing?`${fmtP(ing.purchaseUnit,toPurch(ing,num(newRI.quantity)))} of 1 ${ing.purchaseUnit} per serve`:null;})():null}
                    onChange={v=>setNewRI(p=>({...p,quantity:v}))} />
                </div>
                <div style={{display:"flex",gap:8,margin:"12px 0"}}>
                  <button className="btn-secondary" style={{flex:1}} onClick={()=>{
                    if(!newRI.ingredientId||!newRI.quantity) return;
                    setNewRec(p=>({...p,ings:[...p.ings,{ingredientId:parseInt(newRI.ingredientId),quantity:num(newRI.quantity)}]}));
                    setNewRI({ingredientId:"",quantity:""}); setRecSearch("");
                  }}>+ Add to Spec</button>
                  <button className="btn-primary" style={{flex:1}} onClick={()=>{
                    if(!newRec.name||newRec.ings.length===0) return showToast("Need name + 1 ingredient");
                    let upd;
                    if(editRecId) {
                      // update existing recipe
                      upd=recipes.map(r=>r.id===editRecId?{...r,name:newRec.name,ingredients:newRec.ings}:r);
                      setEditRecId(null);
                      showToast("Recipe updated");
                    } else {
                      // new recipe
                      upd=[...recipes,{id:Date.now(),name:newRec.name,ingredients:newRec.ings}];
                      showToast("Recipe saved");
                    }
                    setRecipes(upd); saveLib(ingredients,upd);
                    setNewRec({name:"",ings:[]});
                  }}>{editRecId?"Update Recipe":"Save Recipe"}</button>
                  {editRecId&&<button className="btn-secondary" onClick={()=>{setEditRecId(null);setNewRec({name:"",ings:[]});}}>Cancel</button>}
                </div>
                {newRec.ings.length>0&&(
                  <div style={{background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:10,padding:14}}>
                    <span className="sect">Preview — {newRec.name||"Untitled"}</span>
                    {newRec.ings.map((ri,idx)=>{
                      const ing=ingredients.find(i=>i.id===ri.ingredientId);
                      return (
                        <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                          <span style={{fontSize:12,color:"var(--text-mid)"}}>{ing?.name}</span>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:12,color:"var(--gold)",fontFamily:"var(--font-mono)"}}>{ri.quantity}{ing?.recipeUnit}</span>
                            <button style={{background:"none",border:"none",color:"var(--text-dim)",cursor:"pointer",fontSize:16,lineHeight:1}} onClick={()=>setNewRec(p=>({...p,ings:p.ings.filter((_,i)=>i!==idx)}))}>×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="card">
                <span className="sect">Recipe Library — {recipes.length} recipes</span>
                {recipes.length===0&&<div style={{fontSize:13,color:"var(--text-dim)"}}>No recipes yet.</div>}
                {recipes.map(recipe=>(
                  <div key={recipe.id} style={{paddingBottom:16,marginBottom:14,borderBottom:"1px solid var(--border)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontFamily:"var(--font-serif)",fontSize:17,fontWeight:600}}>{recipe.name}</div>
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn-icon" onClick={()=>{
                          // Load recipe into the build form for editing
                          setEditRecId(recipe.id);
                          setNewRec({name:recipe.name, ings:recipe.ingredients.map(ri=>({ingredientId:ri.ingredientId,quantity:ri.quantity}))});
                          setNewRI({ingredientId:"",quantity:""});
                          setRecSearch("");
                          window.scrollTo({top:0,behavior:"smooth"});
                          showToast("Recipe loaded for editing — make changes and hit Save");
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-icon" onClick={()=>{const u=recipes.filter(r=>r.id!==recipe.id);setRecipes(u);saveLib(ingredients,u);showToast("Removed");}}>
                          <Icon.trash/>
                        </button>
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {recipe.ingredients.map((ri,idx)=>{
                        const ing=ingredients.find(i=>i.id===ri.ingredientId);
                        return <span key={idx} className="tag">{ing?.name}: {ri.quantity}{ing?.recipeUnit}</span>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="nav">
        {navItems.map(item=>(
          <button key={item.id} className={`nav-item ${tab===item.id?"active":""}`} onClick={()=>setTab(item.id)}>
            <item.icon/>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* LOG WEEK SHEET */}
      {modal==="logWeek"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{fontFamily:"var(--font-serif)",fontSize:22,fontWeight:700,color:"var(--gold)",marginBottom:8}}>Log Week {weekNum}</div>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:16}}>These sales will be added to your monthly total.</div>
            <div style={{background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:16}}>
              {Object.entries(weekSales).filter(([,v])=>num(v)>0).map(([rid,qty])=>{
                const r=recipes.find(x=>x.id===parseInt(rid));
                return r?<div key={rid} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13}}><span style={{color:"var(--text-mid)"}}>{r.name}</span><span style={{color:"var(--gold)",fontFamily:"var(--font-mono)"}}>{qty}</span></div>:null;
              })}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,marginTop:6,borderTop:"1px solid var(--border)",fontSize:12,color:"var(--text-dim)"}}>
                <span>Total</span><span style={{color:"var(--gold)",fontFamily:"var(--font-mono)"}}>{weekTotal} drinks</span>
              </div>
            </div>
            <button className="btn-primary" style={{marginBottom:10}} onClick={logWeek}>Confirm & Log</button>
            <button className="btn-secondary" style={{width:"100%"}} onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* NEW MONTH SHEET */}
      {modal==="newMonth"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{fontFamily:"var(--font-serif)",fontSize:22,fontWeight:700,color:"var(--blue)",marginBottom:8}}>Start New Month?</div>
            <div style={{fontSize:12,color:"var(--text-dim)",lineHeight:1.8,marginBottom:20}}>
              · Closing count → new opening stock<br/>
              · Clears deliveries, sales log, closing stock<br/>
              · Resets to Week 1<br/>
              · Keeps ingredients, recipes and par levels<br/><br/>
              <span style={{color:"#fb923c"}}>Cannot be undone.</span>
            </div>
            <button className="btn-blue" style={{width:"100%",marginBottom:10}} onClick={doNewMonth}>Confirm New Month</button>
            <button className="btn-secondary" style={{width:"100%"}} onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* RESET SHEET */}
      {modal==="reset"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{fontFamily:"var(--font-serif)",fontSize:22,fontWeight:700,color:"var(--red)",marginBottom:8}}>Reset Everything?</div>
            <div style={{fontSize:12,color:"var(--text-dim)",lineHeight:1.7,marginBottom:20}}>Wipes all data and reloads demo data.</div>
            <button style={{background:"var(--red)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:12,padding:"15px",borderRadius:10,cursor:"pointer",width:"100%",marginBottom:10}} onClick={doReset}>Wipe Everything</button>
            <button className="btn-secondary" style={{width:"100%"}} onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}
