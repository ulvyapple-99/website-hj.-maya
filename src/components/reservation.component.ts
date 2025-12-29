
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem } from '../services/config.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="py-16 bg-brand-cream min-h-screen relative">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <h2 class="text-3xl md:text-4xl font-serif font-bold text-brand-brown mb-2">Reservasi Tempat</h2>
          <div class="h-1 w-24 bg-brand-orange mx-auto rounded"></div>
          <p class="mt-4 text-gray-600 max-w-2xl mx-auto">
            Booking tempat untuk acara buka bersama atau gathering. <br>
            Silakan isi data diri dan pilih menu yang ingin disiapkan.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          
          <!-- LEFT COLUMN: Reservation Form -->
          <div class="lg:col-span-1 h-fit sticky top-24">
            <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 class="text-xl font-bold text-brand-brown mb-4 border-b pb-2">Data Reservasi</h3>
              
              <div class="space-y-4">
                <!-- Branch Selection -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Pilih Cabang</label>
                  <select 
                    [ngModel]="selectedBranchIndex()" 
                    (ngModelChange)="setBranch($event)"
                    class="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-brand-orange outline-none"
                  >
                    @for (branch of config().branches; track $index) {
                      <option [value]="$index">{{ branch.name }}</option>
                    }
                  </select>
                </div>

                <!-- Personal Data -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Nama Pemesan</label>
                  <input type="text" [(ngModel)]="formName" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none" placeholder="Contoh: Bpk. Budi">
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Tanggal</label>
                    <input type="date" [(ngModel)]="formDate" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Jam</label>
                    <input type="time" [(ngModel)]="formTime" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none">
                  </div>
                </div>

                <!-- Type Selection (Ramadan/Regular) -->
                <div class="bg-brand-cream/50 p-3 rounded-lg border border-brand-orange/20">
                   <label class="block text-xs font-bold text-brand-brown mb-2 uppercase">Jenis Acara</label>
                   <div class="flex items-center gap-4">
                     <label class="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="evtType" [value]="false" [(ngModel)]="isRamadan" class="text-brand-orange focus:ring-brand-orange">
                       <span class="text-sm font-medium">Reguler</span>
                     </label>
                     <label class="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="evtType" [value]="true" [(ngModel)]="isRamadan" class="text-brand-orange focus:ring-brand-orange">
                       <span class="text-sm font-medium">Buka Puasa (Ramadan)</span>
                     </label>
                   </div>
                </div>

                <!-- Pax Input with Validation -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Jumlah Orang</label>
                  <input type="number" [(ngModel)]="formPax" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none" placeholder="Minimal {{ minPax() }} orang">
                  
                  @if (formPax() > 0 && formPax() < minPax()) {
                    <p class="text-red-500 text-xs mt-1 font-bold">
                      *Minimal {{ minPax() }} orang untuk {{ isRamadan() ? 'Buka Puasa' : 'Hari Biasa' }}.
                    </p>
                  }
                </div>
                
                <div>
                   <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Catatan Tambahan</label>
                   <textarea [(ngModel)]="formNotes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none" placeholder="Request khusus..."></textarea>
                </div>

                <!-- Sticky Mobile Summary (Only shows logic here, but visually hidden on large screens if needed, keeping it simple for now) -->
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                   <div class="flex justify-between text-sm mb-2">
                     <span>Estimasi Menu:</span>
                     <span class="font-bold">{{ formatRupiah(totalPrice()) }}</span>
                   </div>
                   <button 
                     (click)="submitReservation()" 
                     [disabled]="!isValid()"
                     class="w-full bg-brand-orange hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow transition flex justify-center items-center gap-2"
                   >
                     <span>Kirim Reservasi via WA</span>
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                   </button>
                   @if (!isValid()) {
                     <p class="text-[10px] text-center text-red-500 mt-2">
                       Lengkapi data & penuhi minimal jumlah orang.
                     </p>
                   }
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Menu Selection -->
          <div class="lg:col-span-2">
             <div class="flex items-center justify-between mb-4">
               <h3 class="text-xl font-bold text-brand-brown">Pilih Menu (Pre-order)</h3>
               <span class="text-xs bg-white px-2 py-1 rounded border shadow-sm text-gray-500">
                 Dipilih: {{ cartTotalItems() }} item
               </span>
             </div>

             @if (currentBranchMenu().length > 0) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (item of currentBranchMenu(); track $index) {
                  <div class="bg-white rounded-xl shadow border border-gray-100 flex overflow-hidden group">
                    <!-- Image Small -->
                    <div class="w-24 h-full bg-gray-100 relative">
                       @if (isVideo(item.image)) {
                          <video [src]="item.image" class="w-full h-full object-cover" muted loop></video>
                       } @else {
                          <img [src]="item.image" class="w-full h-full object-cover">
                       }
                    </div>
                    
                    <!-- Content -->
                    <div class="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 class="font-bold text-gray-800 text-sm line-clamp-1">{{ item.name }}</h4>
                        <p class="text-brand-orange text-xs font-bold">{{ item.price }}</p>
                      </div>
                      
                      <!-- Controls -->
                      <div class="flex justify-end mt-2">
                        @if (getQty(item) === 0) {
                          <button (click)="addToCart(item)" class="px-3 py-1 bg-brand-brown text-white text-xs rounded shadow hover:bg-brand-orange transition">
                            + Tambah
                          </button>
                        } @else {
                          <div class="flex items-center bg-gray-100 rounded text-xs">
                            <button (click)="removeFromCart(item)" class="px-2 py-1 hover:bg-gray-200 font-bold">-</button>
                            <span class="px-2 font-bold">{{ getQty(item) }}</span>
                            <button (click)="addToCart(item)" class="px-2 py-1 hover:bg-gray-200 font-bold">+</button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-10 bg-white rounded-xl border border-dashed">
                Menu belum tersedia di cabang ini.
              </div>
            }
          </div>

        </div>
      </div>
    </section>
  `
})
export class ReservationComponent {
  configService = inject(ConfigService);
  config = this.configService.config;

  // --- State ---
  selectedBranchIndex = signal(0);
  
  // Form Data
  formName = signal('');
  formDate = signal('');
  formTime = signal('');
  formPax = signal(0);
  formNotes = signal('');
  isRamadan = signal(false);

  // Cart Data
  cart = signal<Map<MenuItem, number>>(new Map());

  // --- Computed ---
  currentBranch = computed(() => this.config().branches[this.selectedBranchIndex()]);
  currentBranchMenu = computed(() => this.currentBranch().menu);

  // Logic: Min Pax based on Ramadan mode
  minPax = computed(() => this.isRamadan() ? 10 : 25);

  // Validation
  isValid = computed(() => {
    return (
      this.formName().trim() !== '' &&
      this.formDate() !== '' &&
      this.formTime() !== '' &&
      this.formPax() >= this.minPax()
    );
  });

  // Price Calcs
  parsePrice(priceStr: string): number {
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  cartTotalItems = computed(() => {
    let count = 0;
    for (const qty of this.cart().values()) count += qty;
    return count;
  });

  totalPrice = computed(() => {
    let total = 0;
    this.cart().forEach((qty, item) => {
      total += this.parsePrice(item.price) * qty;
    });
    return total;
  });

  // --- Actions ---

  setBranch(index: any) { // ngModelChange emits value, captured as any/number
    const idx = Number(index);
    if (this.selectedBranchIndex() !== idx) {
      this.selectedBranchIndex.set(idx);
      this.cart.set(new Map()); // Reset cart on branch change
    }
  }

  addToCart(item: MenuItem) {
    this.cart.update(currentMap => {
      const newMap = new Map<MenuItem, number>(currentMap);
      const currentQty = newMap.get(item) || 0;
      newMap.set(item, currentQty + 1);
      return newMap;
    });
  }

  removeFromCart(item: MenuItem) {
    this.cart.update(currentMap => {
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

  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }

  submitReservation() {
    if (!this.isValid()) return;

    const branch = this.currentBranch();
    const type = this.isRamadan() ? "BUKA PUASA (Ramadan)" : "REGULER";
    
    let message = `*FORMULIR RESERVASI TEMPAT*\n`;
    message += `Cabang: ${branch.name}\n\n`;
    message += `*Data Pemesan:*\n`;
    message += `Nama: ${this.formName()}\n`;
    message += `Tanggal: ${this.formDate()}\n`;
    message += `Jam: ${this.formTime()}\n`;
    message += `Jumlah Orang: ${this.formPax()} pax\n`;
    message += `Jenis Acara: ${type}\n`;
    message += `Catatan: ${this.formNotes() || '-'}\n\n`;

    message += `*Pre-order Menu:*\n`;
    if (this.cartTotalItems() > 0) {
      this.cart().forEach((qty, item) => {
        message += `- ${qty}x ${item.name} (@ ${item.price})\n`;
      });
      message += `\nEstimasi Menu: ${this.formatRupiah(this.totalPrice())}\n`;
    } else {
      message += `(Belum ada menu dipilih)\n`;
    }

    message += `\nMohon konfirmasi ketersediaan tempat. Terima kasih.`;

    const encodedMsg = encodeURIComponent(message);
    const phone = branch.whatsappNumber || '628123456789';
    window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
  }
}
