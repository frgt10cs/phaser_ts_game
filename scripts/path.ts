export class Path {
    static staticFilesPath: string = "../";

    static imagesFolder: string = "images";
    static audiosFolder: string = "audios";

    static imagesPath: string;
    static audiosPath: string;

    static init() {
        this.imagesPath = this.staticFilesPath + "/" + this.imagesFolder;
        this.audiosPath = this.staticFilesPath + "/" + this.audiosFolder;
    }

    static getImagePath(imageName: string): string {
        return this.imagesPath + "/" + imageName;
    }

    static getAudioPath(audioName: string): string {
        return this.audiosPath + "/" + audioName;
    }
}

Path.init();