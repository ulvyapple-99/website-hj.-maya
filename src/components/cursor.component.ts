
import { Component, signal, HostListener, inject, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

interface SatePart {
  x: number;
  y: number;
}

@Component({
  selector: 'app-cursor',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (config().features.enableCursor) {
      <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] overflow-hidden">
        
        <!-- BAGIAN DAGING SATE (Ekor) -->
        <!-- Kita render dari belakang ke depan agar tumpukannya benar -->
        @for (i of meatIndices; track i) {
          <div #meatPart 
               class="absolute w-8 h-7 rounded-lg shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 will-change-transform border border-black/10"
               [style.backgroundColor]="getMeatColor(i)"
               [style.zIndex]="100 - i">
               <!-- Efek Bakaran / Gosong -->
               <div class="absolute w-full h-px bg-black/30 rotate-12 top-2"></div>
               <div class="absolute w-full h-px bg-black/30 -rotate-6 bottom-2"></div>
               <!-- Tusuk Sate di tengah daging -->
               <div class="absolute w-1 h-full bg-[#D7CCC8]"></div>
          </div>
        }

        <!-- BAGIAN UJUNG TUSUK (Kepala Kursor) -->
        <div #stickTip
             class="absolute w-1.5 h-10 bg-[#D7CCC8] rounded-full transform -translate-x-1/2 -translate-y-1/2 origin-bottom will-change-transform shadow-sm z-[110]">
             <!-- Ujung runcing visual -->
             <div class="absolute -top-1 left-0 w-1.5 h-2 bg-[#D7CCC8] rounded-t-full"></div>
        </div>

      </div>
    }
  `,
  styles: [`
    :host {
      pointer-events: none;
      display: block;
    }
  `]
})
export class CursorComponent implements OnInit, OnDestroy {
  configService = inject(ConfigService);
  config = this.configService.config;
  ngZone = inject(NgZone);

  // Setup Fisika Sate
  // 0 = daging paling depan (dekat mouse), 4 = daging paling belakang
  meatCount = 5;
  meatIndices = [4, 3, 2, 1, 0]; // Render order reversed for visual stacking logic if needed, but flex handles z-index
  
  // Posisi Mouse Target
  mouseX = signal(-100);
  mouseY = signal(-100);

  // Posisi Aktual setiap bagian (x, y)
  parts: SatePart[] = [];
  
  // Referensi DOM untuk animasi performa tinggi (menghindari Angular Change Detection di loop)
  @ViewChildren('meatPart') meatElements!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('stickTip') stickElement!: QueryList<ElementRef<HTMLDivElement>>;

  private animationId: number | null = null;

  constructor() {
    // Inisialisasi posisi awal di luar layar
    for (let i = 0; i < this.meatCount; i++) {
      this.parts.push({ x: -100, y: -100 });
    }
  }

  ngOnInit() {
    // Jalankan loop animasi di luar zona Angular agar tidak memicu re-render seluruh aplikasi setiap frame
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        this.updatePositions();
        this.animationId = requestAnimationFrame(loop);
      };
      loop();
    });
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.mouseX.set(e.clientX);
    this.mouseY.set(e.clientY);
  }

  updatePositions() {
    const targetX = this.mouseX();
    const targetY = this.mouseY();
    
    // Update posisi elemen stick/ujung (mengikuti mouse langsung tapi sedikit smooth)
    if (this.stickElement && this.stickElement.first) {
      const el = this.stickElement.first.nativeElement;
      // Rotasi stick berdasarkan gerakan (opsional, untuk saat ini tegak lurus mengikuti arah sate)
      // Kita buat stick mengarah ke daging pertama
      let angle = 0;
      if (this.parts.length > 0) {
        const dx = targetX - this.parts[0].x;
        const dy = targetY - this.parts[0].y;
        angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; 
      }
      
      el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) rotate(${angle}deg)`;
    }

    // Update posisi daging (Meliuk-liuk Logic)
    // Setiap bagian mengikuti bagian sebelumnya dengan delay (lerp)
    
    // Daging pertama mengikuti mouse
    this.parts[0].x += (targetX - this.parts[0].x) * 0.3; // Speed 0.3
    this.parts[0].y += (targetY - this.parts[0].y) * 0.3;

    // Daging sisanya mengikuti daging di depannya
    for (let i = 1; i < this.parts.length; i++) {
      const leader = this.parts[i - 1];
      const follower = this.parts[i];

      const dx = leader.x - follower.x;
      const dy = leader.y - follower.y;
      
      // Jarak antar daging (biar tidak numpuk total)
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = 20; // Jarak tusukan

      // Logika "Tarik" seperti tali/sate
      if (distance > minDistance) {
         // Follower bergerak mendekati leader sampai jarak minDistance
         const ratio = (distance - minDistance) / distance;
         const moveX = dx * ratio * 0.5; // Stiffness 0.5
         const moveY = dy * ratio * 0.5;
         
         follower.x += moveX;
         follower.y += moveY;
      } else {
         // Lerp biasa untuk smoothing saat diam
         follower.x += dx * 0.2;
         follower.y += dy * 0.2;
      }
    }

    // Render ke DOM
    if (this.meatElements) {
      const elements = this.meatElements.toArray();
      // Kita perlu map index array parts ke elements. 
      // Karena di template kita loop reversed (meatIndices), kita perlu hati-hati.
      // meatIndices = [4, 3, 2, 1, 0]. Element 0 di QueryList adalah index 4 di logic kita?
      // Tidak, QueryList urut sesuai DOM. DOM urut sesuai meatIndices loop.
      // Jadi Element[0] adalah meatIndices[0] yaitu index 4 (Ekor).
      
      elements.forEach((el, index) => {
        // meatIndices[index] memberikan index "logika" sate (0 = kepala, 4 = ekor)
        const logicIndex = this.meatIndices[index];
        const part = this.parts[logicIndex];

        // Hitung rotasi agar daging tegak lurus dengan tusuknya
        let angle = 0;
        if (logicIndex > 0) {
            // Lihat ke daging depannya
            const prev = this.parts[logicIndex - 1];
            angle = Math.atan2(part.y - prev.y, part.x - prev.x) * (180 / Math.PI) + 90;
        } else {
            // Daging pertama lihat ke mouse
            angle = Math.atan2(part.y - targetY, part.x - targetX) * (180 / Math.PI) + 90;
        }

        el.nativeElement.style.transform = `translate3d(${part.x}px, ${part.y}px, 0) rotate(${angle}deg)`;
      });
    }
  }

  // Warna gradasi daging matang
  getMeatColor(i: number): string {
    const colors = [
      '#5D4037', // Brown 700
      '#4E342E', // Brown 800
      '#3E2723', // Brown 900
      '#5D4037', 
      '#6D4C41'  // Brown 600
    ];
    return colors[i % colors.length];
  }
}
