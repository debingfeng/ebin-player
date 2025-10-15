export class PictureInPictureAdapter {
  async request(video: HTMLVideoElement): Promise<void> {
    const anyV: any = video as any;
    if ('requestPictureInPicture' in video) {
      await (video as any).requestPictureInPicture();
      return;
    }
    if ('webkitSetPresentationMode' in anyV) {
      anyV.webkitSetPresentationMode('picture-in-picture');
      return;
    }
    throw new Error('pip-not-supported');
  }

  async exit(video: HTMLVideoElement): Promise<void> {
    const anyV: any = video as any;
    if ((document as any).pictureInPictureElement) {
      await (document as any).exitPictureInPicture();
      return;
    }
    if ('webkitSetPresentationMode' in anyV) {
      anyV.webkitSetPresentationMode('inline');
      return;
    }
  }
}


