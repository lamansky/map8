# Map8

The most feature-rich drop-in Map replacement ever. Supports sorting, nested layers, customizable loose key comparison, multiple values per key, value time-to-live expiration, and much more. By default, Map8 just acts like a normal built-in Map, so you can enable only what you need.

## Installation

Requires [Node.js](https://nodejs.org/) 8.3.0 or above.

```bash
npm i map8
```

## API

The module exports a single class.

### Constructor Parameters

1. Optional: `entries` (iterable): The initial `[...key, value]` entries for the Map.
2. Optional: `layerOptions` (array): An array of option objects, one for each layer of the map. These options are:
    * `loose` (boolean): Whether or not to compare keys _and_ values loosely. Default is `false`.
    * `looseKeys` (boolean): Whether or not to compare keys loosely. Defaults to the value of `loose`.
    * `looseValues` (boolean): Whether or not to compare values loosely. Defaults to the value of `loose`.
    * `multi` (boolean): Whether or not to allow multiple values per key on this level. If `true`, then the `set` method (for example) will add a value instead of overwriting the existing one. Default is `false`.
    * `ttl` (positive integer): The number of milliseconds a value will remain in the map before it expires. If omitted or set to `0`, value expiration will be disabled.
    * `setProxy` (function): A function that is called whenever a value is set on the current map level. The callback is passed two arguments: the key and the value. The callback may optionally modify the key/value by returning a two-element array. If the callback returns nothing, the key/value will remain as-is. You could also use a set-proxy to validate values and throw errors, for example.
    * `sortKeys` (boolean or array): Whether or not map entries on this level should be sorted by key. Defaults to `false`. If set to `true`, default sorting behavior will be used: numbers and strings will be sorted as-is, and all other values will be coerced to strings before being compared. If `sortKeys` is an array, its elements can be any combination of functions, arrays, or other values. A function will be considered to be a sort callback that will be passed two values and will be expected to return `-1`, `0`, or `1`. An array will be considered to be a nested keychain for Map/Object keys. Any other value will be considered to be a single key for Map/Object keys. User-provided single sort-keys should be wrapped in an array to avoid ambiguity.
    * `sortValues` (boolean or array): Same as `sortKeys`, but for values. Only applies when `multi` is `true`. Defaults to `false`.
    * `weak` (boolean): Whether or not objects should be weakly stored on this level. If set to `true`, objects will be omitted from entry/key/value iterators. Defaults to `false`.

### Methods

For an understanding of what these methods do, please have a look at `test.js` in the source code.

#### Has

* `hasKey (...keys)` (alias: `has`)
* `hasAnyKey (...keys)`
* `hasEntry (...keys, value)`
* `hasValue ([...keys], value)`
* `hasDeepValue ([...keys], value)`

#### Get

* `get (...keys)`
* `getAny (...keys)`
* `getElse (...keys, fallback)`
* `getAnyElse (...keys, fallback)`
* `getElseThrow (...keys, error)`
* `getAnyElseThrow (...keys, error)`
* `getElseSet (...keys, value)`

#### Set

* `branchSet (extraLayerOptions, ...keys, value)`
* `set (...keys, value)`
* `branchSetThenGet (extraLayerOptions, ...keys, value)`
* `setThenGet (...keys, value)`
* `branchSetAll (extraLayerOptions, ...entries)`
* `setAll (...entries)`

#### Edit

* `branchEdit (extraLayerOptions, ...keys, callback)`
* `edit (...keys, callback)`
* `branchEditThenGet (extraLayerOptions, ...keys, callback)`
* `editThenGet (...keys, callback)`
* `branchEditAll (extraLayerOptions, callbacks)`
* `editAll (callbacks)`

#### Delete

* `deleteKey (...keys)` (alias: `delete`)
* `deleteEntry (...keys, value)`
* `deleteValue ([...keys], value)`

#### Entries

* `toObject ([...keys])`
* `entries ([...keys])`
* `entriesArray ([...keys])`
* `groupedEntries ([...keys])`
* `groupedEntriesArray ([...keys])`
* `deepEntries ([...keys])`
* `deepEntriesArray ([...keys])`

#### Keys

* `keys ([...keys])`
* `keysArray ([...keys])`
* `deepKeys ([...keys])`
* `deepKeysArray ([...keys])`

#### Values

* `toObject ([...keys])`
* `values ([...keys])`
* `valuesArray ([...keys])`
* `groupedValues ([...keys])`
* `groupedValuesArray ([...keys])`
* `deepValues ([...keys])`
* `deepValuesArray ([...keys])`
