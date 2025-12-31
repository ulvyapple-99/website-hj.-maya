
import { Component, inject, computed, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section id="about" class="relative overflow-hidden"
      [style.backgroundColor]="config().about.style.backgroundColor"
      [style.color]="config().about.style.textColor"
      [style.fontFamily]="config().about.style.fontFamily"
      [style.paddingTop]="config().about.style.sectionPaddingY"
      [style.paddingBottom]="config().about.style.sectionPaddingY"
    >
      <!-- BS 6: Pattern Overlay -->
      @if (config().about.showPattern) {
        <div class="absolute inset-0 opacity-5 pointer-events-none" 
             style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 24px 24px;"></div>
      }

      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10" [class.animate-on-scroll]="isVisible()">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          
          <!-- Image Section -->
          <div class="relative group" 
              [class.order-2]="config().about.imagePosition === 'right'"
              [class.md:order-1]="config().about.imagePosition === 'left'"
              [class.md:order-2]="config().about.imagePosition === 'right'"
          >
             <!-- Border Frame -->
             <div class="absolute top-4 left-4 w-full h-full border-2 z-0 transform translate-x-2 translate-y-2 transition duration-500 group-hover:translate-x-3 group-hover:translate-y-3"
                  [style.borderColor]="config().about.style.accentColor"
                  [style.borderRadius]="config().about.style.borderRadius"></div>
             
             <!-- Main Image Container -->
             <div class="relative overflow-hidden shadow-2xl h-[450px] bg-gray-200 z-10"
                  [style.borderRadius]="config().about.style.borderRadius">
                @if (hasImage()) {
                   @if (isVideo(config().about.image)) {
                     <video #videoPlayer [src]="config().about.image" autoplay muted loop playsinline class="w-full h-full object-cover"></video>
                     <!-- BS 5: Video Audio Control -->
                     <button (click)="toggleMute()" class="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition">
                        <svg *ngIf="isMuted()" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" stroke-miterlimit="10" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        <svg *ngIf="!isMuted()" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                     </button>
                   } @else {
                     <!-- BS 7: Dynamic Alt Text -->
                     <img [src]="config().about.image" [alt]="config().about.imageAlt || 'Tentang Kami'" class="w-full h-full object-cover hover:scale-105 transition duration-700">
                   }
                }
             </div>
          </div>

          <!-- Content Section -->
          <div 
              class="relative p-6 md:p-8 rounded-3xl transition-all duration-500"
              [class.bg-white-10]="config().about.enableGlassEffect"
              [class.backdrop-blur-md]="config().about.enableGlassEffect"
              [class.shadow-xl]="config().about.enableGlassEffect"
              [class.order-1]="config().about.imagePosition === 'right'"
              [class.md:order-2]="config().about.imagePosition === 'left'"
              [class.md:order-1]="config().about.imagePosition === 'right'"
          >
            <!-- Badge -->
            <div class="mb-4 inline-block">
              <span class="px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full inline-block shadow-sm"
                [style.backgroundColor]="config().about.style.accentColor" 
                [style.color]="'#fff'"
              >
                Tentang Kami
              </span>
            </div>
            
            <h2 class="font-bold mb-4 leading-tight"
                [style.fontFamily]="config().about.titleStyle.fontFamily"
                [style.fontSize]="config().about.titleStyle.fontSize"
                [style.color]="config().about.titleStyle.color">
              {{ config().about.title }}
            </h2>

            <!-- BS 9: Decorative Divider -->
            <div class="w-full h-px mb-6 flex items-center gap-4">
               <div class="h-0.5 w-16 rounded-full" [style.backgroundColor]="config().about.style.accentColor"></div>
               <div class="h-px flex-1 bg-current opacity-10"></div>
            </div>
            
            <!-- BS 8: Responsive Text Alignment -->
            <div class="prose leading-relaxed mb-8 text-left md:text-justify opacity-80 whitespace-pre-line"
                 [style.fontFamily]="config().about.descriptionStyle.fontFamily"
                 [style.fontSize]="config().about.descriptionStyle.fontSize"
                 [style.color]="config().about.descriptionStyle.color">
              <p>{{ config().about.description }}</p>
            </div>

            <!-- BS 4: Quote/Signature -->
            @if (config().about.quote) {
               <blockquote class="border-l-4 pl-4 mb-8 italic opacity-70" [style.borderColor]="config().about.style.accentColor">
                  "{{ config().about.quote }}"
                  @if (config().about.founderName) {
                     <footer class="mt-2 font-bold not-italic font-serif">- {{ config().about.founderName }}</footer>
                  }
               </blockquote>
            }

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 border-t border-b py-6 mb-8" [style.borderColor]="config().about.style.accentColor + '30'">
               <div class="text-center border-r border-gray-200/50 last:border-0">
                  <span class="block font-bold" 
                        [style.fontFamily]="config().about.statsStyle.fontFamily"
                        [style.fontSize]="config().about.statsStyle.fontSize"
                        [style.color]="config().about.statsStyle.color">{{ config().about.stats.val1 }}</span>
                  <span class="block text-[10px] uppercase tracking-wider font-bold opacity-60 mt-1"
                        [style.fontFamily]="config().about.statsLabelStyle.fontFamily"
                        [style.color]="config().about.statsLabelStyle.color">{{ config().about.stats.label1 }}</span>
               </div>
               <div class="text-center border-r border-gray-200/50 last:border-0">
                  <span class="block font-bold"
                        [style.fontFamily]="config().about.statsStyle.fontFamily"
                        [style.fontSize]="config().about.statsStyle.fontSize"
                        [style.color]="config().about.statsStyle.color">{{ config().about.stats.val2 }}</span>
                  <span class="block text-[10px] uppercase tracking-wider font-bold opacity-60 mt-1"
                        [style.fontFamily]="config().about.statsLabelStyle.fontFamily"
                        [style.color]="config().about.statsLabelStyle.color">{{ config().about.stats.label2 }}</span>
               </div>
               <div class="text-center">
                  <span class="block font-bold"
                        [style.fontFamily]="config().about.statsStyle.fontFamily"
                        [style.fontSize]="config().about.statsStyle.fontSize"
                        [style.color]="config().about.statsStyle.color">{{ config().about.stats.val3 }}</span>
                  <span class="block text-[10px] uppercase tracking-wider font-bold opacity-60 mt-1"
                        [style.fontFamily]="config().about.statsLabelStyle.fontFamily"
                        [style.color]="config().about.statsLabelStyle.color">{{ config().about.stats.label3 }}</span>
               </div>
            </div>

            <!-- BS 1: Call to Action -->
            <div class="flex flex-col sm:flex-row items-center gap-6">
                @if (config().about.ctaText) {
                   <a [routerLink]="config().about.ctaLink" 
                      class="px-8 py-3 rounded-full font-bold text-white shadow-lg transform transition hover:scale-105 active:scale-95"
                      [style.backgroundColor]="config().about.style.accentColor">
                      {{ config().about.ctaText }}
                   </a>
                }
                
                <!-- BS 2: Social Proof / Trusted Logos -->
                @if (config().about.trustedLogos && config().about.trustedLogos.length > 0) {
                   <div class="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 transition duration-500">
                      <span class="text-[10px] uppercase font-bold">Featured In:</span>
                      <div class="flex -space-x-2">
                         @for (logo of config().about.trustedLogos; track $index) {
                            <img [src]="logo" class="h-8 w-8 rounded-full border border-white bg-white object-contain" title="Featured Partner">
                         }
                      </div>
                   </div>
                }
            </div>

          </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    .bg-white-10 { background-color: rgba(255,255,255,0.7); }
    
    /* BS 3: Simple Entry Animation */
    .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 1s ease-out, transform 1s ease-out; }
    .animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
  `]
})
export class AboutComponent implements AfterViewInit {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  isMuted = signal(true);
  isVisible = signal(false);

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    // BS 3: Intersection Observer for Animation
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.isVisible.set(true);
        this.el.nativeElement.querySelector('.animate-on-scroll')?.classList.add('is-visible');
        observer.disconnect(); // Animate once
      }
    }, { threshold: 0.1 });
    
    const target = this.el.nativeElement.querySelector('.animate-on-scroll');
    if (target) observer.observe(target);
  }

  hasImage = computed(() => {
    const img = this.config().about.image;
    return img && img.trim().length > 0;
  });

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }

  toggleMute() {
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.muted = !this.videoPlayer.nativeElement.muted;
      this.isMuted.set(this.videoPlayer.nativeElement.muted);
    }
  }
}
