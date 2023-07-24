'use strict';

function isObject(o) {
  return Object.prototype.toString.call(o)
}

module.exports = { isObject };