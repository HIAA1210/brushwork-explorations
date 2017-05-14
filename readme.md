# Brushwork Explorations

Exploring in depth 3 Chinese landscape paintings from the RISD Museum, powered by d3 and Foundation.

## Serve
Compiled assets are located in `dist`, and can be served with any static server. A `Procfile` is configured to serve using [harp.js](http://harpjs.com/), for Heroku deploys.

## Build
To rebuild assets:
```bash
npm install
./node_modules/bower/bin/bower install
gulp build
```

To build and serve using BrowserSync, watching for changes:
```bash
npm install
npm install -g bower
bower install
gulp
```

To create compressed, production-ready assets, run `npm run build`.