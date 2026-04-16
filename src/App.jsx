import { useState, useEffect, useCallback, useRef } from "react";

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_INGREDIENTS = [
  { id: 1, name: "Tequila Blanco",   recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 6 },
  { id: 2, name: "Triple Sec",       recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 3 },
  { id: 3, name: "Fresh Lime Juice", recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 4 },
  { id: 4, name: "Simple Syrup",     recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 2 },
  { id: 5, name: "Vodka",            recipeUnit: "ml",   purchaseUnit: "bottle",  purchaseSize: 700,  par: 6 },
  { id: 6, name: "Cranberry Juice",  recipeUnit: "ml",   purchaseUnit: "litre",   purchaseSize: 1000, par: 3 },
  { id: 7, name: "Limes (whole)",    recipeUnit: "unit", purchaseUnit: "kg bag",  purchaseSize: 10,   par: 3 },
];
const SEED_RECIPES = [
  { id: 1, name: "Margarita",    ingredients: [{ ingredientId: 1, quantity: 50 }, { ingredientId: 2, quantity: 25 }, { ingredientId: 3, quantity: 20 }, { ingredientId: 4, quantity: 10 }] },
  { id: 2, name: "Cosmopolitan", ingredients: [{ ingredientId: 5, quantity: 45 }, { ingredientId: 2, quantity: 15 }, { ingredientId: 4, quantity: 10 }, { ingredientId: 6, quantity: 30 }] },
];

const TABS           = ["Dashboard", "Ingredients", "Recipes", "Stock & Sales", "Order Report", "Variance"];
const RECIPE_UNITS   = ["ml", "g", "unit", "dash", "tsp", "tbsp"];
const PURCHASE_UNITS = ["bottle", "litre", "kg", "kg bag", "can", "keg", "bag", "each", "crate", "punnet"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const n    = (v) => parseFloat(v) || 0;
const fmtB = (unit, qty) => {
  qty = Math.round(n(qty) * 10) / 10;
  if (unit === "ml" && Math.abs(qty) >= 1000) return `${(qty/1000).toFixed(2)}L`;
  if (unit === "g"  && Math.abs(qty) >= 1000) return `${(qty/1000).toFixed(2)}kg`;
  return `${qty}${unit}`;
};
const fmtP   = (unit, qty, dp=2) => `${n(qty).toFixed(dp)} ${unit}`;
const toBase = (ing, v) => n(v) * n(ing?.purchaseSize);
const toPurch = (ing, v) => n(ing?.purchaseSize) > 0 ? n(v) / n(ing.purchaseSize) : 0;
const dateStr = () => new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STOR_LIB    = "bb-lib";
const STOR_PERIOD = "bb-period";

async function storageGet(key) {
  try { const r = await window.storage.get(key); return r?.value ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function BarBuddy() {
  const [tab,    setTab]    = useState("Dashboard");
  const [loaded, setLoaded] = useState(false);
  const [toast,  setToast]  = useState("");
  const [modal,  setModal]  = useState(null);

  // Library
  const [ingredients, setIngredients] = useState(SEED_INGREDIENTS);
  const [recipes,     setRecipes]     = useState(SEED_RECIPES);

  // Period — monthly cycle
  const [openingStock,   setOpeningStock]   = useState({});  // { ingId: "1.5" }  purchase units
  const [deliveries,     setDeliveries]     = useState({});  // { ingId: "3" }    running monthly total
  const [monthlySales,   setMonthlySales]   = useState({});  // { recipeId: "47" } accumulated
  const [weeklyLog,      setWeeklyLog]      = useState([]);
  const [closingStock,   setClosingStock]   = useState({});  // { ingId: "0.75" }
  const [monthStart,     setMonthStart]     = useState("");
  const [weekNum,        setWeekNum]        = useState(1);

  // Transient — not persisted
  const [weekSales, setWeekSales] = useState({});  // current week form
  const [newIng,    setNewIng]    = useState({ name:"", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:"", par:"" });
  const [newRec,    setNewRec]    = useState({ name:"", ings:[] });
  const [newRI,     setNewRI]     = useState({ ingredientId:"", quantity:"" });
  const [csvError,  setCsvError]  = useState("");

  // Debounce timer ref for period saves
  const saveTimer = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ── LOAD ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const lib = await storageGet(STOR_LIB);
      if (lib) {
        if (lib.ingredients) setIngredients(lib.ingredients);
        if (lib.recipes)     setRecipes(lib.recipes);
      }
      const period = await storageGet(STOR_PERIOD);
      if (period) {
        if (period.openingStock) setOpeningStock(period.openingStock);
        if (period.deliveries)   setDeliveries(period.deliveries);
        if (period.monthlySales) setMonthlySales(period.monthlySales);
        if (period.weeklyLog)    setWeeklyLog(period.weeklyLog);
        if (period.closingStock) setClosingStock(period.closingStock);
        if (period.monthStart)   setMonthStart(period.monthStart);
        if (period.weekNum)      setWeekNum(period.weekNum);
      }
      setLoaded(true);
    })();
  }, []);

  // ── SAVE LIBRARY (immediate — library changes are infrequent) ─────────────
  const saveLib = useCallback((ings, recs) => {
    storageSet(STOR_LIB, { ingredients: ings, recipes: recs });
  }, []);

  // ── SAVE PERIOD (debounced 600ms — inputs change frequently) ──────────────
  // Takes the latest values explicitly to avoid stale closure issues.
  const savePeriod = useCallback((updates = {}) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      // We pass current state values in, caller can override with updates
      // This is called with the new values explicitly so no stale closure
      storageSet(STOR_PERIOD, updates);
    }, 600);
  }, []);

  // Helper: build the current period snapshot for saving
  const periodSnapshot = useCallback((overrides = {}) => ({
    openingStock, deliveries, monthlySales, weeklyLog,
    closingStock, monthStart, weekNum,
    ...overrides,
  }), [openingStock, deliveries, monthlySales, weeklyLog, closingStock, monthStart, weekNum]);

  // ── CORE MATHS ─────────────────────────────────────────────────────────────
  const calcUsage = useCallback(() => {
    const usage = {};
    ingredients.forEach(i => { usage[i.id] = 0; });
    Object.entries(monthlySales).forEach(([rid, qty]) => {
      const recipe = recipes.find(r => r.id === parseInt(rid));
      if (!recipe || !qty) return;
      recipe.ingredients.forEach(({ ingredientId, quantity }) => {
        usage[ingredientId] = (usage[ingredientId] || 0) + quantity * n(qty);
      });
    });
    return usage;
  }, [monthlySales, recipes, ingredients]);

  const calcTheoClose = useCallback(() => {
    const usage = calcUsage();
    const result = {};
    ingredients.forEach(ing => {
      result[ing.id] = toBase(ing, openingStock[ing.id])
                     + toBase(ing, deliveries[ing.id])
                     - (usage[ing.id] || 0);
    });
    return result;
  }, [openingStock, deliveries, calcUsage, ingredients]);

  // ── ACTIONS ────────────────────────────────────────────────────────────────

  const logWeek = () => {
    const label = `Week ${weekNum} — ${dateStr()}`;
    const updatedSales = { ...monthlySales };
    Object.entries(weekSales).forEach(([rid, qty]) => {
      if (!qty || n(qty) === 0) return;
      updatedSales[rid] = String(n(updatedSales[rid] || 0) + n(qty));
    });
    const updatedLog = [...weeklyLog, { label, weekOf: dateStr(), sales: { ...weekSales } }];
    const newWeekNum = weekNum + 1;
    setMonthlySales(updatedSales);
    setWeeklyLog(updatedLog);
    setWeekNum(newWeekNum);
    setWeekSales({});
    setModal(null);
    const snap = periodSnapshot({ monthlySales: updatedSales, weeklyLog: updatedLog, weekNum: newWeekNum });
    if (saveTimer.current) clearTimeout(saveTimer.current);
    storageSet(STOR_PERIOD, snap);
    showToast(`${label} logged`);
  };

  const doNewMonth = () => {
    const theoClose = calcTheoClose();
    const newOpening = {};
    ingredients.forEach(ing => {
      const hasActual = closingStock[ing.id] !== undefined && closingStock[ing.id] !== "";
      newOpening[String(ing.id)] = hasActual
        ? String(n(closingStock[ing.id]))
        : String(Math.max(0, toPurch(ing, theoClose[ing.id] ?? 0)));
    });
    const newStart = dateStr();
    setOpeningStock(newOpening);
    setDeliveries({});
    setMonthlySales({});
    setWeeklyLog([]);
    setClosingStock({});
    setWeekSales({});
    setWeekNum(1);
    setMonthStart(newStart);
    setModal(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    storageSet(STOR_PERIOD, { openingStock: newOpening, deliveries: {}, monthlySales: {}, weeklyLog: [], closingStock: {}, monthStart: newStart, weekNum: 1 });
    showToast("New month started");
  };

  const doFullReset = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIngredients(SEED_INGREDIENTS);
    setRecipes(SEED_RECIPES);
    setOpeningStock({}); setDeliveries({}); setMonthlySales({});
    setWeeklyLog([]); setClosingStock({}); setWeekSales({});
    setWeekNum(1); setMonthStart("");
    await storageSet(STOR_LIB, { ingredients: SEED_INGREDIENTS, recipes: SEED_RECIPES });
    await storageSet(STOR_PERIOD, { openingStock:{}, deliveries:{}, monthlySales:{}, weeklyLog:[], closingStock:{}, monthStart:"", weekNum:1 });
    setModal(null);
    showToast("Reset to demo data");
  };

  const handleCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.trim().split("\n");
      const updated = { ...weekSales };
      const errors = [];
      lines.forEach((line, i) => {
        if (i === 0 && line.toLowerCase().includes("drink")) return;
        const [name, qty] = line.split(",").map(s => s.trim());
        if (!name || !qty) return;
        const recipe = recipes.find(r => r.name.toLowerCase() === name.toLowerCase());
        if (!recipe) { errors.push(name); return; }
        updated[recipe.id] = String(n(updated[recipe.id] || 0) + n(qty));
      });
      setWeekSales(updated);
      errors.length ? setCsvError(`Unmatched: ${errors.join(", ")}`) : (setCsvError(""), showToast("CSV loaded"));
    };
    reader.readAsText(file);
  };

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const usage         = calcUsage();
  const theoClose     = calcTheoClose();
  const totalMonthly  = Object.values(monthlySales).reduce((a,b) => a + n(b), 0);
  const weekTotal     = Object.values(weekSales).reduce((a,b) => a + n(b), 0);
  const orderSugs     = ingredients.map(ing => {
    const remP    = toPurch(ing, theoClose[ing.id] ?? 0);
    const toOrder = Math.max(0, Math.ceil(ing.par - remP));
    return { ...ing, remP, toOrder };
  });
  const orderItems    = orderSugs.filter(i => i.toOrder > 0);
  const topUsed       = [...ingredients].filter(i => (usage[i.id]||0) > 0)
    .sort((a,b) => toPurch(b, usage[b.id]||0) - toPurch(a, usage[a.id]||0)).slice(0,3);

  // ── NUMBER INPUT COMPONENT ─────────────────────────────────────────────────
  // Uses type="text" + inputMode="decimal" to avoid browser number-input quirks
  // that prevent React controlled values from displaying correctly.
  const NumInput = ({ value, onChange, placeholder, suffix, sublabel }) => (
    <div style={{ position:"relative" }}>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        placeholder={placeholder || "0"}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        style={{
          background:"#0a0a0a", border:"1px solid #252525", color:"#e8e0d0",
          fontFamily:"-apple-system, BlinkMacSystemFont, 'Courier New', monospace",
          fontSize:13, padding:"8px 12px",
          paddingRight: suffix ? 76 : 12,
          borderRadius:3, width:"100%", outline:"none", transition:"border-color .15s",
        }}
        onFocus={e => e.target.style.borderColor="#c8a96e"}
        onBlur={e => e.target.style.borderColor="#252525"}
      />
      {suffix && <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:10, color:"#3a3a3a", pointerEvents:"none" }}>{suffix}</span>}
      {sublabel && <div style={{ fontSize:10, color:"#3a3a3a", marginTop:3 }}>{sublabel}</div>}
    </div>
  );

  if (!loaded) return (
    <div style={{ minHeight:"100vh", background:"#0d0d0d", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:"#c8a96e" }}>Bar Buddy</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0d0d0d", fontFamily:"'DM Mono',monospace", color:"#e8e0d0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#1a1a1a}::-webkit-scrollbar-thumb{background:#c8a96e;border-radius:2px}
        .tab{background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:8px 14px;color:#555;transition:color .15s;border-bottom:2px solid transparent;white-space:nowrap}
        .tab:hover{color:#c8a96e}.tab.on{color:#c8a96e;border-bottom-color:#c8a96e}
        .card{background:#161616;border:1px solid #222;border-radius:4px;padding:20px}
        .lbl{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#555;margin-bottom:6px;display:block}
        .sub{font-size:10px;color:#383838;margin-top:3px}
        .sel{background:#0a0a0a;border:1px solid #252525;color:#e8e0d0;font-family:'DM Mono',monospace;font-size:13px;padding:8px 12px;border-radius:3px;width:100%;outline:none;appearance:none;cursor:pointer}
        .inp{background:#0a0a0a;border:1px solid #252525;color:#e8e0d0;font-family:'DM Mono',monospace;font-size:13px;padding:8px 12px;border-radius:3px;width:100%;outline:none;transition:border-color .15s}
        .inp:focus{border-color:#c8a96e}
        .btn{background:#c8a96e;color:#0d0d0d;border:none;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:9px 18px;border-radius:3px;cursor:pointer}
        .btn:hover{background:#d9ba7f}
        .btn-o{background:transparent;color:#c8a96e;border:1px solid #c8a96e;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:8px 16px;border-radius:3px;cursor:pointer}
        .btn-o:hover{background:#c8a96e14}
        .btn-b{background:transparent;color:#7ec8e3;border:1px solid #7ec8e3;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.08em;padding:8px 16px;border-radius:3px;cursor:pointer}
        .btn-b:hover{background:#7ec8e314}
        .btn-rm{background:transparent;color:#e05555;border:1px solid #1e1414;font-family:'DM Mono',monospace;font-size:10px;padding:4px 10px;border-radius:3px;cursor:pointer}
        .btn-rm:hover{border-color:#e05555}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
        .row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1c1c1c}
        .row:last-child{border-bottom:none}
        .tag{display:inline-block;background:#c8a96e1a;color:#c8a96e;font-size:10px;padding:2px 8px;border-radius:2px}
        .tag-g{background:#55e0901a;color:#55e090;font-size:10px;padding:2px 8px;border-radius:2px}
        .tag-r{background:#e055551a;color:#e05555;font-size:10px;padding:2px 8px;border-radius:2px}
        .tag-b{background:#7ec8e31a;color:#7ec8e3;font-size:10px;padding:2px 8px;border-radius:2px}
        .tag-d{background:#ffffff08;color:#484848;font-size:10px;padding:2px 8px;border-radius:2px}
        .pill{display:inline-flex;background:#181818;border:1px solid #222;border-radius:10px;padding:2px 9px;font-size:10px;color:#666}
        .hr{border:none;border-top:1px solid #1c1c1c;margin:16px 0}
        .overlay{position:fixed;inset:0;background:#000c;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
        .modal{background:#161616;border:1px solid #2a2a2a;border-radius:6px;padding:28px;max-width:420px;width:100%}
        .toast{position:fixed;bottom:24px;right:24px;background:#c8a96e;color:#0d0d0d;font-family:'DM Mono',monospace;font-size:12px;padding:10px 20px;border-radius:3px;z-index:999}
        .cbar{background:#0a0a0a;border-radius:3px;padding:9px 14px;font-size:11px;color:#444;margin-top:8px}
        .cbar b{color:#c8a96e;font-weight:400}
        .wk{background:#0a0a0a;border:1px solid #1c1c1c;border-radius:3px;padding:10px 14px;margin-bottom:8px}
      `}</style>

      {/* HEADER */}
      <div style={{borderBottom:"1px solid #1c1c1c",padding:"0 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:20,paddingBottom:10,flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:"#c8a96e"}}>Bar Buddy</div>
            <div style={{fontSize:10,letterSpacing:".2em",color:"#333",textTransform:"uppercase",marginTop:2}}>Inventory Intelligence</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:10,color:"#55e090"}}>● Saved</span>
            {monthStart && <span style={{fontSize:10,color:"#333"}}>Month from {monthStart}</span>}
            <span style={{fontSize:10,color:"#444"}}>Week {weekNum}</span>
            <button className="btn-b" onClick={()=>setModal("newMonth")}>New Month</button>
          </div>
        </div>
        <div style={{display:"flex",overflowX:"auto"}}>
          {TABS.map(t=><button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t}</button>)}
        </div>
      </div>

      <div style={{padding:"24px",maxWidth:980,margin:"0 auto"}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="Dashboard" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="g3">
              {[{l:"Ingredients",v:ingredients.length},{l:"Recipes",v:recipes.length},{l:"Sales This Month",v:totalMonthly}].map(s=>(
                <div key={s.l} className="card">
                  <span className="lbl">{s.l}</span>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:700,color:"#c8a96e",lineHeight:1}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div className="g2">
              <div className="card">
                <span className="lbl" style={{marginBottom:10}}>Order This Week</span>
                {orderItems.length===0
                  ? <div style={{fontSize:13,color:"#55e090"}}>All stock above par ✓</div>
                  : orderItems.map(i=>(
                    <div key={i.id} className="row">
                      <span style={{fontSize:13}}>{i.name}</span>
                      <span className="tag">{i.toOrder} {i.purchaseUnit}{i.toOrder!==1?"s":""}</span>
                    </div>
                  ))}
              </div>
              <div className="card">
                <span className="lbl" style={{marginBottom:10}}>Top Usage This Month</span>
                {topUsed.length===0
                  ? <div style={{fontSize:13,color:"#333"}}>No sales logged yet</div>
                  : topUsed.map(ing=>(
                    <div key={ing.id} className="row">
                      <span style={{fontSize:13}}>{ing.name}</span>
                      <span style={{fontSize:12,color:"#c8a96e"}}>{fmtP(ing.purchaseUnit,toPurch(ing,usage[ing.id]||0))}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="card" style={{borderColor:"#c8a96e1a",padding:"16px 20px"}}>
              <span className="lbl" style={{color:"#c8a96e",marginBottom:10}}>Workflow</span>
              {[["Monthly","#7ec8e3","Physical stock count → enter as Opening Stock"],["Weekly","#c8a96e","Update deliveries → enter week sales → Log This Week → check Order Report"],["Monthly","#7ec8e3","Enter closing count in Variance → hit New Month"]].map(([c,col,t],i)=>(
                <div key={i} style={{display:"flex",gap:10,fontSize:11,color:"#555",marginBottom:5,alignItems:"baseline"}}>
                  <span style={{color:col,fontSize:10,letterSpacing:".1em",minWidth:52,textTransform:"uppercase"}}>{c}</span><span>{t}</span>
                </div>
              ))}
            </div>
            <div style={{textAlign:"right"}}>
              <button className="btn-rm" style={{fontSize:10}} onClick={()=>setModal("fullReset")}>Reset app to demo data</button>
            </div>
          </div>
        )}

        {/* ══ INGREDIENTS ══ */}
        {tab==="Ingredients" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="card">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#c8a96e",marginBottom:16}}>Add Ingredient</div>
              <div className="g2" style={{marginBottom:12}}>
                <div>
                  <span className="lbl">Name</span>
                  <input className="inp" placeholder="e.g. Fresh Lime Juice" value={newIng.name} onChange={e=>setNewIng(p=>({...p,name:e.target.value}))} />
                </div>
                <div>
                  <span className="lbl">Recipe Unit</span>
                  <select className="sel" value={newIng.recipeUnit} onChange={e=>setNewIng(p=>({...p,recipeUnit:e.target.value}))}>
                    {RECIPE_UNITS.map(u=><option key={u}>{u}</option>)}
                  </select>
                  <div className="sub">Used in recipe specs</div>
                </div>
              </div>
              <div className="g3" style={{marginBottom:12}}>
                <div>
                  <span className="lbl">Purchase Unit</span>
                  <select className="sel" value={newIng.purchaseUnit} onChange={e=>setNewIng(p=>({...p,purchaseUnit:e.target.value}))}>
                    {PURCHASE_UNITS.map(u=><option key={u}>{u}</option>)}
                  </select>
                  <div className="sub">What you order & count</div>
                </div>
                <div>
                  <span className="lbl">{newIng.recipeUnit} per {newIng.purchaseUnit}</span>
                  <input className="inp" placeholder="e.g. 700" value={newIng.purchaseSize} onChange={e=>setNewIng(p=>({...p,purchaseSize:e.target.value}))} />
                </div>
                <div>
                  <span className="lbl">Par ({newIng.purchaseUnit}s)</span>
                  <input className="inp" placeholder="e.g. 6" value={newIng.par} onChange={e=>setNewIng(p=>({...p,par:e.target.value}))} />
                </div>
              </div>
              {newIng.purchaseSize && newIng.par && (
                <div className="cbar">1 <b>{newIng.purchaseUnit}</b> = <b>{newIng.purchaseSize}{newIng.recipeUnit}</b> · Par = <b>{newIng.par} {newIng.purchaseUnit}s</b> = <b>{(n(newIng.par)*n(newIng.purchaseSize)).toLocaleString()}{newIng.recipeUnit}</b></div>
              )}
              <button className="btn" style={{marginTop:14}} onClick={()=>{
                if(!newIng.name||!newIng.purchaseSize||!newIng.par) return showToast("Fill all fields");
                const updated = [...ingredients, {id:Date.now(),name:newIng.name,recipeUnit:newIng.recipeUnit,purchaseUnit:newIng.purchaseUnit,purchaseSize:n(newIng.purchaseSize),par:n(newIng.par)}];
                setIngredients(updated);
                saveLib(updated, recipes);
                setNewIng({name:"",recipeUnit:"ml",purchaseUnit:"bottle",purchaseSize:"",par:""});
                showToast("Ingredient saved");
              }}>Add Ingredient</button>
            </div>
            <div className="card">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#c8a96e",marginBottom:16}}>Ingredient Library</div>
              {ingredients.length===0 && <div style={{color:"#333",fontSize:13}}>No ingredients yet.</div>}
              {ingredients.map(ing=>(
                <div key={ing.id} className="row">
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,marginBottom:6}}>{ing.name}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span className="pill">recipe: {ing.recipeUnit}</span>
                      <span className="pill">order: {ing.purchaseUnit}</span>
                      <span className="pill">1 {ing.purchaseUnit} = {ing.purchaseSize}{ing.recipeUnit}</span>
                      <span className="tag">par: {ing.par} {ing.purchaseUnit}s</span>
                    </div>
                  </div>
                  <button className="btn-rm" style={{marginLeft:12}} onClick={()=>{
                    const updated = ingredients.filter(i=>i.id!==ing.id);
                    setIngredients(updated); saveLib(updated, recipes); showToast("Removed");
                  }}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ RECIPES ══ */}
        {tab==="Recipes" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="card">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#c8a96e",marginBottom:16}}>Build Recipe Spec</div>
              <div style={{marginBottom:12}}>
                <span className="lbl">Drink Name</span>
                <input className="inp" placeholder="e.g. Espresso Martini" value={newRec.name} onChange={e=>setNewRec(p=>({...p,name:e.target.value}))} />
              </div>
              <div className="g2" style={{marginBottom:10}}>
                <div>
                  <span className="lbl">Ingredient</span>
                  <select className="sel" value={newRI.ingredientId} onChange={e=>setNewRI(p=>({...p,ingredientId:e.target.value}))}>
                    <option value="">Select ingredient</option>
                    {ingredients.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <span className="lbl">Quantity {newRI.ingredientId&&`(${ingredients.find(i=>i.id===parseInt(newRI.ingredientId))?.recipeUnit})`}</span>
                  <input className="inp" placeholder="e.g. 50" value={newRI.quantity} onChange={e=>setNewRI(p=>({...p,quantity:e.target.value}))} />
                  {newRI.ingredientId&&newRI.quantity&&(()=>{
                    const ing=ingredients.find(i=>i.id===parseInt(newRI.ingredientId));
                    if(!ing) return null;
                    return <div className="sub">{fmtP(ing.purchaseUnit,toPurch(ing,n(newRI.quantity)))} of 1 {ing.purchaseUnit} per serve</div>;
                  })()}
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <button className="btn-o" onClick={()=>{
                  if(!newRI.ingredientId||!newRI.quantity) return;
                  setNewRec(p=>({...p,ings:[...p.ings,{ingredientId:parseInt(newRI.ingredientId),quantity:n(newRI.quantity)}]}));
                  setNewRI({ingredientId:"",quantity:""});
                }}>+ Add to Spec</button>
                <button className="btn" onClick={()=>{
                  if(!newRec.name||newRec.ings.length===0) return showToast("Need name + at least 1 ingredient");
                  const updated = [...recipes, {id:Date.now(),name:newRec.name,ingredients:newRec.ings}];
                  setRecipes(updated); saveLib(ingredients, updated);
                  setNewRec({name:"",ings:[]}); showToast("Recipe saved");
                }}>Save Recipe</button>
              </div>
              {newRec.ings.length>0&&(
                <div style={{background:"#0a0a0a",borderRadius:3,padding:12}}>
                  <span className="lbl" style={{marginBottom:8}}>Preview — {newRec.name||"Untitled"}</span>
                  {newRec.ings.map((ri,idx)=>{
                    const ing=ingredients.find(i=>i.id===ri.ingredientId);
                    return <div key={idx} style={{fontSize:12,color:"#666",padding:"3px 0"}}>— {ing?.name}: {ri.quantity}{ing?.recipeUnit}</div>;
                  })}
                </div>
              )}
            </div>
            <div className="card">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#c8a96e",marginBottom:16}}>Recipe Library</div>
              {recipes.length===0&&<div style={{color:"#333",fontSize:13}}>No recipes yet.</div>}
              {recipes.map(recipe=>(
                <div key={recipe.id} style={{paddingBottom:16,marginBottom:16,borderBottom:"1px solid #1c1c1c"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:15,fontFamily:"'Playfair Display',serif"}}>{recipe.name}</div>
                    <button className="btn-rm" onClick={()=>{
                      const updated=recipes.filter(r=>r.id!==recipe.id);
                      setRecipes(updated); saveLib(ingredients,updated); showToast("Removed");
                    }}>Remove</button>
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

        {/* ══ STOCK & SALES ══ */}
        {tab==="Stock & Sales" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Opening stock */}
            <div className="card" style={{borderColor:"#7ec8e322"}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#7ec8e3"}}>Opening Stock</div>
                <span className="tag-b">Monthly count</span>
              </div>
              <div style={{fontSize:11,color:"#444",marginBottom:16}}>Enter once per month after your physical count. This is your baseline for the whole month.</div>
              <div className="g3">
                {ingredients.map(ing=>(
                  <div key={ing.id}>
                    <span className="lbl">{ing.name}</span>
                    <NumInput
                      value={openingStock[String(ing.id)] ?? ""}
                      suffix={`${ing.purchaseUnit}s`}
                      placeholder="0"
                      sublabel={openingStock[String(ing.id)] ? `= ${fmtB(ing.recipeUnit, toBase(ing, openingStock[String(ing.id)]))}` : ""}
                      onChange={val => {
                        if (!monthStart) setMonthStart(dateStr());
                        setOpeningStock(prev => {
                          const updated = { ...prev, [String(ing.id)]: val };
                          savePeriod(periodSnapshot({ openingStock: updated }));
                          return updated;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Deliveries */}
            <div className="card">
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#c8a96e"}}>Deliveries Received</div>
                <span className="tag">Running total this month</span>
              </div>
              <div style={{fontSize:11,color:"#444",marginBottom:16}}>Running total for the month. Increase this number each time stock arrives.</div>
              <div className="g3">
                {ingredients.map(ing=>(
                  <div key={ing.id}>
                    <span className="lbl">{ing.name}</span>
                    <NumInput
                      value={deliveries[String(ing.id)] ?? ""}
                      suffix={`${ing.purchaseUnit}s`}
                      placeholder="0"
                      sublabel={deliveries[String(ing.id)] ? `= ${fmtB(ing.recipeUnit, toBase(ing, deliveries[String(ing.id)]))}` : ""}
                      onChange={val => {
                        setDeliveries(prev => {
                          const updated = { ...prev, [String(ing.id)]: val };
                          savePeriod(periodSnapshot({ deliveries: updated }));
                          return updated;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly sales */}
            <div className="card">
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:4}}>
                <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#c8a96e"}}>Week {weekNum} Sales</div>
                  <span className="tag-d">Not yet logged</span>
                </div>
                {weekTotal>0&&<button className="btn" onClick={()=>setModal("logWeek")}>Log This Week →</button>}
              </div>
              <div style={{fontSize:11,color:"#444",marginBottom:16}}>Enter this week's sales then hit <span style={{color:"#c8a96e"}}>Log This Week</span> to add to the monthly total.</div>
              <div style={{marginBottom:14}}>
                <span className="lbl">Import from POS (CSV)</span>
                <div style={{fontSize:11,color:"#333",marginBottom:6}}>Format: DrinkName, Quantity</div>
                <input type="file" accept=".csv" style={{color:"#555",fontSize:12}} onChange={handleCSV} />
                {csvError&&<div style={{color:"#e05555",fontSize:11,marginTop:6}}>{csvError}</div>}
              </div>
              <hr className="hr"/>
              <span className="lbl" style={{marginBottom:12}}>Manual Entry</span>
              <div className="g2">
                {recipes.map(recipe=>(
                  <div key={recipe.id}>
                    <span className="lbl">{recipe.name}</span>
                    <input className="inp" type="text" inputMode="decimal" pattern="[0-9]*" placeholder="0 sold"
                      autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
                      style={{fontFamily:"-apple-system, BlinkMacSystemFont, 'Courier New', monospace"}}
                      value={weekSales[recipe.id] ?? ""}
                      onChange={e=>setWeekSales(prev=>({...prev,[recipe.id]:e.target.value}))} />
                  </div>
                ))}
              </div>
              {weekTotal>0&&<button className="btn" style={{marginTop:16}} onClick={()=>setModal("logWeek")}>Log This Week ({weekTotal} drinks) →</button>}
            </div>

            {/* Sales log */}
            {weeklyLog.length>0&&(
              <div className="card">
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#c8a96e",marginBottom:12}}>Sales Log — This Month</div>
                {weeklyLog.map((entry,i)=>(
                  <div key={i} className="wk">
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:12,color:"#777"}}>{entry.label}</span>
                      <span style={{fontSize:11,color:"#444"}}>{Object.values(entry.sales).reduce((a,b)=>a+n(b),0)} drinks</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {Object.entries(entry.sales).filter(([,v])=>n(v)>0).map(([rid,qty])=>{
                        const r=recipes.find(x=>x.id===parseInt(rid));
                        return r?<span key={rid} className="tag">{r.name}: {qty}</span>:null;
                      })}
                    </div>
                  </div>
                ))}
                <div style={{fontSize:11,color:"#444",paddingTop:8,borderTop:"1px solid #1c1c1c"}}>
                  Monthly total: <span style={{color:"#c8a96e"}}>{totalMonthly} drinks</span> across {weeklyLog.length} week{weeklyLog.length!==1?"s":""}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDER REPORT ══ */}
        {tab==="Order Report" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="card" style={{borderColor:"#c8a96e44"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#c8a96e",marginBottom:4}}>Weekly Order Suggestion</div>
              <div style={{fontSize:11,color:"#444"}}>Opening count + deliveries to date − total sales to date = estimated remaining → vs par → order in whole purchase units</div>
              {weekTotal>0&&<div style={{marginTop:10,fontSize:11,color:"#e09055",background:"#e090550a",border:"1px solid #e0905520",borderRadius:3,padding:"8px 12px"}}>⚠ You have {weekTotal} unlogged drinks this week — log them for a more accurate suggestion.</div>}
            </div>
            {orderSugs.map(ing=>{
              const ob=toBase(ing,openingStock[String(ing.id)]);
              const db=toBase(ing,deliveries[String(ing.id)]);
              const ub=usage[ing.id]||0;
              const rb=ob+db-ub;
              return (
                <div key={ing.id} className="card" style={{borderColor:ing.toOrder>0?"#c8a96e33":"#1c1c1c"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,marginBottom:8}}>{ing.name}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:14,fontSize:11,color:"#444"}}>
                        <span>Opening: <span style={{color:"#666"}}>{fmtP(ing.purchaseUnit,toPurch(ing,ob))}</span></span>
                        <span>Delivered: <span style={{color:"#666"}}>{fmtP(ing.purchaseUnit,toPurch(ing,db))}</span></span>
                        <span>Used: <span style={{color:"#666"}}>{fmtP(ing.purchaseUnit,toPurch(ing,ub))}</span></span>
                        <span>Remaining: <span style={{color:"#c8c8c8"}}>{fmtP(ing.purchaseUnit,toPurch(ing,rb))}</span></span>
                        <span>Par: <span style={{color:"#c8c8c8"}}>{ing.par} {ing.purchaseUnit}s</span></span>
                      </div>
                    </div>
                    <div style={{textAlign:"right",minWidth:88}}>
                      {ing.toOrder>0?(
                        <>
                          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:"#c8a96e",lineHeight:1}}>{ing.toOrder}</div>
                          <div style={{fontSize:11,color:"#c8a96e"}}>{ing.purchaseUnit}{ing.toOrder!==1?"s":""}</div>
                          <div style={{fontSize:10,color:"#444",marginTop:2}}>to order</div>
                        </>
                      ):<span className="tag-g">Above Par ✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ VARIANCE ══ */}
        {tab==="Variance" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="card" style={{borderColor:"#7ec8e322"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#7ec8e3",marginBottom:4}}>Monthly Variance Report</div>
              <div style={{fontSize:11,color:"#444"}}>Enter your end-of-month physical count. Compares actual vs theoretical to surface shrinkage and over-pouring. Then hit <span style={{color:"#7ec8e3"}}>New Month</span>.</div>
            </div>
            <div className="card">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#7ec8e3",marginBottom:12}}>Actual Closing Count</div>
              <div className="g3">
                {ingredients.map(ing=>(
                  <div key={ing.id}>
                    <span className="lbl">{ing.name}</span>
                    <NumInput
                      value={closingStock[String(ing.id)] ?? ""}
                      suffix={`${ing.purchaseUnit}s`}
                      placeholder="e.g. 1.5"
                      sublabel={closingStock[String(ing.id)] ? `= ${fmtB(ing.recipeUnit, toBase(ing, closingStock[String(ing.id)]))}` : ""}
                      onChange={val => {
                        setClosingStock(prev => {
                          const updated = { ...prev, [String(ing.id)]: val };
                          savePeriod(periodSnapshot({ closingStock: updated }));
                          return updated;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            {ingredients.map(item=>{
              const tB   = theoClose[item.id]??0;
              const tP   = toPurch(item,tB);
              const has  = closingStock[String(item.id)]!==undefined && closingStock[String(item.id)]!=="";
              const aP   = n(closingStock[String(item.id)]);
              const aB   = toBase(item,aP);
              const vP   = aP-tP;
              const pct  = tP!==0?((vP/tP)*100).toFixed(1):"—";
              const isNeg = vP < -0.1;
              const isPos = vP > 0.1;
              return (
                <div key={item.id} className="card" style={{borderColor:isNeg?"#e0555520":isPos?"#55e09020":"#1c1c1c"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,marginBottom:6}}>{item.name}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:14,fontSize:11,color:"#444"}}>
                        <span>Theoretical: <span style={{color:"#666"}}>{fmtP(item.purchaseUnit,tP)}</span></span>
                        {has&&<span>Actual: <span style={{color:"#c8c8c8"}}>{fmtP(item.purchaseUnit,aP)}</span></span>}
                      </div>
                    </div>
                    {has?(
                      <div style={{textAlign:"right",minWidth:108}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:isNeg?"#e05555":isPos?"#55e090":"#555",lineHeight:1}}>
                          {vP>0?"+":""}{fmtP(item.purchaseUnit,vP)}
                        </div>
                        <div style={{fontSize:10,color:"#444",marginTop:3}}>{pct}% variance</div>
                        <div style={{marginTop:6}}>
                          {isNeg&&<span className="tag-r">Investigate ⚠</span>}
                          {isPos&&<span className="tag-g">Surplus</span>}
                          {!isNeg&&!isPos&&<span className="tag-d">On Track ✓</span>}
                        </div>
                      </div>
                    ):<span style={{fontSize:11,color:"#2e2e2e"}}>Awaiting count</span>}
                  </div>
                </div>
              );
            })}
            {Object.values(closingStock).some(v=>v!=="")&&(
              <div className="card" style={{borderColor:"#7ec8e322",textAlign:"center",padding:24}}>
                <div style={{fontSize:13,color:"#7ec8e3",marginBottom:8}}>Ready to close the month?</div>
                <div style={{fontSize:11,color:"#444",marginBottom:16}}>Closing count becomes next month's opening stock. All sales and deliveries will clear.</div>
                <button className="btn-b" onClick={()=>setModal("newMonth")}>Start New Month →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {modal==="logWeek"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#c8a96e",marginBottom:10}}>Log Week {weekNum} Sales?</div>
            <div style={{background:"#0a0a0a",borderRadius:3,padding:12,marginBottom:14}}>
              {Object.entries(weekSales).filter(([,v])=>n(v)>0).map(([rid,qty])=>{
                const r=recipes.find(x=>x.id===parseInt(rid));
                return r?<div key={rid} style={{fontSize:12,color:"#666",padding:"3px 0"}}>— {r.name}: <span style={{color:"#c8a96e"}}>{qty}</span></div>:null;
              })}
              <div style={{fontSize:11,color:"#555",marginTop:8,paddingTop:8,borderTop:"1px solid #1c1c1c"}}>Total: <span style={{color:"#c8a96e"}}>{weekTotal} drinks</span></div>
            </div>
            <div style={{fontSize:11,color:"#333",marginBottom:16}}>Adds to monthly total. Cannot be edited after confirming.</div>
            <div style={{display:"flex",gap:10}}><button className="btn" onClick={logWeek}>Confirm & Log</button><button className="btn-o" onClick={()=>setModal(null)}>Cancel</button></div>
          </div>
        </div>
      )}
      {modal==="newMonth"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#7ec8e3",marginBottom:10}}>Start New Month?</div>
            <div style={{fontSize:12,color:"#555",lineHeight:1.8,marginBottom:20}}>
              · Closing count → new opening stock <span style={{color:"#333"}}>(theoretical if no count entered)</span><br/>
              · Clears deliveries, sales log, closing stock<br/>
              · Resets to Week 1<br/>
              · Keeps ingredients, recipes and par levels<br/><br/>
              <span style={{color:"#e09055"}}>Cannot be undone.</span>
            </div>
            <div style={{display:"flex",gap:10}}><button className="btn" style={{background:"#7ec8e3"}} onClick={doNewMonth}>Confirm</button><button className="btn-o" onClick={()=>setModal(null)}>Cancel</button></div>
          </div>
        </div>
      )}
      {modal==="fullReset"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#e05555",marginBottom:10}}>Reset Everything?</div>
            <div style={{fontSize:12,color:"#555",lineHeight:1.7,marginBottom:20}}>Wipes all data and reloads demo data.</div>
            <div style={{display:"flex",gap:10}}><button style={{background:"#e05555",color:"#fff",border:"none",fontFamily:"'DM Mono',monospace",fontSize:11,padding:"9px 18px",borderRadius:3,cursor:"pointer"}} onClick={doFullReset}>Wipe Everything</button><button className="btn-o" onClick={()=>setModal(null)}>Cancel</button></div>
          </div>
        </div>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}
