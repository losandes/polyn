/*jshint mocha:true*/
var chai = require('chai'),
    is = require('../src/is.js'),
    isFixture = require('./specs/is.fixture.js'),
    id = require('../src/id.js'),
    idFixture = require('./specs/id.fixture.js'),
    async = require('../src/async.js'),
    asyncFixture = require('./specs/async.fixture.js'),
    Exception = require('../src/Exception.js'),
    ExceptionFixture = require('./specs/Exception.fixture.js'),
    Blueprint = require('../src/Blueprint.js'),
    BlueprintFixture = require('./specs/Blueprint.fixture.js');

// globals: describe, it, xit, before, after

isFixture.run(is, describe, it, chai.expect);
idFixture.run(id, describe, it, chai.expect);
asyncFixture.run(async, describe, it);
ExceptionFixture.run(Exception, describe, it, chai.expect);
BlueprintFixture.run(Blueprint, id, is, describe, it, chai.expect);
