'use strict'

const assert = require('assert')
const equals = require('equals')
const isArrayWith = require('is-array-with')
const isIterator = require('is-iterator')
const Map8 = require('.')

describe('Map8', function () {
  describe('#constructor', function () {
    it('should accept initial key-value pairs', function () {
      const map = new Map8([['key', 'value']])
      assert(map.has('key'))
      assert(map.hasEntry('key', 'value'))
    })

    it('should accept initial deep key-values', function () {
      const map = new Map8([[1, 2, 'value']])
      assert(map.has(1))
      assert(map.has(1, 2))
      assert(map.hasEntry(1, 2, 'value'))
    })
  })

  describe('#has()', function () {
    it('should return true if a key is set', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(map.has('key'))
    })

    it('should return false if a key is not set', function () {
      const map = new Map8()
      assert(!map.has('key'))
    })

    it('should return true if a non-object key is set on a `weak` map', function () {
      const map = new Map8([], {weak: true})
      map.set('key', 'value')
      assert(map.has('key'))
    })

    it('should return true if an object key is set on a `weak` map', function () {
      const map = new Map8([], {weak: true})
      const key = {}
      map.set(key, 'value')
      assert(map.has(key))
    })

    it('should return true if a nested key is set', function () {
      const map = new Map8()
      map.set('key1', 'key2', 'value')
      assert(map.has('key1', 'key2'))
      assert(!map.has('key1', 'key3'))
    })

    it('should return false for an equivalent key', function () {
      const map = new Map8()
      map.set({isKey: true}, 'value')
      assert(!map.has({isKey: true}))
    })

    it('should return true for an equivalent key when `loose` is true', function () {
      const map = new Map8([], {loose: true})
      map.set({isKey: true}, 'value')
      assert(map.has({isKey: true}))
    })

    it('should return false for an expired value', function (done) {
      const map = new Map8([], {ttl: 10})
      map.set('key', 'value')
      assert(map.has('key'))
      setTimeout(() => {
        assert(!map.has('key'))
        done()
      }, 11)
    })

    it('should return true for a value not yet expired', function (done) {
      const map = new Map8([], {ttl: 100})
      map.set('key', 'value')
      assert(map.has('key'))
      setTimeout(() => {
        assert(map.has('key'))
        done()
      }, 1)
    })

    it('should work when `sortKeys` is true', function () {
      const map = new Map8([], {sortKeys: true})
      map.set('key', 'value')
      assert(map.has('key'))
    })

    it('should work when `weak` is true', function () {
      const map = new Map8([], {weak: true})
      map.set('key', 'value')
      assert(map.has('key'))
    })
  })

  describe('#hasAnyKey()', function () {
    it('should return true if a single key is set', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(map.hasAnyKey('key'))
    })

    it('should return false if a single key is not set', function () {
      const map = new Map8()
      assert(!map.hasAnyKey('key'))
    })

    it('should return true if any key is set', function () {
      const map = new Map8()
      map.set('key1', 'value')
      assert(map.hasAnyKey('key1', 'key2'))
      assert(map.hasAnyKey('key2', 'key1'))
    })

    it('should return true if any nested key chain is set', function () {
      const map = new Map8()
      map.set('key1', 'key2', 'value')
      assert(map.hasAnyKey(['key1', 'key2'], ['key1', 'key3']))
      assert(map.hasAnyKey(['key1', 'key3'], ['key1', 'key2']))
      assert(!map.hasAnyKey(['key1', 'key4']))
    })
  })

  describe('#hasEntry()', function () {
    it('should return true only if a key has a value', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(map.hasEntry('key', 'value'))
      assert(!map.hasEntry('key', 'other'))
      assert(!map.hasEntry('other', 'value'))
    })

    it('should return true only if a nested key has a value', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set(1, 2, 'a')
      map.set(1, 2, 'b')
      assert(map.hasEntry(1, 2, 'a'))
      assert(!map.hasEntry(1, 'a'))
      assert(map.hasEntry(1, 2, 'b'))
      assert(!map.hasEntry(1, 2, 'c'))
    })

    it('should work when `sortKeys` is true', function () {
      const map = new Map8([], {sortKeys: true})
      map.set('key', 'value')
      assert(map.hasEntry('key', 'value'))
      assert(!map.hasEntry('key', 'other'))
    })

    it('should work when `weak` is true', function () {
      const map = new Map8([], {weak: true})
      map.set('key', 'value')
      assert(map.hasEntry('key', 'value'))
      assert(!map.hasEntry('key', 'other'))
    })
  })

  describe('#hasValue()', function () {
    it('should return true only if a collection has a value', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(map.hasValue('value'))
      assert(!map.hasValue('other'))
    })

    it('should return true only if a nested collection has a value', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set(1, 2, 'a')
      map.set(1, 2, 'b')
      assert(map.hasValue(1, 'a'))
      assert(!map.hasValue('a'))
      assert(map.hasValue(1, 'b'))
      assert(!map.hasValue(1, 'c'))
    })

    it('should work when `sortKeys` is true', function () {
      const map = new Map8([], {sortKeys: true})
      map.set('key', 'value')
      assert(map.hasValue('value'))
      assert(!map.hasValue('other'))
    })

    it('should work when `weak` is true', function () {
      const map = new Map8([], {weak: true})
      map.set('key', 'value')
      assert(map.hasValue('value'))
      assert(!map.hasValue('other'))
    })
  })

  describe('#hasDeepValue()', function () {
    it('should return true only if a collection has a value', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(map.hasDeepValue('value'))
      assert(!map.hasDeepValue('other'))
    })

    it('should find a value in a nested map', function () {
      const map = new Map8()
      map.set(1, 2, 'a')
      assert(map.hasDeepValue('a'))
      assert(map.hasDeepValue(1, 'a'))
      assert(!map.hasDeepValue(1, 2, 'a'))
    })

    it('should work when `sortKeys` is true', function () {
      const map = new Map8([], {sortKeys: true})
      map.set(1, 2, 'value')
      assert(map.hasDeepValue('value'))
      assert(!map.hasDeepValue('other'))
    })

    it('should work when `weak` is true', function () {
      const map = new Map8([], {weak: true})
      map.set('key', 'value')
      assert(map.hasDeepValue('value'))
      assert(!map.hasDeepValue('other'))
    })
  })

  describe('#get()', function () {
    it('should return the value for a given key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert.strictEqual(map.get('key'), 'value')
    })

    it('should return undefined if the given key is not set', function () {
      const map = new Map8()
      assert.strictEqual(typeof map.get('key'), 'undefined')
    })

    it('should return the value for a given non-object `weak` key', function () {
      const map = new Map8([], {weak: true})
      map.set('key', 'value')
      assert.strictEqual(map.get('key'), 'value')
    })

    it('should return the value for a given object `weak` key', function () {
      const map = new Map8([], {weak: true})
      const key = {}
      map.set(key, 'value')
      assert.strictEqual(map.get(key), 'value')
    })

    it('should return the value for a given nested key', function () {
      const map = new Map8()
      map.set('key1', 'key2', 'value')
      assert.strictEqual(map.get('key1', 'key2'), 'value')
    })

    it('should return undefined if the given nested key is not set', function () {
      const map = new Map8()
      assert.strictEqual(typeof map.get('key1', 'key2'), 'undefined')
    })

    it('should return undefined for a given equivalent key', function () {
      const map = new Map8()
      map.set({isKey: true}, 'value')
      assert.strictEqual(typeof map.get({isKey: true}), 'undefined')
    })

    it('should return the value for an equivalent key when `loose` is true', function () {
      const map = new Map8([], {loose: true})
      map.set({isKey: true}, 'value')
      assert.strictEqual(map.get({isKey: true}), 'value')
    })

    it('should always return an array when `multi` is true', function () {
      const map = new Map8([], {multi: true})
      map.set('key', 'value')
      assert(isArrayWith(map.get('key'), 'value'))
      assert(isArrayWith(map.get('not set')))
    })

    it('should return undefined for an expired value', function (done) {
      const map = new Map8([], {ttl: 10})
      map.set('key', 'value')
      assert.strictEqual(map.get('key'), 'value')
      setTimeout(() => {
        assert.strictEqual(typeof map.get('key'), 'undefined')
        done()
      }, 11)
    })

    it('should return a value that is not yet expired', function (done) {
      const map = new Map8([], {ttl: 100})
      map.set('key', 'value')
      assert.strictEqual(map.get('key'), 'value')
      setTimeout(() => {
        assert.strictEqual(map.get('key'), 'value')
        done()
      }, 1)
    })
  })

  describe('#getAny()', function () {
    it('should return the value of a single key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert.strictEqual(map.getAny('key'), 'value')
    })

    it('should return undefined if the given single key is not set', function () {
      const map = new Map8()
      assert.strictEqual(typeof map.getAny('key'), 'undefined')
    })

    it('should return the value of the first set key', function () {
      const map = new Map8()
      map.set('key1', 'value1')
      map.set('key2', 'value2')
      assert.strictEqual(map.getAny('key1', 'key2'), 'value1')
      assert.strictEqual(map.getAny('key2', 'key1'), 'value2')
      assert.strictEqual(map.getAny('key3', 'key1'), 'value1')
    })

    it('should return the value of the first set nested key chain', function () {
      const map = new Map8()
      map.set('key', 'subkey1', 'value1')
      map.set('key', 'subkey2', 'value2')
      assert.strictEqual(map.getAny(['key', 'subkey1'], ['key', 'subkey2']), 'value1')
      assert.strictEqual(map.getAny(['key', 'subkey2'], ['key', 'subkey1']), 'value2')
      assert.strictEqual(map.getAny(['key', 'subkey3'], ['key', 'subkey1']), 'value1')
    })
  })

  describe('#getElse()', function () {
    it('should return the value for a given key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert.strictEqual(map.getElse('key', 'fallback'), 'value')
    })

    it('should return the fallback if the given key is not set', function () {
      const map = new Map8()
      assert.strictEqual(map.getElse('key', 'fallback'), 'fallback')
    })

    it('should return the value for a given nested key', function () {
      const map = new Map8()
      map.set(1, 2, 'value')
      assert.strictEqual(map.getElse(1, 2, 'fallback'), 'value')
    })

    it('should return the fallback if the given nested key is not set', function () {
      const map = new Map8()
      assert.strictEqual(map.getElse(1, 2, 'fallback'), 'fallback')
    })
  })

  describe('#getAnyElse()', function () {
    it('should return the value of a single key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert.strictEqual(map.getAnyElse('key', 'fallback'), 'value')
    })

    it('should return the fallback if the given single key is not set', function () {
      const map = new Map8()
      assert.strictEqual(map.getAnyElse('key', 'fallback'), 'fallback')
    })

    it('should return the value of the first set key', function () {
      const map = new Map8()
      map.set('key1', 'value1')
      map.set('key2', 'value2')
      assert.strictEqual(map.getAnyElse('key1', 'key2', 'fallback'), 'value1')
      assert.strictEqual(map.getAnyElse('key2', 'key1', 'fallback'), 'value2')
      assert.strictEqual(map.getAnyElse('key3', 'key1', 'fallback'), 'value1')
    })

    it('should return the fallback if no key is set', function () {
      const map = new Map8()
      map.set('key1', 'value1')
      map.set('key2', 'value2')
      assert.strictEqual(map.getAnyElse('key3', 'key4', 'fallback'), 'fallback')
    })

    it('should return the value of the first set nested key chain', function () {
      const map = new Map8()
      map.set('key', 'subkey1', 'value1')
      map.set('key', 'subkey2', 'value2')
      assert.strictEqual(map.getAnyElse(['key', 'subkey1'], ['key', 'subkey2'], 'fallback'), 'value1')
      assert.strictEqual(map.getAnyElse(['key', 'subkey2'], ['key', 'subkey1'], 'fallback'), 'value2')
      assert.strictEqual(map.getAnyElse(['key', 'subkey3'], ['key', 'subkey1'], 'fallback'), 'value1')
    })

    it('should return the fallback if no keychain is set', function () {
      const map = new Map8()
      assert.strictEqual(map.getAnyElse(['key', 'subkey1'], ['key', 'subkey2'], 'fallback'), 'fallback')
    })
  })

  describe('#getElseThrow()', function () {
    it('should return the value for a given key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert.strictEqual(map.getElseThrow('key', Error), 'value')
    })

    it('should throw an Error if the given key is not set', function () {
      const map = new Map8()
      assert.throws(() => { map.getElseThrow('key', 'Test') }, Error)
    })

    it('should throw an Error of the given class if the given key is not set', function () {
      const map = new Map8()
      assert.throws(() => { map.getElseThrow('key', TypeError) }, TypeError)
    })

    it('should throw the given Error object if the given key is not set', function () {
      const map = new Map8()
      assert.throws(() => { map.getElseThrow('key', new RangeError()) }, RangeError)
    })

    it('should return the value for a given nested key', function () {
      const map = new Map8()
      map.set(1, 2, 'value')
      assert.strictEqual(map.getElseThrow(1, 2, Error), 'value')
    })

    it('should throw an error if the given nested key is not set', function () {
      const map = new Map8()
      assert.throws(() => { map.getElseThrow(1, 2, Error) }, Error)
    })
  })

  describe('#getAnyElseThrow()', function () {
    it('should return the value of a single key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert.strictEqual(map.getAnyElseThrow('key', Error), 'value')
    })

    it('should throw an Error if the given single key is not set', function () {
      const map = new Map8()
      assert.throws(() => { map.getAnyElseThrow('key', TypeError) }, TypeError)
    })

    it('should return the value of the first set key', function () {
      const map = new Map8()
      map.set('key1', 'value1')
      map.set('key2', 'value2')
      assert.strictEqual(map.getAnyElseThrow('key1', 'key2', Error), 'value1')
      assert.strictEqual(map.getAnyElseThrow('key2', 'key1', Error), 'value2')
      assert.strictEqual(map.getAnyElseThrow('key3', 'key1', Error), 'value1')
    })

    it('should throw an Error if no key is set', function () {
      const map = new Map8()
      map.set('key1', 'value1')
      map.set('key2', 'value2')
      assert.throws(() => { map.getAnyElseThrow('key3', 'key4', Error) }, Error)
    })

    it('should return the value of the first set nested key chain', function () {
      const map = new Map8()
      map.set('key', 'subkey1', 'value1')
      map.set('key', 'subkey2', 'value2')
      assert.strictEqual(map.getAnyElseThrow(['key', 'subkey1'], ['key', 'subkey2'], Error), 'value1')
      assert.strictEqual(map.getAnyElseThrow(['key', 'subkey2'], ['key', 'subkey1'], Error), 'value2')
      assert.strictEqual(map.getAnyElseThrow(['key', 'subkey3'], ['key', 'subkey1'], Error), 'value1')
    })

    it('should throw an Error if no keychain is set', function () {
      const map = new Map8()
      assert.throws(() => { map.getAnyElseThrow(['key', 'subkey1'], ['key', 'subkey2'], Error) }, Error)
    })
  })

  describe('#getElseSet()', function () {
    it('should return the value of a single key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert.strictEqual(map.getElseSet('key', 123), 'value')
    })

    it('should set the value of a given single key if it is not set', function () {
      const map = new Map8()
      assert.strictEqual(map.getElseSet('key', 'value'), 'value')
    })

    it('should set a given single key via callback if it is not set', function () {
      const map = new Map8()
      assert.strictEqual(map.getElseSet('key', () => 'value'), 'value')
    })

    it('should return the value for a given nested key', function () {
      const map = new Map8()
      map.set('key', 'subkey1', 'value1')
      map.set('key', 'subkey2', 'value2')
      assert.strictEqual(map.getElseSet('key', 'subkey1', 1), 'value1')
      assert.strictEqual(map.getElseSet('key', 'subkey2', 2), 'value2')
    })

    it('should set the value of a given nested key if it is not set', function () {
      const map = new Map8()
      assert.strictEqual(map.getElseSet('key', 'subkey1', 'value1'), 'value1')
    })

    it('should set a given nested key via callback if it is not set', function () {
      const map = new Map8()
      assert.strictEqual(map.getElseSet('key', 'subkey1', () => 'value1'), 'value1')
    })
  })

  describe('#branchSet()', function () {
    it('should configure first layer when setting it for the first time', function () {
      const map = new Map8()
      map.branchSet({multi: true}, 'key', 'value')
      assert(isArrayWith(map.get('key'), 'value'))
    })

    it('should configure first two layers when setting them for the first time', function () {
      const map = new Map8()
      map.branchSet([{loose: true}, {multi: true}], {key: true}, 'subkey', 'value')
      assert(isArrayWith(map.get({key: true}, 'subkey'), 'value'))
    })

    it('should add to existing layer configurations', function () {
      const map = new Map8([], [{loose: true}])
      map.branchSet([{multi: true}], {key: true}, 'subkey', 'value')
      assert(isArrayWith(map.get({key: true}, 'subkey'), 'value'))
    })

    it('should not configure an already-configured layer', function () {
      const map = new Map8()
      map.branchSet({multi: true}, 'key', 'value')
      assert(isArrayWith(map.get('key'), 'value'))
      map.branchSet({loose: true}, {key: true}, 'value')
      assert(isArrayWith(map.get('key'), 'value'))
      assert(isArrayWith(map.get({key: true})))
    })
  })

  describe('#set()', function () {
    it('should set the value for a given key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert.strictEqual(map.get('key'), 'value')
    })

    it('should set the value for a given nested key', function () {
      const map = new Map8()
      map.set('key1', 'key2', 'value')
      assert.strictEqual(map.get('key1', 'key2'), 'value')
    })

    it('should set the given equivalent single key if `loose` is true', function () {
      const map = new Map8([], {loose: true})
      map.set({key: true}, 1)
      assert.strictEqual(map.get({key: true}), 1)
      map.set({key: true}, 2)
      assert.strictEqual(map.get({key: true}), 2)
    })

    it('should set the given equivalent key in a key chain if `loose` is true', function () {
      const map = new Map8([], {loose: true})
      map.set({key: true}, 'key1', 'value')
      map.set({key: true}, 'key2', 'value')
      assert.strictEqual(map.get({key: true}, 'key1'), 'value')
      assert.strictEqual(map.get({key: true}, 'key2'), 'value')
    })

    it('should append new values when `multi` is true', function () {
      const map = new Map8([], {multi: true})
      map.set('key', 1)
      map.set('key', 2)
      assert(isArrayWith(map.get('key'), 1, 2))
    })

    it('should insert keys in sort order when `sortKeys` is true', function () {
      const map = new Map8([], {multi: true, sortKeys: true})
      map.set('key2', 2)
      map.set('key1', 1)
      assert(isArrayWith(map.keysArray(), 'key1', 'key2'))
    })

    it('should insert keys in sort order when `sortKeys` and `weak` are true', function () {
      const map = new Map8([], {multi: true, sortKeys: true, weak: true})
      map.set({}, 3)
      map.set('key2', 2)
      map.set('key1', 1)
      assert(isArrayWith(map.keysArray(), 'key1', 'key2'))
    })

    it('should sort values when `multi` and `sortValues` are true', function () {
      const unsortedMap = new Map8([], {multi: true})
      unsortedMap.set('key', 2)
      unsortedMap.set('key', 1)
      assert(isArrayWith(unsortedMap.get('key'), 2, 1))

      const map = new Map8([], {multi: true, sortValues: true})
      map.set('key', 2)
      map.set('key', 1)
      assert(isArrayWith(map.get('key'), 1, 2))
    })

    it('should throw an error setting a subkey of a key that already has a value', function () {
      const map = new Map8()
      map.set('key1', 'value')
      assert.throws(() => { map.set('key1', 'key2', 'value') })
    })

    it('should overwrite existing subkeys with the provided value', function () {
      const map = new Map8()
      map.set('key1', 'key2', 'value')
      map.set('key1', 'value')
      assert.throws(() => { map.get('key1', 'key2') })
      assert.strictEqual(map.get('key1'), 'value')
    })

    it('should trigger a `setProxy`', function () {
      const map = new Map8([], {
        multi: true,
        setProxy: (k, v) => {
          if (v === 2) throw new Error()
          if (v === 3) return [k, 4]
        },
      })
      map.set('key', 1)
      assert.throws(() => { map.set('key', 2) })
      map.set('key', 3)
      assert(isArrayWith(map.get('key'), 1, 4))
    })
  })

  describe('#branchSetThenGet()', function () {
    it('should configure first layer when setting it for the first time', function () {
      const map = new Map8()
      assert(isArrayWith(map.branchSetThenGet({multi: true}, 'key', 'value'), 'value'))
    })

    it('should configure first two layers when setting them for the first time', function () {
      const map = new Map8()
      assert(isArrayWith(map.branchSetThenGet([{loose: true}, {multi: true}], {key: true}, 'subkey', 'value'), 'value'))
    })

    it('should add to existing layer configurations', function () {
      const map = new Map8([], [{loose: true}])
      assert(isArrayWith(map.branchSetThenGet([{multi: true}], {key: true}, 'subkey', 'value'), 'value'))
    })
  })

  describe('#setThenGet()', function () {
    it('should return the value after setting a single key', function () {
      const map = new Map8()
      assert.strictEqual(map.setThenGet('key', 'value'), 'value')
    })

    it('should return the value after setting a nested key', function () {
      const map = new Map8()
      assert.strictEqual(map.setThenGet('key1', 'key2', 'value'), 'value')
      assert.strictEqual(map.get('key1', 'key2'), 'value')
    })

    it('should return all values if `multi` is `true`', function () {
      const map = new Map8([], {multi: true})
      map.setThenGet('key', 1)
      assert(isArrayWith(map.setThenGet('key', 2), 1, 2))
    })
  })

  describe('#branchSetAll()', function () {
    it('should configure a layer and set multiple entities', function () {
      const map = new Map8()
      map.branchSetAll({multi: true}, ['key', 1], ['key', 2])
      assert(isArrayWith(map.get('key'), 1, 2))
    })
  })

  describe('#setAll()', function () {
    it('should set multiple entries at once', function () {
      const map = new Map8()
      map.setAll(['key1', 1], ['key2', 2])
      assert.strictEqual(map.get('key1'), 1)
      assert.strictEqual(map.get('key2'), 2)
    })

    it('should throw an error if a non-array is provided', function () {
      const map = new Map8()
      assert.throws(() => { map.setAll('key', 'value') }, TypeError)
    })

    it('should throw an error if a key or value is omitted', function () {
      const map = new Map8()
      assert.throws(() => { map.setAll(['key']) }, TypeError)
    })

    it('should set multiple nested entries', function () {
      const map = new Map8()
      map.setAll(['key', 'a', 1], ['key', 'b', 2])
      assert.strictEqual(map.get('key', 'a'), 1)
      assert.strictEqual(map.get('key', 'b'), 2)
    })
  })

  describe('#branchEdit()', function () {
    it('should configure a layer and edit its entities', function () {
      const map = new Map8()
      map.branchEdit({multi: true}, 'key', values => {
        assert(Array.isArray(values))
        return [1]
      })
      assert(isArrayWith(map.get('key'), 1))
    })
  })

  describe('#edit()', function () {
    it('should edit an existing value', function () {
      const map = new Map8()
      map.set('key', 1)
      assert.strictEqual(map.get('key'), 1)
      map.edit('key', n => n + 1)
      assert.strictEqual(map.get('key'), 2)
    })

    it('should pass `undefined` as the existing value argument if key not set', function () {
      const map = new Map8()
      map.edit('key', (x = 3) => x + 1)
      map.edit('key', (x = 3) => x + 1)
      assert.strictEqual(map.get('key'), 5)
    })

    it('should edit an array if `multi` is set', function () {
      const map = new Map8([], {multi: true})
      map.set('key', 1)
      map.set('key', 2)
      assert(isArrayWith(map.get('key'), 1, 2))
      map.edit('key', ns => ns.concat([3]))
      assert(isArrayWith(map.get('key'), 1, 2, 3))
    })
  })

  describe('#branchEditThenGet()', function () {
    it('should configure a layer and edit its entities', function () {
      const map = new Map8()
      assert(isArrayWith(map.branchEditThenGet({multi: true}, 'key', values => {
        assert(Array.isArray(values))
        return [1]
      }), 1))
    })
  })

  describe('#editThenGet()', function () {
    it('should return the value after editing a single key', function () {
      const map = new Map8()
      assert.strictEqual(map.editThenGet('key', () => 'value'), 'value')
    })

    it('should return the value after editing a nested key', function () {
      const map = new Map8()
      assert.strictEqual(map.editThenGet('key1', 'key2', () => 'value'), 'value')
      assert.strictEqual(map.get('key1', 'key2'), 'value')
    })

    it('should return all values if `multi` is `true`', function () {
      const map = new Map8([], {multi: true})
      map.editThenGet('key', () => [1])
      assert(isArrayWith(map.editThenGet('key', values => {
        assert(isArrayWith(values, 1))
        return [1, 2]
      }), 1, 2))
    })
  })

  describe('#delete()', function () {
    it('should delete the value for a given key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(map.has('key'))
      map.delete('key')
      assert(!map.has('key'))
    })

    it('should delete the value for a given nested key', function () {
      const map = new Map8()
      map.set('key1', 'key2', 'value')
      assert.strictEqual(map.get('key1', 'key2'), 'value')
      map.delete('key1', 'key2')
      assert.strictEqual(typeof map.get('key1', 'key2'), 'undefined')
    })

    it('should delete the given equivalent key if `loose` is true', function () {
      const map = new Map8([], {loose: true})
      const key1 = {key: true}
      map.set(key1, 'value')
      assert(map.has(key1))
      const key2 = {key: true}
      assert.strictEqual(map.delete(key2), true)
      assert(!map.has(key1))
    })

    it('should append new values when `multi` is true', function () {
      const map = new Map8([], {multi: true})
      map.set('key', 1)
      map.set('key', 2)
      assert(isArrayWith(map.get('key'), 1, 2))
    })

    it('should work when `sortKeys` is true', function () {
      const map = new Map8([], {sortKeys: true})
      map.set('key', 'value')
      assert(map.hasEntry('key', 'value'))
      map.delete('key')
      assert(!map.hasEntry('key', 'value'))
    })

    it('should work when `weak` is true', function () {
      const map = new Map8([], {weak: true})
      map.set('key', 'value')
      assert(map.hasEntry('key', 'value'))
      map.delete('key')
      assert(!map.hasEntry('key', 'value'))
    })
  })

  describe('#deleteEntry()', function () {
    it('should delete a given value for a given key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(map.has('key'))
      map.deleteEntry('key', 'other')
      assert(map.has('key'))
      map.deleteEntry('key', 'value')
      assert(!map.has('key'))
    })

    it('should delete a given value for a given key in a multi map', function () {
      const map = new Map8([], {multi: true})
      map.set('key', 1)
      map.set('key', 2)
      assert(map.has('key'))
      assert(map.hasEntry('key', 1))
      assert(map.hasEntry('key', 2))
      map.deleteEntry('key', 1)
      assert(!map.hasEntry('key', 1))
      assert(map.hasEntry('key', 2))
      map.deleteEntry('key', 2)
      assert(!map.has('key'))
      assert(!map.hasEntry('key', 1))
      assert(!map.hasEntry('key', 2))
    })
  })

  describe('#deleteValue()', function () {
    it('should delete a given value and its key', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(map.has('key'))
      map.deleteValue('value')
      assert(!map.has('key'))
    })

    it('should delete a given value from a multi-value key', function () {
      const map = new Map8([], {multi: true})
      map.set('key', 1)
      map.set('key', 2)
      assert(map.has('key'))
      assert(map.hasEntry('key', 1))
      assert(map.hasEntry('key', 2))
      map.deleteValue(1)
      assert(map.has('key'))
      assert(!map.hasEntry('key', 1))
      assert(map.hasEntry('key', 2))
    })

    it('should delete a key when its last value is deleted', function () {
      const map = new Map8([], {multi: true})
      map.set('key', 1)
      map.set('key', 2)
      assert(map.has('key'))
      assert(map.hasEntry('key', 1))
      assert(map.hasEntry('key', 2))
      map.deleteValue(1)
      assert(map.has('key'))
      map.deleteValue(2)
      assert(!map.has('key'))
    })

    it('should delete an equivalent value when `looseValues` is `true`', function () {
      const map1 = new Map8()
      map1.set('key', {})
      map1.deleteValue({})
      assert(map1.has('key'))

      const map2 = new Map8([], {looseValues: true})
      map2.set('key', {})
      map2.deleteValue({})
      assert(!map2.has('key'))
    })

    it('should delete a `weak` value', function () {
      const map = new Map8([], {weak: true})
      const value = {}
      map.set('key', value)
      map.deleteValue(value)
      assert(!map.hasEntry('key', value))
      assert(!map.hasKey('key'))
    })
  })

  describe('#toObject()', function () {
    it('should convert a multi-level map into a multi-level object', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('a', 'c', 3)
      map.set('d', 4)
      assert(equals(map.toObject(), {a: {b: [1, 2], c: [3]}, d: 4}))
    })

    it('should throw if multiple keys have equivalent string representations', function () {
      const obj = {}
      assert(equals((new Map8([[{}, 1]])).toObject(), {[obj]: 1}))

      const map = new Map8([[{}, 1], [{}, 2]])
      assert.throws(() => { map.toObject() }, TypeError)
    })
  })

  describe('#entriesArray()', function () {
    it('should return an array of entries', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(equals(map.entriesArray(), [['key', 'value']]))
    })

    it('should return an array of entries with `multi` values', function () {
      const map = new Map8([], {multi: true})
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      assert(equals(map.entriesArray(), [['a', 1], ['a', 2], ['b', 3]]))
    })

    it('should return an array of nested map entry arrays', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.entriesArray(), [['a', [['b', 1], ['b', 2]]], ['c', 3]]))
    })
  })

  describe('#entries()', function () {
    it('should return an entries iterator', function () {
      const map = new Map8()
      map.set('key', 'value')

      const iter = map.entries()
      assert(isIterator(iter))
      assert(equals(iter.next().value, ['key', 'value']))
      assert.strictEqual(iter.next().done, true)
    })
  })

  describe('#deepEntriesArray()', function () {
    it('should return an array of entries', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(equals(map.deepEntriesArray(), [['key', 'value']]))
    })

    it('should return an array of entries with `multi` values', function () {
      const map = new Map8([], {multi: true})
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      assert(equals(map.deepEntriesArray(), [['a', 1], ['a', 2], ['b', 3]]))
    })

    it('should return an array of nested entries', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.deepEntriesArray(), [['a', 'b', 1], ['a', 'b', 2], ['c', 3]]))
    })
  })

  describe('#deepEntries()', function () {
    it('should return a deep-entries iterator', function () {
      const map = new Map8()
      map.set(1, 2, 'value')
      map.set(1, 3, 'value')

      const iter = map.deepEntries()
      assert(isIterator(iter))
      assert(equals(iter.next().value, [1, 2, 'value']))
      assert(equals(iter.next().value, [1, 3, 'value']))
      assert.strictEqual(iter.next().done, true)
    })
  })

  describe('#groupedEntriesArray()', function () {
    it('should return an array of entries', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(equals(map.groupedEntriesArray(), [['key', 'value']]))
    })

    it('should return an array of entries with grouped `multi` values', function () {
      const map = new Map8([], {multi: true})
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      assert(equals(map.groupedEntriesArray(), [['a', [1, 2]], ['b', [3]]]))
    })

    it('should return an array of nested map entry arrays', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.groupedEntriesArray(), [['a', [['b', [1, 2]]]], ['c', 3]]))
    })

    it('should ignore `weak` values', function () {
      const map = new Map8([], [{weak: true}, {multi: true}])
      map.set({}, 'test')
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.groupedEntriesArray(), [['a', [['b', [1, 2]]]], ['c', 3]]))
    })
  })

  describe('#groupedEntries()', function () {
    it('should return an entries iterator', function () {
      const map = new Map8([], {multi: true})
      map.set('key', 1)
      map.set('key', 2)

      const iter = map.groupedEntries()
      assert(isIterator(iter))
      assert(equals(iter.next().value, ['key', [1, 2]]))
      assert.strictEqual(iter.next().done, true)
    })
  })

  describe('#keysArray()', function () {
    it('should return an array of keys', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(equals(map.keysArray(), ['key']))
    })

    it('should return an array of keys with `multi` values', function () {
      const map = new Map8([], {multi: true})
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      assert(equals(map.keysArray(), ['a', 'b']))
    })

    it('should return an array of top-level keys', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.keysArray(), ['a', 'c']))
    })
  })

  describe('#keys()', function () {
    it('should return a keys iterator', function () {
      const map = new Map8()
      map.set('key', 'value')

      const iter = map.keys()
      assert(isIterator(iter))
      assert.strictEqual(iter.next().value, 'key')
      assert.strictEqual(iter.next().done, true)
    })
  })

  describe('#deepKeysArray()', function () {
    it('should return an array of keychains', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(equals(map.deepKeysArray(), [['key']]))
    })

    it('should return an array of keychains with `multi` values', function () {
      const map = new Map8([], {multi: true})
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      assert(equals(map.deepKeysArray(), [['a'], ['b']]))
    })

    it('should return an array of keychains for a multi-level map', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.deepKeysArray(), [['a', 'b'], ['c']]))
    })

    it('should support selecting a subkey', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.deepKeysArray('a'), [['b']]))
    })

    it('should return an empty array selecting a non-map subkey', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.deepKeysArray('c'), []))
    })
  })

  describe('#deepKeys()', function () {
    it('should return a deep-keys iterator', function () {
      const map = new Map8()
      map.set(1, 2, 'value')

      const iter = map.deepKeys()
      assert(isIterator(iter))
      assert(equals(iter.next().value, [1, 2]))
      assert.strictEqual(iter.next().done, true)
    })
  })

  describe('#valuesArray()', function () {
    it('should return an array of values', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(equals(map.valuesArray(), ['value']))
    })

    it('should return a flattened array of `multi` values', function () {
      const map = new Map8([], {multi: true})
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      assert(equals(map.valuesArray(), [1, 2, 3]))
    })
  })

  describe('#values()', function () {
    it('should return a values iterator', function () {
      const map = new Map8()
      map.set('key', 'value')

      const iter = map.values()
      assert(isIterator(iter))
      assert.strictEqual(iter.next().value, 'value')
      assert.strictEqual(iter.next().done, true)
    })
  })

  describe('#deepValuesArray()', function () {
    it('should return an array of values', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(equals(map.deepValuesArray(), ['value']))
    })

    it('should return a flattened array of `multi` values', function () {
      const map = new Map8([], {multi: true})
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      assert(equals(map.deepValuesArray(), [1, 2, 3]))
    })

    it('should return a flattened array of nested values', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.deepValuesArray(), [1, 2, 3]))
    })

    it('should support selecting a subkey', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.deepValuesArray('a'), [1, 2]))
    })

    it('should return an empty array selecting a non-map subkey', function () {
      const map = new Map8([], [{}, {multi: true}])
      map.set('a', 'b', 1)
      map.set('a', 'b', 2)
      map.set('c', 3)
      assert(equals(map.deepValuesArray('c'), []))
    })
  })

  describe('#deepValues()', function () {
    it('should return a deep-values iterator', function () {
      const map = new Map8()
      map.set(1, 2, 3)
      map.set(4, 5)

      const iter = map.deepValues()
      assert(isIterator(iter))
      assert(equals(iter.next().value, 3))
      assert(equals(iter.next().value, 5))
      assert.strictEqual(iter.next().done, true)
    })
  })

  describe('#groupedValuesArray()', function () {
    it('should return an array of values', function () {
      const map = new Map8()
      map.set('key', 'value')
      assert(equals(map.groupedValuesArray(), ['value']))
    })

    it('should return an array of entries with `multi` values', function () {
      const map = new Map8([], {multi: true})
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      assert(equals(map.groupedValuesArray(), [[1, 2], [3]]))
    })
  })
})
