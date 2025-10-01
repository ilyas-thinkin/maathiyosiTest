// src/types/mux-player.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'mux-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'stream-type'?: string;
      'playback-id'?: string;
      'metadata-video-title'?: string;
      controls?: boolean;
      autoplay?: boolean;
    };
  }
}
