import { useState, useEffect, useCallback, useRef } from "react"

//- SEED DATA -

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

//- HELPERS -

const isBeer = (ing) => ing.category === "Beer & Cider"
const countUnit = (ing) => isBeer(ing) ? "bottle" : ing.purchaseUnit
const countSize = (ing) => isBeer(ing) ? 1 : ing.purchaseSize
const countToBase = (ing, v) => (v || 0) * countSize(ing)
const baseToCount = (ing, v) => (v || 0) / countSize(ing)
const toPurch = (ing, baseVal) => baseVal / ing.purchaseSize

const costPerUnit = (ing) => ing.costPerPurchaseUnit / ing.purchaseSize

//- Batch helpers -

// Get the most recent batch log entry for a batch id
const getLatestRun = (batchId, batchLog) => {
  const runs = (batchLog || []).filter(r => r.batchId === batchId)
  return runs.length ? runs[runs.length - 1] : null
}

// Cost per ml of finished batch from a run (all input costs / finalMl)
const batchCostPerMl = (run, ingMap) => {
  if (!run || !run.finalMl || run.finalMl <= 0) return 0
  const totalCost = (run.inputs || []).reduce((s, inp) => {
    const ing = ingMap[inp.id]
    if (!ing) return s
    return s + inp.qty * costPerUnit(ing)
  }, 0)
  return totalCost / run.finalMl
}

// True ingredient deduction per ml of finished batch consumed (liquid inputs only, proportional)
const batchIngUsagePerMl = (run, ingMap) => {
  if (!run || !run.finalMl || run.finalMl <= 0) return {}
  const usage = {}
  const liquidInputTotal = (run.inputs || []).reduce((s, inp) => {
    const ing = ingMap[inp.id]
    if (!ing) return s
    return ing.recipeUnit === "ml" ? s + inp.qty : s
  }, 0)
  if (liquidInputTotal <= 0) return {}
  const inputs = run.inputs || []
  inputs.forEach(inp => {
    const ing = ingMap[inp.id]
    if (!ing) return
    usage[inp.id] = (usage[inp.id] || 0) + (inp.qty / run.finalMl)
  })
  return usage
}

// Build a combined ingredient+batch lookup for recipe cost calc
const calcPourCost = (recipe, ingMap, batchMap, batchLog) => {
  if (!recipe || !recipe.ingredients) return 0
  return recipe.ingredients.reduce((sum, ri) => {
    if (ri.isBatch) {
      const run = getLatestRun(ri.id, batchLog)
      return sum + ri.qty * batchCostPerMl(run, ingMap)
    }
    const ing = ingMap[ri.id]
    if (!ing) return sum
    return sum + ri.qty * costPerUnit(ing)
  }, 0)
}

const calcUsage = (monthlySales, recipes, ingMap, batchMap, batchLog) => {
  const usage = {}
  Object.entries(monthlySales).forEach(([recipeId, qty]) => {
    const recipe = recipes.find(r => r.id === recipeId)
    if (!recipe) return
    recipe.ingredients.forEach(ri => {
      if (ri.isBatch) {
        // Deduct raw ingredients through the batch at latest-run proportions
        const run = getLatestRun(ri.id, batchLog)
        if (!run) return
        const perMl = batchIngUsagePerMl(run, ingMap)
        Object.entries(perMl).forEach(([ingId, perMlQty]) => {
          usage[ingId] = (usage[ingId] || 0) + perMlQty * ri.qty * qty
        })
      } else {
        usage[ri.id] = (usage[ri.id] || 0) + ri.qty * qty
      }
    })
  })
  return usage
}

// Batch stock: theoretical remaining in ml
const calcBatchTheoClose = (batch, period, monthlySales, recipes) => {
  const openMl = period.batchOpeningStock?.[batch.id] || 0
  // sum of ml consumed by all recipes that use this batch
  let usedMl = 0
  recipes.forEach(r => {
    const sold = monthlySales[r.id] || 0
    if (!sold) return
    r.ingredients.forEach(ri => {
      if (ri.isBatch && ri.id === batch.id) usedMl += ri.qty * sold
    })
  })
  return openMl - usedMl
}

const getBatchStatus = (batch, theoMl) => {
  if (theoMl >= batch.parMl) return "Above Par"
  if (theoMl >= batch.parMl * 0.8) return "At Par"
  if (theoMl > 0) return "Low -- Make Soon"
  return "Out of Stock"
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

//- ATOMS -

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
    placeholder={placeholder || "Search..."}
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

//- MAIN APP -

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
        const loadedLib = libRes ? JSON.parse(libRes.value) : { ingredients: DEFAULT_INGREDIENTS, recipes: DEFAULT_RECIPES, batches: [] }
        if (!loadedLib.batches) loadedLib.batches = []
        setLib(loadedLib)
        const loadedPeriod = perRes ? JSON.parse(perRes.value) : defaultPeriod()
        if (!loadedPeriod.batchOpeningStock) loadedPeriod.batchOpeningStock = {}
        if (!loadedPeriod.batchClosingStock) loadedPeriod.batchClosingStock = {}
        if (!loadedPeriod.batchLog) loadedPeriod.batchLog = []
        setPeriod(loadedPeriod)
      } catch {
        setLib({ ingredients: DEFAULT_INGREDIENTS, recipes: DEFAULT_RECIPES, batches: [] })
        setPeriod(defaultPeriod())
      }
    }
    loadData()
  }, [])

  const defaultPeriod = () => ({
    openingStock: {}, deliveries: {}, closingStock: {},
    batchOpeningStock: {}, batchClosingStock: {}, batchLog: [],
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

  if (!lib || !period) return <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#374151" }}>Loading Bar Buddy...</div>

  const ingMap = Object.fromEntries(lib.ingredients.map(i => [i.id, i]))
  const batchMap = Object.fromEntries((lib.batches || []).map(b => [b.id, b]))
  const batchLog = period.batchLog || []
  const usage = calcUsage(period.monthlySales, lib.recipes, ingMap, batchMap, batchLog)
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
    const newBatchOpening = {}
    const allBatches = lib.batches || []
    allBatches.forEach(b => {
      const closing = period.batchClosingStock?.[b.id]
      newBatchOpening[b.id] = closing !== undefined ? closing : Math.max(0, calcBatchTheoClose(b, period, period.monthlySales, lib.recipes))
    })
    updatePeriod({
      openingStock: newOpening,
      deliveries: {}, closingStock: {},
      batchOpeningStock: newBatchOpening,
      batchClosingStock: {}, batchLog: [],
      monthlySales: {}, weeklyLog: [],
      monthStart: new Date().toISOString().slice(0, 10),
      weekNum: 1,
    })
    setWeekSales({})
  }

  const hasPendingWeek = Object.keys(weekSales).some(k => weekSales[k] > 0)
  const monthName = new Date(period.monthStart).toLocaleString("default", { month: "long", year: "numeric" })

  //- Layout -
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
            ["batches",   "Batches"],
            ["recipes",   "Recipes"],
            ["sales",     "Sales"],
            ["orders",    "Orders"],
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
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>{monthName} ? Week {period.weekNum}</div>
          {hasPendingWeek && (
            <button onClick={logWeek} style={{ display: "block", width: "100%", padding: "7px 0", marginBottom: 6, background: "#111827", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Log Week
            </button>
          )}
          <button onClick={newMonth} style={{ display: "block", width: "100%", padding: "7px 0", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>
            New Month
          </button>
          <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af" }}>* Saved</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {tab === "dashboard" && <DashboardPage lib={lib} period={period} ingMap={ingMap} batchMap={batchMap} batchLog={batchLog} usage={usage} theoClose={theoClose} getStatus={getStatus} setTab={setTab} />}
        {tab === "inventory" && <InventoryPage lib={lib} period={period} ingMap={ingMap} theoClose={theoClose} usage={usage} getStatus={getStatus} updatePeriod={updatePeriod} updateLib={updateLib} />}
        {tab === "batches"   && <BatchesPage lib={lib} period={period} ingMap={ingMap} batchLog={batchLog} updateLib={updateLib} updatePeriod={updatePeriod} />}
        {tab === "recipes"   && <RecipesPage lib={lib} ingMap={ingMap} batchMap={batchMap} batchLog={batchLog} updateLib={updateLib} />}
        {tab === "sales"     && <SalesPage lib={lib} period={period} ingMap={ingMap} batchMap={batchMap} batchLog={batchLog} weekSales={weekSales} setWeekSales={setWeekSales} logWeek={logWeek} />}
        {tab === "orders"    && <OrdersPage lib={lib} theoClose={theoClose} ingMap={ingMap} />}
      </main>
    </div>
  )
}

//- DASHBOARD -

function DashboardPage({ lib, period, ingMap, batchMap, batchLog, usage, theoClose, getStatus, setTab }) {
  const totalRevenue = lib.recipes.reduce((sum, r) => sum + r.salePrice * (period.monthlySales[r.id] || 0), 0)
  const totalPourCost = lib.recipes.reduce((sum, r) => sum + calcPourCost(r, ingMap, batchMap, batchLog) * (period.monthlySales[r.id] || 0), 0)
  const grossProfit = totalRevenue - totalPourCost
  const avgMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  const orderNeeded = lib.ingredients.filter(ing => {
    const s = getStatus(ing)
    return s === "Order Needed" || s === "Critical"
  })

  // Batch alerts
  const batchAlerts = (lib.batches || []).filter(b => {
    const theoMl = calcBatchTheoClose(b, period, period.monthlySales, lib.recipes)
    const s = getBatchStatus(b, theoMl)
    return s === "Low -- Make Soon" || s === "Out of Stock"
  })

  const recipeMargins = lib.recipes.map(r => {
    const pc = calcPourCost(r, ingMap, batchMap, batchLog)
    const gp = r.salePrice - pc
    const margin = r.salePrice > 0 ? (gp / r.salePrice) * 100 : 0
    return { ...r, pourCost: pc, grossProfit: gp, margin }
  }).sort((a, b) => b.margin - a.margin)

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
    { label: "Batch Alerts",  value: batchAlerts.length, sub: "batches low/out", warn: batchAlerts.length > 0 },
  ]

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Dashboard" />
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: "#fff", border: `1px solid ${k.warn ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 6, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: k.warn ? "#dc2626" : "#111827" }}>{k.value}</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Batch Alerts banner */}
      {batchAlerts.length > 0 && (
        <div style={{ marginBottom: 20, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#c2410c" }}>⚠ {batchAlerts.length} batch{batchAlerts.length > 1 ? "es" : ""} need making:</span>
          <span style={{ fontSize: 12, color: "#9a3412" }}>{batchAlerts.map(b => b.name).join(", ")}</span>
          <button onClick={() => setTab("batches")} style={{ marginLeft: "auto", fontSize: 11, color: "#c2410c", background: "none", border: "none", cursor: "pointer" }}>Go to Batches -></button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Order Alerts */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Order Alerts</span>
            <button onClick={() => setTab("orders")} style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>View Full Report -></button>
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

//- INVENTORY -

const CATEGORIES = Object.keys(CATEGORY_META)

function InventoryPage({ lib, period, ingMap, theoClose, usage, getStatus, updatePeriod, updateLib }) {
  const [catFilter, setCatFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [editMode, setEditMode] = useState(false)
  const cats = ["All", ...CATEGORIES]

  const filtered = lib.ingredients.filter(ing => {
    if (catFilter !== "All" && ing.category !== catFilter) return false
    if (search && !ing.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const setStock = (field, id, val) => {
    updatePeriod(prev => ({ ...prev, [field]: { ...prev[field], [id]: val } }))
  }

  const updateIngField = (id, field, val) => {
    updateLib(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => ing.id === id ? { ...ing, [field]: val } : ing)
    }))
  }

  const deleteIng = (id) => {
    if (!window.confirm("Remove this ingredient? This cannot be undone.")) return
    updateLib(prev => ({ ...prev, ingredients: prev.ingredients.filter(i => i.id !== id) }))
  }

  const addIngredient = () => {
    const newId = "ing_" + Date.now()
    const newIng = {
      id: newId, name: "New Ingredient", category: "Spirits",
      recipeUnit: "ml", purchaseUnit: "bottle", purchaseSize: 700,
      par: 2, costPerPurchaseUnit: 0,
    }
    updateLib(prev => ({ ...prev, ingredients: [...prev.ingredients, newIng] }))
  }

  const cellInput = (val, onChange, opts = {}) => (
    <input
      type="text" inputMode={opts.numeric ? "decimal" : "text"}
      defaultValue={val}
      onFocus={e => e.target.select()}
      onBlur={e => {
        const v = opts.numeric ? (parseFloat(e.target.value) || 0) : e.target.value.trim()
        onChange(v)
      }}
      style={{
        width: opts.width || "100%", padding: "3px 6px",
        border: "1px solid #d1d5db", borderRadius: 3,
        fontSize: 12, fontFamily: opts.mono ? "JetBrains Mono, monospace" : "inherit",
        background: "#fff",
      }}
    />
  )

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Inventory">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search ingredients..." />
          {editMode ? (
            <>
              <button onClick={addIngredient} style={{ padding: "6px 14px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer" }}>
                + Add Product
              </button>
              <button onClick={() => setEditMode(false)} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 5, background: "#111827", color: "#fff", cursor: "pointer" }}>
                Done Editing
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} style={{ padding: "6px 14px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer", color: "#374151" }}>
              Edit Inventory
            </button>
          )}
        </div>
      </PageTitle>

      {editMode && (
        <div style={{ marginBottom: 12, padding: "8px 14px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 6, fontSize: 12, color: "#854d0e" }}>
          Edit mode active -- click any cell to edit name, category, cost, size, par, or units. Changes save automatically.
        </div>
      )}

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

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: editMode ? 1100 : 900 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {editMode
                ? ["Name","Category","Recipe Unit","Purchase Unit","Size","Cost ($)","Par","Opening","Deliveries","Closing","Variance","Status",""].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                  ))
                : ["Name","Category","Opening Stock","Deliveries","Closing Stock","Theoretical","Variance","Par","Status"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                  ))
              }
            </tr>
          </thead>
          <tbody>
            {filtered.map((ing, i) => {
              const theo = theoClose[ing.id] || 0
              const theoInCount = baseToCount(ing, theo)
              const variance = calcVariance(ing, theoClose, period.closingStock)
              const status = getStatus(ing)
              const unit = countUnit(ing)
              const rowBg = i % 2 === 0 ? "#fff" : "#fafafa"

              if (editMode) {
                return (
                  <tr key={ing.id} style={{ background: rowBg, borderBottom: "1px solid #f3f4f6" }}>
                    {/* Name */}
                    <td style={{ padding: "4px 8px", minWidth: 160 }}>
                      {cellInput(ing.name, v => updateIngField(ing.id, "name", v))}
                    </td>
                    {/* Category */}
                    <td style={{ padding: "4px 8px", minWidth: 130 }}>
                      <select
                        defaultValue={ing.category}
                        onBlur={e => updateIngField(ing.id, "category", e.target.value)}
                        style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 3, fontSize: 12 }}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    {/* Recipe Unit */}
                    <td style={{ padding: "4px 8px", minWidth: 80 }}>
                      <select
                        defaultValue={ing.recipeUnit}
                        onBlur={e => updateIngField(ing.id, "recipeUnit", e.target.value)}
                        style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 3, fontSize: 12 }}
                      >
                        {["ml","g","unit"].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    {/* Purchase Unit */}
                    <td style={{ padding: "4px 8px", minWidth: 100 }}>
                      {cellInput(ing.purchaseUnit, v => updateIngField(ing.id, "purchaseUnit", v))}
                    </td>
                    {/* Purchase Size */}
                    <td style={{ padding: "4px 8px", minWidth: 70 }}>
                      {cellInput(ing.purchaseSize, v => updateIngField(ing.id, "purchaseSize", v), { numeric: true, mono: true, width: 70 })}
                    </td>
                    {/* Cost */}
                    <td style={{ padding: "4px 8px", minWidth: 80 }}>
                      {cellInput(ing.costPerPurchaseUnit, v => updateIngField(ing.id, "costPerPurchaseUnit", v), { numeric: true, mono: true, width: 70 })}
                    </td>
                    {/* Par */}
                    <td style={{ padding: "4px 8px", minWidth: 60 }}>
                      {cellInput(ing.par, v => updateIngField(ing.id, "par", v), { numeric: true, mono: true, width: 55 })}
                    </td>
                    {/* Opening */}
                    <td style={{ padding: "4px 8px", minWidth: 80 }}>
                      <NumInput value={period.openingStock[ing.id] || 0} onChange={v => setStock("openingStock", ing.id, v)} style={{ width: 65 }} />
                    </td>
                    {/* Deliveries */}
                    <td style={{ padding: "4px 8px", minWidth: 80 }}>
                      <NumInput value={period.deliveries[ing.id] || 0} onChange={v => setStock("deliveries", ing.id, v)} style={{ width: 65 }} />
                    </td>
                    {/* Closing */}
                    <td style={{ padding: "4px 8px", minWidth: 80 }}>
                      <NumInput value={period.closingStock[ing.id] || ""} onChange={v => setStock("closingStock", ing.id, v)} style={{ width: 65 }} />
                    </td>
                    {/* Variance */}
                    <td style={{ padding: "6px 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 700, color: variance < -0.05 ? "#dc2626" : variance > 0.05 ? "#16a34a" : "#6b7280", whiteSpace: "nowrap" }}>
                      {variance >= 0 ? "+" : ""}{variance.toFixed(2)}
                    </td>
                    {/* Status */}
                    <td style={{ padding: "4px 8px" }}><StatusPill status={status} /></td>
                    {/* Delete */}
                    <td style={{ padding: "4px 8px", textAlign: "center" }}>
                      <button onClick={() => deleteIng(ing.id)} title="Remove ingredient" style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>×</button>
                    </td>
                  </tr>
                )
              }

              // Normal (read) mode
              return (
                <tr key={ing.id} style={{ background: rowBg, borderBottom: "1px solid #f3f4f6" }}>
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
                    <NumInput value={ing.par} onChange={v => updateIngField(ing.id, "par", v)} style={{ width: 60 }} />
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

//- BATCHES -

const BATCH_METHOD_TAGS = ["Premix","Fat Wash","Clarified","Carbonated","Infusion","Other"]

function BatchesPage({ lib, period, ingMap, batchLog, updateLib, updatePeriod }) {
  const [subTab, setSubTab] = useState("stock")
  const [showNewBatch, setShowNewBatch] = useState(false)
  const [logBatch, setLogBatch] = useState(null)

  const batches = lib.batches || []

  const addBatch = (b) => {
    updateLib(prev => ({ ...prev, batches: [...(prev.batches || []), b] }))
    setShowNewBatch(false)
  }

  const deleteBatch = (id) => {
    if (!window.confirm("Delete this batch? This cannot be undone.")) return
    updateLib(prev => ({ ...prev, batches: (prev.batches || []).filter(b => b.id !== id) }))
  }

  const saveRun = (run) => {
    updatePeriod(prev => ({ ...prev, batchLog: [...(prev.batchLog || []), run] }))
    setLogBatch(null)
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Batches">
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowNewBatch(true)} style={{ padding: "6px 14px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer" }}>
            + New Batch
          </button>
        </div>
      </PageTitle>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["stock","Batch Stock"],["log","Production Log"],["library","Batch Library"]].map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{
            padding: "5px 16px", fontSize: 12, borderRadius: 4, cursor: "pointer",
            background: subTab === id ? "#111827" : "#fff",
            color: subTab === id ? "#fff" : "#374151",
            border: `1px solid ${subTab === id ? "#111827" : "#d1d5db"}`,
          }}>{label}</button>
        ))}
      </div>

      {showNewBatch && <NewBatchModal ingredients={lib.ingredients} ingMap={ingMap} onSave={addBatch} onClose={() => setShowNewBatch(false)} />}
      {logBatch && <BatchRunModal batch={logBatch} ingredients={lib.ingredients} ingMap={ingMap} onSave={saveRun} onClose={() => setLogBatch(null)} />}

      {/* BATCH STOCK tab */}
      {subTab === "stock" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Batch Name","Method","Par (ml)","Opening (ml)","Closing (ml)","Theoretical (ml)","Variance (ml)","Status",""].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, i) => {
                const theoMl = calcBatchTheoClose(batch, period, period.monthlySales, lib.recipes)
                const closingMl = period.batchClosingStock?.[batch.id] ?? ""
                const actualMl = closingMl !== "" ? parseFloat(closingMl) || 0 : null
                const variance = actualMl !== null ? actualMl - theoMl : null
                const status = getBatchStatus(batch, theoMl)
                const latestRun = getLatestRun(batch.id, batchLog)
                const cpml = batchCostPerMl(latestRun, ingMap)
                return (
                  <tr key={batch.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "7px 12px" }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{batch.name}</div>
                      {cpml > 0 && <div style={{ fontSize: 10, color: "#6b7280" }}>${cpml.toFixed(4)}/ml (latest run)</div>}
                    </td>
                    <td style={{ padding: "7px 12px" }}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#f3f4f6", color: "#374151", fontWeight: 500 }}>{batch.method}</span>
                    </td>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{batch.parMl}</td>
                    <td style={{ padding: "4px 8px" }}>
                      <NumInput
                        value={period.batchOpeningStock?.[batch.id] || 0}
                        onChange={v => updatePeriod(prev => ({ ...prev, batchOpeningStock: { ...prev.batchOpeningStock, [batch.id]: v } }))}
                        style={{ width: 72 }}
                      />
                    </td>
                    <td style={{ padding: "4px 8px" }}>
                      <NumInput
                        value={period.batchClosingStock?.[batch.id] || ""}
                        onChange={v => updatePeriod(prev => ({ ...prev, batchClosingStock: { ...prev.batchClosingStock, [batch.id]: v } }))}
                        style={{ width: 72 }}
                      />
                    </td>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{theoMl.toFixed(0)}</td>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700,
                      color: variance === null ? "#9ca3af" : variance < -50 ? "#dc2626" : variance > 50 ? "#16a34a" : "#6b7280" }}>
                      {variance === null ? "--" : `${variance >= 0 ? "+" : ""}${variance.toFixed(0)}`}
                    </td>
                    <td style={{ padding: "7px 12px" }}>
                      <BatchStatusPill status={status} />
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <button onClick={() => setLogBatch(batch)} style={{ fontSize: 11, padding: "3px 10px", border: "1px solid #111827", borderRadius: 4, background: "#111827", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
                        Log Run
                      </button>
                    </td>
                  </tr>
                )
              })}
              {batches.length === 0 && (
                <tr><td colSpan={9} style={{ padding: "32px 12px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                  No batches yet -- click "New Batch" to create one
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PRODUCTION LOG tab */}
      {subTab === "log" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Date","Batch","Inputs","Final Yield (ml)","Yield %","Cost/ml","Total Cost"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...(batchLog || [])].reverse().map((run, i) => {
                const batch = (lib.batches || []).find(b => b.id === run.batchId)
                const totalLiquidIn = (run.inputs || []).reduce((s, inp) => {
                  const ing = ingMap[inp.id]
                  return ing?.recipeUnit === "ml" ? s + inp.qty : s
                }, 0)
                const yieldPct = totalLiquidIn > 0 ? (run.finalMl / totalLiquidIn) * 100 : 0
                const cpml = batchCostPerMl(run, ingMap)
                const totalCost = cpml * run.finalMl
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "7px 12px", fontSize: 12 }}>{run.date}</td>
                    <td style={{ padding: "7px 12px", fontSize: 12, fontWeight: 600 }}>{batch?.name || run.batchId}</td>
                    <td style={{ padding: "7px 12px", fontSize: 11, color: "#6b7280", maxWidth: 220 }}>
                      {(run.inputs || []).map(inp => {
                        const ing = ingMap[inp.id]
                        return ing ? `${inp.qty}${ing.recipeUnit} ${ing.name}` : null
                      }).filter(Boolean).join(", ")}
                    </td>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{run.finalMl}ml</td>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: yieldPct >= 85 ? "#16a34a" : yieldPct >= 70 ? "#d97706" : "#dc2626" }}>
                      {yieldPct.toFixed(1)}%
                    </td>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${cpml.toFixed(4)}</td>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600 }}>${totalCost.toFixed(2)}</td>
                  </tr>
                )
              })}
              {(!batchLog || batchLog.length === 0) && (
                <tr><td colSpan={7} style={{ padding: "32px 12px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>No batch runs logged yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* LIBRARY tab */}
      {subTab === "library" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Batch Name","Method","Par (ml)","Default Inputs","Used In",""].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, i) => {
                const usedIn = lib.recipes.filter(r => r.ingredients.some(ri => ri.isBatch && ri.id === batch.id))
                return (
                  <tr key={batch.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "7px 12px", fontSize: 12, fontWeight: 600 }}>{batch.name}</td>
                    <td style={{ padding: "7px 12px" }}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#f3f4f6", fontWeight: 500 }}>{batch.method}</span>
                    </td>
                    <td style={{ padding: "7px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{batch.parMl}ml</td>
                    <td style={{ padding: "7px 12px", fontSize: 11, color: "#6b7280" }}>
                      {(batch.defaultInputs || []).map(inp => {
                        const ing = ingMap[inp.id]
                        return ing ? `${inp.qty}${ing.recipeUnit} ${ing.name}` : null
                      }).filter(Boolean).join(", ") || "--"}
                    </td>
                    <td style={{ padding: "7px 12px", fontSize: 11, color: "#374151" }}>
                      {usedIn.length ? usedIn.map(r => r.name).join(", ") : <span style={{ color: "#9ca3af" }}>Not used in any recipe</span>}
                    </td>
                    <td style={{ padding: "7px 8px", textAlign: "center" }}>
                      <button onClick={() => deleteBatch(batch.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>×</button>
                    </td>
                  </tr>
                )
              })}
              {batches.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "32px 12px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>No batches defined yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BatchStatusPill({ status }) {
  const map = {
    "Above Par":     { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    "At Par":        { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
    "Low -- Make Soon":{ bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
    "Out of Stock":  { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  }
  const s = map[status] || map["Above Par"]
  return <span style={{ display:"inline-block", padding:"1px 7px", borderRadius:10, fontSize:11, fontWeight:600, background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>{status}</span>
}

function NewBatchModal({ ingredients, ingMap, onSave, onClose }) {
  const [name, setName] = useState("")
  const [method, setMethod] = useState("Premix")
  const [parMl, setParMl] = useState("1000")
  const [inputs, setInputs] = useState([{ id: ingredients[0]?.id || "", qty: 0 }])

  const addInput = () => setInputs(p => [...p, { id: ingredients[0]?.id || "", qty: 0 }])
  const removeInput = (i) => setInputs(p => p.filter((_, idx) => idx !== i))
  const updateInput = (i, field, val) => setInputs(p => p.map((inp, idx) => idx === i ? { ...inp, [field]: val } : inp))

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id: "batch_" + Date.now(),
      name: name.trim(), method,
      parMl: parseFloat(parMl) || 1000,
      defaultInputs: inputs.filter(i => i.qty > 0),
    })
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, width: 520, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>New Batch</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 12, marginBottom: 16 }}>
            <div style={{ gridColumn: "1/2" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>BATCH NAME</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fat Washed Chivas"
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>METHOD</label>
              <select value={method} onChange={e => setMethod(e.target.value)}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13 }}>
                {BATCH_METHOD_TAGS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>PAR (ml)</label>
              <input type="text" inputMode="decimal" value={parMl} onChange={e => setParMl(e.target.value)}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, fontFamily: "JetBrains Mono, monospace" }} />
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>DEFAULT INPUTS (pre-filled when logging a run)</div>
          {inputs.map((inp, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
              <select value={inp.id} onChange={e => updateInput(idx, "id", e.target.value)}
                style={{ flex: 1, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}>
                {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
              </select>
              <input type="text" inputMode="decimal" value={inp.qty} onChange={e => updateInput(idx, "qty", parseFloat(e.target.value) || 0)}
                style={{ width: 80, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, monospace", textAlign: "right" }} />
              <span style={{ fontSize: 11, color: "#9ca3af", width: 24 }}>{ingMap[inp.id]?.recipeUnit}</span>
              <button onClick={() => removeInput(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>×</button>
            </div>
          ))}
          <button onClick={addInput} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "1px dashed #93c5fd", borderRadius: 4, padding: "4px 12px", cursor: "pointer", marginTop: 4, marginBottom: 20 }}>
            + Add ingredient
          </button>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "7px 16px", border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: "7px 16px", border: "none", borderRadius: 5, background: "#111827", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Create Batch</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BatchRunModal({ batch, ingredients, ingMap, onSave, onClose }) {
  const [inputs, setInputs] = useState(
    (batch.defaultInputs || []).length > 0
      ? batch.defaultInputs.map(i => ({ ...i }))
      : [{ id: ingredients[0]?.id || "", qty: 0 }]
  )
  const [finalMl, setFinalMl] = useState("")
  const date = new Date().toISOString().slice(0, 10)

  const addInput = () => setInputs(p => [...p, { id: ingredients[0]?.id || "", qty: 0 }])
  const removeInput = (i) => setInputs(p => p.filter((_, idx) => idx !== i))
  const updateInput = (i, field, val) => setInputs(p => p.map((inp, idx) => idx === i ? { ...inp, [field]: val } : inp))

  const totalLiquidIn = inputs.reduce((s, inp) => {
    const ing = ingMap[inp.id]
    return ing?.recipeUnit === "ml" ? s + (parseFloat(inp.qty) || 0) : s
  }, 0)
  const outMl = parseFloat(finalMl) || 0
  const yieldPct = totalLiquidIn > 0 && outMl > 0 ? (outMl / totalLiquidIn * 100).toFixed(1) : "--"

  const totalCostCalc = inputs.reduce((s, inp) => {
    const ing = ingMap[inp.id]
    if (!ing) return s
    return s + (parseFloat(inp.qty) || 0) * costPerUnit(ing)
  }, 0)
  const cpml = outMl > 0 ? (totalCostCalc / outMl) : 0

  const handleSave = () => {
    if (!outMl) return
    onSave({
      batchId: batch.id,
      date,
      inputs: inputs.filter(i => parseFloat(i.qty) > 0).map(i => ({ ...i, qty: parseFloat(i.qty) || 0 })),
      finalMl: outMl,
    })
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, width: 520, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Log Batch Run -- {batch.name}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{date} ? {batch.method}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>WHAT WENT IN</div>
          {inputs.map((inp, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
              <select value={inp.id} onChange={e => updateInput(idx, "id", e.target.value)}
                style={{ flex: 1, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}>
                {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
              </select>
              <input type="text" inputMode="decimal" value={inp.qty}
                onChange={e => updateInput(idx, "qty", e.target.value)}
                onFocus={e => e.target.select()}
                style={{ width: 88, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, monospace", textAlign: "right" }} />
              <span style={{ fontSize: 11, color: "#9ca3af", width: 28 }}>{ingMap[inp.id]?.recipeUnit}</span>
              <button onClick={() => removeInput(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>×</button>
            </div>
          ))}
          <button onClick={addInput} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "1px dashed #93c5fd", borderRadius: 4, padding: "4px 12px", cursor: "pointer", marginBottom: 20 }}>
            + Add ingredient
          </button>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>FINAL LIQUID OUT (ml)</label>
            <input type="text" inputMode="decimal" value={finalMl} onChange={e => setFinalMl(e.target.value)} placeholder="e.g. 1200"
              style={{ width: 160, padding: "7px 10px", border: "2px solid #111827", borderRadius: 4, fontSize: 14, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }} />
          </div>

          {/* Live yield preview */}
          <div style={{ background: "#f9fafb", borderRadius: 6, padding: "12px 16px", display: "flex", gap: 28, marginBottom: 20 }}>
            <div><div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>LIQUID IN</div><div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14 }}>{totalLiquidIn}ml</div></div>
            <div><div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>YIELD</div><div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: yieldPct !== "--" && parseFloat(yieldPct) < 70 ? "#dc2626" : "#111827" }}>{yieldPct}{yieldPct !== "--" ? "%" : ""}</div></div>
            <div><div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>TOTAL COST</div><div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14 }}>${totalCostCalc.toFixed(2)}</div></div>
            <div><div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>COST/ml</div><div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: "#7c3aed" }}>${cpml.toFixed(4)}</div></div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "7px 16px", border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
            <button onClick={handleSave} disabled={!outMl} style={{ padding: "7px 16px", border: "none", borderRadius: 5, background: outMl ? "#111827" : "#d1d5db", color: "#fff", cursor: outMl ? "pointer" : "default", fontSize: 13, fontWeight: 600 }}>
              Save Run
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

//- RECIPES -

function RecipesPage({ lib, ingMap, batchMap, batchLog, updateLib }) {
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search recipes..." />
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
        <EditRecipeModal recipe={editing} ingredients={lib.ingredients} batches={lib.batches || []} ingMap={ingMap} batchMap={batchMap} batchLog={batchLog} onSave={saveRecipe} onClose={() => setEditing(null)} />
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
                const pc = calcPourCost(recipe, ingMap, batchMap, batchLog)
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
                                if (ri.isBatch) {
                                  const batch = batchMap[ri.id]
                                  const run = getLatestRun(ri.id, batchLog)
                                  const cpml = batchCostPerMl(run, ingMap)
                                  return (
                                    <tr key={ri.id}>
                                      <td style={{ padding: "3px 12px", fontSize: 12 }}>
                                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: "#ede9fe", color: "#5b21b6", fontWeight: 600, marginRight: 6 }}>BATCH</span>
                                        {batch?.name || ri.id}
                                      </td>
                                      <td style={{ padding: "3px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{ri.qty}</td>
                                      <td style={{ padding: "3px 12px", fontSize: 12, color: "#6b7280" }}>ml</td>
                                      <td style={{ padding: "3px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>${(ri.qty * cpml).toFixed(4)}</td>
                                    </tr>
                                  )
                                }
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
        <MarginsTab recipes={lib.recipes} ingMap={ingMap} batchMap={batchMap} batchLog={batchLog} />
      )}
    </div>
  )
}

function EditRecipeModal({ recipe, ingredients, batches, ingMap, batchMap, batchLog, onSave, onClose }) {
  const [name, setName] = useState(recipe.name)
  const [salePrice, setSalePrice] = useState(String(recipe.salePrice))
  const [category, setCategory] = useState(recipe.category)
  const [ings, setIngs] = useState(recipe.ingredients.map(i => ({ ...i })))

  const updateIngQty = (idx, val) => {
    setIngs(prev => prev.map((item, i) => i === idx ? { ...item, qty: parseFloat(val) || 0 } : item))
  }
  const updateIngId = (idx, val, isBatch) => {
    setIngs(prev => prev.map((item, i) => i === idx ? { ...item, id: val, isBatch: isBatch || false } : item))
  }
  const removeIng = (idx) => setIngs(prev => prev.filter((_, i) => i !== idx))
  const addIng = () => setIngs(prev => [...prev, { id: ingredients[0]?.id || "", qty: 0, isBatch: false }])
  const addBatchIng = () => {
    if (!batches.length) return
    setIngs(prev => [...prev, { id: batches[0].id, qty: 0, isBatch: true }])
  }

  const handleSave = () => {
    const price = parseFloat(salePrice)
    if (!name.trim() || isNaN(price)) return
    onSave({ ...recipe, name: name.trim(), salePrice: price, category, ingredients: ings.filter(i => i.qty > 0) })
  }

  const pourCost = ings.reduce((s, ri) => {
    if (ri.isBatch) {
      const run = getLatestRun(ri.id, batchLog)
      return s + ri.qty * batchCostPerMl(run, ingMap)
    }
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

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>INGREDIENTS</div>
            {ings.map((ri, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                {ri.isBatch ? (
                  <>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "#ede9fe", color: "#5b21b6", fontWeight: 600, whiteSpace: "nowrap" }}>BATCH</span>
                    <select value={ri.id} onChange={e => updateIngId(idx, e.target.value, true)}
                      style={{ flex: 1, padding: "5px 8px", border: "1px solid #c4b5fd", borderRadius: 4, fontSize: 12 }}>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </>
                ) : (
                  <select value={ri.id} onChange={e => updateIngId(idx, e.target.value, false)}
                    style={{ flex: 1, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}>
                    {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                  </select>
                )}
                <input type="text" inputMode="decimal" value={ri.qty} onChange={e => updateIngQty(idx, e.target.value)}
                  style={{ width: 70, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, monospace", textAlign: "right" }} />
                <span style={{ fontSize: 11, color: "#9ca3af", width: 24 }}>{ri.isBatch ? "ml" : ingMap[ri.id]?.recipeUnit}</span>
                <button onClick={() => removeIng(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={addIng} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "1px dashed #93c5fd", borderRadius: 4, padding: "4px 12px", cursor: "pointer" }}>
                + Ingredient
              </button>
              {batches.length > 0 && (
                <button onClick={addBatchIng} style={{ fontSize: 12, color: "#5b21b6", background: "none", border: "1px dashed #c4b5fd", borderRadius: 4, padding: "4px 12px", cursor: "pointer" }}>
                  + Batch
                </button>
              )}
            </div>
          </div>

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

function MarginsTab({ recipes, ingMap, batchMap, batchLog }) {
  const rows = recipes.map(r => {
    const pc = calcPourCost(r, ingMap, batchMap, batchLog)
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

//- SALES -

function SalesPage({ lib, period, ingMap, batchMap, batchLog, weekSales, setWeekSales, logWeek }) {
  const [subTab, setSubTab] = useState("week")
  const [search, setSearch] = useState("")
  const [expandedWeek, setExpandedWeek] = useState({})

  const groups = ["Cocktails", "Beer", "Wine"]
  const filtered = lib.recipes.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))

  const weekRevenue = lib.recipes.reduce((s, r) => s + r.salePrice * (weekSales[r.id] || 0), 0)
  const weekPourCost = lib.recipes.reduce((s, r) => s + calcPourCost(r, ingMap, batchMap, batchLog) * (weekSales[r.id] || 0), 0)
  const weekGP = weekRevenue - weekPourCost

  return (
    <div style={{ padding: "24px 28px" }}>
      <PageTitle title="Sales">
        {subTab === "week" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search drinks..." />
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
                      const pc = calcPourCost(recipe, ingMap, batchMap, batchLog)
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

//- ORDERS -

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
              <tr><td colSpan={7} style={{ padding: "24px 12px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>All items are at or above par</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

//- SHARED -

function PageTitle({ title, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.5px" }}>{title}</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{children}</div>
    </div>
  )
}
