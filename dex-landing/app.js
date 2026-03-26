// SwapDEX – Interações UI

// ——— NAVBAR scroll ———
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ——— Hamburger menu ———
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');
hamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});
// close on link click
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ——— Connect wallet button ———
let connected = false;
const connectBtns = document.querySelectorAll('.btn-connect, #swapActionBtn');
const swapActionBtn = document.getElementById('swapActionBtn');

document.getElementById('connectBtn').addEventListener('click', handleConnect);
swapActionBtn.addEventListener('click', () => {
  if (!connected) handleConnect();
  else executeSwap();
});

function handleConnect() {
  connected = true;
  document.getElementById('connectBtn').innerHTML = '<span class="btn-dot"></span> 0x4a3b...9f21';
  swapActionBtn.textContent = 'Confirmar Swap';
  showToast('✅ Carteira conectada com sucesso!');
}

function executeSwap() {
  const from = document.getElementById('fromAmount').value;
  if (!from || from <= 0) {
    showToast('⚠️ Insira um valor válido para trocar.', 'warn');
    return;
  }
  swapActionBtn.textContent = 'Processando...';
  swapActionBtn.disabled = true;
  setTimeout(() => {
    swapActionBtn.textContent = '✅ Swap Concluído!';
    showToast('🎉 Swap realizado com sucesso!');
    setTimeout(() => {
      swapActionBtn.textContent = 'Confirmar Swap';
      swapActionBtn.disabled = false;
      document.getElementById('fromAmount').value = '';
      document.getElementById('toAmount').value = '';
    }, 2000);
  }, 1500);
}

// ——— Swap amount calculation ———
const fromAmount = document.getElementById('fromAmount');
const toAmount   = document.getElementById('toAmount');
const RATE = 3241.80; // ETH/USDC mock rate

fromAmount.addEventListener('input', () => {
  const val = parseFloat(fromAmount.value);
  toAmount.value = val > 0 ? (val * RATE).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
});

// MAX button
document.querySelector('.max-btn').addEventListener('click', () => {
  fromAmount.value = '2.4581';
  fromAmount.dispatchEvent(new Event('input'));
});

// ——— Swap arrow flip ———
document.getElementById('swapArrowBtn').addEventListener('click', () => {
  const fromLabel = document.querySelector('#tokenFromSelect span');
  const toLabel   = document.querySelector('#tokenToSelect span');
  const tmp = fromLabel.textContent;
  fromLabel.textContent = toLabel.textContent;
  toLabel.textContent = tmp;
  fromAmount.value = '';
  toAmount.value = '';
});

// ——— Toast notifications ———
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 32px; right: 32px; z-index: 9999;
    background: rgba(10,16,37,0.95);
    border: 1px solid ${type === 'warn' ? 'rgba(247,147,26,0.4)' : 'rgba(0,245,255,0.3)'};
    color: ${type === 'warn' ? '#F7931A' : '#00F5FF'};
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem; font-weight: 500;
    padding: 14px 22px; border-radius: 12px;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: slideInRight 0.35s cubic-bezier(0.4,0,0.2,1);
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ——— Intersection Observer animations ———
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.token-card, .gov-card, .stat-card, .wallet-card, .pool-item, .proposal-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ——— CSS animations ———
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(40px); }
  }
`;
document.head.appendChild(style);
