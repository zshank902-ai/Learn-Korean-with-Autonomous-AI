/**
 * Principal Architect: Lazy-Loading Audio Service.
 * Ensures heavy audio assets are only fetched when needed to minimize bandwidth.
 */
class AudioService {
  private cache: Map<string, HTMLAudioElement> = new Map();

  /**
   * Plays a pronunciation audio file. 
   * Fetches the asset dynamically on the first request.
   */
  public async play(url: string, playbackRate: number = 1.0) {
    try {
      let audio = this.cache.get(url);

      if (!audio) {
        console.log(`AudioService: Fetching asset ${url}`);
        audio = new Audio(url);
        this.cache.set(url, audio);
      }

      // Reset to beginning if already played
      audio.currentTime = 0;
      audio.playbackRate = playbackRate;
      await audio.play();
    } catch (error) {
      console.error(`AudioService: Failed to play audio. ${error}`);
    }
  }

  /**
   * Preloads an audio file into memory without playing it.
   */
  public preload(url: string) {
    if (!this.cache.has(url)) {
      const audio = new Audio(url);
      audio.load();
      this.cache.set(url, audio);
    }
  }
}

export const audioService = new AudioService();
