function $(sel){ return document.querySelector(sel); }
function setYear(){ const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear(); }
setYear();

const pickupTypeEl = document.getElementById('pickupType');
const pickupTimeEl = document.getElementById('pickupTime');
if (pickupTypeEl && pickupTimeEl) {
  function togglePickupTime(){
    if(pickupTypeEl.value === 'Preorder'){ pickupTimeEl.required = true; }
    else { pickupTimeEl.required = false; pickupTimeEl.value = ""; }
  }
  pickupTypeEl.addEventListener('change', togglePickupTime);
  togglePickupTime();
}

async function submitOrder(e){
  e.preventDefault();
  const statusEl = document.getElementById('orderStatus');
  const resultEl = document.getElementById('orderResult');
  resultEl.hidden = true;
  if(!SWEET_SIPS_API){
    statusEl.textContent = "⚠️ Add your API URL in assets/js/config.js";
    return;
  }
  const form = e.target;
  const payload = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    drink: form.drink.value,
    milk: form.milk.value,
    pickupType: form.pickupType.value,
    pickupTime: form.pickupTime.value,
    notes: form.notes.value.trim()
  };
  statusEl.textContent = "Submitting...";
  try{
    const r = await fetch(SWEET_SIPS_API, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(()=>null);
    statusEl.textContent = "";
    if(j && j.ok){
      resultEl.hidden = false;
      resultEl.innerHTML = `<b>Order received!</b> Your Order ID is <code>${j.orderId}</code>.`;
      form.reset();
    } else {
      resultEl.hidden = false;
      resultEl.innerHTML = `<b>Error:</b> ${j && j.error ? j.error : 'Unable to submit order.'}`;
    }
  } catch (err){
    statusEl.textContent = "";
    resultEl.hidden = false;
    resultEl.innerHTML = `<b>Error:</b> ${err}`;
  }
}

const orderForm = document.getElementById('orderForm');
if(orderForm){ orderForm.addEventListener('submit', submitOrder); }

async function trackOrder(e){
  e.preventDefault();
  const id = document.getElementById('trackOrderId').value.trim();
  const out = document.getElementById('trackResult');
  out.hidden = true;
  if(!SWEET_SIPS_API){
    out.hidden = false;
    out.innerHTML = "⚠️ Add your API URL in assets/js/config.js";
    return;
  }
  try{
    const r = await fetch(SWEET_SIPS_API + '?orderId=' + encodeURIComponent(id));
    const j = await r.json();
    out.hidden = false;
    if(j.ok){
      out.innerHTML = `<div><b>Status:</b> ${j.status}</div>
      <div><b>Drink:</b> ${j.drink}</div>
      <div><b>Milk:</b> ${j.milk}</div>
      <div><b>Pickup:</b> ${j.pickupType} ${j.pickupTime || ''}</div>
      <div class="muted">Last update: ${j.timestamp}</div>`;
    } else {
      out.textContent = j.error || "Order not found";
    }
  } catch (err){
    out.hidden = false;
    out.textContent = "Error: " + err;
  }
}

const trackForm = document.getElementById('trackForm');
if(trackForm){ trackForm.addEventListener('submit', trackOrder); }
