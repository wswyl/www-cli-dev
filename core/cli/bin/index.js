#!/usr/bin/env node

console.log("hello www脚手架")
const importLocal = require('import-local');

if(importLocal(__filename)){
    require('npmlog').info("cli",'正在使用www-cli本地版本')
}else{
    require('../lib/index')(process.argv.slice(2))
}
