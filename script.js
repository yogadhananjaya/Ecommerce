document.addEventListener('DOMContentLoaded', () => {
    
    const products = [
        { id: 1, name: "Wireless Headphones", price: 299000, category: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" },
        { id: 2, name: "Smart Watch Series X", price: 450000, category: "electronics", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500" },
        { id: 3, name: "Minimalist T-Shirt", price: 85000, category: "fashion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500" },
        { id: 4, name: "Aesthetic Desk Lamp", price: 150000, category: "home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500" }
    ];

    let cart = JSON.parse(localStorage.getItem('danekerti_cart')) || [];
    updateCartCount();

    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        products.forEach(product => {
            const formatPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price);
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p style="color: var(--primary); font-weight: 600; margin: 0.5rem 0;">${formatPrice}</p>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            `;
            productGrid.appendChild(card);
        });
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart')) {
            const btn = e.target.closest('.add-to-cart');
            const productId = parseInt(btn.dataset.id);
            const product = products.find(p => p.id === productId);
            
            cart.push(product);
            localStorage.setItem('danekerti_cart', JSON.stringify(cart));
            updateCartCount();
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Berhasil ditambahkan ke keranjang!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    function updateCartCount() {
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            countElement.textContent = cart.length;
        }
    }
    const checkoutBtn = document.getElementById('checkout-button');
    if (checkoutBtn) {
        
        let totalHarga = cart.reduce((total, item) => total + item.price, 0);
        document.getElementById('cart-total').textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalHarga);

        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                Swal.fire('Ups!', 'Keranjang kamu masih kosong.', 'warning');
                return;
            }
            Swal.fire({
                title: 'Pilih Metode Pembayaran',
                html: `
                    <div class="mb-3">
                        <p class="text-muted">Total Tagihan: <strong>Rp ${totalHarga.toLocaleString('id-ID')}</strong></p>
                    </div>
                    <select id="payment-method" class="form-select mb-3">
                        <option value="qris">QRIS (GoPay, OVO, Dana)</option>
                        <option value="transfer">Bank Transfer (BCA, Mandiri, BNI)</option>
                        <option value="cod">Cash on Delivery (COD)</option>
                    </select>
                `,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#7e22ce', 
                cancelButtonColor: '#dc3545',
                confirmButtonText: 'Bayar Sekarang',
                cancelButtonText: 'Batal',
                preConfirm: () => {
                    const method = document.getElementById('payment-method').value;
                    return method;
                }
            }).then((result) => {
                if (result.isConfirmed) {                    
                    Swal.fire({
                        title: 'Memproses Pembayaran...',
                        timer: 2000,
                        timerProgressBar: true,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    }).then(() => {                       
                        Swal.fire(
                            'Berhasil!',
                            `Pembayaran via ${result.value.toUpperCase()} berhasil dikonfirmasi. Pesanan segera diproses.`,
                            'success'
                        ).then(() => {
                            cart = [];
                            localStorage.setItem('danekerti_cart', JSON.stringify(cart));
                            window.location.href = 'index.html'; // Balik ke home
                        });
                    });
                }
            });
        });
    }
});

function displayCart() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return; 

    const cart = JSON.parse(localStorage.getItem('danekerti_cart')) || [];
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-basket fa-4x mb-3 text-muted"></i>
                <p class="lead">Keranjangmu masih kosong.</p>
                <a href="products.html" class="btn btn-primary rounded-pill px-4">Mulai Belanja</a>
            </div>`;
        updatePriceSummary(0);
        return;
    }

    let htmlContent = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price;
        htmlContent += `
            <div class="card border-0 shadow-sm mb-3 p-3" style="border-radius: 15px;">
                <div class="row align-items-center">
                    <div class="col-3 col-md-2">
                        <img src="${item.image}" class="img-fluid rounded-3" alt="${item.name}">
                    </div>
                    <div class="col-6 col-md-7">
                        <h6 class="fw-bold mb-1">${item.name}</h6>
                        <p class="text-muted mb-0 small">Kategori: ${item.category || 'General'}</p>
                        <p class="text-primary fw-bold mb-0">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="col-3 col-md-3 text-end">
                        <button class="btn btn-outline-danger btn-sm border-0" onclick="removeItem(${index})">
                            <i class="fas fa-trash-alt"></i>
                        </div>
                </div>
            </div>`;
    });

    cartContainer.innerHTML = htmlContent;
    updatePriceSummary(subtotal);
}

window.removeItem = (index) => {
    let cart = JSON.parse(localStorage.getItem('danekerti_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('danekerti_cart', JSON.stringify(cart));
    displayCart(); 
    updateCartCount(); 
};
function updatePriceSummary(subtotal) {
    const shipping = subtotal > 0 ? 15000 : 0; 
    const total = subtotal + shipping;

    if (document.getElementById('cart-subtotal')) {
        document.getElementById('cart-subtotal').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
        document.getElementById('shipping-cost').innerText = `Rp ${shipping.toLocaleString('id-ID')}`;
        document.getElementById('cart-total').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    }
}

document.addEventListener('DOMContentLoaded', displayCart);