(function(){
  const $ = (s, sc=document) => sc.querySelector(s);
  const $$ = (s, sc=document) => Array.from(sc.querySelectorAll(s));
  const JGET = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const JSET = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // year
  const y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());

  // subscribe
  const subForm = $('#subscribeForm'), subMsg = $('#subscribeMsg');
  if (subForm){
    subForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = String($('#subEmail').value||'').trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok){ subMsg.textContent = 'Enter a valid email.'; subMsg.style.color = '#b45309'; return; }
      const subs = JGET('techfix_subs', []);
      if (!subs.includes(email)) subs.push(email);
      JSET('techfix_subs', subs);
      subMsg.textContent = 'Subscribed.'; subMsg.style.color = '#065f46';
      subForm.reset();
    });
  }

  // cart
  const CART_KEY = 'techfix_cart';
  const getCart = () => JGET(CART_KEY, []);
  const setCart = (c) => JSET(CART_KEY, c);
  const cartCount = $('#cartCount');
  const updateCount = () => { if (cartCount) cartCount.textContent = String(getCart().reduce((n,i)=>n+(i.qty||1),0)); };
  updateCount();

  $$('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.product');
      const item = { id:card.dataset.id, name:card.dataset.name, price:Number(card.dataset.price), qty:1 };
      const cart = getCart();
      const f = cart.find(x => x.id === item.id);
      if (f) f.qty += 1; else cart.push(item);
      setCart(cart); updateCount();
      alert('Added: ' + item.name);
    });
  });

  const viewBtn = $('#viewCartBtn'), clearBtn = $('#clearCartBtn');
  const cartArea = $('#cartArea'), cartBody = $('#cartBody'), cartTotal = $('#cartTotal');
  function renderCart(){
    if (!cartBody) return;
    const cart = getCart();
    cartBody.innerHTML = '';
    let total = 0;
    cart.forEach((it, i) => {
      const sub = it.price * (it.qty||1);
      total += sub;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.name}</td>
        <td>
          <button class="qty dec" data-i="${i}">-</button>
          <span class="qty-val">${it.qty||1}</span>
          <button class="qty inc" data-i="${i}">+</button>
        </td>
        <td>$${it.price.toFixed(2)}</td>
        <td>$${sub.toFixed(2)}</td>
        <td><button class="rm" data-i="${i}">x</button></td>
      `;
      cartBody.appendChild(tr);
    });
    if (cartTotal) cartTotal.textContent = '$' + total.toFixed(2);
  }
  if (viewBtn){ viewBtn.addEventListener('click', () => {
    if (cartArea.hasAttribute('hidden')){ renderCart(); cartArea.removeAttribute('hidden'); }
    else { cartArea.setAttribute('hidden',''); }
  });}
  if (clearBtn){ clearBtn.addEventListener('click', () => { setCart([]); renderCart(); updateCount(); cartArea.setAttribute('hidden',''); }); }
  if (cartBody){
    cartBody.addEventListener('click', (e) => {
      const cart = getCart();
      if (e.target.classList.contains('rm')){
        cart.splice(Number(e.target.dataset.i), 1);
      }
      if (e.target.classList.contains('inc')){
        cart[Number(e.target.dataset.i)].qty += 1;
      }
      if (e.target.classList.contains('dec')){
        const i = Number(e.target.dataset.i);
        cart[i].qty = Math.max(1, (cart[i].qty||1) - 1);
      }
      setCart(cart); renderCart(); updateCount();
    });
  }

  const fbForm = $('#feedbackForm'), fbStatus = $('#fbStatus'), restore = $('#restoreDraftBtn');
  if (fbForm){
    fbForm.addEventListener('input', () => {
      const data = Object.fromEntries(new FormData(fbForm).entries());
      sessionStorage.setItem('techfix_fb_draft', JSON.stringify(data));
    });
    if (restore){
      restore.addEventListener('click', () => {
        try{
          const data = JSON.parse(sessionStorage.getItem('techfix_fb_draft') || '{}');
          for (const [k,v] of Object.entries(data)){
            if (fbForm.elements[k]) fbForm.elements[k].value = v;
          }
          fbStatus.textContent = 'Draft restored.';
        }catch{}
      });
    }
    fbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(fbForm).entries());
      if (!data.name || !data.email || !data.message || !data.rating){
        fbStatus.textContent = 'Complete all fields.'; fbStatus.style.color = '#b45309'; return;
      }
      const all = JGET('techfix_feedbacks', []);
      all.push({...data, ts: Date.now()});
      JSET('techfix_feedbacks', all);
      sessionStorage.removeItem('techfix_fb_draft');
      fbForm.reset();
      fbStatus.textContent = 'Thanks!'; fbStatus.style.color = '#065f46';
    });
  }

  // custom order
  const coForm = $('#customOrderForm'), coStatus = $('#customOrderStatus');
  if (coForm){
    coForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(coForm).entries());
      if (!data.name || !data.email || !data.type || !data.details || !data.quantity){
        coStatus.textContent = 'Complete all fields.'; coStatus.style.color = '#b45309'; return;
      }
      const orders = JGET('techfix_orders', []);
      orders.push({...data, id:'CO-' + Math.random().toString(36).slice(2,7)});
      JSET('techfix_orders', orders);
      coForm.reset();
      coStatus.textContent = 'Request received.'; coStatus.style.color = '#065f46';
    });
  }
})();
