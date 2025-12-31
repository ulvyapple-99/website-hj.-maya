
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
      [style.backgroundColor]="config().packagesPage?.style?.backgroundColor || '#FFF3E0'"
      [style.color]="config().packagesPage?.style?.textColor || '#3E2723'"
      [style.fontFamily]="config().packagesPage?.style?.fontFamily || 'Playfair Display'"
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
               class="px-6 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider focus:ring-4 focus:ring-opacity-50"
               [style.backgroundColor]="selectedBranchIndex() === $index ? (config().packagesPage?.style?.accentColor || '#D84315') : 'transparent'"
               [style.borderColor]="config().packagesPage?.style?.accentColor || '#D84315'"
               [class.border]="selectedBranchIndex() !== $index"
               [style.color]="selectedBranchIndex() === $index ? '#fff' : (config().packagesPage?.style?.textColor || '#3E2723')"
               [style.boxShadow]="selectedBranchIndex() === $index ? '0 4px 14px 0 rgba(0,0,0,0.2)' : 'none'"
             >
               {{ branch.name }}
             </button>
          }
        </div>

        <!-- Blind Spot 1: Loading State & Animation -->
        @if (isLoading()) {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             @for (i of [1,2,3]; track i) {
                <div class="rounded-2xl overflow-hidden bg-black/5 animate-pulse h-[500px]"></div>
             }
          </div>
        } @else {

            <!-- Packages List -->
            @if (currentPackages().length > 0) {
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                @for (pkg of currentPackages(); track $index) {
                    <article class="relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group h-full animate-scale-up"
                        [style.animationDelay]="$index * 100 + 'ms'"
                        [style.backgroundColor]="config().packagesPage?.cardBackgroundColor || '#FFFFFF'"
                        [style.color]="config().packagesPage?.cardTextColor || '#3E2723'"
                        [style.borderRadius]="config().packagesPage?.cardBorderRadius || '16px'">
                    
                    <!-- Blind Spot 6: Visual Hierarchy (Badge) -->
                    @if ($index === 0) {
                        <div class="absolute top-4 right-4 z-20 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            Best Value
                        </div>
                    }

                    <!-- Image -->
                    <div class="h-56 overflow-hidden relative bg-gray-200">
                        <!-- Blind Spot 2: Image Error Handling -->
                        <img [src]="pkg.image || 'https://picsum.photos/400/300'" 
                             (error)="handleImageError($event)"
                             [alt]="pkg.name"
                             loading="lazy"
                             class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                        
                        <div class="absolute bottom-0 left-0 px-5 py-2 font-bold rounded-tr-2xl backdrop-blur-sm"
                            [style.backgroundColor]="'rgba(0,0,0,0.7)'"
                            [style.color]="config().packagesPage?.priceColor || '#FFFFFF'"
                            [style.fontSize]="config().packagesPage?.priceFontSize || '1rem'">
                            {{ pkg.price }}
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6 flex-1 flex flex-col relative">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-bold text-xl leading-tight">{{ pkg.name }}</h3>
                            <!-- Blind Spot 4: Share Button -->
                            <button (click)="sharePackage(pkg)" class="text-gray-400 hover:text-blue-500 transition p-1" title="Bagikan Paket">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </button>
                        </div>

                        <!-- Blind Spot 3: Min Pax Info -->
                        @if (pkg.minPax) {
                            <div class="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 bg-gray-100 w-fit px-2 py-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Cocok untuk {{ pkg.minPax }} Orang
                            </div>
                        }

                        <p class="text-sm opacity-70 mb-5 line-clamp-2">{{ pkg.description }}</p>
                        
                        <!-- Items List with Custom Scroll -->
                        <div class="bg-black/5 p-4 rounded-xl mb-6 flex-1 border border-black/5 max-h-[200px] overflow-y-auto custom-scrollbar">
                            <h4 class="font-bold text-xs uppercase opacity-60 mb-2 tracking-wider">Isi Paket:</h4>
                            <ul class="space-y-2">
                                @for (item of pkg.items; track item) {
                                <li class="text-sm flex items-start gap-2 leading-snug">
                                    <span class="mt-0.5 flex-shrink-0" [style.color]="config().packagesPage?.style?.accentColor">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                                    </span> 
                                    <span>{{ item }}</span>
                                </li>
                                }
                            </ul>
                        </div>

                        <button (click)="orderPackage(pkg)" 
                            class="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition hover:brightness-110 flex items-center justify-center gap-2"
                            [style.backgroundColor]="config().packagesPage?.style?.accentColor || '#D84315'">
                            <span>{{ config().packagesPage?.buttonText || 'Pesan Sekarang' }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                    </article>
                }
            </div>
            } @else {
                <!-- Blind Spot 9: Better Empty State -->
                <div class="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 animate-fade-in">
                    <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <h3 class="font-bold text-xl text-gray-700">Paket Belum Tersedia</h3>
                    <p class="opacity-60 text-base mb-6">Belum ada paket yang ditambahkan untuk cabang ini.</p>
                    <button class="text-sm font-bold text-brand-orange hover:underline">Hubungi Admin</button>
                </div>
            }

        }

      </div>
    </section>
  `,
  styles: [`
    .animate-scale-up { animation: scaleUp 0.5s ease-out forwards; opacity: 0; transform: scale(0.95); }
    .animate-fade-in-down { animation: fadeInDown 0.8s ease-out; }
    
    @keyframes scaleUp {
        to { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
  `]
})
export class PackagesComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;
  
  selectedBranchIndex = signal(0);
  isLoading = signal(false);

  currentPackages = computed(() => {
     const branch = this.config().branches[this.selectedBranchIndex()];
     return branch?.packages || [];
  });

  setBranch(index: number) {
      if (this.selectedBranchIndex() === index) return;
      // Blind Spot 1: Smooth transition
      this.isLoading.set(true);
      setTimeout(() => {
          this.selectedBranchIndex.set(index);
          this.isLoading.set(false);
      }, 400);
  }

  orderPackage(pkg: PackageItem) {
     const branch = this.config().branches[this.selectedBranchIndex()];
     const phone = this.configService.formatPhoneNumber(branch.whatsappNumber);
     const msg = `Halo Admin ${branch.name}, saya berminat pesan *${pkg.name}* seharga ${pkg.price}.\n\nMohon info ketersediaannya. Terima kasih.`;
     window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // Blind Spot 4: Share Functionality
  sharePackage(pkg: PackageItem) {
      const text = `Cek paket makan enak ini: ${pkg.name} (${pkg.price}) di ${this.config().global.logoText}!`;
      if (navigator.share) {
          navigator.share({ title: pkg.name, text: text, url: window.location.href });
      } else {
          navigator.clipboard.writeText(`${text} ${window.location.href}`);
          this.toastService.show('Link paket disalin!', 'success');
      }
  }

  // Blind Spot 2: Image Fallback
  handleImageError(event: any) {
      event.target.src = 'https://placehold.co/600x400/eee/999?text=Paket+Spesial';
  }
}
