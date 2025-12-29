
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService, MenuItem } from '../services/config.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="menu" class="py-16 bg-white overflow-hidden min-h-screen relative">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        <!-- Section Title -->
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-serif font-bold text-brand-brown mb-2">Menu & Pesanan</h2>
          <div class="h-1 w-24 bg-brand-orange mx-auto rounded"></div>
          <p class="mt-4 text-gray-600">Pilih cabang, pilih menu, dan pesan langsung via WhatsApp!</p>
        </div>

        <!-- Branch Tabs -->
        <div class="flex flex-wrap justify-center gap-2 mb-10">
          @for (branch of config().branches; track $index) {
             <button 
               (click)="setBranch($index)"
               class="px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 border-2"
               [class.bg-brand-brown]="selectedBranchIndex() === $index"
               [class.border-brand-brown]="selectedBranchIndex() === $index"
               [class.text-white]="selectedBranchIndex() === $index"
               [class.bg-transparent]="selectedBranchIndex() !== $index"
               [class.border-gray-300]="selectedBranchIndex() !== $index"
               [class.text-gray-600]="selectedBranchIndex() !== $index"
               [class.shadow-lg]="selectedBranchIndex() === $index"
             >
               {{ branch.name }}
             </button>
          }
        </div>

        <!-- Favorites Slider -->
        @if (favoriteItems().length > 0) {
          <div class="relative max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-16 animate-fade-in">
             <div class="absolute top-4 left-4 z-20 bg-brand-gold text-brand-brown px-3 py-1 rounded-full text-xs font-bold shadow">
               ★ REKOMENDASI
             </div>
             
             <!-- Slide Content -->
             <div class="relative aspect-[4/3] md:aspect-[21/9] w-full bg-gray-100 group">
               @if (isVideo(currentFavItem().image)) {
                 <video [src]="currentFavItem().image" autoplay muted loop playsinline class="w-full h-full object-cover"></video>
               } @else {
                 <img [src]="currentFavItem().image" class="w-full h-full object-cover transition duration-700 group-hover:scale-105">
               }
               <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
               <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  <h3 class="text-2xl md:text-3xl font-serif font-bold mb-1">{{ currentFavItem().name }}</h3>
                  <p class="text-gray-200 text-sm md:text-base line-clamp-2 mb-2">{{ currentFavItem().desc }}</p>
                  <p class="text-brand-gold font-bold text-xl">{{ currentFavItem().price }}</p>
                  
                  <!-- Add to Cart from Slider -->
                  <button (click)="addToCart(currentFavItem())" class="mt-3 bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Pesan Menu Ini
                  </button>
               </div>
             </div>
             
             <!-- Controls -->
             <div class="absolute bottom-6 right-6 flex gap-2 z-20">
               <button (click)="prevSlide()" class="p-2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white transition">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
               </button>
               <button (click)="nextSlide()" class="p-2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white transition">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
               </button>
             </div>
          </div>
        }

        <!-- Menu List Grid -->
        <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
           <h3 class="text-2xl font-serif font-bold text-brand-brown pl-4 border-l-4 border-brand-orange">Daftar Menu Lengkap</h3>
           <span class="text-sm text-gray-500 italic hidden md:block">Klik tombol + untuk menambah pesanan</span>
        </div>
        
        @if (currentBranchMenu().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of currentBranchMenu(); track $index) {
              <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition group flex flex-col h-full">
                <!-- Image -->
                <div class="h-48 overflow-hidden relative bg-gray-100">
                   @if (isVideo(item.image)) {
                      <video [src]="item.image" class="w-full h-full object-cover" muted loop></video>
                   } @else {
                      <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                   }
                   @if (item.favorite) {
                     <span class="absolute top-2 right-2 bg-brand-gold text-brand-brown text-[10px] font-bold px-2 py-1 rounded shadow">FAVORIT</span>
                   }
                </div>

                <!-- Content -->
                <div class="p-5 flex flex-col flex-1">
                  <div class="flex justify-between items-start mb-2">
                     <span class="text-[10px] font-bold text-brand-orange uppercase tracking-wider bg-brand-cream px-2 py-1 rounded">{{ item.category }}</span>
                     <span class="font-bold text-brand-brown">{{ item.price }}</span>
                  </div>
                  <h4 class="font-serif font-bold text-lg mb-2 text-gray-800 leading-tight">{{ item.name }}</h4>
                  <p class="text-gray-500 text-sm mb-4 flex-1 line-clamp-3">{{ item.desc }}</p>
                  
                  <!-- Add to Cart Controls -->
                  <div class="mt-auto pt-4 border-t border-gray-50">
                    @if (getQty(item) === 0) {
                      <button (click)="addToCart(item)" class="w-full py-2 bg-brand-brown text-white rounded-lg font-bold text-sm hover:bg-brand-orange transition flex items-center justify-center gap-2">
                        <span>+ Tambah Pesanan</span>
                      </button>
                    } @else {
                      <div class="flex items-center justify-between bg-brand-cream rounded-lg p-1">
                        <button (click)="removeFromCart(item)" class="w-8 h-8 flex items-center justify-center bg-white text-brand-brown rounded shadow hover:bg-gray-50 font-bold transition">-</button>
                        <span class="font-bold text-brand-brown">{{ getQty(item) }}</span>
                        <button (click)="addToCart(item)" class="w-8 h-8 flex items-center justify-center bg-brand-brown text-white rounded shadow hover:bg-brand-orange font-bold transition">+</button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p class="text-gray-400">Belum ada menu di cabang ini.</p>
          </div>
        }
      </div>

      <!-- Floating Cart Button -->
      @if (cartTotalItems() > 0) {
        <div class="fixed bottom-6 right-6 z-40 animate-bounce-in">
          <button (click)="toggleCartModal()" class="bg-brand-orange text-white p-4 rounded-full shadow-2xl hover:bg-orange-600 transition flex items-center gap-3 pr-6 border-2 border-white">
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
                {{ cartTotalItems() }}
              </span>
            </div>
            <div class="flex flex-col items-start">
              <span class="text-xs font-medium opacity-90">Total Pesanan</span>
              <span class="text-sm font-bold">{{ formatRupiah(totalPrice()) }}</span>
            </div>
          </button>
        </div>
      }

      <!-- Cart Modal Overlay -->
      @if (showCartModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="toggleCartModal()"></div>
          
          <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-scale-up flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="bg-brand-brown p-4 text-white flex justify-between items-center">
              <div>
                <h3 class="font-bold text-lg">Detail Pesanan</h3>
                <p class="text-xs text-brand-cream opacity-80">{{ currentBranch().name }}</p>
              </div>
              <button (click)="toggleCartModal()" class="text-white/70 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Scrollable Items -->
            <div class="p-4 overflow-y-auto flex-1">
              @if (cartItemsList().length > 0) {
                <ul class="space-y-4">
                  @for (item of cartItemsList(); track item.menu.name) {
                    <li class="flex gap-3">
                       <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                         @if (isVideo(item.menu.image)) {
                           <video [src]="item.menu.image" class="w-full h-full object-cover"></video>
                         } @else {
                           <img [src]="item.menu.image" class="w-full h-full object-cover">
                         }
                       </div>
                       <div class="flex-1">
                         <h4 class="font-bold text-gray-800 text-sm line-clamp-1">{{ item.menu.name }}</h4>
                         <p class="text-xs text-gray-500 mb-1">{{ item.menu.price }}</p>
                         <div class="flex items-center gap-3">
                           <button (click)="removeFromCart(item.menu)" class="w-6 h-6 bg-gray-200 rounded text-gray-600 font-bold hover:bg-gray-300">-</button>
                           <span class="text-sm font-bold">{{ item.qty }}</span>
                           <button (click)="addToCart(item.menu)" class="w-6 h-6 bg-gray-200 rounded text-gray-600 font-bold hover:bg-gray-300">+</button>
                         </div>
                       </div>
                       <div class="flex flex-col justify-between items-end">
                         <span class="font-bold text-brand-orange text-sm">
                           {{ formatRupiah(parsePrice(item.menu.price) * item.qty) }}
                         </span>
                       </div>
                    </li>
                  }
                </ul>
              } @else {
                <div class="text-center py-10 text-gray-400">
                  Keranjang kosong.
                </div>
              }
            </div>

            <!-- Footer Summary -->
            <div class="bg-gray-50 p-4 border-t border-gray-200">
               <div class="space-y-2 mb-4 text-sm">
                 <div class="flex justify-between text-gray-600">
                   <span>Subtotal</span>
                   <span>{{ formatRupiah(subtotalPrice()) }}</span>
                 </div>
                 <div class="flex justify-between text-gray-600">
                   <span>Pajak (10%)</span>
                   <span>{{ formatRupiah(taxPrice()) }}</span>
                 </div>
                 <div class="flex justify-between font-bold text-lg text-brand-brown pt-2 border-t border-gray-200">
                   <span>Total Bayar</span>
                   <span>{{ formatRupiah(totalPrice()) }}</span>
                 </div>
               </div>

               <button 
                 (click)="checkout()" 
                 [disabled]="cartTotalItems() === 0"
                 class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
               >
                 <span>Pesan via WhatsApp</span>
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                 </svg>
               </button>
               <p class="text-[10px] text-center text-gray-400 mt-2">
                 Pesanan akan diteruskan ke WhatsApp Admin Cabang {{ currentBranch().name }}.
               </p>
            </div>
          </div>
        </div>
      }

    </section>
  `,
  styles: [`
    .animate-bounce-in {
      animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes bounceIn {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); }
    }
    .animate-scale-up {
      animation: scaleUp 0.3s ease-out;
    }
    @keyframes scaleUp {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 1s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class MenuComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  selectedBranchIndex = signal(0);
  sliderIndex = signal(0);
  
  // Cart Map: MenuItem -> Quantity
  cart = signal<Map<MenuItem, number>>(new Map());
  showCartModal = signal(false);

  // --- Computed Data Helpers ---
  
  currentBranch = computed(() => this.config().branches[this.selectedBranchIndex()]);
  currentBranchMenu = computed(() => this.currentBranch().menu);
  
  favoriteItems = computed(() => this.currentBranchMenu().filter(m => m.favorite));
  
  currentFavItem = computed(() => {
    const favs = this.favoriteItems();
    return favs.length > 0 ? favs[this.sliderIndex() % favs.length] : this.currentBranchMenu()[0];
  });

  cartItemsList = computed(() => {
    const list: {menu: MenuItem, qty: number}[] = [];
    this.cart().forEach((qty, menu) => {
      if (qty > 0) list.push({menu, qty});
    });
    return list;
  });

  cartTotalItems = computed(() => {
    let count = 0;
    for (const qty of this.cart().values()) count += qty;
    return count;
  });

  // --- Price Calculations ---

  parsePrice(priceStr: string): number {
    // Remove "Rp", spaces, and dots/commas then parse
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  subtotalPrice = computed(() => {
    let total = 0;
    this.cart().forEach((qty, item) => {
      total += this.parsePrice(item.price) * qty;
    });
    return total;
  });

  taxPrice = computed(() => Math.floor(this.subtotalPrice() * 0.1)); // 10% Tax

  totalPrice = computed(() => this.subtotalPrice() + this.taxPrice());

  // --- Actions ---

  setBranch(index: number) {
    if (this.selectedBranchIndex() !== index) {
      this.selectedBranchIndex.set(index);
      this.sliderIndex.set(0);
      this.cart.set(new Map()); // Reset cart when changing branch
    }
  }

  addToCart(item: MenuItem) {
    this.cart.update(currentMap => {
      // Explicitly type the new Map to avoid 'unknown' inference
      const newMap = new Map<MenuItem, number>(currentMap);
      const currentQty = newMap.get(item) || 0;
      newMap.set(item, currentQty + 1);
      return newMap;
    });
  }

  removeFromCart(item: MenuItem) {
    this.cart.update(currentMap => {
      // Explicitly type the new Map to avoid 'unknown' inference
      const newMap = new Map<MenuItem, number>(currentMap);
      const currentQty = newMap.get(item) || 0;
      if (currentQty > 1) {
        newMap.set(item, currentQty - 1);
      } else {
        newMap.delete(item);
      }
      return newMap;
    });
  }

  getQty(item: MenuItem): number {
    return this.cart().get(item) || 0;
  }

  toggleCartModal() {
    this.showCartModal.update(v => !v);
  }

  // Slider Logic
  nextSlide() {
    this.sliderIndex.update(i => (i + 1) % this.favoriteItems().length);
  }
  prevSlide() {
    this.sliderIndex.update(i => (i - 1 + this.favoriteItems().length) % this.favoriteItems().length);
  }

  // Checkout Logic
  checkout() {
    const branch = this.currentBranch();
    const items = this.cartItemsList();
    if (items.length === 0) return;

    // Build Message
    let message = `*Halo Admin ${branch.name},*\nSaya mau pesan menu berikut:\n\n`;
    
    items.forEach(item => {
      const sub = this.parsePrice(item.menu.price) * item.qty;
      message += `- ${item.qty}x ${item.menu.name} (@ ${item.menu.price})\n`;
    });

    message += `\nSubtotal: ${this.formatRupiah(this.subtotalPrice())}`;
    message += `\nPajak (10%): ${this.formatRupiah(this.taxPrice())}`;
    message += `\n*TOTAL: ${this.formatRupiah(this.totalPrice())}*\n\n`;
    message += `Mohon info ketersediaan dan cara pembayaran. Terima kasih.`;

    const encodedMsg = encodeURIComponent(message);
    // Use configured WA number or fallback
    const phone = branch.whatsappNumber || '628123456789';
    
    window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
  }

  // Helper
  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }
}
