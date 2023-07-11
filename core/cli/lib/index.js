'use strict';

module.exports = core;

const semver = require('semver');
const colors = require('colors/safe');
const userHome  = require('user-home');
// const pathExists = require('path-exists')
const pkg = require('../package.json');
const log = require('@www-cli-dev/log');

const constant = require('./const');

function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
    } catch (e) {
        log.error(e.message)
    }
}

function checkUserHome() {
    console.log(userHome);
}

function checkRoot() {
    console.log(process.geteuid);
}

function checkPkgVersion(){
    console.log(pkg.version);
    log.notice('cli', pkg.version);
}

function checkNodeVersion(){
    // 当前版本号
    const currentVersion = process.version;
    // 比对最低版本号
    const lowestVersion = constant.LOWEST_NODE_VERSION;
    if(!semver.gte(currentVersion, lowestVersion)){
        throw new Error(colors.red(`www-cli 需要安装 v${lowestVersion} 以上版本的node.js`))
    }
}