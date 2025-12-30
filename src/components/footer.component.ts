
import { Component, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="border-t transition-colors duration-500"
      [style.backgroundColor]="config().footer.style.backgroundColor"
      [style.color]="config().footer.style.textColor"
      [style.borderColor]="config().footer.style.textColor + '20'"
      [style.fontFamily]="config().footer.style.fontFamily"
      [style.paddingTop]="config().footer.style.sectionPaddingY"
      [style.paddingBottom]="config().footer.style.sectionPaddingY"
    >
      <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start text-center md:text-left gap-8">
        
        <!-- Brand -->
        <div class="md:w-1/3">
          <h3 class="font-bold mb-2" [style.fontSize]="config().footer.style.titleFontSize">{{ config().global.logoText }}</h3>
          <p class="opacity-70 leading-relaxed whitespace-pre-line" [style.fontSize]="config().footer.style.bodyFontSize">
            {{ config().footer.description }}
          </p>
        </div>

        <!-- Branch Specific Links -->
        <div class="flex-1 w-full md:w-auto">
           <h4 class="font-bold text-lg mb-4 text-center md:text-left" [style.color]="config().footer.style.accentColor">Media Sosial Cabang</h4>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (branch of config().branches; track $index) {
                <div class="flex flex-col items-center md:items-start">
                   <h5 class="font-bold text-sm mb-1">{{ branch.name }}</h5>
                   <div class="flex gap-3 text-sm">
                      @if (branch.instagramLink) {
                        <a [href]="branch.instagramLink" target="_blank" class="hover:opacity-80 transition flex items-center gap-1" [style.color]="config().footer.style.accentColor">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                           Instagram
                        </a>
                      }
                      @if (branch.facebookLink) {
                        <a [href]="branch.facebookLink" target="_blank" class="hover:opacity-80 transition flex items-center gap-1" [style.color]="config().footer.style.accentColor">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                           FB
                        </a>
                      }
                      @if (branch.tiktokLink) {
                        <a [href]="branch.tiktokLink" target="_blank" class="hover:opacity-80 transition flex items-center gap-1" [style.color]="config().footer.style.accentColor">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                           TikTok
                        </a>
                      }
                   </div>
                </div>
              }
           </div>
        </div>

      </div>
      
      <div class="text-center mt-10 pt-6 border-t border-white/10 text-xs opacity-50">
          &copy; {{ year }} {{ config().global.logoText }}. {{ config().footer.copyrightText }}
      </div>
    </footer>
  `
})
export class FooterComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  year = new Date().getFullYear();
}
