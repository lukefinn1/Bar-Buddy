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

const RECIPE_UNITS   = ["ml", "g", "unit", "dash", "tsp", "tbsp"];
const PURCHASE_UNITS = ["bottle", "litre", "kg", "kg bag", "can", "keg", "bag", "each", "crate", "punnet"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const num    = (v) => parseFloat(v) || 0;
const fmtB   = (unit, qty) => {
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
const STOR_LIB = "bb-lib", STOR_PERIOD = "bb-period";
async function sGet(key) {
  try { const r = await window.storage.get(key); return r?.value ? JSON.parse(r.value) : null; } catch { return null; }
}
async function sSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─── NUM INPUT (module level — never inside a component) ──────────────────────
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
        onFocus={e  => e.target.style.borderColor="var(--gold)"}
        onBlur={e => e.target.style.borderColor="var(--border)"}
      />
      {suffix && (
        <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:"var(--text-dim)", pointerEvents:"none", fontFamily:"var(--font-mono)" }}>
          {suffix}
        </span>
      )}
      {sublabel && <div style={{ fontSize:11, color:"var(--gold-dim)", marginTop:4, paddingLeft:2 }}>{sublabel}</div>}
    </div>
  );
}

// ─── TEXT INPUT (module level) ─────────────────────────────────────────────────
function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text" placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      autoComplete="off" autoCorrect="off" autoCapitalize="words" spellCheck={false}
      style={{
        background:"var(--input-bg)", border:"1.5px solid var(--border)",
        color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:15,
        padding:"14px 16px", borderRadius:10, width:"100%", outline:"none",
        transition:"border-color .15s", WebkitAppearance:"none",
      }}
      onFocus={e => e.target.style.borderColor="var(--gold)"}
      onBlur={e => e.target.style.borderColor="var(--border)"}
    />
  );
}

// ─── SELECT (module level) ─────────────────────────────────────────────────────
function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      background:"var(--input-bg)", border:"1.5px solid var(--border)",
      color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:15,
      padding:"14px 16px", borderRadius:10, width:"100%", outline:"none",
      appearance:"none", WebkitAppearance:"none", cursor:"pointer",
    }}
      onFocus={e => e.target.style.borderColor="var(--gold)"}
      onBlur={e => e.target.style.borderColor="var(--border)"}
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
  plus:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chevron:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  trash:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  alert:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function BarBuddy() {
  const [tab,    setTab]    = useState("home");
  const [subTab, setSubTab] = useState("ingredients"); // within Setup
  const [loaded, setLoaded] = useState(false);
  const [toast,  setToast]  = useState("");
  const [modal,  setModal]  = useState(null);

  // Library
  const [ingredients, setIngredients] = useState(SEED_INGREDIENTS);
  const [recipes,     setRecipes]     = useState(SEED_RECIPES);

  // Period
  const [openingStock,  setOpeningStock]  = useState({});
  const [deliveries,    setDeliveries]    = useState({});
  const [monthlySales,  setMonthlySales]  = useState({});
  const [weeklyLog,     setWeeklyLog]     = useState([]);
  const [closingStock,  setClosingStock]  = useState({});
  const [monthStart,    setMonthStart]    = useState("");
  const [weekNum,       setWeekNum]       = useState(1);

  // Transient
  const [weekSales, setWeekSales] = useState({});
  const [newIng,    setNewIng]    = useState({ name:"", recipeUnit:"ml", purchaseUnit:"bottle", purchaseSize:"", par:"" });
  const [newRec,    setNewRec]    = useState({ name:"", ings:[] });
  const [newRI,     setNewRI]     = useState({ ingredientId:"", quantity:"" });
  const [csvError,  setCsvError]  = useState("");

  const saveTimer = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

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
  const orderSugs    = ingredients.map(ing=>{
    const remP=toPurch(ing,theoClose[ing.id]??0);
    const toOrder=Math.max(0,Math.ceil(ing.par-remP));
    return {...ing,remP,toOrder};
  });
  const orderItems   = orderSugs.filter(i=>i.toOrder>0);
  const topUsed      = [...ingredients].filter(i=>(usage[i.id]||0)>0)
    .sort((a,b)=>toPurch(b,usage[b.id]||0)-toPurch(a,usage[a.id]||0)).slice(0,4);

  if (!loaded) return (
    <div style={{minHeight:"100vh",background:"#0e0e0f",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:32,fontWeight:700,color:"#c9a96e",letterSpacing:".02em"}}>Bar Buddy</div>
      <div style={{width:32,height:2,background:"#c9a96e",borderRadius:2,animation:"pulse 1s ease-in-out infinite"}} />
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );

  // ── CSS VARS + GLOBALS ────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:wght@400;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
    :root {
      --gold: #c9a96e;
      --gold-dim: #7a6340;
      --gold-bg: #c9a96e12;
      --green: #4ade80;
      --green-bg: #4ade8012;
      --red: #f87171;
      --red-bg: #f8717112;
      --blue: #7dd3fc;
      --blue-bg: #7dd3fc12;
      --bg: #0e0e0f;
      --surface: #161618;
      --surface2: #1e1e21;
      --border: #2a2a2e;
      --border-light: #333338;
      --text: #f0ece4;
      --text-mid: #9a9590;
      --text-dim: #55524e;
      --input-bg: #111113;
      --font-serif: 'Cormorant Garant', Georgia, serif;
      --font-mono: 'IBM Plex Mono', 'Courier New', monospace;
      --radius: 14px;
      --radius-sm: 10px;
      --nav-h: 72px;
    }
    * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
    body { background:var(--bg); }
    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-thumb { background:var(--border-light); border-radius:2px; }

    .page { padding:20px 16px; padding-bottom:calc(var(--nav-h) + 24px); max-width:600px; margin:0 auto; }

    /* Cards */
    .card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:20px; }
    .card + .card { margin-top:12px; }

    /* Section label */
    .sect { font-family:var(--font-mono); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--text-dim); margin-bottom:10px; display:block; }

    /* Stat number */
    .stat-n { font-family:var(--font-serif); font-size:40px; font-weight:700; color:var(--gold); line-height:1; }

    /* Row */
    .row { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid var(--border); }
    .row:last-child { border-bottom:none; }
    .row:first-child { padding-top:0; }

    /* Tags */
    .tag  { display:inline-flex; align-items:center; gap:4px; background:var(--gold-bg);  color:var(--gold);  font-family:var(--font-mono); font-size:10px; letter-spacing:.06em; padding:4px 10px; border-radius:20px; }
    .tag-g{ background:var(--green-bg); color:var(--green); font-family:var(--font-mono); font-size:10px; letter-spacing:.06em; padding:4px 10px; border-radius:20px; }
    .tag-r{ background:var(--red-bg);   color:var(--red);   font-family:var(--font-mono); font-size:10px; letter-spacing:.06em; padding:4px 10px; border-radius:20px; }
    .tag-b{ background:var(--blue-bg);  color:var(--blue);  font-family:var(--font-mono); font-size:10px; letter-spacing:.06em; padding:4px 10px; border-radius:20px; }
    .tag-d{ background:#ffffff08;       color:var(--text-dim); font-family:var(--font-mono); font-size:10px; letter-spacing:.06em; padding:4px 10px; border-radius:20px; }

    /* Buttons */
    .btn-primary { background:var(--gold); color:#0e0e0f; font-family:var(--font-mono); font-size:12px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; padding:15px 24px; border-radius:var(--radius-sm); border:none; cursor:pointer; width:100%; transition:background .15s; }
    .btn-primary:hover { background:#d9ba7f; }
    .btn-secondary { background:transparent; color:var(--gold); font-family:var(--font-mono); font-size:12px; letter-spacing:.08em; text-transform:uppercase; padding:14px 24px; border-radius:var(--radius-sm); border:1.5px solid var(--gold); cursor:pointer; transition:background .15s; }
    .btn-secondary:hover { background:var(--gold-bg); }
    .btn-blue { background:transparent; color:var(--blue); font-family:var(--font-mono); font-size:12px; letter-spacing:.08em; text-transform:uppercase; padding:14px 24px; border-radius:var(--radius-sm); border:1.5px solid var(--blue); cursor:pointer; transition:background .15s; }
    .btn-blue:hover { background:var(--blue-bg); }
    .btn-ghost { background:transparent; border:none; color:var(--red); font-family:var(--font-mono); font-size:11px; letter-spacing:.06em; cursor:pointer; padding:8px 4px; opacity:.7; }
    .btn-ghost:hover { opacity:1; }
    .btn-icon { background:var(--surface2); border:1px solid var(--border); color:var(--text-mid); border-radius:8px; padding:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .btn-icon:hover { border-color:var(--border-light); color:var(--text); }

    /* Pill */
    .pill { display:inline-flex; background:var(--surface2); border:1px solid var(--border); border-radius:20px; padding:3px 10px; font-family:var(--font-mono); font-size:10px; color:var(--text-dim); }

    /* Bottom nav */
    .nav { position:fixed; bottom:0; left:0; right:0; height:var(--nav-h); background:var(--surface); border-top:1px solid var(--border); display:flex; align-items:stretch; z-index:50; padding-bottom:env(safe-area-inset-bottom); max-width:100%; }
    .nav-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; cursor:pointer; border:none; background:none; color:var(--text-dim); transition:color .15s; padding:8px 0; }
    .nav-item.active { color:var(--gold); }
    .nav-item span { font-family:var(--font-mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; }

    /* Header */
    .header { padding:20px 16px 0; max-width:600px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; }

    /* Divider */
    .hr { border:none; border-top:1px solid var(--border); margin:16px 0; }

    /* Sub tab bar (Setup) */
    .subtabs { display:flex; gap:0; border-bottom:1px solid var(--border); margin-bottom:20px; }
    .subtab { background:none; border:none; cursor:pointer; font-family:var(--font-mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; padding:10px 16px; color:var(--text-dim); border-bottom:2px solid transparent; transition:all .15s; white-space:nowrap; }
    .subtab.on { color:var(--gold); border-bottom-color:var(--gold); }

    /* Overlay */
    .overlay { position:fixed; inset:0; background:#000000cc; z-index:100; display:flex; align-items:flex-end; justify-content:center; padding:0; }
    .sheet { background:var(--surface); border-radius:20px 20px 0 0; padding:28px 20px 40px; width:100%; max-width:600px; }
    .sheet-handle { width:36px; height:4px; background:var(--border-light); border-radius:2px; margin:0 auto 20px; }

    /* Toast */
    .toast { position:fixed; top:20px; left:50%; transform:translateX(-50%); background:var(--surface2); border:1px solid var(--border-light); color:var(--text); font-family:var(--font-mono); font-size:12px; padding:12px 20px; border-radius:var(--radius-sm); z-index:200; white-space:nowrap; animation:slideDown .2s ease; box-shadow:0 8px 32px #00000060; }
    @keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

    /* Cbar */
    .cbar { background:var(--input-bg); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 14px; font-family:var(--font-mono); font-size:11px; color:var(--text-dim); margin-top:8px; line-height:1.6; }
    .cbar b { color:var(--gold); font-weight:400; }

    /* Alert banner */
    .alert-banner { background:linear-gradient(135deg,#c9a96e18,#c9a96e08); border:1px solid var(--gold-dim); border-radius:var(--radius); padding:18px 20px; }

    /* Grid */
    .g2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }

    /* Week entry */
    .wk { background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; margin-bottom:8px; }

    /* Form field */
    .field { margin-bottom:14px; }
    .field-label { font-family:var(--font-mono); font-size:10px; letter-spacing:.15em; text-transform:uppercase; color:var(--text-dim); margin-bottom:8px; display:block; }
  `;

  // ── RENDER ────────────────────────────────────────────────────────────────
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

      {/* ── HEADER ── */}
      <div className="header">
        <div>
          <div style={{fontFamily:"var(--font-serif)",fontSize:26,fontWeight:700,color:"var(--gold)",letterSpacing:".01em",lineHeight:1}}>Bar Buddy</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-dim)",letterSpacing:".15em",textTransform:"uppercase",marginTop:3}}>
            {monthStart ? `Month from ${monthStart} · Wk ${weekNum}` : "Set up your opening stock to begin"}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {weekTotal > 0 && (
            <button className="tag" style={{cursor:"pointer",border:"none"}} onClick={()=>setModal("logWeek")}>
              Log Wk {weekNum}
            </button>
          )}
          <button className="btn-blue" style={{padding:"10px 14px",fontSize:11}} onClick={()=>setModal("newMonth")}>
            New Month
          </button>
        </div>
      </div>

      {/* ══════ HOME ══════ */}
      {tab==="home" && (
        <div className="page">

          {/* Order alert */}
          {orderItems.length > 0 ? (
            <div className="alert-banner" style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--gold)"}}>
                  <Icon.alert />
                  <span style={{fontFamily:"var(--font-serif)",fontSize:18,fontWeight:600}}>Order Needed</span>
                </div>
                <span className="tag">{orderItems.length} item{orderItems.length!==1?"s":""}</span>
              </div>
              {orderItems.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{fontSize:14,color:"var(--text)"}}>{item.name}</span>
                  <span style={{fontFamily:"var(--font-serif)",fontSize:18,fontWeight:600,color:"var(--gold)"}}>{item.toOrder} <span style={{fontSize:12,fontFamily:"var(--font-mono)",fontWeight:400}}>{item.purchaseUnit}{item.toOrder!==1?"s":""}</span></span>
                </div>
              ))}
              <button className="btn-primary" style={{marginTop:14}} onClick={()=>setTab("orders")}>View Full Order Report</button>
            </div>
          ) : (
            <div className="card" style={{marginBottom:12,borderColor:"var(--green-bg)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"var(--green)",fontSize:20}}>✓</span>
                <div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:16,fontWeight:600,color:"var(--green)"}}>All Stock Above Par</div>
                  <div style={{fontSize:11,color:"var(--text-dim)",marginTop:2}}>No orders needed this week</div>
                </div>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="g3" style={{marginBottom:12}}>
            {[{l:"Recipes",v:recipes.length},{l:"Sales",v:totalMonthly},{l:"Week",v:weekNum}].map(s=>(
              <div key={s.l} className="card" style={{textAlign:"center",padding:"16px 10px"}}>
                <div className="stat-n" style={{fontSize:28}}>{s.v}</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--text-dim)",letterSpacing:".12em",textTransform:"uppercase",marginTop:4}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Top usage */}
          {topUsed.length > 0 && (
            <div className="card" style={{marginBottom:12}}>
              <span className="sect">Top Usage This Month</span>
              {topUsed.map(ing=>(
                <div key={ing.id} className="row">
                  <span style={{fontSize:14}}>{ing.name}</span>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--gold)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,usage[ing.id]||0))}</span>
                </div>
              ))}
            </div>
          )}

          {/* Workflow guide */}
          <div className="card">
            <span className="sect">Workflow</span>
            {[
              ["Monthly","var(--blue)","Physical count → Opening Stock"],
              ["Weekly", "var(--gold)","Update deliveries → log sales → check Orders"],
              ["Monthly","var(--blue)","Closing count → Variance → New Month"],
            ].map(([c,col,t],i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:i<2?10:0,alignItems:"flex-start"}}>
                <span style={{color:col,fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:".12em",textTransform:"uppercase",minWidth:50,paddingTop:2}}>{c}</span>
                <span style={{fontSize:12,color:"var(--text-mid)",lineHeight:1.5}}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{textAlign:"center",marginTop:16}}>
            <button className="btn-ghost" onClick={()=>setModal("reset")}>Reset app to demo data</button>
          </div>
        </div>
      )}

      {/* ══════ STOCK & SALES ══════ */}
      {tab==="stock" && (
        <div className="page">

          {/* Opening stock */}
          <div className="card" style={{marginBottom:12,borderColor:"#7dd3fc22"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:20,fontWeight:600,color:"var(--blue)"}}>Opening Stock</div>
              <span className="tag-b">Monthly</span>
            </div>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:18,lineHeight:1.5}}>Enter once per month after your physical count.</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {ingredients.map(ing=>(
                <div key={ing.id}>
                  <label className="field-label">{ing.name}</label>
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
            </div>
          </div>

          {/* Deliveries */}
          <div className="card" style={{marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:20,fontWeight:600,color:"var(--gold)"}}>Deliveries</div>
              <span className="tag">Running total</span>
            </div>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:18,lineHeight:1.5}}>Increase as stock arrives throughout the month.</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {ingredients.map(ing=>(
                <div key={ing.id}>
                  <label className="field-label">{ing.name}</label>
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
            </div>
          </div>

          {/* Weekly sales */}
          <div className="card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:20,fontWeight:600,color:"var(--gold)"}}>Week {weekNum} Sales</div>
              <span className="tag-d">Not logged</span>
            </div>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:18,lineHeight:1.5}}>Enter this week's sales, then log them to add to the monthly total.</div>

            <div style={{marginBottom:16}}>
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
                  <input
                    type="text" inputMode="decimal" placeholder="0 sold"
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
            {weekTotal>0&&(
              <button className="btn-primary" onClick={()=>setModal("logWeek")}>
                Log Week {weekNum} — {weekTotal} drinks
              </button>
            )}
          </div>

          {/* Sales log */}
          {weeklyLog.length>0&&(
            <div className="card" style={{marginTop:12}}>
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

      {/* ══════ ORDERS ══════ */}
      {tab==="orders" && (
        <div className="page">
          <div className="card" style={{marginBottom:12,borderColor:"#c9a96e44"}}>
            <div style={{fontFamily:"var(--font-serif)",fontSize:24,fontWeight:700,color:"var(--gold)",marginBottom:6}}>Order Suggestion</div>
            <div style={{fontSize:12,color:"var(--text-dim)",lineHeight:1.6}}>Opening + deliveries − sales = remaining → vs par → order in whole units</div>
            {weekTotal>0&&(
              <div style={{marginTop:12,fontSize:11,color:"#fb923c",background:"#fb923c0a",border:"1px solid #fb923c22",borderRadius:10,padding:"10px 14px",lineHeight:1.5}}>
                ⚠ {weekTotal} drinks not yet logged this week — log them for a more accurate suggestion.
              </div>
            )}
          </div>
          {orderSugs.map(ing=>{
            const ob=toBase(ing,openingStock[String(ing.id)]);
            const db=toBase(ing,deliveries[String(ing.id)]);
            const ub=usage[ing.id]||0;
            const rb=ob+db-ub;
            return (
              <div key={ing.id} className="card" style={{marginBottom:8,borderColor:ing.toOrder>0?"var(--gold-dim)":"var(--border)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,paddingRight:12}}>
                    <div style={{fontSize:16,marginBottom:10,fontFamily:"var(--font-serif)",fontWeight:600}}>{ing.name}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,fontSize:11,color:"var(--text-dim)",fontFamily:"var(--font-mono)"}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span>Opening</span><span style={{color:"var(--text-mid)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,ob))}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span>Delivered</span><span style={{color:"var(--text-mid)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,db))}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span>Used</span><span style={{color:"var(--text-mid)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,ub))}</span></div>
                      <div style={{borderTop:"1px solid var(--border)",marginTop:4,paddingTop:4,display:"flex",justifyContent:"space-between"}}><span>Remaining</span><span style={{color:"var(--text)"}}>{fmtP(ing.purchaseUnit,toPurch(ing,rb))}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span>Par</span><span style={{color:"var(--text)"}}>{ing.par} {ing.purchaseUnit}s</span></div>
                    </div>
                  </div>
                  <div style={{textAlign:"right",minWidth:80}}>
                    {ing.toOrder>0?(
                      <div style={{background:"var(--gold-bg)",border:"1px solid var(--gold-dim)",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
                        <div style={{fontFamily:"var(--font-serif)",fontSize:32,fontWeight:700,color:"var(--gold)",lineHeight:1}}>{ing.toOrder}</div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--gold)",marginTop:2}}>{ing.purchaseUnit}{ing.toOrder!==1?"s":""}</div>
                      </div>
                    ):(
                      <span className="tag-g"><Icon.check /> Par</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════ VARIANCE ══════ */}
      {tab==="variance" && (
        <div className="page">
          <div className="card" style={{marginBottom:12,borderColor:"#7dd3fc22"}}>
            <div style={{fontFamily:"var(--font-serif)",fontSize:24,fontWeight:700,color:"var(--blue)",marginBottom:6}}>Monthly Variance</div>
            <div style={{fontSize:12,color:"var(--text-dim)",lineHeight:1.6}}>Enter your end-of-month physical count. Surfaces shrinkage and over-pouring.</div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <span className="sect">Actual Closing Count</span>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {ingredients.map(ing=>(
                <div key={ing.id}>
                  <label className="field-label">{ing.name}</label>
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
            </div>
          </div>
          {ingredients.map(item=>{
            const tB=theoClose[item.id]??0, tP=toPurch(item,tB);
            const has=closingStock[String(item.id)]!==undefined&&closingStock[String(item.id)]!=="";
            const aP=num(closingStock[String(item.id)]);
            const vP=aP-tP;
            const pct=tP!==0?((vP/tP)*100).toFixed(1):"—";
            const isNeg=vP<-0.1, isPos=vP>0.1;
            return (
              <div key={item.id} className="card" style={{marginBottom:8,borderColor:isNeg?"var(--red-bg)":isPos?"var(--green-bg)":"var(--border)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontFamily:"var(--font-serif)",fontWeight:600,marginBottom:6}}>{item.name}</div>
                    <div style={{fontSize:11,color:"var(--text-dim)",fontFamily:"var(--font-mono)"}}>
                      Theoretical: <span style={{color:"var(--text-mid)"}}>{fmtP(item.purchaseUnit,tP)}</span>
                      {has&&<> · Actual: <span style={{color:"var(--text)"}}>{fmtP(item.purchaseUnit,aP)}</span></>}
                    </div>
                  </div>
                  {has?(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"var(--font-serif)",fontSize:22,fontWeight:700,color:isNeg?"var(--red)":isPos?"var(--green)":"var(--text-dim)"}}>
                        {vP>0?"+":""}{fmtP(item.purchaseUnit,vP)}
                      </div>
                      <div style={{fontSize:10,color:"var(--text-dim)",marginTop:2,marginBottom:4}}>{pct}%</div>
                      {isNeg&&<span className="tag-r">Investigate ⚠</span>}
                      {isPos&&<span className="tag-g">Surplus</span>}
                      {!isNeg&&!isPos&&<span className="tag-d">On Track</span>}
                    </div>
                  ):<span style={{fontSize:11,color:"var(--text-dim)"}}>Awaiting count</span>}
                </div>
              </div>
            );
          })}
          {Object.values(closingStock).some(v=>v!=="")&&(
            <div style={{marginTop:16}}>
              <button className="btn-blue" style={{width:"100%"}} onClick={()=>setModal("newMonth")}>Close Month & Roll Over →</button>
            </div>
          )}
        </div>
      )}

      {/* ══════ SETUP ══════ */}
      {tab==="setup" && (
        <div className="page">
          <div className="subtabs">
            <button className={`subtab ${subTab==="ingredients"?"on":""}`} onClick={()=>setSubTab("ingredients")}>Ingredients</button>
            <button className={`subtab ${subTab==="recipes"?"on":""}`} onClick={()=>setSubTab("recipes")}>Recipes</button>
          </div>

          {subTab==="ingredients" && (
            <div>
              {/* Add ingredient */}
              <div className="card" style={{marginBottom:12}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:18,fontWeight:600,color:"var(--gold)",marginBottom:16}}>Add Ingredient</div>
                <div className="field">
                  <label className="field-label">Name</label>
                  <TextInput placeholder="e.g. Fresh Lime Juice" value={newIng.name} onChange={v=>setNewIng(p=>({...p,name:v}))} />
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
                  const upd=[...ingredients,{id:Date.now(),name:newIng.name,recipeUnit:newIng.recipeUnit,purchaseUnit:newIng.purchaseUnit,purchaseSize:num(newIng.purchaseSize),par:num(newIng.par)}];
                  setIngredients(upd); saveLib(upd,recipes);
                  setNewIng({name:"",recipeUnit:"ml",purchaseUnit:"bottle",purchaseSize:"",par:""});
                  showToast("Ingredient saved");
                }}>Add Ingredient</button>
              </div>
              {/* Library */}
              <div className="card">
                <span className="sect">Ingredient Library ({ingredients.length})</span>
                {ingredients.length===0&&<div style={{fontSize:13,color:"var(--text-dim)"}}>No ingredients yet.</div>}
                {ingredients.map(ing=>(
                  <div key={ing.id} className="row" style={{alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,marginBottom:6}}>{ing.name}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <span className="pill">{ing.recipeUnit}</span>
                        <span className="pill">{ing.purchaseUnit}</span>
                        <span className="pill">1 {ing.purchaseUnit} = {ing.purchaseSize}{ing.recipeUnit}</span>
                        <span className="tag">par: {ing.par}</span>
                      </div>
                    </div>
                    <button className="btn-icon" onClick={()=>{const u=ingredients.filter(i=>i.id!==ing.id);setIngredients(u);saveLib(u,recipes);showToast("Removed");}}>
                      <Icon.trash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab==="recipes" && (
            <div>
              <div className="card" style={{marginBottom:12}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:18,fontWeight:600,color:"var(--gold)",marginBottom:16}}>Build Recipe Spec</div>
                <div className="field">
                  <label className="field-label">Drink Name</label>
                  <TextInput placeholder="e.g. Espresso Martini" value={newRec.name} onChange={v=>setNewRec(p=>({...p,name:v}))} />
                </div>
                <div className="g2" style={{marginBottom:6}}>
                  <div>
                    <label className="field-label">Ingredient</label>
                    <Select value={newRI.ingredientId} onChange={v=>setNewRI(p=>({...p,ingredientId:v}))}>
                      <option value="">Select</option>
                      {ingredients.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <label className="field-label">Qty {newRI.ingredientId&&`(${ingredients.find(i=>i.id===parseInt(newRI.ingredientId))?.recipeUnit})`}</label>
                    <NumInput value={newRI.quantity} placeholder="e.g. 50"
                      sublabel={newRI.ingredientId&&newRI.quantity?(()=>{const ing=ingredients.find(i=>i.id===parseInt(newRI.ingredientId));return ing?`${fmtP(ing.purchaseUnit,toPurch(ing,num(newRI.quantity)))} per serve`:null;})():null}
                      onChange={v=>setNewRI(p=>({...p,quantity:v}))} />
                  </div>
                </div>
                <div style={{display:"flex",gap:8,margin:"12px 0"}}>
                  <button className="btn-secondary" style={{flex:1}} onClick={()=>{
                    if(!newRI.ingredientId||!newRI.quantity) return;
                    setNewRec(p=>({...p,ings:[...p.ings,{ingredientId:parseInt(newRI.ingredientId),quantity:num(newRI.quantity)}]}));
                    setNewRI({ingredientId:"",quantity:""});
                  }}>+ Add to Spec</button>
                  <button className="btn-primary" style={{flex:1}} onClick={()=>{
                    if(!newRec.name||newRec.ings.length===0) return showToast("Need name + 1 ingredient");
                    const upd=[...recipes,{id:Date.now(),name:newRec.name,ingredients:newRec.ings}];
                    setRecipes(upd); saveLib(ingredients,upd);
                    setNewRec({name:"",ings:[]}); showToast("Recipe saved");
                  }}>Save Recipe</button>
                </div>
                {newRec.ings.length>0&&(
                  <div style={{background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:10,padding:14}}>
                    <span className="sect">Preview — {newRec.name||"Untitled"}</span>
                    {newRec.ings.map((ri,idx)=>{
                      const ing=ingredients.find(i=>i.id===ri.ingredientId);
                      return <div key={idx} style={{fontSize:12,color:"var(--text-mid)",padding:"3px 0"}}>— {ing?.name}: {ri.quantity}{ing?.recipeUnit}</div>;
                    })}
                  </div>
                )}
              </div>
              <div className="card">
                <span className="sect">Recipe Library ({recipes.length})</span>
                {recipes.length===0&&<div style={{fontSize:13,color:"var(--text-dim)"}}>No recipes yet.</div>}
                {recipes.map(recipe=>(
                  <div key={recipe.id} style={{paddingBottom:16,marginBottom:16,borderBottom:"1px solid var(--border)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontFamily:"var(--font-serif)",fontSize:17,fontWeight:600}}>{recipe.name}</div>
                      <button className="btn-icon" onClick={()=>{const u=recipes.filter(r=>r.id!==recipe.id);setRecipes(u);saveLib(ingredients,u);showToast("Removed");}}>
                        <Icon.trash />
                      </button>
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

      {/* ── BOTTOM NAV ── */}
      <nav className="nav">
        {navItems.map(item=>(
          <button key={item.id} className={`nav-item ${tab===item.id?"active":""}`} onClick={()=>setTab(item.id)}>
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ══ LOG WEEK SHEET ══ */}
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

      {/* ══ NEW MONTH SHEET ══ */}
      {modal==="newMonth"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{fontFamily:"var(--font-serif)",fontSize:22,fontWeight:700,color:"var(--blue)",marginBottom:8}}>Start New Month?</div>
            <div style={{fontSize:12,color:"var(--text-dim)",lineHeight:1.8,marginBottom:20}}>
              · Closing count → new opening stock <span style={{color:"var(--text-dim);"}}>(theoretical if none entered)</span><br/>
              · Clears deliveries, sales log, closing stock<br/>
              · Resets to Week 1<br/>
              · Keeps ingredients, recipes and par levels<br/><br/>
              <span style={{color:"#fb923c"}}>This cannot be undone.</span>
            </div>
            <button className="btn-blue" style={{width:"100%",marginBottom:10}} onClick={doNewMonth}>Confirm New Month</button>
            <button className="btn-secondary" style={{width:"100%"}} onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ══ RESET SHEET ══ */}
      {modal==="reset"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div style={{fontFamily:"var(--font-serif)",fontSize:22,fontWeight:700,color:"var(--red)",marginBottom:8}}>Reset Everything?</div>
            <div style={{fontSize:12,color:"var(--text-dim)",lineHeight:1.7,marginBottom:20}}>Wipes all data and reloads demo data. Use this to start completely fresh.</div>
            <button style={{background:"var(--red)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:12,padding:"15px",borderRadius:10,cursor:"pointer",width:"100%",marginBottom:10}} onClick={doReset}>Wipe Everything</button>
            <button className="btn-secondary" style={{width:"100%"}} onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}
