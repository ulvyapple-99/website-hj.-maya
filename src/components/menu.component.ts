
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService, MenuItem } from '../services/config.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="menu" class="py-20 min-h-screen relative transition-colors duration-500"
      [style.backgroundColor]="config().menuPage.style.backgroundColor"
      [style.color]="config().menuPage.style.textColor"
      [style.fontFamily]="config().menuPage.style.fontFamily"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        <!-- Section Title -->
        <div class="text-center mb-12">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" [style.color]="config().menuPage.style.accentColor">{{ config().menuPage.title }}</h2>
          <div class="h-1 w-24 mx-auto rounded mb-6" [style.backgroundColor]="config().menuPage.style.accentColor"></div>
          <p class="max-w-2xl mx-auto opacity-70 text-lg font-light">{{ config().menuPage.subtitle }}</p>
        </div>

        <!-- Branch Tabs -->
        <div class="flex flex-wrap justify-center gap-3 mb-10">
          @for (branch of config().branches; track $index) {
             <button 
               (click)="setBranch($index)"
               class="px-6 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider"
               [style.backgroundColor]="selectedBranchIndex() === $index ? config().menuPage.style.accentColor : 'transparent'"
               [style.borderColor]="config().menuPage.style.accentColor"
               [class.border]="selectedBranchIndex() !== $index"
               [style.color]="selectedBranchIndex() === $index ? '#fff' : config().menuPage.style.textColor"
             >
               {{ branch.name }}
             </button>
          }
        </div>

        <!-- Menu List Grid (Instagram Style) -->
        @if (currentBranchMenu().length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-6">
            @for (item of currentBranchMenu(); track $index) {
              <div class="group relative overflow-hidden bg-gray-100 flex flex-col md:rounded-xl shadow-none md:shadow-md transition-all">
                
                <!-- Square Image (Like IG) -->
                <div class="aspect-square relative overflow-hidden">
                   @if (isVideo(item.image)) {
                      <video [src]="item.image" class="w-full h-full object-cover" muted loop></video>
                   } @else {
                      <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                   }
                   
                   <!-- Gradient Overlay on Hover -->
                   <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center">
                      <p class="font-bold text-lg translate-y-4 group-hover:translate-y-0 transition duration-300">{{ item.name }}</p>
                      <p class="text-sm mt-2 opacity-90 translate-y-4 group-hover:translate-y-0 transition duration-300 delay-75">{{ item.price }}</p>
                      @if (getQty(item) === 0) {
                         <button (click)="addToCart(item)" class="mt-4 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition translate-y-4 group-hover:translate-y-0 delay-100">
                           + Pesan
                         </button>
                      } @else {
                        <div class="mt-4 flex items-center gap-3 bg-white text-black rounded-full px-2 py-1 translate-y-4 group-hover:translate-y-0 delay-100">
                           <button (click)="removeFromCart(item)" class="px-2 font-bold">-</button>
                           <span class="font-bold">{{ getQty(item) }}</span>
                           <button (click)="addToCart(item)" class="px-2 font-bold">+</button>
                        </div>
                      }
                   </div>

                   <!-- Favorite Badge (Always Visible Small) -->
                   @if (item.favorite) {
                      <div class="absolute top-2 right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                   }
                </div>

                <!-- Info (Visible below on mobile, or customized) -->
                <div class="p-3 md:p-4 bg-white flex flex-col flex-1 border-t md:border-none">
                  <div class="flex justify-between items-start mb-1">
                     <h4 class="font-bold text-sm md:text-base leading-tight text-gray-800 line-clamp-1">{{ item.name }}</h4>
                     <span class="text-xs font-bold text-gray-500">{{ item.price }}</span>
                  </div>
                  <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed">{{ item.desc }}</p>
                </div>

              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p class="opacity-60 text-lg">Belum ada menu di cabang ini.</p>
          </div>
        }
      </div>

      <!-- Floating Cart Button -->
      @if (cartTotalItems() > 0) {
        <div class="fixed bottom-6 right-6 z-40 animate-bounce-in">
          <button (click)="toggleCartModal()" class="text-white p-4 rounded-full shadow-2xl transition flex items-center gap-3 pr-6 border-4 border-white hover:scale-105 active:scale-95"
            [style.backgroundColor]="config().menuPage.style.accentColor">
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {{ cartTotalItems() }}
              </span>
            </div>
            <div class="flex flex-col items-start">
              <span class="text-[10px] uppercase font-bold opacity-80 tracking-wider">Total</span>
              <span class="text-base font-extrabold">{{ formatRupiah(totalPrice()) }}</span>
            </div>
          </button>
        </div>
      }

      <!-- Cart Modal Overlay -->
      @if (showCartModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 text-gray-800 font-sans">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="toggleCartModal()"></div>
          
          <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up flex flex-col max-h-[85vh]">
            <!-- Header -->
            <div class="p-5 text-white flex justify-between items-center" [style.backgroundColor]="config().menuPage.style.accentColor">
              <div>
                <h3 class="font-bold text-xl">Keranjang Pesanan</h3>
                <p class="text-xs opacity-80">{{ currentBranch().name }}</p>
              </div>
              <button (click)="toggleCartModal()" class="bg-white/20 hover:bg-white/30 rounded-full p-2 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
            </div>

            <!-- Items -->
            <div class="p-5 overflow-y-auto flex-1 bg-gray-50">
              @if (cartItemsList().length > 0) {
                <ul class="space-y-4">
                  @for (item of cartItemsList(); track item.menu.name) {
                    <li class="flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                       <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                           <img [src]="item.menu.image" class="w-full h-full object-cover">
                       </div>
                       <div class="flex-1 flex flex-col justify-center">
                         <h4 class="font-bold text-gray-800 text-sm mb-1">{{ item.menu.name }}</h4>
                         <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">{{ item.menu.price }}</span>
                            <div class="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                               <button (click)="removeFromCart(item.menu)" class="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold hover:text-red-500">-</button>
                               <span class="text-sm font-bold w-4 text-center">{{ item.qty }}</span>
                               <button (click)="addToCart(item.menu)" class="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold hover:text-green-500">+</button>
                            </div>
                         </div>
                       </div>
                    </li>
                  }
                </ul>
              }
            </div>

            <!-- Footer -->
            <div class="bg-white p-6 border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
               <div class="flex justify-between items-center mb-6">
                   <span class="text-gray-500 font-medium">Subtotal</span>
                   <span class="font-bold text-2xl text-gray-900">{{ formatRupiah(totalPrice()) }}</span>
               </div>
               <button (click)="checkout()" class="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transform active:scale-95 transition hover:brightness-110"
                  [style.backgroundColor]="'#25D366'">
                 <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                 <span>Kirim Pesanan via WhatsApp</span>
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
    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class MenuComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  selectedBranchIndex = signal(0);
  cart = signal<Map<string, number>>(new Map());
  showCartModal = signal(false);

  currentBranch = computed(() => this.config().branches[this.selectedBranchIndex()]);
  currentBranchMenu = computed(() => this.currentBranch().menu);
  
  cartItemsList = computed(() => {
    const list: {menu: MenuItem, qty: number}[] = [];
    const currentMenu = this.currentBranchMenu();
    
    this.cart().forEach((qty, name) => { 
        if (qty > 0) {
            const item = currentMenu.find(m => m.name === name);
            if (item) {
                list.push({menu: item, qty});
            }
        } 
    });
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
    const currentMenu = this.currentBranchMenu();
    this.cart().forEach((qty, name) => { 
        const item = currentMenu.find(m => m.name === name);
        if (item) {
            total += this.parsePrice(item.price) * qty;
        }
    });
    return total;
  });

  setBranch(index: number) {
    if (this.selectedBranchIndex() !== index) {
      this.selectedBranchIndex.set(index);
      this.cart.set(new Map());
    }
  }

  addToCart(item: MenuItem) {
    this.cart.update(currentMap => {
      const newMap = new Map<string, number>(currentMap);
      newMap.set(item.name, (newMap.get(item.name) || 0) + 1);
      return newMap;
    });
  }

  removeFromCart(item: MenuItem) {
    this.cart.update(currentMap => {
      const newMap = new Map<string, number>(currentMap);
      const currentQty = newMap.get(item.name) || 0;
      if (currentQty > 1) newMap.set(item.name, currentQty - 1);
      else newMap.delete(item.name);
      return newMap;
    });
  }

  getQty(item: MenuItem): number {
    return this.cart().get(item.name) || 0;
  }

  toggleCartModal() {
    this.showCartModal.update(v => !v);
  }

  checkout() {
    const branch = this.currentBranch();
    let message = `*Halo Sate Maranggi Hj. Maya,*\nSaya mau pesan untuk diambil/diantar:\n\n`;
    this.cartItemsList().forEach(i => message += `• ${i.qty}x ${i.menu.name}\n`);
    message += `\n*Total Estimasi: ${this.formatRupiah(this.totalPrice())}*`;
    message += `\n\nMohon info ketersediaannya. Hatur nuhun.`;
    
    const phone = this.configService.formatPhoneNumber(branch.whatsappNumber);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  isVideo(url: string) { return this.configService.isVideo(url); }
}
