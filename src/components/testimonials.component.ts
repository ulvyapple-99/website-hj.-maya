import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-20 border-t"
      [style.backgroundColor]="config().testimonialsPage.style.backgroundColor"
      [style.color]="config().testimonialsPage.style.textColor"
      [style.paddingTop]="config().testimonialsPage.style.sectionPaddingY"
      [style.paddingBottom]="config().testimonialsPage.style.sectionPaddingY"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-12">
           <h2 class="text-3xl font-bold mb-4"
              [style.fontFamily]="config().testimonialsPage.titleStyle.fontFamily"
              [style.fontSize]="config().testimonialsPage.titleStyle.fontSize"
              [style.color]="config().testimonialsPage.titleStyle.color"
           >{{ config().testimonialsPage.title }}</h2>
           <p 
              [style.fontFamily]="config().testimonialsPage.subtitleStyle.fontFamily"
              [style.fontSize]="config().testimonialsPage.subtitleStyle.fontSize"
              [style.color]="config().testimonialsPage.subtitleStyle.color"
            >{{ config().testimonialsPage.subtitle }}</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           @for (review of config().testimonials; track $index) {
             <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 relative group"
                  [style.borderRadius]="config().testimonialsPage.style.borderRadius">
                <div class="text-4xl absolute top-4 right-6 font-serif" [style.color]="config().testimonialsPage.style.accentColor + '30'">"</div>
                
                <div class="flex items-center gap-1 mb-4">
                  @for (star of [1,2,3,4,5]; track star) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" 
                      [style.color]="star <= review.rating ? config().testimonialsPage.style.accentColor : '#e5e7eb'"
                      viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  }
                </div>

                <p class="mb-6 leading-relaxed italic relative z-10"
                   [style.color]="config().testimonialStyles?.reviewStyle?.color"
                   [style.fontFamily]="config().testimonialStyles?.reviewStyle?.fontFamily"
                   [style.fontSize]="config().testimonialStyles?.reviewStyle?.fontSize">
                   {{ review.text }}
                </p>

                <div class="flex items-center gap-4 mt-auto">
                   <div class="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm"
                      [style.backgroundColor]="config().testimonialsPage.style.accentColor">
                      {{ review.name.charAt(0) }}
                   </div>
                   <div>
                      <h4 class="font-bold text-sm"
                          [style.color]="config().testimonialStyles?.nameStyle?.color"
                          [style.fontFamily]="config().testimonialStyles?.nameStyle?.fontFamily"
                          [style.fontSize]="config().testimonialStyles?.nameStyle?.fontSize">
                          {{ review.name }}
                      </h4>
                      <p class="font-medium uppercase tracking-wide"
                         [style.color]="config().testimonialStyles?.roleStyle?.color"
                         [style.fontFamily]="config().testimonialStyles?.roleStyle?.fontFamily"
                         [style.fontSize]="config().testimonialStyles?.roleStyle?.fontSize">
                         {{ review.role }}
                      </p>
                   </div>
                </div>
             </div>
           }
        </div>

      </div>
    </section>
  `
})
export class TestimonialsComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
}
