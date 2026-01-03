import { Component, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem } from '../services/config.service';
import { ToastService } from '../services/toast.service';

interface GuestOrder {
  id: number;
  name: string;
  cart: Map<MenuItem, number>;
  note?: string; // New: Note per guest specific
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
            <div class="p-6 shadow-lg border border-gray-200 h-fit sticky top-24 transition-colors"
                 [style.backgroundColor]="config().reservation.cardBackgroundColor || '#FFFFFF'"
                 [style.color]="config().reservation.cardTextColor || '#3E2723'"
                 [style.borderRadius]="config().reservation.cardBorderRadius">
              <h3 class="text-lg font-bold border-b pb-2 mb-4" [style.color]="config().reservation.style.accentColor">Data Reservasi</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">Pilih Cabang</label>
                  <select [ngModel]="selectedBranchIndex()" (ngModelChange)="setBranch($event)" 
                          class="w-full border px-3 py-2 text-sm font-bold bg-white text-gray-800 focus:outline-none focus:ring-1"
                          [ngStyle]="config().reservation.inputStyle"
                          [style.height]="config().reservation.inputHeight"
                          [style.borderRadius]="config().reservation.inputBorderRadius"
                          [style.borderColor]="config().reservation.style.accentColor + '40'">
                    @for (branch of config().branches; track $index) {
                      <option [value]="$index">{{ branch.name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">Nama Pemesan</label>
                  <input type="text" [(ngModel)]="formName" 
                         class="w-full border px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1" placeholder="Bpk. Budi"
                         [ngStyle]="config().reservation.inputStyle"
                         [style.height]="config().reservation.inputHeight"
                         [style.borderRadius]="config().reservation.inputBorderRadius"
                         [style.borderColor]="config().reservation.style.accentColor + '40'">
                </div>

                <!-- Blind Spot 1: Phone Contact -->
                <div>
                   <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">No. WhatsApp</label>
                   <input type="tel" [(ngModel)]="formPhone"
                          class="w-full border px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1" placeholder="0812xxx"
                          [ngStyle]="config().reservation.inputStyle"
                          [style.height]="config().reservation.inputHeight"
                          [style.borderRadius]="config().reservation.inputBorderRadius"
                          [style.borderColor]="config().reservation.style.accentColor + '40'">
                </div>

                <!-- Blind Spot 5: Optional Email -->
                @if (currentBranch().requireEmail) {
                   <div>
                      <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">Email</label>
                      <input type="email" [(ngModel)]="formEmail"
                             class="w-full border px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1" placeholder="email@contoh.com"
                             [ngStyle]="config().reservation.inputStyle"
                             [style.height]="config().reservation.inputHeight"
                             [style.borderRadius]="config().reservation.inputBorderRadius"
                             [style.borderColor]="config().reservation.style.accentColor + '40'">
                   </div>
                }

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">Tanggal</label>
                    <input type="date" [(ngModel)]="formDate" [min]="today"
                           class="w-full border px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1"
                           [ngStyle]="config().reservation.inputStyle"
                           [style.height]="config().reservation.inputHeight"
                           [style.borderRadius]="config().reservation.inputBorderRadius"
                           [style.borderColor]="config().reservation.style.accentColor + '40'">
                  </div>
                  <div>
                    <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">Jam</label>
                    <input type="time" [(ngModel)]="formTime" 
                           class="w-full border px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1"
                           [class.border-red-500]="timeError()"
                           [ngStyle]="config().reservation.inputStyle"
                           [style.height]="config().reservation.inputHeight"
                           [style.borderRadius]="config().reservation.inputBorderRadius"
                           [style.borderColor]="timeError() ? 'red' : config().reservation.style.accentColor + '40'">
                  </div>
                </div>
                
                @if (timeError()) {
                   <div class="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                      {{ timeError() }}
                   </div>
                }

                <div class="bg-black/5 p-3 border" 
                     [style.borderRadius]="config().reservation.inputBorderRadius"
                     [style.borderColor]="config().reservation.style.accentColor + '40'">
                   <label class="block text-xs font-bold mb-2 uppercase" [style.color]="config().reservation.style.accentColor">Jenis Acara</label>
                   <div class="flex flex-col gap-2">
                     <label class="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="evtType" [value]="false" [(ngModel)]="isRamadan">
                       <span class="text-sm font-medium">Reguler (Min {{ currentBranch().minPaxRegular }})</span>
                     </label>
                     <label class="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="evtType" [value]="true" [(ngModel)]="isRamadan">
                       <span class="text-sm font-medium">Buka Puasa (Min {{ currentBranch().minPaxRamadan }})</span>
                     </label>
                   </div>
                </div>

                <div>
                  <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">Jumlah Pax (Max {{ currentBranch().maxPax }})</label>
                  <input type="number" [(ngModel)]="formPax" min="1" [max]="currentBranch().maxPax"
                         class="w-full border px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1"
                         [class.border-red-500]="paxError()"
                         [ngStyle]="config().reservation.inputStyle"
                         [style.height]="config().reservation.inputHeight"
                         [style.borderRadius]="config().reservation.inputBorderRadius"
                         [style.borderColor]="paxError() ? 'red' : config().reservation.style.accentColor + '40'">
                  @if (paxError()) {
                     <p class="text-[10px] text-red-500 mt-1">{{ paxError() }}</p>
                  }
                </div>
                
                <!-- Table Type Selection -->
                @if (currentBranch().tableTypes.length > 0) {
                    <div>
                        <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">Pilih Area</label>
                        <select [(ngModel)]="selectedTableType"
                                class="w-full border px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1"
                                [ngStyle]="config().reservation.inputStyle"
                                [style.height]="config().reservation.inputHeight"
                                [style.borderRadius]="config().reservation.inputBorderRadius"
                                [style.borderColor]="config().reservation.style.accentColor + '40'">
                            <option value="">-- Pilih Area --</option>
                            @for (type of currentBranch().tableTypes; track $index) {
                                <option [value]="type">{{ type }}</option>
                            }
                        </select>
                    </div>
                }

                <!-- Special Request -->
                @if (currentBranch().enableSpecialRequest) {
                    <div>
                        <label class="block text-xs font-bold mb-1 uppercase" [ngStyle]="config().reservation.labelStyle">Catatan Khusus</label>
                        <textarea [(ngModel)]="specialRequest" class="w-full border px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1"
                                  placeholder="Contoh: Kursi bayi, alergi, hiasan ultah..."
                                  rows="2"
                                  [ngStyle]="config().reservation.inputStyle"
                                  [style.borderRadius]="config().reservation.inputBorderRadius"
                                  [style.borderColor]="config().reservation.style.accentColor + '40'"></textarea>
                    </div>
                }

                <!-- Terms & Conditions -->
                @if (currentBranch().termsAndConditions) {
                    <div class="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-gray-700">
                        <p class="mb-2 font-bold text-yellow-800">Syarat & Ketentuan:</p>
                        <p class="whitespace-pre-line mb-2">{{ currentBranch().termsAndConditions }}</p>
                        <label class="flex items-center gap-2 cursor-pointer font-bold">
                            <input type="checkbox" [(ngModel)]="agreedToTerms"> Saya Setuju
                        </label>
                    </div>
                }

                <!-- Submit Box -->
                <div class="text-white p-4 mt-4" [style.backgroundColor]="config().reservation.style.accentColor" [style.borderRadius]="config().reservation.inputBorderRadius">
                   <div class="flex justify-between text-sm mb-1 opacity-90" [ngStyle]="config().reservation.summaryStyle">Total Estimasi:</div>
                   <div class="text-2xl font-bold mb-2" [ngStyle]="config().reservation.summaryStyle">{{ formatRupiah(grandTotal()) }}</div>
                   
                   <!-- Blind Spot 10: DP Calculation -->
                   @if (currentBranch().enableDownPaymentCalc) {
                      <div class="text-xs bg-black/20 p-2 rounded mb-4">
                         <div class="flex justify-between">
                            <span [ngStyle]="config().reservation.summaryStyle" style="font-size: 0.75rem;">Wajib DP ({{ currentBranch().downPaymentPercentage }}%):</span>
                            <span class="font-bold" [ngStyle]="config().reservation.summaryStyle" style="font-size: 0.75rem;">{{ formatRupiah(grandTotal() * (currentBranch().downPaymentPercentage / 100)) }}</span>
                         </div>
                      </div>
                   }

                   <button (click)="checkValidation()" 
                     class="w-full bg-white text-black font-bold py-3 shadow transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                     [style.height]="config().reservation.buttonHeight"
                     [style.borderRadius]="config().reservation.inputBorderRadius">
                     Lanjut ke WhatsApp
                   </button>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMN 2 & 3: Guest & Menu -->
          <div class="lg:col-span-4 text-gray-800">
             <div class="p-6 shadow-lg h-full flex flex-col transition-colors" 
                  [style.backgroundColor]="config().reservation.cardBackgroundColor || '#FFFFFF'"
                  [style.color]="config().reservation.cardTextColor || '#3E2723'"
                  [style.borderRadius]="config().reservation.cardBorderRadius">
                <h3 class="text-lg font-bold mb-4 border-b pb-2 flex justify-between items-center" [style.color]="config().reservation.style.accentColor">
                   <span>Pesanan Tamu</span>
                   <button (click)="addGuest()" class="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold">+ Tambah</button>
                </h3>
                <div class="flex-1 overflow-y-auto space-y-3 max-h-[600px] custom-scrollbar">
                   @for (guest of guests(); track guest.id) {
                      <div (click)="setActiveGuest(guest.id)" class="p-4 rounded border-2 cursor-pointer transition relative group"
                         [style.borderColor]="activeGuestId() === guest.id ? config().reservation.style.accentColor : '#eee'"
                         [class.bg-orange-50]="activeGuestId() === guest.id">
                         
                         @if (guests().length > 1) {
                            <button (click)="removeGuest(guest.id); $event.stopPropagation()" class="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold px-2">×</button>
                         }

                         <div class="flex items-center gap-3 mb-2">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                               [style.backgroundColor]="activeGuestId() === guest.id ? config().reservation.style.accentColor : '#ccc'">
                               {{ $index + 1 }}
                            </div>
                            <input type="text" [(ngModel)]="guest.name" class="flex-1 bg-transparent border-b font-bold text-sm outline-none" placeholder="Nama Tamu" (click)="$event.stopPropagation()">
                         </div>
                         
                         <!-- Blind Spot 8: Note Per Guest (Simple Implementation) -->
                         <div class="mb-2 pl-11">
                             <input type="text" [(ngModel)]="guest.note" class="w-full text-xs bg-gray-50 border rounded px-2 py-1 italic" placeholder="Catatan khusus (opsional)..." (click)="$event.stopPropagation()">
                         </div>

                         <!-- Item List Preview -->
                         @if(guest.cart.size > 0) {
                            <div class="pl-11 mb-2">
                                @for (entry of guest.cart.entries(); track entry[0].name) {
                                   <div class="text-xs flex justify-between">
                                      <span>{{ entry[1] }}x {{ entry[0].name }}</span>
                                   </div>
                                }
                            </div>
                         }

                         <div class="text-xs pl-11 opacity-70 border-t pt-1 mt-1 font-bold">
                            Subtotal: {{ formatRupiah(getGuestTotal(guest)) }}
                         </div>
                      </div>
                   }
                </div>
             </div>
          </div>

          <div class="lg:col-span-5 text-gray-800">
             <div class="p-6 shadow-lg h-full transition-colors flex flex-col"
                  [style.backgroundColor]="config().reservation.cardBackgroundColor || '#FFFFFF'"
                  [style.color]="config().reservation.cardTextColor || '#3E2723'" 
                  [style.borderRadius]="config().reservation.cardBorderRadius">
                
                <h3 class="text-lg font-bold mb-4 border-b pb-2" [style.color]="config().reservation.style.accentColor">Pilih Menu</h3>
                
                <!-- Blind Spot 6: Menu Search -->
                <div class="mb-4">
                   <input type="text" [(ngModel)]="menuSearch" placeholder="Cari menu..." 
                          class="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto pr-1 custom-scrollbar">
                   @for (item of filteredMenu(); track item.name) {
                      <div class="border rounded-lg overflow-hidden flex flex-col bg-white text-gray-800 shadow-sm hover:shadow-md transition">
                         <div class="h-32 bg-gray-100 relative">
                            <img [src]="item.image" class="w-full h-full object-cover" (error)="handleImageError($event)">
                            <span class="absolute bottom-0 left-0 bg-black/60 text-white text-xs px-2 py-1">{{ item.price }}</span>
                            @if(item.soldOut) { <div class="absolute inset-0 bg-white/50 flex items-center justify-center font-bold">HABIS</div> }
                         </div>
                         <div class="p-3 flex-1 flex flex-col justify-between">
                            <h4 class="font-bold text-sm leading-tight mb-1">{{ item.name }}</h4>
                            <div class="mt-2 flex justify-between items-center">
                               @if (!item.soldOut) {
                                   @if (getActiveGuestQty(item) === 0) {
                                      <button (click)="addToActiveGuest(item)" class="text-xs text-white px-3 py-1 rounded font-bold transition hover:opacity-90 active:scale-95"
                                         [style.backgroundColor]="config().reservation.style.accentColor">+ Pesan</button>
                                   } @else {
                                      <div class="flex items-center bg-gray-100 rounded text-black border">
                                         <button (click)="removeFromActiveGuest(item)" class="px-2 font-bold hover:bg-gray-200">-</button>
                                         <span class="px-2 font-bold text-sm">{{ getActiveGuestQty(item) }}</span>
                                         <button (click)="addToActiveGuest(item)" class="px-2 font-bold hover:bg-gray-200">+</button>
                                      </div>
                                   }
                               } @else {
                                   <span class="text-red-500 text-xs font-bold">Sold Out</span>
                               }
                            </div>
                         </div>
                      </div>
                   }
                   @if (filteredMenu().length === 0) {
                      <div class="col-span-full text-center py-8 opacity-50">Menu tidak ditemukan</div>
                   }
                </div>
             </div>
          </div>

        </div>
      </div>

      <!-- Blind Spot 9 & 17: Success Modal Feedback -->
      @if (showSuccessModal()) {
         <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
               <div class="p-6 text-center">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">Data Siap Dikirim!</h3>
                  <p class="text-gray-600 mb-6 text-sm">Anda akan diarahkan ke WhatsApp untuk mengirim detail reservasi ini ke Admin.</p>
                  
                  <div class="flex gap-3">
                     <button (click)="submitToWA()" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                        <span>Buka WhatsApp</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                     </button>
                     <!-- Blind Spot 20: Copy Text Option -->
                     <button (click)="copyOrderText()" class="flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 rounded-xl transition" title="Salin Teks">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                     </button>
                  </div>
                  <button (click)="showSuccessModal.set(false)" class="mt-4 text-sm text-gray-400 hover:text-gray-600">Batal / Edit Lagi</button>
               </div>
            </div>
         </div>
      }

    </section>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ReservationComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;

  selectedBranchIndex = signal(0);
  formName = signal('');
  formPhone = signal(''); // NEW
  formEmail = signal(''); // NEW
  formDate = signal('');
  formTime = signal('');
  formPax = signal(0);
  isRamadan = signal(false);
  
  menuSearch = signal(''); // NEW
  
  selectedTableType = signal('');
  specialRequest = signal('');
  agreedToTerms = signal(false);
  
  showSuccessModal = signal(false);
  
  today = new Date().toISOString().split('T')[0];

  guests = signal<GuestOrder[]>([{ id: 1, name: 'Pemesan', cart: new Map(), note: '' }]);
  activeGuestId = signal<number>(1);

  constructor() {
    // Blind Spot 16: LocalStorage Persistence
    try {
        const saved = localStorage.getItem('reservation_draft');
        if (saved) {
            const data = JSON.parse(saved);
            this.formName.set(data.name || '');
            this.formPhone.set(data.phone || '');
            this.formEmail.set(data.email || '');
            this.selectedTableType.set(data.table || '');
            this.specialRequest.set(data.request || '');
            // Complex object reconstruction (Guests & Map) is omitted for simplicity/stability, 
            // focusing on form fields which are most annoying to re-type.
        }
    } catch(e) {}

    effect(() => {
        const draft = {
            name: this.formName(),
            phone: this.formPhone(),
            email: this.formEmail(),
            table: this.selectedTableType(),
            request: this.specialRequest()
        };
        localStorage.setItem('reservation_draft', JSON.stringify(draft));
    });
  }

  currentBranch = computed(() => this.config().branches[this.selectedBranchIndex()]);
  
  currentBranchMenu = computed(() => {
    const branch = this.currentBranch();
    if (!branch) return [];
    return this.configService.menuItems().filter(item => item.branchId === branch.id);
  });
  
  // Blind Spot 6: Search Logic
  filteredMenu = computed(() => {
     const query = this.menuSearch().toLowerCase();
     if(!this.currentBranchMenu()) return [];
     return this.currentBranchMenu().filter(m => 
        m.name.toLowerCase().includes(query) || (m.desc && m.desc.toLowerCase().includes(query))
     );
  });

  minPax = computed(() => this.isRamadan() ? this.currentBranch().minPaxRamadan : this.currentBranch().minPaxRegular);

  timeError = computed(() => {
    const time = this.formTime();
    if (!time) return null;
    
    const leadHours = this.currentBranch().bookingLeadTimeHours || 0;
    const now = new Date();
    const selectedDateTime = new Date(`${this.formDate()}T${time}`);
    
    if (this.formDate() && !isNaN(selectedDateTime.getTime())) {
        const diffMs = selectedDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffMs < 0) return 'Waktu sudah berlalu.';
        if (diffHours < leadHours) return `Minimal pemesanan ${leadHours} jam sebelum kedatangan.`;
    }

    const hoursStr = this.currentBranch().hours; 
    if (!hoursStr) return null; 

    const matches = hoursStr.match(/(\d{1,2})[:.](\d{2})/g);
    if (!matches || matches.length < 2) return null;

    const parseTime = (t: string) => {
       const [h, m] = t.replace('.', ':').split(':').map(Number);
       return h * 60 + m;
    };

    const start = parseTime(matches[0]);
    const end = parseTime(matches[1]);
    const selected = parseTime(time);

    if (selected < start || selected > end) {
       return `Cabang tutup pada jam ${time}. Buka: ${matches[0]} - ${matches[1]}`;
    }
    return null;
  });

  paxError = computed(() => {
      const pax = this.formPax();
      const min = this.minPax();
      const max = this.currentBranch().maxPax;
      
      if (pax < min) return `Minimal ${min} orang untuk reservasi ini.`;
      if (pax > max) return `Maksimal kapasitas ${max} orang. Hubungi admin untuk acara besar.`;
      return null;
  });

  isValid = computed(() => 
    this.formName() !== '' && 
    this.formPhone() !== '' &&
    this.formDate() !== '' && 
    this.paxError() === null &&
    this.timeError() === null &&
    (this.currentBranch().termsAndConditions ? this.agreedToTerms() : true) &&
    (this.currentBranch().tableTypes.length > 0 ? this.selectedTableType() !== '' : true) &&
    (!this.currentBranch().requireEmail || (this.currentBranch().requireEmail && this.formEmail() !== ''))
  );

  grandTotal = computed(() => {
    let total = 0;
    this.guests().forEach(g => total += this.getGuestTotal(g));
    return total;
  });

  addGuest() {
    this.guests.update(l => [...l, { id: Date.now(), name: `Tamu ${l.length + 1}`, cart: new Map(), note: '' }]);
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
  
  // Blind Spot 7: Protect Branch Change
  setBranch(i: any) { 
      if (this.guests().some(g => g.cart.size > 0)) {
          if (!confirm('Ganti cabang akan mereset pesanan menu. Lanjutkan?')) return;
      }
      this.selectedBranchIndex.set(Number(i)); 
      this.guests.set([{ id: 1, name: 'Pemesan', cart: new Map(), note: '' }]);
      this.activeGuestId.set(1);
  }
  
  // Blind Spot 2: Image Fallback
  handleImageError(event: any) {
      event.target.src = 'https://placehold.co/100x100/eee/999?text=Menu';
  }

  checkValidation() {
     if (!this.isValid()) {
         this.toastService.show('Mohon lengkapi data formulir yang wajib diisi.', 'error');
         return;
     }
     this.showSuccessModal.set(true);
  }

  constructMessage(): string {
    const b = this.currentBranch();
    let msg = b.whatsappTemplate || 'Halo Admin, reservasi {name}';
    
    // Construct Contact Info
    let contact = this.formPhone();
    if (this.formEmail()) contact += ` / ${this.formEmail()}`;

    msg = msg.replace('{name}', this.formName())
             .replace('{contact}', contact)
             .replace('{date}', this.formDate())
             .replace('{time}', this.formTime())
             .replace('{pax}', this.formPax().toString())
             .replace('{branch}', b.name)
             .replace('{tableType}', this.selectedTableType() || '-')
             .replace('{notes}', this.specialRequest() || '-');
    
    msg += `\n\n*Detail Order:*\n`;
    this.guests().forEach((g, i) => {
       if (g.cart.size > 0 || g.note) {
          msg += `*${i+1}. ${g.name}* ${g.note ? '('+g.note+')' : ''}\n`;
          g.cart.forEach((q, m) => msg += `  ${q}x ${m.name}\n`);
       }
    });
    
    const total = this.grandTotal();
    msg += `\n*Total Estimasi: ${this.formatRupiah(total)}*`;
    
    if (this.currentBranch().enableDownPaymentCalc) {
        const dp = total * (this.currentBranch().downPaymentPercentage / 100);
        msg += `\n*Perkiraan DP (${this.currentBranch().downPaymentPercentage}%): ${this.formatRupiah(dp)}*`;
    }
    
    msg += `\n\n*Status: Menunggu Konfirmasi Admin*`; 
    return msg;
  }

  submitToWA() {
    const b = this.currentBranch();
    const phone = this.configService.formatPhoneNumber(b.whatsappNumber);
    const msg = this.constructMessage();
    
    // Clear Local Storage on success
    localStorage.removeItem('reservation_draft');
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    this.showSuccessModal.set(false);
  }
  
  // Blind Spot 20: Copy Text
  copyOrderText() {
     const msg = this.constructMessage();
     navigator.clipboard.writeText(msg).then(() => {
         this.toastService.show('Teks pesanan berhasil disalin!', 'success');
     });
  }
}