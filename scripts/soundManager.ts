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
        return this.playlist[this.currentTrackIndex];
    }

    static init(audios: Phaser.Sound.BaseSound[]): void {
        this.currentTrackIndex = 0;
        this.playlist = audios;
    }

    static play(): void {
        this.currentSound.play();
        this.currentSound.once("complete", this.playNext);
        this._soundState = SoundState.playing;      
    }

    static pause(): void {
        this.currentSound.pause();
        this._soundState = SoundState.paused;        
    }

    static resume(): void {
        this.currentSound.resume();
        this._soundState = SoundState.playing;        
    }

    static playNext(): void {
        this.currentTrackIndex = this.currentTrackIndex == this.playlist.length - 1 ? 0 : this.currentTrackIndex + 1;
        this.play();
    }

    static playPrev(): void {
        this.currentTrackIndex = this.currentTrackIndex == 0 ? this.playlist.length - 1 : this.currentTrackIndex - 1;
        this.play();
    }
}