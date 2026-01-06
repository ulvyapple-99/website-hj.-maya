import { Component, signal, inject, computed, effect, input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem } from '../services/config.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="menu" class="py-20 min-h-screen relative transition-colors duration-500"
      [style.backgroundColor]="config().menuPage.style.backgroundColor"
      [style.color]="config().menuPage.style.textColor"
      [style.fontFamily]="config().menuPage.style.fontFamily"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        <!-- Section Title -->
        <div class="text-center mb-8">
          <h2 class="font-bold mb-4" 
              [style.fontFamily]="config().menuPage.titleStyle.fontFamily"
              [style.fontSize]="config().menuPage.titleStyle.fontSize"
              [style.color]="config().menuPage.titleStyle.color"
          >
            {{ onlyFavorites() ? 'Menu Favorit' : config().menuPage.title }}
          </h2>
          <div class="h-1 w-24 mx-auto rounded mb-6" [style.backgroundColor]="config().menuPage.style.accentColor"></div>
          <p class="max-w-2xl mx-auto opacity-70 font-light" 
             [style.fontFamily]="config().menuPage.subtitleStyle.fontFamily"
             [style.fontSize]="config().menuPage.subtitleStyle.fontSize"
             [style.color]="config().menuPage.subtitleStyle.color">
             {{ config().menuPage.subtitle }}
          </p>
        </div>

        <!-- Branch Tabs -->
        <div class="flex flex-wrap justify-center gap-3 mb-8">
          @for (branch of config().branches; track $index) {
             <button 
               (click)="setBranch($index)"
               class="px-6 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider border hover:shadow-md"
               [style.backgroundColor]="selectedBranchIndex() === $index ? config().menuPage.style.accentColor : 'transparent'"
               [style.borderColor]="config().menuPage.style.accentColor"
               [style.color]="selectedBranchIndex() === $index ? '#fff' : config().menuPage.style.textColor"
             >
               {{ branch.name }}
             </button>
          }
        </div>

        <!-- Blind Spot 1 & 2: Search & Category Filter -->
        @if (!onlyFavorites()) {
          <div class="max-w-4xl mx-auto mb-10 space-y-4">
            <!-- Search Bar -->
            <div class="relative group">
               <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-orange">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
               <input 
                 type="text" 
                 [(ngModel)]="searchQuery"
                 placeholder="Cari menu kesukaanmu (e.g. Sate, Sop)..." 
                 class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all"
               >
               @if (searchQuery()) {
                 <button (click)="searchQuery.set('')" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">✕</button>
               }
            </div>

            <!-- Horizontal Scrollable Categories -->
            <div class="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
               <button 
                 (click)="selectedCategory.set('All')"
                 class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border"
                 [class.bg-gray-800]="selectedCategory() === 'All'"
                 [class.text-white]="selectedCategory() === 'All'"
                 [class.bg-white]="selectedCategory() !== 'All'"
                 [class.text-gray-600]="selectedCategory() !== 'All'"
               >
                 Semua
               </button>
               @for (cat of categories(); track cat) {
                 <button 
                   (click)="selectedCategory.set(cat)"
                   class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border"
                   [style.backgroundColor]="selectedCategory() === cat ? config().menuPage.style.accentColor : '#fff'"
                   [style.color]="selectedCategory() === cat ? '#fff' : '#4B5563'"
                   [style.borderColor]="selectedCategory() === cat ? config().menuPage.style.accentColor : '#E5E7EB'"
                 >
                   {{ cat }}
                 </button>
               }
            </div>
          </div>
        }

        <!-- Menu List Grid (Instagram Style) -->
        @if (filteredMenu().length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-3" [style.gap]="config().menuPage.gridGap">
            @for (item of filteredMenu(); track $index) {
              <div class="group relative overflow-hidden bg-white flex flex-col shadow-sm hover:shadow-xl transition-all duration-300"
                   [style.borderRadius]="config().menuPage.cardBorderRadius">
                
                <!-- Image Container with Configurable Height -->
                <div class="relative overflow-hidden bg-gray-100"
                     [style.height]="config().menuPage.cardImageHeight"
                     [class.aspect-square]="!config().menuPage.cardImageHeight || config().menuPage.cardImageHeight === '100%'">
                     
                   <!-- Blind Spot 3: Broken Image Handler -->
                   @if (isVideo(item.image)) {
                      <video [src]="item.image" class="w-full h-full object-cover" muted loop loading="lazy"></video>
                   } @else {
                      <img [src]="item.image" 
                           [alt]="item.name" 
                           (error)="handleImageError($event)"
                           class="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                           [class.grayscale]="item.soldOut" 
                           loading="lazy">
                   }
                   
                   @if(item.soldOut) {
                     <div class="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-[2px]">
                        <span class="text-white font-bold border-2 border-white px-4 py-2 uppercase tracking-widest text-xs md:text-sm">Sold Out</span>
                     </div>
                   }

                   <!-- Gradient Overlay on Hover -->
                   <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center">
                      <p class="font-bold translate-y-4 group-hover:translate-y-0 transition duration-300 line-clamp-2" [style.fontSize]="config().menuPage.itemTitleSize">{{ item.name }}</p>
                      <p class="mt-2 opacity-90 translate-y-4 group-hover:translate-y-0 transition duration-300 delay-75 font-mono" [style.fontSize]="config().menuPage.itemPriceSize">{{ item.price }}</p>
                      
                      @if (config().features.enableOrdering && !item.soldOut) {
                        @if (getQty(item) === 0) {
                           <button (click)="addToCart(item)" class="mt-4 bg-white text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition translate-y-4 group-hover:translate-y-0 delay-100 shadow-lg transform active:scale-95">
                             + Pesan
                           </button>
                           @if(isSate(item)) {
                             <span class="text-[10px] mt-1 text-yellow-300 font-bold translate-y-4 group-hover:translate-y-0 delay-100">Min. 10 Tusuk</span>
                           }
                        } @else {
                          <div class="mt-4 flex items-center gap-3 bg-white text-black rounded-full px-2 py-1 translate-y-4 group-hover:translate-y-0 delay-100 shadow-lg">
                             <button (click)="removeFromCart(item)" class="px-2 font-bold hover:text-red-500">-</button>
                             <span class="font-bold min-w-[20px]">{{ getQty(item) }}</span>
                             <button (click)="addToCart(item)" class="px-2 font-bold hover:text-green-500">+</button>
                          </div>
                        }
                      }
                   </div>

                   <!-- Favorite Badge -->
                   @if (item.favorite) {
                      <div class="absolute top-2 right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm z-10 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                   }
                </div>

                <!-- Info -->
                <div class="p-3 md:p-4 bg-white flex flex-col flex-1 border-t md:border-none">
                  <div class="flex justify-between items-start mb-1">
                     <h4 class="font-bold leading-tight text-gray-800 line-clamp-1" [style.fontSize]="config().menuPage.itemTitleSize">{{ item.name }}</h4>
                     <span class="font-bold text-gray-500 whitespace-nowrap" [style.fontSize]="config().menuPage.itemPriceSize">{{ item.price }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    @if (item.spicyLevel && item.spicyLevel > 0) {
                       <div class="flex" title="Pedas Level {{item.spicyLevel}}">
                         @for (s of [].constructor(item.spicyLevel); track $index) {
                           <span class="text-red-500 text-xs">🌶️</span>
                         }
                       </div>
                    }
                    <span class="text-[10px] uppercase font-bold text-gray-400 border border-gray-200 px-1.5 rounded">{{ item.category }}</span>
                    @if(isSate(item)) {
                       <span class="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 rounded">Min. 10</span>
                    }
                  </div>

                  <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed">{{ item.desc }}</p>
                </div>

              </div>
            }
          </div>
        } @else {
          <!-- Blind Spot 5: Empty Search State -->
          <div class="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center animate-fade-in">
            <div class="text-4xl mb-4">🍽️</div>
            <h3 class="font-bold text-lg text-gray-600">Menu tidak ditemukan</h3>
            <p class="opacity-60">Coba kata kunci lain atau ganti kategori.</p>
            @if(searchQuery() || selectedCategory() !== 'All') {
              <button (click)="resetFilters()" class="mt-4 text-brand-orange font-bold text-sm hover:underline">Reset Filter</button>
            }
          </div>
        }
      </div>

      <!-- Floating Cart Button -->
      @if (config().features.enableOrdering && cartTotalItems() > 0) {
        <div class="fixed bottom-6 right-6 z-40 animate-bounce-in">
          <button (click)="toggleCartModal()" class="text-white p-4 rounded-full shadow-2xl transition flex items-center gap-3 pr-6 border-4 border-white hover:scale-105 active:scale-95 relative overflow-hidden group"
            [style.backgroundColor]="config().menuPage.style.accentColor">
            <!-- Ripple Effect -->
            <div class="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition duration-300"></div>
            
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- Blind Spot 10: Counter Animation -->
              <span class="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-ping-once">
                {{ cartTotalItems() }}
              </span>
            </div>
            <div class="flex flex-col items-start relative z-10">
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
            <div class="p-5 text-white flex justify-between items-center shadow-md z-10" [style.backgroundColor]="config().menuPage.style.accentColor">
              <div>
                <h3 class="font-bold text-xl">Keranjang Pesanan</h3>
                <p class="text-xs opacity-90">{{ currentBranch().name }} • {{ cartTotalItems() }} Item</p>
              </div>
              
              <div class="flex items-center gap-2">
                 <!-- Blind Spot 4: Clear All -->
                 @if (cartItemsList().length > 0) {
                    <button (click)="clearCart()" class="text-xs bg-white/20 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1" title="Hapus Semua">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 }
                 <button (click)="toggleCartModal()" class="bg-white/20 hover:bg-white/30 rounded-full p-2 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>
            </div>

            <!-- Items -->
            <div class="p-5 overflow-y-auto flex-1 bg-gray-50">
              @if (cartItemsList().length > 0) {
                <ul class="space-y-4">
                  @for (item of cartItemsList(); track item.menu.name) {
                    <li class="flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 items-center">
                       <div class="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                           <img [src]="item.menu.image" (error)="handleImageError($event)" class="w-full h-full object-cover">
                           <!-- Blind Spot 6: Direct Delete Icon -->
                           <button (click)="removeEntireItem(item.menu)" class="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-lg hover:bg-red-700 transition" title="Hapus Item">×</button>
                       </div>
                       <div class="flex-1 flex flex-col justify-center">
                         <h4 class="font-bold text-gray-800 text-sm leading-tight mb-1">{{ item.menu.name }}</h4>
                         <span class="text-xs text-gray-500">{{ item.menu.price }}</span>
                       </div>
                       
                       <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button (click)="removeFromCart(item.menu)" class="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold hover:text-red-500 active:scale-95 transition">-</button>
                          <span class="text-sm font-bold w-6 text-center">{{ item.qty }}</span>
                          <button (click)="addToCart(item.menu)" class="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold hover:text-green-500 active:scale-95 transition">+</button>
                       </div>
                    </li>
                  }
                </ul>
              } @else {
                 <div class="h-full flex flex-col items-center justify-center opacity-40">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <p>Keranjang kosong</p>
                 </div>
              }
            </div>

            <!-- Footer -->
            <div class="bg-white p-6 border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
               <div class="flex justify-between items-center mb-2">
                   <span class="text-gray-500 font-medium">Subtotal</span>
                   <span class="font-bold text-lg text-gray-900">{{ formatRupiah(subTotal()) }}</span>
               </div>
               <div class="flex justify-between items-center mb-4">
                   <span class="text-gray-500 font-medium">Pajak (10%)</span>
                   <span class="font-bold text-lg text-gray-900">{{ formatRupiah(taxAmount()) }}</span>
               </div>
               <div class="flex justify-between items-center mb-6 border-t pt-4">
                   <span class="text-gray-500 font-medium">Total</span>
                   <span class="font-bold text-2xl text-gray-900">{{ formatRupiah(totalPrice()) }}</span>
               </div>
               <button (click)="checkout()" [disabled]="cartItemsList().length === 0"
                 class="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transform active:scale-95 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes ping-once {
       0% { transform: scale(1); opacity: 1; }
       50% { transform: scale(1.5); opacity: 0.5; }
       100% { transform: scale(1); opacity: 1; }
    }
    .animate-ping-once { animation: ping-once 0.3s cubic-bezier(0, 0, 0.2, 1); }
  `]
})
export class MenuComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;
  
  onlyFavorites = input(false);

  selectedBranchIndex = signal(0);
  cart = signal<Map<string, number>>(new Map());
  showCartModal = signal(false);
  
  searchQuery = signal('');
  selectedCategory = signal('All');

  constructor() {
    try {
      const saved = localStorage.getItem('cart_data');
      if (saved) {
        this.cart.set(new Map(JSON.parse(saved)));
      }
    } catch(e) { console.error('Failed to load cart', e); }

    effect(() => {
      try {
        const serialized = JSON.stringify(Array.from(this.cart().entries()));
        localStorage.setItem('cart_data', serialized);
      } catch (e) { console.error('Failed to save cart', e); }
    });
  }

  currentBranch = computed(() => this.config().branches[this.selectedBranchIndex()]);
  
  currentBranchMenu = computed(() => {
    const branch = this.currentBranch();
    if (!branch) return [];
    return this.configService.menuItems().filter(item => item.branchId === branch.id);
  });
  
  categories = computed(() => {
    const menus = this.currentBranchMenu();
    const cats = new Set(menus.map(m => m.category || 'Lainnya'));
    return Array.from(cats);
  });

  filteredMenu = computed(() => {
    let menu = this.currentBranchMenu();
    
    if (this.onlyFavorites()) {
      return menu.filter(item => item.favorite);
    }
    
    const query = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();

    return menu.filter(item => {
       const matchSearch = item.name.toLowerCase().includes(query) || (item.desc && item.desc.toLowerCase().includes(query));
       const matchCat = cat === 'All' || item.category === cat;
       return matchSearch && matchCat;
    });
  });

  private getItemKey(item: MenuItem): string {
    return `${this.currentBranch().id}_${item.name}`;
  }

  isSate(item: MenuItem): boolean {
    const textToCheck = (item.name + ' ' + item.category).toLowerCase();
    return textToCheck.includes('sate');
  }

  cartItemsList = computed(() => {
    const list: {menu: MenuItem, qty: number}[] = [];
    const fullMenu = this.currentBranchMenu();
    const branchPrefix = this.currentBranch().id + '_';
    
    this.cart().forEach((qty, key) => { 
        if (qty > 0 && key.startsWith(branchPrefix)) {
            const originalName = key.replace(branchPrefix, '');
            const item = fullMenu.find(m => m.name === originalName);
            if (item) {
                list.push({menu: item, qty});
            }
        } 
    });
    return list;
  });

  cartTotalItems = computed(() => {
    let count = 0;
    const branchPrefix = this.currentBranch().id + '_';
    this.cart().forEach((qty, key) => {
        if(key.startsWith(branchPrefix)) count += qty;
    });
    return count;
  });

  parsePrice(priceStr: string): number {
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  subTotal = computed(() => {
    let total = 0;
    const fullMenu = this.currentBranchMenu();
    const branchPrefix = this.currentBranch().id + '_';

    this.cart().forEach((qty, key) => { 
        if (key.startsWith(branchPrefix)) {
          const originalName = key.replace(branchPrefix, '');
          const item = fullMenu.find(m => m.name === originalName);
          if (item) {
              total += this.parsePrice(item.price) * qty;
          }
        }
    });
    return total;
  });

  taxAmount = computed(() => this.subTotal() * 0.1);

  totalPrice = computed(() => this.subTotal() * 1.1);

  setBranch(index: number) {
    if (this.selectedBranchIndex() !== index) {
      this.selectedBranchIndex.set(index);
      this.searchQuery.set('');
      this.selectedCategory.set('All');
      if (typeof window !== 'undefined') {
        const el = document.getElementById('menu');
        if(el) el.scrollIntoView({behavior: 'smooth'});
      }
    }
  }

  addToCart(item: MenuItem) {
    const key = this.getItemKey(item);
    const isSateItem = this.isSate(item);

    this.cart.update(currentMap => {
      const newMap = new Map<string, number>(currentMap);
      const currentQty = newMap.get(key) || 0;
      
      let nextQty = currentQty + 1;
      
      if (currentQty === 0 && isSateItem) {
         nextQty = 10;
         this.toastService.show(`Min. pembelian ${item.name} adalah 10 tusuk`, 'info');
      } else {
         this.toastService.show(`Ditambahkan: ${item.name}`, 'success');
      }

      newMap.set(key, nextQty);
      return newMap;
    });
    
    this.configService.logEvent('add_to_cart', { item: item.name, price: item.price });
  }

  removeFromCart(item: MenuItem) {
    const key = this.getItemKey(item);
    const isSateItem = this.isSate(item);

    this.cart.update(currentMap => {
      const newMap = new Map<string, number>(currentMap);
      const currentQty = newMap.get(key) || 0;
      
      if (currentQty > 0) {
        let nextQty = currentQty - 1;

        if (isSateItem && currentQty <= 10) {
           nextQty = 0;
           this.toastService.show(`${item.name} dihapus (min. 10 tusuk)`, 'info');
        }

        if (nextQty > 0) {
           newMap.set(key, nextQty);
        } else {
           newMap.delete(key);
        }
      }
      return newMap;
    });
  }

  removeEntireItem(item: MenuItem) {
    const key = this.getItemKey(item);
    this.cart.update(currentMap => {
       const newMap = new Map<string, number>(currentMap);
       newMap.delete(key);
       return newMap;
    });
  }

  clearCart() {
    if(!confirm('Hapus semua item di keranjang?')) return;
    this.cart.update(currentMap => {
       const newMap = new Map<string, number>(currentMap);
       const branchPrefix = this.currentBranch().id + '_';
       for (const key of newMap.keys()) {
          if (key.startsWith(branchPrefix)) newMap.delete(key);
       }
       return newMap;
    });
  }

  getQty(item: MenuItem): number {
    const key = this.getItemKey(item);
    return this.cart().get(key) || 0;
  }

  toggleCartModal() {
    this.showCartModal.update(v => !v);
  }
  
  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('All');
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/400x400/eee/999?text=No+Image';
  }

  checkout() {
    const branch = this.currentBranch();
    let message = `*Halo Sate Maranggi Hj. Maya (${branch.name}),*\nSaya mau pesan:\n\n`;
    this.cartItemsList().forEach(i => {
       message += `• ${i.qty}x ${i.menu.name} @ ${i.menu.price}\n`;
    });
    message += `\n--------------------------------\n`;
    message += `Subtotal: ${this.formatRupiah(this.subTotal())}\n`;
    message += `Pajak (10%): ${this.formatRupiah(this.taxAmount())}\n`;
    message += `*Total Estimasi: ${this.formatRupiah(this.totalPrice())}*`;
    message += `\n--------------------------------\n`;
    message += `\nMohon info ketersediaan & ongkir. Hatur nuhun.`;
    
    this.configService.logEvent('checkout', { total: this.totalPrice() });

    const phone = this.configService.formatPhoneNumber(branch.whatsappNumber);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  isVideo(url: string) { return this.configService.isVideo(url); }
}