import { Component, signal, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (config().global.enableBackgroundMusic && config().global.backgroundMusicUrl) {
      <!-- Audio Element -->
      <audio #audioPlayer 
        [src]="config().global.backgroundMusicUrl" 
        loop 
        autoplay 
        muted
        (play)="onPlaybackChange()"
        (pause)="onPlaybackChange()">
      </audio>

      <!-- Floating Control Button -->
      <button 
        (click)="togglePlay()"
        class="fixed bottom-20 left-6 z-50 bg-gray-900/80 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all border-2 border-white/20 backdrop-blur-sm group"
        [title]="isPlaying() ? 'Pause Music' : 'Play Music'">
        
        @if (isPlaying()) {
          <!-- Pause Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        } @else {
          <!-- Play Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        }
      </button>
    }
  `
})
export class MusicPlayerComponent implements AfterViewInit {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  
  isPlaying = signal(false);
  
  ngAfterViewInit() {
    // Browser autoplay policy might prevent unmuted autoplay.
    // We start muted and let user control it.
    // The `autoplay` attribute on the audio element handles playing it muted initially.
    this.updatePlayingState();
  }

  togglePlay() {
    const player = this.audioPlayer.nativeElement;
    if (player.paused) {
      player.muted = false; // Unmute on first manual play
      player.play().catch(e => console.error("Error playing audio:", e));
    } else {
      player.pause();
    }
  }

  onPlaybackChange() {
    this.updatePlayingState();
  }
  
  private updatePlayingState() {
     if(this.audioPlayer) {
        const player = this.audioPlayer.nativeElement;
        this.isPlaying.set(!player.paused && !player.muted);
     }
  }
}
