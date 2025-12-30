
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem } from '../services/config.service';

interface GuestOrder {
  id: number;
  name: string;
  cart: Map<MenuItem, number>;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="min-h-screen relative transition-colors duration-500"
      [style.backgroundColor]="config().reservation.style.backgroundColor"
      [style.color]="config().reservation.style.textColor"
      [style.fontFamily]="config().reservation.style.fontFamily"
      [style.paddingTop]="config().reservation.style.sectionPaddingY"
      [style.paddingBottom]="config().reservation.style.sectionPaddingY"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="font-bold mb-2" 
              [style.color]="config().reservation.titleStyle.color"
              [style.fontFamily]="config().reservation.titleStyle.fontFamily"
              [style.fontSize]="config().reservation.titleStyle.fontSize">{{ config().reservation.title }}</h2>
          <div class="h-1 w-24 mx-auto rounded" [style.backgroundColor]="config().reservation.style.accentColor"></div>
          <p class="mt-4 opacity-80 max-w-3xl mx-auto"
             [style.color]="config().reservation.subtitleStyle.color"
             [style.fontFamily]="config().reservation.subtitleStyle.fontFamily"
             [style.fontSize]="config().reservation.subtitleStyle.fontSize">
            {{ config().reservation.subtitle }}
          </p>
        </div>

        <div class="grid lg:grid-cols-12 gap-6">
          
          <!-- COLUMN 1: Reservation Info -->
          <div class="lg:col-span-3 space-y-6 text-gray-800">
            <div class="bg-white p-6 shadow-lg border border-gray-200 h-fit sticky top-24"
                 [style.borderRadius]="config().reservation.cardBorderRadius">
              <h3 class="text-lg font-bold border-b pb-2 mb-4" [style.color]="config().reservation.style.accentColor">Data Reservasi</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold mb-1 uppercase">Pilih Cabang</label>
                  <select [ngModel]="selectedBranchIndex()" (ngModelChange)="setBranch($event)" 
                          class="w-full border px-3 py-2 text-sm font-bold bg-white"
                          [style.height]="config().reservation.inputHeight"
                          [style.borderRadius]="config().reservation.inputBorderRadius">
                    @for (branch of config().branches; track $index) {
                      <option [value]="$index">{{ branch.name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold mb-1 uppercase">Nama Pemesan</label>
                  <input type="text" [(ngModel)]="formName" 
                         class="w-full border px-3 py-2 text-sm bg-white" placeholder="Bpk. Budi"
                         [style.height]="config().reservation.inputHeight"
                         [style.borderRadius]="config().reservation.inputBorderRadius">
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold mb-1 uppercase">Tanggal</label>
                    <input type="date" [(ngModel)]="formDate" 
                           class="w-full border px-3 py-2 text-sm bg-white"
                           [style.height]="config().reservation.inputHeight"
                           [style.borderRadius]="config().reservation.inputBorderRadius">
                  </div>
                  <div>
                    <label class="block text-xs font-bold mb-1 uppercase">Jam</label>
                    <input type="time" [(ngModel)]="formTime" 
                           class="w-full border px-3 py-2 text-sm bg-white"
                           [style.height]="config().reservation.inputHeight"
                           [style.borderRadius]="config().reservation.inputBorderRadius">
                  </div>
                </div>

                <div class="bg-gray-50 p-3 border" [style.borderRadius]="config().reservation.inputBorderRadius">
                   <label class="block text-xs font-bold mb-2 uppercase" [style.color]="config().reservation.style.accentColor">Jenis Acara</label>
                   <div class="flex flex-col gap-2">
                     <label class="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="evtType" [value]="false" [(ngModel)]="isRamadan">
                       <span class="text-sm font-medium">Reguler (Min {{ config().reservation.minPaxRegular }})</span>
                     </label>
                     <label class="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="evtType" [value]="true" [(ngModel)]="isRamadan">
                       <span class="text-sm font-medium">Buka Puasa (Min {{ config().reservation.minPaxRamadan }})</span>
                     </label>
                   </div>
                </div>

                <div>
                  <label class="block text-xs font-bold mb-1 uppercase">Jumlah Pax</label>
                  <input type="number" [(ngModel)]="formPax" 
                         class="w-full border px-3 py-2 text-sm bg-white"
                         [style.height]="config().reservation.inputHeight"
                         [style.borderRadius]="config().reservation.inputBorderRadius">
                </div>
                
                <!-- Submit Box -->
                <div class="text-white p-4 mt-4" [style.backgroundColor]="config().reservation.style.accentColor" [style.borderRadius]="config().reservation.inputBorderRadius">
                   <div class="flex justify-between text-sm mb-1 opacity-90">Total:</div>
                   <div class="text-2xl font-bold mb-4">{{ formatRupiah(grandTotal()) }}</div>
                   <button (click)="submitReservation()" [disabled]="!isValid()"
                     class="w-full bg-white text-black font-bold py-3 shadow transition hover:bg-gray-100 disabled:opacity-50"
                     [style.height]="config().reservation.buttonHeight"
                     [style.borderRadius]="config().reservation.inputBorderRadius">
                     Kirim WhatsApp
                   </button>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMN 2 & 3: Guest & Menu (Combined for brevity in styles, kept logical structure) -->
          <div class="lg:col-span-4 text-gray-800">
             <div class="bg-white p-6 shadow-lg h-full flex flex-col" [style.borderRadius]="config().reservation.cardBorderRadius">
                <h3 class="text-lg font-bold mb-4 border-b pb-2 flex justify-between items-center" [style.color]="config().reservation.style.accentColor">
                   <span>Pesanan Tamu</span>
                   <button (click)="addGuest()" class="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold">+ Tambah</button>
                </h3>
                <div class="flex-1 overflow-y-auto space-y-3 max-h-[600px]">
                   @for (guest of guests(); track guest.id) {
                      <div (click)="setActiveGuest(guest.id)" class="p-4 rounded border-2 cursor-pointer transition"
                         [style.borderColor]="activeGuestId() === guest.id ? config().reservation.style.accentColor : '#eee'"
                         [class.bg-orange-50]="activeGuestId() === guest.id">
                         <div class="flex items-center gap-3 mb-2">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                               [style.backgroundColor]="activeGuestId() === guest.id ? config().reservation.style.accentColor : '#ccc'">
                               {{ $index + 1 }}
                            </div>
                            <input type="text" [(ngModel)]="guest.name" class="flex-1 bg-transparent border-b font-bold text-sm outline-none" placeholder="Nama Tamu">
                         </div>
                         <div class="text-xs pl-11 opacity-70">
                            Subtotal: {{ formatRupiah(getGuestTotal(guest)) }}
                         </div>
                      </div>
                   }
                </div>
             </div>
          </div>

          <div class="lg:col-span-5 text-gray-800">
             <div class="bg-white p-6 shadow-lg h-full" [style.borderRadius]="config().reservation.cardBorderRadius">
                <h3 class="text-lg font-bold mb-4 border-b pb-2" [style.color]="config().reservation.style.accentColor">Pilih Menu</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto">
                   @for (item of currentBranchMenu(); track $index) {
                      <div class="border rounded-lg overflow-hidden flex flex-col">
                         <div class="h-32 bg-gray-100 relative">
                            <img [src]="item.image" class="w-full h-full object-cover">
                            <span class="absolute bottom-0 left-0 bg-black/60 text-white text-xs px-2 py-1">{{ item.price }}</span>
                            @if(item.soldOut) { <div class="absolute inset-0 bg-white/50 flex items-center justify-center font-bold">HABIS</div> }
                         </div>
                         <div class="p-3 flex-1 flex flex-col justify-between">
                            <h4 class="font-bold text-sm leading-tight mb-1">{{ item.name }}</h4>
                            <div class="mt-2 flex justify-between items-center">
                               @if (!item.soldOut) {
                                   @if (getActiveGuestQty(item) === 0) {
                                      <button (click)="addToActiveGuest(item)" class="text-xs text-white px-3 py-1 rounded font-bold"
                                         [style.backgroundColor]="config().reservation.style.accentColor">+ Pesan</button>
                                   } @else {
                                      <div class="flex items-center bg-gray-100 rounded">
                                         <button (click)="removeFromActiveGuest(item)" class="px-2 font-bold">-</button>
                                         <span class="px-2 font-bold">{{ getActiveGuestQty(item) }}</span>
                                         <button (click)="addToActiveGuest(item)" class="px-2 font-bold">+</button>
                                      </div>
                                   }
                               } @else {
                                   <span class="text-red-500 text-xs font-bold">Sold Out</span>
                               }
                            </div>
                         </div>
                      </div>
                   }
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class ReservationComponent {
  configService = inject(ConfigService);
  config = this.configService.config;

  selectedBranchIndex = signal(0);
  formName = signal('');
  formDate = signal('');
  formTime = signal('');
  formPax = signal(0);
  formNotes = signal('');
  isRamadan = signal(false);

  guests = signal<GuestOrder[]>([{ id: 1, name: 'Pemesan', cart: new Map() }]);
  activeGuestId = signal<number>(1);

  currentBranch = computed(() => this.config().branches[this.selectedBranchIndex()]);
  currentBranchMenu = computed(() => this.currentBranch().menu);
  minPax = computed(() => this.isRamadan() ? this.config().reservation.minPaxRamadan : this.config().reservation.minPaxRegular);

  isValid = computed(() => this.formName() !== '' && this.formDate() !== '' && this.formPax() >= this.minPax());

  grandTotal = computed(() => {
    let total = 0;
    this.guests().forEach(g => total += this.getGuestTotal(g));
    return total;
  });

  addGuest() {
    this.guests.update(l => [...l, { id: Date.now(), name: `Tamu ${l.length + 1}`, cart: new Map() }]);
  }
  removeGuest(id: number) { this.guests.update(l => l.filter(g => g.id !== id)); }
  setActiveGuest(id: number) { this.activeGuestId.set(id); }
  getActiveGuestName() { return this.guests().find(g => g.id === this.activeGuestId())?.name || '-'; }

  addToActiveGuest(item: MenuItem) {
    this.guests.update(list => list.map(g => {
       if (g.id !== this.activeGuestId()) return g;
       const nc = new Map<MenuItem, number>(g.cart);
       nc.set(item, (nc.get(item) || 0) + 1);
       return { ...g, cart: nc };
    }));
  }
  
  removeFromActiveGuest(item: MenuItem) {
    this.guests.update(list => list.map(g => {
       if (g.id !== this.activeGuestId()) return g;
       const nc = new Map<MenuItem, number>(g.cart);
       const q = nc.get(item) || 0;
       if (q > 1) nc.set(item, q - 1); else nc.delete(item);
       return { ...g, cart: nc };
    }));
  }

  getActiveGuestQty(item: MenuItem) {
     return this.guests().find(g => g.id === this.activeGuestId())?.cart.get(item) || 0;
  }

  getGuestTotal(g: GuestOrder) {
     let t = 0; g.cart.forEach((q, i) => t += this.parsePrice(i.price) * q); return t;
  }

  parsePrice(s: string) { return parseInt(s.replace(/[^0-9]/g, '')) || 0; }
  formatRupiah(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }
  
  setBranch(i: any) { this.selectedBranchIndex.set(Number(i)); this.guests.update(l => l.map(g => ({...g, cart: new Map()}))); }

  submitReservation() {
    const b = this.currentBranch();
    
    // CUSTOM TEMPLATE LOGIC
    let msg = this.config().reservation.whatsappTemplate || 'Halo Admin, reservasi {name}';
    msg = msg.replace('{name}', this.formName())
             .replace('{date}', this.formDate())
             .replace('{time}', this.formTime())
             .replace('{pax}', this.formPax().toString());
    
    msg += `\n\n*Detail Order:*\n`;
    this.guests().forEach((g, i) => {
       if (g.cart.size > 0) {
          msg += `*${i+1}. ${g.name}*\n`;
          g.cart.forEach((q, m) => msg += `  ${q}x ${m.name}\n`);
       }
    });
    msg += `\n*Total Estimasi: ${this.formatRupiah(this.grandTotal())}*`;

    const phone = this.configService.formatPhoneNumber(b.whatsappNumber);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
