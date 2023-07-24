'use strict';

const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists')
const path = require('path')
const fse = require('fs-extra')
const formatPath = require('@www-cli-dev/format-path')
const { getDefaultRegistry, getNpmLatestVersion } = require('@www-cli-dev/get-npm-info')
const npminstall = require('npminstall')


class Package{
  constructor(options) {
    if(!options) {
      throw new Error('Package类的options参数不能为空')
    }
    // package路径
    this.targetPath = options.targetPath;
    // 缓存路径
    this.storeDir = options.storeDir;
    // package名
    this.packageName = options.packageName;
    // package版本
    this.packageVersion = options.packageVersion
    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  async prepare() {
    if(this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }
    if(this.packageVersion === 'latest'){
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `${this.packageName}`);
  }

// 判断package是否存在
 async exists(){
    if(this.storeDir){
      await this.prepare()
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath)
    }
  }

  async install(){
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs:[{
          name: this.packageName, 
          version: this.packageVersion
        }]
    })
  }

  async updata(){
    await this.prepare();
    // 获取最新的版本号
    const latesPackageVersion = await getNpmLatestVersion(this.packageName) 
    // todo 自动更新，win判断版本路径，老版本号为this.packageVersion,对比后调用install方法
  }

  // 获取入口文件路径
  getRootFilePath(){
    function _getRootFile(targetPath) {
      const dir = pkgDir(targetPath);
      if(dir){
        const pkgFile = require(path.resolve(dir, 'package.json'));
        if(pkgFile && pkgFile.main){
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null
    }

    if(this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package;
