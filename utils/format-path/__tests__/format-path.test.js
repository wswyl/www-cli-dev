'use strict';

const formatPath = require('../lib');
const assert = require('assert').strict;

assert.strictEqual(formatPath(), 'Hello from formatPath');
console.info('formatPath tests passed');
