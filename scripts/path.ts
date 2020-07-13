export class Path {
    static staticFilesPath: string = "../";

    static imagesFolder: string = "images";

    static imagesPath: string;

    static init() {
        this.imagesPath = `${this.staticFilesPath}/${this.imagesFolder}`;
    }

    static getImagePath(imageName: string): string {
        return this.imagesPath + "/" + imageName;
    }
}

Path.init();