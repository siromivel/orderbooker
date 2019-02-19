import express from 'express';

class App {
    public app: any

    constructor() {
        this.app = express();
    }
}

export default new App().app;
