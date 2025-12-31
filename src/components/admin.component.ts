
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem, Branch, Testimonial, FirebaseConfig, PackageItem } from '../services/config.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Trigger Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-all border-2 border-white/20 group"
      title="Admin Dashboard"
    >
      @if (firestoreError()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
      }
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Upload Loading Overlay -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center flex-col text-white">
         <div class="w-16 h-16 border-4 border-t-orange-500 border-gray-600 rounded-full animate-spin mb-4"></div>
         <p class="font-bold tracking-widest uppercase">Mengunggah...</p>
      </div>
    }

    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] bg-[#F3F4F6] font-sans text-gray-800 flex overflow-hidden animate-fade-in">
        
        <!-- LOGIN OVERLAY -->
        @if (!isAuthenticated()) {
           <div class="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-4">
              <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                  <div class="bg-orange-600 p-8 text-center">
                    <h2 class="text-2xl font-bold text-white">Admin Portal</h2>
                    <p class="text-orange-100 text-sm">Masuk untuk mengelola website</p>
                  </div>
                  <div class="p-8 space-y-6">
                    <div class="space-y-4">
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                          <input type="email" [(ngModel)]="emailInput" class="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition">
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                          <input type="password" [(ngModel)]="passwordInput" class="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition">
                        </div>
                    </div>
                    <button (click)="login()" [disabled]="isLoggingIn()" class="w-full bg-gray-900 text-white font-bold py-3.5 rounded-lg hover:bg-black transition disabled:opacity-50">
                       {{ isLoggingIn() ? 'Memproses...' : 'Masuk' }}
                    </button>
                    @if (loginError()) { <p class="text-red-500 text-center text-sm">{{ loginError() }}</p> }
                    <button (click)="togglePanel()" class="w-full text-sm text-gray-500 hover:underline text-center">Batal</button>
                  </div>
              </div>
           </div>
        } 
        
        <!-- DASHBOARD CONTENT -->
        @else {
          <!-- SIDEBAR -->
          <aside class="w-64 bg-[#111827] text-gray-400 flex flex-col h-full flex-shrink-0 border-r border-gray-800">
             <div class="h-16 flex items-center px-6 border-b border-gray-800 bg-[#0B0F19]">
                <span class="font-bold text-white text-lg tracking-wide">CMS Panel</span>
             </div>
             
             <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                @for (tab of tabs; track tab.id) {
                   <button (click)="currentTab.set(tab.id)"
                     class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                     [class.bg-orange-600]="currentTab() === tab.id"
                     [class.text-white]="currentTab() === tab.id"
                     [class.hover:bg-gray-800]="currentTab() !== tab.id">
                      <span class="text-lg w-6 text-center">{{ tab.icon }}</span>
                      <span>{{ tab.label }}</span>
                   </button>
                }
             </nav>
             <div class="p-4 border-t border-gray-800">
                <button (click)="logout()" class="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold transition">Log Out</button>
             </div>
          </aside>

          <!-- MAIN AREA -->
          <main class="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB] relative">
             <header class="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8 z-10">
                <div>
                  <h1 class="text-xl font-bold text-gray-900">{{ getActiveTabLabel() }}</h1>
                  <p class="text-xs text-gray-500">Kelola pengaturan website Anda secara real-time</p>
                </div>
                <div class="flex items-center gap-3">
                   <button (click)="saveChanges()" class="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      Simpan
                   </button>
                   <button (click)="togglePanel()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-xl">✕</button>
                </div>
             </header>

             <!-- CONTENT SCROLL -->
             <div class="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32">
                <div class="max-w-5xl mx-auto space-y-8">
                   
                   <!-- === GLOBAL & INTRO === -->
                   @if (currentTab() === 'global') {
                      <div class="admin-card">
                         <div class="admin-card-header bg-red-50 text-red-800 border-red-200">
                            <span class="flex items-center gap-2">⚠️ Emergency & Maintenance</span>
                         </div>
                         <div class="p-6">
                            <label class="flex items-center gap-2 cursor-pointer">
                               <input type="checkbox" [(ngModel)]="config().global.maintenanceMode" class="w-5 h-5 text-red-600 rounded">
                               <span class="font-bold text-red-600">Aktifkan Maintenance Mode (Tutup Website Sementara)</span>
                            </label>
                            <p class="text-xs text-gray-500 mt-1 pl-7">Admin panel akan tetap bisa diakses melalui tombol rahasia.</p>
                         </div>
                      </div>

                      <div class="admin-card">
                         <div class="admin-card-header">General & SEO</div>
                         <div class="p-6 grid grid-cols-2 gap-4">
                           <div><label class="form-label">Nama Website</label><input [(ngModel)]="config().global.logoText" class="form-input"></div>
                           
                           <!-- RESTORED: Logo Upload -->
                           <div>
                              <label class="form-label">Logo Image (Upload)</label>
                              <div class="flex items-center gap-2">
                                <input type="file" (change)="onFileSelected($event, 'logoImage')" class="form-input text-xs">
                                @if(config().global.logoImage) {
                                    <div class="h-10 w-10 border rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <img [src]="config().global.logoImage" class="w-full h-full object-contain">
                                    </div>
                                }
                              </div>
                           </div>

                           <div><label class="form-label">Favicon (Upload)</label><input type="file" (change)="onFileSelected($event, 'favicon')" class="form-input text-xs"></div>
                           <div class="col-span-2">
                             <label class="form-label">Meta Description (SEO)</label>
                             <textarea [(ngModel)]="config().global.metaDescription" class="form-input h-20" placeholder="Deskripsi singkat untuk Google..."></textarea>
                           </div>
                           <div class="col-span-2">
                             <label class="form-label">Meta Keywords (SEO)</label>
                             <input [(ngModel)]="config().global.metaKeywords" class="form-input" placeholder="sate, enak, cimahi, kuliner (pisahkan koma)">
                           </div>
                         </div>
                      </div>

                      <div class="admin-card">
                         <div class="admin-card-header">UX & Floating Features</div>
                         <div class="p-6 grid grid-cols-2 gap-4">
                            <div>
                               <label class="form-label">Scrollbar Color</label>
                               <div class="flex items-center gap-2">
                                  <input type="color" [(ngModel)]="config().global.scrollbarColor" class="h-10 w-10 p-0 border-0">
                                  <input type="text" [(ngModel)]="config().global.scrollbarColor" class="form-input">
                               </div>
                            </div>
                            <div>
                               <label class="form-label">Floating WhatsApp Number</label>
                               <input type="text" [(ngModel)]="config().global.floatingWhatsapp" class="form-input" placeholder="62812345678">
                            </div>
                            <div class="col-span-2">
                               <label class="flex items-center gap-2">
                                  <input type="checkbox" [(ngModel)]="config().global.enableSmoothScroll"> 
                                  <span class="text-sm">Aktifkan Smooth Scrolling</span>
                               </label>
                            </div>
                         </div>
                      </div>

                      <div class="admin-card">
                         <div class="admin-card-header">Advanced Injection</div>
                         <div class="p-6 space-y-4">
                            <div>
                               <label class="form-label">Custom CSS</label>
                               <textarea [(ngModel)]="config().global.customCss" class="form-input h-24 font-mono text-xs" placeholder=".my-class { color: red; }"></textarea>
                            </div>
                            <div>
                               <label class="form-label">Custom JS (Analytics/Pixel)</label>
                               <textarea [(ngModel)]="config().global.customJs" class="form-input h-24 font-mono text-xs" placeholder="console.log('Loaded');"></textarea>
                            </div>
                         </div>
                      </div>

                      <div class="admin-card">
                         <div class="admin-card-header">Intro Video</div>
                         <div class="p-6">
                            <label class="flex items-center gap-2 mb-4"><input type="checkbox" [(ngModel)]="config().intro.enabled"> Aktifkan Intro</label>
                            @if(config().intro.enabled){
                              <div class="grid grid-cols-2 gap-4">
                                 <div><label class="form-label">Upload Video</label><input type="file" (change)="onFileSelected($event, 'introVideo')" accept="video/*" class="form-input"></div>
                                 <div><label class="form-label">Durasi (Detik)</label><input type="number" [(ngModel)]="config().intro.duration" class="form-input"></div>
                              </div>
                            }
                         </div>
                      </div>
                   }

                   <!-- === HERO === -->
                   @if (currentTab() === 'hero') {
                      <div class="admin-card">
                         <div class="admin-card-header">Hero Banner</div>
                         <div class="p-6 space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                               <div>
                                  <label class="form-label">Background Image</label>
                                  <input type="file" (change)="onFileSelected($event, 'heroBg')" class="form-input mb-2">
                                  <img [src]="config().hero.bgImage" class="h-20 object-cover rounded bg-gray-200">
                               </div>
                               <div>
                                  <label class="form-label">Fallback Image (Untuk Video)</label>
                                  <input type="file" (change)="onFileSelected($event, 'heroFallback')" class="form-input mb-2">
                                  <img [src]="config().hero.fallbackImage" class="h-20 object-cover rounded bg-gray-200" *ngIf="config().hero.fallbackImage">
                               </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                              <div><label class="form-label">Judul Besar</label><input [(ngModel)]="config().hero.title" class="form-input"></div>
                              <div><label class="form-label">Teks Highlight (Warna)</label><input [(ngModel)]="config().hero.highlight" class="form-input"></div>
                              <div class="col-span-2"><label class="form-label">Sub-Judul</label><textarea [(ngModel)]="config().hero.subtitle" class="form-input"></textarea></div>
                              <div class="col-span-2"><label class="form-label">Social Proof Badge (e.g. ⭐ 4.8/5)</label><input [(ngModel)]="config().hero.socialProofText" class="form-input"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 border-t pt-4">
                               <div><label class="form-label">Tombol 1 Text</label><input [(ngModel)]="config().hero.buttonText1" class="form-input"></div>
                               <div><label class="form-label">Tombol 1 Link</label><input [(ngModel)]="config().hero.button1Link" class="form-input"></div>
                               <div><label class="form-label">Tombol 2 Text</label><input [(ngModel)]="config().hero.buttonText2" class="form-input"></div>
                               <div><label class="form-label">Tombol 2 Link</label><input [(ngModel)]="config().hero.button2Link" class="form-input"></div>
                            </div>
                         </div>
                      </div>
                      <div class="admin-card">
                         <div class="admin-card-header">Styling & Layout (Advanced)</div>
                         <div class="p-6 grid grid-cols-3 gap-4">
                            <div><label class="form-label">Section Height</label><input [(ngModel)]="config().hero.height" class="form-input" placeholder="95vh"></div>
                            <div><label class="form-label">Background Position</label>
                                <select [(ngModel)]="config().hero.bgPosition" class="form-select">
                                    <option value="center center">Center</option>
                                    <option value="top center">Top</option>
                                    <option value="bottom center">Bottom</option>
                                </select>
                            </div>
                            <div><label class="form-label">Blur Level</label><input [(ngModel)]="config().hero.blurLevel" class="form-input" placeholder="0px"></div>
                            
                            <div><label class="form-label">Gradient Direction</label>
                                <select [(ngModel)]="config().hero.gradientDirection" class="form-select">
                                    <option value="radial">Radial</option>
                                    <option value="to bottom">Top to Bottom</option>
                                    <option value="to top">Bottom to Top</option>
                                </select>
                            </div>
                            <div><label class="form-label">Text Shadow</label><input [(ngModel)]="config().hero.textShadow" class="form-input" placeholder="2px 2px 4px black"></div>
                            <div><label class="form-label">Text Align</label><select [(ngModel)]="config().hero.textAlign" class="form-select"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                            
                            <div><label class="form-label">Overlay Opacity</label><input type="number" step="0.1" max="1" [(ngModel)]="config().hero.overlayOpacity" class="form-input"></div>
                            <div><label class="form-label">Accent Color</label><input type="color" [(ngModel)]="config().hero.style.accentColor" class="h-10 w-full"></div>
                            <div><label class="form-label">Bg Color (Backup)</label><input type="color" [(ngModel)]="config().hero.style.backgroundColor" class="h-10 w-full"></div>
                         </div>
                      </div>
                   }

                   <!-- === ABOUT === -->
                   @if (currentTab() === 'about') {
                      <div class="admin-card">
                         <div class="admin-card-header">Tentang Kami</div>
                         <div class="p-6 space-y-4">
                            <div><label class="form-label">Judul</label><input [(ngModel)]="config().about.title" class="form-input"></div>
                            <div><label class="form-label">Deskripsi</label><textarea [(ngModel)]="config().about.description" class="form-input h-32"></textarea></div>
                            <div><label class="form-label">Gambar Utama</label><input type="file" (change)="onFileSelected($event, 'aboutImage')" class="form-input"></div>
                            <div class="grid grid-cols-3 gap-4 border-t pt-4">
                               <div><label class="form-label">Stat 1 Angka</label><input [(ngModel)]="config().about.stats.val1" class="form-input"></div>
                               <div><label class="form-label">Stat 1 Label</label><input [(ngModel)]="config().about.stats.label1" class="form-input"></div>
                               <div class="row-span-3 flex items-center justify-center"><div class="text-xs text-gray-500">Edit 3 statistik utama</div></div>
                               <div><label class="form-label">Stat 2 Angka</label><input [(ngModel)]="config().about.stats.val2" class="form-input"></div>
                               <div><label class="form-label">Stat 2 Label</label><input [(ngModel)]="config().about.stats.label2" class="form-input"></div>
                               <div><label class="form-label">Stat 3 Angka</label><input [(ngModel)]="config().about.stats.val3" class="form-input"></div>
                               <div><label class="form-label">Stat 3 Label</label><input [(ngModel)]="config().about.stats.label3" class="form-input"></div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- === MENU === -->
                   @if (currentTab() === 'menu') {
                      <div class="admin-card">
                         <div class="admin-card-header flex justify-between">
                            <span>Manajemen Menu</span>
                            <div class="flex gap-2">
                               <select [(ngModel)]="selectedBranchIndex" class="form-select w-40 h-8 py-0 text-xs">
                                  @for (b of config().branches; track $index) { <option [value]="$index">{{ b.name }}</option> }
                               </select>
                               <button (click)="addMenuItem()" class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">+ Item</button>
                            </div>
                         </div>
                         <div class="p-6 space-y-6">
                            @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                               <div class="border rounded-lg p-4 bg-gray-50 relative group">
                                  <button (click)="removeMenuItem($index)" class="absolute top-2 right-2 text-red-500 font-bold hover:scale-110">✕</button>
                                  <div class="grid md:grid-cols-4 gap-4">
                                     <div class="col-span-1">
                                        <div class="w-full h-24 bg-gray-200 rounded mb-2 overflow-hidden">
                                           <img [src]="item.image" class="w-full h-full object-cover">
                                        </div>
                                        <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="text-[10px] w-full">
                                     </div>
                                     <div class="col-span-3 grid grid-cols-2 gap-3">
                                        <div><label class="form-label">Nama Menu</label><input [(ngModel)]="item.name" class="form-input"></div>
                                        <div><label class="form-label">Harga</label><input [(ngModel)]="item.price" class="form-input"></div>
                                        <div class="col-span-2"><label class="form-label">Deskripsi</label><input [(ngModel)]="item.desc" class="form-input"></div>
                                        <div class="flex gap-4 col-span-2">
                                           <label class="flex items-center gap-1 text-xs"><input type="checkbox" [(ngModel)]="item.favorite"> Favorit</label>
                                           <label class="flex items-center gap-1 text-xs"><input type="checkbox" [(ngModel)]="item.soldOut"> Habis</label>
                                           <label class="flex items-center gap-1 text-xs">Pedas: <input type="number" [(ngModel)]="item.spicyLevel" class="w-12 border rounded px-1"></label>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            }
                         </div>
                      </div>
                   }

                   <!-- === PACKAGES === -->
                   @if (currentTab() === 'packages') {
                      <div class="admin-card">
                         <div class="admin-card-header flex justify-between">
                            <span>Manajemen Paket</span>
                            <div class="flex gap-2">
                               <select [(ngModel)]="selectedBranchIndex" class="form-select w-40 h-8 py-0 text-xs">
                                  @for (b of config().branches; track $index) { <option [value]="$index">{{ b.name }}</option> }
                               </select>
                               <button (click)="addPackage()" class="bg-green-600 text-white px-3 py-1 rounded text-xs">+ Paket</button>
                            </div>
                         </div>
                         <div class="p-6 space-y-6">
                            @if (config().branches[selectedBranchIndex()].packages; as packages) {
                                @for (pkg of packages; track $index) {
                                   <div class="border rounded-lg p-4 bg-gray-50 relative">
                                      <button (click)="removePackage($index)" class="absolute top-2 right-2 text-red-500 font-bold">✕</button>
                                      <div class="grid md:grid-cols-4 gap-4">
                                         <div class="col-span-1">
                                            <img [src]="pkg.image" class="w-full h-24 object-cover rounded mb-2">
                                            <input type="file" (change)="onFileSelected($event, 'packageItem', $index)" class="text-[10px] w-full">
                                         </div>
                                         <div class="col-span-3 space-y-2">
                                            <div class="grid grid-cols-2 gap-2">
                                               <input [(ngModel)]="pkg.name" placeholder="Nama Paket" class="form-input">
                                               <input [(ngModel)]="pkg.price" placeholder="Harga" class="form-input">
                                            </div>
                                            <input [(ngModel)]="pkg.description" placeholder="Deskripsi Singkat" class="form-input">
                                            <textarea [ngModel]="pkg.items.join('\\n')" (ngModelChange)="updatePackageItems(pkg, $event)" placeholder="Isi paket (pisahkan baris)" class="form-input h-20"></textarea>
                                         </div>
                                      </div>
                                   </div>
                                }
                            }
                         </div>
                      </div>
                   }

                   <!-- === RESERVATION === -->
                   @if (currentTab() === 'reservation') {
                      <div class="admin-card">
                         <div class="admin-card-header">Pengaturan Reservasi</div>
                         <div class="p-6 space-y-4">
                            <div><label class="form-label">Judul Halaman</label><input [(ngModel)]="config().reservation.title" class="form-input"></div>
                            <div><label class="form-label">Sub-Judul</label><input [(ngModel)]="config().reservation.subtitle" class="form-input"></div>
                            <div class="grid grid-cols-2 gap-4">
                               <div><label class="form-label">Min Pax (Biasa)</label><input type="number" [(ngModel)]="config().reservation.minPaxRegular" class="form-input"></div>
                               <div><label class="form-label">Min Pax (Puasa)</label><input type="number" [(ngModel)]="config().reservation.minPaxRamadan" class="form-input"></div>
                            </div>
                            <div>
                               <label class="form-label">Template WhatsApp</label>
                               <textarea [(ngModel)]="config().reservation.whatsappTemplate" class="form-input h-24"></textarea>
                               <p class="text-[10px] text-gray-500">Variables: &#123;name&#125;, &#123;branch&#125;, &#123;date&#125;, &#123;time&#125;, &#123;pax&#125;</p>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- === LOCATION === -->
                   @if (currentTab() === 'location') {
                      <div class="admin-card">
                         <div class="admin-card-header flex justify-between">
                            <span>Daftar Cabang</span>
                            <div class="flex gap-2">
                               <select [(ngModel)]="selectedBranchIndex" class="form-select w-40 h-8 py-0 text-xs">
                                  @for (b of config().branches; track $index) { <option [value]="$index">{{ b.name }}</option> }
                               </select>
                               <button (click)="addBranch()" class="bg-blue-600 text-white px-3 py-1 rounded text-xs">Tambah Baru</button>
                               <button (click)="removeBranch()" class="bg-red-600 text-white px-3 py-1 rounded text-xs">Hapus</button>
                            </div>
                         </div>
                         <div class="p-6 space-y-4">
                            @if (config().branches[selectedBranchIndex()]; as br) {
                               <div><label class="form-label">Nama Cabang</label><input [(ngModel)]="br.name" class="form-input"></div>
                               <div><label class="form-label">Alamat Lengkap</label><textarea [(ngModel)]="br.address" class="form-input"></textarea></div>
                               <div class="grid grid-cols-2 gap-4">
                                  <div><label class="form-label">No. Telepon Display</label><input [(ngModel)]="br.phone" class="form-input"></div>
                                  <div><label class="form-label">No. WhatsApp (Order)</label><input [(ngModel)]="br.whatsappNumber" class="form-input"></div>
                                  <div><label class="form-label">Jam Buka</label><input [(ngModel)]="br.hours" class="form-input"></div>
                                  <div><label class="form-label">Link Google Maps</label><input [(ngModel)]="br.googleMapsUrl" class="form-input"></div>
                               </div>
                               <div>
                                  <label class="form-label">Gambar Peta / Lokasi</label>
                                  <input type="file" (change)="onFileSelected($event, 'branchMap')" class="form-input mb-2">
                                  <img [src]="br.mapImage" class="h-32 object-cover rounded">
                               </div>
                               <div class="grid grid-cols-3 gap-4 border-t pt-4">
                                  <div><label class="form-label">Instagram Link</label><input [(ngModel)]="br.instagramLink" class="form-input"></div>
                                  <div><label class="form-label">Facebook Link</label><input [(ngModel)]="br.facebookLink" class="form-input"></div>
                                  <div><label class="form-label">TikTok Link</label><input [(ngModel)]="br.tiktokLink" class="form-input"></div>
                               </div>
                            }
                         </div>
                      </div>
                   }

                   <!-- === MEDIA === -->
                   @if (currentTab() === 'media') {
                      <div class="admin-card">
                         <div class="admin-card-header">Galeri Foto</div>
                         <div class="p-6">
                            <div class="grid grid-cols-4 gap-4 mb-4">
                               @for (img of config().gallery; track $index) {
                                  <div class="relative group aspect-square">
                                     <img [src]="img" class="w-full h-full object-cover rounded">
                                     <button (click)="removeGalleryImage($index)" class="absolute inset-0 bg-red-500/50 text-white opacity-0 group-hover:opacity-100 font-bold">HAPUS</button>
                                  </div>
                               }
                               <div class="border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer aspect-square hover:bg-gray-50 relative">
                                  <input type="file" (change)="onFileSelected($event, 'galleryImage')" class="absolute inset-0 opacity-0 cursor-pointer">
                                  <span class="text-gray-400 font-bold">+ Upload</span>
                               </div>
                            </div>
                         </div>
                      </div>
                      <div class="admin-card">
                         <div class="admin-card-header flex justify-between">
                            <span>Testimoni</span>
                            <button (click)="addTestimonial()" class="bg-green-600 text-white px-2 py-1 rounded text-xs">+ Tambah</button>
                         </div>
                         <div class="p-6 space-y-4">
                            @for (t of config().testimonials; track $index) {
                               <div class="border rounded p-3 relative bg-gray-50">
                                  <button (click)="removeTestimonial($index)" class="absolute top-2 right-2 text-red-500">✕</button>
                                  <div class="grid grid-cols-2 gap-2 mb-2">
                                     <input [(ngModel)]="t.name" placeholder="Nama" class="form-input">
                                     <input [(ngModel)]="t.role" placeholder="Status (e.g Foodie)" class="form-input">
                                  </div>
                                  <textarea [(ngModel)]="t.text" placeholder="Isi testimoni" class="form-input h-16"></textarea>
                               </div>
                            }
                         </div>
                      </div>
                   }

                   <!-- === FOOTER === -->
                   @if (currentTab() === 'footer') {
                      <div class="admin-card">
                         <div class="admin-card-header">Footer Info</div>
                         <div class="p-6 space-y-4">
                            <div><label class="form-label">Deskripsi Singkat</label><textarea [(ngModel)]="config().footer.description" class="form-input"></textarea></div>
                            <div><label class="form-label">Teks Copyright</label><input [(ngModel)]="config().footer.copyrightText" class="form-input"></div>
                         </div>
                      </div>
                      <div class="admin-card">
                         <div class="admin-card-header">Warna Footer</div>
                         <div class="p-6 grid grid-cols-2 gap-4">
                            <div><label class="form-label">Background</label><input type="color" [(ngModel)]="config().footer.style.backgroundColor" class="w-full h-10"></div>
                            <div><label class="form-label">Text Color</label><input type="color" [(ngModel)]="config().footer.style.textColor" class="w-full h-10"></div>
                         </div>
                      </div>
                   }

                   <!-- === AI === -->
                   @if (currentTab() === 'ai') {
                      <div class="admin-card">
                         <div class="admin-card-header">Konfigurasi AI Assistant</div>
                         <div class="p-6 space-y-4">
                            <div><label class="form-label">Instruksi Sistem (System Prompt)</label><textarea [(ngModel)]="config().ai.systemInstruction" class="form-input h-32"></textarea></div>
                            <div><label class="form-label">Pesan Pembuka</label><input [(ngModel)]="config().ai.initialMessage" class="form-input"></div>
                            <div><label class="form-label">Warna Tombol</label><input type="color" [(ngModel)]="config().ai.buttonColor" class="w-full h-10"></div>
                         </div>
                      </div>
                   }

                   <!-- === DATABASE === -->
                   @if (currentTab() === 'database') {
                      <div class="admin-card">
                         <div class="admin-card-header">Koneksi Firebase</div>
                         <div class="p-6 space-y-4">
                            <p class="text-xs text-red-500 font-bold bg-red-50 p-2 border border-red-200 rounded">PERINGATAN: Mengubah ini akan me-reload halaman. Pastikan config benar.</p>
                            <div><label class="form-label">API Key</label><input [(ngModel)]="tempConfig.apiKey" class="form-input"></div>
                            <div><label class="form-label">Auth Domain</label><input [(ngModel)]="tempConfig.authDomain" class="form-input"></div>
                            <div><label class="form-label">Project ID</label><input [(ngModel)]="tempConfig.projectId" class="form-input"></div>
                            <div><label class="form-label">Storage Bucket</label><input [(ngModel)]="tempConfig.storageBucket" class="form-input"></div>
                            <div><label class="form-label">Messaging Sender ID</label><input [(ngModel)]="tempConfig.messagingSenderId" class="form-input"></div>
                            <div><label class="form-label">App ID</label><input [(ngModel)]="tempConfig.appId" class="form-input"></div>
                            <button (click)="saveFirebaseSetup()" class="bg-red-600 text-white font-bold px-4 py-2 rounded shadow hover:bg-red-700">Simpan Konfigurasi & Reload</button>
                         </div>
                      </div>
                   }

                </div>
             </div>
          </main>
        }
      </div>
    }
  `,
  styles: [`
    .admin-card { @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden; }
    .admin-card-header { @apply bg-gray-50 px-6 py-4 border-b border-gray-100 font-bold text-sm text-gray-700 flex items-center gap-2; }
    .form-label { @apply block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5; }
    .form-input { @apply w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white shadow-sm; }
    .form-select { @apply w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white shadow-sm appearance-none cursor-pointer; }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;
  
  isOpen = signal(false);
  currentTab = signal('global');
  isUploading = signal(false);
  
  emailInput = signal('');
  passwordInput = signal('');
  isLoggingIn = signal(false);
  loginError = signal<string | null>(null);
  
  selectedBranchIndex = signal(0);
  
  isAuthenticated = computed(() => this.configService.currentUser() !== null || this.configService.isDemoMode());
  firestoreError = this.configService.firestoreError;

  tabs = [
    { id: 'global', label: 'Global', icon: '🌍' },
    { id: 'hero', label: 'Hero', icon: '🏠' },
    { id: 'about', label: 'About', icon: '📖' },
    { id: 'menu', label: 'Menu', icon: '🍽️' },
    { id: 'packages', label: 'Paket', icon: '📦' },
    { id: 'reservation', label: 'Reservasi', icon: '📅' },
    { id: 'location', label: 'Lokasi', icon: '📍' },
    { id: 'media', label: 'Media', icon: '📷' },
    { id: 'footer', label: 'Footer', icon: '🔗' },
    { id: 'ai', label: 'AI', icon: '🤖' },
    { id: 'database', label: 'DB', icon: '🔥' }
  ];

  tempConfig: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

  constructor() {
    const current = this.configService.getStoredFirebaseConfig();
    if (current) this.tempConfig = {...current};

    effect(() => {
       if (this.isOpen()) document.body.classList.add('admin-mode');
       else document.body.classList.remove('admin-mode');
    });
  }

  getActiveTabLabel() {
    return this.tabs.find(t => t.id === this.currentTab())?.label || 'Dashboard';
  }

  togglePanel() {
    this.isOpen.update(v => !v);
  }

  async login() {
    this.isLoggingIn.set(true);
    this.loginError.set(null);
    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.toastService.show('Login Berhasil', 'success');
    } catch (e: any) {
      this.loginError.set(e.message || 'Login gagal');
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async logout() {
    await this.configService.logoutAdmin();
    this.togglePanel();
  }

  async saveChanges() {
    try {
      await this.configService.updateConfig(this.config());
      this.toastService.show('Disimpan!', 'success');
    } catch (e: any) {
       console.error(e);
       this.toastService.show('Gagal menyimpan.', 'error');
    }
  }

  async onFileSelected(event: any, type: string, index?: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    try {
      const base64 = await this.configService.uploadFile(file);
      
      this.config.update(c => {
        const newC = { ...c };
        // GLOBAL
        if (type === 'logoImage') newC.global.logoImage = base64; // RESTORED
        if (type === 'introVideo') newC.intro.videoUrl = base64;
        if (type === 'favicon') newC.global.favicon = base64;
        
        // PAGES
        if (type === 'heroBg') newC.hero.bgImage = base64;
        if (type === 'heroFallback') newC.hero.fallbackImage = base64; // BS 2
        if (type === 'aboutImage') newC.about.image = base64;
        if (type === 'galleryImage') newC.gallery.push(base64);
        
        // ITEMS
        if (type === 'menuItem' && typeof index === 'number') {
           newC.branches[this.selectedBranchIndex()].menu[index].image = base64;
        }
        if (type === 'packageItem' && typeof index === 'number') {
           if (newC.branches[this.selectedBranchIndex()].packages?.[index]) {
             newC.branches[this.selectedBranchIndex()].packages![index].image = base64;
           }
        }
        if (type === 'branchMap') {
           newC.branches[this.selectedBranchIndex()].mapImage = base64;
        }
        return newC;
      });
      
      this.toastService.show('Upload Berhasil', 'success');
    } catch (e) {
      this.toastService.show('Gagal Upload', 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  removeGalleryImage(index: number) {
    if(!confirm('Hapus foto ini?')) return;
    this.config.update(c => {
       const newC = {...c};
       newC.gallery.splice(index, 1);
       return newC;
    });
  }

  addMenuItem() {
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].menu.unshift({
        name: 'Menu Baru',
        desc: '',
        price: 'Rp 0',
        category: 'Umum',
        image: 'https://picsum.photos/200',
        favorite: false,
        soldOut: false,
        spicyLevel: 0
      });
      return newC;
    });
  }

  removeMenuItem(index: number) {
    if(!confirm('Hapus menu ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].menu.splice(index, 1);
      return newC;
    });
  }

  addPackage() {
    this.config.update(c => {
      const newC = { ...c };
      const currentBranch = newC.branches[this.selectedBranchIndex()];
      if (!currentBranch.packages) currentBranch.packages = [];
      
      currentBranch.packages.unshift({
        name: 'Paket Baru',
        price: 'Rp 0',
        description: 'Deskripsi...',
        image: 'https://picsum.photos/400/300',
        items: ['Item 1', 'Item 2']
      });
      return newC;
    });
  }

  removePackage(index: number) {
    if(!confirm('Hapus paket ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].packages?.splice(index, 1);
      return newC;
    });
  }

  updatePackageItems(pkg: PackageItem, text: string) {
    pkg.items = text.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0);
  }

  addBranch() {
    const id = prompt("ID Cabang (contoh: 'jakarta'):");
    if (!id) return;
    
    this.config.update(c => {
      const newC = { ...c };
      newC.branches.push({
        id: id.toLowerCase().replace(/\s/g, '-'),
        name: 'Cabang Baru',
        address: '-',
        googleMapsUrl: '',
        phone: '',
        whatsappNumber: '',
        hours: '10.00 - 22.00',
        mapImage: 'https://picsum.photos/600/400',
        menu: [],
        packages: []
      });
      this.selectedBranchIndex.set(newC.branches.length - 1);
      return newC;
    });
  }

  removeBranch() {
    if (this.config().branches.length <= 1) return;
    if(!confirm('Hapus cabang ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches.splice(this.selectedBranchIndex(), 1);
      this.selectedBranchIndex.set(0);
      return newC;
    });
  }

  addTestimonial() {
     this.config.update(c => {
        const newC = {...c};
        newC.testimonials.push({ name: 'Pelanggan', role: 'Foodie', rating: 5, text: 'Enak banget!' });
        return newC;
     });
  }

  removeTestimonial(index: number) {
     if(!confirm('Hapus testimoni ini?')) return;
     this.config.update(c => {
        const newC = {...c};
        newC.testimonials.splice(index, 1);
        return newC;
     });
  }

  saveFirebaseSetup() { 
    this.configService.saveStoredFirebaseConfig(this.tempConfig);
  }
}
