import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-screen transition-colors duration-500"
      [style.backgroundColor]="config().locationPage.style.backgroundColor"
      [style.color]="config().locationPage.style.textColor"
      [style.fontFamily]="config().locationPage.style.fontFamily"
      [style.paddingTop]="config().locationPage.style.sectionPaddingY"
      [style.paddingBottom]="config().locationPage.style.sectionPaddingY"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-10">
          <span class="font-bold tracking-widest uppercase mb-2 block" 
                [style.fontFamily]="config().locationPage.labelStyle.fontFamily"
                [style.fontSize]="config().locationPage.labelStyle.fontSize"
                [style.color]="config().locationPage.labelStyle.color">Temukan Kami</span>
          <h2 class="font-bold mb-4" 
              [style.color]="config().locationPage.titleStyle.color"
              [style.fontFamily]="config().locationPage.titleStyle.fontFamily"
              [style.fontSize]="config().locationPage.titleStyle.fontSize">{{ config().locationPage.title }}</h2>
          <p class="opacity-70 max-w-2xl mx-auto"
             [style.color]="config().locationPage.subtitleStyle.color"
             [style.fontFamily]="config().locationPage.subtitleStyle.fontFamily"
             [style.fontSize]="config().locationPage.subtitleStyle.fontSize">
            {{ config().locationPage.subtitle }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (branch of config().branches; track $index) {
            <div class="p-6 border hover:bg-white/5 transition group flex flex-col h-full"
                 [style.borderColor]="config().locationPage.style.textColor + '20'"
                 [style.borderRadius]="config().locationPage.cardBorderRadius">
              
              <!-- Dynamic Branch Name Style -->
              <h4 class="font-bold mb-4" 
                  [style.fontFamily]="config().locationPage.branchNameStyle.fontFamily"
                  [style.fontSize]="config().locationPage.branchNameStyle.fontSize"
                  [style.color]="config().locationPage.branchNameStyle.color">
                  {{ branch.name }}
              </h4>
              
              <!-- Dynamic Branch Details Style -->
              <div class="space-y-4 mb-6 flex-grow"
                   [style.fontFamily]="config().locationPage.branchDetailStyle.fontFamily"
                   [style.fontSize]="config().locationPage.branchDetailStyle.fontSize"
                   [style.color]="config().locationPage.branchDetailStyle.color">
                <div class="flex items-start gap-3">
                   <span class="font-bold text-lg">📍</span>
                   <span class="pt-1">{{ branch.address }}</span>
                </div>
                <div class="flex items-center gap-3">
                   <span class="font-bold text-lg">📞</span>
                   <span>{{ branch.phone }}</span>
                </div>
                <div class="flex items-center gap-3">
                   <span class="font-bold text-lg">⏰</span>
                   <span>{{ branch.hours }}</span>
                </div>
                
                <!-- Social Media Links Per Branch -->
                @if (branch.instagramLink || branch.facebookLink || branch.tiktokLink) {
                  <div class="flex gap-3 pt-2">
                    @if (branch.instagramLink) {
                      <a [href]="branch.instagramLink" target="_blank" class="hover:opacity-80 transition flex items-center gap-1" [title]="branch.instagramLinkText || 'Instagram'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        <span>{{ branch.instagramLinkText || 'Instagram' }}</span>
                      </a>
                    }
                    @if (branch.facebookLink) {
                      <a [href]="branch.facebookLink" target="_blank" class="hover:opacity-80 transition" title="Facebook">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                      </a>
                    }
                    @if (branch.tiktokLink) {
                      <a [href]="branch.tiktokLink" target="_blank" class="hover:opacity-80 transition" title="TikTok">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                      </a>
                    }
                  </div>
                }
              </div>

              <!-- Maps Visual -->
              <div class="overflow-hidden relative shadow-inner bg-gray-800"
                   [style.height]="config().locationPage.mapHeight"
                   [style.borderRadius]="config().locationPage.cardBorderRadius">
                
                <!-- Slideshow images -->
                @for(imageId of branch.locationImages; track imageId; let i = $index) {
                  <img [src]="branchImageContent(imageId)" 
                      alt="{{branch.name}} location image {{i + 1}}" 
                      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                      [style.opacity]="currentSlideIndex(branch.id) === i ? 0.8 : 0">
                }
                @if (!branch.locationImages || branch.locationImages.length === 0) {
                  <div class="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                }

                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <a [href]="branch.googleMapsUrl" target="_blank" 
                     class="text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition transform hover:scale-105 shadow-lg flex items-center gap-2 pointer-events-auto"
                     [style.backgroundColor]="config().locationPage.style.accentColor">
                    Buka Google Maps
                  </a>
                </div>

                <!-- Dots -->
                @if (branch.locationImages && branch.locationImages.length > 1) {
                  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                    @for(imageId of branch.locationImages; track imageId; let i = $index) {
                      <button (click)="setSlide(branch.id, i)" 
                              class="w-2 h-2 rounded-full transition"
                              [class.bg-white]="currentSlideIndex(branch.id) === i"
                              [class.bg-white/50]="currentSlideIndex(branch.id) !== i"
                              [attr.aria-label]="'Go to slide ' + (i + 1)"></button>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class LocationComponent implements OnInit, OnDestroy {
  configService = inject(ConfigService);
  config = this.configService.config;

  slideIndices = signal(new Map<string, number>());
  private slideInterval: any;

  constructor() {
    effect(() => {
      const branches = this.config().branches;
      const newMap = new Map<string, number>();
      branches.forEach(b => {
        newMap.set(b.id, 0);
      });
      this.slideIndices.set(newMap);
      this.setupInterval();
    });
  }

  ngOnInit() {
    this.setupInterval();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  setupInterval() {
    if (this.slideInterval) clearInterval(this.slideInterval);
    
    this.slideInterval = setInterval(() => {
      const branchesWithImages = this.config().branches.filter(b => b.locationImages && b.locationImages.length > 1);
      if (branchesWithImages.length > 0) {
        // FIX: Explicitly type the 'currentMap' parameter to ensure correct type inference for 'currentIndex'.
        this.slideIndices.update((currentMap: Map<string, number>) => {
          const newMap = new Map(currentMap);
          branchesWithImages.forEach(branch => {
            const currentIndex = newMap.get(branch.id) ?? 0;
            const nextIndex = (currentIndex + 1) % (branch.locationImages?.length || 1);
            newMap.set(branch.id, nextIndex);
          });
          return newMap;
        });
      }
    }, 5000);
  }

  currentSlideIndex(branchId: string): number {
    return this.slideIndices().get(branchId) ?? 0;
  }

  setSlide(branchId: string, index: number) {
    this.slideIndices.update(currentMap => {
      const newMap = new Map(currentMap);
      newMap.set(branchId, index);
      return newMap;
    });
    this.setupInterval();
  }

  branchImageContent(id: string): string {
    return this.configService.branchImagesContent().get(id) || '';
  }
}
