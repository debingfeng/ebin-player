export interface MediaCapabilitiesResult {
  codecSupport: {
    h264: boolean;
    hevc: boolean;
    vp9: boolean;
    av1: boolean;
    aac: boolean;
    opus: boolean;
  };
  mse: boolean;
  eme: {
    widevine: boolean;
    fairplay: boolean;
  };
  hlsNative: boolean;
}

export function detectCapabilities(): MediaCapabilitiesResult {
  const video = typeof document !== 'undefined' ? document.createElement('video') : undefined;
  const can = (type: string) => !!video && !!video.canPlayType && video.canPlayType(type) !== '';
  const hasMSE = typeof (window as any) !== 'undefined' && typeof (window as any).MediaSource !== 'undefined';
  const hlsNative = !!(video && (video as any).canPlayType && (video as any).canPlayType('application/vnd.apple.mpegURL'));
  return {
    codecSupport: {
      h264: can('video/mp4; codecs="avc1.42E01E"'),
      hevc: can('video/mp4; codecs="hvc1.1.6.L93.B0"') || can('video/mp4; codecs="hev1"'),
      vp9: can('video/webm; codecs="vp9"'),
      av1: can('video/mp4; codecs="av01.0.05M.08"') || can('video/webm; codecs="av1"'),
      aac: can('audio/mp4; codecs="mp4a.40.2"'),
      opus: can('audio/webm; codecs="opus"'),
    },
    mse: hasMSE,
    eme: {
      widevine: typeof (navigator as any) !== 'undefined' && 'requestMediaKeySystemAccess' in (navigator as any),
      fairplay: typeof (window as any) !== 'undefined' && !!(window as any).WebKitMediaKeys,
    },
    hlsNative,
  };
}


