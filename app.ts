const express = require('express');
'use strict';

class App {
    public app: any

    constructor() {
        this.app = express();
    }
}

export default new App().app;
