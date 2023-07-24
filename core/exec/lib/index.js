'use strict';

const log = require('@www-cli-dev/log')
const Package = require('@www-cli-dev/package')
const path = require('path') 

const SETTINGS = {
  init:'@www-cli-dev/init'
}

const CACHE_DIR = 'dependencies/'

let storeDir
let pkg

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest'

  if(!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR); //生成缓存路径
    storeDir = path.resolve(targetPath, 'node_modules');
    log.verbose('targetPath', targetPath);
    log.verbose('storeDir', storeDir);
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
      storeDir
    })
    if(await pkg.exists()){
      // 更新package
      await pkg.updata();
    } else {
      // 安装package
      await pkg.install()
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    })
  }
  const rootFile = pkg.getRootFilePath();
  if(rootFile){
    require(rootFile).apply(null, arguments)
  }
}

module.exports = exec;