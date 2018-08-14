'use strict'

const arrify = require('arrify')
const bfind = require('bfind')
const binsert = require('binsert')
const emptyIterator = require('empty-iterator')
const entriesArray = require('entries-array')
const entriesIterator = require('entries-iterator')
const isArrayOfLength = require('is-array-of-length')
const isIterable = require('is-iterable')
const kdel = require('kdel')
const kedit = require('kedit')
const keysArray = require('keys-array')
const keysIterator = require('keys-iterator')
const kget = require('kget')
const khas = require('khas')
const moment = require('moment')
const pfn = require('pfn')
const purge = require('purge')
const set = require('kset')
const toNumber = require('2/number')
const valuesIterator = require('values-iterator')
const valuesArray = require('values-array')
const vfn = require('vfn')
const vhas = require('vhas')
const vdel = require('vdel')
const WeakishMap = require('weakish-map')

const _compare = Symbol('compare')
const _entries = Symbol('entries')
const _find = Symbol('find')
const _getAllByKey = Symbol('getAllByKey')
const _getAllValuesByKey = Symbol('getAllValuesByKey')
const _getConstructor = Symbol('getConstructor')
const _getRootLayer = Symbol('getRootLayer')
const _kOptions = Symbol('kOptions')
const _layerOptions = Symbol('layerOptions')
const _looselyEquals = Symbol('looselyEquals')
const _looseKeys = Symbol('looseKeys')
const _looseValues = Symbol('looseValues')
const _map = Symbol('map')
const _multi = Symbol('multi')
const _removeExpired = Symbol('removeExpired')
const _setProxy = Symbol('setProxy')
const _sortValues = Symbol('sortValues')
const _rootLayer = Symbol('rootLayer')
const _ttl = Symbol('ttl')
const _vOptions = Symbol('vOptions')

const variadicMethods = {
  hasEntry: 0,
  hasValue: 0,
  hasDeepValue: 0,
  getElse: 0,
  getAnyElse: 0,
  getElseThrow: 0,
  getAnyElseThrow: 0,
  getElseSet: 0,
  branchSet: 1,
  set: 0,
  branchSetThenGet: 1,
  setThenGet: 0,
  branchSetAll: 1,
  setAll: 0,
  branchEdit: 1,
  edit: 0,
  branchEditThenGet: 1,
  editThenGet: 0,
  deleteEntry: 0,
  deleteValue: 0,
}

function getFromLayer (layer, key, options, notFound) {
  if (!(layer instanceof Map8Layer)) throw new RangeError('Map does not extend to this level')
  return layer.getElse(key, notFound)
}

class Map8 {
  constructor (entries, layerOptions) {
    if (arguments.length === 1 && !isIterable(entries)) {
      layerOptions = entries
      entries = []
    }
    layerOptions = arrify(layerOptions)
    this[_layerOptions] = layerOptions
    if (entries) this.setAll(...entries)
  }

  [_getRootLayer] (extraLayerOptions) {
    if (!this[_rootLayer]) this[_rootLayer] = this[_getConstructor](extraLayerOptions)(-1)
    return this[_rootLayer]
  }

  has (...keys) {
    return khas(this[_getRootLayer](), keys, {get (layer, key, options, notFound) {
      if (!(layer instanceof Map8Layer)) throw new RangeError('Map does not extend to this level')
      return layer.has(key) ? layer.get(key) : notFound
    }})
  }

  hasKey (...keys) {
    return this.has(...keys)
  }

  hasAnyKey (...keys) {
    return khas.any(this[_getRootLayer](), keys, {get: getFromLayer})
  }

  hasEntry (keys, value) {
    if (!keys.length) return false
    const key = keys.pop()
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.hasEntry(key, value) : false
  }

  hasValue (keys, value) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.hasValue(value) : false
  }

  hasDeepValue (keys, value) {
    if (this.hasValue(...keys, value)) return true
    for (const v of this.deepValues(...keys)) {
      if (v === value) return true
    }
    return false
  }

  get (...keys) {
    return kget(this[_getRootLayer](), keys, {get: getFromLayer})
  }

  getAny (...keys) {
    return kget.any(this[_getRootLayer](), keys, {get: getFromLayer})
  }

  getElse (keys, fallback) {
    return kget(this[_getRootLayer](), keys, {elseReturn: fallback, get: getFromLayer, maps: Map8Layer})
  }

  getAnyElse (keys, elseReturn) {
    return kget.any(this[_getRootLayer](), keys, {elseReturn, get: getFromLayer, maps: Map8Layer})
  }

  getElseThrow (keys, error) {
    return kget(this[_getRootLayer](), keys, {elseThrow: error, get: getFromLayer, maps: Map8Layer})
  }

  getAnyElseThrow (keys, error) {
    return kget.any(this[_getRootLayer](), keys, {elseThrow: error, get: getFromLayer, maps: Map8Layer})
  }

  getElseSet (keys, value) {
    return this.has(...keys) ? this.get(...keys) : this.setThenGet(...keys, pfn(value, value)())
  }

  [_getConstructor] (extraLayerOptions = []) {
    const layerOptions = this[_layerOptions].concat(arrify(extraLayerOptions))
    return i => new Map8Layer(layerOptions[i + 1])
  }

  branchSet (extraLayerOptions, keys, value) {
    set(this[_getRootLayer](extraLayerOptions), keys, value, {construct: this[_getConstructor](extraLayerOptions), get: getFromLayer, maps: Map8Layer})
    return this
  }

  set (keys, value) {
    return this.branchSet([], ...keys, value)
  }

  branchSetThenGet (extraLayerOptions, keys, value) {
    this.branchSet(extraLayerOptions, ...keys, value)
    return this.get(...keys)
  }

  setThenGet (keys, value) {
    return this.branchSetThenGet([], ...keys, value)
  }

  branchSetAll (extraLayerOptions, entries) {
    for (const keys of entries) {
      if (!Array.isArray(keys)) throw new TypeError('Key-value pairs must be arrays')
      if (keys.length === 0) continue
      if (keys.length === 1) throw new TypeError('Must provide both a key and a value')
      const value = keys.pop()
      this.branchSet(extraLayerOptions, ...keys, value)
    }
    return this
  }

  setAll (entries) {
    return this.branchSetAll([], ...entries)
  }

  branchEdit (extraLayerOptions, keys, callback) {
    this.branchEditThenGet(extraLayerOptions, ...keys, callback)
    return this
  }

  edit (keys, callback) {
    this.branchEditThenGet([], ...keys, callback)
    return this
  }

  branchEditThenGet (extraLayerOptions, keys, callback) {
    return kedit(this[_getRootLayer](extraLayerOptions), keys, callback, {
      construct: this[_getConstructor](extraLayerOptions),
      get: getFromLayer,
      maps: Map8Layer,
      set: (layer, key, values, options, defaultSet) => {
        if ((layer instanceof Map8Layer) && layer.multi) {
          if (!Array.isArray(values)) throw new TypeError('Edit callback must return an array')
          layer.delete(key)
          for (const value of arrify(values)) layer.set(key, value)
        } else {
          defaultSet()
        }
      },
    })
  }

  editThenGet (keys, callback) {
    return this.branchEditThenGet([], ...keys, callback)
  }

  branchEditAll (extraLayerOptions, callbacks) {
    for (const [keys, callback] of callbacks) this.branchEditThenGet(extraLayerOptions, keys, callback)
    return this
  }

  editAll (callbacks) {
    return this.branchEditAll([], callbacks)
  }

  delete (...keys) {
    return kdel(this[_getRootLayer](), keys, {get: getFromLayer, maps: Map8Layer})
  }

  deleteKey (...keys) {
    return this.delete(...keys)
  }

  deleteEntry (keys, value) {
    if (!keys.length) return false
    const key = keys.pop()
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.deleteEntry(key, value) : false
  }

  deleteValue (keys, value) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.deleteValue(value) : false
  }

  toObject (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.toObject() : {}
  }

  toJSON () {
    return this.toObject()
  }

  entries (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.entries() : entriesIterator(layer)
  }

  entriesArray (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.entriesArray() : entriesArray(layer)
  }

  groupedEntries (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.groupedEntries() : emptyIterator()
  }

  groupedEntriesArray (...keys) {
    return Array.from(this.groupedEntries(...keys))
  }

  deepEntries (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.deepEntries() : emptyIterator()
  }

  deepEntriesArray (...keys) {
    return Array.from(this.deepEntries(...keys))
  }

  keys (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.keys() : keysIterator(layer)
  }

  keysArray (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.keysArray() : keysArray(layer)
  }

  deepKeys (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.deepKeys() : emptyIterator()
  }

  deepKeysArray (...keys) {
    return Array.from(this.deepKeys(...keys))
  }

  values (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.values() : valuesIterator(layer)
  }

  valuesArray (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.valuesArray() : valuesArray(layer)
  }

  deepValues (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.deepValues() : emptyIterator()
  }

  deepValuesArray (...keys) {
    return Array.from(this.deepValues(...keys))
  }

  groupedValues (...keys) {
    const layer = keys.length ? this.get(...keys) : this[_getRootLayer]()
    return layer instanceof Map8Layer ? layer.groupedValues() : emptyIterator()
  }

  groupedValuesArray (...keys) {
    return Array.from(this.groupedValues(...keys))
  }
}

for (const [func, variadicIndex] of Object.entries(variadicMethods)) {
  Map8.prototype[func] = vfn(variadicIndex, Map8.prototype[func])
}

class Map8Layer {
  constructor (options = {}) {
    const {loose, looseKeys = loose, looseValues = loose, looselyEquals, multi, ttl, setProxy, weak} = options
    let {sortKeys, sortValues} = options
    if (sortKeys === true) sortKeys = []
    if (sortValues === true) sortValues = []

    this[_kOptions] = {loose: looseKeys, looselyEquals, maps: SortedMap, weakMaps: WeakishMap}
    this[_vOptions] = {loose: looseValues, looselyEquals} // We want WeakishMap to be considered a strong map for the v* functions because it can iterate entries
    this[_looselyEquals] = looselyEquals
    this[_looseKeys] = looseKeys
    this[_looseValues] = looseValues
    this[_map] = weak ? new WeakishMap([], sortKeys ? {strongMap: () => new SortedMap(sortKeys)} : {}) : sortKeys ? new SortedMap(sortKeys) : new Map()
    this[_multi] = !!multi
    this[_setProxy] = setProxy
    this[_sortValues] = sortValues
    this[_ttl] = Math.abs(toNumber(ttl, {round: true}))
  }

  get multi () {
    return this[_multi]
  }

  [_removeExpired] (arr) {
    if (this[_ttl]) purge(arr, ({datetimeSet}) => -datetimeSet.diff() > this[_ttl])
    return arr
  }

  [_getAllByKey] (key) {
    const values = this[_removeExpired](kget(this[_map], [key], {elseReturn: [], ...this[_kOptions]}))
    if (values.length === 0) this.delete(key)
    return values
  }

  [_getAllValuesByKey] (key) {
    return this[_getAllByKey](key).map(({value}) => value)
  }

  has (key) {
    return this[_getAllByKey](key).length > 0
  }

  hasEntry (key, value) {
    return vhas(this[_getAllValuesByKey](key), value, this[_vOptions])
  }

  hasValue (value) {
    return Array.from(this[_map].entries()).some(
      ([key, values]) => vhas(this[_getAllValuesByKey](key), value, this[_vOptions])
    )
  }

  get (key) {
    return this.getElse(key)
  }

  getElse (key, fallback) {
    const values = this[_getAllValuesByKey](key)
    if (this[_multi]) return values
    if (values.length === 0) return fallback
    return values[0]
  }

  set (key, value) {
    if (this[_setProxy]) {
      const proxyReturn = this[_setProxy](key, value)
      if (isArrayOfLength(proxyReturn, 2)) [key, value] = proxyReturn
    }

    const items = this[_getAllByKey](key)

    if (items.length === 0) {
      this[_map].set(key, items)
    }

    const item = {datetimeSet: moment(), value}

    if (items.length === 0 || this[_multi]) {
      if (this[_sortValues]) {
        binsert({
          compare: this[_sortValues],
          get: i => items[i].value,
          length: items.length,
          insert: i => { items.splice(i, 0, item) },
          value: item.value,
        })
      } else {
        items.push(item)
      }
    } else {
      items[0] = item
    }

    return this
  }

  delete (key) {
    return kdel(this[_map], [key], this[_kOptions])
  }

  deleteEntry (key, value) {
    return vdel(this[_getAllByKey](key), value, {compareBy: 'value', ...this[_vOptions]})
  }

  deleteValue (value) {
    return Array.from(this[_map].entries()).reduce(
      (itemsDeleted, [key, values]) => itemsDeleted + vdel(this[_removeExpired](values), value, {compareBy: 'value', ...this[_vOptions]}), 0
    )
  }

  clear () {
    return this[_map].clear()
  }

  toObject () {
    const obj = {}
    for (let [key, values] of this[_map].entries()) { // eslint-disable-line prefer-const
      if (this[_removeExpired](values).length === 0) continue
      values = values.map(({value}) => {
        if (value instanceof Map8Layer) value = value.toObject()
        return value
      })
      if (!this[_multi]) values = values[0]
      if (key in obj) throw new TypeError('Multiple keys have equivalent string representations and would overwrite each other in the generated object')
      obj[key] = values
    }
    return obj
  }

  * entries () {
    for (const [key, values] of this[_map].entries()) {
      yield * this[_removeExpired](values).map(({value}) => {
        if (value instanceof Map8Layer) value = value.entriesArray()
        return [key, value]
      })
    }
  }

  entriesArray () {
    return Array.from(this.entries())
  }

  * deepEntries () {
    for (const [key, values] of this[_map].entries()) {
      if (this[_removeExpired](values).length === 0) continue
      for (const {value} of values) {
        if (value instanceof Map8Layer) {
          for (const subentry of value.deepEntries()) {
            yield [key, ...subentry]
          }
        } else {
          yield [key, value]
        }
      }
    }
  }

  deepEntriesArray () {
    return Array.from(this.deepEntries())
  }

  * groupedEntries () {
    for (let [key, values] of this[_map].entries()) { // eslint-disable-line prefer-const
      if (this[_removeExpired](values).length === 0) continue
      values = values.map(({value}) => {
        if (value instanceof Map8Layer) value = value.groupedEntriesArray()
        return value
      })
      if (!this[_multi]) values = values[0]
      yield [key, values]
    }
  }

  groupedEntriesArray () {
    return Array.from(this.groupedEntries())
  }

  * keys () {
    for (const [key, values] of this[_map].entries()) {
      if (this[_removeExpired](values).length > 0) yield key
    }
  }

  keysArray () {
    return Array.from(this.keys())
  }

  * deepKeys () {
    for (const [key, values] of this[_map].entries()) {
      if (this[_removeExpired](values).length === 0) continue
      let yieldedSubkeys = false
      for (const {value} of values) {
        if (value instanceof Map8Layer) {
          for (const subkeys of value.deepKeys()) {
            yieldedSubkeys = true
            yield [key, ...subkeys]
          }
        }
      }
      if (!yieldedSubkeys) yield [key]
    }
  }

  deepKeysArray () {
    return Array.from(this.deepKeys())
  }

  * values () {
    for (const [, values] of this[_map].entries()) {
      yield * this[_removeExpired](values).map(data => data.value)
    }
  }

  valuesArray () {
    return Array.from(this.values())
  }

  * deepValues () {
    for (const [, values] of this[_map].entries()) {
      if (this[_removeExpired](values).length === 0) continue
      for (const {value} of values) {
        if (value instanceof Map8Layer) {
          yield * value.deepValues()
        } else {
          yield value
        }
      }
    }
  }

  deepValuesArray () {
    return Array.from(this.deepValues())
  }

  * groupedValues () {
    for (let values of this[_map].values()) {
      if (this[_removeExpired](values).length === 0) return []
      values = values.map(
        ({value}) => (value instanceof Map8Layer) ? value.groupedValuesArray() : value
      )
      if (!this[_multi]) values = values[0]
      yield values
    }
  }

  groupedValuesArray () {
    return Array.from(this.groupedValues())
  }
}

class SortedMap {
  constructor (compare) {
    this[_compare] = compare
    this[_entries] = []
  }

  [_find] (value) {
    return bfind({
      compare: this[_compare],
      get: i => this[_entries][i][0],
      length: this[_entries].length,
      multiple: 'identical',
      value,
    })
  }

  has (key) {
    return this[_find](key).identical
  }

  get (key) {
    const {identical, index} = this[_find](key)
    if (identical) return this[_entries][index][1]
  }

  set (key, value) {
    binsert({
      compare: this[_compare],
      get: i => this[_entries][i][0],
      length: this[_entries].length,
      insert: i => { this[_entries].splice(i, 0, [key, value]) },
      set: i => { this[_entries][i][1] = value },
      unique: true,
    })
  }

  delete (key) {
    const {found, index} = this[_find](key)
    if (found) this[_entries].splice(index, 1)
    return found
  }

  entriesArray () {
    return this[_entries].slice()
  }

  entries () {
    return this.entriesArray()[Symbol.iterator]()
  }

  keysArray () {
    return this[_entries].map(([k, v]) => k)
  }

  keys () {
    return this.keysArray()[Symbol.iterator]()
  }

  valuesArray () {
    return this[_entries].map(([k, v]) => v)
  }

  values () {
    return this.valuesArray()[Symbol.iterator]()
  }
}

module.exports = Map8
