
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="about" class="relative py-20 overflow-hidden"
      [style.backgroundColor]="config().about.style.backgroundColor"
      [style.color]="config().about.style.textColor"
      [style.fontFamily]="config().about.style.fontFamily"
    >
      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          
          <!-- Image Section -->
          <div class="relative order-2 md:order-1">
             <!-- Border Frame -->
             <div class="absolute top-4 left-4 w-full h-full border-2 rounded-2xl z-0 transform translate-x-2 translate-y-2"
                  [style.borderColor]="config().about.style.accentColor"></div>
             
             <!-- Main Image Container -->
             <div class="relative rounded-2xl overflow-hidden shadow-2xl h-[450px] bg-gray-200 z-10">
                @if (hasImage()) {
                   @if (isVideo(config().about.image)) {
                     <video [src]="config().about.image" autoplay muted loop playsinline class="w-full h-full object-cover"></video>
                   } @else {
                     <img [src]="config().about.image" alt="About" class="w-full h-full object-cover hover:scale-105 transition duration-700">
                   }
                }
             </div>
          </div>

          <!-- Content Section -->
          <div class="order-1 md:order-2">
            <!-- Dynamic Logo/Badge -->
            <div class="mb-6 inline-block">
              <span class="px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-2 inline-block"
                [style.backgroundColor]="config().about.style.accentColor + '20'" 
                [style.color]="config().about.style.accentColor"
              >
                Tentang Kami
              </span>
            </div>
            
            <h2 class="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                [style.color]="config().about.style.accentColor">
              {{ config().about.title }}
            </h2>
            
            <div class="prose leading-relaxed text-lg mb-8 text-justify opacity-80 whitespace-pre-line">
              <p>{{ config().about.description }}</p>
            </div>

            <!-- Stats Dynamic -->
            <div class="grid grid-cols-3 gap-4 border-t pt-8" [style.borderColor]="config().about.style.accentColor + '30'">
               <div class="text-center">
                  <span class="block text-2xl font-bold" [style.color]="config().about.style.accentColor">{{ config().about.stats.val1 }}</span>
                  <span class="text-xs uppercase tracking-wide font-bold opacity-60">{{ config().about.stats.label1 }}</span>
               </div>
               <div class="text-center">
                  <span class="block text-2xl font-bold" [style.color]="config().about.style.accentColor">{{ config().about.stats.val2 }}</span>
                  <span class="text-xs uppercase tracking-wide font-bold opacity-60">{{ config().about.stats.label2 }}</span>
               </div>
               <div class="text-center">
                  <span class="block text-2xl font-bold" [style.color]="config().about.style.accentColor">{{ config().about.stats.val3 }}</span>
                  <span class="text-xs uppercase tracking-wide font-bold opacity-60">{{ config().about.stats.label3 }}</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class AboutComponent {
  configService = inject(ConfigService);
  config = this.configService.config;

  hasImage = computed(() => {
    const img = this.config().about.image;
    return img && img.trim().length > 0;
  });

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }
}
