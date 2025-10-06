import React, { useEffect, useRef } from 'react';
import { PlayerInstance } from '../../core/Player';
import { DefaultUI } from '../../ui/DefaultUI';

interface ReactPlayerProps {
  src: string;
  autoplay?: boolean;
  muted?: boolean;
  useDefaultUI?: boolean;
  className?: string;
}

export const ReactPlayer: React.FC<ReactPlayerProps> = ({
  src,
  autoplay,
  muted,
  useDefaultUI = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const player = new PlayerInstance(containerRef.current, { src, autoplay, muted });
    if (useDefaultUI) new DefaultUI(player, containerRef.current);
    return () => player.destroy();
  }, [src, autoplay, muted, useDefaultUI]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />;
};