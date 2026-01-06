// FIX: Re-created the component file which was truncated and missing the class definition.
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService, PackageItem } from '../services/config.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-20 min-h-screen transition-colors duration-500"
      [style.backgroundColor]="config().packagesPage?.style?.backgroundColor"
      [style.color]="config().packagesPage?.style?.textColor"
      [style.fontFamily]="config().packagesPage?.style?.fontFamily"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-12 animate-fade-in-down">
           <h2 class="font-bold mb-4" 
               [style.fontFamily]="config().packagesPage?.titleStyle?.fontFamily"
               [style.fontSize]="config().packagesPage?.titleStyle?.fontSize"
               [style.color]="config().packagesPage?.titleStyle?.color"
           >{{ config().packagesPage?.title || 'Paket Hemat' }}</h2>
           <p class="max-w-2xl mx-auto opacity-80"
              [style.fontFamily]="config().packagesPage?.subtitleStyle?.fontFamily"
              [style.fontSize]="config().packagesPage?.subtitleStyle?.fontSize"
              [style.color]="config().packagesPage?.subtitleStyle?.color">
              {{ config().packagesPage?.subtitle || 'Pilihan terbaik untuk makan bersama.' }}
           </p>
        </div>

        <!-- Branch Selector -->
        <div class="flex flex-wrap justify-center gap-3 mb-10">
          @for (branch of config().branches; track $index) {
             <button 
               (click)="setBranch($index)"
               class="px-6 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider border hover:shadow-md"
               [style.backgroundColor]="selectedBranchIndex() === $index ? config().packagesPage?.style?.accentColor : 'transparent'"
               [style.borderColor]="config().packagesPage?.style?.accentColor"
               [style.color]="selectedBranchIndex() === $index ? '#fff' : config().packagesPage?.style?.textColor"
             >
               {{ branch.name }}
             </button>
          }
        </div>

        <!-- Packages Grid -->
        @if (currentBranchPackages().length > 0) {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (pkg of currentBranchPackages(); track $index) {
              <div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up"
                   [style.backgroundColor]="config().packagesPage?.cardBackgroundColor"
                   [style.color]="config().packagesPage?.cardTextColor"
                   [style.borderRadius]="config().packagesPage?.cardBorderRadius">
                
                <div class="relative">
                  <img [src]="pkg.image" [alt]="pkg.name" (error)="handleImageError($event)" class="w-full h-56 object-cover">
                  <div class="absolute top-0 right-0 text-white font-bold px-4 py-1 text-lg"
                       [style.backgroundColor]="config().packagesPage?.style?.accentColor"
                       [style.color]="config().packagesPage?.priceColor"
                       [style.fontSize]="config().packagesPage?.priceFontSize">
                    {{ formatPriceString(pkg.price) }}
                  </div>
                  @if (pkg.minPax) {
                    <span class="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">Min. {{ pkg.minPax }} orang</span>
                  }
                </div>

                <div class="p-6 flex-1 flex flex-col">
                  <h3 class="text-xl font-bold mb-2">{{ pkg.name }}</h3>
                  <p class="text-sm opacity-70 mb-4 flex-1">{{ pkg.description }}</p>
                  
                  <div class="border-t pt-4">
                    <h4 class="text-xs font-bold uppercase mb-2 tracking-wider opacity-60">{{ config().packagesPage?.itemsHeaderText || 'Isi Paket:' }}</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside opacity-80">
                      @for (item of pkg.items; track $index) {
                        <li>{{ item }}</li>
                      }
                    </ul>
                  </div>
                </div>

                <div class="p-6 pt-0 mt-auto">
                  <button (click)="orderPackage(pkg)" class="w-full text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                          [style.backgroundColor]="config().packagesPage?.style?.accentColor">
                    {{ config().packagesPage?.buttonText || 'Pesan Paket Ini' }}
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-16">
            <p class="text-lg opacity-60">Tidak ada paket yang tersedia untuk cabang ini.</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
    .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; animation-delay: 0.2s; opacity: 0; }
  `]
})
export class PackagesComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;

  selectedBranchIndex = signal(0);

  currentBranchPackages = computed(() => {
    const branch = this.config().branches[this.selectedBranchIndex()];
    return branch?.packages || [];
  });

  setBranch(index: number) {
    this.selectedBranchIndex.set(index);
  }
  
  parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  formatPriceString(priceStr: string): string {
    const amount = this.parsePrice(priceStr);
    return this.formatNumber(amount);
  }

  formatNumber(n: number): string {
     return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/400x300/eee/999?text=Paket';
  }

  orderPackage(pkg: PackageItem) {
    const branch = this.config().branches[this.selectedBranchIndex()];
    
    const subtotal = this.parsePrice(pkg.price);
    const taxRate = (this.config().global.taxPercentage || 0) / 100;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    let message = `*Halo Sate Maranggi Hj. Maya (${branch.name}),*\nSaya tertarik dengan paket *${pkg.name}*.`;
    
    message += `\n\n*Rincian Pesanan:*\n`;
    message += `Paket: ${pkg.name}\n`;
    message += `Subtotal: ${this.formatNumber(subtotal)}\n`;
    if (taxAmount > 0) {
      message += `Pajak (${this.config().global.taxPercentage}%): ${this.formatNumber(taxAmount)}\n`;
    }
    message += `*Total: ${this.formatNumber(total)}*`;
    
    message += `\n\nMohon info lebih lanjut. Terima kasih.`;

    this.configService.logEvent('order_package', { package_name: pkg.name, package_price: pkg.price });

    const phone = this.configService.formatPhoneNumber(branch.whatsappNumber);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }
}
