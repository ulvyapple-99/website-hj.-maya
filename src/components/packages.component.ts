
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService, PackageItem } from '../services/config.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-20 min-h-screen transition-colors duration-500"
      [style.backgroundColor]="config().packagesPage?.style?.backgroundColor || '#FFF3E0'"
      [style.color]="config().packagesPage?.style?.textColor || '#3E2723'"
      [style.fontFamily]="config().packagesPage?.style?.fontFamily || 'Playfair Display'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-12">
           <h2 class="font-bold mb-4" 
               [style.color]="config().packagesPage?.style?.accentColor || '#D84315'"
               [style.fontSize]="config().packagesPage?.style?.titleFontSize || '2.5rem'"
           >{{ config().packagesPage?.title || 'Paket Hemat' }}</h2>
           <p class="max-w-2xl mx-auto opacity-80"
              [style.fontSize]="config().packagesPage?.style?.subtitleFontSize || '1rem'">
              {{ config().packagesPage?.subtitle || 'Pilihan terbaik untuk makan bersama.' }}
           </p>
        </div>

        <!-- Branch Selector -->
        <div class="flex flex-wrap justify-center gap-3 mb-10">
          @for (branch of config().branches; track $index) {
             <button 
               (click)="selectedBranchIndex.set($index)"
               class="px-6 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider"
               [style.backgroundColor]="selectedBranchIndex() === $index ? (config().packagesPage?.style?.accentColor || '#D84315') : 'transparent'"
               [style.borderColor]="config().packagesPage?.style?.accentColor || '#D84315'"
               [class.border]="selectedBranchIndex() !== $index"
               [style.color]="selectedBranchIndex() === $index ? '#fff' : (config().packagesPage?.style?.textColor || '#3E2723')"
             >
               {{ branch.name }}
             </button>
          }
        </div>

        <!-- Packages List -->
        @if (currentPackages().length > 0) {
           <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             @for (pkg of currentPackages(); track $index) {
                <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group h-full"
                     [style.borderRadius]="config().packagesPage?.cardBorderRadius || '16px'">
                   
                   <!-- Image -->
                   <div class="h-48 overflow-hidden relative">
                      <img [src]="pkg.image || 'https://picsum.photos/400/300'" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                      <div class="absolute bottom-0 left-0 bg-black/70 text-white px-4 py-2 font-bold rounded-tr-xl">
                         {{ pkg.price }}
                      </div>
                   </div>

                   <!-- Content -->
                   <div class="p-6 flex-1 flex flex-col">
                      <h3 class="font-bold text-xl mb-2 text-gray-900">{{ pkg.name }}</h3>
                      <p class="text-sm text-gray-500 mb-4">{{ pkg.description }}</p>
                      
                      <!-- Items List -->
                      <div class="bg-orange-50 p-4 rounded-xl mb-6 flex-1 border border-orange-100">
                         <h4 class="font-bold text-xs uppercase text-orange-800 mb-2">Isi Paket:</h4>
                         <ul class="space-y-1">
                            @for (item of pkg.items; track item) {
                               <li class="text-sm text-gray-700 flex items-start gap-2">
                                  <span class="text-orange-500 mt-1">✓</span> {{ item }}
                               </li>
                            }
                         </ul>
                      </div>

                      <button (click)="orderPackage(pkg)" 
                         class="w-full py-3 rounded-xl font-bold text-white shadow-md transform active:scale-95 transition hover:brightness-110"
                         [style.backgroundColor]="config().packagesPage?.style?.accentColor || '#D84315'">
                         Pesan Sekarang
                      </button>
                   </div>
                </div>
             }
           </div>
        } @else {
           <div class="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
              <p class="opacity-60 text-lg">Belum ada paket tersedia di cabang ini.</p>
           </div>
        }

      </div>
    </section>
  `
})
export class PackagesComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  selectedBranchIndex = signal(0);

  currentPackages = computed(() => {
     const branch = this.config().branches[this.selectedBranchIndex()];
     return branch?.packages || [];
  });

  orderPackage(pkg: PackageItem) {
     const branch = this.config().branches[this.selectedBranchIndex()];
     const phone = this.configService.formatPhoneNumber(branch.whatsappNumber);
     const msg = `Halo Admin ${branch.name}, saya berminat pesan *${pkg.name}* seharga ${pkg.price}.\n\nMohon info ketersediaannya. Terima kasih.`;
     window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
