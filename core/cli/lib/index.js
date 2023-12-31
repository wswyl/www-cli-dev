'use strict';

module.exports = core;

const path = require('path')
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const commander = require('commander')
const pkg = require('../package.json');
const log = require('@www-cli-dev/log');
const init = require('@www-cli-dev/init');
const exec = require('@www-cli-dev/exec');

const constant = require('./const');

let args

const program = new commander.Command();

async function core() {
    try {
        await prepare();
        registerCommand();
    } catch (e) {
        log.error(e.message)
        if(process.env.LOG_LEVEL === 'verbose'){
            console.log(e)
        }
    }
}

function registerCommand() {
    program
        .name(Object.keys(pkg.name)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d, --debug', '是否开启调试模式', false)
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')
    
    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化项目')
        .action(exec)

    // 开启debug模式
    program.on('option:debug', function() {
        if(program._optionValues.debug) {
            process.env.LOG_LEVEL = 'verbose';
        } else {
            process.env.LOG_LEVEL = 'info';
        }
        log.level = process.env.LOG_LEVEL;
    })
 
     // 指定targetPath
     program.on('option:targetPath', function() {
        process.env.CLI_TARGET_PATH = program._optionValues.targetPath
    })

    // 对未知命令进行监听
    program.on('command:*', function(obj) {
        const availableCommands = program.commands.map(cmd => cmd.name());
        console.log(colors.red('未知命令：' + obj[0]))
        if(availableCommands.length > 0) {
            console.log(colors.red('可用命令:' + availableCommands.join(',')))
        }
    })

    if(process.argv.length < 3){
        program.outputHelp()
        console.log()
    } else {
        program.parse(process.argv)
    }
}

async function prepare() {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkEnv();
    await checkGlobalUpdate();
}

function checkEnv() {
    // const dotenv = require('dotenv');
    // const dotenvpath = path.resolve(userHome, '.env');
    // console.log(dotenvpath)
    // if(pathExists(dotenvpath)){
    //     dotenv.config({
    //         path: dotenvpath
    //     });
    // }
    creatDefaultConfig()
}

async function checkGlobalUpdate() {
    const currentVersion = pkg.version;
    const npmName = pkg.name;
    const { getNpmSemverVersion } = require('@www-cli-dev/get-npm-info')
    const lastVersions = await getNpmSemverVersion(currentVersion, npmName)
    if(lastVersions && semver.gt(lastVersions, currentVersion)){
        log.warn('更新提示', colors.yellow(`请手动更新${npmName},
        当前版本: ${currentVersion}, 最新版本: ${lastVersions},
        更新命令: npm install -g ${npmName}`))
    }
}

function creatDefaultConfig() {
    const cliConfig = {
        home: userHome
    };
    if(process.env.CLI_HOME){
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkUserHome() {
    if(!process.env.HOMEPATH){
        throw new Error(colors.red('当前登陆主目录不存在'))
    }
}

function checkRoot() {}

function checkPkgVersion(){
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