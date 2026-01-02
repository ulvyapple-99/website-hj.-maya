import { Component, inject, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section id="about" class="relative overflow-hidden print:bg-white print:text-black transition-colors duration-500"
      [style.backgroundColor]="config().about.style.backgroundColor"
      [style.color]="config().about.style.textColor"
      [style.fontFamily]="config().about.style.fontFamily"
      [style.paddingTop]="config().about.style.sectionPaddingY"
      [style.paddingBottom]="config().about.style.sectionPaddingY"
    >
      <!-- BS 14: Pattern Overlay (Reduced Opacity for Better Contrast) -->
      @if (config().about.showPattern) {
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none print:hidden" 
             style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 24px 24px;"></div>
      }

      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10" #contentSection [class.opacity-0]="!isVisible()" [class.translate-y-10]="!isVisible()" class="transition-all duration-1000 ease-out">
        <div class="grid md:grid-cols-2 gap-12 items-start md:items-center">
          
          <!-- === MEDIA SECTION === -->
          <div class="relative group print:hidden" 
              [class.order-2]="config().about.imagePosition === 'right'"
              [class.md:order-1]="config().about.imagePosition === 'left'"
              [class.md:order-2]="config().about.imagePosition === 'right'"
          >
             <!-- BS 12: Focus Indicator for Keyboard Users -->
             <div class="absolute top-4 left-4 w-full h-full border-2 z-0 transform translate-x-2 translate-y-2 transition duration-500 group-hover:translate-x-3 group-hover:translate-y-3"
                  [style.borderColor]="config().about.style.accentColor"
                  [style.borderRadius]="config().about.style.borderRadius"></div>
             
             <!-- BS 14: Aspect Ratio Container to prevent Layout Shift -->
             <div class="relative overflow-hidden shadow-2xl aspect-[4/5] md:aspect-square bg-gray-200 z-10 cursor-pointer"
                  [style.borderRadius]="config().about.style.borderRadius"
                  (click)="toggleLightbox()">
                
                <!-- BS 1: Skeleton Loader -->
                @if (isLoadingMedia()) {
                   <div class="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center">
                      <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   </div>
                }

                @if (hasImage()) {
                   <!-- BS 2: Fallback Logic -->
                   @if (isVideo(config().about.image) && !mediaError()) {
                     <video #videoPlayer 
                        [src]="config().about.image" 
                        autoplay muted loop playsinline 
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        (loadeddata)="onMediaLoad()"
                        (error)="onMediaError()"
                     ></video>
                     
                     <!-- BS 15: Gradient Overlay for Controls Contrast -->
                     <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

                     <!-- BS 3 & 4: Improved Controls with Large Touch Targets -->
                     <div class="absolute bottom-4 right-4 flex gap-2 z-20" (click)="$event.stopPropagation()">
                        <button (click)="togglePlay()" class="bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition active:scale-95" title="Play/Pause" aria-label="Play or Pause Video">
                           @if (isPlaying()) {
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           } @else {
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           }
                        </button>
                        <button (click)="toggleMute()" class="bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition active:scale-95" title="Mute/Unmute" aria-label="Mute or Unmute Video">
                           @if (isMuted()) {
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                           } @else {
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                           }
                        </button>
                     </div>
                   } @else {
                     <img [src]="config().about.image" 
                          [alt]="config().about.imageAlt" 
                          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          (load)="onMediaLoad()"
                          (error)="onMediaError()"
                     >
                     <!-- Zoom Icon Overlay -->
                     <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                     </div>
                   }
                }
             </div>
             
             <!-- BS 10: Glass Effect Card (Trusted Logos) -->
             @if (config().about.enableGlassEffect && config().about.trustedLogos.length > 0) {
                <div class="absolute -bottom-6 -left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg z-20 hidden md:block animate-float">
                   <p class="text-[10px] font-bold uppercase tracking-widest mb-2 text-white/80">Featured In</p>
                   <div class="flex gap-4">
                      @for (logo of config().about.trustedLogos; track $index) {
                         <img [src]="logo" class="h-8 w-auto opacity-80 hover:opacity-100 transition">
                      }
                   </div>
                </div>
             }
          </div>

          <!-- TEXT SECTION -->
          <div [class.order-1]="config().about.imagePosition === 'right'"
               [class.md:order-2]="config().about.imagePosition === 'left'"
               [class.md:order-1]="config().about.imagePosition === 'right'">
            
            <h2 class="font-bold mb-6 leading-tight"
                [style.fontFamily]="config().about.titleStyle.fontFamily"
                [style.fontSize]="config().about.titleStyle.fontSize"
                [style.color]="config().about.titleStyle.color">
              {{ config().about.title }}
            </h2>

            <!-- Decorative Line -->
            <div class="h-1 w-20 mb-8 rounded" [style.backgroundColor]="config().about.style.accentColor"></div>

            <div class="prose prose-lg mb-8 opacity-90 whitespace-pre-line"
                 [style.fontFamily]="config().about.descriptionStyle.fontFamily"
                 [style.fontSize]="config().about.descriptionStyle.fontSize"
                 [style.color]="config().about.descriptionStyle.color">
              {{ config().about.description }}
            </div>

            <!-- BS 4: Founder Quote -->
            @if (config().about.quote) {
               <div class="border-l-4 pl-4 py-2 mb-8 italic opacity-80"
                    [style.borderColor]="config().about.style.accentColor"
                    [style.color]="config().about.quoteStyle.color">
                  "{{ config().about.quote }}"
                  @if (config().about.founderName) {
                     <div class="mt-2 font-bold not-italic text-sm"
                        [style.color]="config().about.founderNameStyle.color">— {{ config().about.founderName }}</div>
                  }
               </div>
            }

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-6 mb-10 border-t border-b py-6" 
                 [style.borderColor]="config().about.style.textColor + '20'">
               <div class="text-center">
                  <div class="font-bold mb-1" 
                       [style.fontFamily]="config().about.statsStyle.fontFamily"
                       [style.fontSize]="config().about.statsStyle.fontSize"
                       [style.color]="config().about.statsStyle.color">{{ config().about.stats.val1 }}</div>
                  <div class="text-xs uppercase tracking-wider opacity-70"
                       [style.fontFamily]="config().about.statsLabelStyle.fontFamily"
                       [style.color]="config().about.statsLabelStyle.color">{{ config().about.stats.label1 }}</div>
               </div>
               <div class="text-center border-l border-r" [style.borderColor]="config().about.style.textColor + '20'">
                  <div class="font-bold mb-1" 
                       [style.fontFamily]="config().about.statsStyle.fontFamily"
                       [style.fontSize]="config().about.statsStyle.fontSize"
                       [style.color]="config().about.statsStyle.color">{{ config().about.stats.val2 }}</div>
                  <div class="text-xs uppercase tracking-wider opacity-70"
                       [style.fontFamily]="config().about.statsLabelStyle.fontFamily"
                       [style.color]="config().about.statsLabelStyle.color">{{ config().about.stats.label2 }}</div>
               </div>
               <div class="text-center">
                  <div class="font-bold mb-1" 
                       [style.fontFamily]="config().about.statsStyle.fontFamily"
                       [style.fontSize]="config().about.statsStyle.fontSize"
                       [style.color]="config().about.statsStyle.color">{{ config().about.stats.val3 }}</div>
                  <div class="text-xs uppercase tracking-wider opacity-70"
                       [style.fontFamily]="config().about.statsLabelStyle.fontFamily"
                       [style.color]="config().about.statsLabelStyle.color">{{ config().about.stats.label3 }}</div>
               </div>
            </div>

            <a [routerLink]="config().about.ctaLink" 
               class="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full transition transform hover:translate-x-2 shadow-lg hover:shadow-xl"
               [style.backgroundColor]="config().about.ctaStyle.backgroundColor"
               [style.color]="config().about.ctaStyle.color">
               {{ config().about.ctaText }}
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
               </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Lightbox Modal -->
      @if (showLightbox()) {
         <div class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" (click)="toggleLightbox()">
            <button class="absolute top-4 right-4 text-white hover:text-gray-300">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div class="max-w-5xl max-h-full w-full h-full flex items-center justify-center" (click)="$event.stopPropagation()">
               @if (isVideo(config().about.image)) {
                  <video [src]="config().about.image" controls autoplay class="max-w-full max-h-full rounded shadow-2xl"></video>
               } @else {
                  <img [src]="config().about.image" class="max-w-full max-h-full object-contain rounded shadow-2xl">
               }
            </div>
         </div>
      }
    </section>
  `,
  styles: [`
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  @ViewChild('contentSection') contentSection!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  isVisible = signal(false);
  isPlaying = signal(true);
  isMuted = signal(true);
  isLoadingMedia = signal(true);
  mediaError = signal(false);
  showLightbox = signal(false);
  
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit() {
    // Lazy load animation
    if (this.contentSection) {
       this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
             if (entry.isIntersecting) {
                this.isVisible.set(true);
                if (this.videoPlayer?.nativeElement) {
                    this.videoPlayer.nativeElement.play().catch(() => {});
                }
             } else {
                 // Optional: Pause video when out of view to save resources
                if (this.videoPlayer?.nativeElement) {
                    this.videoPlayer.nativeElement.pause();
                }
             }
          });
       }, { threshold: 0.2 });
       this.observer.observe(this.contentSection.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }

  isVideo(url: string) { return this.configService.isVideo(url); }
  hasImage() { return !!this.config().about.image; }
  
  onMediaLoad() { this.isLoadingMedia.set(false); }
  onMediaError() { this.isLoadingMedia.set(false); this.mediaError.set(true); }
  
  togglePlay() {
    const v = this.videoPlayer?.nativeElement;
    if (v) {
      if (v.paused) { v.play(); this.isPlaying.set(true); } 
      else { v.pause(); this.isPlaying.set(false); }
    }
  }
  
  toggleMute() {
    const v = this.videoPlayer?.nativeElement;
    if (v) { v.muted = !v.muted; this.isMuted.set(v.muted); }
  }

  toggleLightbox() {
    this.showLightbox.update(v => !v);
  }
}