import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { EbinPlayerModule } from '../src/lib/ebin-player.module';

jest.mock('@ebin-player/core', () => ({
  createPlayer: jest.fn(() => ({
    on: jest.fn(() => () => {}),
    play: jest.fn(),
    pause: jest.fn(),
    getCurrentTime: jest.fn(() => 0),
    getDuration: jest.fn(() => 100),
    getVolume: jest.fn(() => 1),
    getMuted: jest.fn(() => false),
    getPlaybackRate: jest.fn(() => 1),
    setMuted: jest.fn(),
    setVolume: jest.fn(),
    setPlaybackRate: jest.fn(),
    updateUIConfig: jest.fn(),
    updateUITheme: jest.fn(),
    destroy: jest.fn(),
  })),
  version: '0.0.4',
}));

@Component({
  standalone: true,
  imports: [EbinPlayerModule],
  template: `<ebin-player [src]="src" (ready)="onReady()"></ebin-player>`
})
class HostComponent {
  src = 'video.mp4';
  onReady = jest.fn();
}

describe('EbinPlayerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render and emit ready', () => {
    expect(host.onReady).toHaveBeenCalled();
  });
});
