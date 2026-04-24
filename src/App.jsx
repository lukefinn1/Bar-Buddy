import { useState, useEffect, useCallback, useRef } from "react"

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  "Spirits":         { color: "#B45309", bg: "#FEF3C7", text: "#92400E", border: "#D97706" },
  "Liqueurs":        { color: "#7C3AED", bg: "#EDE9FE", text: "#5B21B6", border: "#8B5CF6" },
  "Wine":            { color: "#991B1B", bg: "#FEE2E2", text: "#7F1D1D", border: "#DC2626" },
  "Beer & Cider":    { color: "#D97706", bg: "#FEF9C3", text: "#92400E", border: "#F59E0B" },
  "Bitters":         { color: "#166534", bg: "#DCFCE7", text: "#14532D", border: "#22C55E" },
  "Juice & Cordials":{ color: "#EA580C", bg: "#FFEDD5", text: "#9A3412", border: "#F97316" },
  "Syrups":          { color: "#DB2777", bg: "#FCE7F3", text: "#9D174D", border: "#EC4899" },
  "Garnishes":       { color: "#16A34A", bg: "#DCFCE7", text: "#14532D", border: "#22C55E" },
  "Dry Goods":       { color: "#475569", bg: "#F1F5F9", text: "#334155", border: "#64748B" },
  "Other":           { color: "#2563EB", bg: "#DBEAFE", text: "#1E3A8A", border: "#3B82F6" },
}

const DEFAULT_INGREDIENTS = [
  // Spirits
  { id:"s1",  name:"Chivas Regal 12",          category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:3,  costPerPurchaseUnit:85 },
  { id:"s2",  name:"Yellow Rose Rye",           category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:95 },
  { id:"s3",  name:"Maker's Mark",              category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:3,  costPerPurchaseUnit:72 },
  { id:"s4",  name:"Jameson",                   category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:3,  costPerPurchaseUnit:58 },
  { id:"s5",  name:"Toki Blended Whisky",       category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:3,  costPerPurchaseUnit:65 },
  { id:"s6",  name:"Olmeca Tequila",            category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:48 },
  { id:"s7",  name:"Havana Club 3",             category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:42 },
  { id:"s8",  name:"Beefeater Gin",             category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:3,  costPerPurchaseUnit:38 },
  { id:"s9",  name:"Absolut Vanilla",           category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:42 },
  { id:"s10", name:"Absolut Vodka",             category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:3,  costPerPurchaseUnit:38 },
  { id:"s11", name:"Vida Mezcal",               category:"Spirits",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:72 },
  // Liqueurs
  { id:"l1",  name:"Amaro Montenegro",          category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:48 },
  { id:"l2",  name:"Campari",                   category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:38 },
  { id:"l3",  name:"Baileys",                   category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:32 },
  { id:"l4",  name:"Pavan",                     category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:45 },
  { id:"l5",  name:"Marie Brizard Cacao Blanc", category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:38 },
  { id:"l6",  name:"Marie Brizard Elderflower", category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:38 },
  { id:"l7",  name:"DeKuyper Peach",            category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:28 },
  { id:"l8",  name:"DeKuyper Butterscotch",     category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:28 },
  { id:"l9",  name:"DeKuyper Sour Apple",       category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:28 },
  { id:"l10", name:"Malibu",                    category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:32 },
  { id:"l11", name:"Triple Sec",                category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:3,  costPerPurchaseUnit:22 },
  { id:"l12", name:"Martini Bianco",            category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:2,  costPerPurchaseUnit:18 },
  { id:"l13", name:"Sweet Vermouth",            category:"Liqueurs",         recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:2,  costPerPurchaseUnit:18 },
  // Syrups
  { id:"sy1", name:"Monin Caramel",             category:"Syrups",           recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:18 },
  { id:"sy2", name:"Monin Strawberry",          category:"Syrups",           recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:700, par:2,  costPerPurchaseUnit:18 },
  { id:"sy3", name:"Maple Syrup",               category:"Syrups",           recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:2,  costPerPurchaseUnit:12 },
  { id:"sy4", name:"Orgeat Crawleys",           category:"Syrups",           recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:500, par:2,  costPerPurchaseUnit:22 },
  { id:"sy5", name:"Sugar Syrup",               category:"Syrups",           recipeUnit:"ml", purchaseUnit:"2kg bag", purchaseSize:3000, par:1, costPerPurchaseUnit:4 },
  // Juice & Cordials
  { id:"j1",  name:"Lemon Juice",               category:"Juice & Cordials", recipeUnit:"ml", purchaseUnit:"litre",  purchaseSize:1000, par:4, costPerPurchaseUnit:6 },
  { id:"j2",  name:"Lime Juice",                category:"Juice & Cordials", recipeUnit:"ml", purchaseUnit:"litre",  purchaseSize:1000, par:4, costPerPurchaseUnit:8 },
  { id:"j3",  name:"Apple Juice",               category:"Juice & Cordials", recipeUnit:"ml", purchaseUnit:"litre",  purchaseSize:1000, par:3, costPerPurchaseUnit:4 },
  { id:"j4",  name:"Passionfruit Pulp",         category:"Juice & Cordials", recipeUnit:"ml", purchaseUnit:"500ml can",purchaseSize:500,par:4, costPerPurchaseUnit:5 },
  { id:"j5",  name:"Cranberry Juice",           category:"Juice & Cordials", recipeUnit:"ml", purchaseUnit:"litre",  purchaseSize:1000, par:3, costPerPurchaseUnit:5 },
  { id:"j6",  name:"Pineapple Juice",           category:"Juice & Cordials", recipeUnit:"ml", purchaseUnit:"litre",  purchaseSize:1000, par:3, costPerPurchaseUnit:4 },
  { id:"j7",  name:"Aquafaba",                  category:"Juice & Cordials", recipeUnit:"ml", purchaseUnit:"litre",  purchaseSize:1000, par:2, costPerPurchaseUnit:3 },
  // Bitters
  { id:"b1",  name:"Chocolate Bitters",         category:"Bitters",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:200, par:2,  costPerPurchaseUnit:22 },
  { id:"b2",  name:"Orange Bitters",            category:"Bitters",          recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:200, par:2,  costPerPurchaseUnit:22 },
  // Beer & Cider
  { id:"bc1", name:"Corona",                    category:"Beer & Cider",     recipeUnit:"unit", purchaseUnit:"case", purchaseSize:24, par:2,   costPerPurchaseUnit:58 },
  { id:"bc2", name:"Great Northern Original",   category:"Beer & Cider",     recipeUnit:"unit", purchaseUnit:"case", purchaseSize:24, par:3,   costPerPurchaseUnit:42 },
  { id:"bc3", name:"Great Northern Supercrisp", category:"Beer & Cider",     recipeUnit:"unit", purchaseUnit:"case", purchaseSize:24, par:3,   costPerPurchaseUnit:42 },
  { id:"bc4", name:"Heineken Zero",             category:"Beer & Cider",     recipeUnit:"unit", purchaseUnit:"case", purchaseSize:24, par:2,   costPerPurchaseUnit:42 },
  { id:"bc5", name:"James Squire Orchard Crush",category:"Beer & Cider",     recipeUnit:"unit", purchaseUnit:"case", purchaseSize:24, par:2,   costPerPurchaseUnit:52 },
  // Wine
  { id:"w1",  name:"Clover Hill NV",            category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:6,  costPerPurchaseUnit:38 },
  { id:"w2",  name:"Bianca Vigna Prosecco",     category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:12, costPerPurchaseUnit:28 },
  { id:"w3",  name:"Taittinger",                category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:3,  costPerPurchaseUnit:95 },
  { id:"w4",  name:"Fiore Moscato",             category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:6,  costPerPurchaseUnit:22 },
  { id:"w5",  name:"Hay Shed Hill Sauv Sem",    category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:6,  costPerPurchaseUnit:24 },
  { id:"w6",  name:"Hesketh Sauv Blanc",        category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:6,  costPerPurchaseUnit:24 },
  { id:"w7",  name:"Josef Chromy Riesling",     category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:4,  costPerPurchaseUnit:32 },
  { id:"w8",  name:"Rockburn Pinot Gris",       category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:4,  costPerPurchaseUnit:28 },
  { id:"w9",  name:"Haha Chardonnay",           category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:6,  costPerPurchaseUnit:22 },
  { id:"w10", name:"Dalrymple Chardonnay",      category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:3,  costPerPurchaseUnit:48 },
  { id:"w11", name:"Maison Saint AIX Rosé",     category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:6,  costPerPurchaseUnit:32 },
  { id:"w12", name:"Santa Cristina Sangiovese Rosé",category:"Wine",recipeUnit:"ml",purchaseUnit:"bottle",purchaseSize:750,par:6, costPerPurchaseUnit:22 },
  { id:"w13", name:"Fickle Mistress Pinot Noir",category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:6,  costPerPurchaseUnit:22 },
  { id:"w14", name:"Torres Ibericos Tempranillo",category:"Wine",recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:4,  costPerPurchaseUnit:28 },
  { id:"w15", name:"Domaine Beaurenard Grenache Syrah",category:"Wine",recipeUnit:"ml",purchaseUnit:"bottle",purchaseSize:750,par:4,costPerPurchaseUnit:38},
  { id:"w16", name:"Little Berry Cabernet Sauvignon",category:"Wine",recipeUnit:"ml",purchaseUnit:"bottle",purchaseSize:750,par:6,costPerPurchaseUnit:22},
  { id:"w17", name:"Langmeil Valley Floor Shiraz",category:"Wine",recipeUnit:"ml",purchaseUnit:"bottle",purchaseSize:750,par:4,  costPerPurchaseUnit:32 },
  { id:"w18", name:"Leeuwin Estate Art Series Shiraz",category:"Wine",recipeUnit:"ml",purchaseUnit:"bottle",purchaseSize:750,par:3,costPerPurchaseUnit:48},
  { id:"w19", name:"Penfolds Bin 389",          category:"Wine", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:750, par:2,  costPerPurchaseUnit:120},
  // Dry Goods
  { id:"d1",  name:"Tajin",                     category:"Dry Goods",        recipeUnit:"g",  purchaseUnit:"bottle", purchaseSize:142, par:2,  costPerPurchaseUnit:6 },
  { id:"d2",  name:"Fever-Tree Lime & Yuzu Soda",category:"Dry Goods",       recipeUnit:"ml", purchaseUnit:"4-pack", purchaseSize:800, par:5,  costPerPurchaseUnit:12 },
]

const DEFAULT_RECIPES = [
  // Cocktails
  { id:"r1",  name:"Smoke & Silk",     category:"Cocktails", salePrice:25, ingredients:[{id:"s1",qty:60},{id:"sy3",qty:15},{id:"b1",qty:2.4}] },
  { id:"r2",  name:"Fifth Avenue",     category:"Cocktails", salePrice:25, ingredients:[{id:"s2",qty:45},{id:"l1",qty:15},{id:"b2",qty:1.8}] },
  { id:"r3",  name:"Crimson Bloom",    category:"Cocktails", salePrice:22, ingredients:[{id:"s3",qty:20},{id:"l13",qty:20},{id:"l2",qty:20}] },
  { id:"r4",  name:"Velour Drift",     category:"Cocktails", salePrice:22, ingredients:[{id:"s4",qty:40},{id:"l3",qty:20},{id:"sy1",qty:10}] },
  { id:"r5",  name:"Kisetsu",          category:"Cocktails", salePrice:22, ingredients:[{id:"s3",qty:40},{id:"l5",qty:20},{id:"j1",qty:25},{id:"sy2",qty:10}] },
  { id:"r6",  name:"Golden Pulse",     category:"Cocktails", salePrice:22, ingredients:[{id:"s4",qty:30},{id:"l6",qty:30},{id:"j3",qty:60},{id:"j4",qty:30},{id:"j7",qty:30}] },
  { id:"r7",  name:"Jasmine Mist",     category:"Cocktails", salePrice:23, ingredients:[{id:"s8",qty:45},{id:"l6",qty:15},{id:"l12",qty:5}] },
  { id:"r8",  name:"Yuzu High",        category:"Cocktails", salePrice:22, ingredients:[{id:"s5",qty:60},{id:"d2",qty:90}] },
  { id:"r9",  name:"Neon Collins",     category:"Cocktails", salePrice:22, ingredients:[{id:"s10",qty:30}] },
  { id:"r10", name:"First Light",      category:"Cocktails", salePrice:23, ingredients:[{id:"s6",qty:30},{id:"l10",qty:30},{id:"j2",qty:30},{id:"sy4",qty:10},{id:"l11",qty:5}] },
  { id:"r11", name:"Hikari Muse",      category:"Cocktails", salePrice:22, ingredients:[{id:"s9",qty:45},{id:"l7",qty:15},{id:"sy2",qty:20},{id:"j1",qty:25},{id:"j7",qty:30}] },
  { id:"r12", name:"Kin Bite",         category:"Cocktails", salePrice:22, ingredients:[{id:"s8",qty:30},{id:"l8",qty:15},{id:"l9",qty:15},{id:"j1",qty:30},{id:"sy5",qty:30},{id:"j7",qty:30}] },
  { id:"r13", name:"Blush Rose",       category:"Cocktails", salePrice:20, ingredients:[{id:"l4",qty:30},{id:"j1",qty:20},{id:"j5",qty:40},{id:"w2",qty:90}] },
  { id:"r14", name:"Ember Flame",      category:"Cocktails", salePrice:22, ingredients:[{id:"s7",qty:30},{id:"l11",qty:30},{id:"j2",qty:30},{id:"j6",qty:30},{id:"sy4",qty:10},{id:"s11",qty:15}] },
  { id:"r15", name:"Japanese Highball",category:"Cocktails", salePrice:20, ingredients:[{id:"s5",qty:60}] },
  // Beer
  { id:"b1r", name:"Corona",                    category:"Beer", salePrice:12, ingredients:[{id:"bc1",qty:1}] },
  { id:"b2r", name:"Great Northern Original",   category:"Beer", salePrice:10, ingredients:[{id:"bc2",qty:1}] },
  { id:"b3r", name:"Great Northern Supercrisp", category:"Beer", salePrice:10, ingredients:[{id:"bc3",qty:1}] },
  { id:"b4r", name:"Heineken Zero",             category:"Beer", salePrice:9,  ingredients:[{id:"bc4",qty:1}] },
  { id:"b5r", name:"James Squire Orchard Crush",category:"Beer", salePrice:12, ingredients:[{id:"bc5",qty:1}] },
  // Wine - Sparkling
  { id:"ws1", name:"Clover Hill NV",            category:"Wine", salePrice:14, ingredients:[{id:"w1",qty:120}] },
  { id:"ws2", name:"Bianca Vigna Prosecco",     category:"Wine", salePrice:14, ingredients:[{id:"w2",qty:120}] },
  { id:"ws3", name:"Taittinger",                category:"Wine", salePrice:31, ingredients:[{id:"w3",qty:120}] },
  // Wine - Still 150ml
  { id:"wf1", name:"Fiore Moscato 150ml",       category:"Wine", salePrice:12, ingredients:[{id:"w4",qty:150}] },
  { id:"wf2", name:"Hay Shed Hill Sauv Sem 150ml",category:"Wine",salePrice:12,ingredients:[{id:"w5",qty:150}] },
  { id:"wf3", name:"Hesketh Sauv Blanc 150ml",  category:"Wine", salePrice:12, ingredients:[{id:"w6",qty:150}] },
  { id:"wf4", name:"Josef Chromy Riesling 150ml",category:"Wine",salePrice:16, ingredients:[{id:"w7",qty:150}] },
  { id:"wf5", name:"Rockburn Pinot Gris 150ml", category:"Wine", salePrice:15, ingredients:[{id:"w8",qty:150}] },
  { id:"wf6", name:"Haha Chardonnay 150ml",     category:"Wine", salePrice:13, ingredients:[{id:"w9",qty:150}] },
  { id:"wf7", name:"Dalrymple Chardonnay 150ml",category:"Wine", salePrice:21, ingredients:[{id:"w10",qty:150}] },
  { id:"wf8", name:"Maison Saint AIX Rosé 150ml",category:"Wine",salePrice:18, ingredients:[{id:"w11",qty:150}] },
  { id:"wf9", name:"Santa Cristina Rosé 150ml", category:"Wine", salePrice:13, ingredients:[{id:"w12",qty:150}] },
  { id:"wf10",name:"Fickle Mistress Pinot Noir 150ml",category:"Wine",salePrice:13,ingredients:[{id:"w13",qty:150}] },
  { id:"wf11",name:"Torres Tempranillo 150ml",  category:"Wine", salePrice:15, ingredients:[{id:"w14",qty:150}] },
  { id:"wf12",name:"Domaine Beaurenard Grenache 150ml",category:"Wine",salePrice:19,ingredients:[{id:"w15",qty:150}] },
  { id:"wf13",name:"Little Berry Cabernet Sauv 150ml",category:"Wine",salePrice:12,ingredients:[{id:"w16",qty:150}] },
  { id:"wf14",name:"Langmeil Valley Floor Shiraz 150ml",category:"Wine",salePrice:19,ingredients:[{id:"w17",qty:150}] },
  { id:"wf15",name:"Leeuwin Art Series Shiraz 150ml",category:"Wine",salePrice:22,ingredients:[{id:"w18",qty:150}] },
  { id:"wf16",name:"Penfolds Bin 389 150ml",    category:"Wine", salePrice:61, ingredients:[{id:"w19",qty:150}] },
  // Wine - Still 250ml
  { id:"wt1", name:"Fiore Moscato 250ml",       category:"Wine", salePrice:18, ingredients:[{id:"w4",qty:250}] },
  { id:"wt2", name:"Hay Shed Hill Sauv Sem 250ml",category:"Wine",salePrice:18,ingredients:[{id:"w5",qty:250}] },
  { id:"wt3", name:"Hesketh Sauv Blanc 250ml",  category:"Wine", salePrice:18, ingredients:[{id:"w6",qty:250}] },
  { id:"wt4", name:"Josef Chromy Riesling 250ml",category:"Wine",salePrice:26, ingredients:[{id:"w7",qty:250}] },
  { id:"wt5", name:"Rockburn Pinot Gris 250ml", category:"Wine", salePrice:25, ingredients:[{id:"w8",qty:250}] },
  { id:"wt6", name:"Haha Chardonnay 250ml",     category:"Wine", salePrice:21, ingredients:[{id:"w9",qty:250}] },
  { id:"wt7", name:"Dalrymple Chardonnay 250ml",category:"Wine", salePrice:36, ingredients:[{id:"w10",qty:250}] },
  { id:"wt8", name:"Maison Saint AIX Rosé 250ml",category:"Wine",salePrice:29, ingredients:[{id:"w11",qty:250}] },
  { id:"wt9", name:"Santa Cristina Rosé 250ml", category:"Wine", salePrice:21, ingredients:[{id:"w12",qty:250}] },
  { id:"wt10",name:"Fickle Mistress Pinot Noir 250ml",category:"Wine",salePrice:21,ingredients:[{id:"w13",qty:250}] },
  { id:"wt11",name:"Torres Tempranillo 250ml",  category:"Wine", salePrice:24, ingredients:[{id:"w14",qty:250}] },
  { id:"wt12",name:"Domaine Beaurenard Grenache 250ml",category:"Wine",salePrice:31,ingredients:[{id:"w15",qty:250}] },
  { id:"wt13",name:"Little Berry Cabernet Sauv 250ml",category:"Wine",salePrice:18,ingredients:[{id:"w16",qty:250}] },
  { id:"wt14",name:"Langmeil Valley Floor Shiraz 250ml",category:"Wine",salePrice:28,ingredients:[{id:"w17",qty:250}] },
  { id:"wt15",name:"Leeuwin Art Series Shiraz 250ml",category:"Wine",salePrice:36,ingredients:[{id:"w18",qty:250}] },
  { id:"wt16",name:"Penfolds Bin 389 250ml",    category:"Wine", salePrice:101,ingredients:[{id:"w19",qty:250}] },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const isBeer = (ing) => ing.category === "Beer & Cider"
const countUnit = (ing) => isBeer(ing) ? "bottle" : ing.purchaseUnit
const countSize = (ing) => isBeer(ing) ? 1 : ing.purchaseSize
const countToBase = (ing, v) => (v || 0) * countSize(ing)   // count units → recipe units
const baseToCount = (ing, v) => (v || 0) / countSize(ing)   // recipe units → count units
const toPurch = (ing, baseVal) => baseVal / ing.purchaseSize // recipe units → purchase units

const costPerUnit = (ing) => ing.costPerPurchaseUnit / ing.purchaseSize

const calcPourCost = (recipe, ingMap) => {
  if (!recipe || !recipe.ingredients) return 0
  return recipe.ingredients.reduce((sum, ri) => {
    const ing = ingMap[ri.id]
    if (!ing) return sum
    return sum + ri.qty * costPerUnit(ing)
  }, 0)
}

const calcUsage = (monthlySales, recipes, ingMap) => {
  const usage = {}
  Object.entries(monthlySales).forEach(([recipeId, qty]) => {
    const recipe = recipes.find(r => r.id === recipeId)
    if (!recipe) return
    recipe.ingredients.forEach(ri => {
      usage[ri.id] = (usage[ri.id] || 0) + ri.qty * qty
    })
  })
  return usage
}

const calcTheoClose = (ingredients, openingStock, deliveries, usage) => {
  const theoClose = {}
  ingredients.forEach(ing => {
    const open = countToBase(ing, openingStock[ing.id] || 0)
    const del  = countToBase(ing, deliveries[ing.id] || 0)
    const used = usage[ing.id] || 0
    theoClose[ing.id] = open + del - used
  })
  return theoClose
}

const calcVariance = (ing, theoClose, closingStock) => {
  const tP = toPurch(ing, theoClose[ing.id] || 0)
  const aP = toPurch(ing, countToBase(ing, closingStock[ing.id] || 0))
  return aP - tP
}

const orderSuggestion = (ing, theoClose) => {
  const remaining = toPurch(ing, theoClose[ing.id] || 0)
  return Math.max(0, Math.ceil(ing.par - remaining))
}

const fmtAUD = (v) => `$${Math.abs(v).toFixed(2)}`
const fmtPct = (v) => `${v.toFixed(1)}%`

// ─── ATOMS ────────────────────────────────────────────────────────────────────

const NumInput = ({ value, onChange, style = {} }) => {
  const [local, setLocal] = useState(value === 0 || value === "" || value == null ? "" : String(value))
  const prevValue = useRef(value)
  useEffect(() => {
    if (prevValue.current !== value) {
      setLocal(value === 0 || value === "" || value == null ? "" : String(value))
      prevValue.current = value
    }
  }, [value])
  return (
    <input
      type="text"
      inputMode="decimal"
      value={local}
      placeholder="0"
      onChange={e => setLocal(e.target.value)}
      onFocus={e => e.target.select()}
      onBlur={() => {
        const n = parseFloat(local)
        const safe = isNaN(n) ? 0 : n
        setLocal(safe === 0 ? "" : String(safe))
        onChange(safe)
      }}
      style={{ width: 72, textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontSize: 13, padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", ...style }}
    />
  )
}

const SearchBar = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder || "Search…"}
    style={{ padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, width: 200, outline: "none" }}
  />
)

const CatPill = ({ category }) => {
  const m = CATEGORY_META[category] || CATEGORY_META["Other"]
  return (
    <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: m.bg, color: m.text, border: `1px solid ${m.border}`, whiteSpace: "nowrap" }}>
      {category}
    </span>
  )
}

const StatusPill = ({ status }) => {
  const map = {
    "Above Par":    { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    "At Par":       { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
    "Order Needed": { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
    "Critical":     { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  }
  const s = map[status] || map["Above Par"]
  return (
    <span style={{ display:"inline-block", padding:"1px 7px", borderRadius:10, fontSize:11, fontWeight:600, background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("dashboard")
  const [lib, setLib] = useState(null)
  const [period, setPeriod] = useState(null)
  const [weekSales, setWeekSales] = useState({})
  const saveTimer = useRef(null)

  // Load from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const libRes = await window.storage.get("bb-v1-lib")
        const perRes = await window.storage.get("bb-v1-period")
        setLib(libRes ? JSON.parse(libRes.value) : { ingredients: DEFAULT_INGREDIENTS, recipes: DEFAULT_RECIPES })
        setPeriod(perRes ? JSON.parse(perRes.value) : defaultPeriod())
      } catch {
        setLib({ ingredients: DEFAULT_INGREDIENTS, recipes: DEFAULT_RECIPES })
        setPeriod(defaultPeriod())
      }
    }
    loadData()
  }, [])

  const defaultPeriod = () => ({
    openingStock: {}, deliveries: {}, closingStock: {},
    monthlySales: {}, weeklyLog: [],
    monthStart: new Date().toISOString().slice(0, 10),
    weekNum: 1,
  })

  // Debounced save
  const saveData = useCallback((newLib, newPeriod) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        if (newLib) await window.storage.set("bb-v1-lib", JSON.stringify(newLib))
        if (newPeriod) await window.storage.set("bb-v1-period", JSON.stringify(newPeriod))
      } catch {}
    }, 600)
  }, [])

  const updatePeriod = useCallback((updater) => {
    setPeriod(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
      saveData(null, next)
      return next
    })
  }, [saveData])

  const updateLib = useCallback((updater) => {
    setLib(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
      saveData(next, null)
      return next
    })
  }, [saveData])

  useEffect(() => { window.scrollTo(0, 0) }, [tab])

  if (!lib || !period) return <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#374151" }}>Loading Bar Buddy…</div>

  const ingMap = Object.fromEntries(lib.ingredients.map(i => [i.id, i]))
  const recipeMap = Object.fromEntries(lib.recipes.map(r => [r.id, r]))
  const usage = calcUsage(period.monthlySales, lib.recipes, ingMap)
  const theoClose = calcTheoClose(lib.ingredients, period.openingStock, period.deliveries, usage)

  const getStatus = (ing) => {
    const rem = toPurch(ing, theoClose[ing.id] || 0)
    if (rem >= ing.par) return "Above Par"
    if (rem >= ing.par * 0.8) return "At Par"
    if (rem > 0) return "Order Needed"
    return "Critical"
  }

  const logWeek = () => {
    if (Object.keys(weekSales).length === 0) return
    const now = new Date()
    const entry = {
      label: `Week ${period.weekNum}`,
      weekOf: now.toISOString().slice(0, 10),
      sales: { ...weekSales },
    }
    updatePeriod(prev => {
      const newMonthlySales = { ...prev.monthlySales }
      Object.entries(weekSales).forEach(([rid, qty]) => {
        newMonthlySales[rid] = (newMonthlySales[rid] || 0) + qty
      })
      return { ...prev, monthlySales: newMonthlySales, weeklyLog: [...prev.weeklyLog, entry], weekNum: prev.weekNum + 1 }
    })
    setWeekSales({})
  }

  const newMonth = () => {
    const newOpening = {}
    lib.ingredients.forEach(ing => {
      if (period.closingStock[ing.id] !== undefined) {
        newOpening[ing.id] = period.closingStock[ing.id]
      } else {
        newOpening[ing.id] = baseToCount(ing, theoClose[ing.id] || 0)
      }
    })
    updatePeriod({
      openingStock: newOpening,
      deliveries: {}, closingStock: {},
      monthlySales: {}, weeklyLog: [],
      monthStart: new Date().toISOString().slice(0, 10),
      weekNum: 1,
    })
    setWeekSales({})
  }

  const hasPendingWeek = Object.keys(weekSales).some(k => weekSales[k] > 0)

  const monthName = new Date(period.monthStart).toLocaleString("default", { month: "long", year: "numeric" })

  // ── Layout ──
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#111827", background: "#f9fafb" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, minWidth: 220, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "20px 0" }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#111827", letterSpacing: "-0.5px" }}>🍸 Bar Buddy</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>v2.0</div>
        </div>
        <nav style={{ padding: "12px 0", flex: 1 }}>
          {[
            ["dashboard", "Dashboard"],
            ["inventory", "Inventory"],
            ["recipes", "Recipes"],
            ["sales", "Sales"],
            ["orders", "Orders"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "8px 20px", border: "none", cursor: "pointer",
              background: tab === id ? "#f3f4f6" : "transparent",
              color: tab === id ? "#111827" : "#6b7280",
              fontWeight: tab === id ? 600 : 400,
              fontSize: 13,
              borderLeft: tab === id ? "3px solid #111827" : "3px solid transparent",
            }}>{label}</button>
          ))}
        </nav>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>{monthName} · Week {period.weekNum}</div>
          {hasPendingWeek && (
            <button onClick={logWeek} style={{ display: "block", width: "100%", padding: "7px 0", marginBottom: 6, background: "#111827", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Log Week
            </button>
          )}
          <button onClick={newMonth} style={{ display: "block", width: "100%", padding: "7px 0", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>
            New Month
          </button>
          <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af" }}>● Saved</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {tab === "dashboard" && <DashboardPage lib={lib} period={period} ingMap={ingMap} usage={usage} theoClose={theoClose} getStatus={getStatus} setTab={setTab} />}
        {tab === "inventory" && <InventoryPage lib={lib} period={period} ingMap={ingMap} theoClose={theoClose} usage={usage} getStatus={getStatus} updatePeriod={updatePeriod} updateLib={updateLib} />}
        {tab === "recipes"   && <RecipesPage lib={lib} ingMap={ingMap} updateLib={updateLib} />}
        {tab === "sales"     && <SalesPage lib={lib} period={period} ingMap={ingMap} weekSales={weekSales} setWeekSales={setWeekSales} logWeek={logWeek} />}
        {tab === "orders"    && <OrdersPage lib={lib} theoClose={theoClose} ingMap={ingMap} />}
      </main>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardPage({ lib, period, ingMap, usage, theoClose, getStatus, setTab }) {
  const totalRevenue = lib.recipes.reduce((sum, r) => sum + r.salePrice * (period.monthlySales[r.id] || 0), 0)
  const totalPourCost = lib.recipes.reduce((sum, r) => sum + calcPourCost(r, ingMap) * (period.monthlySales[r.id] || 0), 0)
  const grossProfit = totalRevenue - totalPourCost
  const avgMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  const orderNeeded = lib.ingredients.filter(ing => {
    const s = getStatus(ing)
    return s === "Order Needed" || s === "Critical"
  })

  const recipeMargins = lib.recipes.map(r => {
    const pc = calcPourCost(r, ingMap)
    const gp = r.salePrice - pc
    const margin = r.salePrice > 0 ? (gp / r.salePrice) * 100 : 0
    return { ...r, pourCost: pc, grossProfit: gp, margin }
  }).filter(r => (period.monthlySales[r.id] || 0) > 0 || true)
    .sort((a, b) => b.margin - a.margin)

  const top5 = recipeMargins.slice(0, 5)
  const bot5 = [...recipeMargins].reverse().slice(0, 5)

  const topUsage = Object.entries(usage)
    .map(([id, qty]) => ({ ing: ingMap[id], qty }))
    .filter(x => x.ing)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)

  const kpis = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, sub: "this month" },
    { label: "Pour Cost",     value: `$${totalPourCost.toFixed(2)}`, sub: "this month" },
    { label: "Gross Profit",  value: `$${grossProfit.toFixed(2)}`, sub: "this month" },
    { label: "Avg Margin",    value: `${avgMargin.toFixed(1)}%`, sub: "across menu" },
    { label: "Order Alerts",  value: orderNeeded.length, sub: "items below par" },
    { label: "Current Week",  value: `Week ${period.weekNum}`, sub: "of month" },
  ]

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Dashboard" />
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: "#111827" }}>{k.value}</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Order Alerts */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Order Alerts</span>
            <button onClick={() => setTab("orders")} style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>View Full Report →</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Name","Category","Remaining","Par","To Order"].map(h => (
                  <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderNeeded.slice(0, 8).map(ing => {
                const rem = toPurch(ing, theoClose[ing.id] || 0)
                const toOrd = orderSuggestion(ing, theoClose)
                return (
                  <tr key={ing.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "6px 12px", fontSize: 12 }}>{ing.name}</td>
                    <td style={{ padding: "6px 12px" }}><CatPill category={ing.category} /></td>
                    <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#dc2626" }}>{rem.toFixed(2)}</td>
                    <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{ing.par}</td>
                    <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: "#dc2626" }}>{toOrd}</td>
                  </tr>
                )
              })}
              {orderNeeded.length === 0 && <tr><td colSpan={5} style={{ padding: "16px 12px", color: "#9ca3af", fontSize: 12, textAlign: "center" }}>All items at or above par</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Top Usage */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Top Usage This Month</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Name","Category","Used","Est. Cost"].map(h => (
                  <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topUsage.map(({ ing, qty }) => (
                <tr key={ing.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "6px 12px", fontSize: 12 }}>{ing.name}</td>
                  <td style={{ padding: "6px 12px" }}><CatPill category={ing.category} /></td>
                  <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{qty.toFixed(1)} {ing.recipeUnit}</td>
                  <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${(qty * costPerUnit(ing)).toFixed(2)}</td>
                </tr>
              ))}
              {topUsage.length === 0 && <tr><td colSpan={4} style={{ padding: "16px 12px", color: "#9ca3af", fontSize: 12, textAlign: "center" }}>No sales logged yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Margins */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Recipe Margins</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <div>
            <div style={{ padding: "8px 12px", background: "#f0fdf4", fontSize: 11, fontWeight: 700, color: "#166534", borderBottom: "1px solid #e5e7eb" }}>▲ Top 5 by Margin</div>
            <MarginTable rows={top5} />
          </div>
          <div style={{ borderLeft: "1px solid #e5e7eb" }}>
            <div style={{ padding: "8px 12px", background: "#fff1f2", fontSize: 11, fontWeight: 700, color: "#991b1b", borderBottom: "1px solid #e5e7eb" }}>▼ Bottom 5 by Margin</div>
            <MarginTable rows={bot5} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MarginTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f9fafb" }}>
          {["Name","Pour Cost","Sale Price","Margin %"].map(h => (
            <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
            <td style={{ padding: "6px 12px", fontSize: 12 }}>{r.name}</td>
            <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${r.pourCost.toFixed(2)}</td>
            <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${r.salePrice.toFixed(2)}</td>
            <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: r.margin >= 60 ? "#166534" : r.margin >= 40 ? "#854d0e" : "#991b1b" }}>
              {r.margin.toFixed(1)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────

function InventoryPage({ lib, period, ingMap, theoClose, usage, getStatus, updatePeriod, updateLib }) {
  const [catFilter, setCatFilter] = useState("All")
  const [search, setSearch] = useState("")
  const cats = ["All", ...Array.from(new Set(lib.ingredients.map(i => i.category)))]

  const filtered = lib.ingredients.filter(ing => {
    if (catFilter !== "All" && ing.category !== catFilter) return false
    if (search && !ing.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const setStock = (field, id, val) => {
    updatePeriod(prev => ({ ...prev, [field]: { ...prev[field], [id]: val } }))
  }

  const setPar = (id, val) => {
    updateLib(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => ing.id === id ? { ...ing, par: val } : ing)
    }))
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Inventory">
        <SearchBar value={search} onChange={setSearch} placeholder="Search ingredients…" />
      </PageTitle>
      {/* Category filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: "4px 12px", fontSize: 12, borderRadius: 20, cursor: "pointer",
            background: catFilter === c ? "#111827" : "#fff",
            color: catFilter === c ? "#fff" : "#374151",
            border: `1px solid ${catFilter === c ? "#111827" : "#d1d5db"}`,
          }}>{c}</button>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", position: "sticky", top: 0 }}>
              {["Name","Category","Opening Stock","Deliveries","Closing Stock","Theoretical","Variance","Par","Status"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ing, i) => {
              const theo = theoClose[ing.id] || 0
              const theoInCount = baseToCount(ing, theo)
              const variance = calcVariance(ing, theoClose, period.closingStock)
              const status = getStatus(ing)
              const unit = countUnit(ing)
              return (
                <tr key={ing.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "6px 12px", fontSize: 12, fontWeight: 500 }}>{ing.name}</td>
                  <td style={{ padding: "6px 12px" }}><CatPill category={ing.category} /></td>
                  <td style={{ padding: "4px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <NumInput value={period.openingStock[ing.id] || 0} onChange={v => setStock("openingStock", ing.id, v)} />
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{unit}</span>
                    </div>
                  </td>
                  <td style={{ padding: "4px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <NumInput value={period.deliveries[ing.id] || 0} onChange={v => setStock("deliveries", ing.id, v)} />
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{unit}</span>
                    </div>
                  </td>
                  <td style={{ padding: "4px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <NumInput value={period.closingStock[ing.id] || ""} onChange={v => setStock("closingStock", ing.id, v)} />
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{unit}</span>
                    </div>
                  </td>
                  <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{theoInCount.toFixed(2)} {unit}</td>
                  <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: variance < -0.05 ? "#dc2626" : variance > 0.05 ? "#16a34a" : "#6b7280" }}>
                    {variance >= 0 ? "+" : ""}{variance.toFixed(2)} {ing.purchaseUnit}
                  </td>
                  <td style={{ padding: "4px 8px" }}>
                    <NumInput value={ing.par} onChange={v => setPar(ing.id, v)} style={{ width: 60 }} />
                  </td>
                  <td style={{ padding: "6px 12px" }}><StatusPill status={status} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── RECIPES ──────────────────────────────────────────────────────────────────

function RecipesPage({ lib, ingMap, updateLib }) {
  const [subTab, setSubTab] = useState("specs")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState({})
  const [editing, setEditing] = useState(null)

  const filtered = lib.recipes.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }))

  const saveRecipe = (updated) => {
    updateLib(prev => ({
      ...prev,
      recipes: prev.recipes.map(r => r.id === updated.id ? updated : r)
    }))
    setEditing(null)
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Recipes">
        <SearchBar value={search} onChange={setSearch} placeholder="Search recipes…" />
      </PageTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["specs","margins"].map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            padding: "5px 16px", fontSize: 12, borderRadius: 4, cursor: "pointer",
            background: subTab === t ? "#111827" : "#fff",
            color: subTab === t ? "#fff" : "#374151",
            border: `1px solid ${subTab === t ? "#111827" : "#d1d5db"}`,
          }}>{t === "specs" ? "Recipe Specs" : "Margins"}</button>
        ))}
      </div>

      {editing && (
        <EditRecipeModal recipe={editing} ingredients={lib.ingredients} ingMap={ingMap} onSave={saveRecipe} onClose={() => setEditing(null)} />
      )}

      {subTab === "specs" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Name","Category","Sale Price","Pour Cost","GP","Margin %",""].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((recipe, i) => {
                const pc = calcPourCost(recipe, ingMap)
                const gp = recipe.salePrice - pc
                const margin = recipe.salePrice > 0 ? (gp / recipe.salePrice) * 100 : 0
                return (
                  <>
                    <tr key={recipe.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onClick={() => toggleExpand(recipe.id)}>
                      <td style={{ padding: "7px 12px", fontSize: 12, fontWeight: 500 }}>
                        <span style={{ marginRight: 6, color: "#9ca3af" }}>{expanded[recipe.id] ? "▼" : "▶"}</span>
                        {recipe.name}
                      </td>
                      <td style={{ padding: "7px 12px" }}><CatPill category={recipe.category} /></td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${recipe.salePrice.toFixed(2)}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${pc.toFixed(2)}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${gp.toFixed(2)}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: margin >= 60 ? "#16a34a" : margin >= 40 ? "#d97706" : "#dc2626" }}>
                        {margin.toFixed(1)}%
                      </td>
                      <td style={{ padding: "7px 12px" }}>
                        <button onClick={e => { e.stopPropagation(); setEditing(recipe) }} style={{ fontSize: 11, padding: "2px 8px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: "pointer" }}>Edit</button>
                      </td>
                    </tr>
                    {expanded[recipe.id] && (
                      <tr key={recipe.id + "-exp"}>
                        <td colSpan={7} style={{ padding: "0 12px 12px 32px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                          <table style={{ borderCollapse: "collapse", marginTop: 8 }}>
                            <thead>
                              <tr>
                                {["Ingredient","Qty","Unit","Cost"].map(h => (
                                  <th key={h} style={{ padding: "4px 12px", textAlign: "left", fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {recipe.ingredients.map(ri => {
                                const ing = ingMap[ri.id]
                                if (!ing) return null
                                const cost = ri.qty * costPerUnit(ing)
                                return (
                                  <tr key={ri.id}>
                                    <td style={{ padding: "3px 12px", fontSize: 12 }}>{ing.name}</td>
                                    <td style={{ padding: "3px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{ri.qty}</td>
                                    <td style={{ padding: "3px 12px", fontSize: 12, color: "#6b7280" }}>{ing.recipeUnit}</td>
                                    <td style={{ padding: "3px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${cost.toFixed(4)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {subTab === "margins" && (
        <MarginsTab recipes={lib.recipes} ingMap={ingMap} />
      )}
    </div>
  )
}

function EditRecipeModal({ recipe, ingredients, ingMap, onSave, onClose }) {
  const [name, setName] = useState(recipe.name)
  const [salePrice, setSalePrice] = useState(String(recipe.salePrice))
  const [category, setCategory] = useState(recipe.category)
  const [ings, setIngs] = useState(recipe.ingredients.map(i => ({ ...i })))

  const updateIngQty = (idx, val) => {
    setIngs(prev => prev.map((item, i) => i === idx ? { ...item, qty: parseFloat(val) || 0 } : item))
  }
  const removeIng = (idx) => setIngs(prev => prev.filter((_, i) => i !== idx))
  const addIng = () => setIngs(prev => [...prev, { id: ingredients[0].id, qty: 0 }])

  const handleSave = () => {
    const price = parseFloat(salePrice)
    if (!name.trim() || isNaN(price)) return
    onSave({ ...recipe, name: name.trim(), salePrice: price, category, ingredients: ings.filter(i => i.qty > 0) })
  }

  const pourCost = ings.reduce((s, ri) => {
    const ing = ingMap[ri.id]
    return ing ? s + ri.qty * costPerUnit(ing) : s
  }, 0)
  const price = parseFloat(salePrice) || 0
  const margin = price > 0 ? ((price - pourCost) / price * 100) : 0

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, width: 560, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Edit Recipe</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        <div style={{ padding: "20px" }}>
          {/* Name + Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ gridColumn: "1/3" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>NAME</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>SALE PRICE ($)</label>
              <input type="text" inputMode="decimal" value={salePrice} onChange={e => setSalePrice(e.target.value)}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, fontFamily: "JetBrains Mono, monospace" }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13 }}>
              {["Cocktails","Beer","Wine"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>INGREDIENTS</div>
            {ings.map((ri, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <select value={ri.id} onChange={e => setIngs(prev => prev.map((item, i) => i === idx ? { ...item, id: e.target.value } : item))}
                  style={{ flex: 1, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}>
                  {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                </select>
                <input type="text" inputMode="decimal" value={ri.qty} onChange={e => updateIngQty(idx, e.target.value)}
                  style={{ width: 70, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, monospace", textAlign: "right" }} />
                <span style={{ fontSize: 11, color: "#9ca3af", width: 24 }}>{ingMap[ri.id]?.recipeUnit}</span>
                <button onClick={() => removeIng(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button onClick={addIng} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "1px dashed #93c5fd", borderRadius: 4, padding: "4px 12px", cursor: "pointer", marginTop: 4 }}>
              + Add ingredient
            </button>
          </div>

          {/* Live cost preview */}
          <div style={{ background: "#f9fafb", borderRadius: 6, padding: "10px 14px", display: "flex", gap: 24, marginBottom: 20 }}>
            <div><span style={{ fontSize: 11, color: "#6b7280" }}>Pour Cost </span><span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>${pourCost.toFixed(2)}</span></div>
            <div><span style={{ fontSize: 11, color: "#6b7280" }}>GP </span><span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>${(price - pourCost).toFixed(2)}</span></div>
            <div><span style={{ fontSize: 11, color: "#6b7280" }}>Margin </span><span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: margin >= 60 ? "#16a34a" : margin >= 40 ? "#d97706" : "#dc2626" }}>{margin.toFixed(1)}%</span></div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "7px 16px", border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: "7px 16px", border: "none", borderRadius: 5, background: "#111827", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Save Recipe</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarginsTab({ recipes, ingMap }) {
  const rows = recipes.map(r => {
    const pc = calcPourCost(r, ingMap)
    const gp = r.salePrice - pc
    const margin = r.salePrice > 0 ? (gp / r.salePrice) * 100 : 0
    return { ...r, pourCost: pc, grossProfit: gp, margin }
  }).sort((a, b) => b.margin - a.margin)

  const avgMargin = rows.reduce((s, r) => s + r.margin, 0) / rows.length

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {["Name","Category","Sale Price","Pour Cost","Gross Profit","Margin %","Bar"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "6px 12px", fontSize: 12, fontWeight: 500 }}>{r.name}</td>
              <td style={{ padding: "6px 12px" }}><CatPill category={r.category} /></td>
              <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${r.salePrice.toFixed(2)}</td>
              <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${r.pourCost.toFixed(2)}</td>
              <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${r.grossProfit.toFixed(2)}</td>
              <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: r.margin >= 60 ? "#16a34a" : r.margin >= 40 ? "#d97706" : "#dc2626" }}>
                {r.margin.toFixed(1)}%
              </td>
              <td style={{ padding: "6px 12px", minWidth: 120 }}>
                <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, r.margin)}%`, background: r.margin >= 60 ? "#16a34a" : r.margin >= 40 ? "#d97706" : "#dc2626", borderRadius: 4 }} />
                </div>
              </td>
            </tr>
          ))}
          <tr style={{ background: "#f1f5f9", fontWeight: 700, borderTop: "2px solid #d1d5db" }}>
            <td colSpan={5} style={{ padding: "8px 12px", fontSize: 12 }}>Average</td>
            <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{avgMargin.toFixed(1)}%</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── SALES ────────────────────────────────────────────────────────────────────

function SalesPage({ lib, period, ingMap, weekSales, setWeekSales, logWeek }) {
  const [subTab, setSubTab] = useState("week")
  const [search, setSearch] = useState("")
  const [expandedWeek, setExpandedWeek] = useState({})

  const groups = ["Cocktails", "Beer", "Wine"]
  const filtered = lib.recipes.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))

  const weekRevenue = lib.recipes.reduce((s, r) => s + r.salePrice * (weekSales[r.id] || 0), 0)
  const weekPourCost = lib.recipes.reduce((s, r) => s + calcPourCost(r, ingMap) * (weekSales[r.id] || 0), 0)
  const weekGP = weekRevenue - weekPourCost

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Sales">
        {subTab === "week" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search drinks…" />
            <button onClick={logWeek} style={{ padding: "7px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Log This Week
            </button>
          </div>
        )}
      </PageTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["week","This Week"],["log","Monthly Log"]].map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{
            padding: "5px 16px", fontSize: 12, borderRadius: 4, cursor: "pointer",
            background: subTab === id ? "#111827" : "#fff",
            color: subTab === id ? "#fff" : "#374151",
            border: `1px solid ${subTab === id ? "#111827" : "#d1d5db"}`,
          }}>{label}</button>
        ))}
      </div>

      {subTab === "week" && (
        <>
          {groups.map(group => {
            const groupRecipes = filtered.filter(r => r.category === group)
            if (groupRecipes.length === 0) return null
            return (
              <div key={group} style={{ marginBottom: 20, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 700, fontSize: 12, color: "#374151" }}>{group}</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Drink","Category","Qty Sold","Revenue","Pour Cost","GP"].map(h => (
                        <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupRecipes.map((recipe, i) => {
                      const qty = weekSales[recipe.id] || 0
                      const pc = calcPourCost(recipe, ingMap)
                      const rev = recipe.salePrice * qty
                      const pourCostTotal = pc * qty
                      const gp = rev - pourCostTotal
                      return (
                        <tr key={recipe.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500 }}>{recipe.name}</td>
                          <td style={{ padding: "5px 12px" }}><CatPill category={recipe.category} /></td>
                          <td style={{ padding: "4px 8px" }}>
                            <NumInput value={qty} onChange={v => setWeekSales(p => ({ ...p, [recipe.id]: v }))} style={{ width: 60 }} />
                          </td>
                          <td style={{ padding: "5px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${rev.toFixed(2)}</td>
                          <td style={{ padding: "5px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${pourCostTotal.toFixed(2)}</td>
                          <td style={{ padding: "5px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: gp >= 0 ? "#16a34a" : "#dc2626" }}>${gp.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}
          {/* Totals */}
          <div style={{ background: "#111827", color: "#fff", borderRadius: 6, padding: "12px 16px", display: "flex", gap: 32 }}>
            <TotalItem label="Total Revenue" value={`$${weekRevenue.toFixed(2)}`} />
            <TotalItem label="Total Pour Cost" value={`$${weekPourCost.toFixed(2)}`} />
            <TotalItem label="Gross Profit" value={`$${weekGP.toFixed(2)}`} highlight />
          </div>
        </>
      )}

      {subTab === "log" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Week","Date","Drinks Sold","Revenue","Pour Cost","GP"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {period.weeklyLog.map((wk, i) => {
                const recipes = lib.recipes
                const wkRevenue = recipes.reduce((s, r) => s + r.salePrice * (wk.sales[r.id] || 0), 0)
                const wkPourCost = recipes.reduce((s, r) => s + calcPourCost(r, { ...Object.fromEntries(DEFAULT_INGREDIENTS.map(x => [x.id, x])) }) * (wk.sales[r.id] || 0), 0)
                const wkDrinks = Object.values(wk.sales).reduce((s, v) => s + v, 0)
                const wkGP = wkRevenue - wkPourCost
                return (
                  <>
                    <tr key={wk.label} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onClick={() => setExpandedWeek(p => ({ ...p, [i]: !p[i] }))}>
                      <td style={{ padding: "7px 12px", fontSize: 12, fontWeight: 600 }}>
                        <span style={{ marginRight: 6, color: "#9ca3af" }}>{expandedWeek[i] ? "▼" : "▶"}</span>
                        {wk.label}
                      </td>
                      <td style={{ padding: "7px 12px", fontSize: 12 }}>{wk.weekOf}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{wkDrinks}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${wkRevenue.toFixed(2)}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${wkPourCost.toFixed(2)}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#16a34a" }}>${wkGP.toFixed(2)}</td>
                    </tr>
                    {expandedWeek[i] && (
                      <tr key={wk.label + "-exp"}>
                        <td colSpan={6} style={{ padding: "0 12px 12px 32px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                          <table style={{ borderCollapse: "collapse", marginTop: 8 }}>
                            <thead>
                              <tr>{["Drink","Qty","Revenue"].map(h => <th key={h} style={{ padding: "3px 12px", textAlign:"left", fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                              {Object.entries(wk.sales).filter(([, q]) => q > 0).map(([rid, qty]) => {
                                const r = lib.recipes.find(x => x.id === rid)
                                if (!r) return null
                                return (
                                  <tr key={rid}>
                                    <td style={{ padding: "2px 12px", fontSize: 12 }}>{r.name}</td>
                                    <td style={{ padding: "2px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{qty}</td>
                                    <td style={{ padding: "2px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${(r.salePrice * qty).toFixed(2)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              {period.weeklyLog.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "24px 12px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>No weeks logged yet</td></tr>
              )}
              {/* Monthly totals */}
              {period.weeklyLog.length > 0 && (() => {
                const mRev = lib.recipes.reduce((s, r) => s + r.salePrice * (period.monthlySales[r.id] || 0), 0)
                const ingMapAll = Object.fromEntries(DEFAULT_INGREDIENTS.map(x => [x.id, x]))
                const mPC = lib.recipes.reduce((s, r) => s + calcPourCost(r, ingMapAll) * (period.monthlySales[r.id] || 0), 0)
                const mDrinks = Object.values(period.monthlySales).reduce((s, v) => s + v, 0)
                return (
                  <tr style={{ background: "#1f2937", color: "#fff", fontWeight: 700, borderTop: "2px solid #374151" }}>
                    <td colSpan={2} style={{ padding: "8px 12px", fontSize: 12 }}>Monthly Total</td>
                    <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{mDrinks}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${mRev.toFixed(2)}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${mPC.toFixed(2)}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#86efac" }}>${(mRev - mPC).toFixed(2)}</td>
                  </tr>
                )
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function TotalItem({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 16, fontWeight: 700, color: highlight ? "#86efac" : "#fff" }}>{value}</div>
    </div>
  )
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

function OrdersPage({ lib, theoClose, ingMap }) {
  const [showAll, setShowAll] = useState(false)
  const [catFilter, setCatFilter] = useState("All")
  const cats = ["All", ...Array.from(new Set(lib.ingredients.map(i => i.category)))]

  const rows = lib.ingredients
    .map(ing => {
      const rem = toPurch(ing, theoClose[ing.id] || 0)
      const toOrd = orderSuggestion(ing, theoClose)
      const used = (theoClose[ing.id] !== undefined)
        ? (/* calculate usage from open+del-theo */ 0)
        : 0
      return { ing, rem, toOrd }
    })
    .filter(r => showAll || r.toOrd > 0)
    .filter(r => catFilter === "All" || r.ing.category === catFilter)
    .sort((a, b) => {
      const aUrgency = a.ing.par - a.rem
      const bUrgency = b.ing.par - b.rem
      return bUrgency - aUrgency
    })

  const totalOrder = rows.filter(r => r.toOrd > 0).length
  const estCost = rows.reduce((s, r) => s + r.toOrd * r.ing.costPerPurchaseUnit, 0)

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Orders">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />
            Show all items
          </label>
        </div>
      </PageTitle>

      {/* Summary */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Items to order</div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: totalOrder > 0 ? "#dc2626" : "#16a34a" }}>{totalOrder}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Estimated order cost</div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700 }}>${estCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: "4px 12px", fontSize: 12, borderRadius: 20, cursor: "pointer",
            background: catFilter === c ? "#111827" : "#fff",
            color: catFilter === c ? "#fff" : "#374151",
            border: `1px solid ${catFilter === c ? "#111827" : "#d1d5db"}`,
          }}>{c}</button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Name","Category","Remaining","Par","To Order","Unit","Est. Cost"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ ing, rem, toOrd }, i) => (
              <tr key={ing.id} style={{ background: toOrd === 0 ? "#f9fafb" : i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6", opacity: toOrd === 0 ? 0.5 : 1 }}>
                <td style={{ padding: "6px 12px", fontSize: 12, fontWeight: 500 }}>{ing.name}</td>
                <td style={{ padding: "6px 12px" }}><CatPill category={ing.category} /></td>
                <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: rem < 0 ? "#dc2626" : "#374151" }}>{rem.toFixed(2)}</td>
                <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{ing.par}</td>
                <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: toOrd > 0 ? "#dc2626" : "#16a34a" }}>{toOrd}</td>
                <td style={{ padding: "6px 12px", fontSize: 12, color: "#6b7280" }}>{ing.purchaseUnit}</td>
                <td style={{ padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${(toOrd * ing.costPerPurchaseUnit).toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "24px 12px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>🎉 All items are at or above par</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── SHARED ───────────────────────────────────────────────────────────────────

function PageTitle({ title, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.5px" }}>{title}</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{children}</div>
    </div>
  )
}
