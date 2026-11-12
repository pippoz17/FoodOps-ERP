/*
 * FoodOps ERP browser data layer.
 * All records are stored in localStorage; there is no API server or database.
 */
const STORAGE_KEY = 'foodops_erp_data_v2';
const SESSION_KEY = 'foodops_erp_session_v2';
const now = () => new Date();
const todayKey = () => now().toISOString().slice(0, 10);
const dateOffset = days => { const d = now(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
const isoNow = () => now().toISOString();
const round = (n, digits = 2) => Number((Number(n) || 0).toFixed(digits));
const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();
const toNum = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const safeRead = () => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
};

const buildSeed = () => {
  const users = [
    { id: 1, name: 'Alex Morgan', email: 'admin@foodops.local', password: 'FoodOps@123', role: 'Admin', location: 'Main Outlet', active: true },
    { id: 2, name: 'Jordan Lee', email: 'manager@foodops.local', password: 'Manager@123', role: 'Manager', location: 'Main Outlet', active: true },
    { id: 3, name: 'Sam Rivera', email: 'kitchen@foodops.local', password: 'Kitchen@123', role: 'Kitchen Staff', location: 'Main Outlet', active: true },
    { id: 4, name: 'Taylor Kim', email: 'inventory@foodops.local', password: 'Stock@123', role: 'Inventory Staff', location: 'Main Outlet', active: true },
  ];
  const suppliers = [
    { id: 1, supplier_code: 'SUP-001', company_name: 'GreenFields Produce', contact_person: 'Maya Joseph', phone: '+91 98400 21001', email: 'orders@greenfields.example', address: 'Koyambedu, Chennai, Tamil Nadu', categories: 'Vegetables, Fruits', payment_terms: 'Net 7', status: 'Active' },
    { id: 2, supplier_code: 'SUP-002', company_name: 'Prime Protein Co.', contact_person: 'Arun Kumar', phone: '+91 98400 21002', email: 'sales@primeprotein.example', address: 'Guindy, Chennai, Tamil Nadu', categories: 'Chicken, Eggs, Dairy', payment_terms: 'Net 15', status: 'Active' },
    { id: 3, supplier_code: 'SUP-003', company_name: 'Grain & Mill Traders', contact_person: 'Nisha Rao', phone: '+91 98400 21003', email: 'supply@grainmill.example', address: 'Parrys, Chennai, Tamil Nadu', categories: 'Grains, Flour, Sugar', payment_terms: 'Net 15', status: 'Active' },
    { id: 4, supplier_code: 'SUP-004', company_name: 'Culinary Essentials', contact_person: 'Rohan Das', phone: '+91 98400 21004', email: 'hello@culinary.example', address: 'Ambattur, Chennai, Tamil Nadu', categories: 'Oil, Cheese, Butter, Spices', payment_terms: 'Net 30', status: 'Active' },
  ];
  const itemSpecs = [
    ['ING-001','Basmati Rice','Grains','kg',42,10,25,68,3,'B-24081',70],
    ['ING-002','Wheat Flour','Grains','kg',18,8,20,46,3,'F-1182',90],
    ['ING-003','Chicken Breast','Protein','kg',14,8,20,245,2,'C-7781',5],
    ['ING-004','Eggs','Protein','pcs',120,36,90,7,2,'E-0911',12],
    ['ING-005','Milk','Dairy','l',22,8,20,58,2,'M-2107',4],
    ['ING-006','Tomatoes','Vegetables','kg',12,8,18,32,1,'T-1102',3],
    ['ING-007','Onions','Vegetables','kg',16,8,20,28,1,'O-4110',16],
    ['ING-008','Potatoes','Vegetables','kg',20,10,24,30,1,'P-3017',18],
    ['ING-009','Cooking Oil','Pantry','l',15,6,15,142,4,'OIL-551',150],
    ['ING-010','Cheddar Cheese','Dairy','kg',8,4,10,390,4,'CH-081',25],
    ['ING-011','Butter','Dairy','kg',6,3,8,440,4,'BT-620',22],
    ['ING-012','Sugar','Pantry','kg',10,5,10,52,3,'S-991',120],
    ['ING-013','Burger Buns','Bakery','pcs',24,30,60,12,1,'BB-118',2],
    ['ING-014','Paneer','Dairy','kg',7,4,10,320,2,'PN-712',6],
    ['ING-015','Pasta','Grains','kg',9,4,10,118,3,'PA-910',180],
    ['ING-016','Carrots','Vegetables','kg',9,5,12,38,1,'CR-202',11],
    ['ING-017','Lettuce','Vegetables','kg',3,2,6,95,1,'LT-041',2],
    ['ING-018','Cumin & Spice Mix','Pantry','kg',2.5,1,3,280,4,'SP-119',210],
  ];
  const inventory = itemSpecs.map((x, i) => {
    const expiry = dateOffset(x[10]);
    return { id: i + 1, item_code: x[0], name: x[1], category: x[2], unit: x[3], quantity: x[4], min_stock: x[5], reorder_quantity: x[6], purchase_price: x[7], supplier_id: x[8], location_id: 1, batch_number: x[9], expiry_date: expiry, is_active: true, created_at: new Date(Date.now() - (18 - i) * 86400000).toISOString(), batches: [{ id: i + 1, batch_number: x[9], quantity: x[4], expiry_date: expiry, purchase_price: x[7], received_date: dateOffset(-3) }] };
  });
  const byName = name => inventory.find(x => x.name === name)?.id;
  const recipes = [
    { id: 1, recipe_code: 'RCP-001', name: 'Chicken Burger', category: 'Quick service', servings: 1, selling_price: 189, overhead_cost: 8, instructions: 'Grill the chicken, toast the bun, assemble with vegetables and serve.', ingredients: [['Chicken Breast',.15],['Burger Buns',1],['Tomatoes',.04],['Cheddar Cheese',.025],['Cooking Oil',.01]] },
    { id: 2, recipe_code: 'RCP-002', name: 'Vegetable Fried Rice', category: 'Main course', servings: 2, selling_price: 145, overhead_cost: 10, instructions: 'Stir-fry vegetables, fold through cooked rice and season before serving.', ingredients: [['Basmati Rice',.16],['Onions',.04],['Carrots',.05],['Cooking Oil',.02]] },
    { id: 3, recipe_code: 'RCP-003', name: 'Paneer Wrap', category: 'Snacks', servings: 1, selling_price: 165, overhead_cost: 9, instructions: 'Sauté paneer with spices, add vegetables and wrap in a warm flatbread.', ingredients: [['Paneer',.12],['Wheat Flour',.09],['Tomatoes',.04],['Onions',.03]] },
    { id: 4, recipe_code: 'RCP-004', name: 'Masala Dosa', category: 'Breakfast', servings: 1, selling_price: 110, overhead_cost: 7, instructions: 'Prepare the dosa batter, cook until crisp and fill with potato masala.', ingredients: [['Basmati Rice',.08],['Potatoes',.12],['Onions',.03],['Cooking Oil',.015]] },
    { id: 5, recipe_code: 'RCP-005', name: 'Creamy Cheese Pasta', category: 'Main course', servings: 1, selling_price: 175, overhead_cost: 11, instructions: 'Cook pasta, prepare a light cheese sauce and combine just before service.', ingredients: [['Pasta',.12],['Milk',.08],['Cheddar Cheese',.035],['Butter',.01]] },
    { id: 6, recipe_code: 'RCP-006', name: 'Egg Masala', category: 'Main course', servings: 2, selling_price: 135, overhead_cost: 9, instructions: 'Simmer boiled eggs in an aromatic tomato and onion masala.', ingredients: [['Eggs',2],['Tomatoes',.08],['Onions',.05],['Cooking Oil',.02]] },
  ].map(r => ({ ...r, ingredients: r.ingredients.map(([name, quantity]) => ({ item_id: byName(name), quantity, unit: inventory.find(x => x.name === name)?.unit || 'pcs' })) }));
  const suppliersById = id => suppliers.find(x => x.id === id);
  const orderSeed = [
    { id: 1, order_number: 'PO-26001', supplier_id: 1, status: 'Completed', order_date: dateOffset(-4), expected_date: dateOffset(-1), notes: 'Sample procurement record', items: [['Tomatoes',10,30,10],['Onions',12,26,12]] },
    { id: 2, order_number: 'PO-26002', supplier_id: 2, status: 'Ordered', order_date: dateOffset(-3), expected_date: dateOffset(3), notes: 'Cold-chain delivery expected', items: [['Chicken Breast',12,238,0],['Eggs',90,6.8,0]] },
    { id: 3, order_number: 'PO-26003', supplier_id: 3, status: 'Pending', order_date: dateOffset(-1), expected_date: dateOffset(4), notes: 'Sample procurement record', items: [['Basmati Rice',25,65,0],['Wheat Flour',15,44,0]] },
  ];
  const purchases = orderSeed.map(o => ({ id:o.id, order_number:o.order_number, supplier_id:o.supplier_id, supplier_name:suppliersById(o.supplier_id).company_name, status:o.status, order_date:o.order_date, expected_date:o.expected_date, notes:o.notes, total:o.items.reduce((s,x)=>s+x[1]*x[2],0), created_at:new Date(Date.now()-(4-o.id)*86400000).toISOString(), items:o.items.map((x,i)=>({ id:o.id*10+i, item_id:byName(x[0]), item_name:x[0], unit:inventory.find(y=>y.name===x[0]).unit, quantity:x[1], received_quantity:x[3], unit_price:x[2], line_total:x[1]*x[2] })) }));
  const sopSeed = [
    ['Kitchen Opening Checklist','Kitchen Opening Procedures','Kitchen','Kitchen Staff','Daily',['Check handwash station and soap','Verify chiller temperatures','Sanitize preparation benches','Confirm ingredients are labelled','Record opening stock temperatures']],
    ['Food Receiving Standard','Food Receiving Procedures','Stores','Inventory Staff','Every delivery',['Match delivery to purchase order','Inspect packaging and temperature','Check quantity and quality','Record batch and expiry date','Move stock to correct storage']],
    ['Cold Storage & Labelling','Food Storage Procedures','Kitchen','Kitchen Staff','Daily',['Separate raw and ready-to-eat food','Use covered food-grade containers','Apply date and batch labels','Follow FIFO rotation','Record refrigeration temperatures']],
    ['Kitchen Closing Routine','Kitchen Closing Procedures','Kitchen','Kitchen Staff','Daily',['Store and label remaining food','Clean cooking equipment','Sanitize food-contact surfaces','Remove waste and clean bins','Switch off non-essential equipment']],
    ['Cleaning & Sanitization','Cleaning and Sanitization','Facilities','Kitchen Staff','Daily',['Prepare approved sanitizing solution','Remove food debris','Wash and rinse surfaces','Apply sanitizer for required contact time','Sign off the cleaning log']],
    ['Weekly Stock Audit','Inventory Auditing','Stores','Inventory Staff','Weekly',['Print current inventory list','Count physical quantities','Compare system and physical stock','Record variances for review','Submit adjustment approval']],
  ];
  const sops = sopSeed.map((x,i)=>({ id:i+1, sop_code:`SOP-${String(i+1).padStart(3,'0')}`, title:x[0], category:x[1], description:`Standard operating procedure for ${x[0].toLowerCase()}.`, department:x[2], assigned_role:x[3], responsible_person:'Shift Supervisor', frequency:x[4], instructions:'Follow each step in sequence. Record exceptions and notify the shift supervisor when a check cannot be completed.', checklist:x[5], completed_items:i===0?[0,1]:i===1?[0]:[], completion_percent:i===0?40:i===1?20:0, version:1, status:'Active', approval_status:i<2?'Approved':'Draft', purpose:'To standardize the procedure and ensure consistent execution across shifts.', scope:'Applies to assigned staff at the Main Outlet.', batch_yield:'As specified by the approved recipe or production plan.', ingredients:'', equipment:'', preparation:'', quality_standards:'', troubleshooting:'', storage_shelf_life:'', hygiene_safety:'', allergens:'', final_checks:'', training_notes:'', revision_history:[], updated_at:isoNow() }));
  sops.push({id:7,sop_code:'SOP-007',title:'Classic Milk Bubble Tea',category:'Beverage Preparation',description:'Standard preparation for a chilled black tea and milk bubble tea with tapioca pearls.',department:'Kitchen',assigned_role:'Kitchen Staff',responsible_person:'Beverage Station Lead',frequency:'Per order',instructions:'Brew tea strong and cool completely before use. Add pearls to the serving cup, shake the measured drink base with ice, then serve immediately.',checklist:['Confirm tea decoction is brewed and fully cooled','Add 50 g fresh, chewy tapioca pearls to the serving cup','Measure tea, milk, syrup and ice','Shake for 8–10 seconds until cold and slightly frothy','Pour over pearls and seal or serve immediately'],completed_items:[],version:1,status:'Active',approval_status:'Draft',purpose:'To deliver a consistent milk-based bubble tea with measured ingredients and repeatable preparation.',scope:'Applies to staff preparing Classic Milk Bubble Tea at the beverage station.',batch_yield:'One serving. Serve immediately after preparation.',ingredients:'Black tea decoction — 120 ml — strong brewed and cooled\nChilled milk — 120 ml — full cream or toned milk\nCooked tapioca pearls — 50 g — fresh and chewy\nSugar syrup — 20–25 ml — adjust to sweetness level\nIce cubes — 120 g — measured quantity',equipment:'Shaker, measuring jigger, serving cup, wide straw and cup sealer (if used).',preparation:'1. Brew black tea strong and cool it completely before use.\n2. Add cooked tapioca pearls into the serving cup and coat with a small quantity of sugar syrup.\n3. Add black tea decoction, milk, remaining sugar syrup and ice cubes to a shaker.\n4. Shake for 8–10 seconds until cold and slightly frothy.\n5. Pour over the pearls without crushing them.\n6. Seal the cup or serve immediately with a wide straw.',quality_standards:'Tea base must be cooled before combining with milk. Tapioca pearls should be fresh and chewy. Measure syrup and ice consistently.',troubleshooting:'If the tea base is still hot, cool it completely before mixing. If sweetness varies, verify the measured syrup quantity rather than estimating.',storage_shelf_life:'The reference procedure specifies cooled tea before preparation and immediate service. Follow the outlet-approved holding and discard policy for prepared components.',hygiene_safety:'Use clean equipment and food-grade containers. Keep chilled milk under the outlet’s approved cold-storage controls.',allergens:'Contains milk. Check the ingredient labels of syrups and toppings for additional allergen declarations.',final_checks:'Check the cup rim, confirm the correct topping and serve immediately with a wide straw.',training_notes:'Staff must demonstrate measured ingredient portions and the specified 8–10 second shake.',revision_history:[],updated_at:isoNow()});
  const waste = [
    { id:1, item_id:6, item_name:'Tomatoes', quantity:1.2, unit:'kg', reason:'Soft stock removed during quality check', category:'Spoiled Food', waste_date:dateOffset(-2), estimated_cost:38.4, department:'Kitchen', inventory_adjusted:true },
    { id:2, item_id:4, item_name:'Eggs', quantity:6, unit:'pcs', reason:'Cracked during receiving', category:'Damaged Stock', waste_date:dateOffset(-6), estimated_cost:42, department:'Stores', inventory_adjusted:false },
    { id:3, item_id:5, item_name:'Milk', quantity:.5, unit:'l', reason:'Unused opened pack at close', category:'Expired Stock', waste_date:dateOffset(-10), estimated_cost:29, department:'Kitchen', inventory_adjusted:false },
  ];
  // Seed movements, including opening stock and the sample wastage deduction.
  const movements = inventory.map((x,i)=>({ id:i+1, item:x.name, item_id:x.id, type:'Opening balance', quantity:x.quantity, unit:x.unit, before:0, after:x.quantity, reason:'Seeded opening stock', date:new Date(Date.now()-(inventory.length-i)*86400000).toISOString(), user:'Taylor Kim' }));
  const tom = inventory.find(x=>x.name==='Tomatoes');
  if (tom) { tom.quantity = Math.max(0, tom.quantity - 1.2); tom.batches[0].quantity = tom.quantity; movements.unshift({ id:100, item:'Tomatoes', item_id:tom.id, type:'Waste', quantity:-1.2, unit:'kg', before:12, after:10.8, reason:'Soft stock removed during quality check', date:new Date(Date.now()-2*86400000).toISOString(), user:'Sam Rivera' }); }
  const notifications = [
    { id:1, title:'Low stock alert', message:'Burger Buns are below their minimum stock level.', kind:'warning', is_read:false, created_at:isoNow() },
    { id:2, title:'Expiry approaching', message:'Milk and Tomatoes have batches approaching expiry.', kind:'danger', is_read:false, created_at:new Date(Date.now()-3600000).toISOString() },
    { id:3, title:'Purchase awaiting receipt', message:'PO-26002 is awaiting delivery confirmation.', kind:'info', is_read:false, created_at:new Date(Date.now()-7200000).toISOString() },
  ];
  return {
    version:2, initialized_at:isoNow(), counters:{ user:4, supplier:4, inventory:18, recipe:6, purchase:3, sop:7, waste:3, menu:0, movement:100, notification:3, activity:6 },
    users, suppliers, inventory, recipes, purchases, sops, waste, menus:[], movements, notifications,
    activity:[
      {id:6,action:'Received purchase stock',entity:'Purchases',details:'PO-26001 · Completed',user:'Jordan Lee',time:new Date(Date.now()-2*86400000).toISOString()},
      {id:5,action:'Recorded food waste',entity:'Waste Management',details:'Tomatoes · 1.2 kg',user:'Sam Rivera',time:new Date(Date.now()-2*86400000).toISOString()},
      {id:4,action:'Created purchase order',entity:'Purchases',details:'PO-26003',user:'Jordan Lee',time:new Date(Date.now()-86400000).toISOString()},
      {id:3,action:'Completed SOP checklist',entity:'SOP Management',details:'Kitchen Opening Checklist',user:'Sam Rivera',time:new Date(Date.now()-5*3600000).toISOString()},
      {id:2,action:'Added inventory item',entity:'Inventory',details:'Cumin & Spice Mix',user:'Taylor Kim',time:new Date(Date.now()-4*86400000).toISOString()},
      {id:1,action:'Created recipe',entity:'Recipes',details:'Chicken Burger',user:'Alex Morgan',time:new Date(Date.now()-5*86400000).toISOString()},
    ],
    settings:{ business_name:'FoodOps Kitchen', outlet_name:'Main Outlet', currency:'INR', target_food_cost:30, units:['kg','g','l','ml','pcs','pack'], theme:'Blue Enterprise' },
  };
};

let cache = safeRead() || buildSeed();
if (!cache.version || !cache.inventory || !cache.users) cache = buildSeed();
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); }
// Upgrade existing browser records without discarding the user's saved operational data.
if (Array.isArray(cache.sops)) {
  const defaults = { approval_status:'Draft', purpose:'', scope:'', batch_yield:'', ingredients:'', equipment:'', preparation:'', quality_standards:'', troubleshooting:'', storage_shelf_life:'', hygiene_safety:'', allergens:'', final_checks:'', training_notes:'', revision_history:[] };
  cache.sops = cache.sops.map(sop => ({ ...defaults, ...sop }));
  if (!cache.sops.some(sop => sop.sop_code === 'SOP-007')) { const referenceSop = buildSeed().sops.find(sop => sop.sop_code === 'SOP-007'); if (referenceSop) cache.sops.push(referenceSop); }
  cache.counters.sop = Math.max(cache.counters.sop || 0, ...cache.sops.map(sop => Number(sop.id) || 0));
  if (cache.settings) cache.settings.theme = 'Blue Enterprise';
  persist();
}
function sessionUser() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
function requireUser() { const user = sessionUser(); if (!user) throw new Error('Please sign in to continue.'); return user; }
function requireRole(...roles) { const user = requireUser(); if (!roles.includes(user.role)) throw new Error('Your role does not have permission to perform this action.'); return user; }
function activity(action, entity, details='') { const user=sessionUser(); cache.activity.unshift({ id:++cache.counters.activity, action, entity, details, user:user?.name || 'System', time:isoNow() }); cache.activity=cache.activity.slice(0,120); }
function notify(title,message,kind='info') { cache.notifications.unshift({ id:++cache.counters.notification,title,message,kind,is_read:false,created_at:isoNow() }); }
function getSupplier(id) { return cache.suppliers.find(x=>x.id===Number(id)); }
function getItem(id) { return cache.inventory.find(x=>x.id===Number(id) && x.is_active!==false); }
function statusOf(item) {
  if (item.quantity <= 0) return 'Out of Stock';
  const activeBatches=(item.batches||[]).filter(x=>x.quantity>0 && x.expiry_date);
  if (activeBatches.length) {
    const expired=activeBatches.filter(x=>x.expiry_date<todayKey()).reduce((s,x)=>s+x.quantity,0);
    const soon=activeBatches.some(x=>x.expiry_date>=todayKey() && x.expiry_date<=dateOffset(30));
    if (expired >= item.quantity - .000001) return 'Expired';
    if (soon) return 'Expiring Soon';
  } else if (item.expiry_date) {
    if (item.expiry_date<todayKey()) return 'Expired';
    if (item.expiry_date<=dateOffset(30)) return 'Expiring Soon';
  }
  return item.quantity<=item.min_stock ? 'Low Stock' : 'In Stock';
}
function itemDict(item) {
  const batches=(item.batches||[]).filter(x=>x.quantity>0).sort((a,b)=>(a.expiry_date||'9999').localeCompare(b.expiry_date||'9999'));
  const first=batches.find(x=>x.expiry_date) || batches[0];
  return {...item, supplier_name:getSupplier(item.supplier_id)?.company_name || '—', expiry_date:first?.expiry_date || item.expiry_date || '', batch_number:first?.batch_number || item.batch_number || '', batches, batch_count:batches.length, status:statusOf(item), inventory_value:round(item.quantity*item.purchase_price)};
}
function convertQty(quantity, from, to) {
  const factors={ 'kg:g':1000, 'g:kg':.001, 'l:ml':1000, 'ml:l':.001 };
  return quantity*(factors[`${from}:${to}`] || 1);
}
function costRecipe(recipe) {
  let ingredientTotal=0, enough=true;
  const lines=(recipe.ingredients||[]).map((line,index)=>{
    const item=getItem(line.item_id); if(!item) { enough=false; return {id:index+1,item_id:line.item_id,name:'Unavailable ingredient',quantity:line.quantity,unit:line.unit,unit_cost:0,cost:0,contribution:0,available:false}; }
    const required=convertQty(toNum(line.quantity),line.unit||item.unit,item.unit);
    const cost=required*item.purchase_price; const available=item.quantity>=required; enough=enough&&available; ingredientTotal+=cost;
    return {id:index+1,item_id:item.id,name:item.name,quantity:line.quantity,unit:line.unit||item.unit,item_unit:item.unit,unit_cost:item.purchase_price,cost:round(cost),contribution:0,available,required_in_stock_unit:round(required,3),stock_quantity:item.quantity};
  });
  const total=ingredientTotal+toNum(recipe.overhead_cost); const servings=Math.max(1,toNum(recipe.servings,1)); const per=total/servings; const price=toNum(recipe.selling_price); const food=price>0?per/price*100:0; const profit=price-per;
  lines.forEach(x=>x.contribution=ingredientTotal?round(x.cost/ingredientTotal*100,1):0);
  return {ingredient_total:round(ingredientTotal),total_cost:round(total),cost_per_serving:round(per),selling_price:price,gross_profit:round(profit),profit_margin:price?round(profit/price*100,1):0,food_cost_percentage:round(food,1),ingredients_available:enough,suggested_price:round(per/(toNum(cache.settings.target_food_cost,30)/100)),lines};
}
function recipeDict(recipe) { return { ...recipe, ...costRecipe(recipe) }; }
function orderDict(order) {
  const supplier=getSupplier(order.supplier_id);
  return {...order,supplier_name:supplier?.company_name||order.supplier_name||'—',items:order.items.map(line=>({...line,item_name:getItem(line.item_id)?.name||line.item_name||'Unknown',unit:getItem(line.item_id)?.unit||line.unit||'' ,line_total:round(line.quantity*line.unit_price)}))};
}
function sopDict(sop) { const steps=sop.checklist||[]; const done=sop.completed_items||[]; return {...sop,completion_percent:steps.length?Math.round(done.length/steps.length*100):0}; }
function addBatch(item, quantity, batchNumber, expiryDate, price) {
  if (quantity<=0) return;
  item.batches ||= [];
  item.batches.push({id:++cache.counters.movement,batch_number:batchNumber||`LOT-${uid()}`,quantity,expiry_date:expiryDate||'',purchase_price:price??item.purchase_price,received_date:todayKey()});
}
function deductBatches(item, qty) {
  let remaining=qty;
  const sorted=(item.batches||[]).filter(x=>x.quantity>0).sort((a,b)=>(a.expiry_date||'9999').localeCompare(b.expiry_date||'9999'));
  for (const batch of sorted) { if(remaining<=0) break; const take=Math.min(batch.quantity,remaining); batch.quantity=round(batch.quantity-take,3); remaining-=take; }
}
function addMovement(item,type,quantity,before,after,reason,reference='') {
  cache.movements.unshift({id:++cache.counters.movement,item:item.name,item_id:item.id,type,quantity:round(quantity,3),unit:item.unit,before:round(before,3),after:round(after,3),reason:reference?`${reason} · ${reference}`:reason,date:isoNow(),user:sessionUser()?.name||'System'});
  cache.movements=cache.movements.slice(0,500);
}
function dashboardData() {
  const items=cache.inventory.filter(x=>x.is_active!==false).map(itemDict); const recipes=cache.recipes.map(recipeDict); const orders=cache.purchases; const waste=cache.waste; const start=todayKey().slice(0,7);
  const low=items.filter(x=>['Low Stock','Out of Stock'].includes(x.status)); const expiring=items.filter(x=>['Expiring Soon','Expired'].includes(x.status)&&x.quantity>0);
  const values=recipes.filter(x=>x.food_cost_percentage>0).map(x=>x.food_cost_percentage);
  const months=[], purchases=[], wastes=[];
  for(let offset=5;offset>=0;offset--){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-offset);const key=d.toISOString().slice(0,7);months.push(d.toLocaleDateString('en-IN',{month:'short'}));purchases.push(round(orders.filter(x=>(x.order_date||'').slice(0,7)===key).reduce((s,x)=>s+x.total,0)));wastes.push(round(waste.filter(x=>(x.waste_date||'').slice(0,7)===key).reduce((s,x)=>s+x.estimated_cost,0)));}
  return {
    kpis:{inventory_value:round(items.reduce((s,x)=>s+x.inventory_value,0)),average_recipe_food_cost:values.length?round(values.reduce((s,x)=>s+x,0)/values.length,1):0,total_ingredients:items.length,low_stock_items:low.length,expiring_items:expiring.length,monthly_purchase_expenses:round(orders.filter(x=>(x.order_date||'').slice(0,7)===start).reduce((s,x)=>s+x.total,0)),monthly_waste:round(waste.filter(x=>(x.waste_date||'').slice(0,7)===start).reduce((s,x)=>s+x.estimated_cost,0)),average_profit_margin:recipes.length?round(recipes.reduce((s,x)=>s+x.profit_margin,0)/recipes.length,1):0},
    charts:{months,purchases,waste:wastes,inventory:[...new Set(items.map(x=>x.category))].sort().map(c=>({name:c,value:round(items.filter(x=>x.category===c).reduce((s,x)=>s+x.inventory_value,0))})),recipe_costs:recipes.map(x=>({name:x.name,food_cost:x.food_cost_percentage}))},
    recent_ingredients:[...items].sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||'')).slice(0,5),low_stock:low.slice(0,6),expiring:expiring.slice(0,5),recent_activity:cache.activity.slice(0,8).map(x=>({id:x.id,action:x.action,entity:x.entity,details:x.details,user:x.user,time:x.time})),recent_orders:orders.slice(0,5).map(orderDict),
    recent:cache.activity.slice(0,8).map(x=>({id:x.id,action:x.action,entity:x.entity,details:x.details,user:x.user,time:x.time})),
  };
}
function reportSummary() {
  const items=cache.inventory.filter(x=>x.is_active!==false);const recipes=cache.recipes.map(recipeDict);const sops=cache.sops.map(sopDict);
  return {inventory_value:round(items.reduce((s,x)=>s+x.quantity*x.purchase_price,0)),stock_units:round(items.reduce((s,x)=>s+x.quantity,0)),purchase_spend:round(cache.purchases.reduce((s,x)=>s+x.total,0)),waste_cost:round(cache.waste.reduce((s,x)=>s+x.estimated_cost,0)),recipe_count:recipes.length,average_food_cost:recipes.length?round(recipes.reduce((s,x)=>s+x.food_cost_percentage,0)/recipes.length,1):0,low_stock:items.filter(x=>['Low Stock','Out of Stock'].includes(statusOf(x))).length,sop_completion:sops.length?round(sops.reduce((s,x)=>s+x.completion_percent,0)/sops.length,1):0};
}
function reportRows(type, params) {
  const p=params||{};
  if(type==='inventory') return cache.inventory.filter(x=>x.is_active!==false && (!p.category||p.category==='All categories'||x.category===p.category)).map(itemDict).map(x=>({'Item code':x.item_code,Name:x.name,Category:x.category,Quantity:x.quantity,Unit:x.unit,'Unit cost':x.purchase_price,'Inventory value':x.inventory_value,Status:x.status,Expiry:x.expiry_date}));
  if(type==='purchases') return cache.purchases.filter(x=>(!p.supplier_id||String(x.supplier_id)===String(p.supplier_id))&&(!p.from||x.order_date>=p.from)&&(!p.to||x.order_date<=p.to)).map(orderDict).map(x=>({'Order number':x.order_number,Supplier:x.supplier_name,Date:x.order_date,Status:x.status,Total:x.total}));
  if(type==='waste') return cache.waste.filter(x=>(!p.from||x.waste_date>=p.from)&&(!p.to||x.waste_date<=p.to)).map(x=>({Date:x.waste_date,Item:x.item_name,Category:x.category,Quantity:x.quantity,Unit:x.unit,Reason:x.reason,Cost:x.estimated_cost}));
  if(type==='recipes') return cache.recipes.map(recipeDict).map(x=>({Recipe:x.name,Servings:x.servings,'Ingredient cost':x.ingredient_total,'Total cost':x.total_cost,'Cost per serving':x.cost_per_serving,'Selling price':x.selling_price,'Food cost %':x.food_cost_percentage,'Profit margin %':x.profit_margin}));
  throw new Error('Unknown report type.');
}
function downloadCsv(rows, filename) {
  const headers=rows.length?Object.keys(rows[0]):['No records'];
  const quote=value=>`"${String(value??'').replaceAll('"','""')}"`;
  const csv=[headers.map(quote).join(','),...rows.map(row=>headers.map(h=>quote(row[h])).join(','))].join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}

function normalizePath(path) { const u=new URL(path,'http://foodops.local'); return {path:u.pathname.replace(/^\/api/,'')||'/',params:u.searchParams}; }
function listData(method,path) {
  const {path:p,params}=normalizePath(path); requireUser();
  if(method==='GET'&&p==='/dashboard') return dashboardData();
  if(method==='GET'&&p==='/inventory') return cache.inventory.filter(x=>x.is_active!==false).filter(x=>!params.get('category')||params.get('category')==='All categories'||x.category===params.get('category')).filter(x=>!params.get('search')||`${x.name} ${x.item_code}`.toLowerCase().includes(params.get('search').toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)).map(itemDict);
  if(method==='GET'&&p==='/inventory/movements') return cache.movements;
  if(method==='GET'&&p==='/suppliers') return cache.suppliers.map(s=>({...s,total_purchases:round(cache.purchases.filter(o=>o.supplier_id===s.id).reduce((sum,o)=>sum+o.total,0))})).sort((a,b)=>a.company_name.localeCompare(b.company_name));
  if(method==='GET'&&p==='/recipes') return cache.recipes.map(recipeDict).sort((a,b)=>a.name.localeCompare(b.name));
  if(method==='GET'&&p==='/purchase-orders') return [...cache.purchases].sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||'')).map(orderDict);
  if(method==='GET'&&p==='/sops') return cache.sops.map(sopDict).sort((a,b)=>a.title.localeCompare(b.title));
  if(method==='GET'&&p==='/waste') return [...cache.waste].sort((a,b)=>b.waste_date.localeCompare(a.waste_date));
  if(method==='GET'&&p==='/menus') return [...cache.menus].sort((a,b)=>b.created_at.localeCompare(a.created_at));
  if(method==='GET'&&p==='/reports/summary') return reportSummary();
  if(method==='GET'&&p==='/notifications') return cache.notifications;
  if(method==='GET'&&p==='/users') {requireRole('Admin'); return cache.users.map(({password,...u})=>u);}
  if(method==='GET'&&p==='/activity') return cache.activity;
  if(method==='GET'&&p==='/auth/me') { const u=sessionUser(); if(!u) throw new Error('Not signed in.'); return {user:u}; }
  if(method==='GET'&&p==='/backup') return cache;
  throw new Error(`Unsupported local data request: ${method} ${p}`);
}

function postData(path, body={}) {
  const {path:p}=normalizePath(path);
  if(p==='/auth/login') {
    const user=cache.users.find(x=>x.email.toLowerCase()===String(body.email||'').trim().toLowerCase()&&x.password===body.password&&x.active);
    if(!user) throw new Error('Invalid email or password.');
    const publicUser={id:user.id,name:user.name,email:user.email,role:user.role,location:user.location||'Main Outlet'};localStorage.setItem(SESSION_KEY,JSON.stringify(publicUser));activity('Signed in','Authentication',user.email);persist();return {user:publicUser};
  }
  if(p==='/auth/logout') {activity('Signed out','Authentication');localStorage.removeItem(SESSION_KEY);persist();return {message:'Signed out successfully.'};}
  if(p==='/global-search') {
    requireUser();const q=String(body.query||'').toLowerCase();const rows=[];
    cache.inventory.filter(x=>x.is_active!==false&&`${x.name} ${x.item_code}`.toLowerCase().includes(q)).slice(0,5).forEach(x=>rows.push({type:'Inventory',label:x.name,detail:`${x.item_code} · ${x.category}`}));
    cache.recipes.filter(x=>x.name.toLowerCase().includes(q)).slice(0,4).forEach(x=>rows.push({type:'Recipe',label:x.name,detail:x.category}));
    cache.suppliers.filter(x=>x.company_name.toLowerCase().includes(q)).slice(0,4).forEach(x=>rows.push({type:'Supplier',label:x.company_name,detail:x.categories}));
    cache.purchases.filter(x=>x.order_number.toLowerCase().includes(q)).slice(0,4).forEach(x=>rows.push({type:'Purchase order',label:x.order_number,detail:x.status}));return rows.slice(0,10);
  }
  let m;
  if((m=p.match(/^\/inventory\/(\d+)\/adjust$/))) {
    requireRole('Admin','Manager','Inventory Staff');const item=getItem(m[1]);if(!item)throw new Error('Inventory item not found.');const qty=toNum(body.quantity,NaN);if(!Number.isFinite(qty)||qty===0)throw new Error('Adjustment quantity must be a non-zero number.');const before=item.quantity,after=round(before+qty,3);if(after<0)throw new Error('This adjustment would make stock negative.');item.quantity=after;if(qty>0)addBatch(item,qty,body.batch_number,body.expiry_date,item.purchase_price);else deductBatches(item,Math.abs(qty));addMovement(item,'Adjustment',qty,before,after,body.reason||'Manual stock adjustment');activity('Adjusted stock','Inventory',`${item.name}: ${qty>0?'+':''}${qty} ${item.unit}`);persist();return itemDict(item);
  }
  if(p==='/inventory') {
    requireRole('Admin','Manager','Inventory Staff');if(!String(body.name||'').trim()||!body.category||!body.unit)throw new Error('Item name, category and unit are required.');const qty=toNum(body.quantity),price=toNum(body.purchase_price),minimum=toNum(body.min_stock),reorder=toNum(body.reorder_quantity);if([qty,price,minimum,reorder].some(x=>x<0))throw new Error('Quantity, stock levels and price must be valid non-negative numbers.');
    const item={id:++cache.counters.inventory,item_code:body.item_code||`ING-${uid()}`,name:String(body.name).trim(),category:body.category,unit:body.unit,quantity:qty,min_stock:minimum,reorder_quantity:reorder,purchase_price:price,supplier_id:body.supplier_id?Number(body.supplier_id):null,location_id:1,batch_number:body.batch_number||'',expiry_date:body.expiry_date||'',is_active:true,created_at:isoNow(),batches:[]};cache.inventory.push(item);if(qty){addBatch(item,qty,item.batch_number,item.expiry_date,price);addMovement(item,'Opening balance',qty,0,qty,'Initial stock entry');}activity('Added inventory item','Inventory',item.name);persist();return itemDict(item);
  }
  if(p==='/suppliers') {
    requireRole('Admin','Manager');if(!String(body.company_name||'').trim())throw new Error('Supplier company name is required.');const row={id:++cache.counters.supplier,supplier_code:body.supplier_code||`SUP-${uid()}`,company_name:String(body.company_name).trim(),contact_person:body.contact_person||'',phone:body.phone||'',email:body.email||'',address:body.address||'',categories:body.categories||'',payment_terms:body.payment_terms||'Net 15',status:body.status||'Active'};cache.suppliers.push(row);activity('Added supplier','Suppliers',row.company_name);persist();return row;
  }
  if(p==='/recipes') return saveRecipe(null,body);
  if(p==='/purchase-orders') {
    requireRole('Admin','Manager','Inventory Staff');const supplier=getSupplier(body.supplier_id);if(!supplier)throw new Error('Select a valid supplier.');if(!Array.isArray(body.items)||!body.items.length)throw new Error('Add at least one item to the purchase order.');const seen=new Set();const lines=body.items.map(x=>{const item=getItem(x.item_id);const qty=toNum(x.quantity,NaN),price=toNum(x.unit_price,NaN);if(!item||qty<=0||price<0||!Number.isFinite(qty)||!Number.isFinite(price)||seen.has(item.id))throw new Error('Check the purchase quantities and prices. Add each inventory item only once per order.');seen.add(item.id);return {id:uid(),item_id:item.id,item_name:item.name,unit:item.unit,quantity:qty,received_quantity:0,unit_price:price};});const status=body.status||'Pending';if(!['Draft','Pending'].includes(status))throw new Error('New purchase orders must start as Draft or Pending.');const order={id:++cache.counters.purchase,order_number:`PO-${todayKey().replaceAll('-','').slice(2)}-${uid().slice(0,4)}`,supplier_id:supplier.id,status,order_date:body.order_date||todayKey(),expected_date:body.expected_date||'',total:round(lines.reduce((s,x)=>s+x.quantity*x.unit_price,0)),notes:body.notes||'',created_at:isoNow(),items:lines};cache.purchases.unshift(order);activity('Created purchase order','Purchases',order.order_number);persist();return orderDict(order);
  }
  if((m=p.match(/^\/purchase-orders\/(\d+)\/receive$/))) {
    requireRole('Admin','Manager','Inventory Staff');const order=cache.purchases.find(x=>x.id===Number(m[1]));if(!order)throw new Error('Purchase order not found.');if(['Completed','Cancelled'].includes(order.status))throw new Error('This order cannot receive additional stock.');const received=body.items||[];const ids=received.map(x=>Number(x.item_id));if(new Set(ids).size!==ids.length||ids.some(id=>!order.items.some(l=>l.item_id===id)))throw new Error('Received quantities must be valid and unique per item.');for(const line of order.items){const meta=received.find(x=>Number(x.item_id)===line.item_id);const amount=toNum(meta?.received_quantity);if(amount<0||line.received_quantity+amount>line.quantity+.000001)throw new Error('Received quantities cannot exceed the ordered quantity.');}
    for(const line of order.items){const meta=received.find(x=>Number(x.item_id)===line.item_id);const amount=toNum(meta?.received_quantity);if(amount<=0)continue;const item=getItem(line.item_id);if(!item)throw new Error('Inventory item not found.');const before=item.quantity;item.quantity=round(item.quantity+amount,3);line.received_quantity=round(line.received_quantity+amount,3);item.purchase_price=line.unit_price;const batch=meta?.batch_number||`${order.order_number}-${item.item_code}`;const expiry=meta?.expiry_date||'';addBatch(item,amount,batch,expiry,line.unit_price);item.batch_number=batch;if(expiry)item.expiry_date=expiry;addMovement(item,'Purchase receipt',amount,before,item.quantity,`Received against ${order.order_number}`);}
    const all=order.items.every(x=>x.received_quantity>=x.quantity),any=order.items.some(x=>x.received_quantity>0);order.status=all?'Completed':any?'Partially Received':'Ordered';activity('Received purchase stock','Purchases',`${order.order_number} · ${order.status}`);if(all)notify('Purchase order received',`${order.order_number} has been fully received.`,'success');persist();return orderDict(order);
  }
  if((m=p.match(/^\/sops\/(\d+)\/checklist$/))) {
    requireUser();const sop=cache.sops.find(x=>x.id===Number(m[1]));if(!sop)throw new Error('SOP not found.');const index=Number(body.index);if(!Number.isInteger(index)||index<0||index>=sop.checklist.length)throw new Error('Checklist item not found.');const set=new Set(sop.completed_items||[]);if(body.completed===false)set.delete(index);else set.add(index);sop.completed_items=[...set].sort((a,b)=>a-b);sop.completion_percent=sop.checklist.length?Math.round(sop.completed_items.length/sop.checklist.length*100):0;persist();return sopDict(sop);
  }
  if(p==='/sops') return saveSop(null,body);
  if(p==='/waste') {
    requireRole('Admin','Manager','Kitchen Staff','Inventory Staff');const qty=toNum(body.quantity,NaN);if(!Number.isFinite(qty)||qty<=0)throw new Error('Waste quantity must be greater than zero.');const item=body.item_id?getItem(body.item_id):null;if(body.item_id&&!item)throw new Error('Select a valid inventory item.');if(!item&&!String(body.item_name||'').trim())throw new Error('Enter the wasted item or dish name.');const adjust=Boolean(body.adjust_inventory!==false)&&Boolean(item);if(adjust&&item.quantity<qty)throw new Error('Recorded waste exceeds available inventory.');const cost=body.estimated_cost===''||body.estimated_cost==null?(item?qty*item.purchase_price:0):toNum(body.estimated_cost,NaN);if(!Number.isFinite(cost)||cost<0)throw new Error('Estimated waste cost must be a valid non-negative amount.');const row={id:++cache.counters.waste,item_id:item?.id||null,item_name:item?.name||body.item_name,quantity:qty,unit:item?.unit||body.unit||'pcs',reason:body.reason||'',category:body.category||'Other',waste_date:body.waste_date||todayKey(),estimated_cost:round(cost),department:body.department||'',inventory_adjusted:adjust};cache.waste.unshift(row);if(adjust){const before=item.quantity;item.quantity=round(item.quantity-qty,3);deductBatches(item,qty);addMovement(item,'Waste',-qty,before,item.quantity,row.reason||row.category,'WASTE');}activity('Recorded food waste','Waste Management',`${row.item_name} · ${qty} ${row.unit}`);persist();return {id:row.id,message:'Waste record saved.'};
  }
  if(p==='/menus/generate') return generateMenu(body);
  if(p==='/menus') {
    requireRole('Admin','Manager');if(!body.name||!body.dishes?.length)throw new Error('Enter a menu name and add at least one dish.');const row={id:++cache.counters.menu,name:body.name,cuisine:body.cuisine||'Any',meal_category:body.meal_category||'Any',budget:toNum(body.budget),target_food_cost:toNum(body.target_food_cost,30),dietary_preference:body.dietary_preference||'Any',dishes:body.dishes,status:'Saved',created_at:isoNow()};cache.menus.unshift(row);activity('Saved menu plan','AI Menu Studio',row.name);persist();return row;
  }
  if((m=p.match(/^\/notifications\/(\d+)\/read$/))) {requireUser();const row=cache.notifications.find(x=>x.id===Number(m[1]));if(row)row.is_read=true;persist();return {message:'Notification marked as read.'};}
  if(p==='/users') {requireRole('Admin');if(!body.name||!body.email||String(body.password||'').length<8)throw new Error('Enter a name, valid email and password with at least 8 characters.');if(cache.users.some(x=>x.email.toLowerCase()===body.email.toLowerCase()))throw new Error('An account with this email already exists.');const row={id:++cache.counters.user,name:body.name,email:body.email,password:body.password,role:body.role||'Kitchen Staff',location:'Main Outlet',active:true};cache.users.push(row);persist();return {id:row.id,name:row.name,email:row.email,role:row.role,location:row.location,active:true};}
  throw new Error(`Unsupported local data request: POST ${p}`);
}
function saveRecipe(id, body) {
  requireRole('Admin','Manager');if(!String(body.name||'').trim())throw new Error('Recipe name is required.');if(!body.ingredients?.length)throw new Error('Add at least one ingredient to the recipe.');const lines=body.ingredients.map(x=>{const item=getItem(x.item_id),qty=toNum(x.quantity,NaN);if(!item||!Number.isFinite(qty)||qty<=0)throw new Error('Check servings, prices and ingredient quantities.');return {item_id:item.id,quantity:qty,unit:x.unit||item.unit};});const servings=toNum(body.servings,1),price=toNum(body.selling_price),overhead=toNum(body.overhead_cost);if(servings<1||price<0||overhead<0)throw new Error('Check servings, prices and ingredient quantities.');let recipe;if(id){recipe=cache.recipes.find(x=>x.id===id);if(!recipe)throw new Error('Recipe not found.');}else{recipe={id:++cache.counters.recipe,recipe_code:`RCP-${uid()}`};cache.recipes.push(recipe);}Object.assign(recipe,{name:String(body.name).trim(),category:body.category||'Main course',servings,selling_price:price,overhead_cost:overhead,instructions:body.instructions||'',ingredients:lines});activity('Saved recipe','Recipes',recipe.name);persist();return recipeDict(recipe);
}
function saveSop(id, body) {
  requireRole('Admin','Manager');if(!body.title||!body.category)throw new Error('SOP title and category are required.');let sop;if(id){sop=cache.sops.find(x=>x.id===id);if(!sop)throw new Error('SOP not found.');}else{sop={id:++cache.counters.sop,sop_code:`SOP-${uid()}`,version:1,completed_items:[]};cache.sops.push(sop);}const checklist=Array.isArray(body.checklist)?body.checklist:String(body.checklist||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);const previous={version:sop.version,title:sop.title,updated_at:sop.updated_at,approval_status:sop.approval_status||'Draft'};const history=[...(sop.revision_history||[])];if(id){history.unshift({...previous,changed_by:sessionUser()?.name||'User'});sop.version+=1;}Object.assign(sop,{ title:body.title,category:body.category,description:body.description||'',department:body.department||'',assigned_role:body.assigned_role||'',responsible_person:body.responsible_person||'',frequency:body.frequency||'Daily',instructions:body.instructions||'',checklist,status:body.status||'Active',approval_status:body.approval_status||sop.approval_status||'Draft',purpose:body.purpose||'',scope:body.scope||'',batch_yield:body.batch_yield||'',ingredients:body.ingredients||'',equipment:body.equipment||'',preparation:body.preparation||'',quality_standards:body.quality_standards||'',troubleshooting:body.troubleshooting||'',storage_shelf_life:body.storage_shelf_life||'',hygiene_safety:body.hygiene_safety||'',allergens:body.allergens||'',final_checks:body.final_checks||'',training_notes:body.training_notes||'',revision_history:history,updated_at:isoNow()});sop.completed_items=(sop.completed_items||[]).filter(i=>i<checklist.length);activity('Saved SOP','SOP Management',sop.title);persist();return sopDict(sop);
}
function generateMenu(body) {
  requireUser();const cuisine=String(body.cuisine||'Any').toLowerCase(),meal=body.meal_category||'Any',diet=String(body.dietary_preference||'Any').toLowerCase();const count=Math.max(1,Math.min(12,Math.floor(toNum(body.number_of_dishes,4)))),budget=Math.max(0,toNum(body.budget)),target=Math.min(80,Math.max(5,toNum(body.target_food_cost,30)));
  const templates=[
    ['Vegetable Fried Rice','Asian','Rice',['rice','vegetable','oil'],'A wok-tossed rice bowl with seasonal vegetables.'],['Chicken Rice Bowl','Asian','Rice',['chicken','rice','onion'],'Tender chicken with seasoned rice and aromatics.'],['Paneer Wrap','Indian','Snacks',['paneer','wheat','tomato'],'Spiced paneer and fresh vegetables in a soft wrap.'],['Masala Dosa','South Indian','Breakfast',['rice','potato','oil'],'Crisp fermented crepe with a spiced potato filling.'],['Tomato Pasta','Italian','Main course',['tomato','pasta','cheese'],'Pasta finished in a slow-cooked tomato sauce.'],['Chicken Burger','Continental','Snacks',['chicken','bread','tomato'],'Grilled chicken patty with crisp vegetables.'],['Garden Salad','International','Starters',['lettuce','tomato','onion'],'A fresh seasonal salad with a light dressing.'],['Egg Masala','Indian','Main course',['egg','tomato','onion'],'Boiled eggs in a spiced tomato-onion gravy.'],['Potato Roast Bowl','South Indian','Sides',['potato','oil','onion'],'Golden potatoes tossed with house spices.'],['Paneer Butter Masala','Indian','Main course',['paneer','tomato','butter'],'Paneer simmered in a creamy tomato gravy.'],['Creamy Cheese Pasta','Italian','Main course',['pasta','milk','cheese'],'Comforting pasta with a creamy cheese sauce.'],['Fresh Fruit & Yogurt Cup','International','Breakfast',['milk','sugar'],'A chilled breakfast cup with seasonal produce.']
  ];
  const dishes=[];for(const [name,c,category,keys,description] of templates){if(!['any','all'].includes(cuisine)&&!c.toLowerCase().includes(cuisine))continue;if(!['any','all','lunch','dinner'].includes(String(meal).toLowerCase())&&!category.toLowerCase().includes(String(meal).toLowerCase()))continue;const nonveg=/chicken|egg/i.test(name);if(['vegetarian','vegan'].includes(diet)&&nonveg)continue;if(diet==='vegan'&&/paneer|cheese|butter|milk/i.test(name))continue;if(diet==='gluten-free'&&/wrap|pasta|burger/i.test(name))continue;const matched=[];for(const key of keys){const item=cache.inventory.find(x=>x.is_active!==false&&(x.name.toLowerCase().includes(key)||(key==='vegetable'&&x.category.toLowerCase()==='vegetables')));if(item)matched.push({item_id:item.id,name:item.name,quantity:['pcs'].includes(item.unit)?1:.12,unit:item.unit,unit_cost:item.purchase_price,available:item.quantity>0});}if(!matched.length)continue;const cost=matched.reduce((s,x)=>s+x.quantity*x.unit_cost,0)+4;const price=round(cost/(target/100));if(budget&&price>budget)continue;dishes.push({name,cuisine:c,category,description,ingredients:matched,preparation:'Prepare and portion the ingredients. Cook using the standard kitchen method, season to taste and serve fresh.',estimated_cost:round(cost),suggested_price:price,expected_profit:round(price-cost),food_cost_percentage:round(cost/price*100,1),dietary_category:nonveg?'Non-vegetarian':'Vegetarian',inventory_match:matched.filter(x=>x.available).length/keys.length});}
  dishes.sort((a,b)=>b.inventory_match-a.inventory_match||a.estimated_cost-b.estimated_cost);return {engine:'Local rules-based recommendation engine',disclaimer:'AI-Assisted Menu Suggestions uses ingredient matching and local costing rules; it is not a generative AI model.',dishes:dishes.slice(0,count),matched_count:Math.min(dishes.length,count),budget};
}
function updateData(method,path,body={}) {
  const {path:p}=normalizePath(path);let m;
  if((m=p.match(/^\/inventory\/(\d+)$/))&&method==='PUT'){requireRole('Admin','Manager','Inventory Staff');const x=getItem(m[1]);if(!x)throw new Error('Inventory item not found.');for(const k of ['name','category','unit','batch_number'])if(k in body)x[k]=body[k];for(const k of ['min_stock','reorder_quantity','purchase_price'])if(k in body){const v=toNum(body[k],NaN);if(!Number.isFinite(v)||v<0)throw new Error(`${k.replaceAll('_',' ')} must be non-negative.`);x[k]=v;}if('supplier_id'in body)x.supplier_id=body.supplier_id?Number(body.supplier_id):null;if('expiry_date'in body)x.expiry_date=body.expiry_date||'';activity('Updated inventory item','Inventory',x.name);persist();return itemDict(x);}
  if((m=p.match(/^\/suppliers\/(\d+)$/))&&method==='PUT'){requireRole('Admin','Manager');const x=getSupplier(m[1]);if(!x)throw new Error('Supplier not found.');Object.assign(x,body);activity('Updated supplier','Suppliers',x.company_name);persist();return x;}
  if((m=p.match(/^\/recipes\/(\d+)$/))&&method==='PUT')return saveRecipe(Number(m[1]),body);
  if((m=p.match(/^\/purchase-orders\/(\d+)\/status$/))&&method==='PUT'){requireRole('Admin','Manager');const o=cache.purchases.find(x=>x.id===Number(m[1]));if(!o)throw new Error('Purchase order not found.');if(['Completed','Partially Received'].includes(o.status))throw new Error('A received order cannot be reset to this status.');if(!['Draft','Pending','Approved','Ordered','Cancelled'].includes(body.status))throw new Error('Unsupported purchase order status.');o.status=body.status;activity('Updated purchase order','Purchases',`${o.order_number} · ${o.status}`);persist();return orderDict(o);}
  if((m=p.match(/^\/sops\/(\d+)$/))&&method==='PUT')return saveSop(Number(m[1]),body);
  throw new Error(`Unsupported local data update: ${method} ${p}`);
}
function deleteData(path) {
  const {path:p}=normalizePath(path);let m;
  if((m=p.match(/^\/inventory\/(\d+)$/))){requireRole('Admin','Manager');const x=getItem(m[1]);if(!x)throw new Error('Inventory item not found.');if(cache.recipes.some(r=>r.ingredients.some(l=>l.item_id===x.id)))throw new Error('This ingredient is used in a recipe. Deactivate it after updating the recipe instead of deleting it.');x.is_active=false;activity('Archived inventory item','Inventory',x.name);persist();return {message:'Inventory item archived.'};}
  if((m=p.match(/^\/suppliers\/(\d+)$/))){requireRole('Admin','Manager');const x=getSupplier(m[1]);if(!x)throw new Error('Supplier not found.');if(cache.inventory.some(i=>i.supplier_id===x.id&&i.is_active!==false)||cache.purchases.some(o=>o.supplier_id===x.id)){x.status='Inactive';persist();return {message:'Supplier marked inactive because it has linked records.'};}cache.suppliers=cache.suppliers.filter(s=>s.id!==x.id);persist();return {message:'Supplier deleted.'};}
  if((m=p.match(/^\/recipes\/(\d+)$/))){requireRole('Admin','Manager');const x=cache.recipes.find(r=>r.id===Number(m[1]));if(!x)throw new Error('Recipe not found.');cache.recipes=cache.recipes.filter(r=>r.id!==x.id);activity('Deleted recipe','Recipes',x.name);persist();return {message:'Recipe deleted.'};}
  if((m=p.match(/^\/sops\/(\d+)$/))){requireRole('Admin','Manager');const x=cache.sops.find(r=>r.id===Number(m[1]));if(!x)throw new Error('SOP not found.');x.status='Archived';activity('Archived SOP','SOP Management',x.title);persist();return {message:'SOP archived.'};}
  throw new Error(`Unsupported local data deletion: ${p}`);
}

export const api = {
  async get(path) { await Promise.resolve(); if(normalizePath(path).path==='/auth/me') { const u=sessionUser(); if(!u)throw new Error('Not signed in.'); return {user:u}; } return listData('GET',path); },
  async post(path,body={}) { await Promise.resolve(); return postData(path,body); },
  async put(path,body={}) { await Promise.resolve(); return updateData('PUT',path,body); },
  async delete(path) { await Promise.resolve(); return deleteData(path); },
  async download(path,filename) { const {path:p,params}=normalizePath(path);requireUser();const m=p.match(/^\/reports\/(inventory|purchases|waste|recipes)\.csv$/);if(!m)throw new Error('Unknown export.');const filters=Object.fromEntries(params.entries());downloadCsv(reportRows(m[1],filters),filename||`foodops-${m[1]}.csv`);return true; },
  exportBackup() { const blob=new Blob([JSON.stringify(cache,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`foodops-backup-${todayKey()}.json`;a.click();URL.revokeObjectURL(url); },
  async importBackup(file) { const text=await file.text();let data;try{data=JSON.parse(text);}catch{throw new Error('This file is not valid JSON.');}if(!data||!Array.isArray(data.inventory)||!Array.isArray(data.suppliers)||!Array.isArray(data.recipes))throw new Error('This does not look like a FoodOps ERP backup.');cache=data;persist();return true; },
  resetDemoData() { cache=buildSeed();persist();localStorage.removeItem(SESSION_KEY);return true; },
  getSettings() { return cache.settings; },
  saveSettings(settings) { cache.settings={...cache.settings,...settings};persist(); },
};

export function money(value) { const currency=cache?.settings?.currency||'INR'; return new Intl.NumberFormat('en-IN',{style:'currency',currency,maximumFractionDigits:currency==='INR'?0:2}).format(Number(value)||0); }
export function number(value,digits=1) { return Number(value||0).toLocaleString('en-IN',{maximumFractionDigits:digits}); }
export function shortDate(value) { if(!value)return '—';const d=new Date(`${String(value).slice(0,10)}T00:00:00`);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'}); }
