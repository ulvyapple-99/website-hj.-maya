
import { Component, inject, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <section 
      class="relative overflow-hidden flex items-center justify-center transition-colors duration-500"
      [style.minHeight]="config().hero.height || '95vh'"
      [style.backgroundColor]="config().hero.style.backgroundColor"
      [style.color]="config().hero.style.textColor"
      [style.fontFamily]="config().hero.style.fontFamily"
    >
      <!-- Background overlay image with Parallax & Blur (BS 1, 2, 6, 9) -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 scale-110 will-change-transform" 
             [style.transform]="'translateY(' + scrollY() * 0.5 + 'px)'"
             [style.filter]="'blur(' + (config().hero.blurLevel || '0px') + ')'">
           
           @if (isVideo(config().hero.bgImage)) {
              <video 
                [src]="config().hero.bgImage" 
                [poster]="config().hero.fallbackImage" 
                autoplay muted loop playsinline
                class="w-full h-full object-cover"
                [style.opacity]="1 - config().hero.overlayOpacity"
                [style.objectPosition]="config().hero.bgPosition || 'center center'"
              ></video>
           } @else {
              <!-- BS 1: LCP Optimized (fetchpriority) -->
              <img [src]="config().hero.bgImage" 
                   fetchpriority="high"
                   decoding="async"
                   alt="Hero Background" 
                   class="w-full h-full object-cover" 
                   [style.opacity]="1 - config().hero.overlayOpacity"
                   [style.objectPosition]="config().hero.bgPosition || 'center center'">
           }
        </div>
        
        <!-- Gradient Overlay (BS 7) -->
        <div 
          class="absolute inset-0 z-10" 
          [style.background]="getGradientStyle()"
        ></div>
        <!-- Opacity Overlay -->
        <div class="absolute inset-0 bg-black z-10" [style.opacity]="config().hero.overlayOpacity"></div>
      </div>

      <div class="relative z-20 max-w-5xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col w-full"
           [class.items-center]="!config().hero.textAlign || config().hero.textAlign === 'center'"
           [class.items-start]="config().hero.textAlign === 'left'"
           [class.items-end]="config().hero.textAlign === 'right'"
           [class.text-center]="!config().hero.textAlign || config().hero.textAlign === 'center'"
           [class.text-left]="config().hero.textAlign === 'left'"
           [class.text-right]="config().hero.textAlign === 'right'">
           
        <!-- Badge -->
        <div class="mb-6 animate-fade-in-down opacity-0" style="animation-delay: 0.1s; animation-fill-mode: forwards;">
           <span class="px-5 py-2 rounded-full font-bold tracking-[0.25em] uppercase border border-white/40 backdrop-blur-md shadow-lg"
                 [style.color]="config().hero.badgeStyle.color"
                 [style.borderColor]="config().hero.badgeStyle.color"
                 [style.fontFamily]="config().hero.badgeStyle.fontFamily"
                 [style.fontSize]="config().hero.badgeStyle.fontSize">
              {{ config().hero.badgeText }}
           </span>
        </div>

        <!-- Title with Text Shadow (BS 5) -->
        <h1 class="font-bold tracking-tight mb-6 animate-fade-in-up leading-tight drop-shadow-2xl"
            [style.textShadow]="config().hero.textShadow || 'none'"
            [style.fontFamily]="config().hero.titleStyle.fontFamily"
            [style.fontSize]="config().hero.titleStyle.fontSize"
            [style.color]="config().hero.titleStyle.color">
          {{ config().hero.title }} <br/>
          <!-- Highlight -->
          <span class="text-transparent bg-clip-text"
                [style.fontFamily]="config().hero.highlightStyle.fontFamily"
                [style.fontSize]="config().hero.highlightStyle.fontSize"
                [style.color]="config().hero.highlightStyle.color"
                [style.backgroundImage]="config().hero.highlightStyle.color === 'inherit' ? 'linear-gradient(to right, ' + config().hero.style.accentColor + ', #FFD54F)' : 'none'">
            {{ config().hero.highlight }}
          </span>
        </h1>
        
        <div class="w-24 h-1.5 bg-white/60 mb-8 rounded-full animate-width-grow shadow-lg"
             [style.alignSelf]="config().hero.textAlign === 'left' ? 'flex-start' : (config().hero.textAlign === 'right' ? 'flex-end' : 'center')"></div>

        <!-- Subtitle with Text Shadow (BS 5) -->
        <p class="max-w-2xl mb-10 font-light animate-fade-in-up opacity-0 leading-relaxed drop-shadow-md" 
           [style.textShadow]="config().hero.textShadow || 'none'"
           [style.fontFamily]="config().hero.subtitleStyle.fontFamily"
           [style.fontSize]="config().hero.subtitleStyle.fontSize"
           [style.color]="config().hero.subtitleStyle.color"
           style="animation-delay: 0.3s; animation-fill-mode: forwards;">
          {{ config().hero.subtitle }}
        </p>
        
        <div class="flex flex-col sm:flex-row gap-5 animate-fade-in-up opacity-0 mb-8" 
             style="animation-delay: 0.5s; animation-fill-mode: forwards;"
             [class.justify-center]="!config().hero.textAlign || config().hero.textAlign === 'center'"
             [class.justify-start]="config().hero.textAlign === 'left'"
             [class.justify-end]="config().hero.textAlign === 'right'">
          
          <!-- Button 1 -->
          <a [routerLink]="config().hero.button1Link || '/menu'" 
             class="font-bold shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer no-underline border-none relative overflow-hidden group text-center"
             [style.fontFamily]="config().hero.button1Style.fontFamily"
             [style.fontSize]="config().hero.button1Style.fontSize"
             [style.color]="config().hero.button1Style.color"
             [style.backgroundColor]="config().hero.style.accentColor"
             [style.paddingTop]="config().hero.style.buttonPaddingY"
             [style.paddingBottom]="config().hero.style.buttonPaddingY"
             [style.paddingLeft]="config().hero.style.buttonPaddingX"
             [style.paddingRight]="config().hero.style.buttonPaddingX"
             [style.borderRadius]="config().hero.style.buttonRadius"
          >
            <span class="relative z-10">{{ config().hero.buttonText1 }}</span>
            <div class="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </a>
          
          <!-- Button 2 -->
          <a [routerLink]="config().hero.button2Link || '/reservation'" 
             class="font-bold transition-all transform hover:scale-105 cursor-pointer no-underline border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 hover:border-white text-center"
             [style.fontFamily]="config().hero.button2Style.fontFamily"
             [style.fontSize]="config().hero.button2Style.fontSize"
             [style.color]="config().hero.button2Style.color"
             [style.paddingTop]="config().hero.style.buttonPaddingY"
             [style.paddingBottom]="config().hero.style.buttonPaddingY"
             [style.paddingLeft]="config().hero.style.buttonPaddingX"
             [style.paddingRight]="config().hero.style.buttonPaddingX"
             [style.borderRadius]="config().hero.style.buttonRadius"
          >
            {{ config().hero.buttonText2 }}
          </a>
        </div>

        <!-- Social Proof Badge (BS 8) -->
        @if (config().hero.socialProofText) {
           <div class="animate-fade-in-up opacity-0 flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                style="animation-delay: 0.7s; animation-fill-mode: forwards;">
                <span class="text-yellow-400">★★★★★</span>
                <span class="text-xs font-bold text-white tracking-wide">{{ config().hero.socialProofText }}</span>
           </div>
        }
      </div>
      
      <!-- Interactive Scroll Indicator (BS 3) -->
      <div (click)="scrollToNext()"
           class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-60 z-20 text-white cursor-pointer hover:opacity-100 hover:scale-110 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  `,
  styles: [`
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes width-grow { from { width: 0; } to { width: 6rem; } }
    
    .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-fade-in-down { animation: fade-in-down 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-width-grow { animation: width-grow 1s ease-out forwards; animation-delay: 0.2s; }
  `]
})
export class HeroComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  scrollY = signal(0);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrollY.set(window.scrollY);
  }

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }

  scrollToNext() {
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: 'smooth'
    });
  }

  getGradientStyle(): string {
    const dir = this.config().hero.gradientDirection || 'radial';
    const color = this.config().hero.style.backgroundColor;
    
    if (dir === 'radial') {
      return `radial-gradient(circle at center, transparent 0%, ${color} 90%)`;
    } else if (dir === 'to bottom') {
      return `linear-gradient(to bottom, transparent 0%, ${color} 100%)`;
    } else if (dir === 'to top') {
      return `linear-gradient(to top, transparent 0%, ${color} 100%)`;
    } else {
      return `radial-gradient(circle at center, transparent 0%, ${color} 90%)`;
    }
  }
}
