// ============================================
// ⚠️ ЗАМЕНИТЕ на ваш Telegram username (без @)
// ============================================
const TELEGRAM_USERNAME = "shpaika";

// Переменные для работы
let currentProduct = null;
let products = [];

// ============ ЗАГРУЗКА ТОВАРОВ ============
async function loadProducts() {
    try {
        const res = await fetch('products.json?t=' + Date.now());
        if (!res.ok) throw new Error('Ошибка загрузки');
        products = await res.json();
        renderProducts();
    } catch (e) {
        console.error('Ошибка:', e);
        document.getElementById('products').innerHTML =
            '<div class="empty">Не удалось загрузить товары 😔<br><small>Проверьте products.json</small></div>';
    }
}

// ============ ОТРИСОВКА КАРТОЧЕК ============
function renderProducts() {
    const grid = document.getElementById('products');
    const available = products.filter(p => p.in_stock);

    if (available.length === 0) {
        grid.innerHTML = '<div class="empty">Скоро появятся новые игрушки 🧶</div>';
        return;
    }

    grid.innerHTML = available.map(p => `
        <div class="card">
            <div class="card-img">
                ${p.photo
                    ? `<img src="${p.photo}" alt="${escapeHtml(p.name)}" loading="lazy"
                           onerror="this.parentNode.innerHTML='🧸'">`
                    : '🧸'}
            </div>
            <div class="card-body">
                <h3>${escapeHtml(p.name)}</h3>
                <p class="desc">${escapeHtml(p.description || '')}</p>
                <div class="price">${p.price} ₽</div>
                <button class="buy-btn" onclick="openModal(${p.id})">Заказать</button>
            </div>
        </div>
    `).join('');
}

// ============ ЗАЩИТА ОТ XSS ============
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

// ============ ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ============
function openModal(id) {
    currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;

    document.getElementById('modal-product').textContent =
        `${currentProduct.name} — ${currentProduct.price} ₽`;

    document.getElementById('modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    setTimeout(() => document.getElementById('name').focus(), 100);
}

// ============ ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ============
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.getElementById('name').value = '';
    document.getElementById('contact').value = '';
    document.getElementById('comment').value = '';
    currentProduct = null;
}

// ============ ОТПРАВКА ЗАЯВКИ ============
function submitOrder() {
    const name = document.getElementById('name').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const comment = document.getElementById('comment').value.trim();

    if (!name || !contact) {
        alert('Пожалуйста, заполните имя и контакт 🙏');
        return;
    }

    if (!currentProduct) {
        alert('Ошибка: товар не выбран');
        return;
    }

    const text =
        `🧶 Заявка на игрушку\n\n` +
        `📦 Товар: ${currentProduct.name}\n` +
        `💰 Цена: ${currentProduct.price} ₽\n\n` +
        `👤 Имя: ${name}\n` +
        `📞 Контакт: ${contact}\n` +
        (comment ? `💬 Комментарий: ${comment}\n` : '');

    const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
    closeModal();
}

// ============ СЛУШАТЕЛИ СОБЫТИЙ ============
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');

    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });

    loadProducts();
});