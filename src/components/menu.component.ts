
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService, MenuItem } from '../services/config.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="menu" class="py-16 overflow-hidden min-h-screen relative transition-colors duration-500"
      [style.backgroundColor]="config().menuPage.style.backgroundColor"
      [style.color]="config().menuPage.style.textColor"
      [style.fontFamily]="config().menuPage.style.fontFamily"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        <!-- Section Title -->
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-bold mb-2" [style.color]="config().menuPage.style.accentColor">{{ config().menuPage.title }}</h2>
          <div class="h-1 w-24 mx-auto rounded" [style.backgroundColor]="config().menuPage.style.accentColor"></div>
          <p class="mt-4 opacity-80">{{ config().menuPage.subtitle }}</p>
        </div>

        <!-- Branch Tabs -->
        <div class="flex flex-wrap justify-center gap-2 mb-10">
          @for (branch of config().branches; track $index) {
             <button 
               (click)="setBranch($index)"
               class="px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 border-2"
               [style.backgroundColor]="selectedBranchIndex() === $index ? config().menuPage.style.accentColor : 'transparent'"
               [style.borderColor]="selectedBranchIndex() === $index ? config().menuPage.style.accentColor : config().menuPage.style.textColor"
               [style.color]="selectedBranchIndex() === $index ? '#fff' : config().menuPage.style.textColor"
             >
               {{ branch.name }}
             </button>
          }
        </div>

        <!-- Menu List Grid -->
        @if (currentBranchMenu().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of currentBranchMenu(); track $index) {
              <div class="rounded-xl shadow-md overflow-hidden border transition group flex flex-col h-full bg-white/80 backdrop-blur-sm"
                   [style.borderColor]="config().menuPage.style.textColor + '20'">
                <!-- Image -->
                <div class="h-48 overflow-hidden relative bg-gray-100">
                   @if (isVideo(item.image)) {
                      <video [src]="item.image" class="w-full h-full object-cover" muted loop></video>
                   } @else {
                      <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                   }
                </div>

                <!-- Content -->
                <div class="p-5 flex flex-col flex-1">
                  <div class="flex justify-between items-start mb-2">
                     <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-white"
                       [style.backgroundColor]="config().menuPage.style.accentColor">
                       {{ item.category }}
                     </span>
                     <span class="font-bold" [style.color]="config().menuPage.style.textColor">{{ item.price }}</span>
                  </div>
                  <h4 class="font-bold text-lg mb-2 leading-tight" [style.color]="config().menuPage.style.textColor">{{ item.name }}</h4>
                  <p class="text-sm mb-4 flex-1 line-clamp-3 opacity-70">{{ item.desc }}</p>
                  
                  <!-- Add to Cart Controls -->
                  <div class="mt-auto pt-4 border-t" [style.borderColor]="config().menuPage.style.textColor + '10'">
                    @if (getQty(item) === 0) {
                      <button (click)="addToCart(item)" 
                        class="w-full py-2 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 hover:opacity-90"
                        [style.backgroundColor]="config().menuPage.style.accentColor"
                      >
                        <span>+ Tambah Pesanan</span>
                      </button>
                    } @else {
                      <div class="flex items-center justify-between rounded-lg p-1 bg-gray-100">
                        <button (click)="removeFromCart(item)" class="w-8 h-8 flex items-center justify-center rounded font-bold transition text-black">-</button>
                        <span class="font-bold text-black">{{ getQty(item) }}</span>
                        <button (click)="addToCart(item)" class="w-8 h-8 flex items-center justify-center rounded font-bold transition text-black">+</button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20 bg-black/5 rounded-xl border border-dashed border-gray-300">
            <p class="opacity-60">Belum ada menu di cabang ini.</p>
          </div>
        }
      </div>

      <!-- Floating Cart Button -->
      @if (cartTotalItems() > 0) {
        <div class="fixed bottom-6 right-6 z-40 animate-bounce-in">
          <button (click)="toggleCartModal()" class="text-white p-4 rounded-full shadow-2xl transition flex items-center gap-3 pr-6 border-2 border-white"
            [style.backgroundColor]="config().menuPage.style.accentColor">
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
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 text-gray-800 font-sans">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="toggleCartModal()"></div>
          
          <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-scale-up flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="p-4 text-white flex justify-between items-center" [style.backgroundColor]="config().menuPage.style.accentColor">
              <div>
                <h3 class="font-bold text-lg">Detail Pesanan</h3>
                <p class="text-xs opacity-80">{{ currentBranch().name }}</p>
              </div>
              <button (click)="toggleCartModal()" class="text-white/70 hover:text-white">X</button>
            </div>

            <!-- Items -->
            <div class="p-4 overflow-y-auto flex-1">
              @if (cartItemsList().length > 0) {
                <ul class="space-y-4">
                  @for (item of cartItemsList(); track item.menu.name) {
                    <li class="flex gap-3">
                       <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                           <img [src]="item.menu.image" class="w-full h-full object-cover">
                       </div>
                       <div class="flex-1">
                         <h4 class="font-bold text-gray-800 text-sm">{{ item.menu.name }}</h4>
                         <p class="text-xs text-gray-500 mb-1">{{ item.menu.price }}</p>
                         <div class="flex items-center gap-3">
                           <button (click)="removeFromCart(item.menu)" class="w-6 h-6 bg-gray-200 rounded text-gray-600 font-bold">-</button>
                           <span class="text-sm font-bold">{{ item.qty }}</span>
                           <button (click)="addToCart(item.menu)" class="w-6 h-6 bg-gray-200 rounded text-gray-600 font-bold">+</button>
                         </div>
                       </div>
                       <div class="font-bold text-sm" [style.color]="config().menuPage.style.accentColor">
                           {{ formatRupiah(parsePrice(item.menu.price) * item.qty) }}
                       </div>
                    </li>
                  }
                </ul>
              }
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 p-4 border-t">
               <div class="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mb-4">
                   <span>Total</span>
                   <span>{{ formatRupiah(totalPrice()) }}</span>
               </div>
               <button (click)="checkout()" class="w-full text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                  [style.backgroundColor]="'#25D366'">
                 <span>Pesan via WhatsApp</span>
               </button>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .animate-bounce-in { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes bounceIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
    .animate-scale-up { animation: scaleUp 0.3s ease-out; }
    @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class MenuComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  selectedBranchIndex = signal(0);
  cart = signal<Map<MenuItem, number>>(new Map());
  showCartModal = signal(false);

  currentBranch = computed(() => this.config().branches[this.selectedBranchIndex()]);
  currentBranchMenu = computed(() => this.currentBranch().menu);
  
  cartItemsList = computed(() => {
    const list: {menu: MenuItem, qty: number}[] = [];
    this.cart().forEach((qty, menu) => { if (qty > 0) list.push({menu, qty}); });
    return list;
  });

  cartTotalItems = computed(() => {
    let count = 0;
    for (const qty of this.cart().values()) count += qty;
    return count;
  });

  parsePrice(priceStr: string): number {
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  totalPrice = computed(() => {
    let total = 0;
    this.cart().forEach((qty, item) => { total += this.parsePrice(item.price) * qty; });
    return Math.floor(total * 1.1); // +Tax
  });

  setBranch(index: number) {
    if (this.selectedBranchIndex() !== index) {
      this.selectedBranchIndex.set(index);
      this.cart.set(new Map());
    }
  }

  addToCart(item: MenuItem) {
    this.cart.update(currentMap => {
      const newMap = new Map<MenuItem, number>(currentMap);
      newMap.set(item, (newMap.get(item) || 0) + 1);
      return newMap;
    });
  }

  removeFromCart(item: MenuItem) {
    this.cart.update(currentMap => {
      const newMap = new Map<MenuItem, number>(currentMap);
      const currentQty = newMap.get(item) || 0;
      if (currentQty > 1) newMap.set(item, currentQty - 1);
      else newMap.delete(item);
      return newMap;
    });
  }

  getQty(item: MenuItem): number {
    return this.cart().get(item) || 0;
  }

  toggleCartModal() {
    this.showCartModal.update(v => !v);
  }

  checkout() {
    const branch = this.currentBranch();
    let message = `*Halo Admin ${branch.name},*\nSaya mau pesan:\n`;
    this.cartItemsList().forEach(i => message += `- ${i.qty}x ${i.menu.name}\n`);
    message += `\n*Total: ${this.formatRupiah(this.totalPrice())}*`;
    const phone = branch.whatsappNumber || '628123456789';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  isVideo(url: string) { return this.configService.isVideo(url); }
}
