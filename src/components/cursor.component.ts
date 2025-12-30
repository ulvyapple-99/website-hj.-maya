
import { Component, signal, HostListener, inject, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

interface SatePart {
  x: number;
  y: number;
  angle: number;
}

@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (config().features.enableCursor) {
      <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] overflow-hidden">
        
        <!-- VISUAL SATE -->
        <!-- Loop render daging + tusuk sekaligus agar menyatu -->
        @for (part of parts; track $index) {
          <div #meatPart 
               class="absolute w-5 h-4 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 will-change-transform"
               [style.zIndex]="100 - $index">
               
               <!-- 1. TUSUK BAMBU (Lidi) -->
               <!-- Dirender DI DALAM div daging agar bergerak sinkron 100% -->
               <!-- Ukuran diperkecil: w-1 -->
               <div class="absolute w-1 bg-[#D7CCC8] left-1/2 -translate-x-1/2 shadow-sm"
                    [ngClass]="{
                      'rounded-t-full': $index === 0,
                      '-top-3 h-[180%]': $index === 0, 
                      '-top-1.5 h-[200%]': $index > 0 && $index < parts.length - 1,
                      '-top-1.5 h-[300%]': $index === parts.length - 1
                    }">
               </div>

               <!-- 2. DAGING (Meat) -->
               <!-- Menutupi tusuk bambu -->
               <div class="relative z-10 w-full h-full shadow-md overflow-hidden border border-black/20"
                    [style.backgroundColor]="getMeatColor($index)"
                    style="border-radius: 35% 55% 50% 45% / 45% 50% 60% 50%;"> <!-- Bentuk Organic -->
                    
                    <!-- Detail: Gosong / Bakaran (Diperkecil) -->
                    <div class="absolute w-2.5 h-2.5 bg-black/30 rounded-full blur-[2px] -top-1 -right-1"></div>
                    <div class="absolute w-full h-px bg-black/20 bottom-1.5 rotate-12"></div>
                    <div class="absolute w-1.5 h-1.5 bg-black/20 rounded-full blur-[1px] bottom-0.5 left-0.5"></div>
               </div>
          </div>
        }

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

  // KONFIGURASI FISIKA
  meatCount = 5; 
  spacing = 6;  // Jarak diperkecil menyesuaikan ukuran daging baru
  stiffness = 0.45; 
  
  // Posisi Mouse
  mouseX = signal(-100);
  mouseY = signal(-100);

  // State Fisika
  parts: SatePart[] = [];
  time = 0; // Untuk animasi goyang

  @ViewChildren('meatPart') meatElements!: QueryList<ElementRef<HTMLDivElement>>;

  private animationId: number | null = null;

  constructor() {
    // Inisialisasi posisi awal di luar layar
    for (let i = 0; i < this.meatCount; i++) {
      this.parts.push({ x: -100, y: -100, angle: 0 });
    }
  }

  ngOnInit() {
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
    this.time += 0.25; // Kecepatan getar api/bara

    const targetX = this.mouseX();
    const targetY = this.mouseY();

    // --- 1. UPDATE FISIKA (Snake Logic) ---
    
    // Head (Daging paling atas) mengejar mouse
    const head = this.parts[0];
    const dx = targetX - head.x;
    const dy = targetY - head.y;
    
    // Gerakan smooth menuju mouse
    head.x += dx * this.stiffness;
    head.y += dy * this.stiffness;

    // Kalkulasi intensitas goyang berdasarkan kecepatan gerak
    const speed = Math.sqrt(dx*dx + dy*dy);
    const wiggleIntensity = Math.min(speed * 0.08, 2.5);

    // Loop bagian tubuh (sisa daging)
    for (let i = 1; i < this.parts.length; i++) {
      const current = this.parts[i];
      const prev = this.parts[i - 1];

      const dxPart = prev.x - current.x;
      const dyPart = prev.y - current.y;
      const dist = Math.sqrt(dxPart*dxPart + dyPart*dyPart);
      const angle = Math.atan2(dyPart, dxPart);

      // Constraint Jarak (agar menyatu seperti ditusuk)
      if (dist > this.spacing) {
         const tx = prev.x - Math.cos(angle) * this.spacing;
         const ty = prev.y - Math.sin(angle) * this.spacing;
         
         // Interpolasi posisi (follow leader)
         current.x += (tx - current.x) * 0.65;
         current.y += (ty - current.y) * 0.65;
      }

      // EFEK GOYANG (JIGGLE) KE ATAS & BAWAH
      // Gelombang sinus offset per index
      const wave = Math.sin(this.time + (i * 0.6)) * wiggleIntensity;
      
      // Aplikasikan goyang tegak lurus arah gerakan
      current.x += Math.cos(angle + Math.PI/2) * wave * 0.15;
      current.y += Math.sin(angle + Math.PI/2) * wave * 0.15;

      // Update angle visual agar tegak lurus terhadap "tali" imajiner
      current.angle = angle * (180 / Math.PI) + 90;
    }
    
    // Update angle head mengikuti body di belakangnya agar natural
    if (this.parts.length > 1) {
        head.angle = this.parts[1].angle;
    }

    // --- 2. RENDER KE DOM ---
    if (this.meatElements) {
      const elements = this.meatElements.toArray();
      elements.forEach((el, i) => {
        const part = this.parts[i];
        
        // Random rotation kecil agar daging terlihat tidak seragam/kaku
        // Index genap miring kiri, ganjil miring kanan
        const organicRot = (i % 2 === 0 ? 3 : -3); 
        
        el.nativeElement.style.transform = `translate3d(${part.x}px, ${part.y}px, 0) rotate(${part.angle + organicRot}deg)`;
      });
    }
  }

  getMeatColor(i: number): string {
    const colors = [
      '#4E342E', // Brown 800 (Gosong dikit)
      '#5D4037', // Brown 700
      '#3E2723', // Brown 900 (Sangat matang)
      '#6D4C41', // Brown 600
      '#4E342E'  
    ];
    return colors[i % colors.length];
  }
}
