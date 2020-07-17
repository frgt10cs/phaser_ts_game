export enum SoundState{
    playing,
    paused    
}

export class SoundManager {
    static isEnabled: boolean;  
    private static _soundState:SoundState;
    static get soundState():SoundState{
        return this._soundState;
    }
    private static playlist: Phaser.Sound.BaseSound[];   
    private static currentTrackIndex: number;
    private static get currentSound(): Phaser.Sound.BaseSound {
        return SoundManager.playlist[SoundManager.currentTrackIndex];
    }

    static init(audios: Phaser.Sound.BaseSound[]): void {
        SoundManager.currentTrackIndex = 0;
        SoundManager.playlist = audios;
    }

    static play(): void {
        SoundManager.currentSound.play();
        SoundManager.currentSound.once("complete", this.playNext);
        SoundManager._soundState = SoundState.playing;      
    }

    static pause(): void {
        SoundManager.currentSound.pause();
        SoundManager._soundState = SoundState.paused;        
    }

    static resume(): void {
        SoundManager.currentSound.resume();
        SoundManager._soundState = SoundState.playing;        
    }

    static playNext(): void {
        SoundManager.currentTrackIndex = SoundManager.currentTrackIndex == SoundManager.playlist.length - 1 ? 0 : SoundManager.currentTrackIndex + 1;
        SoundManager.play();
    }

    static playPrev(): void {
        SoundManager.currentTrackIndex = SoundManager.currentTrackIndex == 0 ? SoundManager.playlist.length - 1 : SoundManager.currentTrackIndex - 1;
        SoundManager.play();
    }
}