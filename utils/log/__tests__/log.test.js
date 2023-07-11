'use strict';

const log = require('../lib/index');
const assert = require('assert').strict;

assert.strictEqual(log(), 'Hello from log');
console.info('log tests passed');
