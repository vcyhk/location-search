# location-search

<img src="/screenshot/1.png">

## Demo
Demo: <a href="https://location-search.vitochan.com" target="_blank">https://location-search.vitochan.com</a>

## Build Setup

Place the Google API in dev.env.js
``` bash
module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  GOOGLE_API : '"API_KEY"'
})
```
Run the script
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
