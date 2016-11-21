/*jshint mocha:true*/
(function (polyn, fixtures) {
    'use strict';

    var is = polyn.is,
        isFixture = fixtures.is,
        id = polyn.id,
        idFixture = fixtures.id,
        async = polyn.async,
        asyncFixture = fixtures.async,
        Exception = polyn.Exception,
        ExceptionFixture = fixtures.Exception,
        Blueprint = polyn.Blueprint,
        BlueprintFixture = fixtures.Blueprint,
        Immutable = polyn.Immutable,
        ImmutableFixture = fixtures.Immutable;

    // globals: describe, it, xit, before, after

    isFixture.run(is, describe, it, chai.expect);
    idFixture.run(id, describe, it, chai.expect);
    asyncFixture.run(async, describe, it);
    ExceptionFixture.run(Exception, describe, it, chai.expect);
    BlueprintFixture.run(Blueprint, id, is, describe, it, chai.expect, beforeEach, afterEach);
    ImmutableFixture.run(Immutable, describe, it, chai.expect, beforeEach, afterEach);

}(window.polyn, window.fixtures));
