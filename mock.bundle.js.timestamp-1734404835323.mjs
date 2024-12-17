import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "node:module";
var __webpack_modules__ = ({
"1995": (function (module, __unused_webpack_exports, __webpack_require__) {
module.exports = {
    parallel: __webpack_require__(3550),
    serial: __webpack_require__(6636),
    serialOrdered: __webpack_require__(8999)
};


}),
"2399": (function (module) {
// API
module.exports = abort;
/**
 * Aborts leftover active jobs
 *
 * @param {object} state - current state object
 */ function abort(state) {
    Object.keys(state.jobs).forEach(clean.bind(state));
    // reset leftover jobs
    state.jobs = {};
}
/**
 * Cleans up leftover job by invoking abort function for the provided job id
 *
 * @this  state
 * @param {string|number} key - job id to abort
 */ function clean(key) {
    if (typeof this.jobs[key] == 'function') {
        this.jobs[key]();
    }
}


}),
"8249": (function (module, __unused_webpack_exports, __webpack_require__) {
var defer = __webpack_require__(6685);
// API
module.exports = async;
/**
 * Runs provided callback asynchronously
 * even if callback itself is not
 *
 * @param   {function} callback - callback to invoke
 * @returns {function} - augmented callback
 */ function async(callback) {
    var isAsync = false;
    // check if async happened
    defer(function() {
        isAsync = true;
    });
    return function async_callback(err, result) {
        if (isAsync) {
            callback(err, result);
        } else {
            defer(function nextTick_callback() {
                callback(err, result);
            });
        }
    };
}


}),
"6685": (function (module) {
module.exports = defer;
/**
 * Runs provided function on next iteration of the event loop
 *
 * @param {function} fn - function to run
 */ function defer(fn) {
    var nextTick = typeof setImmediate == 'function' ? setImmediate : typeof process == 'object' && typeof process.nextTick == 'function' ? process.nextTick : null;
    if (nextTick) {
        nextTick(fn);
    } else {
        setTimeout(fn, 0);
    }
}


}),
"9024": (function (module, __unused_webpack_exports, __webpack_require__) {
var async = __webpack_require__(8249), abort = __webpack_require__(2399);
// API
module.exports = iterate;
/**
 * Iterates over each job object
 *
 * @param {array|object} list - array or object (named list) to iterate over
 * @param {function} iterator - iterator to run
 * @param {object} state - current job status
 * @param {function} callback - invoked when all elements processed
 */ function iterate(list, iterator, state, callback) {
    // store current index
    var key = state['keyedList'] ? state['keyedList'][state.index] : state.index;
    state.jobs[key] = runJob(iterator, key, list[key], function(error, output) {
        // don't repeat yourself
        // skip secondary callbacks
        if (!(key in state.jobs)) {
            return;
        }
        // clean up jobs
        delete state.jobs[key];
        if (error) {
            // don't process rest of the results
            // stop still active jobs
            // and reset the list
            abort(state);
        } else {
            state.results[key] = output;
        }
        // return salvaged results
        callback(error, state.results);
    });
}
/**
 * Runs iterator over provided job element
 *
 * @param   {function} iterator - iterator to invoke
 * @param   {string|number} key - key/index of the element in the list of jobs
 * @param   {mixed} item - job description
 * @param   {function} callback - invoked after iterator is done with the job
 * @returns {function|mixed} - job abort function or something else
 */ function runJob(iterator, key, item, callback) {
    var aborter;
    // allow shortcut if iterator expects only two arguments
    if (iterator.length == 2) {
        aborter = iterator(item, async(callback));
    } else {
        aborter = iterator(item, key, async(callback));
    }
    return aborter;
}


}),
"2844": (function (module) {
// API
module.exports = state;
/**
 * Creates initial state object
 * for iteration over list
 *
 * @param   {array|object} list - list to iterate over
 * @param   {function|null} sortMethod - function to use for keys sort,
 *                                     or `null` to keep them as is
 * @returns {object} - initial state object
 */ function state(list, sortMethod) {
    var isNamedList = !Array.isArray(list), initState = {
        index: 0,
        keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
        jobs: {},
        results: isNamedList ? {} : [],
        size: isNamedList ? Object.keys(list).length : list.length
    };
    if (sortMethod) {
        // sort array keys based on it's values
        // sort object's keys just on own merit
        initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
            return sortMethod(list[a], list[b]);
        });
    }
    return initState;
}


}),
"1279": (function (module, __unused_webpack_exports, __webpack_require__) {
var abort = __webpack_require__(2399), async = __webpack_require__(8249);
// API
module.exports = terminator;
/**
 * Terminates jobs in the attached state context
 *
 * @this  AsyncKitState#
 * @param {function} callback - final callback to invoke after termination
 */ function terminator(callback) {
    if (!Object.keys(this.jobs).length) {
        return;
    }
    // fast forward iteration index
    this.index = this.size;
    // abort jobs
    abort(this);
    // send back results we have so far
    async(callback)(null, this.results);
}


}),
"3550": (function (module, __unused_webpack_exports, __webpack_require__) {
var iterate = __webpack_require__(9024), initState = __webpack_require__(2844), terminator = __webpack_require__(1279);
// Public API
module.exports = parallel;
/**
 * Runs iterator over provided array elements in parallel
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function parallel(list, iterator, callback) {
    var state = initState(list);
    while(state.index < (state['keyedList'] || list).length){
        iterate(list, iterator, state, function(error, result) {
            if (error) {
                callback(error, result);
                return;
            }
            // looks like it's the last one
            if (Object.keys(state.jobs).length === 0) {
                callback(null, state.results);
                return;
            }
        });
        state.index++;
    }
    return terminator.bind(state, callback);
}


}),
"6636": (function (module, __unused_webpack_exports, __webpack_require__) {
var serialOrdered = __webpack_require__(8999);
// Public API
module.exports = serial;
/**
 * Runs iterator over provided array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function serial(list, iterator, callback) {
    return serialOrdered(list, iterator, null, callback);
}


}),
"8999": (function (module, __unused_webpack_exports, __webpack_require__) {
var iterate = __webpack_require__(9024), initState = __webpack_require__(2844), terminator = __webpack_require__(1279);
// Public API
module.exports = serialOrdered;
// sorting helpers
module.exports.ascending = ascending;
module.exports.descending = descending;
/**
 * Runs iterator over provided sorted array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} sortMethod - custom sort function
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function serialOrdered(list, iterator, sortMethod, callback) {
    var state = initState(list, sortMethod);
    iterate(list, iterator, state, function iteratorHandler(error, result) {
        if (error) {
            callback(error, result);
            return;
        }
        state.index++;
        // are we there yet?
        if (state.index < (state['keyedList'] || list).length) {
            iterate(list, iterator, state, iteratorHandler);
            return;
        }
        // done here
        callback(null, state.results);
    });
    return terminator.bind(state, callback);
}
/*
 * -- Sort methods
 */ /**
 * sort helper to sort array elements in ascending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */ function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
/**
 * sort helper to sort array elements in descending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */ function descending(a, b) {
    return -1 * ascending(a, b);
}


}),
"3465": (function (module, __unused_webpack_exports, __webpack_require__) {

var bind = __webpack_require__(4988);
var $apply = __webpack_require__(8329);
var $call = __webpack_require__(2814);
var $reflectApply = __webpack_require__(9790);
/** @type {import('./actualApply')} */ module.exports = $reflectApply || bind.call($call, $apply);


}),
"3817": (function (module, __unused_webpack_exports, __webpack_require__) {

var bind = __webpack_require__(4988);
var $apply = __webpack_require__(8329);
var actualApply = __webpack_require__(3465);
/** @type {import('./applyBind')} */ module.exports = function applyBind() {
    return actualApply(bind, $apply, arguments);
};


}),
"8329": (function (module) {

/** @type {import('./functionApply')} */ module.exports = Function.prototype.apply;


}),
"2814": (function (module) {

/** @type {import('./functionCall')} */ module.exports = Function.prototype.call;


}),
"2950": (function (module, __unused_webpack_exports, __webpack_require__) {

var bind = __webpack_require__(4988);
var $TypeError = __webpack_require__(9343);
var $call = __webpack_require__(2814);
var $actualApply = __webpack_require__(3465);
/** @type {import('.')} */ module.exports = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== 'function') {
        throw new $TypeError('a function is required');
    }
    return $actualApply(bind, $call, args);
};


}),
"9790": (function (module) {

/** @type {import('./reflectApply')} */ module.exports = typeof Reflect === 'function' && Reflect.apply;


}),
"7677": (function (module, __unused_webpack_exports, __webpack_require__) {

var GetIntrinsic = __webpack_require__(110);
var callBind = __webpack_require__(4606);
var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));
module.exports = function callBoundIntrinsic(name, allowMissing) {
    var intrinsic = GetIntrinsic(name, !!allowMissing);
    if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
        return callBind(intrinsic);
    }
    return intrinsic;
};


}),
"4606": (function (module, __unused_webpack_exports, __webpack_require__) {

var setFunctionLength = __webpack_require__(552);
var $defineProperty = __webpack_require__(8947);
var callBindBasic = __webpack_require__(2950);
var applyBind = __webpack_require__(3817);
module.exports = function callBind(originalFunction) {
    var func = callBindBasic(arguments);
    var adjustedLength = originalFunction.length - (arguments.length - 1);
    return setFunctionLength(func, 1 + (adjustedLength > 0 ? adjustedLength : 0), true);
};
if ($defineProperty) {
    $defineProperty(module.exports, 'apply', {
        value: applyBind
    });
} else {
    module.exports.apply = applyBind;
}


}),
"4166": (function (module, __unused_webpack_exports, __webpack_require__) {
var util = __webpack_require__(3837);
var Stream = (__webpack_require__(2781)/* .Stream */.Stream);
var DelayedStream = __webpack_require__(4571);
module.exports = CombinedStream;
function CombinedStream() {
    this.writable = false;
    this.readable = true;
    this.dataSize = 0;
    this.maxDataSize = 2 * 1024 * 1024;
    this.pauseStreams = true;
    this._released = false;
    this._streams = [];
    this._currentStream = null;
    this._insideLoop = false;
    this._pendingNext = false;
}
util.inherits(CombinedStream, Stream);
CombinedStream.create = function(options) {
    var combinedStream = new this();
    options = options || {};
    for(var option in options){
        combinedStream[option] = options[option];
    }
    return combinedStream;
};
CombinedStream.isStreamLike = function(stream) {
    return typeof stream !== 'function' && typeof stream !== 'string' && typeof stream !== 'boolean' && typeof stream !== 'number' && !Buffer.isBuffer(stream);
};
CombinedStream.prototype.append = function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
        if (!(stream instanceof DelayedStream)) {
            var newStream = DelayedStream.create(stream, {
                maxDataSize: Infinity,
                pauseStream: this.pauseStreams
            });
            stream.on('data', this._checkDataSize.bind(this));
            stream = newStream;
        }
        this._handleErrors(stream);
        if (this.pauseStreams) {
            stream.pause();
        }
    }
    this._streams.push(stream);
    return this;
};
CombinedStream.prototype.pipe = function(dest, options) {
    Stream.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
};
CombinedStream.prototype._getNext = function() {
    this._currentStream = null;
    if (this._insideLoop) {
        this._pendingNext = true;
        return; // defer call
    }
    this._insideLoop = true;
    try {
        do {
            this._pendingNext = false;
            this._realGetNext();
        }while (this._pendingNext);
    } finally{
        this._insideLoop = false;
    }
};
CombinedStream.prototype._realGetNext = function() {
    var stream = this._streams.shift();
    if (typeof stream == 'undefined') {
        this.end();
        return;
    }
    if (typeof stream !== 'function') {
        this._pipeNext(stream);
        return;
    }
    var getStream = stream;
    getStream((function(stream) {
        var isStreamLike = CombinedStream.isStreamLike(stream);
        if (isStreamLike) {
            stream.on('data', this._checkDataSize.bind(this));
            this._handleErrors(stream);
        }
        this._pipeNext(stream);
    }).bind(this));
};
CombinedStream.prototype._pipeNext = function(stream) {
    this._currentStream = stream;
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
        stream.on('end', this._getNext.bind(this));
        stream.pipe(this, {
            end: false
        });
        return;
    }
    var value = stream;
    this.write(value);
    this._getNext();
};
CombinedStream.prototype._handleErrors = function(stream) {
    var self = this;
    stream.on('error', function(err) {
        self._emitError(err);
    });
};
CombinedStream.prototype.write = function(data) {
    this.emit('data', data);
};
CombinedStream.prototype.pause = function() {
    if (!this.pauseStreams) {
        return;
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == 'function') this._currentStream.pause();
    this.emit('pause');
};
CombinedStream.prototype.resume = function() {
    if (!this._released) {
        this._released = true;
        this.writable = true;
        this._getNext();
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == 'function') this._currentStream.resume();
    this.emit('resume');
};
CombinedStream.prototype.end = function() {
    this._reset();
    this.emit('end');
};
CombinedStream.prototype.destroy = function() {
    this._reset();
    this.emit('close');
};
CombinedStream.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
};
CombinedStream.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
        return;
    }
    var message = 'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
    this._emitError(new Error(message));
};
CombinedStream.prototype._updateDataSize = function() {
    this.dataSize = 0;
    var self = this;
    this._streams.forEach(function(stream) {
        if (!stream.dataSize) {
            return;
        }
        self.dataSize += stream.dataSize;
    });
    if (this._currentStream && this._currentStream.dataSize) {
        this.dataSize += this._currentStream.dataSize;
    }
};
CombinedStream.prototype._emitError = function(err) {
    this._reset();
    this.emit('error', err);
};


}),
"2872": (function (__unused_webpack_module, exports) {

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.parse = parse;
exports.serialize = serialize;
/**
 * RegExp to match cookie-name in RFC 6265 sec 4.1.1
 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
 * which has been replaced by the token definition in RFC 7230 appendix B.
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 *
 * Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
 * Allow same range as cookie value, except `=`, which delimits end of name.
 */ const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
/**
 * RegExp to match cookie-value in RFC 6265 sec 4.1.1
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 *
 * Allowing more characters: https://github.com/jshttp/cookie/issues/191
 * Comma, backslash, and DQUOTE are not part of the parsing algorithm.
 */ const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
/**
 * RegExp to match domain-value in RFC 6265 sec 4.1.1
 *
 * domain-value      = <subdomain>
 *                     ; defined in [RFC1034], Section 3.5, as
 *                     ; enhanced by [RFC1123], Section 2.1
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     Labels must be 63 characters or less.
 *                     'let-dig' not 'letter' in the first char, per RFC1123
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = any one of the 52 alphabetic characters A through Z in
 *                     upper case and a through z in lower case
 * <digit>           = any one of the ten digits 0 through 9
 *
 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
 *
 * > (Note that a leading %x2E ("."), if present, is ignored even though that
 * character is not permitted, but a trailing %x2E ("."), if present, will
 * cause the user agent to ignore the attribute.)
 */ const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
/**
 * RegExp to match path-value in RFC 6265 sec 4.1.1
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; defined in RFC 5234 appendix B.1
 */ const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
const __toString = Object.prototype.toString;
const NullObject = /* @__PURE__ */ (()=>{
    const C = function() {};
    C.prototype = Object.create(null);
    return C;
})();
/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */ function parse(str, options) {
    const obj = new NullObject();
    const len = str.length;
    // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
    if (len < 2) return obj;
    const dec = options?.decode || decode;
    let index = 0;
    do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) break; // No more cookie pairs.
        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
            // backtrack on prior semicolon
            index = str.lastIndexOf(";", eqIdx - 1) + 1;
            continue;
        }
        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);
        // only assign once
        if (obj[key] === undefined) {
            let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
            let valEndIdx = endIndex(str, endIdx, valStartIdx);
            const value = dec(str.slice(valStartIdx, valEndIdx));
            obj[key] = value;
        }
        index = endIdx + 1;
    }while (index < len);
    return obj;
}
function startIndex(str, index, max) {
    do {
        const code = str.charCodeAt(index);
        if (code !== 0x20 /*   */  && code !== 0x09 /* \t */ ) return index;
    }while (++index < max);
    return max;
}
function endIndex(str, index, min) {
    while(index > min){
        const code = str.charCodeAt(--index);
        if (code !== 0x20 /*   */  && code !== 0x09 /* \t */ ) return index + 1;
    }
    return min;
}
/**
 * Serialize data into a cookie header.
 *
 * Serialize a name value pair into a cookie string suitable for
 * http headers. An optional options object specifies cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 */ function serialize(name, val, options) {
    const enc = options?.encode || encodeURIComponent;
    if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
    }
    const value = enc(val);
    if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
    }
    let str = name + "=" + value;
    if (!options) return str;
    if (options.maxAge !== undefined) {
        if (!Number.isInteger(options.maxAge)) {
            throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str += "; Max-Age=" + options.maxAge;
    }
    if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
            throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str += "; Domain=" + options.domain;
    }
    if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
            throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str += "; Path=" + options.path;
    }
    if (options.expires) {
        if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
            throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str += "; Expires=" + options.expires.toUTCString();
    }
    if (options.httpOnly) {
        str += "; HttpOnly";
    }
    if (options.secure) {
        str += "; Secure";
    }
    if (options.partitioned) {
        str += "; Partitioned";
    }
    if (options.priority) {
        const priority = typeof options.priority === "string" ? options.priority.toLowerCase() : undefined;
        switch(priority){
            case "low":
                str += "; Priority=Low";
                break;
            case "medium":
                str += "; Priority=Medium";
                break;
            case "high":
                str += "; Priority=High";
                break;
            default:
                throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
    }
    if (options.sameSite) {
        const sameSite = typeof options.sameSite === "string" ? options.sameSite.toLowerCase() : options.sameSite;
        switch(sameSite){
            case true:
            case "strict":
                str += "; SameSite=Strict";
                break;
            case "lax":
                str += "; SameSite=Lax";
                break;
            case "none":
                str += "; SameSite=None";
                break;
            default:
                throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
    }
    return str;
}
/**
 * URL-decode string value. Optimized to skip native call when no %.
 */ function decode(str) {
    if (str.indexOf("%") === -1) return str;
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
}
/**
 * Determine if value is a Date.
 */ function isDate(val) {
    return __toString.call(val) === "[object Date]";
} //# sourceMappingURL=index.js.map


}),
"3308": (function (module, exports, __webpack_require__) {
/* eslint-env browser */ /**
 * This is the web browser implementation of `debug()`.
 */ exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (()=>{
    let warned = false;
    return ()=>{
        if (!warned) {
            warned = true;
            console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
        }
    };
})();
/**
 * Colors.
 */ exports.colors = [
    '#0000CC',
    '#0000FF',
    '#0033CC',
    '#0033FF',
    '#0066CC',
    '#0066FF',
    '#0099CC',
    '#0099FF',
    '#00CC00',
    '#00CC33',
    '#00CC66',
    '#00CC99',
    '#00CCCC',
    '#00CCFF',
    '#3300CC',
    '#3300FF',
    '#3333CC',
    '#3333FF',
    '#3366CC',
    '#3366FF',
    '#3399CC',
    '#3399FF',
    '#33CC00',
    '#33CC33',
    '#33CC66',
    '#33CC99',
    '#33CCCC',
    '#33CCFF',
    '#6600CC',
    '#6600FF',
    '#6633CC',
    '#6633FF',
    '#66CC00',
    '#66CC33',
    '#9900CC',
    '#9900FF',
    '#9933CC',
    '#9933FF',
    '#99CC00',
    '#99CC33',
    '#CC0000',
    '#CC0033',
    '#CC0066',
    '#CC0099',
    '#CC00CC',
    '#CC00FF',
    '#CC3300',
    '#CC3333',
    '#CC3366',
    '#CC3399',
    '#CC33CC',
    '#CC33FF',
    '#CC6600',
    '#CC6633',
    '#CC9900',
    '#CC9933',
    '#CCCC00',
    '#CCCC33',
    '#FF0000',
    '#FF0033',
    '#FF0066',
    '#FF0099',
    '#FF00CC',
    '#FF00FF',
    '#FF3300',
    '#FF3333',
    '#FF3366',
    '#FF3399',
    '#FF33CC',
    '#FF33FF',
    '#FF6600',
    '#FF6633',
    '#FF9900',
    '#FF9933',
    '#FFCC00',
    '#FFCC33'
];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */ // eslint-disable-next-line complexity
function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
        return true;
    }
    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
    }
    let m;
    // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    // eslint-disable-next-line no-return-assign
    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
    typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);
    if (!this.useColors) {
        return;
    }
    const c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');
    // The final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match)=>{
        if (match === '%%') {
            return;
        }
        index++;
        if (match === '%c') {
            // We only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
        }
    });
    args.splice(lastC, 0, c);
}
/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */ exports.log = console.debug || console.log || (()=>{});
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    try {
        if (namespaces) {
            exports.storage.setItem('debug', namespaces);
        } else {
            exports.storage.removeItem('debug');
        }
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    let r;
    try {
        r = exports.storage.getItem('debug');
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = "rsbuild";
    }
    return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */ function localstorage() {
    try {
        // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
        // The Browser also has localStorage in the global context.
        return localStorage;
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
module.exports = __webpack_require__(6281)(exports);
const { formatters } = module.exports;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */ formatters.j = function(v) {
    try {
        return JSON.stringify(v);
    } catch (error) {
        return '[UnexpectedJSONParseError]: ' + error.message;
    }
};


}),
"6281": (function (module, __unused_webpack_exports, __webpack_require__) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */ function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = __webpack_require__(841);
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key)=>{
        createDebug[key] = env[key];
    });
    /**
	* The currently active debug mode names, and names to skip.
	*/ createDebug.names = [];
    createDebug.skips = [];
    /**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/ createDebug.formatters = {};
    /**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/ function selectColor(namespace) {
        let hash = 0;
        for(let i = 0; i < namespace.length; i++){
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    /**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/ function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
            // Disabled?
            if (!debug.enabled) {
                return;
            }
            const self = debug;
            // Set `diff` timestamp
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;
            args[0] = createDebug.coerce(args[0]);
            if (typeof args[0] !== 'string') {
                // Anything else let's inspect with %O
                args.unshift('%O');
            }
            // Apply any `formatters` transformations
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format)=>{
                // If we encounter an escaped % then don't increase the array index
                if (match === '%%') {
                    return '%';
                }
                index++;
                const formatter = createDebug.formatters[format];
                if (typeof formatter === 'function') {
                    const val = args[index];
                    match = formatter.call(self, val);
                    // Now we need to remove `args[index]` since it's inlined in the `format`
                    args.splice(index, 1);
                    index--;
                }
                return match;
            });
            // Apply env-specific formatting (colors, etc.)
            createDebug.formatArgs.call(self, args);
            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.
        Object.defineProperty(debug, 'enabled', {
            enumerable: true,
            configurable: false,
            get: ()=>{
                if (enableOverride !== null) {
                    return enableOverride;
                }
                if (namespacesCache !== createDebug.namespaces) {
                    namespacesCache = createDebug.namespaces;
                    enabledCache = createDebug.enabled(namespace);
                }
                return enabledCache;
            },
            set: (v)=>{
                enableOverride = v;
            }
        });
        // Env-specific initialization logic for debug instances
        if (typeof createDebug.init === 'function') {
            createDebug.init(debug);
        }
        return debug;
    }
    function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
    }
    /**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/ function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === 'string' ? namespaces : '').trim().replace(' ', ',').split(',').filter(Boolean);
        for (const ns of split){
            if (ns[0] === '-') {
                createDebug.skips.push(ns.slice(1));
            } else {
                createDebug.names.push(ns);
            }
        }
    }
    /**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */ function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while(searchIndex < search.length){
            if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
                // Match character or proceed with wildcard
                if (template[templateIndex] === '*') {
                    starIndex = templateIndex;
                    matchIndex = searchIndex;
                    templateIndex++; // Skip the '*'
                } else {
                    searchIndex++;
                    templateIndex++;
                }
            } else if (starIndex !== -1) {
                // Backtrack to the last '*' and try to match more characters
                templateIndex = starIndex + 1;
                matchIndex++;
                searchIndex = matchIndex;
            } else {
                return false; // No match
            }
        }
        // Handle trailing '*' in template
        while(templateIndex < template.length && template[templateIndex] === '*'){
            templateIndex++;
        }
        return templateIndex === template.length;
    }
    /**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/ function disable() {
        const namespaces = [
            ...createDebug.names,
            ...createDebug.skips.map((namespace)=>'-' + namespace)
        ].join(',');
        createDebug.enable('');
        return namespaces;
    }
    /**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/ function enabled(name) {
        for (const skip of createDebug.skips){
            if (matchesTemplate(name, skip)) {
                return false;
            }
        }
        for (const ns of createDebug.names){
            if (matchesTemplate(name, ns)) {
                return true;
            }
        }
        return false;
    }
    /**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/ function coerce(val) {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }
    /**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/ function destroy() {
        console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    }
    createDebug.enable(createDebug.load());
    return createDebug;
}
module.exports = setup;


}),
"4192": (function (module, __unused_webpack_exports, __webpack_require__) {
/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */ if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
    module.exports = __webpack_require__(3308);
} else {
    module.exports = __webpack_require__(8436);
}


}),
"8436": (function (module, exports, __webpack_require__) {
/**
 * Module dependencies.
 */ const tty = __webpack_require__(6224);
const util = __webpack_require__(3837);
/**
 * This is the Node.js implementation of `debug()`.
 */ exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(()=>{}, 'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
/**
 * Colors.
 */ exports.colors = [
    6,
    2,
    3,
    4,
    5,
    1
];
try {
    // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
    // eslint-disable-next-line import/no-extraneous-dependencies
    const supportsColor = __webpack_require__(6216);
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
            20,
            21,
            26,
            27,
            32,
            33,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            56,
            57,
            62,
            63,
            68,
            69,
            74,
            75,
            76,
            77,
            78,
            79,
            80,
            81,
            92,
            93,
            98,
            99,
            112,
            113,
            128,
            129,
            134,
            135,
            148,
            149,
            160,
            161,
            162,
            163,
            164,
            165,
            166,
            167,
            168,
            169,
            170,
            171,
            172,
            173,
            178,
            179,
            184,
            185,
            196,
            197,
            198,
            199,
            200,
            201,
            202,
            203,
            204,
            205,
            206,
            207,
            208,
            209,
            214,
            215,
            220,
            221
        ];
    }
} catch (error) {
// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}
/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */ exports.inspectOpts = Object.keys(process.env).filter((key)=>{
    return /^debug_/i.test(key);
}).reduce((obj, key)=>{
    // Camel-case
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k)=>{
        return k.toUpperCase();
    });
    // Coerce string value into JS value
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
    } else if (val === 'null') {
        val = null;
    } else {
        val = Number(val);
    }
    obj[prop] = val;
    return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */ function useColors() {
    return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    const { namespace: name, useColors } = this;
    if (useColors) {
        const c = this.color;
        const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
        const prefix = `  ${colorCode};1m${name} \u001B[0m`;
        args[0] = prefix + args[0].split('\n').join('\n' + prefix);
        args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
    } else {
        args[0] = getDate() + name + ' ' + args[0];
    }
}
function getDate() {
    if (exports.inspectOpts.hideDate) {
        return '';
    }
    return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */ function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    if (namespaces) {
        "rsbuild" = namespaces;
    } else {
        // If you set a process.env field to null or undefined, it gets cast to the
        // string 'null' or 'undefined'. Just delete instead.
        delete "rsbuild";
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    return "rsbuild";
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */ function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for(let i = 0; i < keys.length; i++){
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
}
module.exports = __webpack_require__(6281)(exports);
const { formatters } = module.exports;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */ formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split('\n').map((str)=>str.trim()).join(' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */ formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
};


}),
"4833": (function (module, __unused_webpack_exports, __webpack_require__) {

var $defineProperty = __webpack_require__(8947);
var $SyntaxError = __webpack_require__(4703);
var $TypeError = __webpack_require__(9343);
var gopd = __webpack_require__(4552);
/** @type {import('.')} */ module.exports = function defineDataProperty(obj, property, value) {
    if (!obj || typeof obj !== 'object' && typeof obj !== 'function') {
        throw new $TypeError('`obj` must be an object or a function`');
    }
    if (typeof property !== 'string' && typeof property !== 'symbol') {
        throw new $TypeError('`property` must be a string or a symbol`');
    }
    if (arguments.length > 3 && typeof arguments[3] !== 'boolean' && arguments[3] !== null) {
        throw new $TypeError('`nonEnumerable`, if provided, must be a boolean or null');
    }
    if (arguments.length > 4 && typeof arguments[4] !== 'boolean' && arguments[4] !== null) {
        throw new $TypeError('`nonWritable`, if provided, must be a boolean or null');
    }
    if (arguments.length > 5 && typeof arguments[5] !== 'boolean' && arguments[5] !== null) {
        throw new $TypeError('`nonConfigurable`, if provided, must be a boolean or null');
    }
    if (arguments.length > 6 && typeof arguments[6] !== 'boolean') {
        throw new $TypeError('`loose`, if provided, must be a boolean');
    }
    var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
    var nonWritable = arguments.length > 4 ? arguments[4] : null;
    var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
    var loose = arguments.length > 6 ? arguments[6] : false;
    /* @type {false | TypedPropertyDescriptor<unknown>} */ var desc = !!gopd && gopd(obj, property);
    if ($defineProperty) {
        $defineProperty(obj, property, {
            configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
            enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
            value: value,
            writable: nonWritable === null && desc ? desc.writable : !nonWritable
        });
    } else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) {
        // must fall back to [[Set]], and was not explicitly asked to make non-enumerable, non-writable, or non-configurable
        obj[property] = value; // eslint-disable-line no-param-reassign
    } else {
        throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
    }
};


}),
"4571": (function (module, __unused_webpack_exports, __webpack_require__) {
var Stream = (__webpack_require__(2781)/* .Stream */.Stream);
var util = __webpack_require__(3837);
module.exports = DelayedStream;
function DelayedStream() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;
    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
}
util.inherits(DelayedStream, Stream);
DelayedStream.create = function(source, options) {
    var delayedStream = new this();
    options = options || {};
    for(var option in options){
        delayedStream[option] = options[option];
    }
    delayedStream.source = source;
    var realEmit = source.emit;
    source.emit = function() {
        delayedStream._handleEmit(arguments);
        return realEmit.apply(source, arguments);
    };
    source.on('error', function() {});
    if (delayedStream.pauseStream) {
        source.pause();
    }
    return delayedStream;
};
Object.defineProperty(DelayedStream.prototype, 'readable', {
    configurable: true,
    enumerable: true,
    get: function() {
        return this.source.readable;
    }
});
DelayedStream.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
};
DelayedStream.prototype.resume = function() {
    if (!this._released) {
        this.release();
    }
    this.source.resume();
};
DelayedStream.prototype.pause = function() {
    this.source.pause();
};
DelayedStream.prototype.release = function() {
    this._released = true;
    this._bufferedEvents.forEach((function(args) {
        this.emit.apply(this, args);
    }).bind(this));
    this._bufferedEvents = [];
};
DelayedStream.prototype.pipe = function() {
    var r = Stream.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
};
DelayedStream.prototype._handleEmit = function(args) {
    if (this._released) {
        this.emit.apply(this, args);
        return;
    }
    if (args[0] === 'data') {
        this.dataSize += args[1].length;
        this._checkIfMaxDataSizeExceeded();
    }
    this._bufferedEvents.push(args);
};
DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
    if (this._maxDataSizeExceeded) {
        return;
    }
    if (this.dataSize <= this.maxDataSize) {
        return;
    }
    this._maxDataSizeExceeded = true;
    var message = 'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
    this.emit('error', new Error(message));
};


}),
"7235": (function (module, __unused_webpack_exports, __webpack_require__) {

var callBind = __webpack_require__(2950);
var gOPD = __webpack_require__(4552);
// eslint-disable-next-line no-extra-parens, no-proto
var hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */ [].__proto__ === Array.prototype;
// eslint-disable-next-line no-extra-parens
var desc = hasProtoAccessor && gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */ '__proto__');
var $Object = Object;
var $getPrototypeOf = $Object.getPrototypeOf;
/** @type {import('./get')} */ module.exports = desc && typeof desc.get === 'function' ? callBind([
    desc.get
]) : typeof $getPrototypeOf === 'function' ? /** @type {import('./get')} */ function getDunder(value) {
    // eslint-disable-next-line eqeqeq
    return $getPrototypeOf(value == null ? value : $Object(value));
} : false;


}),
"8947": (function (module) {

/** @type {import('.')} */ var $defineProperty = Object.defineProperty || false;
if ($defineProperty) {
    try {
        $defineProperty({}, 'a', {
            value: 1
        });
    } catch (e) {
        // IE 8 has a broken defineProperty
        $defineProperty = false;
    }
}
module.exports = $defineProperty;


}),
"4597": (function (module) {

/** @type {import('./eval')} */ module.exports = EvalError;


}),
"656": (function (module) {

/** @type {import('.')} */ module.exports = Error;


}),
"7551": (function (module) {

/** @type {import('./range')} */ module.exports = RangeError;


}),
"9892": (function (module) {

/** @type {import('./ref')} */ module.exports = ReferenceError;


}),
"4703": (function (module) {

/** @type {import('./syntax')} */ module.exports = SyntaxError;


}),
"9343": (function (module) {

/** @type {import('./type')} */ module.exports = TypeError;


}),
"9695": (function (module) {

/** @type {import('./uri')} */ module.exports = URIError;


}),
"7032": (function (module, __unused_webpack_exports, __webpack_require__) {
var debug;
module.exports = function() {
    if (!debug) {
        try {
            /* eslint global-require: off */ debug = __webpack_require__(4192)("follow-redirects");
        } catch (error) {}
        if (typeof debug !== "function") {
            debug = function() {};
        }
    }
    debug.apply(null, arguments);
};


}),
"5842": (function (module, __unused_webpack_exports, __webpack_require__) {
var url = __webpack_require__(7310);
var URL = url.URL;
var http = __webpack_require__(3685);
var https = __webpack_require__(5687);
var Writable = (__webpack_require__(2781)/* .Writable */.Writable);
var assert = __webpack_require__(9491);
var debug = __webpack_require__(7032);
// Preventive platform detection
// istanbul ignore next
(function detectUnsupportedEnvironment() {
    var looksLikeNode = typeof process !== "undefined";
    var looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    var looksLikeV8 = isFunction(Error.captureStackTrace);
    if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
        console.warn("The follow-redirects package should be excluded from browser builds.");
    }
})();
// Whether to use the native URL object or the legacy url module
var useNativeURL = false;
try {
    assert(new URL(""));
} catch (error) {
    useNativeURL = error.code === "ERR_INVALID_URL";
}
// URL fields to preserve in copy operations
var preservedUrlFields = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash"
];
// Create handlers that pass events from native requests
var events = [
    "abort",
    "aborted",
    "connect",
    "error",
    "socket",
    "timeout"
];
var eventHandlers = Object.create(null);
events.forEach(function(event) {
    eventHandlers[event] = function(arg1, arg2, arg3) {
        this._redirectable.emit(event, arg1, arg2, arg3);
    };
});
// Error types with codes
var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError);
var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
// istanbul ignore next
var destroy = Writable.prototype.destroy || noop;
// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
    // Initialize the request
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];
    // Attach a callback if passed
    if (responseCallback) {
        this.on("response", responseCallback);
    }
    // React to responses of native requests
    var self = this;
    this._onNativeResponse = function(response) {
        try {
            self._processResponse(response);
        } catch (cause) {
            self.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({
                cause: cause
            }));
        }
    };
    // Perform the first request
    this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);
RedirectableRequest.prototype.abort = function() {
    destroyRequest(this._currentRequest);
    this._currentRequest.abort();
    this.emit("abort");
};
RedirectableRequest.prototype.destroy = function(error) {
    destroyRequest(this._currentRequest, error);
    destroy.call(this, error);
    return this;
};
// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function(data, encoding, callback) {
    // Writing is not allowed if end has been called
    if (this._ending) {
        throw new WriteAfterEndError();
    }
    // Validate input and shift parameters if necessary
    if (!isString(data) && !isBuffer(data)) {
        throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (isFunction(encoding)) {
        callback = encoding;
        encoding = null;
    }
    // Ignore empty buffers, since writing them doesn't invoke the callback
    // https://github.com/nodejs/node/issues/22066
    if (data.length === 0) {
        if (callback) {
            callback();
        }
        return;
    }
    // Only write when we don't exceed the maximum body length
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
        this._requestBodyLength += data.length;
        this._requestBodyBuffers.push({
            data: data,
            encoding: encoding
        });
        this._currentRequest.write(data, encoding, callback);
    } else {
        this.emit("error", new MaxBodyLengthExceededError());
        this.abort();
    }
};
// Ends the current native request
RedirectableRequest.prototype.end = function(data, encoding, callback) {
    // Shift parameters if necessary
    if (isFunction(data)) {
        callback = data;
        data = encoding = null;
    } else if (isFunction(encoding)) {
        callback = encoding;
        encoding = null;
    }
    // Write data if needed and end
    if (!data) {
        this._ended = this._ending = true;
        this._currentRequest.end(null, null, callback);
    } else {
        var self = this;
        var currentRequest = this._currentRequest;
        this.write(data, encoding, function() {
            self._ended = true;
            currentRequest.end(null, null, callback);
        });
        this._ending = true;
    }
};
// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
};
// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
};
// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
    var self = this;
    // Destroys the socket on timeout
    function destroyOnTimeout(socket) {
        socket.setTimeout(msecs);
        socket.removeListener("timeout", socket.destroy);
        socket.addListener("timeout", socket.destroy);
    }
    // Sets up a timer to trigger a timeout event
    function startTimer(socket) {
        if (self._timeout) {
            clearTimeout(self._timeout);
        }
        self._timeout = setTimeout(function() {
            self.emit("timeout");
            clearTimer();
        }, msecs);
        destroyOnTimeout(socket);
    }
    // Stops a timeout from triggering
    function clearTimer() {
        // Clear the timeout
        if (self._timeout) {
            clearTimeout(self._timeout);
            self._timeout = null;
        }
        // Clean up all attached listeners
        self.removeListener("abort", clearTimer);
        self.removeListener("error", clearTimer);
        self.removeListener("response", clearTimer);
        self.removeListener("close", clearTimer);
        if (callback) {
            self.removeListener("timeout", callback);
        }
        if (!self.socket) {
            self._currentRequest.removeListener("socket", startTimer);
        }
    }
    // Attach callback if passed
    if (callback) {
        this.on("timeout", callback);
    }
    // Start the timer if or when the socket is opened
    if (this.socket) {
        startTimer(this.socket);
    } else {
        this._currentRequest.once("socket", startTimer);
    }
    // Clean up on events
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);
    this.on("close", clearTimer);
    return this;
};
// Proxy all other public ClientRequest methods
[
    "flushHeaders",
    "getHeader",
    "setNoDelay",
    "setSocketKeepAlive"
].forEach(function(method) {
    RedirectableRequest.prototype[method] = function(a, b) {
        return this._currentRequest[method](a, b);
    };
});
// Proxy all public ClientRequest properties
[
    "aborted",
    "connection",
    "socket"
].forEach(function(property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
        get: function() {
            return this._currentRequest[property];
        }
    });
});
RedirectableRequest.prototype._sanitizeOptions = function(options) {
    // Ensure headers are always present
    if (!options.headers) {
        options.headers = {};
    }
    // Since http.request treats host as an alias of hostname,
    // but the url module interprets host as hostname plus port,
    // eliminate the host property to avoid confusion.
    if (options.host) {
        // Use hostname if set, because it has precedence
        if (!options.hostname) {
            options.hostname = options.host;
        }
        delete options.host;
    }
    // Complete the URL object when necessary
    if (!options.pathname && options.path) {
        var searchPos = options.path.indexOf("?");
        if (searchPos < 0) {
            options.pathname = options.path;
        } else {
            options.pathname = options.path.substring(0, searchPos);
            options.search = options.path.substring(searchPos);
        }
    }
};
// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function() {
    // Load the native protocol
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
        throw new TypeError("Unsupported protocol " + protocol);
    }
    // If specified, use the agent corresponding to the protocol
    // (HTTP and HTTPS use different types of agents)
    if (this._options.agents) {
        var scheme = protocol.slice(0, -1);
        this._options.agent = this._options.agents[scheme];
    }
    // Create the native request and set up its event handlers
    var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    request._redirectable = this;
    for (var event of events){
        request.on(event, eventHandlers[event]);
    }
    // RFC7230§5.3.1: When making a request directly to an origin server, […]
    // a client MUST send only the absolute path […] as the request-target.
    this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path;
    // End a redirected request
    // (The first request must be ended explicitly with RedirectableRequest#end)
    if (this._isRedirect) {
        // Write the request entity and end
        var i = 0;
        var self = this;
        var buffers = this._requestBodyBuffers;
        (function writeNext(error) {
            // Only write if this request has not been redirected yet
            // istanbul ignore else
            if (request === self._currentRequest) {
                // Report any write errors
                // istanbul ignore if
                if (error) {
                    self.emit("error", error);
                } else if (i < buffers.length) {
                    var buffer = buffers[i++];
                    // istanbul ignore else
                    if (!request.finished) {
                        request.write(buffer.data, buffer.encoding, writeNext);
                    }
                } else if (self._ended) {
                    request.end();
                }
            }
        })();
    }
};
// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function(response) {
    // Store the redirected response
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
        this._redirects.push({
            url: this._currentUrl,
            headers: response.headers,
            statusCode: statusCode
        });
    }
    // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
    // that further action needs to be taken by the user agent in order to
    // fulfill the request. If a Location header field is provided,
    // the user agent MAY automatically redirect its request to the URI
    // referenced by the Location field value,
    // even if the specific status code is not understood.
    // If the response is not a redirect; return it as-is
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
        response.responseUrl = this._currentUrl;
        response.redirects = this._redirects;
        this.emit("response", response);
        // Clean up
        this._requestBodyBuffers = [];
        return;
    }
    // The response is a redirect, so abort the current request
    destroyRequest(this._currentRequest);
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();
    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
        throw new TooManyRedirectsError();
    }
    // Store the request headers if applicable
    var requestHeaders;
    var beforeRedirect = this._options.beforeRedirect;
    if (beforeRedirect) {
        requestHeaders = Object.assign({
            // The Host header was set by nativeProtocol.request
            Host: response.req.getHeader("host")
        }, this._options.headers);
    }
    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    var method = this._options.method;
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
    // the server is redirecting the user agent to a different resource […]
    // A user agent can perform a retrieval request targeting that URI
    // (a GET or HEAD request if using HTTP) […]
    statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
        this._options.method = "GET";
        // Drop a possible entity and headers related to it
        this._requestBodyBuffers = [];
        removeMatchingHeaders(/^content-/i, this._options.headers);
    }
    // Drop the Host header, as the redirect might lead to a different host
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
    // If the redirect is relative, carry over the host of the last request
    var currentUrlParts = parseUrl(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, {
        host: currentHost
    }));
    // Create the redirected request
    var redirectUrl = resolveUrl(location, currentUrl);
    debug("redirecting to", redirectUrl.href);
    this._isRedirect = true;
    spreadUrlObject(redirectUrl, this._options);
    // Drop confidential headers when redirecting to a less secure protocol
    // or to a different domain that is not a superdomain
    if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
        removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
    }
    // Evaluate the beforeRedirect callback
    if (isFunction(beforeRedirect)) {
        var responseDetails = {
            headers: response.headers,
            statusCode: statusCode
        };
        var requestDetails = {
            url: currentUrl,
            method: method,
            headers: requestHeaders
        };
        beforeRedirect(this._options, responseDetails, requestDetails);
        this._sanitizeOptions(this._options);
    }
    // Perform the redirected request
    this._performRequest();
};
// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
    // Default settings
    var exports = {
        maxRedirects: 21,
        maxBodyLength: 10 * 1024 * 1024
    };
    // Wrap each protocol
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function(scheme) {
        var protocol = scheme + ":";
        var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
        var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);
        // Executes a request, following redirects
        function request(input, options, callback) {
            // Parse parameters, ensuring that input is an object
            if (isURL(input)) {
                input = spreadUrlObject(input);
            } else if (isString(input)) {
                input = spreadUrlObject(parseUrl(input));
            } else {
                callback = options;
                options = validateUrl(input);
                input = {
                    protocol: protocol
                };
            }
            if (isFunction(options)) {
                callback = options;
                options = null;
            }
            // Set defaults
            options = Object.assign({
                maxRedirects: exports.maxRedirects,
                maxBodyLength: exports.maxBodyLength
            }, input, options);
            options.nativeProtocols = nativeProtocols;
            if (!isString(options.host) && !isString(options.hostname)) {
                options.hostname = "::1";
            }
            assert.equal(options.protocol, protocol, "protocol mismatch");
            debug("options", options);
            return new RedirectableRequest(options, callback);
        }
        // Executes a GET request, following redirects
        function get(input, options, callback) {
            var wrappedRequest = wrappedProtocol.request(input, options, callback);
            wrappedRequest.end();
            return wrappedRequest;
        }
        // Expose the properties on the wrapped protocol
        Object.defineProperties(wrappedProtocol, {
            request: {
                value: request,
                configurable: true,
                enumerable: true,
                writable: true
            },
            get: {
                value: get,
                configurable: true,
                enumerable: true,
                writable: true
            }
        });
    });
    return exports;
}
function noop() {}
function parseUrl(input) {
    var parsed;
    // istanbul ignore else
    if (useNativeURL) {
        parsed = new URL(input);
    } else {
        // Ensure the URL is valid and absolute
        parsed = validateUrl(url.parse(input));
        if (!isString(parsed.protocol)) {
            throw new InvalidUrlError({
                input
            });
        }
    }
    return parsed;
}
function resolveUrl(relative, base) {
    // istanbul ignore next
    return useNativeURL ? new URL(relative, base) : parseUrl(url.resolve(base, relative));
}
function validateUrl(input) {
    if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
        throw new InvalidUrlError({
            input: input.href || input
        });
    }
    if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
        throw new InvalidUrlError({
            input: input.href || input
        });
    }
    return input;
}
function spreadUrlObject(urlObject, target) {
    var spread = target || {};
    for (var key of preservedUrlFields){
        spread[key] = urlObject[key];
    }
    // Fix IPv6 hostname
    if (spread.hostname.startsWith("[")) {
        spread.hostname = spread.hostname.slice(1, -1);
    }
    // Ensure port is a number
    if (spread.port !== "") {
        spread.port = Number(spread.port);
    }
    // Concatenate path
    spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
    return spread;
}
function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for(var header in headers){
        if (regex.test(header)) {
            lastValue = headers[header];
            delete headers[header];
        }
    }
    return lastValue === null || typeof lastValue === "undefined" ? undefined : String(lastValue).trim();
}
function createErrorType(code, message, baseClass) {
    // Create constructor
    function CustomError(properties) {
        // istanbul ignore else
        if (isFunction(Error.captureStackTrace)) {
            Error.captureStackTrace(this, this.constructor);
        }
        Object.assign(this, properties || {});
        this.code = code;
        this.message = this.cause ? message + ": " + this.cause.message : message;
    }
    // Attach constructor and set default properties
    CustomError.prototype = new (baseClass || Error)();
    Object.defineProperties(CustomError.prototype, {
        constructor: {
            value: CustomError,
            enumerable: false
        },
        name: {
            value: "Error [" + code + "]",
            enumerable: false
        }
    });
    return CustomError;
}
function destroyRequest(request, error) {
    for (var event of events){
        request.removeListener(event, eventHandlers[event]);
    }
    request.on("error", noop);
    request.destroy(error);
}
function isSubdomain(subdomain, domain) {
    assert(isString(subdomain) && isString(domain));
    var dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}
function isString(value) {
    return typeof value === "string" || value instanceof String;
}
function isFunction(value) {
    return typeof value === "function";
}
function isBuffer(value) {
    return typeof value === "object" && "length" in value;
}
function isURL(value) {
    return URL && value instanceof URL;
}
// Exports
module.exports = wrap({
    http: http,
    https: https
});
module.exports.wrap = wrap;


}),
"5284": (function (module, __unused_webpack_exports, __webpack_require__) {
var CombinedStream = __webpack_require__(4166);
var util = __webpack_require__(3837);
var path = __webpack_require__(1017);
var http = __webpack_require__(3685);
var https = __webpack_require__(5687);
var parseUrl = (__webpack_require__(7310)/* .parse */.parse);
var fs = __webpack_require__(7147);
var Stream = (__webpack_require__(2781)/* .Stream */.Stream);
var mime = __webpack_require__(34);
var asynckit = __webpack_require__(1995);
var populate = __webpack_require__(67);
// Public API
module.exports = FormData;
// make it a Stream
util.inherits(FormData, CombinedStream);
/**
 * Create readable "multipart/form-data" streams.
 * Can be used to submit forms
 * and file uploads to other web applications.
 *
 * @constructor
 * @param {Object} options - Properties to be added/overriden for FormData and CombinedStream
 */ function FormData(options) {
    if (!(this instanceof FormData)) {
        return new FormData(options);
    }
    this._overheadLength = 0;
    this._valueLength = 0;
    this._valuesToMeasure = [];
    CombinedStream.call(this);
    options = options || {};
    for(var option in options){
        this[option] = options[option];
    }
}
FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';
FormData.prototype.append = function(field, value, options) {
    options = options || {};
    // allow filename as single option
    if (typeof options == 'string') {
        options = {
            filename: options
        };
    }
    var append = CombinedStream.prototype.append.bind(this);
    // all that streamy business can't handle numbers
    if (typeof value == 'number') {
        value = '' + value;
    }
    // https://github.com/felixge/node-form-data/issues/38
    if (Array.isArray(value)) {
        // Please convert your array into string
        // the way web server expects it
        this._error(new Error('Arrays are not supported.'));
        return;
    }
    var header = this._multiPartHeader(field, value, options);
    var footer = this._multiPartFooter();
    append(header);
    append(value);
    append(footer);
    // pass along options.knownLength
    this._trackLength(header, value, options);
};
FormData.prototype._trackLength = function(header, value, options) {
    var valueLength = 0;
    // used w/ getLengthSync(), when length is known.
    // e.g. for streaming directly from a remote server,
    // w/ a known file a size, and not wanting to wait for
    // incoming file to finish to get its size.
    if (options.knownLength != null) {
        valueLength += +options.knownLength;
    } else if (Buffer.isBuffer(value)) {
        valueLength = value.length;
    } else if (typeof value === 'string') {
        valueLength = Buffer.byteLength(value);
    }
    this._valueLength += valueLength;
    // @check why add CRLF? does this account for custom/multiple CRLFs?
    this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length;
    // empty or either doesn't have path or not an http response or not a stream
    if (!value || !value.path && !(value.readable && value.hasOwnProperty('httpVersion')) && !(value instanceof Stream)) {
        return;
    }
    // no need to bother with the length
    if (!options.knownLength) {
        this._valuesToMeasure.push(value);
    }
};
FormData.prototype._lengthRetriever = function(value, callback) {
    if (value.hasOwnProperty('fd')) {
        // take read range into a account
        // `end` = Infinity –> read file till the end
        //
        // TODO: Looks like there is bug in Node fs.createReadStream
        // it doesn't respect `end` options without `start` options
        // Fix it when node fixes it.
        // https://github.com/joyent/node/issues/7819
        if (value.end != undefined && value.end != Infinity && value.start != undefined) {
            // when end specified
            // no need to calculate range
            // inclusive, starts with 0
            callback(null, value.end + 1 - (value.start ? value.start : 0));
        // not that fast snoopy
        } else {
            // still need to fetch file size from fs
            fs.stat(value.path, function(err, stat) {
                var fileSize;
                if (err) {
                    callback(err);
                    return;
                }
                // update final size based on the range options
                fileSize = stat.size - (value.start ? value.start : 0);
                callback(null, fileSize);
            });
        }
    // or http response
    } else if (value.hasOwnProperty('httpVersion')) {
        callback(null, +value.headers['content-length']);
    // or request stream http://github.com/mikeal/request
    } else if (value.hasOwnProperty('httpModule')) {
        // wait till response come back
        value.on('response', function(response) {
            value.pause();
            callback(null, +response.headers['content-length']);
        });
        value.resume();
    // something else
    } else {
        callback('Unknown stream');
    }
};
FormData.prototype._multiPartHeader = function(field, value, options) {
    // custom header specified (as string)?
    // it becomes responsible for boundary
    // (e.g. to handle extra CRLFs on .NET servers)
    if (typeof options.header == 'string') {
        return options.header;
    }
    var contentDisposition = this._getContentDisposition(value, options);
    var contentType = this._getContentType(value, options);
    var contents = '';
    var headers = {
        // add custom disposition as third element or keep it two elements if not
        'Content-Disposition': [
            'form-data',
            'name="' + field + '"'
        ].concat(contentDisposition || []),
        // if no content type. allow it to be empty array
        'Content-Type': [].concat(contentType || [])
    };
    // allow custom headers.
    if (typeof options.header == 'object') {
        populate(headers, options.header);
    }
    var header;
    for(var prop in headers){
        if (!headers.hasOwnProperty(prop)) continue;
        header = headers[prop];
        // skip nullish headers.
        if (header == null) {
            continue;
        }
        // convert all headers to arrays.
        if (!Array.isArray(header)) {
            header = [
                header
            ];
        }
        // add non-empty headers.
        if (header.length) {
            contents += prop + ': ' + header.join('; ') + FormData.LINE_BREAK;
        }
    }
    return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
};
FormData.prototype._getContentDisposition = function(value, options) {
    var filename, contentDisposition;
    if (typeof options.filepath === 'string') {
        // custom filepath for relative paths
        filename = path.normalize(options.filepath).replace(/\\/g, '/');
    } else if (options.filename || value.name || value.path) {
        // custom filename take precedence
        // formidable and the browser add a name property
        // fs- and request- streams have path property
        filename = path.basename(options.filename || value.name || value.path);
    } else if (value.readable && value.hasOwnProperty('httpVersion')) {
        // or try http response
        filename = path.basename(value.client._httpMessage.path || '');
    }
    if (filename) {
        contentDisposition = 'filename="' + filename + '"';
    }
    return contentDisposition;
};
FormData.prototype._getContentType = function(value, options) {
    // use custom content-type above all
    var contentType = options.contentType;
    // or try `name` from formidable, browser
    if (!contentType && value.name) {
        contentType = mime.lookup(value.name);
    }
    // or try `path` from fs-, request- streams
    if (!contentType && value.path) {
        contentType = mime.lookup(value.path);
    }
    // or if it's http-reponse
    if (!contentType && value.readable && value.hasOwnProperty('httpVersion')) {
        contentType = value.headers['content-type'];
    }
    // or guess it from the filepath or filename
    if (!contentType && (options.filepath || options.filename)) {
        contentType = mime.lookup(options.filepath || options.filename);
    }
    // fallback to the default content type if `value` is not simple value
    if (!contentType && typeof value == 'object') {
        contentType = FormData.DEFAULT_CONTENT_TYPE;
    }
    return contentType;
};
FormData.prototype._multiPartFooter = function() {
    return (function(next) {
        var footer = FormData.LINE_BREAK;
        var lastPart = this._streams.length === 0;
        if (lastPart) {
            footer += this._lastBoundary();
        }
        next(footer);
    }).bind(this);
};
FormData.prototype._lastBoundary = function() {
    return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK;
};
FormData.prototype.getHeaders = function(userHeaders) {
    var header;
    var formHeaders = {
        'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
    };
    for(header in userHeaders){
        if (userHeaders.hasOwnProperty(header)) {
            formHeaders[header.toLowerCase()] = userHeaders[header];
        }
    }
    return formHeaders;
};
FormData.prototype.setBoundary = function(boundary) {
    this._boundary = boundary;
};
FormData.prototype.getBoundary = function() {
    if (!this._boundary) {
        this._generateBoundary();
    }
    return this._boundary;
};
FormData.prototype.getBuffer = function() {
    var dataBuffer = new Buffer.alloc(0);
    var boundary = this.getBoundary();
    // Create the form content. Add Line breaks to the end of data.
    for(var i = 0, len = this._streams.length; i < len; i++){
        if (typeof this._streams[i] !== 'function') {
            // Add content to the buffer.
            if (Buffer.isBuffer(this._streams[i])) {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    this._streams[i]
                ]);
            } else {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    Buffer.from(this._streams[i])
                ]);
            }
            // Add break after content.
            if (typeof this._streams[i] !== 'string' || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    Buffer.from(FormData.LINE_BREAK)
                ]);
            }
        }
    }
    // Add the footer and return the Buffer object.
    return Buffer.concat([
        dataBuffer,
        Buffer.from(this._lastBoundary())
    ]);
};
FormData.prototype._generateBoundary = function() {
    // This generates a 50 character boundary similar to those used by Firefox.
    // They are optimized for boyer-moore parsing.
    var boundary = '--------------------------';
    for(var i = 0; i < 24; i++){
        boundary += Math.floor(Math.random() * 10).toString(16);
    }
    this._boundary = boundary;
};
// Note: getLengthSync DOESN'T calculate streams length
// As workaround one can calculate file size manually
// and add it as knownLength option
FormData.prototype.getLengthSync = function() {
    var knownLength = this._overheadLength + this._valueLength;
    // Don't get confused, there are 3 "internal" streams for each keyval pair
    // so it basically checks if there is any value added to the form
    if (this._streams.length) {
        knownLength += this._lastBoundary().length;
    }
    // https://github.com/form-data/form-data/issues/40
    if (!this.hasKnownLength()) {
        // Some async length retrievers are present
        // therefore synchronous length calculation is false.
        // Please use getLength(callback) to get proper length
        this._error(new Error('Cannot calculate proper length in synchronous way.'));
    }
    return knownLength;
};
// Public API to check if length of added values is known
// https://github.com/form-data/form-data/issues/196
// https://github.com/form-data/form-data/issues/262
FormData.prototype.hasKnownLength = function() {
    var hasKnownLength = true;
    if (this._valuesToMeasure.length) {
        hasKnownLength = false;
    }
    return hasKnownLength;
};
FormData.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
        knownLength += this._lastBoundary().length;
    }
    if (!this._valuesToMeasure.length) {
        process.nextTick(cb.bind(this, null, knownLength));
        return;
    }
    asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
        if (err) {
            cb(err);
            return;
        }
        values.forEach(function(length) {
            knownLength += length;
        });
        cb(null, knownLength);
    });
};
FormData.prototype.submit = function(params, cb) {
    var request, options, defaults = {
        method: 'post'
    };
    // parse provided url if it's string
    // or treat it as options object
    if (typeof params == 'string') {
        params = parseUrl(params);
        options = populate({
            port: params.port,
            path: params.pathname,
            host: params.hostname,
            protocol: params.protocol
        }, defaults);
    // use custom params
    } else {
        options = populate(params, defaults);
        // if no port provided use default one
        if (!options.port) {
            options.port = options.protocol == 'https:' ? 443 : 80;
        }
    }
    // put that good code in getHeaders to some use
    options.headers = this.getHeaders(params.headers);
    // https if specified, fallback to http in any other case
    if (options.protocol == 'https:') {
        request = https.request(options);
    } else {
        request = http.request(options);
    }
    // get content length and fire away
    this.getLength((function(err, length) {
        if (err && err !== 'Unknown stream') {
            this._error(err);
            return;
        }
        // add content length
        if (length) {
            request.setHeader('Content-Length', length);
        }
        this.pipe(request);
        if (cb) {
            var onResponse;
            var callback = function(error, responce) {
                request.removeListener('error', callback);
                request.removeListener('response', onResponse);
                return cb.call(this, error, responce);
            };
            onResponse = callback.bind(this, null);
            request.on('error', callback);
            request.on('response', onResponse);
        }
    }).bind(this));
    return request;
};
FormData.prototype._error = function(err) {
    if (!this.error) {
        this.error = err;
        this.pause();
        this.emit('error', err);
    }
};
FormData.prototype.toString = function() {
    return '[object FormData]';
};


}),
"67": (function (module) {
// populates missing values
module.exports = function(dst, src) {
    Object.keys(src).forEach(function(prop) {
        dst[prop] = dst[prop] || src[prop];
    });
    return dst;
};


}),
"6623": (function (module) {

/* eslint no-invalid-this: 1 */ var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';
var concatty = function concatty(a, b) {
    var arr = [];
    for(var i = 0; i < a.length; i += 1){
        arr[i] = a[i];
    }
    for(var j = 0; j < b.length; j += 1){
        arr[j + a.length] = b[j];
    }
    return arr;
};
var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for(var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1){
        arr[j] = arrLike[i];
    }
    return arr;
};
var joiny = function(arr, joiner) {
    var str = '';
    for(var i = 0; i < arr.length; i += 1){
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};
module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);
    var bound;
    var binder = function() {
        if (this instanceof bound) {
            var result = target.apply(this, concatty(args, arguments));
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(that, concatty(args, arguments));
    };
    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for(var i = 0; i < boundLength; i++){
        boundArgs[i] = '$' + i;
    }
    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);
    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }
    return bound;
};


}),
"4988": (function (module, __unused_webpack_exports, __webpack_require__) {

var implementation = __webpack_require__(6623);
module.exports = Function.prototype.bind || implementation;


}),
"110": (function (module, __unused_webpack_exports, __webpack_require__) {

var undefined;
var $Error = __webpack_require__(656);
var $EvalError = __webpack_require__(4597);
var $RangeError = __webpack_require__(7551);
var $ReferenceError = __webpack_require__(9892);
var $SyntaxError = __webpack_require__(4703);
var $TypeError = __webpack_require__(9343);
var $URIError = __webpack_require__(9695);
var $Function = Function;
// eslint-disable-next-line consistent-return
var getEvalledConstructor = function(expressionSyntax) {
    try {
        return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
    } catch (e) {}
};
var $gOPD = __webpack_require__(4552);
var $defineProperty = __webpack_require__(8947);
var throwTypeError = function() {
    throw new $TypeError();
};
var ThrowTypeError = $gOPD ? function() {
    try {
        // eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
        arguments.callee; // IE 8 does not throw here
        return throwTypeError;
    } catch (calleeThrows) {
        try {
            // IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
            return $gOPD(arguments, 'callee').get;
        } catch (gOPDthrows) {
            return throwTypeError;
        }
    }
}() : throwTypeError;
var hasSymbols = __webpack_require__(6012)();
var getDunderProto = __webpack_require__(7235);
var getProto = typeof Reflect === 'function' && Reflect.getPrototypeOf || Object.getPrototypeOf || getDunderProto;
var $apply = __webpack_require__(8329);
var $call = __webpack_require__(2814);
var needsEval = {};
var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);
var INTRINSICS = {
    __proto__: null,
    '%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
    '%Array%': Array,
    '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
    '%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
    '%AsyncFromSyncIteratorPrototype%': undefined,
    '%AsyncFunction%': needsEval,
    '%AsyncGenerator%': needsEval,
    '%AsyncGeneratorFunction%': needsEval,
    '%AsyncIteratorPrototype%': needsEval,
    '%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
    '%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
    '%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
    '%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
    '%Boolean%': Boolean,
    '%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
    '%Date%': Date,
    '%decodeURI%': decodeURI,
    '%decodeURIComponent%': decodeURIComponent,
    '%encodeURI%': encodeURI,
    '%encodeURIComponent%': encodeURIComponent,
    '%Error%': $Error,
    '%eval%': eval,
    '%EvalError%': $EvalError,
    '%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
    '%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
    '%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
    '%Function%': $Function,
    '%GeneratorFunction%': needsEval,
    '%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
    '%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
    '%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
    '%isFinite%': isFinite,
    '%isNaN%': isNaN,
    '%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
    '%JSON%': typeof JSON === 'object' ? JSON : undefined,
    '%Map%': typeof Map === 'undefined' ? undefined : Map,
    '%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
    '%Math%': Math,
    '%Number%': Number,
    '%Object%': Object,
    '%Object.getOwnPropertyDescriptor%': $gOPD,
    '%parseFloat%': parseFloat,
    '%parseInt%': parseInt,
    '%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
    '%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
    '%RangeError%': $RangeError,
    '%ReferenceError%': $ReferenceError,
    '%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
    '%RegExp%': RegExp,
    '%Set%': typeof Set === 'undefined' ? undefined : Set,
    '%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
    '%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
    '%String%': String,
    '%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
    '%Symbol%': hasSymbols ? Symbol : undefined,
    '%SyntaxError%': $SyntaxError,
    '%ThrowTypeError%': ThrowTypeError,
    '%TypedArray%': TypedArray,
    '%TypeError%': $TypeError,
    '%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
    '%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
    '%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
    '%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
    '%URIError%': $URIError,
    '%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
    '%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
    '%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet,
    '%Function.prototype.call%': $call,
    '%Function.prototype.apply%': $apply,
    '%Object.defineProperty%': $defineProperty
};
if (getProto) {
    try {
        null.error; // eslint-disable-line no-unused-expressions
    } catch (e) {
        // https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
        var errorProto = getProto(getProto(e));
        INTRINSICS['%Error.prototype%'] = errorProto;
    }
}
var doEval = function doEval(name) {
    var value;
    if (name === '%AsyncFunction%') {
        value = getEvalledConstructor('async function () {}');
    } else if (name === '%GeneratorFunction%') {
        value = getEvalledConstructor('function* () {}');
    } else if (name === '%AsyncGeneratorFunction%') {
        value = getEvalledConstructor('async function* () {}');
    } else if (name === '%AsyncGenerator%') {
        var fn = doEval('%AsyncGeneratorFunction%');
        if (fn) {
            value = fn.prototype;
        }
    } else if (name === '%AsyncIteratorPrototype%') {
        var gen = doEval('%AsyncGenerator%');
        if (gen && getProto) {
            value = getProto(gen.prototype);
        }
    }
    INTRINSICS[name] = value;
    return value;
};
var LEGACY_ALIASES = {
    __proto__: null,
    '%ArrayBufferPrototype%': [
        'ArrayBuffer',
        'prototype'
    ],
    '%ArrayPrototype%': [
        'Array',
        'prototype'
    ],
    '%ArrayProto_entries%': [
        'Array',
        'prototype',
        'entries'
    ],
    '%ArrayProto_forEach%': [
        'Array',
        'prototype',
        'forEach'
    ],
    '%ArrayProto_keys%': [
        'Array',
        'prototype',
        'keys'
    ],
    '%ArrayProto_values%': [
        'Array',
        'prototype',
        'values'
    ],
    '%AsyncFunctionPrototype%': [
        'AsyncFunction',
        'prototype'
    ],
    '%AsyncGenerator%': [
        'AsyncGeneratorFunction',
        'prototype'
    ],
    '%AsyncGeneratorPrototype%': [
        'AsyncGeneratorFunction',
        'prototype',
        'prototype'
    ],
    '%BooleanPrototype%': [
        'Boolean',
        'prototype'
    ],
    '%DataViewPrototype%': [
        'DataView',
        'prototype'
    ],
    '%DatePrototype%': [
        'Date',
        'prototype'
    ],
    '%ErrorPrototype%': [
        'Error',
        'prototype'
    ],
    '%EvalErrorPrototype%': [
        'EvalError',
        'prototype'
    ],
    '%Float32ArrayPrototype%': [
        'Float32Array',
        'prototype'
    ],
    '%Float64ArrayPrototype%': [
        'Float64Array',
        'prototype'
    ],
    '%FunctionPrototype%': [
        'Function',
        'prototype'
    ],
    '%Generator%': [
        'GeneratorFunction',
        'prototype'
    ],
    '%GeneratorPrototype%': [
        'GeneratorFunction',
        'prototype',
        'prototype'
    ],
    '%Int8ArrayPrototype%': [
        'Int8Array',
        'prototype'
    ],
    '%Int16ArrayPrototype%': [
        'Int16Array',
        'prototype'
    ],
    '%Int32ArrayPrototype%': [
        'Int32Array',
        'prototype'
    ],
    '%JSONParse%': [
        'JSON',
        'parse'
    ],
    '%JSONStringify%': [
        'JSON',
        'stringify'
    ],
    '%MapPrototype%': [
        'Map',
        'prototype'
    ],
    '%NumberPrototype%': [
        'Number',
        'prototype'
    ],
    '%ObjectPrototype%': [
        'Object',
        'prototype'
    ],
    '%ObjProto_toString%': [
        'Object',
        'prototype',
        'toString'
    ],
    '%ObjProto_valueOf%': [
        'Object',
        'prototype',
        'valueOf'
    ],
    '%PromisePrototype%': [
        'Promise',
        'prototype'
    ],
    '%PromiseProto_then%': [
        'Promise',
        'prototype',
        'then'
    ],
    '%Promise_all%': [
        'Promise',
        'all'
    ],
    '%Promise_reject%': [
        'Promise',
        'reject'
    ],
    '%Promise_resolve%': [
        'Promise',
        'resolve'
    ],
    '%RangeErrorPrototype%': [
        'RangeError',
        'prototype'
    ],
    '%ReferenceErrorPrototype%': [
        'ReferenceError',
        'prototype'
    ],
    '%RegExpPrototype%': [
        'RegExp',
        'prototype'
    ],
    '%SetPrototype%': [
        'Set',
        'prototype'
    ],
    '%SharedArrayBufferPrototype%': [
        'SharedArrayBuffer',
        'prototype'
    ],
    '%StringPrototype%': [
        'String',
        'prototype'
    ],
    '%SymbolPrototype%': [
        'Symbol',
        'prototype'
    ],
    '%SyntaxErrorPrototype%': [
        'SyntaxError',
        'prototype'
    ],
    '%TypedArrayPrototype%': [
        'TypedArray',
        'prototype'
    ],
    '%TypeErrorPrototype%': [
        'TypeError',
        'prototype'
    ],
    '%Uint8ArrayPrototype%': [
        'Uint8Array',
        'prototype'
    ],
    '%Uint8ClampedArrayPrototype%': [
        'Uint8ClampedArray',
        'prototype'
    ],
    '%Uint16ArrayPrototype%': [
        'Uint16Array',
        'prototype'
    ],
    '%Uint32ArrayPrototype%': [
        'Uint32Array',
        'prototype'
    ],
    '%URIErrorPrototype%': [
        'URIError',
        'prototype'
    ],
    '%WeakMapPrototype%': [
        'WeakMap',
        'prototype'
    ],
    '%WeakSetPrototype%': [
        'WeakSet',
        'prototype'
    ]
};
var bind = __webpack_require__(4988);
var hasOwn = __webpack_require__(1183);
var $concat = bind.call($call, Array.prototype.concat);
var $spliceApply = bind.call($apply, Array.prototype.splice);
var $replace = bind.call($call, String.prototype.replace);
var $strSlice = bind.call($call, String.prototype.slice);
var $exec = bind.call($call, RegExp.prototype.exec);
/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */ var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */ 
var stringToPath = function stringToPath(string) {
    var first = $strSlice(string, 0, 1);
    var last = $strSlice(string, -1);
    if (first === '%' && last !== '%') {
        throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
    } else if (last === '%' && first !== '%') {
        throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
    }
    var result = [];
    $replace(string, rePropName, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
    });
    return result;
};
/* end adaptation */ var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    var intrinsicName = name;
    var alias;
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = '%' + alias[0] + '%';
    }
    if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
            value = doEval(intrinsicName);
        }
        if (typeof value === 'undefined' && !allowMissing) {
            throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
        }
        return {
            alias: alias,
            name: intrinsicName,
            value: value
        };
    }
    throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};
module.exports = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== 'string' || name.length === 0) {
        throw new $TypeError('intrinsic name must be a non-empty string');
    }
    if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
        throw new $TypeError('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
    }
    var parts = stringToPath(name);
    var intrinsicBaseName = parts.length > 0 ? parts[0] : '';
    var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
    var intrinsicRealName = intrinsic.name;
    var value = intrinsic.value;
    var skipFurtherCaching = false;
    var alias = intrinsic.alias;
    if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([
            0,
            1
        ], alias));
    }
    for(var i = 1, isOwn = true; i < parts.length; i += 1){
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') && first !== last) {
            throw new $SyntaxError('property names with quotes must have matching quotes');
        }
        if (part === 'constructor' || !isOwn) {
            skipFurtherCaching = true;
        }
        intrinsicBaseName += '.' + part;
        intrinsicRealName = '%' + intrinsicBaseName + '%';
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
            if (!(part in value)) {
                if (!allowMissing) {
                    throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
                }
                return void undefined;
            }
            if ($gOPD && i + 1 >= parts.length) {
                var desc = $gOPD(value, part);
                isOwn = !!desc;
                // By convention, when a data property is converted to an accessor
                // property to emulate a data property that does not suffer from
                // the override mistake, that accessor's getter is marked with
                // an `originalValue` property. Here, when we detect this, we
                // uphold the illusion by pretending to see that original data
                // property, i.e., returning the value rather than the getter
                // itself.
                if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
                    value = desc.get;
                } else {
                    value = value[part];
                }
            } else {
                isOwn = hasOwn(value, part);
                value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
                INTRINSICS[intrinsicRealName] = value;
            }
        }
    }
    return value;
};


}),
"6141": (function (module) {

/** @type {import('./gOPD')} */ module.exports = Object.getOwnPropertyDescriptor;


}),
"4552": (function (module, __unused_webpack_exports, __webpack_require__) {

/** @type {import('.')} */ var $gOPD = __webpack_require__(6141);
if ($gOPD) {
    try {
        $gOPD([], 'length');
    } catch (e) {
        // IE 8 has a broken gOPD
        $gOPD = null;
    }
}
module.exports = $gOPD;


}),
"8014": (function (module) {

module.exports = (flag, argv = process.argv)=>{
    const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf('--');
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};


}),
"1151": (function (module, __unused_webpack_exports, __webpack_require__) {

var $defineProperty = __webpack_require__(8947);
var hasPropertyDescriptors = function hasPropertyDescriptors() {
    return !!$defineProperty;
};
hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
    // node v0.6 has a bug where array lengths can be Set but not Defined
    if (!$defineProperty) {
        return null;
    }
    try {
        return $defineProperty([], 'length', {
            value: 1
        }).length !== 1;
    } catch (e) {
        // In Firefox 4-22, defining length on an array throws an exception.
        return true;
    }
};
module.exports = hasPropertyDescriptors;


}),
"6012": (function (module, __unused_webpack_exports, __webpack_require__) {

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = __webpack_require__(1026);
/** @type {import('.')} */ module.exports = function hasNativeSymbols() {
    if (typeof origSymbol !== 'function') {
        return false;
    }
    if (typeof Symbol !== 'function') {
        return false;
    }
    if (typeof origSymbol('foo') !== 'symbol') {
        return false;
    }
    if (typeof Symbol('bar') !== 'symbol') {
        return false;
    }
    return hasSymbolSham();
};


}),
"1026": (function (module) {

/** @type {import('./shams')} */ /* eslint complexity: [2, 18], max-statements: [2, 33] */ module.exports = function hasSymbols() {
    if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
        return false;
    }
    if (typeof Symbol.iterator === 'symbol') {
        return true;
    }
    /** @type {{ [k in symbol]?: unknown }} */ var obj = {};
    var sym = Symbol('test');
    var symObj = Object(sym);
    if (typeof sym === 'string') {
        return false;
    }
    if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
        return false;
    }
    if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
        return false;
    }
    // temp disabled per https://github.com/ljharb/object.assign/issues/17
    // if (sym instanceof Symbol) { return false; }
    // temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
    // if (!(symObj instanceof Symbol)) { return false; }
    // if (typeof Symbol.prototype.toString !== 'function') { return false; }
    // if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }
    var symVal = 42;
    obj[sym] = symVal;
    for(var _ in obj){
        return false;
    } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
    if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
        return false;
    }
    if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
        return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === 'function') {
        // eslint-disable-next-line no-extra-parens
        var descriptor = /** @type {PropertyDescriptor} */ Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
        }
    }
    return true;
};


}),
"1183": (function (module, __unused_webpack_exports, __webpack_require__) {

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = __webpack_require__(4988);
/** @type {import('.')} */ module.exports = bind.call(call, $hasOwn);


}),
"1999": (function (module, __unused_webpack_exports, __webpack_require__) {
/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */ /**
 * Module exports.
 */ module.exports = __webpack_require__(1288);


}),
"34": (function (__unused_webpack_module, exports, __webpack_require__) {
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */ 
/**
 * Module dependencies.
 * @private
 */ var db = __webpack_require__(1999);
var extname = (__webpack_require__(1017)/* .extname */.extname);
/**
 * Module variables.
 * @private
 */ var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
var TEXT_TYPE_REGEXP = /^text\//i;
/**
 * Module exports.
 * @public
 */ exports.charset = charset;
exports.charsets = {
    lookup: charset
};
exports.contentType = contentType;
exports.extension = extension;
exports.extensions = Object.create(null);
exports.lookup = lookup;
exports.types = Object.create(null);
// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types);
/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */ function charset(type) {
    if (!type || typeof type !== 'string') {
        return false;
    }
    // TODO: use media-typer
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var mime = match && db[match[1].toLowerCase()];
    if (mime && mime.charset) {
        return mime.charset;
    }
    // default text/* to utf-8
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return 'UTF-8';
    }
    return false;
}
/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */ function contentType(str) {
    // TODO: should this even be in this module?
    if (!str || typeof str !== 'string') {
        return false;
    }
    var mime = str.indexOf('/') === -1 ? exports.lookup(str) : str;
    if (!mime) {
        return false;
    }
    // TODO: use content-type or other module
    if (mime.indexOf('charset') === -1) {
        var charset = exports.charset(mime);
        if (charset) mime += '; charset=' + charset.toLowerCase();
    }
    return mime;
}
/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */ function extension(type) {
    if (!type || typeof type !== 'string') {
        return false;
    }
    // TODO: use media-typer
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    // get extensions
    var exts = match && exports.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
        return false;
    }
    return exts[0];
}
/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */ function lookup(path) {
    if (!path || typeof path !== 'string') {
        return false;
    }
    // get the extension ("ext" or ".ext" or full path)
    var extension = extname('x.' + path).toLowerCase().substr(1);
    if (!extension) {
        return false;
    }
    return exports.types[extension] || false;
}
/**
 * Populate the extensions and types maps.
 * @private
 */ function populateMaps(extensions, types) {
    // source preference (least -> most)
    var preference = [
        'nginx',
        'apache',
        undefined,
        'iana'
    ];
    Object.keys(db).forEach(function forEachMimeType(type) {
        var mime = db[type];
        var exts = mime.extensions;
        if (!exts || !exts.length) {
            return;
        }
        // mime -> extensions
        extensions[type] = exts;
        // extension -> mime
        for(var i = 0; i < exts.length; i++){
            var extension = exts[i];
            if (types[extension]) {
                var from = preference.indexOf(db[types[extension]].source);
                var to = preference.indexOf(mime.source);
                if (types[extension] !== 'application/octet-stream' && (from > to || from === to && types[extension].substr(0, 12) === 'application/')) {
                    continue;
                }
            }
            // set the extension -> mime
            types[extension] = type;
        }
    });
}


}),
"8105": (function (module) {
(function webpackUniversalModuleDefinition(root, factory) {
    if (true) module.exports = factory();
    else {}
})(this, function() {
    return /******/ function(modules) {
        /******/ // The module cache
        /******/ var installedModules = {};
        /******/ // The require function
        /******/ function __nested_webpack_require_540__(moduleId) {
            /******/ // Check if module is in cache
            /******/ if (installedModules[moduleId]) /******/ return installedModules[moduleId].exports;
            /******/ // Create a new module (and put it into the cache)
            /******/ var module1 = installedModules[moduleId] = {
                /******/ exports: {},
                /******/ id: moduleId,
                /******/ loaded: false
            };
            /******/ // Execute the module function
            /******/ modules[moduleId].call(module1.exports, module1, module1.exports, __nested_webpack_require_540__);
            /******/ // Flag the module as loaded
            /******/ module1.loaded = true;
            /******/ // Return the exports of the module
            /******/ return module1.exports;
        /******/ }
        /******/ // expose the modules object (__webpack_modules__)
        /******/ __nested_webpack_require_540__.m = modules;
        /******/ // expose the module cache
        /******/ __nested_webpack_require_540__.c = installedModules;
        /******/ // __webpack_public_path__
        /******/ __nested_webpack_require_540__.p = "";
        /******/ // Load entry module and return exports
        /******/ return __nested_webpack_require_540__(0);
    /******/ }([
        /* 0 */ /***/ function(module1, exports1, __nested_webpack_require_1865_1884__) {
            /* global require, module, window */ var Handler = __nested_webpack_require_1865_1884__(1);
            var Util = __nested_webpack_require_1865_1884__(3);
            var Random = __nested_webpack_require_1865_1884__(5);
            var RE = __nested_webpack_require_1865_1884__(20);
            var toJSONSchema = __nested_webpack_require_1865_1884__(23);
            var valid = __nested_webpack_require_1865_1884__(25);
            var XHR;
            if (typeof window !== 'undefined') XHR = __nested_webpack_require_1865_1884__(27);
            /*!
	    Mock - 模拟请求 & 模拟数据
	    https://github.com/nuysoft/Mock
	    墨智 mozhi.gyy@taobao.com nuysoft@gmail.com
	*/ var Mock = {
                Handler: Handler,
                Random: Random,
                Util: Util,
                XHR: XHR,
                RE: RE,
                toJSONSchema: toJSONSchema,
                valid: valid,
                heredoc: Util.heredoc,
                setup: function(settings) {
                    return XHR.setup(settings);
                },
                _mocked: {}
            };
            Mock.version = '1.0.1-beta3';
            // 避免循环依赖
            if (XHR) XHR.Mock = Mock;
            /*
	    * Mock.mock( template )
	    * Mock.mock( function() )
	    * Mock.mock( rurl, template )
	    * Mock.mock( rurl, function(options) )
	    * Mock.mock( rurl, rtype, template )
	    * Mock.mock( rurl, rtype, function(options) )

	    根据数据模板生成模拟数据。
	*/ Mock.mock = function(rurl, rtype, template) {
                // Mock.mock(template)
                if (arguments.length === 1) {
                    return Handler.gen(rurl);
                }
                // Mock.mock(rurl, template)
                if (arguments.length === 2) {
                    template = rtype;
                    rtype = undefined;
                }
                // 拦截 XHR
                if (XHR) window.XMLHttpRequest = XHR;
                Mock._mocked[rurl + (rtype || '')] = {
                    rurl: rurl,
                    rtype: rtype,
                    template: template
                };
                return Mock;
            };
            module1.exports = Mock;
        /***/ },
        /* 1 */ /***/ function(module, exports, __nested_webpack_require_4093_4112__) {
            /* 
	    ## Handler

	    处理数据模板。
	    
	    * Handler.gen( template, name?, context? )

	        入口方法。

	    * Data Template Definition, DTD
	        
	        处理数据模板定义。

	        * Handler.array( options )
	        * Handler.object( options )
	        * Handler.number( options )
	        * Handler.boolean( options )
	        * Handler.string( options )
	        * Handler.function( options )
	        * Handler.regexp( options )
	        
	        处理路径（相对和绝对）。

	        * Handler.getValueByKeyPath( key, options )

	    * Data Placeholder Definition, DPD

	        处理数据占位符定义

	        * Handler.placeholder( placeholder, context, templateContext, options )

	*/ var Constant = __nested_webpack_require_4093_4112__(2);
            var Util = __nested_webpack_require_4093_4112__(3);
            var Parser = __nested_webpack_require_4093_4112__(4);
            var Random = __nested_webpack_require_4093_4112__(5);
            var RE = __nested_webpack_require_4093_4112__(20);
            var Handler = {
                extend: Util.extend
            };
            /*
	    template        属性值（即数据模板）
	    name            属性名
	    context         数据上下文，生成后的数据
	    templateContext 模板上下文，

	    Handle.gen(template, name, options)
	    context
	        currentContext, templateCurrentContext, 
	        path, templatePath
	        root, templateRoot
	*/ Handler.gen = function(template, name, context) {
                /* jshint -W041 */ name = name == undefined ? '' : name + '';
                context = context || {};
                context = {
                    // 当前访问路径，只有属性名，不包括生成规则
                    path: context.path || [
                        Constant.GUID
                    ],
                    templatePath: context.templatePath || [
                        Constant.GUID++
                    ],
                    // 最终属性值的上下文
                    currentContext: context.currentContext,
                    // 属性值模板的上下文
                    templateCurrentContext: context.templateCurrentContext || template,
                    // 最终值的根
                    root: context.root || context.currentContext,
                    // 模板的根
                    templateRoot: context.templateRoot || context.templateCurrentContext || template
                };
                // console.log('path:', context.path.join('.'), template)
                var rule = Parser.parse(name);
                var type = Util.type(template);
                var data;
                if (Handler[type]) {
                    data = Handler[type]({
                        // 属性值类型
                        type: type,
                        // 属性值模板
                        template: template,
                        // 属性名 + 生成规则
                        name: name,
                        // 属性名
                        parsedName: name ? name.replace(Constant.RE_KEY, '$1') : name,
                        // 解析后的生成规则
                        rule: rule,
                        // 相关上下文
                        context: context
                    });
                    if (!context.root) context.root = data;
                    return data;
                }
                return template;
            };
            Handler.extend({
                array: function(options) {
                    var result = [], i, ii;
                    // 'name|1': []
                    // 'name|count': []
                    // 'name|min-max': []
                    if (options.template.length === 0) return result;
                    // 'arr': [{ 'email': '@EMAIL' }, { 'email': '@EMAIL' }]
                    if (!options.rule.parameters) {
                        for(i = 0; i < options.template.length; i++){
                            options.context.path.push(i);
                            options.context.templatePath.push(i);
                            result.push(Handler.gen(options.template[i], i, {
                                path: options.context.path,
                                templatePath: options.context.templatePath,
                                currentContext: result,
                                templateCurrentContext: options.template,
                                root: options.context.root || result,
                                templateRoot: options.context.templateRoot || options.template
                            }));
                            options.context.path.pop();
                            options.context.templatePath.pop();
                        }
                    } else {
                        // 'method|1': ['GET', 'POST', 'HEAD', 'DELETE']
                        if (options.rule.min === 1 && options.rule.max === undefined) {
                            // fix #17
                            options.context.path.push(options.name);
                            options.context.templatePath.push(options.name);
                            result = Random.pick(Handler.gen(options.template, undefined, {
                                path: options.context.path,
                                templatePath: options.context.templatePath,
                                currentContext: result,
                                templateCurrentContext: options.template,
                                root: options.context.root || result,
                                templateRoot: options.context.templateRoot || options.template
                            }));
                            options.context.path.pop();
                            options.context.templatePath.pop();
                        } else {
                            // 'data|+1': [{}, {}]
                            if (options.rule.parameters[2]) {
                                options.template.__order_index = options.template.__order_index || 0;
                                options.context.path.push(options.name);
                                options.context.templatePath.push(options.name);
                                result = Handler.gen(options.template, undefined, {
                                    path: options.context.path,
                                    templatePath: options.context.templatePath,
                                    currentContext: result,
                                    templateCurrentContext: options.template,
                                    root: options.context.root || result,
                                    templateRoot: options.context.templateRoot || options.template
                                })[options.template.__order_index % options.template.length];
                                options.template.__order_index += +options.rule.parameters[2];
                                options.context.path.pop();
                                options.context.templatePath.pop();
                            } else {
                                // 'data|1-10': [{}]
                                for(i = 0; i < options.rule.count; i++){
                                    // 'data|1-10': [{}, {}]
                                    for(ii = 0; ii < options.template.length; ii++){
                                        options.context.path.push(result.length);
                                        options.context.templatePath.push(ii);
                                        result.push(Handler.gen(options.template[ii], result.length, {
                                            path: options.context.path,
                                            templatePath: options.context.templatePath,
                                            currentContext: result,
                                            templateCurrentContext: options.template,
                                            root: options.context.root || result,
                                            templateRoot: options.context.templateRoot || options.template
                                        }));
                                        options.context.path.pop();
                                        options.context.templatePath.pop();
                                    }
                                }
                            }
                        }
                    }
                    return result;
                },
                object: function(options) {
                    var result = {}, keys, fnKeys, key, parsedKey, inc, i;
                    // 'obj|min-max': {}
                    /* jshint -W041 */ if (options.rule.min != undefined) {
                        keys = Util.keys(options.template);
                        keys = Random.shuffle(keys);
                        keys = keys.slice(0, options.rule.count);
                        for(i = 0; i < keys.length; i++){
                            key = keys[i];
                            parsedKey = key.replace(Constant.RE_KEY, '$1');
                            options.context.path.push(parsedKey);
                            options.context.templatePath.push(key);
                            result[parsedKey] = Handler.gen(options.template[key], key, {
                                path: options.context.path,
                                templatePath: options.context.templatePath,
                                currentContext: result,
                                templateCurrentContext: options.template,
                                root: options.context.root || result,
                                templateRoot: options.context.templateRoot || options.template
                            });
                            options.context.path.pop();
                            options.context.templatePath.pop();
                        }
                    } else {
                        // 'obj': {}
                        keys = [];
                        fnKeys = [] // #25 改变了非函数属性的顺序，查找起来不方便
                        ;
                        for(key in options.template){
                            (typeof options.template[key] === 'function' ? fnKeys : keys).push(key);
                        }
                        keys = keys.concat(fnKeys);
                        /*
	                会改变非函数属性的顺序
	                keys = Util.keys(options.template)
	                keys.sort(function(a, b) {
	                    var afn = typeof options.template[a] === 'function'
	                    var bfn = typeof options.template[b] === 'function'
	                    if (afn === bfn) return 0
	                    if (afn && !bfn) return 1
	                    if (!afn && bfn) return -1
	                })
	            */ for(i = 0; i < keys.length; i++){
                            key = keys[i];
                            parsedKey = key.replace(Constant.RE_KEY, '$1');
                            options.context.path.push(parsedKey);
                            options.context.templatePath.push(key);
                            result[parsedKey] = Handler.gen(options.template[key], key, {
                                path: options.context.path,
                                templatePath: options.context.templatePath,
                                currentContext: result,
                                templateCurrentContext: options.template,
                                root: options.context.root || result,
                                templateRoot: options.context.templateRoot || options.template
                            });
                            options.context.path.pop();
                            options.context.templatePath.pop();
                            // 'id|+1': 1
                            inc = key.match(Constant.RE_KEY);
                            if (inc && inc[2] && Util.type(options.template[key]) === 'number') {
                                options.template[key] += parseInt(inc[2], 10);
                            }
                        }
                    }
                    return result;
                },
                number: function(options) {
                    var result, parts;
                    if (options.rule.decimal) {
                        options.template += '';
                        parts = options.template.split('.');
                        // 'float1|.1-10': 10,
                        // 'float2|1-100.1-10': 1,
                        // 'float3|999.1-10': 1,
                        // 'float4|.3-10': 123.123,
                        parts[0] = options.rule.range ? options.rule.count : parts[0];
                        parts[1] = (parts[1] || '').slice(0, options.rule.dcount);
                        while(parts[1].length < options.rule.dcount){
                            parts[1] += // 最后一位不能为 0：如果最后一位为 0，会被 JS 引擎忽略掉。
                            parts[1].length < options.rule.dcount - 1 ? Random.character('number') : Random.character('123456789');
                        }
                        result = parseFloat(parts.join('.'), 10);
                    } else {
                        // 'grade1|1-100': 1,
                        result = options.rule.range && !options.rule.parameters[2] ? options.rule.count : options.template;
                    }
                    return result;
                },
                boolean: function(options) {
                    var result;
                    // 'prop|multiple': false, 当前值是相反值的概率倍数
                    // 'prop|probability-probability': false, 当前值与相反值的概率
                    result = options.rule.parameters ? Random.bool(options.rule.min, options.rule.max, options.template) : options.template;
                    return result;
                },
                string: function(options) {
                    var result = '', i, placeholders, ph, phed;
                    if (options.template.length) {
                        //  'foo': '★',
                        /* jshint -W041 */ if (options.rule.count == undefined) {
                            result += options.template;
                        }
                        // 'star|1-5': '★',
                        for(i = 0; i < options.rule.count; i++){
                            result += options.template;
                        }
                        // 'email|1-10': '@EMAIL, ',
                        placeholders = result.match(Constant.RE_PLACEHOLDER) || [] // A-Z_0-9 > \w_
                        ;
                        for(i = 0; i < placeholders.length; i++){
                            ph = placeholders[i];
                            // 遇到转义斜杠，不需要解析占位符
                            if (/^\\/.test(ph)) {
                                placeholders.splice(i--, 1);
                                continue;
                            }
                            phed = Handler.placeholder(ph, options.context.currentContext, options.context.templateCurrentContext, options);
                            // 只有一个占位符，并且没有其他字符
                            if (placeholders.length === 1 && ph === result && typeof phed !== typeof result) {
                                result = phed;
                                break;
                                if (Util.isNumeric(phed)) {
                                    result = parseFloat(phed, 10);
                                    break;
                                }
                                if (/^(true|false)$/.test(phed)) {
                                    result = phed === 'true' ? true : phed === 'false' ? false : phed // 已经是布尔值
                                    ;
                                    break;
                                }
                            }
                            result = result.replace(ph, phed);
                        }
                    } else {
                        // 'ASCII|1-10': '',
                        // 'ASCII': '',
                        result = options.rule.range ? Random.string(options.rule.count) : options.template;
                    }
                    return result;
                },
                'function': function(options) {
                    // ( context, options )
                    return options.template.call(options.context.currentContext, options);
                },
                'regexp': function(options) {
                    var source = '';
                    // 'name': /regexp/,
                    /* jshint -W041 */ if (options.rule.count == undefined) {
                        source += options.template.source // regexp.source
                        ;
                    }
                    // 'name|1-5': /regexp/,
                    for(var i = 0; i < options.rule.count; i++){
                        source += options.template.source;
                    }
                    return RE.Handler.gen(RE.Parser.parse(source));
                }
            });
            Handler.extend({
                _all: function() {
                    var re = {};
                    for(var key in Random)re[key.toLowerCase()] = key;
                    return re;
                },
                // 处理占位符，转换为最终值
                placeholder: function(placeholder, obj, templateContext, options) {
                    // console.log(options.context.path)
                    // 1 key, 2 params
                    Constant.RE_PLACEHOLDER.exec('');
                    var parts = Constant.RE_PLACEHOLDER.exec(placeholder), key = parts && parts[1], lkey = key && key.toLowerCase(), okey = this._all()[lkey], params = parts && parts[2] || '';
                    var pathParts = this.splitPathToArray(key);
                    // 解析占位符的参数
                    try {
                        // 1. 尝试保持参数的类型
                        /*
	                #24 [Window Firefox 30.0 引用 占位符 抛错](https://github.com/nuysoft/Mock/issues/24)
	                [BX9056: 各浏览器下 window.eval 方法的执行上下文存在差异](http://www.w3help.org/zh-cn/causes/BX9056)
	                应该属于 Window Firefox 30.0 的 BUG
	            */ /* jshint -W061 */ params = eval('(function(){ return [].splice.call(arguments, 0 ) })(' + params + ')');
                    } catch (error) {
                        // 2. 如果失败，只能解析为字符串
                        // console.error(error)
                        // if (error instanceof ReferenceError) params = parts[2].split(/,\s*/);
                        // else throw error
                        params = parts[2].split(/,\s*/);
                    }
                    // 占位符优先引用数据模板中的属性
                    if (obj && key in obj) return obj[key];
                    // @index @key
                    // if (Constant.RE_INDEX.test(key)) return +options.name
                    // if (Constant.RE_KEY.test(key)) return options.name
                    // 绝对路径 or 相对路径
                    if (key.charAt(0) === '/' || pathParts.length > 1) return this.getValueByKeyPath(key, options);
                    // 递归引用数据模板中的属性
                    if (templateContext && typeof templateContext === 'object' && key in templateContext && placeholder !== templateContext[key] // fix #15 避免自己依赖自己
                    ) {
                        // 先计算被引用的属性值
                        templateContext[key] = Handler.gen(templateContext[key], key, {
                            currentContext: obj,
                            templateCurrentContext: templateContext
                        });
                        return templateContext[key];
                    }
                    // 如果未找到，则原样返回
                    if (!(key in Random) && !(lkey in Random) && !(okey in Random)) return placeholder;
                    // 递归解析参数中的占位符
                    for(var i = 0; i < params.length; i++){
                        Constant.RE_PLACEHOLDER.exec('');
                        if (Constant.RE_PLACEHOLDER.test(params[i])) {
                            params[i] = Handler.placeholder(params[i], obj, templateContext, options);
                        }
                    }
                    var handle = Random[key] || Random[lkey] || Random[okey];
                    switch(Util.type(handle)){
                        case 'array':
                            // 自动从数组中取一个，例如 @areas
                            return Random.pick(handle);
                        case 'function':
                            // 执行占位符方法（大多数情况）
                            handle.options = options;
                            var re = handle.apply(Random, params);
                            if (re === undefined) re = '' // 因为是在字符串中，所以默认为空字符串。
                            ;
                            delete handle.options;
                            return re;
                    }
                },
                getValueByKeyPath: function(key, options) {
                    var originalKey = key;
                    var keyPathParts = this.splitPathToArray(key);
                    var absolutePathParts = [];
                    // 绝对路径
                    if (key.charAt(0) === '/') {
                        absolutePathParts = [
                            options.context.path[0]
                        ].concat(this.normalizePath(keyPathParts));
                    } else {
                        // 相对路径
                        if (keyPathParts.length > 1) {
                            absolutePathParts = options.context.path.slice(0);
                            absolutePathParts.pop();
                            absolutePathParts = this.normalizePath(absolutePathParts.concat(keyPathParts));
                        }
                    }
                    try {
                        key = keyPathParts[keyPathParts.length - 1];
                        var currentContext = options.context.root;
                        var templateCurrentContext = options.context.templateRoot;
                        for(var i = 1; i < absolutePathParts.length - 1; i++){
                            currentContext = currentContext[absolutePathParts[i]];
                            templateCurrentContext = templateCurrentContext[absolutePathParts[i]];
                        }
                        // 引用的值已经计算好
                        if (currentContext && key in currentContext) return currentContext[key];
                        // 尚未计算，递归引用数据模板中的属性
                        if (templateCurrentContext && typeof templateCurrentContext === 'object' && key in templateCurrentContext && originalKey !== templateCurrentContext[key] // fix #15 避免自己依赖自己
                        ) {
                            // 先计算被引用的属性值
                            templateCurrentContext[key] = Handler.gen(templateCurrentContext[key], key, {
                                currentContext: currentContext,
                                templateCurrentContext: templateCurrentContext
                            });
                            return templateCurrentContext[key];
                        }
                    } catch (err) {}
                    return '@' + keyPathParts.join('/');
                },
                // https://github.com/kissyteam/kissy/blob/master/src/path/src/path.js
                normalizePath: function(pathParts) {
                    var newPathParts = [];
                    for(var i = 0; i < pathParts.length; i++){
                        switch(pathParts[i]){
                            case '..':
                                newPathParts.pop();
                                break;
                            case '.':
                                break;
                            default:
                                newPathParts.push(pathParts[i]);
                        }
                    }
                    return newPathParts;
                },
                splitPathToArray: function(path) {
                    var parts = path.split(/\/+/);
                    if (!parts[parts.length - 1]) parts = parts.slice(0, -1);
                    if (!parts[0]) parts = parts.slice(1);
                    return parts;
                }
            });
            module.exports = Handler;
        /***/ },
        /* 2 */ /***/ function(module1, exports1) {
            /*
	    ## Constant

	    常量集合。
	 */ /*
	    RE_KEY
	        'name|min-max': value
	        'name|count': value
	        'name|min-max.dmin-dmax': value
	        'name|min-max.dcount': value
	        'name|count.dmin-dmax': value
	        'name|count.dcount': value
	        'name|+step': value

	        1 name, 2 step, 3 range [ min, max ], 4 drange [ dmin, dmax ]

	    RE_PLACEHOLDER
	        placeholder(*)

	    [正则查看工具](http://www.regexper.com/)

	    #26 生成规则 支持 负数，例如 number|-100-100
	*/ module1.exports = {
                GUID: 1,
                RE_KEY: /(.+)\|(?:\+(\d+)|([\+\-]?\d+-?[\+\-]?\d*)?(?:\.(\d+-?\d*))?)/,
                RE_RANGE: /([\+\-]?\d+)-?([\+\-]?\d+)?/,
                RE_PLACEHOLDER: /\\*@([^@#%&()\?\s]+)(?:\((.*?)\))?/g
            };
        /***/ },
        /* 3 */ /***/ function(module1, exports1) {
            /*
	    ## Utilities
	*/ var Util = {};
            Util.extend = function extend() {
                var target = arguments[0] || {}, i = 1, length = arguments.length, options, name, src, copy, clone;
                if (length === 1) {
                    target = this;
                    i = 0;
                }
                for(; i < length; i++){
                    options = arguments[i];
                    if (!options) continue;
                    for(name in options){
                        src = target[name];
                        copy = options[name];
                        if (target === copy) continue;
                        if (copy === undefined) continue;
                        if (Util.isArray(copy) || Util.isObject(copy)) {
                            if (Util.isArray(copy)) clone = src && Util.isArray(src) ? src : [];
                            if (Util.isObject(copy)) clone = src && Util.isObject(src) ? src : {};
                            target[name] = Util.extend(clone, copy);
                        } else {
                            target[name] = copy;
                        }
                    }
                }
                return target;
            };
            Util.each = function each(obj, iterator, context) {
                var i, key;
                if (this.type(obj) === 'number') {
                    for(i = 0; i < obj; i++){
                        iterator(i, i);
                    }
                } else if (obj.length === +obj.length) {
                    for(i = 0; i < obj.length; i++){
                        if (iterator.call(context, obj[i], i, obj) === false) break;
                    }
                } else {
                    for(key in obj){
                        if (iterator.call(context, obj[key], key, obj) === false) break;
                    }
                }
            };
            Util.type = function type(obj) {
                return obj === null || obj === undefined ? String(obj) : Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1].toLowerCase();
            };
            Util.each('String Object Array RegExp Function'.split(' '), function(value) {
                Util['is' + value] = function(obj) {
                    return Util.type(obj) === value.toLowerCase();
                };
            });
            Util.isObjectOrArray = function(value) {
                return Util.isObject(value) || Util.isArray(value);
            };
            Util.isNumeric = function(value) {
                return !isNaN(parseFloat(value)) && isFinite(value);
            };
            Util.keys = function(obj) {
                var keys = [];
                for(var key in obj){
                    if (obj.hasOwnProperty(key)) keys.push(key);
                }
                return keys;
            };
            Util.values = function(obj) {
                var values = [];
                for(var key in obj){
                    if (obj.hasOwnProperty(key)) values.push(obj[key]);
                }
                return values;
            };
            /*
	    ### Mock.heredoc(fn)

	    * Mock.heredoc(fn)

	    以直观、安全的方式书写（多行）HTML 模板。

	    **使用示例**如下所示：

	        var tpl = Mock.heredoc(function() {
	            /*!
	        {{email}}{{age}}
	        <!-- Mock { 
	            email: '@EMAIL',
	            age: '@INT(1,100)'
	        } -->
	            *\/
	        })
	    
	    **相关阅读**
	    * [Creating multiline strings in JavaScript](http://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript)、
	*/ Util.heredoc = function heredoc(fn) {
                // 1. 移除起始的 function(){ /*!
                // 2. 移除末尾的 */ }
                // 3. 移除起始和末尾的空格
                return fn.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '').replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '') // .trim()
                ;
            };
            Util.noop = function() {};
            module1.exports = Util;
        /***/ },
        /* 4 */ /***/ function(module1, exports1, __nested_webpack_require_34306_34325__) {
            /*
		## Parser

		解析数据模板（属性名部分）。

		* Parser.parse( name )
			
			```json
			{
				parameters: [ name, inc, range, decimal ],
				rnage: [ min , max ],

				min: min,
				max: max,
				count : count,

				decimal: decimal,
				dmin: dmin,
				dmax: dmax,
				dcount: dcount
			}
			```
	 */ var Constant = __nested_webpack_require_34306_34325__(2);
            var Random = __nested_webpack_require_34306_34325__(5);
            /* jshint -W041 */ module1.exports = {
                parse: function(name) {
                    name = name == undefined ? '' : name + '';
                    var parameters = (name || '').match(Constant.RE_KEY);
                    var range = parameters && parameters[3] && parameters[3].match(Constant.RE_RANGE);
                    var min = range && range[1] && parseInt(range[1], 10) // || 1
                    ;
                    var max = range && range[2] && parseInt(range[2], 10) // || 1
                    ;
                    // repeat || min-max || 1
                    // var count = range ? !range[2] && parseInt(range[1], 10) || Random.integer(min, max) : 1
                    var count = range ? !range[2] ? parseInt(range[1], 10) : Random.integer(min, max) : undefined;
                    var decimal = parameters && parameters[4] && parameters[4].match(Constant.RE_RANGE);
                    var dmin = decimal && decimal[1] && parseInt(decimal[1], 10) // || 0,
                    ;
                    var dmax = decimal && decimal[2] && parseInt(decimal[2], 10) // || 0,
                    ;
                    // int || dmin-dmax || 0
                    var dcount = decimal ? !decimal[2] && parseInt(decimal[1], 10) || Random.integer(dmin, dmax) : undefined;
                    var result = {
                        // 1 name, 2 inc, 3 range, 4 decimal
                        parameters: parameters,
                        // 1 min, 2 max
                        range: range,
                        min: min,
                        max: max,
                        // min-max
                        count: count,
                        // 是否有 decimal
                        decimal: decimal,
                        dmin: dmin,
                        dmax: dmax,
                        // dmin-dimax
                        dcount: dcount
                    };
                    for(var r in result){
                        if (result[r] != undefined) return result;
                    }
                    return {};
                }
            };
        /***/ },
        /* 5 */ /***/ function(module1, exports1, __nested_webpack_require_36943_36962__) {
            /*
	    ## Mock.Random
	    
	    工具类，用于生成各种随机数据。
	*/ var Util = __nested_webpack_require_36943_36962__(3);
            var Random = {
                extend: Util.extend
            };
            Random.extend(__nested_webpack_require_36943_36962__(6));
            Random.extend(__nested_webpack_require_36943_36962__(7));
            Random.extend(__nested_webpack_require_36943_36962__(8));
            Random.extend(__nested_webpack_require_36943_36962__(10));
            Random.extend(__nested_webpack_require_36943_36962__(13));
            Random.extend(__nested_webpack_require_36943_36962__(15));
            Random.extend(__nested_webpack_require_36943_36962__(16));
            Random.extend(__nested_webpack_require_36943_36962__(17));
            Random.extend(__nested_webpack_require_36943_36962__(14));
            Random.extend(__nested_webpack_require_36943_36962__(19));
            module1.exports = Random;
        /***/ },
        /* 6 */ /***/ function(module1, exports1) {
            /*
	    ## Basics
	*/ module1.exports = {
                // 返回一个随机的布尔值。
                boolean: function(min, max, cur) {
                    if (cur !== undefined) {
                        min = typeof min !== 'undefined' && !isNaN(min) ? parseInt(min, 10) : 1;
                        max = typeof max !== 'undefined' && !isNaN(max) ? parseInt(max, 10) : 1;
                        return Math.random() > 1.0 / (min + max) * min ? !cur : cur;
                    }
                    return Math.random() >= 0.5;
                },
                bool: function(min, max, cur) {
                    return this.boolean(min, max, cur);
                },
                // 返回一个随机的自然数（大于等于 0 的整数）。
                natural: function(min, max) {
                    min = typeof min !== 'undefined' ? parseInt(min, 10) : 0;
                    max = typeof max !== 'undefined' ? parseInt(max, 10) : 9007199254740992 // 2^53
                    ;
                    return Math.round(Math.random() * (max - min)) + min;
                },
                // 返回一个随机的整数。
                integer: function(min, max) {
                    min = typeof min !== 'undefined' ? parseInt(min, 10) : -9007199254740992;
                    max = typeof max !== 'undefined' ? parseInt(max, 10) : 9007199254740992 // 2^53
                    ;
                    return Math.round(Math.random() * (max - min)) + min;
                },
                int: function(min, max) {
                    return this.integer(min, max);
                },
                // 返回一个随机的浮点数。
                float: function(min, max, dmin, dmax) {
                    dmin = dmin === undefined ? 0 : dmin;
                    dmin = Math.max(Math.min(dmin, 17), 0);
                    dmax = dmax === undefined ? 17 : dmax;
                    dmax = Math.max(Math.min(dmax, 17), 0);
                    var ret = this.integer(min, max) + '.';
                    for(var i = 0, dcount = this.natural(dmin, dmax); i < dcount; i++){
                        ret += // 最后一位不能为 0：如果最后一位为 0，会被 JS 引擎忽略掉。
                        i < dcount - 1 ? this.character('number') : this.character('123456789');
                    }
                    return parseFloat(ret, 10);
                },
                // 返回一个随机字符。
                character: function(pool) {
                    var pools = {
                        lower: 'abcdefghijklmnopqrstuvwxyz',
                        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                        number: '0123456789',
                        symbol: '!@#$%^&*()[]'
                    };
                    pools.alpha = pools.lower + pools.upper;
                    pools['undefined'] = pools.lower + pools.upper + pools.number + pools.symbol;
                    pool = pools[('' + pool).toLowerCase()] || pool;
                    return pool.charAt(this.natural(0, pool.length - 1));
                },
                char: function(pool) {
                    return this.character(pool);
                },
                // 返回一个随机字符串。
                string: function(pool, min, max) {
                    var len;
                    switch(arguments.length){
                        case 0:
                            len = this.natural(3, 7);
                            break;
                        case 1:
                            len = pool;
                            pool = undefined;
                            break;
                        case 2:
                            // ( pool, length )
                            if (typeof arguments[0] === 'string') {
                                len = min;
                            } else {
                                // ( min, max )
                                len = this.natural(pool, min);
                                pool = undefined;
                            }
                            break;
                        case 3:
                            len = this.natural(min, max);
                            break;
                    }
                    var text = '';
                    for(var i = 0; i < len; i++){
                        text += this.character(pool);
                    }
                    return text;
                },
                str: function() {
                    return this.string.apply(this, arguments);
                },
                // 返回一个整型数组。
                range: function(start, stop, step) {
                    // range( stop )
                    if (arguments.length <= 1) {
                        stop = start || 0;
                        start = 0;
                    }
                    // range( start, stop )
                    step = arguments[2] || 1;
                    start = +start;
                    stop = +stop;
                    step = +step;
                    var len = Math.max(Math.ceil((stop - start) / step), 0);
                    var idx = 0;
                    var range = new Array(len);
                    while(idx < len){
                        range[idx++] = start;
                        start += step;
                    }
                    return range;
                }
            };
        /***/ },
        /* 7 */ /***/ function(module1, exports1) {
            /*
	    ## Date
	*/ var patternLetters = {
                yyyy: 'getFullYear',
                yy: function(date) {
                    return ('' + date.getFullYear()).slice(2);
                },
                y: 'yy',
                MM: function(date) {
                    var m = date.getMonth() + 1;
                    return m < 10 ? '0' + m : m;
                },
                M: function(date) {
                    return date.getMonth() + 1;
                },
                dd: function(date) {
                    var d = date.getDate();
                    return d < 10 ? '0' + d : d;
                },
                d: 'getDate',
                HH: function(date) {
                    var h = date.getHours();
                    return h < 10 ? '0' + h : h;
                },
                H: 'getHours',
                hh: function(date) {
                    var h = date.getHours() % 12;
                    return h < 10 ? '0' + h : h;
                },
                h: function(date) {
                    return date.getHours() % 12;
                },
                mm: function(date) {
                    var m = date.getMinutes();
                    return m < 10 ? '0' + m : m;
                },
                m: 'getMinutes',
                ss: function(date) {
                    var s = date.getSeconds();
                    return s < 10 ? '0' + s : s;
                },
                s: 'getSeconds',
                SS: function(date) {
                    var ms = date.getMilliseconds();
                    return ms < 10 && '00' + ms || ms < 100 && '0' + ms || ms;
                },
                S: 'getMilliseconds',
                A: function(date) {
                    return date.getHours() < 12 ? 'AM' : 'PM';
                },
                a: function(date) {
                    return date.getHours() < 12 ? 'am' : 'pm';
                },
                T: 'getTime'
            };
            module1.exports = {
                // 日期占位符集合。
                _patternLetters: patternLetters,
                // 日期占位符正则。
                _rformat: new RegExp(function() {
                    var re = [];
                    for(var i in patternLetters)re.push(i);
                    return '(' + re.join('|') + ')';
                }(), 'g'),
                // 格式化日期。
                _formatDate: function(date, format) {
                    return format.replace(this._rformat, function creatNewSubString($0, flag) {
                        return typeof patternLetters[flag] === 'function' ? patternLetters[flag](date) : patternLetters[flag] in patternLetters ? creatNewSubString($0, patternLetters[flag]) : date[patternLetters[flag]]();
                    });
                },
                // 生成一个随机的 Date 对象。
                _randomDate: function(min, max) {
                    min = min === undefined ? new Date(0) : min;
                    max = max === undefined ? new Date() : max;
                    return new Date(Math.random() * (max.getTime() - min.getTime()));
                },
                // 返回一个随机的日期字符串。
                date: function(format) {
                    format = format || 'yyyy-MM-dd';
                    return this._formatDate(this._randomDate(), format);
                },
                // 返回一个随机的时间字符串。
                time: function(format) {
                    format = format || 'HH:mm:ss';
                    return this._formatDate(this._randomDate(), format);
                },
                // 返回一个随机的日期和时间字符串。
                datetime: function(format) {
                    format = format || 'yyyy-MM-dd HH:mm:ss';
                    return this._formatDate(this._randomDate(), format);
                },
                // 返回当前的日期和时间字符串。
                now: function(unit, format) {
                    // now(unit) now(format)
                    if (arguments.length === 1) {
                        // now(format)
                        if (!/year|month|day|hour|minute|second|week/.test(unit)) {
                            format = unit;
                            unit = '';
                        }
                    }
                    unit = (unit || '').toLowerCase();
                    format = format || 'yyyy-MM-dd HH:mm:ss';
                    var date = new Date();
                    /* jshint -W086 */ // 参考自 http://momentjs.cn/docs/#/manipulating/start-of/
                    switch(unit){
                        case 'year':
                            date.setMonth(0);
                        case 'month':
                            date.setDate(1);
                        case 'week':
                        case 'day':
                            date.setHours(0);
                        case 'hour':
                            date.setMinutes(0);
                        case 'minute':
                            date.setSeconds(0);
                        case 'second':
                            date.setMilliseconds(0);
                    }
                    switch(unit){
                        case 'week':
                            date.setDate(date.getDate() - date.getDay());
                    }
                    return this._formatDate(date, format);
                }
            };
        /***/ },
        /* 8 */ /***/ function(module1, exports1, __nested_webpack_require_48894_48913__) {
            /* WEBPACK VAR INJECTION */ (function(module1) {
                /*
	    ## Image
	*/ module1.exports = {
                    // 常见的广告宽高
                    _adSize: [
                        '300x250',
                        '250x250',
                        '240x400',
                        '336x280',
                        '180x150',
                        '720x300',
                        '468x60',
                        '234x60',
                        '88x31',
                        '120x90',
                        '120x60',
                        '120x240',
                        '125x125',
                        '728x90',
                        '160x600',
                        '120x600',
                        '300x600'
                    ],
                    // 常见的屏幕宽高
                    _screenSize: [
                        '320x200',
                        '320x240',
                        '640x480',
                        '800x480',
                        '800x480',
                        '1024x600',
                        '1024x768',
                        '1280x800',
                        '1440x900',
                        '1920x1200',
                        '2560x1600'
                    ],
                    // 常见的视频宽高
                    _videoSize: [
                        '720x480',
                        '768x576',
                        '1280x720',
                        '1920x1080'
                    ],
                    /*
	        生成一个随机的图片地址。

	        替代图片源
	            http://fpoimg.com/
	        参考自 
	            http://rensanning.iteye.com/blog/1933310
	            http://code.tutsplus.com/articles/the-top-8-placeholders-for-web-designers--net-19485
	    */ image: function(size, background, foreground, format, text) {
                        // Random.image( size, background, foreground, text )
                        if (arguments.length === 4) {
                            text = format;
                            format = undefined;
                        }
                        // Random.image( size, background, text )
                        if (arguments.length === 3) {
                            text = foreground;
                            foreground = undefined;
                        }
                        // Random.image()
                        if (!size) size = this.pick(this._adSize);
                        if (background && ~background.indexOf('#')) background = background.slice(1);
                        if (foreground && ~foreground.indexOf('#')) foreground = foreground.slice(1);
                        // http://dummyimage.com/600x400/cc00cc/470047.png&text=hello
                        return 'http://dummyimage.com/' + size + (background ? '/' + background : '') + (foreground ? '/' + foreground : '') + (format ? '.' + format : '') + (text ? '&text=' + text : '');
                    },
                    img: function() {
                        return this.image.apply(this, arguments);
                    },
                    /*
	        BrandColors
	        http://brandcolors.net/
	        A collection of major brand color codes curated by Galen Gidman.
	        大牌公司的颜色集合

	        // 获取品牌和颜色
	        $('h2').each(function(index, item){
	            item = $(item)
	            console.log('\'' + item.text() + '\'', ':', '\'' + item.next().text() + '\'', ',')
	        })
	    */ _brandColors: {
                        '4ormat': '#fb0a2a',
                        '500px': '#02adea',
                        'About.me (blue)': '#00405d',
                        'About.me (yellow)': '#ffcc33',
                        'Addvocate': '#ff6138',
                        'Adobe': '#ff0000',
                        'Aim': '#fcd20b',
                        'Amazon': '#e47911',
                        'Android': '#a4c639',
                        'Angie\'s List': '#7fbb00',
                        'AOL': '#0060a3',
                        'Atlassian': '#003366',
                        'Behance': '#053eff',
                        'Big Cartel': '#97b538',
                        'bitly': '#ee6123',
                        'Blogger': '#fc4f08',
                        'Boeing': '#0039a6',
                        'Booking.com': '#003580',
                        'Carbonmade': '#613854',
                        'Cheddar': '#ff7243',
                        'Code School': '#3d4944',
                        'Delicious': '#205cc0',
                        'Dell': '#3287c1',
                        'Designmoo': '#e54a4f',
                        'Deviantart': '#4e6252',
                        'Designer News': '#2d72da',
                        'Devour': '#fd0001',
                        'DEWALT': '#febd17',
                        'Disqus (blue)': '#59a3fc',
                        'Disqus (orange)': '#db7132',
                        'Dribbble': '#ea4c89',
                        'Dropbox': '#3d9ae8',
                        'Drupal': '#0c76ab',
                        'Dunked': '#2a323a',
                        'eBay': '#89c507',
                        'Ember': '#f05e1b',
                        'Engadget': '#00bdf6',
                        'Envato': '#528036',
                        'Etsy': '#eb6d20',
                        'Evernote': '#5ba525',
                        'Fab.com': '#dd0017',
                        'Facebook': '#3b5998',
                        'Firefox': '#e66000',
                        'Flickr (blue)': '#0063dc',
                        'Flickr (pink)': '#ff0084',
                        'Forrst': '#5b9a68',
                        'Foursquare': '#25a0ca',
                        'Garmin': '#007cc3',
                        'GetGlue': '#2d75a2',
                        'Gimmebar': '#f70078',
                        'GitHub': '#171515',
                        'Google Blue': '#0140ca',
                        'Google Green': '#16a61e',
                        'Google Red': '#dd1812',
                        'Google Yellow': '#fcca03',
                        'Google+': '#dd4b39',
                        'Grooveshark': '#f77f00',
                        'Groupon': '#82b548',
                        'Hacker News': '#ff6600',
                        'HelloWallet': '#0085ca',
                        'Heroku (light)': '#c7c5e6',
                        'Heroku (dark)': '#6567a5',
                        'HootSuite': '#003366',
                        'Houzz': '#73ba37',
                        'HTML5': '#ec6231',
                        'IKEA': '#ffcc33',
                        'IMDb': '#f3ce13',
                        'Instagram': '#3f729b',
                        'Intel': '#0071c5',
                        'Intuit': '#365ebf',
                        'Kickstarter': '#76cc1e',
                        'kippt': '#e03500',
                        'Kodery': '#00af81',
                        'LastFM': '#c3000d',
                        'LinkedIn': '#0e76a8',
                        'Livestream': '#cf0005',
                        'Lumo': '#576396',
                        'Mixpanel': '#a086d3',
                        'Meetup': '#e51937',
                        'Nokia': '#183693',
                        'NVIDIA': '#76b900',
                        'Opera': '#cc0f16',
                        'Path': '#e41f11',
                        'PayPal (dark)': '#1e477a',
                        'PayPal (light)': '#3b7bbf',
                        'Pinboard': '#0000e6',
                        'Pinterest': '#c8232c',
                        'PlayStation': '#665cbe',
                        'Pocket': '#ee4056',
                        'Prezi': '#318bff',
                        'Pusha': '#0f71b4',
                        'Quora': '#a82400',
                        'QUOTE.fm': '#66ceff',
                        'Rdio': '#008fd5',
                        'Readability': '#9c0000',
                        'Red Hat': '#cc0000',
                        'Resource': '#7eb400',
                        'Rockpack': '#0ba6ab',
                        'Roon': '#62b0d9',
                        'RSS': '#ee802f',
                        'Salesforce': '#1798c1',
                        'Samsung': '#0c4da2',
                        'Shopify': '#96bf48',
                        'Skype': '#00aff0',
                        'Snagajob': '#f47a20',
                        'Softonic': '#008ace',
                        'SoundCloud': '#ff7700',
                        'Space Box': '#f86960',
                        'Spotify': '#81b71a',
                        'Sprint': '#fee100',
                        'Squarespace': '#121212',
                        'StackOverflow': '#ef8236',
                        'Staples': '#cc0000',
                        'Status Chart': '#d7584f',
                        'Stripe': '#008cdd',
                        'StudyBlue': '#00afe1',
                        'StumbleUpon': '#f74425',
                        'T-Mobile': '#ea0a8e',
                        'Technorati': '#40a800',
                        'The Next Web': '#ef4423',
                        'Treehouse': '#5cb868',
                        'Trulia': '#5eab1f',
                        'Tumblr': '#34526f',
                        'Twitch.tv': '#6441a5',
                        'Twitter': '#00acee',
                        'TYPO3': '#ff8700',
                        'Ubuntu': '#dd4814',
                        'Ustream': '#3388ff',
                        'Verizon': '#ef1d1d',
                        'Vimeo': '#86c9ef',
                        'Vine': '#00a478',
                        'Virb': '#06afd8',
                        'Virgin Media': '#cc0000',
                        'Wooga': '#5b009c',
                        'WordPress (blue)': '#21759b',
                        'WordPress (orange)': '#d54e21',
                        'WordPress (grey)': '#464646',
                        'Wunderlist': '#2b88d9',
                        'XBOX': '#9bc848',
                        'XING': '#126567',
                        'Yahoo!': '#720e9e',
                        'Yandex': '#ffcc00',
                        'Yelp': '#c41200',
                        'YouTube': '#c4302b',
                        'Zalongo': '#5498dc',
                        'Zendesk': '#78a300',
                        'Zerply': '#9dcc7a',
                        'Zootool': '#5e8b1d'
                    },
                    _brandNames: function() {
                        var brands = [];
                        for(var b in this._brandColors){
                            brands.push(b);
                        }
                        return brands;
                    },
                    /*
	        生成一段随机的 Base64 图片编码。

	        https://github.com/imsky/holder
	        Holder renders image placeholders entirely on the client side.

	        dataImageHolder: function(size) {
	            return 'holder.js/' + size
	        },
	    */ dataImage: function(size, text) {
                        var canvas;
                        if (typeof document !== 'undefined') {
                            canvas = document.createElement('canvas');
                        } else {
                            /*
	                https://github.com/Automattic/node-canvas
	                    npm install canvas --save
	                安装问题：
	                * http://stackoverflow.com/questions/22953206/gulp-issues-with-cario-install-command-not-found-when-trying-to-installing-canva
	                * https://github.com/Automattic/node-canvas/issues/415
	                * https://github.com/Automattic/node-canvas/wiki/_pages

	                PS：node-canvas 的安装过程实在是太繁琐了，所以不放入 package.json 的 dependencies。
	             */ var Canvas = module1.require('canvas');
                            canvas = new Canvas();
                        }
                        var ctx = canvas && canvas.getContext && canvas.getContext("2d");
                        if (!canvas || !ctx) return '';
                        if (!size) size = this.pick(this._adSize);
                        text = text !== undefined ? text : size;
                        size = size.split('x');
                        var width = parseInt(size[0], 10), height = parseInt(size[1], 10), background = this._brandColors[this.pick(this._brandNames())], foreground = '#FFF', text_height = 14, font = 'sans-serif';
                        canvas.width = width;
                        canvas.height = height;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = background;
                        ctx.fillRect(0, 0, width, height);
                        ctx.fillStyle = foreground;
                        ctx.font = 'bold ' + text_height + 'px ' + font;
                        ctx.fillText(text, width / 2, height / 2, width);
                        return canvas.toDataURL('image/png');
                    }
                };
            /* WEBPACK VAR INJECTION */ }).call(exports1, __nested_webpack_require_48894_48913__(9)(module1));
        /***/ },
        /* 9 */ /***/ function(module1, exports1) {
            module1.exports = function(module1) {
                if (!module1.webpackPolyfill) {
                    module1.deprecate = function() {};
                    module1.paths = [];
                    // module.parent = undefined by default
                    module1.children = [];
                    module1.webpackPolyfill = 1;
                }
                return module1;
            };
        /***/ },
        /* 10 */ /***/ function(module1, exports1, __nested_webpack_require_62789_62808__) {
            /*
	    ## Color

	    http://llllll.li/randomColor/
	        A color generator for JavaScript.
	        randomColor generates attractive colors by default. More specifically, randomColor produces bright colors with a reasonably high saturation. This makes randomColor particularly useful for data visualizations and generative art.

	    http://randomcolour.com/
	        var bg_colour = Math.floor(Math.random() * 16777215).toString(16);
	        bg_colour = "#" + ("000000" + bg_colour).slice(-6);
	        document.bgColor = bg_colour;
	    
	    http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
	        Creating random colors is actually more difficult than it seems. The randomness itself is easy, but aesthetically pleasing randomness is more difficult.
	        https://github.com/devongovett/color-generator

	    http://www.paulirish.com/2009/random-hex-color-code-snippets/
	        Random Hex Color Code Generator in JavaScript

	    http://chancejs.com/#color
	        chance.color()
	        // => '#79c157'
	        chance.color({format: 'hex'})
	        // => '#d67118'
	        chance.color({format: 'shorthex'})
	        // => '#60f'
	        chance.color({format: 'rgb'})
	        // => 'rgb(110,52,164)'

	    http://tool.c7sky.com/webcolor
	        网页设计常用色彩搭配表
	    
	    https://github.com/One-com/one-color
	        An OO-based JavaScript color parser/computation toolkit with support for RGB, HSV, HSL, CMYK, and alpha channels.
	        API 很赞

	    https://github.com/harthur/color
	        JavaScript color conversion and manipulation library

	    https://github.com/leaverou/css-colors
	        Share & convert CSS colors
	    http://leaverou.github.io/css-colors/#slategray
	        Type a CSS color keyword, #hex, hsl(), rgba(), whatever:

	    色调 hue
	        http://baike.baidu.com/view/23368.htm
	        色调指的是一幅画中画面色彩的总体倾向，是大的色彩效果。
	    饱和度 saturation
	        http://baike.baidu.com/view/189644.htm
	        饱和度是指色彩的鲜艳程度，也称色彩的纯度。饱和度取决于该色中含色成分和消色成分（灰色）的比例。含色成分越大，饱和度越大；消色成分越大，饱和度越小。
	    亮度 brightness
	        http://baike.baidu.com/view/34773.htm
	        亮度是指发光体（反光体）表面发光（反光）强弱的物理量。
	    照度 luminosity
	        物体被照亮的程度,采用单位面积所接受的光通量来表示,表示单位为勒[克斯](Lux,lx) ,即 1m / m2 。

	    http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
	        var letters = '0123456789ABCDEF'.split('')
	        var color = '#'
	        for (var i = 0; i < 6; i++) {
	            color += letters[Math.floor(Math.random() * 16)]
	        }
	        return color
	    
	        // 随机生成一个无脑的颜色，格式为 '#RRGGBB'。
	        // _brainlessColor()
	        var color = Math.floor(
	            Math.random() *
	            (16 * 16 * 16 * 16 * 16 * 16 - 1)
	        ).toString(16)
	        color = "#" + ("000000" + color).slice(-6)
	        return color.toUpperCase()
	*/ var Convert = __nested_webpack_require_62789_62808__(11);
            var DICT = __nested_webpack_require_62789_62808__(12);
            module1.exports = {
                // 随机生成一个有吸引力的颜色，格式为 '#RRGGBB'。
                color: function(name) {
                    if (name || DICT[name]) return DICT[name].nicer;
                    return this.hex();
                },
                // #DAC0DE
                hex: function() {
                    var hsv = this._goldenRatioColor();
                    var rgb = Convert.hsv2rgb(hsv);
                    var hex = Convert.rgb2hex(rgb[0], rgb[1], rgb[2]);
                    return hex;
                },
                // rgb(128,255,255)
                rgb: function() {
                    var hsv = this._goldenRatioColor();
                    var rgb = Convert.hsv2rgb(hsv);
                    return 'rgb(' + parseInt(rgb[0], 10) + ', ' + parseInt(rgb[1], 10) + ', ' + parseInt(rgb[2], 10) + ')';
                },
                // rgba(128,255,255,0.3)
                rgba: function() {
                    var hsv = this._goldenRatioColor();
                    var rgb = Convert.hsv2rgb(hsv);
                    return 'rgba(' + parseInt(rgb[0], 10) + ', ' + parseInt(rgb[1], 10) + ', ' + parseInt(rgb[2], 10) + ', ' + Math.random().toFixed(2) + ')';
                },
                // hsl(300,80%,90%)
                hsl: function() {
                    var hsv = this._goldenRatioColor();
                    var hsl = Convert.hsv2hsl(hsv);
                    return 'hsl(' + parseInt(hsl[0], 10) + ', ' + parseInt(hsl[1], 10) + ', ' + parseInt(hsl[2], 10) + ')';
                },
                // http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
                // https://github.com/devongovett/color-generator/blob/master/index.js
                // 随机生成一个有吸引力的颜色。
                _goldenRatioColor: function(saturation, value) {
                    this._goldenRatio = 0.618033988749895;
                    this._hue = this._hue || Math.random();
                    this._hue += this._goldenRatio;
                    this._hue %= 1;
                    if (typeof saturation !== "number") saturation = 0.5;
                    if (typeof value !== "number") value = 0.95;
                    return [
                        this._hue * 360,
                        saturation * 100,
                        value * 100
                    ];
                }
            };
        /***/ },
        /* 11 */ /***/ function(module1, exports1) {
            /*
	    ## Color Convert

	    http://blog.csdn.net/idfaya/article/details/6770414
	        颜色空间RGB与HSV(HSL)的转换
	*/ // https://github.com/harthur/color-convert/blob/master/conversions.js
            module1.exports = {
                rgb2hsl: function rgb2hsl(rgb) {
                    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s, l;
                    if (max == min) h = 0;
                    else if (r == max) h = (g - b) / delta;
                    else if (g == max) h = 2 + (b - r) / delta;
                    else if (b == max) h = 4 + (r - g) / delta;
                    h = Math.min(h * 60, 360);
                    if (h < 0) h += 360;
                    l = (min + max) / 2;
                    if (max == min) s = 0;
                    else if (l <= 0.5) s = delta / (max + min);
                    else s = delta / (2 - max - min);
                    return [
                        h,
                        s * 100,
                        l * 100
                    ];
                },
                rgb2hsv: function rgb2hsv(rgb) {
                    var r = rgb[0], g = rgb[1], b = rgb[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s, v;
                    if (max === 0) s = 0;
                    else s = delta / max * 1000 / 10;
                    if (max == min) h = 0;
                    else if (r == max) h = (g - b) / delta;
                    else if (g == max) h = 2 + (b - r) / delta;
                    else if (b == max) h = 4 + (r - g) / delta;
                    h = Math.min(h * 60, 360);
                    if (h < 0) h += 360;
                    v = max / 255 * 1000 / 10;
                    return [
                        h,
                        s,
                        v
                    ];
                },
                hsl2rgb: function hsl2rgb(hsl) {
                    var h = hsl[0] / 360, s = hsl[1] / 100, l = hsl[2] / 100, t1, t2, t3, rgb, val;
                    if (s === 0) {
                        val = l * 255;
                        return [
                            val,
                            val,
                            val
                        ];
                    }
                    if (l < 0.5) t2 = l * (1 + s);
                    else t2 = l + s - l * s;
                    t1 = 2 * l - t2;
                    rgb = [
                        0,
                        0,
                        0
                    ];
                    for(var i = 0; i < 3; i++){
                        t3 = h + 1 / 3 * -(i - 1);
                        if (t3 < 0) t3++;
                        if (t3 > 1) t3--;
                        if (6 * t3 < 1) val = t1 + (t2 - t1) * 6 * t3;
                        else if (2 * t3 < 1) val = t2;
                        else if (3 * t3 < 2) val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                        else val = t1;
                        rgb[i] = val * 255;
                    }
                    return rgb;
                },
                hsl2hsv: function hsl2hsv(hsl) {
                    var h = hsl[0], s = hsl[1] / 100, l = hsl[2] / 100, sv, v;
                    l *= 2;
                    s *= l <= 1 ? l : 2 - l;
                    v = (l + s) / 2;
                    sv = 2 * s / (l + s);
                    return [
                        h,
                        sv * 100,
                        v * 100
                    ];
                },
                hsv2rgb: function hsv2rgb(hsv) {
                    var h = hsv[0] / 60;
                    var s = hsv[1] / 100;
                    var v = hsv[2] / 100;
                    var hi = Math.floor(h) % 6;
                    var f = h - Math.floor(h);
                    var p = 255 * v * (1 - s);
                    var q = 255 * v * (1 - s * f);
                    var t = 255 * v * (1 - s * (1 - f));
                    v = 255 * v;
                    switch(hi){
                        case 0:
                            return [
                                v,
                                t,
                                p
                            ];
                        case 1:
                            return [
                                q,
                                v,
                                p
                            ];
                        case 2:
                            return [
                                p,
                                v,
                                t
                            ];
                        case 3:
                            return [
                                p,
                                q,
                                v
                            ];
                        case 4:
                            return [
                                t,
                                p,
                                v
                            ];
                        case 5:
                            return [
                                v,
                                p,
                                q
                            ];
                    }
                },
                hsv2hsl: function hsv2hsl(hsv) {
                    var h = hsv[0], s = hsv[1] / 100, v = hsv[2] / 100, sl, l;
                    l = (2 - s) * v;
                    sl = s * v;
                    sl /= l <= 1 ? l : 2 - l;
                    l /= 2;
                    return [
                        h,
                        sl * 100,
                        l * 100
                    ];
                },
                // http://www.140byt.es/keywords/color
                rgb2hex: function(a, b, c // blue, as a number from 0 to 255
                ) {
                    return "#" + ((256 + a << 8 | b) << 8 | c).toString(16).slice(1);
                },
                hex2rgb: function(a // take a "#xxxxxx" hex string,
                ) {
                    a = '0x' + a.slice(1).replace(a.length > 4 ? a : /./g, '$&$&') | 0;
                    return [
                        a >> 16,
                        a >> 8 & 255,
                        a & 255
                    ];
                }
            };
        /***/ },
        /* 12 */ /***/ function(module1, exports1) {
            /*
	    ## Color 字典数据

	    字典数据来源 [A nicer color palette for the web](http://clrs.cc/)
	*/ module1.exports = {
                // name value nicer
                navy: {
                    value: '#000080',
                    nicer: '#001F3F'
                },
                blue: {
                    value: '#0000ff',
                    nicer: '#0074D9'
                },
                aqua: {
                    value: '#00ffff',
                    nicer: '#7FDBFF'
                },
                teal: {
                    value: '#008080',
                    nicer: '#39CCCC'
                },
                olive: {
                    value: '#008000',
                    nicer: '#3D9970'
                },
                green: {
                    value: '#008000',
                    nicer: '#2ECC40'
                },
                lime: {
                    value: '#00ff00',
                    nicer: '#01FF70'
                },
                yellow: {
                    value: '#ffff00',
                    nicer: '#FFDC00'
                },
                orange: {
                    value: '#ffa500',
                    nicer: '#FF851B'
                },
                red: {
                    value: '#ff0000',
                    nicer: '#FF4136'
                },
                maroon: {
                    value: '#800000',
                    nicer: '#85144B'
                },
                fuchsia: {
                    value: '#ff00ff',
                    nicer: '#F012BE'
                },
                purple: {
                    value: '#800080',
                    nicer: '#B10DC9'
                },
                silver: {
                    value: '#c0c0c0',
                    nicer: '#DDDDDD'
                },
                gray: {
                    value: '#808080',
                    nicer: '#AAAAAA'
                },
                black: {
                    value: '#000000',
                    nicer: '#111111'
                },
                white: {
                    value: '#FFFFFF',
                    nicer: '#FFFFFF'
                }
            };
        /***/ },
        /* 13 */ /***/ function(module1, exports1, __nested_webpack_require_77422_77441__) {
            /*
	    ## Text

	    http://www.lipsum.com/
	*/ var Basic = __nested_webpack_require_77422_77441__(6);
            var Helper = __nested_webpack_require_77422_77441__(14);
            function range(defaultMin, defaultMax, min, max) {
                return min === undefined ? Basic.natural(defaultMin, defaultMax) : max === undefined ? min : Basic.natural(parseInt(min, 10), parseInt(max, 10)) // ( min, max )
                ;
            }
            module1.exports = {
                // 随机生成一段文本。
                paragraph: function(min, max) {
                    var len = range(3, 7, min, max);
                    var result = [];
                    for(var i = 0; i < len; i++){
                        result.push(this.sentence());
                    }
                    return result.join(' ');
                },
                // 
                cparagraph: function(min, max) {
                    var len = range(3, 7, min, max);
                    var result = [];
                    for(var i = 0; i < len; i++){
                        result.push(this.csentence());
                    }
                    return result.join('');
                },
                // 随机生成一个句子，第一个单词的首字母大写。
                sentence: function(min, max) {
                    var len = range(12, 18, min, max);
                    var result = [];
                    for(var i = 0; i < len; i++){
                        result.push(this.word());
                    }
                    return Helper.capitalize(result.join(' ')) + '.';
                },
                // 随机生成一个中文句子。
                csentence: function(min, max) {
                    var len = range(12, 18, min, max);
                    var result = [];
                    for(var i = 0; i < len; i++){
                        result.push(this.cword());
                    }
                    return result.join('') + '。';
                },
                // 随机生成一个单词。
                word: function(min, max) {
                    var len = range(3, 10, min, max);
                    var result = '';
                    for(var i = 0; i < len; i++){
                        result += Basic.character('lower');
                    }
                    return result;
                },
                // 随机生成一个或多个汉字。
                cword: function(pool, min, max) {
                    // 最常用的 500 个汉字 http://baike.baidu.com/view/568436.htm
                    var DICT_KANZI = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞';
                    var len;
                    switch(arguments.length){
                        case 0:
                            pool = DICT_KANZI;
                            len = 1;
                            break;
                        case 1:
                            if (typeof arguments[0] === 'string') {
                                len = 1;
                            } else {
                                // ( length )
                                len = pool;
                                pool = DICT_KANZI;
                            }
                            break;
                        case 2:
                            // ( pool, length )
                            if (typeof arguments[0] === 'string') {
                                len = min;
                            } else {
                                // ( min, max )
                                len = this.natural(pool, min);
                                pool = DICT_KANZI;
                            }
                            break;
                        case 3:
                            len = this.natural(min, max);
                            break;
                    }
                    var result = '';
                    for(var i = 0; i < len; i++){
                        result += pool.charAt(this.natural(0, pool.length - 1));
                    }
                    return result;
                },
                // 随机生成一句标题，其中每个单词的首字母大写。
                title: function(min, max) {
                    var len = range(3, 7, min, max);
                    var result = [];
                    for(var i = 0; i < len; i++){
                        result.push(this.capitalize(this.word()));
                    }
                    return result.join(' ');
                },
                // 随机生成一句中文标题。
                ctitle: function(min, max) {
                    var len = range(3, 7, min, max);
                    var result = [];
                    for(var i = 0; i < len; i++){
                        result.push(this.cword());
                    }
                    return result.join('');
                }
            };
        /***/ },
        /* 14 */ /***/ function(module1, exports1, __nested_webpack_require_83878_83897__) {
            /*
	    ## Helpers
	*/ var Util = __nested_webpack_require_83878_83897__(3);
            module1.exports = {
                // 把字符串的第一个字母转换为大写。
                capitalize: function(word) {
                    return (word + '').charAt(0).toUpperCase() + (word + '').substr(1);
                },
                // 把字符串转换为大写。
                upper: function(str) {
                    return (str + '').toUpperCase();
                },
                // 把字符串转换为小写。
                lower: function(str) {
                    return (str + '').toLowerCase();
                },
                // 从数组中随机选取一个元素，并返回。
                pick: function pick(arr, min, max) {
                    // pick( item1, item2 ... )
                    if (!Util.isArray(arr)) {
                        arr = [].slice.call(arguments);
                        min = 1;
                        max = 1;
                    } else {
                        // pick( [ item1, item2 ... ] )
                        if (min === undefined) min = 1;
                        // pick( [ item1, item2 ... ], count )
                        if (max === undefined) max = min;
                    }
                    if (min === 1 && max === 1) return arr[this.natural(0, arr.length - 1)];
                    // pick( [ item1, item2 ... ], min, max )
                    return this.shuffle(arr, min, max);
                // 通过参数个数判断方法签名，扩展性太差！#90
                // switch (arguments.length) {
                // 	case 1:
                // 		// pick( [ item1, item2 ... ] )
                // 		return arr[this.natural(0, arr.length - 1)]
                // 	case 2:
                // 		// pick( [ item1, item2 ... ], count )
                // 		max = min
                // 			/* falls through */
                // 	case 3:
                // 		// pick( [ item1, item2 ... ], min, max )
                // 		return this.shuffle(arr, min, max)
                // }
                },
                /*
		    打乱数组中元素的顺序，并返回。
		    Given an array, scramble the order and return it.

		    其他的实现思路：
		        // https://code.google.com/p/jslibs/wiki/JavascriptTips
		        result = result.sort(function() {
		            return Math.random() - 0.5
		        })
		*/ shuffle: function shuffle(arr, min, max) {
                    arr = arr || [];
                    var old = arr.slice(0), result = [], index = 0, length = old.length;
                    for(var i = 0; i < length; i++){
                        index = this.natural(0, old.length - 1);
                        result.push(old[index]);
                        old.splice(index, 1);
                    }
                    switch(arguments.length){
                        case 0:
                        case 1:
                            return result;
                        case 2:
                            max = min;
                        /* falls through */ case 3:
                            min = parseInt(min, 10);
                            max = parseInt(max, 10);
                            return result.slice(0, this.natural(min, max));
                    }
                },
                /*
		    * Random.order(item, item)
		    * Random.order([item, item ...])

		    顺序获取数组中的元素

		    [JSON导入数组支持数组数据录入](https://github.com/thx/RAP/issues/22)

		    不支持单独调用！
		*/ order: function order(array) {
                    order.cache = order.cache || {};
                    if (arguments.length > 1) array = [].slice.call(arguments, 0);
                    // options.context.path/templatePath
                    var options = order.options;
                    var templatePath = options.context.templatePath.join('.');
                    var cache = order.cache[templatePath] = order.cache[templatePath] || {
                        index: 0,
                        array: array
                    };
                    return cache.array[cache.index++ % cache.array.length];
                }
            };
        /***/ },
        /* 15 */ /***/ function(module1, exports1) {
            /*
	    ## Name

	    [Beyond the Top 1000 Names](http://www.ssa.gov/oact/babynames/limits.html)
	*/ module1.exports = {
                // 随机生成一个常见的英文名。
                first: function() {
                    var names = [
                        // male
                        "James",
                        "John",
                        "Robert",
                        "Michael",
                        "William",
                        "David",
                        "Richard",
                        "Charles",
                        "Joseph",
                        "Thomas",
                        "Christopher",
                        "Daniel",
                        "Paul",
                        "Mark",
                        "Donald",
                        "George",
                        "Kenneth",
                        "Steven",
                        "Edward",
                        "Brian",
                        "Ronald",
                        "Anthony",
                        "Kevin",
                        "Jason",
                        "Matthew",
                        "Gary",
                        "Timothy",
                        "Jose",
                        "Larry",
                        "Jeffrey",
                        "Frank",
                        "Scott",
                        "Eric"
                    ].concat([
                        // female
                        "Mary",
                        "Patricia",
                        "Linda",
                        "Barbara",
                        "Elizabeth",
                        "Jennifer",
                        "Maria",
                        "Susan",
                        "Margaret",
                        "Dorothy",
                        "Lisa",
                        "Nancy",
                        "Karen",
                        "Betty",
                        "Helen",
                        "Sandra",
                        "Donna",
                        "Carol",
                        "Ruth",
                        "Sharon",
                        "Michelle",
                        "Laura",
                        "Sarah",
                        "Kimberly",
                        "Deborah",
                        "Jessica",
                        "Shirley",
                        "Cynthia",
                        "Angela",
                        "Melissa",
                        "Brenda",
                        "Amy",
                        "Anna"
                    ]);
                    return this.pick(names);
                // or this.capitalize(this.word())
                },
                // 随机生成一个常见的英文姓。
                last: function() {
                    var names = [
                        "Smith",
                        "Johnson",
                        "Williams",
                        "Brown",
                        "Jones",
                        "Miller",
                        "Davis",
                        "Garcia",
                        "Rodriguez",
                        "Wilson",
                        "Martinez",
                        "Anderson",
                        "Taylor",
                        "Thomas",
                        "Hernandez",
                        "Moore",
                        "Martin",
                        "Jackson",
                        "Thompson",
                        "White",
                        "Lopez",
                        "Lee",
                        "Gonzalez",
                        "Harris",
                        "Clark",
                        "Lewis",
                        "Robinson",
                        "Walker",
                        "Perez",
                        "Hall",
                        "Young",
                        "Allen"
                    ];
                    return this.pick(names);
                // or this.capitalize(this.word())
                },
                // 随机生成一个常见的英文姓名。
                name: function(middle) {
                    return this.first() + ' ' + (middle ? this.first() + ' ' : '') + this.last();
                },
                /*
		    随机生成一个常见的中文姓。
		    [世界常用姓氏排行](http://baike.baidu.com/view/1719115.htm)
		    [玄派网 - 网络小说创作辅助平台](http://xuanpai.sinaapp.com/)
		 */ cfirst: function() {
                    var names = ('王 李 张 刘 陈 杨 赵 黄 周 吴 ' + '徐 孙 胡 朱 高 林 何 郭 马 罗 ' + '梁 宋 郑 谢 韩 唐 冯 于 董 萧 ' + '程 曹 袁 邓 许 傅 沈 曾 彭 吕 ' + '苏 卢 蒋 蔡 贾 丁 魏 薛 叶 阎 ' + '余 潘 杜 戴 夏 锺 汪 田 任 姜 ' + '范 方 石 姚 谭 廖 邹 熊 金 陆 ' + '郝 孔 白 崔 康 毛 邱 秦 江 史 ' + '顾 侯 邵 孟 龙 万 段 雷 钱 汤 ' + '尹 黎 易 常 武 乔 贺 赖 龚 文').split(' ');
                    return this.pick(names);
                },
                /*
		    随机生成一个常见的中文名。
		    [中国最常见名字前50名_三九算命网](http://www.name999.net/xingming/xingshi/20131004/48.html)
		 */ clast: function() {
                    var names = ('伟 芳 娜 秀英 敏 静 丽 强 磊 军 ' + '洋 勇 艳 杰 娟 涛 明 超 秀兰 霞 ' + '平 刚 桂英').split(' ');
                    return this.pick(names);
                },
                // 随机生成一个常见的中文姓名。
                cname: function() {
                    return this.cfirst() + this.clast();
                }
            };
        /***/ },
        /* 16 */ /***/ function(module1, exports1) {
            /*
	    ## Web
	*/ module1.exports = {
                /*
	        随机生成一个 URL。

	        [URL 规范](http://www.w3.org/Addressing/URL/url-spec.txt)
	            http                    Hypertext Transfer Protocol 
	            ftp                     File Transfer protocol 
	            gopher                  The Gopher protocol 
	            mailto                  Electronic mail address 
	            mid                     Message identifiers for electronic mail 
	            cid                     Content identifiers for MIME body part 
	            news                    Usenet news 
	            nntp                    Usenet news for local NNTP access only 
	            prospero                Access using the prospero protocols 
	            telnet rlogin tn3270    Reference to interactive sessions
	            wais                    Wide Area Information Servers 
	    */ url: function(protocol, host) {
                    return (protocol || this.protocol()) + '://' + // protocol?
                    (host || this.domain()) + // host?
                    '/' + this.word();
                },
                // 随机生成一个 URL 协议。
                protocol: function() {
                    return this.pick(// 协议簇
                    'http ftp gopher mailto mid cid news nntp prospero telnet rlogin tn3270 wais'.split(' '));
                },
                // 随机生成一个域名。
                domain: function(tld) {
                    return this.word() + '.' + (tld || this.tld());
                },
                /*
	        随机生成一个顶级域名。
	        国际顶级域名 international top-level domain-names, iTLDs
	        国家顶级域名 national top-level domainnames, nTLDs
	        [域名后缀大全](http://www.163ns.com/zixun/post/4417.html)
	    */ tld: function() {
                    return this.pick(// 域名后缀
                    ('com net org edu gov int mil cn ' + // 国内域名
                    'com.cn net.cn gov.cn org.cn ' + // 中文国内域名
                    '中国 中国互联.公司 中国互联.网络 ' + // 新国际域名
                    'tel biz cc tv info name hk mobi asia cd travel pro museum coop aero ' + // 世界各国域名后缀
                    'ad ae af ag ai al am an ao aq ar as at au aw az ba bb bd be bf bg bh bi bj bm bn bo br bs bt bv bw by bz ca cc cf cg ch ci ck cl cm cn co cq cr cu cv cx cy cz de dj dk dm do dz ec ee eg eh es et ev fi fj fk fm fo fr ga gb gd ge gf gh gi gl gm gn gp gr gt gu gw gy hk hm hn hr ht hu id ie il in io iq ir is it jm jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md mg mh ml mm mn mo mp mq mr ms mt mv mw mx my mz na nc ne nf ng ni nl no np nr nt nu nz om qa pa pe pf pg ph pk pl pm pn pr pt pw py re ro ru rw sa sb sc sd se sg sh si sj sk sl sm sn so sr st su sy sz tc td tf tg th tj tk tm tn to tp tr tt tv tw tz ua ug uk us uy va vc ve vg vn vu wf ws ye yu za zm zr zw').split(' '));
                },
                // 随机生成一个邮件地址。
                email: function(domain) {
                    return this.character('lower') + '.' + this.word() + '@' + (domain || this.word() + '.' + this.tld());
                // return this.character('lower') + '.' + this.last().toLowerCase() + '@' + this.last().toLowerCase() + '.' + this.tld()
                // return this.word() + '@' + (domain || this.domain())
                },
                // 随机生成一个 IP 地址。
                ip: function() {
                    return this.natural(0, 255) + '.' + this.natural(0, 255) + '.' + this.natural(0, 255) + '.' + this.natural(0, 255);
                }
            };
        /***/ },
        /* 17 */ /***/ function(module1, exports1, __nested_webpack_require_97825_97844__) {
            /*
	    ## Address
	*/ var DICT = __nested_webpack_require_97825_97844__(18);
            var REGION = [
                '东北',
                '华北',
                '华东',
                '华中',
                '华南',
                '西南',
                '西北'
            ];
            module1.exports = {
                // 随机生成一个大区。
                region: function() {
                    return this.pick(REGION);
                },
                // 随机生成一个（中国）省（或直辖市、自治区、特别行政区）。
                province: function() {
                    return this.pick(DICT).name;
                },
                // 随机生成一个（中国）市。
                city: function(prefix) {
                    var province = this.pick(DICT);
                    var city = this.pick(province.children);
                    return prefix ? [
                        province.name,
                        city.name
                    ].join(' ') : city.name;
                },
                // 随机生成一个（中国）县。
                county: function(prefix) {
                    var province = this.pick(DICT);
                    var city = this.pick(province.children);
                    var county = this.pick(city.children) || {
                        name: '-'
                    };
                    return prefix ? [
                        province.name,
                        city.name,
                        county.name
                    ].join(' ') : county.name;
                },
                // 随机生成一个邮政编码（六位数字）。
                zip: function(len) {
                    var zip = '';
                    for(var i = 0; i < (len || 6); i++)zip += this.natural(0, 9);
                    return zip;
                }
            };
        /***/ },
        /* 18 */ /***/ function(module1, exports1) {
            /*
	    ## Address 字典数据

	    字典数据来源 http://www.atatech.org/articles/30028?rnd=254259856

	    国标 省（市）级行政区划码表

	    华北   北京市 天津市 河北省 山西省 内蒙古自治区
	    东北   辽宁省 吉林省 黑龙江省
	    华东   上海市 江苏省 浙江省 安徽省 福建省 江西省 山东省
	    华南   广东省 广西壮族自治区 海南省
	    华中   河南省 湖北省 湖南省
	    西南   重庆市 四川省 贵州省 云南省 西藏自治区
	    西北   陕西省 甘肃省 青海省 宁夏回族自治区 新疆维吾尔自治区
	    港澳台 香港特别行政区 澳门特别行政区 台湾省
	    
	    **排序**
	    
	    ```js
	    var map = {}
	    _.each(_.keys(REGIONS),function(id){
	      map[id] = REGIONS[ID]
	    })
	    JSON.stringify(map)
	    ```
	*/ var DICT = {
                "110000": "北京",
                "110100": "北京市",
                "110101": "东城区",
                "110102": "西城区",
                "110105": "朝阳区",
                "110106": "丰台区",
                "110107": "石景山区",
                "110108": "海淀区",
                "110109": "门头沟区",
                "110111": "房山区",
                "110112": "通州区",
                "110113": "顺义区",
                "110114": "昌平区",
                "110115": "大兴区",
                "110116": "怀柔区",
                "110117": "平谷区",
                "110228": "密云县",
                "110229": "延庆县",
                "110230": "其它区",
                "120000": "天津",
                "120100": "天津市",
                "120101": "和平区",
                "120102": "河东区",
                "120103": "河西区",
                "120104": "南开区",
                "120105": "河北区",
                "120106": "红桥区",
                "120110": "东丽区",
                "120111": "西青区",
                "120112": "津南区",
                "120113": "北辰区",
                "120114": "武清区",
                "120115": "宝坻区",
                "120116": "滨海新区",
                "120221": "宁河县",
                "120223": "静海县",
                "120225": "蓟县",
                "120226": "其它区",
                "130000": "河北省",
                "130100": "石家庄市",
                "130102": "长安区",
                "130103": "桥东区",
                "130104": "桥西区",
                "130105": "新华区",
                "130107": "井陉矿区",
                "130108": "裕华区",
                "130121": "井陉县",
                "130123": "正定县",
                "130124": "栾城县",
                "130125": "行唐县",
                "130126": "灵寿县",
                "130127": "高邑县",
                "130128": "深泽县",
                "130129": "赞皇县",
                "130130": "无极县",
                "130131": "平山县",
                "130132": "元氏县",
                "130133": "赵县",
                "130181": "辛集市",
                "130182": "藁城市",
                "130183": "晋州市",
                "130184": "新乐市",
                "130185": "鹿泉市",
                "130186": "其它区",
                "130200": "唐山市",
                "130202": "路南区",
                "130203": "路北区",
                "130204": "古冶区",
                "130205": "开平区",
                "130207": "丰南区",
                "130208": "丰润区",
                "130223": "滦县",
                "130224": "滦南县",
                "130225": "乐亭县",
                "130227": "迁西县",
                "130229": "玉田县",
                "130230": "曹妃甸区",
                "130281": "遵化市",
                "130283": "迁安市",
                "130284": "其它区",
                "130300": "秦皇岛市",
                "130302": "海港区",
                "130303": "山海关区",
                "130304": "北戴河区",
                "130321": "青龙满族自治县",
                "130322": "昌黎县",
                "130323": "抚宁县",
                "130324": "卢龙县",
                "130398": "其它区",
                "130400": "邯郸市",
                "130402": "邯山区",
                "130403": "丛台区",
                "130404": "复兴区",
                "130406": "峰峰矿区",
                "130421": "邯郸县",
                "130423": "临漳县",
                "130424": "成安县",
                "130425": "大名县",
                "130426": "涉县",
                "130427": "磁县",
                "130428": "肥乡县",
                "130429": "永年县",
                "130430": "邱县",
                "130431": "鸡泽县",
                "130432": "广平县",
                "130433": "馆陶县",
                "130434": "魏县",
                "130435": "曲周县",
                "130481": "武安市",
                "130482": "其它区",
                "130500": "邢台市",
                "130502": "桥东区",
                "130503": "桥西区",
                "130521": "邢台县",
                "130522": "临城县",
                "130523": "内丘县",
                "130524": "柏乡县",
                "130525": "隆尧县",
                "130526": "任县",
                "130527": "南和县",
                "130528": "宁晋县",
                "130529": "巨鹿县",
                "130530": "新河县",
                "130531": "广宗县",
                "130532": "平乡县",
                "130533": "威县",
                "130534": "清河县",
                "130535": "临西县",
                "130581": "南宫市",
                "130582": "沙河市",
                "130583": "其它区",
                "130600": "保定市",
                "130602": "新市区",
                "130603": "北市区",
                "130604": "南市区",
                "130621": "满城县",
                "130622": "清苑县",
                "130623": "涞水县",
                "130624": "阜平县",
                "130625": "徐水县",
                "130626": "定兴县",
                "130627": "唐县",
                "130628": "高阳县",
                "130629": "容城县",
                "130630": "涞源县",
                "130631": "望都县",
                "130632": "安新县",
                "130633": "易县",
                "130634": "曲阳县",
                "130635": "蠡县",
                "130636": "顺平县",
                "130637": "博野县",
                "130638": "雄县",
                "130681": "涿州市",
                "130682": "定州市",
                "130683": "安国市",
                "130684": "高碑店市",
                "130699": "其它区",
                "130700": "张家口市",
                "130702": "桥东区",
                "130703": "桥西区",
                "130705": "宣化区",
                "130706": "下花园区",
                "130721": "宣化县",
                "130722": "张北县",
                "130723": "康保县",
                "130724": "沽源县",
                "130725": "尚义县",
                "130726": "蔚县",
                "130727": "阳原县",
                "130728": "怀安县",
                "130729": "万全县",
                "130730": "怀来县",
                "130731": "涿鹿县",
                "130732": "赤城县",
                "130733": "崇礼县",
                "130734": "其它区",
                "130800": "承德市",
                "130802": "双桥区",
                "130803": "双滦区",
                "130804": "鹰手营子矿区",
                "130821": "承德县",
                "130822": "兴隆县",
                "130823": "平泉县",
                "130824": "滦平县",
                "130825": "隆化县",
                "130826": "丰宁满族自治县",
                "130827": "宽城满族自治县",
                "130828": "围场满族蒙古族自治县",
                "130829": "其它区",
                "130900": "沧州市",
                "130902": "新华区",
                "130903": "运河区",
                "130921": "沧县",
                "130922": "青县",
                "130923": "东光县",
                "130924": "海兴县",
                "130925": "盐山县",
                "130926": "肃宁县",
                "130927": "南皮县",
                "130928": "吴桥县",
                "130929": "献县",
                "130930": "孟村回族自治县",
                "130981": "泊头市",
                "130982": "任丘市",
                "130983": "黄骅市",
                "130984": "河间市",
                "130985": "其它区",
                "131000": "廊坊市",
                "131002": "安次区",
                "131003": "广阳区",
                "131022": "固安县",
                "131023": "永清县",
                "131024": "香河县",
                "131025": "大城县",
                "131026": "文安县",
                "131028": "大厂回族自治县",
                "131081": "霸州市",
                "131082": "三河市",
                "131083": "其它区",
                "131100": "衡水市",
                "131102": "桃城区",
                "131121": "枣强县",
                "131122": "武邑县",
                "131123": "武强县",
                "131124": "饶阳县",
                "131125": "安平县",
                "131126": "故城县",
                "131127": "景县",
                "131128": "阜城县",
                "131181": "冀州市",
                "131182": "深州市",
                "131183": "其它区",
                "140000": "山西省",
                "140100": "太原市",
                "140105": "小店区",
                "140106": "迎泽区",
                "140107": "杏花岭区",
                "140108": "尖草坪区",
                "140109": "万柏林区",
                "140110": "晋源区",
                "140121": "清徐县",
                "140122": "阳曲县",
                "140123": "娄烦县",
                "140181": "古交市",
                "140182": "其它区",
                "140200": "大同市",
                "140202": "城区",
                "140203": "矿区",
                "140211": "南郊区",
                "140212": "新荣区",
                "140221": "阳高县",
                "140222": "天镇县",
                "140223": "广灵县",
                "140224": "灵丘县",
                "140225": "浑源县",
                "140226": "左云县",
                "140227": "大同县",
                "140228": "其它区",
                "140300": "阳泉市",
                "140302": "城区",
                "140303": "矿区",
                "140311": "郊区",
                "140321": "平定县",
                "140322": "盂县",
                "140323": "其它区",
                "140400": "长治市",
                "140421": "长治县",
                "140423": "襄垣县",
                "140424": "屯留县",
                "140425": "平顺县",
                "140426": "黎城县",
                "140427": "壶关县",
                "140428": "长子县",
                "140429": "武乡县",
                "140430": "沁县",
                "140431": "沁源县",
                "140481": "潞城市",
                "140482": "城区",
                "140483": "郊区",
                "140485": "其它区",
                "140500": "晋城市",
                "140502": "城区",
                "140521": "沁水县",
                "140522": "阳城县",
                "140524": "陵川县",
                "140525": "泽州县",
                "140581": "高平市",
                "140582": "其它区",
                "140600": "朔州市",
                "140602": "朔城区",
                "140603": "平鲁区",
                "140621": "山阴县",
                "140622": "应县",
                "140623": "右玉县",
                "140624": "怀仁县",
                "140625": "其它区",
                "140700": "晋中市",
                "140702": "榆次区",
                "140721": "榆社县",
                "140722": "左权县",
                "140723": "和顺县",
                "140724": "昔阳县",
                "140725": "寿阳县",
                "140726": "太谷县",
                "140727": "祁县",
                "140728": "平遥县",
                "140729": "灵石县",
                "140781": "介休市",
                "140782": "其它区",
                "140800": "运城市",
                "140802": "盐湖区",
                "140821": "临猗县",
                "140822": "万荣县",
                "140823": "闻喜县",
                "140824": "稷山县",
                "140825": "新绛县",
                "140826": "绛县",
                "140827": "垣曲县",
                "140828": "夏县",
                "140829": "平陆县",
                "140830": "芮城县",
                "140881": "永济市",
                "140882": "河津市",
                "140883": "其它区",
                "140900": "忻州市",
                "140902": "忻府区",
                "140921": "定襄县",
                "140922": "五台县",
                "140923": "代县",
                "140924": "繁峙县",
                "140925": "宁武县",
                "140926": "静乐县",
                "140927": "神池县",
                "140928": "五寨县",
                "140929": "岢岚县",
                "140930": "河曲县",
                "140931": "保德县",
                "140932": "偏关县",
                "140981": "原平市",
                "140982": "其它区",
                "141000": "临汾市",
                "141002": "尧都区",
                "141021": "曲沃县",
                "141022": "翼城县",
                "141023": "襄汾县",
                "141024": "洪洞县",
                "141025": "古县",
                "141026": "安泽县",
                "141027": "浮山县",
                "141028": "吉县",
                "141029": "乡宁县",
                "141030": "大宁县",
                "141031": "隰县",
                "141032": "永和县",
                "141033": "蒲县",
                "141034": "汾西县",
                "141081": "侯马市",
                "141082": "霍州市",
                "141083": "其它区",
                "141100": "吕梁市",
                "141102": "离石区",
                "141121": "文水县",
                "141122": "交城县",
                "141123": "兴县",
                "141124": "临县",
                "141125": "柳林县",
                "141126": "石楼县",
                "141127": "岚县",
                "141128": "方山县",
                "141129": "中阳县",
                "141130": "交口县",
                "141181": "孝义市",
                "141182": "汾阳市",
                "141183": "其它区",
                "150000": "内蒙古自治区",
                "150100": "呼和浩特市",
                "150102": "新城区",
                "150103": "回民区",
                "150104": "玉泉区",
                "150105": "赛罕区",
                "150121": "土默特左旗",
                "150122": "托克托县",
                "150123": "和林格尔县",
                "150124": "清水河县",
                "150125": "武川县",
                "150126": "其它区",
                "150200": "包头市",
                "150202": "东河区",
                "150203": "昆都仑区",
                "150204": "青山区",
                "150205": "石拐区",
                "150206": "白云鄂博矿区",
                "150207": "九原区",
                "150221": "土默特右旗",
                "150222": "固阳县",
                "150223": "达尔罕茂明安联合旗",
                "150224": "其它区",
                "150300": "乌海市",
                "150302": "海勃湾区",
                "150303": "海南区",
                "150304": "乌达区",
                "150305": "其它区",
                "150400": "赤峰市",
                "150402": "红山区",
                "150403": "元宝山区",
                "150404": "松山区",
                "150421": "阿鲁科尔沁旗",
                "150422": "巴林左旗",
                "150423": "巴林右旗",
                "150424": "林西县",
                "150425": "克什克腾旗",
                "150426": "翁牛特旗",
                "150428": "喀喇沁旗",
                "150429": "宁城县",
                "150430": "敖汉旗",
                "150431": "其它区",
                "150500": "通辽市",
                "150502": "科尔沁区",
                "150521": "科尔沁左翼中旗",
                "150522": "科尔沁左翼后旗",
                "150523": "开鲁县",
                "150524": "库伦旗",
                "150525": "奈曼旗",
                "150526": "扎鲁特旗",
                "150581": "霍林郭勒市",
                "150582": "其它区",
                "150600": "鄂尔多斯市",
                "150602": "东胜区",
                "150621": "达拉特旗",
                "150622": "准格尔旗",
                "150623": "鄂托克前旗",
                "150624": "鄂托克旗",
                "150625": "杭锦旗",
                "150626": "乌审旗",
                "150627": "伊金霍洛旗",
                "150628": "其它区",
                "150700": "呼伦贝尔市",
                "150702": "海拉尔区",
                "150703": "扎赉诺尔区",
                "150721": "阿荣旗",
                "150722": "莫力达瓦达斡尔族自治旗",
                "150723": "鄂伦春自治旗",
                "150724": "鄂温克族自治旗",
                "150725": "陈巴尔虎旗",
                "150726": "新巴尔虎左旗",
                "150727": "新巴尔虎右旗",
                "150781": "满洲里市",
                "150782": "牙克石市",
                "150783": "扎兰屯市",
                "150784": "额尔古纳市",
                "150785": "根河市",
                "150786": "其它区",
                "150800": "巴彦淖尔市",
                "150802": "临河区",
                "150821": "五原县",
                "150822": "磴口县",
                "150823": "乌拉特前旗",
                "150824": "乌拉特中旗",
                "150825": "乌拉特后旗",
                "150826": "杭锦后旗",
                "150827": "其它区",
                "150900": "乌兰察布市",
                "150902": "集宁区",
                "150921": "卓资县",
                "150922": "化德县",
                "150923": "商都县",
                "150924": "兴和县",
                "150925": "凉城县",
                "150926": "察哈尔右翼前旗",
                "150927": "察哈尔右翼中旗",
                "150928": "察哈尔右翼后旗",
                "150929": "四子王旗",
                "150981": "丰镇市",
                "150982": "其它区",
                "152200": "兴安盟",
                "152201": "乌兰浩特市",
                "152202": "阿尔山市",
                "152221": "科尔沁右翼前旗",
                "152222": "科尔沁右翼中旗",
                "152223": "扎赉特旗",
                "152224": "突泉县",
                "152225": "其它区",
                "152500": "锡林郭勒盟",
                "152501": "二连浩特市",
                "152502": "锡林浩特市",
                "152522": "阿巴嘎旗",
                "152523": "苏尼特左旗",
                "152524": "苏尼特右旗",
                "152525": "东乌珠穆沁旗",
                "152526": "西乌珠穆沁旗",
                "152527": "太仆寺旗",
                "152528": "镶黄旗",
                "152529": "正镶白旗",
                "152530": "正蓝旗",
                "152531": "多伦县",
                "152532": "其它区",
                "152900": "阿拉善盟",
                "152921": "阿拉善左旗",
                "152922": "阿拉善右旗",
                "152923": "额济纳旗",
                "152924": "其它区",
                "210000": "辽宁省",
                "210100": "沈阳市",
                "210102": "和平区",
                "210103": "沈河区",
                "210104": "大东区",
                "210105": "皇姑区",
                "210106": "铁西区",
                "210111": "苏家屯区",
                "210112": "东陵区",
                "210113": "新城子区",
                "210114": "于洪区",
                "210122": "辽中县",
                "210123": "康平县",
                "210124": "法库县",
                "210181": "新民市",
                "210184": "沈北新区",
                "210185": "其它区",
                "210200": "大连市",
                "210202": "中山区",
                "210203": "西岗区",
                "210204": "沙河口区",
                "210211": "甘井子区",
                "210212": "旅顺口区",
                "210213": "金州区",
                "210224": "长海县",
                "210281": "瓦房店市",
                "210282": "普兰店市",
                "210283": "庄河市",
                "210298": "其它区",
                "210300": "鞍山市",
                "210302": "铁东区",
                "210303": "铁西区",
                "210304": "立山区",
                "210311": "千山区",
                "210321": "台安县",
                "210323": "岫岩满族自治县",
                "210381": "海城市",
                "210382": "其它区",
                "210400": "抚顺市",
                "210402": "新抚区",
                "210403": "东洲区",
                "210404": "望花区",
                "210411": "顺城区",
                "210421": "抚顺县",
                "210422": "新宾满族自治县",
                "210423": "清原满族自治县",
                "210424": "其它区",
                "210500": "本溪市",
                "210502": "平山区",
                "210503": "溪湖区",
                "210504": "明山区",
                "210505": "南芬区",
                "210521": "本溪满族自治县",
                "210522": "桓仁满族自治县",
                "210523": "其它区",
                "210600": "丹东市",
                "210602": "元宝区",
                "210603": "振兴区",
                "210604": "振安区",
                "210624": "宽甸满族自治县",
                "210681": "东港市",
                "210682": "凤城市",
                "210683": "其它区",
                "210700": "锦州市",
                "210702": "古塔区",
                "210703": "凌河区",
                "210711": "太和区",
                "210726": "黑山县",
                "210727": "义县",
                "210781": "凌海市",
                "210782": "北镇市",
                "210783": "其它区",
                "210800": "营口市",
                "210802": "站前区",
                "210803": "西市区",
                "210804": "鲅鱼圈区",
                "210811": "老边区",
                "210881": "盖州市",
                "210882": "大石桥市",
                "210883": "其它区",
                "210900": "阜新市",
                "210902": "海州区",
                "210903": "新邱区",
                "210904": "太平区",
                "210905": "清河门区",
                "210911": "细河区",
                "210921": "阜新蒙古族自治县",
                "210922": "彰武县",
                "210923": "其它区",
                "211000": "辽阳市",
                "211002": "白塔区",
                "211003": "文圣区",
                "211004": "宏伟区",
                "211005": "弓长岭区",
                "211011": "太子河区",
                "211021": "辽阳县",
                "211081": "灯塔市",
                "211082": "其它区",
                "211100": "盘锦市",
                "211102": "双台子区",
                "211103": "兴隆台区",
                "211121": "大洼县",
                "211122": "盘山县",
                "211123": "其它区",
                "211200": "铁岭市",
                "211202": "银州区",
                "211204": "清河区",
                "211221": "铁岭县",
                "211223": "西丰县",
                "211224": "昌图县",
                "211281": "调兵山市",
                "211282": "开原市",
                "211283": "其它区",
                "211300": "朝阳市",
                "211302": "双塔区",
                "211303": "龙城区",
                "211321": "朝阳县",
                "211322": "建平县",
                "211324": "喀喇沁左翼蒙古族自治县",
                "211381": "北票市",
                "211382": "凌源市",
                "211383": "其它区",
                "211400": "葫芦岛市",
                "211402": "连山区",
                "211403": "龙港区",
                "211404": "南票区",
                "211421": "绥中县",
                "211422": "建昌县",
                "211481": "兴城市",
                "211482": "其它区",
                "220000": "吉林省",
                "220100": "长春市",
                "220102": "南关区",
                "220103": "宽城区",
                "220104": "朝阳区",
                "220105": "二道区",
                "220106": "绿园区",
                "220112": "双阳区",
                "220122": "农安县",
                "220181": "九台市",
                "220182": "榆树市",
                "220183": "德惠市",
                "220188": "其它区",
                "220200": "吉林市",
                "220202": "昌邑区",
                "220203": "龙潭区",
                "220204": "船营区",
                "220211": "丰满区",
                "220221": "永吉县",
                "220281": "蛟河市",
                "220282": "桦甸市",
                "220283": "舒兰市",
                "220284": "磐石市",
                "220285": "其它区",
                "220300": "四平市",
                "220302": "铁西区",
                "220303": "铁东区",
                "220322": "梨树县",
                "220323": "伊通满族自治县",
                "220381": "公主岭市",
                "220382": "双辽市",
                "220383": "其它区",
                "220400": "辽源市",
                "220402": "龙山区",
                "220403": "西安区",
                "220421": "东丰县",
                "220422": "东辽县",
                "220423": "其它区",
                "220500": "通化市",
                "220502": "东昌区",
                "220503": "二道江区",
                "220521": "通化县",
                "220523": "辉南县",
                "220524": "柳河县",
                "220581": "梅河口市",
                "220582": "集安市",
                "220583": "其它区",
                "220600": "白山市",
                "220602": "浑江区",
                "220621": "抚松县",
                "220622": "靖宇县",
                "220623": "长白朝鲜族自治县",
                "220625": "江源区",
                "220681": "临江市",
                "220682": "其它区",
                "220700": "松原市",
                "220702": "宁江区",
                "220721": "前郭尔罗斯蒙古族自治县",
                "220722": "长岭县",
                "220723": "乾安县",
                "220724": "扶余市",
                "220725": "其它区",
                "220800": "白城市",
                "220802": "洮北区",
                "220821": "镇赉县",
                "220822": "通榆县",
                "220881": "洮南市",
                "220882": "大安市",
                "220883": "其它区",
                "222400": "延边朝鲜族自治州",
                "222401": "延吉市",
                "222402": "图们市",
                "222403": "敦化市",
                "222404": "珲春市",
                "222405": "龙井市",
                "222406": "和龙市",
                "222424": "汪清县",
                "222426": "安图县",
                "222427": "其它区",
                "230000": "黑龙江省",
                "230100": "哈尔滨市",
                "230102": "道里区",
                "230103": "南岗区",
                "230104": "道外区",
                "230106": "香坊区",
                "230108": "平房区",
                "230109": "松北区",
                "230111": "呼兰区",
                "230123": "依兰县",
                "230124": "方正县",
                "230125": "宾县",
                "230126": "巴彦县",
                "230127": "木兰县",
                "230128": "通河县",
                "230129": "延寿县",
                "230181": "阿城区",
                "230182": "双城市",
                "230183": "尚志市",
                "230184": "五常市",
                "230186": "其它区",
                "230200": "齐齐哈尔市",
                "230202": "龙沙区",
                "230203": "建华区",
                "230204": "铁锋区",
                "230205": "昂昂溪区",
                "230206": "富拉尔基区",
                "230207": "碾子山区",
                "230208": "梅里斯达斡尔族区",
                "230221": "龙江县",
                "230223": "依安县",
                "230224": "泰来县",
                "230225": "甘南县",
                "230227": "富裕县",
                "230229": "克山县",
                "230230": "克东县",
                "230231": "拜泉县",
                "230281": "讷河市",
                "230282": "其它区",
                "230300": "鸡西市",
                "230302": "鸡冠区",
                "230303": "恒山区",
                "230304": "滴道区",
                "230305": "梨树区",
                "230306": "城子河区",
                "230307": "麻山区",
                "230321": "鸡东县",
                "230381": "虎林市",
                "230382": "密山市",
                "230383": "其它区",
                "230400": "鹤岗市",
                "230402": "向阳区",
                "230403": "工农区",
                "230404": "南山区",
                "230405": "兴安区",
                "230406": "东山区",
                "230407": "兴山区",
                "230421": "萝北县",
                "230422": "绥滨县",
                "230423": "其它区",
                "230500": "双鸭山市",
                "230502": "尖山区",
                "230503": "岭东区",
                "230505": "四方台区",
                "230506": "宝山区",
                "230521": "集贤县",
                "230522": "友谊县",
                "230523": "宝清县",
                "230524": "饶河县",
                "230525": "其它区",
                "230600": "大庆市",
                "230602": "萨尔图区",
                "230603": "龙凤区",
                "230604": "让胡路区",
                "230605": "红岗区",
                "230606": "大同区",
                "230621": "肇州县",
                "230622": "肇源县",
                "230623": "林甸县",
                "230624": "杜尔伯特蒙古族自治县",
                "230625": "其它区",
                "230700": "伊春市",
                "230702": "伊春区",
                "230703": "南岔区",
                "230704": "友好区",
                "230705": "西林区",
                "230706": "翠峦区",
                "230707": "新青区",
                "230708": "美溪区",
                "230709": "金山屯区",
                "230710": "五营区",
                "230711": "乌马河区",
                "230712": "汤旺河区",
                "230713": "带岭区",
                "230714": "乌伊岭区",
                "230715": "红星区",
                "230716": "上甘岭区",
                "230722": "嘉荫县",
                "230781": "铁力市",
                "230782": "其它区",
                "230800": "佳木斯市",
                "230803": "向阳区",
                "230804": "前进区",
                "230805": "东风区",
                "230811": "郊区",
                "230822": "桦南县",
                "230826": "桦川县",
                "230828": "汤原县",
                "230833": "抚远县",
                "230881": "同江市",
                "230882": "富锦市",
                "230883": "其它区",
                "230900": "七台河市",
                "230902": "新兴区",
                "230903": "桃山区",
                "230904": "茄子河区",
                "230921": "勃利县",
                "230922": "其它区",
                "231000": "牡丹江市",
                "231002": "东安区",
                "231003": "阳明区",
                "231004": "爱民区",
                "231005": "西安区",
                "231024": "东宁县",
                "231025": "林口县",
                "231081": "绥芬河市",
                "231083": "海林市",
                "231084": "宁安市",
                "231085": "穆棱市",
                "231086": "其它区",
                "231100": "黑河市",
                "231102": "爱辉区",
                "231121": "嫩江县",
                "231123": "逊克县",
                "231124": "孙吴县",
                "231181": "北安市",
                "231182": "五大连池市",
                "231183": "其它区",
                "231200": "绥化市",
                "231202": "北林区",
                "231221": "望奎县",
                "231222": "兰西县",
                "231223": "青冈县",
                "231224": "庆安县",
                "231225": "明水县",
                "231226": "绥棱县",
                "231281": "安达市",
                "231282": "肇东市",
                "231283": "海伦市",
                "231284": "其它区",
                "232700": "大兴安岭地区",
                "232702": "松岭区",
                "232703": "新林区",
                "232704": "呼中区",
                "232721": "呼玛县",
                "232722": "塔河县",
                "232723": "漠河县",
                "232724": "加格达奇区",
                "232725": "其它区",
                "310000": "上海",
                "310100": "上海市",
                "310101": "黄浦区",
                "310104": "徐汇区",
                "310105": "长宁区",
                "310106": "静安区",
                "310107": "普陀区",
                "310108": "闸北区",
                "310109": "虹口区",
                "310110": "杨浦区",
                "310112": "闵行区",
                "310113": "宝山区",
                "310114": "嘉定区",
                "310115": "浦东新区",
                "310116": "金山区",
                "310117": "松江区",
                "310118": "青浦区",
                "310120": "奉贤区",
                "310230": "崇明县",
                "310231": "其它区",
                "320000": "江苏省",
                "320100": "南京市",
                "320102": "玄武区",
                "320104": "秦淮区",
                "320105": "建邺区",
                "320106": "鼓楼区",
                "320111": "浦口区",
                "320113": "栖霞区",
                "320114": "雨花台区",
                "320115": "江宁区",
                "320116": "六合区",
                "320124": "溧水区",
                "320125": "高淳区",
                "320126": "其它区",
                "320200": "无锡市",
                "320202": "崇安区",
                "320203": "南长区",
                "320204": "北塘区",
                "320205": "锡山区",
                "320206": "惠山区",
                "320211": "滨湖区",
                "320281": "江阴市",
                "320282": "宜兴市",
                "320297": "其它区",
                "320300": "徐州市",
                "320302": "鼓楼区",
                "320303": "云龙区",
                "320305": "贾汪区",
                "320311": "泉山区",
                "320321": "丰县",
                "320322": "沛县",
                "320323": "铜山区",
                "320324": "睢宁县",
                "320381": "新沂市",
                "320382": "邳州市",
                "320383": "其它区",
                "320400": "常州市",
                "320402": "天宁区",
                "320404": "钟楼区",
                "320405": "戚墅堰区",
                "320411": "新北区",
                "320412": "武进区",
                "320481": "溧阳市",
                "320482": "金坛市",
                "320483": "其它区",
                "320500": "苏州市",
                "320505": "虎丘区",
                "320506": "吴中区",
                "320507": "相城区",
                "320508": "姑苏区",
                "320581": "常熟市",
                "320582": "张家港市",
                "320583": "昆山市",
                "320584": "吴江区",
                "320585": "太仓市",
                "320596": "其它区",
                "320600": "南通市",
                "320602": "崇川区",
                "320611": "港闸区",
                "320612": "通州区",
                "320621": "海安县",
                "320623": "如东县",
                "320681": "启东市",
                "320682": "如皋市",
                "320684": "海门市",
                "320694": "其它区",
                "320700": "连云港市",
                "320703": "连云区",
                "320705": "新浦区",
                "320706": "海州区",
                "320721": "赣榆县",
                "320722": "东海县",
                "320723": "灌云县",
                "320724": "灌南县",
                "320725": "其它区",
                "320800": "淮安市",
                "320802": "清河区",
                "320803": "淮安区",
                "320804": "淮阴区",
                "320811": "清浦区",
                "320826": "涟水县",
                "320829": "洪泽县",
                "320830": "盱眙县",
                "320831": "金湖县",
                "320832": "其它区",
                "320900": "盐城市",
                "320902": "亭湖区",
                "320903": "盐都区",
                "320921": "响水县",
                "320922": "滨海县",
                "320923": "阜宁县",
                "320924": "射阳县",
                "320925": "建湖县",
                "320981": "东台市",
                "320982": "大丰市",
                "320983": "其它区",
                "321000": "扬州市",
                "321002": "广陵区",
                "321003": "邗江区",
                "321023": "宝应县",
                "321081": "仪征市",
                "321084": "高邮市",
                "321088": "江都区",
                "321093": "其它区",
                "321100": "镇江市",
                "321102": "京口区",
                "321111": "润州区",
                "321112": "丹徒区",
                "321181": "丹阳市",
                "321182": "扬中市",
                "321183": "句容市",
                "321184": "其它区",
                "321200": "泰州市",
                "321202": "海陵区",
                "321203": "高港区",
                "321281": "兴化市",
                "321282": "靖江市",
                "321283": "泰兴市",
                "321284": "姜堰区",
                "321285": "其它区",
                "321300": "宿迁市",
                "321302": "宿城区",
                "321311": "宿豫区",
                "321322": "沭阳县",
                "321323": "泗阳县",
                "321324": "泗洪县",
                "321325": "其它区",
                "330000": "浙江省",
                "330100": "杭州市",
                "330102": "上城区",
                "330103": "下城区",
                "330104": "江干区",
                "330105": "拱墅区",
                "330106": "西湖区",
                "330108": "滨江区",
                "330109": "萧山区",
                "330110": "余杭区",
                "330122": "桐庐县",
                "330127": "淳安县",
                "330182": "建德市",
                "330183": "富阳市",
                "330185": "临安市",
                "330186": "其它区",
                "330200": "宁波市",
                "330203": "海曙区",
                "330204": "江东区",
                "330205": "江北区",
                "330206": "北仑区",
                "330211": "镇海区",
                "330212": "鄞州区",
                "330225": "象山县",
                "330226": "宁海县",
                "330281": "余姚市",
                "330282": "慈溪市",
                "330283": "奉化市",
                "330284": "其它区",
                "330300": "温州市",
                "330302": "鹿城区",
                "330303": "龙湾区",
                "330304": "瓯海区",
                "330322": "洞头县",
                "330324": "永嘉县",
                "330326": "平阳县",
                "330327": "苍南县",
                "330328": "文成县",
                "330329": "泰顺县",
                "330381": "瑞安市",
                "330382": "乐清市",
                "330383": "其它区",
                "330400": "嘉兴市",
                "330402": "南湖区",
                "330411": "秀洲区",
                "330421": "嘉善县",
                "330424": "海盐县",
                "330481": "海宁市",
                "330482": "平湖市",
                "330483": "桐乡市",
                "330484": "其它区",
                "330500": "湖州市",
                "330502": "吴兴区",
                "330503": "南浔区",
                "330521": "德清县",
                "330522": "长兴县",
                "330523": "安吉县",
                "330524": "其它区",
                "330600": "绍兴市",
                "330602": "越城区",
                "330621": "绍兴县",
                "330624": "新昌县",
                "330681": "诸暨市",
                "330682": "上虞市",
                "330683": "嵊州市",
                "330684": "其它区",
                "330700": "金华市",
                "330702": "婺城区",
                "330703": "金东区",
                "330723": "武义县",
                "330726": "浦江县",
                "330727": "磐安县",
                "330781": "兰溪市",
                "330782": "义乌市",
                "330783": "东阳市",
                "330784": "永康市",
                "330785": "其它区",
                "330800": "衢州市",
                "330802": "柯城区",
                "330803": "衢江区",
                "330822": "常山县",
                "330824": "开化县",
                "330825": "龙游县",
                "330881": "江山市",
                "330882": "其它区",
                "330900": "舟山市",
                "330902": "定海区",
                "330903": "普陀区",
                "330921": "岱山县",
                "330922": "嵊泗县",
                "330923": "其它区",
                "331000": "台州市",
                "331002": "椒江区",
                "331003": "黄岩区",
                "331004": "路桥区",
                "331021": "玉环县",
                "331022": "三门县",
                "331023": "天台县",
                "331024": "仙居县",
                "331081": "温岭市",
                "331082": "临海市",
                "331083": "其它区",
                "331100": "丽水市",
                "331102": "莲都区",
                "331121": "青田县",
                "331122": "缙云县",
                "331123": "遂昌县",
                "331124": "松阳县",
                "331125": "云和县",
                "331126": "庆元县",
                "331127": "景宁畲族自治县",
                "331181": "龙泉市",
                "331182": "其它区",
                "340000": "安徽省",
                "340100": "合肥市",
                "340102": "瑶海区",
                "340103": "庐阳区",
                "340104": "蜀山区",
                "340111": "包河区",
                "340121": "长丰县",
                "340122": "肥东县",
                "340123": "肥西县",
                "340192": "其它区",
                "340200": "芜湖市",
                "340202": "镜湖区",
                "340203": "弋江区",
                "340207": "鸠江区",
                "340208": "三山区",
                "340221": "芜湖县",
                "340222": "繁昌县",
                "340223": "南陵县",
                "340224": "其它区",
                "340300": "蚌埠市",
                "340302": "龙子湖区",
                "340303": "蚌山区",
                "340304": "禹会区",
                "340311": "淮上区",
                "340321": "怀远县",
                "340322": "五河县",
                "340323": "固镇县",
                "340324": "其它区",
                "340400": "淮南市",
                "340402": "大通区",
                "340403": "田家庵区",
                "340404": "谢家集区",
                "340405": "八公山区",
                "340406": "潘集区",
                "340421": "凤台县",
                "340422": "其它区",
                "340500": "马鞍山市",
                "340503": "花山区",
                "340504": "雨山区",
                "340506": "博望区",
                "340521": "当涂县",
                "340522": "其它区",
                "340600": "淮北市",
                "340602": "杜集区",
                "340603": "相山区",
                "340604": "烈山区",
                "340621": "濉溪县",
                "340622": "其它区",
                "340700": "铜陵市",
                "340702": "铜官山区",
                "340703": "狮子山区",
                "340711": "郊区",
                "340721": "铜陵县",
                "340722": "其它区",
                "340800": "安庆市",
                "340802": "迎江区",
                "340803": "大观区",
                "340811": "宜秀区",
                "340822": "怀宁县",
                "340823": "枞阳县",
                "340824": "潜山县",
                "340825": "太湖县",
                "340826": "宿松县",
                "340827": "望江县",
                "340828": "岳西县",
                "340881": "桐城市",
                "340882": "其它区",
                "341000": "黄山市",
                "341002": "屯溪区",
                "341003": "黄山区",
                "341004": "徽州区",
                "341021": "歙县",
                "341022": "休宁县",
                "341023": "黟县",
                "341024": "祁门县",
                "341025": "其它区",
                "341100": "滁州市",
                "341102": "琅琊区",
                "341103": "南谯区",
                "341122": "来安县",
                "341124": "全椒县",
                "341125": "定远县",
                "341126": "凤阳县",
                "341181": "天长市",
                "341182": "明光市",
                "341183": "其它区",
                "341200": "阜阳市",
                "341202": "颍州区",
                "341203": "颍东区",
                "341204": "颍泉区",
                "341221": "临泉县",
                "341222": "太和县",
                "341225": "阜南县",
                "341226": "颍上县",
                "341282": "界首市",
                "341283": "其它区",
                "341300": "宿州市",
                "341302": "埇桥区",
                "341321": "砀山县",
                "341322": "萧县",
                "341323": "灵璧县",
                "341324": "泗县",
                "341325": "其它区",
                "341400": "巢湖市",
                "341421": "庐江县",
                "341422": "无为县",
                "341423": "含山县",
                "341424": "和县",
                "341500": "六安市",
                "341502": "金安区",
                "341503": "裕安区",
                "341521": "寿县",
                "341522": "霍邱县",
                "341523": "舒城县",
                "341524": "金寨县",
                "341525": "霍山县",
                "341526": "其它区",
                "341600": "亳州市",
                "341602": "谯城区",
                "341621": "涡阳县",
                "341622": "蒙城县",
                "341623": "利辛县",
                "341624": "其它区",
                "341700": "池州市",
                "341702": "贵池区",
                "341721": "东至县",
                "341722": "石台县",
                "341723": "青阳县",
                "341724": "其它区",
                "341800": "宣城市",
                "341802": "宣州区",
                "341821": "郎溪县",
                "341822": "广德县",
                "341823": "泾县",
                "341824": "绩溪县",
                "341825": "旌德县",
                "341881": "宁国市",
                "341882": "其它区",
                "350000": "福建省",
                "350100": "福州市",
                "350102": "鼓楼区",
                "350103": "台江区",
                "350104": "仓山区",
                "350105": "马尾区",
                "350111": "晋安区",
                "350121": "闽侯县",
                "350122": "连江县",
                "350123": "罗源县",
                "350124": "闽清县",
                "350125": "永泰县",
                "350128": "平潭县",
                "350181": "福清市",
                "350182": "长乐市",
                "350183": "其它区",
                "350200": "厦门市",
                "350203": "思明区",
                "350205": "海沧区",
                "350206": "湖里区",
                "350211": "集美区",
                "350212": "同安区",
                "350213": "翔安区",
                "350214": "其它区",
                "350300": "莆田市",
                "350302": "城厢区",
                "350303": "涵江区",
                "350304": "荔城区",
                "350305": "秀屿区",
                "350322": "仙游县",
                "350323": "其它区",
                "350400": "三明市",
                "350402": "梅列区",
                "350403": "三元区",
                "350421": "明溪县",
                "350423": "清流县",
                "350424": "宁化县",
                "350425": "大田县",
                "350426": "尤溪县",
                "350427": "沙县",
                "350428": "将乐县",
                "350429": "泰宁县",
                "350430": "建宁县",
                "350481": "永安市",
                "350482": "其它区",
                "350500": "泉州市",
                "350502": "鲤城区",
                "350503": "丰泽区",
                "350504": "洛江区",
                "350505": "泉港区",
                "350521": "惠安县",
                "350524": "安溪县",
                "350525": "永春县",
                "350526": "德化县",
                "350527": "金门县",
                "350581": "石狮市",
                "350582": "晋江市",
                "350583": "南安市",
                "350584": "其它区",
                "350600": "漳州市",
                "350602": "芗城区",
                "350603": "龙文区",
                "350622": "云霄县",
                "350623": "漳浦县",
                "350624": "诏安县",
                "350625": "长泰县",
                "350626": "东山县",
                "350627": "南靖县",
                "350628": "平和县",
                "350629": "华安县",
                "350681": "龙海市",
                "350682": "其它区",
                "350700": "南平市",
                "350702": "延平区",
                "350721": "顺昌县",
                "350722": "浦城县",
                "350723": "光泽县",
                "350724": "松溪县",
                "350725": "政和县",
                "350781": "邵武市",
                "350782": "武夷山市",
                "350783": "建瓯市",
                "350784": "建阳市",
                "350785": "其它区",
                "350800": "龙岩市",
                "350802": "新罗区",
                "350821": "长汀县",
                "350822": "永定县",
                "350823": "上杭县",
                "350824": "武平县",
                "350825": "连城县",
                "350881": "漳平市",
                "350882": "其它区",
                "350900": "宁德市",
                "350902": "蕉城区",
                "350921": "霞浦县",
                "350922": "古田县",
                "350923": "屏南县",
                "350924": "寿宁县",
                "350925": "周宁县",
                "350926": "柘荣县",
                "350981": "福安市",
                "350982": "福鼎市",
                "350983": "其它区",
                "360000": "江西省",
                "360100": "南昌市",
                "360102": "东湖区",
                "360103": "西湖区",
                "360104": "青云谱区",
                "360105": "湾里区",
                "360111": "青山湖区",
                "360121": "南昌县",
                "360122": "新建县",
                "360123": "安义县",
                "360124": "进贤县",
                "360128": "其它区",
                "360200": "景德镇市",
                "360202": "昌江区",
                "360203": "珠山区",
                "360222": "浮梁县",
                "360281": "乐平市",
                "360282": "其它区",
                "360300": "萍乡市",
                "360302": "安源区",
                "360313": "湘东区",
                "360321": "莲花县",
                "360322": "上栗县",
                "360323": "芦溪县",
                "360324": "其它区",
                "360400": "九江市",
                "360402": "庐山区",
                "360403": "浔阳区",
                "360421": "九江县",
                "360423": "武宁县",
                "360424": "修水县",
                "360425": "永修县",
                "360426": "德安县",
                "360427": "星子县",
                "360428": "都昌县",
                "360429": "湖口县",
                "360430": "彭泽县",
                "360481": "瑞昌市",
                "360482": "其它区",
                "360483": "共青城市",
                "360500": "新余市",
                "360502": "渝水区",
                "360521": "分宜县",
                "360522": "其它区",
                "360600": "鹰潭市",
                "360602": "月湖区",
                "360622": "余江县",
                "360681": "贵溪市",
                "360682": "其它区",
                "360700": "赣州市",
                "360702": "章贡区",
                "360721": "赣县",
                "360722": "信丰县",
                "360723": "大余县",
                "360724": "上犹县",
                "360725": "崇义县",
                "360726": "安远县",
                "360727": "龙南县",
                "360728": "定南县",
                "360729": "全南县",
                "360730": "宁都县",
                "360731": "于都县",
                "360732": "兴国县",
                "360733": "会昌县",
                "360734": "寻乌县",
                "360735": "石城县",
                "360781": "瑞金市",
                "360782": "南康市",
                "360783": "其它区",
                "360800": "吉安市",
                "360802": "吉州区",
                "360803": "青原区",
                "360821": "吉安县",
                "360822": "吉水县",
                "360823": "峡江县",
                "360824": "新干县",
                "360825": "永丰县",
                "360826": "泰和县",
                "360827": "遂川县",
                "360828": "万安县",
                "360829": "安福县",
                "360830": "永新县",
                "360881": "井冈山市",
                "360882": "其它区",
                "360900": "宜春市",
                "360902": "袁州区",
                "360921": "奉新县",
                "360922": "万载县",
                "360923": "上高县",
                "360924": "宜丰县",
                "360925": "靖安县",
                "360926": "铜鼓县",
                "360981": "丰城市",
                "360982": "樟树市",
                "360983": "高安市",
                "360984": "其它区",
                "361000": "抚州市",
                "361002": "临川区",
                "361021": "南城县",
                "361022": "黎川县",
                "361023": "南丰县",
                "361024": "崇仁县",
                "361025": "乐安县",
                "361026": "宜黄县",
                "361027": "金溪县",
                "361028": "资溪县",
                "361029": "东乡县",
                "361030": "广昌县",
                "361031": "其它区",
                "361100": "上饶市",
                "361102": "信州区",
                "361121": "上饶县",
                "361122": "广丰县",
                "361123": "玉山县",
                "361124": "铅山县",
                "361125": "横峰县",
                "361126": "弋阳县",
                "361127": "余干县",
                "361128": "鄱阳县",
                "361129": "万年县",
                "361130": "婺源县",
                "361181": "德兴市",
                "361182": "其它区",
                "370000": "山东省",
                "370100": "济南市",
                "370102": "历下区",
                "370103": "市中区",
                "370104": "槐荫区",
                "370105": "天桥区",
                "370112": "历城区",
                "370113": "长清区",
                "370124": "平阴县",
                "370125": "济阳县",
                "370126": "商河县",
                "370181": "章丘市",
                "370182": "其它区",
                "370200": "青岛市",
                "370202": "市南区",
                "370203": "市北区",
                "370211": "黄岛区",
                "370212": "崂山区",
                "370213": "李沧区",
                "370214": "城阳区",
                "370281": "胶州市",
                "370282": "即墨市",
                "370283": "平度市",
                "370285": "莱西市",
                "370286": "其它区",
                "370300": "淄博市",
                "370302": "淄川区",
                "370303": "张店区",
                "370304": "博山区",
                "370305": "临淄区",
                "370306": "周村区",
                "370321": "桓台县",
                "370322": "高青县",
                "370323": "沂源县",
                "370324": "其它区",
                "370400": "枣庄市",
                "370402": "市中区",
                "370403": "薛城区",
                "370404": "峄城区",
                "370405": "台儿庄区",
                "370406": "山亭区",
                "370481": "滕州市",
                "370482": "其它区",
                "370500": "东营市",
                "370502": "东营区",
                "370503": "河口区",
                "370521": "垦利县",
                "370522": "利津县",
                "370523": "广饶县",
                "370591": "其它区",
                "370600": "烟台市",
                "370602": "芝罘区",
                "370611": "福山区",
                "370612": "牟平区",
                "370613": "莱山区",
                "370634": "长岛县",
                "370681": "龙口市",
                "370682": "莱阳市",
                "370683": "莱州市",
                "370684": "蓬莱市",
                "370685": "招远市",
                "370686": "栖霞市",
                "370687": "海阳市",
                "370688": "其它区",
                "370700": "潍坊市",
                "370702": "潍城区",
                "370703": "寒亭区",
                "370704": "坊子区",
                "370705": "奎文区",
                "370724": "临朐县",
                "370725": "昌乐县",
                "370781": "青州市",
                "370782": "诸城市",
                "370783": "寿光市",
                "370784": "安丘市",
                "370785": "高密市",
                "370786": "昌邑市",
                "370787": "其它区",
                "370800": "济宁市",
                "370802": "市中区",
                "370811": "任城区",
                "370826": "微山县",
                "370827": "鱼台县",
                "370828": "金乡县",
                "370829": "嘉祥县",
                "370830": "汶上县",
                "370831": "泗水县",
                "370832": "梁山县",
                "370881": "曲阜市",
                "370882": "兖州市",
                "370883": "邹城市",
                "370884": "其它区",
                "370900": "泰安市",
                "370902": "泰山区",
                "370903": "岱岳区",
                "370921": "宁阳县",
                "370923": "东平县",
                "370982": "新泰市",
                "370983": "肥城市",
                "370984": "其它区",
                "371000": "威海市",
                "371002": "环翠区",
                "371081": "文登市",
                "371082": "荣成市",
                "371083": "乳山市",
                "371084": "其它区",
                "371100": "日照市",
                "371102": "东港区",
                "371103": "岚山区",
                "371121": "五莲县",
                "371122": "莒县",
                "371123": "其它区",
                "371200": "莱芜市",
                "371202": "莱城区",
                "371203": "钢城区",
                "371204": "其它区",
                "371300": "临沂市",
                "371302": "兰山区",
                "371311": "罗庄区",
                "371312": "河东区",
                "371321": "沂南县",
                "371322": "郯城县",
                "371323": "沂水县",
                "371324": "苍山县",
                "371325": "费县",
                "371326": "平邑县",
                "371327": "莒南县",
                "371328": "蒙阴县",
                "371329": "临沭县",
                "371330": "其它区",
                "371400": "德州市",
                "371402": "德城区",
                "371421": "陵县",
                "371422": "宁津县",
                "371423": "庆云县",
                "371424": "临邑县",
                "371425": "齐河县",
                "371426": "平原县",
                "371427": "夏津县",
                "371428": "武城县",
                "371481": "乐陵市",
                "371482": "禹城市",
                "371483": "其它区",
                "371500": "聊城市",
                "371502": "东昌府区",
                "371521": "阳谷县",
                "371522": "莘县",
                "371523": "茌平县",
                "371524": "东阿县",
                "371525": "冠县",
                "371526": "高唐县",
                "371581": "临清市",
                "371582": "其它区",
                "371600": "滨州市",
                "371602": "滨城区",
                "371621": "惠民县",
                "371622": "阳信县",
                "371623": "无棣县",
                "371624": "沾化县",
                "371625": "博兴县",
                "371626": "邹平县",
                "371627": "其它区",
                "371700": "菏泽市",
                "371702": "牡丹区",
                "371721": "曹县",
                "371722": "单县",
                "371723": "成武县",
                "371724": "巨野县",
                "371725": "郓城县",
                "371726": "鄄城县",
                "371727": "定陶县",
                "371728": "东明县",
                "371729": "其它区",
                "410000": "河南省",
                "410100": "郑州市",
                "410102": "中原区",
                "410103": "二七区",
                "410104": "管城回族区",
                "410105": "金水区",
                "410106": "上街区",
                "410108": "惠济区",
                "410122": "中牟县",
                "410181": "巩义市",
                "410182": "荥阳市",
                "410183": "新密市",
                "410184": "新郑市",
                "410185": "登封市",
                "410188": "其它区",
                "410200": "开封市",
                "410202": "龙亭区",
                "410203": "顺河回族区",
                "410204": "鼓楼区",
                "410205": "禹王台区",
                "410211": "金明区",
                "410221": "杞县",
                "410222": "通许县",
                "410223": "尉氏县",
                "410224": "开封县",
                "410225": "兰考县",
                "410226": "其它区",
                "410300": "洛阳市",
                "410302": "老城区",
                "410303": "西工区",
                "410304": "瀍河回族区",
                "410305": "涧西区",
                "410306": "吉利区",
                "410307": "洛龙区",
                "410322": "孟津县",
                "410323": "新安县",
                "410324": "栾川县",
                "410325": "嵩县",
                "410326": "汝阳县",
                "410327": "宜阳县",
                "410328": "洛宁县",
                "410329": "伊川县",
                "410381": "偃师市",
                "410400": "平顶山市",
                "410402": "新华区",
                "410403": "卫东区",
                "410404": "石龙区",
                "410411": "湛河区",
                "410421": "宝丰县",
                "410422": "叶县",
                "410423": "鲁山县",
                "410425": "郏县",
                "410481": "舞钢市",
                "410482": "汝州市",
                "410483": "其它区",
                "410500": "安阳市",
                "410502": "文峰区",
                "410503": "北关区",
                "410505": "殷都区",
                "410506": "龙安区",
                "410522": "安阳县",
                "410523": "汤阴县",
                "410526": "滑县",
                "410527": "内黄县",
                "410581": "林州市",
                "410582": "其它区",
                "410600": "鹤壁市",
                "410602": "鹤山区",
                "410603": "山城区",
                "410611": "淇滨区",
                "410621": "浚县",
                "410622": "淇县",
                "410623": "其它区",
                "410700": "新乡市",
                "410702": "红旗区",
                "410703": "卫滨区",
                "410704": "凤泉区",
                "410711": "牧野区",
                "410721": "新乡县",
                "410724": "获嘉县",
                "410725": "原阳县",
                "410726": "延津县",
                "410727": "封丘县",
                "410728": "长垣县",
                "410781": "卫辉市",
                "410782": "辉县市",
                "410783": "其它区",
                "410800": "焦作市",
                "410802": "解放区",
                "410803": "中站区",
                "410804": "马村区",
                "410811": "山阳区",
                "410821": "修武县",
                "410822": "博爱县",
                "410823": "武陟县",
                "410825": "温县",
                "410881": "济源市",
                "410882": "沁阳市",
                "410883": "孟州市",
                "410884": "其它区",
                "410900": "濮阳市",
                "410902": "华龙区",
                "410922": "清丰县",
                "410923": "南乐县",
                "410926": "范县",
                "410927": "台前县",
                "410928": "濮阳县",
                "410929": "其它区",
                "411000": "许昌市",
                "411002": "魏都区",
                "411023": "许昌县",
                "411024": "鄢陵县",
                "411025": "襄城县",
                "411081": "禹州市",
                "411082": "长葛市",
                "411083": "其它区",
                "411100": "漯河市",
                "411102": "源汇区",
                "411103": "郾城区",
                "411104": "召陵区",
                "411121": "舞阳县",
                "411122": "临颍县",
                "411123": "其它区",
                "411200": "三门峡市",
                "411202": "湖滨区",
                "411221": "渑池县",
                "411222": "陕县",
                "411224": "卢氏县",
                "411281": "义马市",
                "411282": "灵宝市",
                "411283": "其它区",
                "411300": "南阳市",
                "411302": "宛城区",
                "411303": "卧龙区",
                "411321": "南召县",
                "411322": "方城县",
                "411323": "西峡县",
                "411324": "镇平县",
                "411325": "内乡县",
                "411326": "淅川县",
                "411327": "社旗县",
                "411328": "唐河县",
                "411329": "新野县",
                "411330": "桐柏县",
                "411381": "邓州市",
                "411382": "其它区",
                "411400": "商丘市",
                "411402": "梁园区",
                "411403": "睢阳区",
                "411421": "民权县",
                "411422": "睢县",
                "411423": "宁陵县",
                "411424": "柘城县",
                "411425": "虞城县",
                "411426": "夏邑县",
                "411481": "永城市",
                "411482": "其它区",
                "411500": "信阳市",
                "411502": "浉河区",
                "411503": "平桥区",
                "411521": "罗山县",
                "411522": "光山县",
                "411523": "新县",
                "411524": "商城县",
                "411525": "固始县",
                "411526": "潢川县",
                "411527": "淮滨县",
                "411528": "息县",
                "411529": "其它区",
                "411600": "周口市",
                "411602": "川汇区",
                "411621": "扶沟县",
                "411622": "西华县",
                "411623": "商水县",
                "411624": "沈丘县",
                "411625": "郸城县",
                "411626": "淮阳县",
                "411627": "太康县",
                "411628": "鹿邑县",
                "411681": "项城市",
                "411682": "其它区",
                "411700": "驻马店市",
                "411702": "驿城区",
                "411721": "西平县",
                "411722": "上蔡县",
                "411723": "平舆县",
                "411724": "正阳县",
                "411725": "确山县",
                "411726": "泌阳县",
                "411727": "汝南县",
                "411728": "遂平县",
                "411729": "新蔡县",
                "411730": "其它区",
                "420000": "湖北省",
                "420100": "武汉市",
                "420102": "江岸区",
                "420103": "江汉区",
                "420104": "硚口区",
                "420105": "汉阳区",
                "420106": "武昌区",
                "420107": "青山区",
                "420111": "洪山区",
                "420112": "东西湖区",
                "420113": "汉南区",
                "420114": "蔡甸区",
                "420115": "江夏区",
                "420116": "黄陂区",
                "420117": "新洲区",
                "420118": "其它区",
                "420200": "黄石市",
                "420202": "黄石港区",
                "420203": "西塞山区",
                "420204": "下陆区",
                "420205": "铁山区",
                "420222": "阳新县",
                "420281": "大冶市",
                "420282": "其它区",
                "420300": "十堰市",
                "420302": "茅箭区",
                "420303": "张湾区",
                "420321": "郧县",
                "420322": "郧西县",
                "420323": "竹山县",
                "420324": "竹溪县",
                "420325": "房县",
                "420381": "丹江口市",
                "420383": "其它区",
                "420500": "宜昌市",
                "420502": "西陵区",
                "420503": "伍家岗区",
                "420504": "点军区",
                "420505": "猇亭区",
                "420506": "夷陵区",
                "420525": "远安县",
                "420526": "兴山县",
                "420527": "秭归县",
                "420528": "长阳土家族自治县",
                "420529": "五峰土家族自治县",
                "420581": "宜都市",
                "420582": "当阳市",
                "420583": "枝江市",
                "420584": "其它区",
                "420600": "襄阳市",
                "420602": "襄城区",
                "420606": "樊城区",
                "420607": "襄州区",
                "420624": "南漳县",
                "420625": "谷城县",
                "420626": "保康县",
                "420682": "老河口市",
                "420683": "枣阳市",
                "420684": "宜城市",
                "420685": "其它区",
                "420700": "鄂州市",
                "420702": "梁子湖区",
                "420703": "华容区",
                "420704": "鄂城区",
                "420705": "其它区",
                "420800": "荆门市",
                "420802": "东宝区",
                "420804": "掇刀区",
                "420821": "京山县",
                "420822": "沙洋县",
                "420881": "钟祥市",
                "420882": "其它区",
                "420900": "孝感市",
                "420902": "孝南区",
                "420921": "孝昌县",
                "420922": "大悟县",
                "420923": "云梦县",
                "420981": "应城市",
                "420982": "安陆市",
                "420984": "汉川市",
                "420985": "其它区",
                "421000": "荆州市",
                "421002": "沙市区",
                "421003": "荆州区",
                "421022": "公安县",
                "421023": "监利县",
                "421024": "江陵县",
                "421081": "石首市",
                "421083": "洪湖市",
                "421087": "松滋市",
                "421088": "其它区",
                "421100": "黄冈市",
                "421102": "黄州区",
                "421121": "团风县",
                "421122": "红安县",
                "421123": "罗田县",
                "421124": "英山县",
                "421125": "浠水县",
                "421126": "蕲春县",
                "421127": "黄梅县",
                "421181": "麻城市",
                "421182": "武穴市",
                "421183": "其它区",
                "421200": "咸宁市",
                "421202": "咸安区",
                "421221": "嘉鱼县",
                "421222": "通城县",
                "421223": "崇阳县",
                "421224": "通山县",
                "421281": "赤壁市",
                "421283": "其它区",
                "421300": "随州市",
                "421302": "曾都区",
                "421321": "随县",
                "421381": "广水市",
                "421382": "其它区",
                "422800": "恩施土家族苗族自治州",
                "422801": "恩施市",
                "422802": "利川市",
                "422822": "建始县",
                "422823": "巴东县",
                "422825": "宣恩县",
                "422826": "咸丰县",
                "422827": "来凤县",
                "422828": "鹤峰县",
                "422829": "其它区",
                "429004": "仙桃市",
                "429005": "潜江市",
                "429006": "天门市",
                "429021": "神农架林区",
                "430000": "湖南省",
                "430100": "长沙市",
                "430102": "芙蓉区",
                "430103": "天心区",
                "430104": "岳麓区",
                "430105": "开福区",
                "430111": "雨花区",
                "430121": "长沙县",
                "430122": "望城区",
                "430124": "宁乡县",
                "430181": "浏阳市",
                "430182": "其它区",
                "430200": "株洲市",
                "430202": "荷塘区",
                "430203": "芦淞区",
                "430204": "石峰区",
                "430211": "天元区",
                "430221": "株洲县",
                "430223": "攸县",
                "430224": "茶陵县",
                "430225": "炎陵县",
                "430281": "醴陵市",
                "430282": "其它区",
                "430300": "湘潭市",
                "430302": "雨湖区",
                "430304": "岳塘区",
                "430321": "湘潭县",
                "430381": "湘乡市",
                "430382": "韶山市",
                "430383": "其它区",
                "430400": "衡阳市",
                "430405": "珠晖区",
                "430406": "雁峰区",
                "430407": "石鼓区",
                "430408": "蒸湘区",
                "430412": "南岳区",
                "430421": "衡阳县",
                "430422": "衡南县",
                "430423": "衡山县",
                "430424": "衡东县",
                "430426": "祁东县",
                "430481": "耒阳市",
                "430482": "常宁市",
                "430483": "其它区",
                "430500": "邵阳市",
                "430502": "双清区",
                "430503": "大祥区",
                "430511": "北塔区",
                "430521": "邵东县",
                "430522": "新邵县",
                "430523": "邵阳县",
                "430524": "隆回县",
                "430525": "洞口县",
                "430527": "绥宁县",
                "430528": "新宁县",
                "430529": "城步苗族自治县",
                "430581": "武冈市",
                "430582": "其它区",
                "430600": "岳阳市",
                "430602": "岳阳楼区",
                "430603": "云溪区",
                "430611": "君山区",
                "430621": "岳阳县",
                "430623": "华容县",
                "430624": "湘阴县",
                "430626": "平江县",
                "430681": "汨罗市",
                "430682": "临湘市",
                "430683": "其它区",
                "430700": "常德市",
                "430702": "武陵区",
                "430703": "鼎城区",
                "430721": "安乡县",
                "430722": "汉寿县",
                "430723": "澧县",
                "430724": "临澧县",
                "430725": "桃源县",
                "430726": "石门县",
                "430781": "津市市",
                "430782": "其它区",
                "430800": "张家界市",
                "430802": "永定区",
                "430811": "武陵源区",
                "430821": "慈利县",
                "430822": "桑植县",
                "430823": "其它区",
                "430900": "益阳市",
                "430902": "资阳区",
                "430903": "赫山区",
                "430921": "南县",
                "430922": "桃江县",
                "430923": "安化县",
                "430981": "沅江市",
                "430982": "其它区",
                "431000": "郴州市",
                "431002": "北湖区",
                "431003": "苏仙区",
                "431021": "桂阳县",
                "431022": "宜章县",
                "431023": "永兴县",
                "431024": "嘉禾县",
                "431025": "临武县",
                "431026": "汝城县",
                "431027": "桂东县",
                "431028": "安仁县",
                "431081": "资兴市",
                "431082": "其它区",
                "431100": "永州市",
                "431102": "零陵区",
                "431103": "冷水滩区",
                "431121": "祁阳县",
                "431122": "东安县",
                "431123": "双牌县",
                "431124": "道县",
                "431125": "江永县",
                "431126": "宁远县",
                "431127": "蓝山县",
                "431128": "新田县",
                "431129": "江华瑶族自治县",
                "431130": "其它区",
                "431200": "怀化市",
                "431202": "鹤城区",
                "431221": "中方县",
                "431222": "沅陵县",
                "431223": "辰溪县",
                "431224": "溆浦县",
                "431225": "会同县",
                "431226": "麻阳苗族自治县",
                "431227": "新晃侗族自治县",
                "431228": "芷江侗族自治县",
                "431229": "靖州苗族侗族自治县",
                "431230": "通道侗族自治县",
                "431281": "洪江市",
                "431282": "其它区",
                "431300": "娄底市",
                "431302": "娄星区",
                "431321": "双峰县",
                "431322": "新化县",
                "431381": "冷水江市",
                "431382": "涟源市",
                "431383": "其它区",
                "433100": "湘西土家族苗族自治州",
                "433101": "吉首市",
                "433122": "泸溪县",
                "433123": "凤凰县",
                "433124": "花垣县",
                "433125": "保靖县",
                "433126": "古丈县",
                "433127": "永顺县",
                "433130": "龙山县",
                "433131": "其它区",
                "440000": "广东省",
                "440100": "广州市",
                "440103": "荔湾区",
                "440104": "越秀区",
                "440105": "海珠区",
                "440106": "天河区",
                "440111": "白云区",
                "440112": "黄埔区",
                "440113": "番禺区",
                "440114": "花都区",
                "440115": "南沙区",
                "440116": "萝岗区",
                "440183": "增城市",
                "440184": "从化市",
                "440189": "其它区",
                "440200": "韶关市",
                "440203": "武江区",
                "440204": "浈江区",
                "440205": "曲江区",
                "440222": "始兴县",
                "440224": "仁化县",
                "440229": "翁源县",
                "440232": "乳源瑶族自治县",
                "440233": "新丰县",
                "440281": "乐昌市",
                "440282": "南雄市",
                "440283": "其它区",
                "440300": "深圳市",
                "440303": "罗湖区",
                "440304": "福田区",
                "440305": "南山区",
                "440306": "宝安区",
                "440307": "龙岗区",
                "440308": "盐田区",
                "440309": "其它区",
                "440320": "光明新区",
                "440321": "坪山新区",
                "440322": "大鹏新区",
                "440323": "龙华新区",
                "440400": "珠海市",
                "440402": "香洲区",
                "440403": "斗门区",
                "440404": "金湾区",
                "440488": "其它区",
                "440500": "汕头市",
                "440507": "龙湖区",
                "440511": "金平区",
                "440512": "濠江区",
                "440513": "潮阳区",
                "440514": "潮南区",
                "440515": "澄海区",
                "440523": "南澳县",
                "440524": "其它区",
                "440600": "佛山市",
                "440604": "禅城区",
                "440605": "南海区",
                "440606": "顺德区",
                "440607": "三水区",
                "440608": "高明区",
                "440609": "其它区",
                "440700": "江门市",
                "440703": "蓬江区",
                "440704": "江海区",
                "440705": "新会区",
                "440781": "台山市",
                "440783": "开平市",
                "440784": "鹤山市",
                "440785": "恩平市",
                "440786": "其它区",
                "440800": "湛江市",
                "440802": "赤坎区",
                "440803": "霞山区",
                "440804": "坡头区",
                "440811": "麻章区",
                "440823": "遂溪县",
                "440825": "徐闻县",
                "440881": "廉江市",
                "440882": "雷州市",
                "440883": "吴川市",
                "440884": "其它区",
                "440900": "茂名市",
                "440902": "茂南区",
                "440903": "茂港区",
                "440923": "电白县",
                "440981": "高州市",
                "440982": "化州市",
                "440983": "信宜市",
                "440984": "其它区",
                "441200": "肇庆市",
                "441202": "端州区",
                "441203": "鼎湖区",
                "441223": "广宁县",
                "441224": "怀集县",
                "441225": "封开县",
                "441226": "德庆县",
                "441283": "高要市",
                "441284": "四会市",
                "441285": "其它区",
                "441300": "惠州市",
                "441302": "惠城区",
                "441303": "惠阳区",
                "441322": "博罗县",
                "441323": "惠东县",
                "441324": "龙门县",
                "441325": "其它区",
                "441400": "梅州市",
                "441402": "梅江区",
                "441421": "梅县",
                "441422": "大埔县",
                "441423": "丰顺县",
                "441424": "五华县",
                "441426": "平远县",
                "441427": "蕉岭县",
                "441481": "兴宁市",
                "441482": "其它区",
                "441500": "汕尾市",
                "441502": "城区",
                "441521": "海丰县",
                "441523": "陆河县",
                "441581": "陆丰市",
                "441582": "其它区",
                "441600": "河源市",
                "441602": "源城区",
                "441621": "紫金县",
                "441622": "龙川县",
                "441623": "连平县",
                "441624": "和平县",
                "441625": "东源县",
                "441626": "其它区",
                "441700": "阳江市",
                "441702": "江城区",
                "441721": "阳西县",
                "441723": "阳东县",
                "441781": "阳春市",
                "441782": "其它区",
                "441800": "清远市",
                "441802": "清城区",
                "441821": "佛冈县",
                "441823": "阳山县",
                "441825": "连山壮族瑶族自治县",
                "441826": "连南瑶族自治县",
                "441827": "清新区",
                "441881": "英德市",
                "441882": "连州市",
                "441883": "其它区",
                "441900": "东莞市",
                "442000": "中山市",
                "442101": "东沙群岛",
                "445100": "潮州市",
                "445102": "湘桥区",
                "445121": "潮安区",
                "445122": "饶平县",
                "445186": "其它区",
                "445200": "揭阳市",
                "445202": "榕城区",
                "445221": "揭东区",
                "445222": "揭西县",
                "445224": "惠来县",
                "445281": "普宁市",
                "445285": "其它区",
                "445300": "云浮市",
                "445302": "云城区",
                "445321": "新兴县",
                "445322": "郁南县",
                "445323": "云安县",
                "445381": "罗定市",
                "445382": "其它区",
                "450000": "广西壮族自治区",
                "450100": "南宁市",
                "450102": "兴宁区",
                "450103": "青秀区",
                "450105": "江南区",
                "450107": "西乡塘区",
                "450108": "良庆区",
                "450109": "邕宁区",
                "450122": "武鸣县",
                "450123": "隆安县",
                "450124": "马山县",
                "450125": "上林县",
                "450126": "宾阳县",
                "450127": "横县",
                "450128": "其它区",
                "450200": "柳州市",
                "450202": "城中区",
                "450203": "鱼峰区",
                "450204": "柳南区",
                "450205": "柳北区",
                "450221": "柳江县",
                "450222": "柳城县",
                "450223": "鹿寨县",
                "450224": "融安县",
                "450225": "融水苗族自治县",
                "450226": "三江侗族自治县",
                "450227": "其它区",
                "450300": "桂林市",
                "450302": "秀峰区",
                "450303": "叠彩区",
                "450304": "象山区",
                "450305": "七星区",
                "450311": "雁山区",
                "450321": "阳朔县",
                "450322": "临桂区",
                "450323": "灵川县",
                "450324": "全州县",
                "450325": "兴安县",
                "450326": "永福县",
                "450327": "灌阳县",
                "450328": "龙胜各族自治县",
                "450329": "资源县",
                "450330": "平乐县",
                "450331": "荔浦县",
                "450332": "恭城瑶族自治县",
                "450333": "其它区",
                "450400": "梧州市",
                "450403": "万秀区",
                "450405": "长洲区",
                "450406": "龙圩区",
                "450421": "苍梧县",
                "450422": "藤县",
                "450423": "蒙山县",
                "450481": "岑溪市",
                "450482": "其它区",
                "450500": "北海市",
                "450502": "海城区",
                "450503": "银海区",
                "450512": "铁山港区",
                "450521": "合浦县",
                "450522": "其它区",
                "450600": "防城港市",
                "450602": "港口区",
                "450603": "防城区",
                "450621": "上思县",
                "450681": "东兴市",
                "450682": "其它区",
                "450700": "钦州市",
                "450702": "钦南区",
                "450703": "钦北区",
                "450721": "灵山县",
                "450722": "浦北县",
                "450723": "其它区",
                "450800": "贵港市",
                "450802": "港北区",
                "450803": "港南区",
                "450804": "覃塘区",
                "450821": "平南县",
                "450881": "桂平市",
                "450882": "其它区",
                "450900": "玉林市",
                "450902": "玉州区",
                "450903": "福绵区",
                "450921": "容县",
                "450922": "陆川县",
                "450923": "博白县",
                "450924": "兴业县",
                "450981": "北流市",
                "450982": "其它区",
                "451000": "百色市",
                "451002": "右江区",
                "451021": "田阳县",
                "451022": "田东县",
                "451023": "平果县",
                "451024": "德保县",
                "451025": "靖西县",
                "451026": "那坡县",
                "451027": "凌云县",
                "451028": "乐业县",
                "451029": "田林县",
                "451030": "西林县",
                "451031": "隆林各族自治县",
                "451032": "其它区",
                "451100": "贺州市",
                "451102": "八步区",
                "451119": "平桂管理区",
                "451121": "昭平县",
                "451122": "钟山县",
                "451123": "富川瑶族自治县",
                "451124": "其它区",
                "451200": "河池市",
                "451202": "金城江区",
                "451221": "南丹县",
                "451222": "天峨县",
                "451223": "凤山县",
                "451224": "东兰县",
                "451225": "罗城仫佬族自治县",
                "451226": "环江毛南族自治县",
                "451227": "巴马瑶族自治县",
                "451228": "都安瑶族自治县",
                "451229": "大化瑶族自治县",
                "451281": "宜州市",
                "451282": "其它区",
                "451300": "来宾市",
                "451302": "兴宾区",
                "451321": "忻城县",
                "451322": "象州县",
                "451323": "武宣县",
                "451324": "金秀瑶族自治县",
                "451381": "合山市",
                "451382": "其它区",
                "451400": "崇左市",
                "451402": "江州区",
                "451421": "扶绥县",
                "451422": "宁明县",
                "451423": "龙州县",
                "451424": "大新县",
                "451425": "天等县",
                "451481": "凭祥市",
                "451482": "其它区",
                "460000": "海南省",
                "460100": "海口市",
                "460105": "秀英区",
                "460106": "龙华区",
                "460107": "琼山区",
                "460108": "美兰区",
                "460109": "其它区",
                "460200": "三亚市",
                "460300": "三沙市",
                "460321": "西沙群岛",
                "460322": "南沙群岛",
                "460323": "中沙群岛的岛礁及其海域",
                "469001": "五指山市",
                "469002": "琼海市",
                "469003": "儋州市",
                "469005": "文昌市",
                "469006": "万宁市",
                "469007": "东方市",
                "469025": "定安县",
                "469026": "屯昌县",
                "469027": "澄迈县",
                "469028": "临高县",
                "469030": "白沙黎族自治县",
                "469031": "昌江黎族自治县",
                "469033": "乐东黎族自治县",
                "469034": "陵水黎族自治县",
                "469035": "保亭黎族苗族自治县",
                "469036": "琼中黎族苗族自治县",
                "471005": "其它区",
                "500000": "重庆",
                "500100": "重庆市",
                "500101": "万州区",
                "500102": "涪陵区",
                "500103": "渝中区",
                "500104": "大渡口区",
                "500105": "江北区",
                "500106": "沙坪坝区",
                "500107": "九龙坡区",
                "500108": "南岸区",
                "500109": "北碚区",
                "500110": "万盛区",
                "500111": "双桥区",
                "500112": "渝北区",
                "500113": "巴南区",
                "500114": "黔江区",
                "500115": "长寿区",
                "500222": "綦江区",
                "500223": "潼南县",
                "500224": "铜梁县",
                "500225": "大足区",
                "500226": "荣昌县",
                "500227": "璧山县",
                "500228": "梁平县",
                "500229": "城口县",
                "500230": "丰都县",
                "500231": "垫江县",
                "500232": "武隆县",
                "500233": "忠县",
                "500234": "开县",
                "500235": "云阳县",
                "500236": "奉节县",
                "500237": "巫山县",
                "500238": "巫溪县",
                "500240": "石柱土家族自治县",
                "500241": "秀山土家族苗族自治县",
                "500242": "酉阳土家族苗族自治县",
                "500243": "彭水苗族土家族自治县",
                "500381": "江津区",
                "500382": "合川区",
                "500383": "永川区",
                "500384": "南川区",
                "500385": "其它区",
                "510000": "四川省",
                "510100": "成都市",
                "510104": "锦江区",
                "510105": "青羊区",
                "510106": "金牛区",
                "510107": "武侯区",
                "510108": "成华区",
                "510112": "龙泉驿区",
                "510113": "青白江区",
                "510114": "新都区",
                "510115": "温江区",
                "510121": "金堂县",
                "510122": "双流县",
                "510124": "郫县",
                "510129": "大邑县",
                "510131": "蒲江县",
                "510132": "新津县",
                "510181": "都江堰市",
                "510182": "彭州市",
                "510183": "邛崃市",
                "510184": "崇州市",
                "510185": "其它区",
                "510300": "自贡市",
                "510302": "自流井区",
                "510303": "贡井区",
                "510304": "大安区",
                "510311": "沿滩区",
                "510321": "荣县",
                "510322": "富顺县",
                "510323": "其它区",
                "510400": "攀枝花市",
                "510402": "东区",
                "510403": "西区",
                "510411": "仁和区",
                "510421": "米易县",
                "510422": "盐边县",
                "510423": "其它区",
                "510500": "泸州市",
                "510502": "江阳区",
                "510503": "纳溪区",
                "510504": "龙马潭区",
                "510521": "泸县",
                "510522": "合江县",
                "510524": "叙永县",
                "510525": "古蔺县",
                "510526": "其它区",
                "510600": "德阳市",
                "510603": "旌阳区",
                "510623": "中江县",
                "510626": "罗江县",
                "510681": "广汉市",
                "510682": "什邡市",
                "510683": "绵竹市",
                "510684": "其它区",
                "510700": "绵阳市",
                "510703": "涪城区",
                "510704": "游仙区",
                "510722": "三台县",
                "510723": "盐亭县",
                "510724": "安县",
                "510725": "梓潼县",
                "510726": "北川羌族自治县",
                "510727": "平武县",
                "510781": "江油市",
                "510782": "其它区",
                "510800": "广元市",
                "510802": "利州区",
                "510811": "昭化区",
                "510812": "朝天区",
                "510821": "旺苍县",
                "510822": "青川县",
                "510823": "剑阁县",
                "510824": "苍溪县",
                "510825": "其它区",
                "510900": "遂宁市",
                "510903": "船山区",
                "510904": "安居区",
                "510921": "蓬溪县",
                "510922": "射洪县",
                "510923": "大英县",
                "510924": "其它区",
                "511000": "内江市",
                "511002": "市中区",
                "511011": "东兴区",
                "511024": "威远县",
                "511025": "资中县",
                "511028": "隆昌县",
                "511029": "其它区",
                "511100": "乐山市",
                "511102": "市中区",
                "511111": "沙湾区",
                "511112": "五通桥区",
                "511113": "金口河区",
                "511123": "犍为县",
                "511124": "井研县",
                "511126": "夹江县",
                "511129": "沐川县",
                "511132": "峨边彝族自治县",
                "511133": "马边彝族自治县",
                "511181": "峨眉山市",
                "511182": "其它区",
                "511300": "南充市",
                "511302": "顺庆区",
                "511303": "高坪区",
                "511304": "嘉陵区",
                "511321": "南部县",
                "511322": "营山县",
                "511323": "蓬安县",
                "511324": "仪陇县",
                "511325": "西充县",
                "511381": "阆中市",
                "511382": "其它区",
                "511400": "眉山市",
                "511402": "东坡区",
                "511421": "仁寿县",
                "511422": "彭山县",
                "511423": "洪雅县",
                "511424": "丹棱县",
                "511425": "青神县",
                "511426": "其它区",
                "511500": "宜宾市",
                "511502": "翠屏区",
                "511521": "宜宾县",
                "511522": "南溪区",
                "511523": "江安县",
                "511524": "长宁县",
                "511525": "高县",
                "511526": "珙县",
                "511527": "筠连县",
                "511528": "兴文县",
                "511529": "屏山县",
                "511530": "其它区",
                "511600": "广安市",
                "511602": "广安区",
                "511603": "前锋区",
                "511621": "岳池县",
                "511622": "武胜县",
                "511623": "邻水县",
                "511681": "华蓥市",
                "511683": "其它区",
                "511700": "达州市",
                "511702": "通川区",
                "511721": "达川区",
                "511722": "宣汉县",
                "511723": "开江县",
                "511724": "大竹县",
                "511725": "渠县",
                "511781": "万源市",
                "511782": "其它区",
                "511800": "雅安市",
                "511802": "雨城区",
                "511821": "名山区",
                "511822": "荥经县",
                "511823": "汉源县",
                "511824": "石棉县",
                "511825": "天全县",
                "511826": "芦山县",
                "511827": "宝兴县",
                "511828": "其它区",
                "511900": "巴中市",
                "511902": "巴州区",
                "511903": "恩阳区",
                "511921": "通江县",
                "511922": "南江县",
                "511923": "平昌县",
                "511924": "其它区",
                "512000": "资阳市",
                "512002": "雁江区",
                "512021": "安岳县",
                "512022": "乐至县",
                "512081": "简阳市",
                "512082": "其它区",
                "513200": "阿坝藏族羌族自治州",
                "513221": "汶川县",
                "513222": "理县",
                "513223": "茂县",
                "513224": "松潘县",
                "513225": "九寨沟县",
                "513226": "金川县",
                "513227": "小金县",
                "513228": "黑水县",
                "513229": "马尔康县",
                "513230": "壤塘县",
                "513231": "阿坝县",
                "513232": "若尔盖县",
                "513233": "红原县",
                "513234": "其它区",
                "513300": "甘孜藏族自治州",
                "513321": "康定县",
                "513322": "泸定县",
                "513323": "丹巴县",
                "513324": "九龙县",
                "513325": "雅江县",
                "513326": "道孚县",
                "513327": "炉霍县",
                "513328": "甘孜县",
                "513329": "新龙县",
                "513330": "德格县",
                "513331": "白玉县",
                "513332": "石渠县",
                "513333": "色达县",
                "513334": "理塘县",
                "513335": "巴塘县",
                "513336": "乡城县",
                "513337": "稻城县",
                "513338": "得荣县",
                "513339": "其它区",
                "513400": "凉山彝族自治州",
                "513401": "西昌市",
                "513422": "木里藏族自治县",
                "513423": "盐源县",
                "513424": "德昌县",
                "513425": "会理县",
                "513426": "会东县",
                "513427": "宁南县",
                "513428": "普格县",
                "513429": "布拖县",
                "513430": "金阳县",
                "513431": "昭觉县",
                "513432": "喜德县",
                "513433": "冕宁县",
                "513434": "越西县",
                "513435": "甘洛县",
                "513436": "美姑县",
                "513437": "雷波县",
                "513438": "其它区",
                "520000": "贵州省",
                "520100": "贵阳市",
                "520102": "南明区",
                "520103": "云岩区",
                "520111": "花溪区",
                "520112": "乌当区",
                "520113": "白云区",
                "520121": "开阳县",
                "520122": "息烽县",
                "520123": "修文县",
                "520151": "观山湖区",
                "520181": "清镇市",
                "520182": "其它区",
                "520200": "六盘水市",
                "520201": "钟山区",
                "520203": "六枝特区",
                "520221": "水城县",
                "520222": "盘县",
                "520223": "其它区",
                "520300": "遵义市",
                "520302": "红花岗区",
                "520303": "汇川区",
                "520321": "遵义县",
                "520322": "桐梓县",
                "520323": "绥阳县",
                "520324": "正安县",
                "520325": "道真仡佬族苗族自治县",
                "520326": "务川仡佬族苗族自治县",
                "520327": "凤冈县",
                "520328": "湄潭县",
                "520329": "余庆县",
                "520330": "习水县",
                "520381": "赤水市",
                "520382": "仁怀市",
                "520383": "其它区",
                "520400": "安顺市",
                "520402": "西秀区",
                "520421": "平坝县",
                "520422": "普定县",
                "520423": "镇宁布依族苗族自治县",
                "520424": "关岭布依族苗族自治县",
                "520425": "紫云苗族布依族自治县",
                "520426": "其它区",
                "522200": "铜仁市",
                "522201": "碧江区",
                "522222": "江口县",
                "522223": "玉屏侗族自治县",
                "522224": "石阡县",
                "522225": "思南县",
                "522226": "印江土家族苗族自治县",
                "522227": "德江县",
                "522228": "沿河土家族自治县",
                "522229": "松桃苗族自治县",
                "522230": "万山区",
                "522231": "其它区",
                "522300": "黔西南布依族苗族自治州",
                "522301": "兴义市",
                "522322": "兴仁县",
                "522323": "普安县",
                "522324": "晴隆县",
                "522325": "贞丰县",
                "522326": "望谟县",
                "522327": "册亨县",
                "522328": "安龙县",
                "522329": "其它区",
                "522400": "毕节市",
                "522401": "七星关区",
                "522422": "大方县",
                "522423": "黔西县",
                "522424": "金沙县",
                "522425": "织金县",
                "522426": "纳雍县",
                "522427": "威宁彝族回族苗族自治县",
                "522428": "赫章县",
                "522429": "其它区",
                "522600": "黔东南苗族侗族自治州",
                "522601": "凯里市",
                "522622": "黄平县",
                "522623": "施秉县",
                "522624": "三穗县",
                "522625": "镇远县",
                "522626": "岑巩县",
                "522627": "天柱县",
                "522628": "锦屏县",
                "522629": "剑河县",
                "522630": "台江县",
                "522631": "黎平县",
                "522632": "榕江县",
                "522633": "从江县",
                "522634": "雷山县",
                "522635": "麻江县",
                "522636": "丹寨县",
                "522637": "其它区",
                "522700": "黔南布依族苗族自治州",
                "522701": "都匀市",
                "522702": "福泉市",
                "522722": "荔波县",
                "522723": "贵定县",
                "522725": "瓮安县",
                "522726": "独山县",
                "522727": "平塘县",
                "522728": "罗甸县",
                "522729": "长顺县",
                "522730": "龙里县",
                "522731": "惠水县",
                "522732": "三都水族自治县",
                "522733": "其它区",
                "530000": "云南省",
                "530100": "昆明市",
                "530102": "五华区",
                "530103": "盘龙区",
                "530111": "官渡区",
                "530112": "西山区",
                "530113": "东川区",
                "530121": "呈贡区",
                "530122": "晋宁县",
                "530124": "富民县",
                "530125": "宜良县",
                "530126": "石林彝族自治县",
                "530127": "嵩明县",
                "530128": "禄劝彝族苗族自治县",
                "530129": "寻甸回族彝族自治县",
                "530181": "安宁市",
                "530182": "其它区",
                "530300": "曲靖市",
                "530302": "麒麟区",
                "530321": "马龙县",
                "530322": "陆良县",
                "530323": "师宗县",
                "530324": "罗平县",
                "530325": "富源县",
                "530326": "会泽县",
                "530328": "沾益县",
                "530381": "宣威市",
                "530382": "其它区",
                "530400": "玉溪市",
                "530402": "红塔区",
                "530421": "江川县",
                "530422": "澄江县",
                "530423": "通海县",
                "530424": "华宁县",
                "530425": "易门县",
                "530426": "峨山彝族自治县",
                "530427": "新平彝族傣族自治县",
                "530428": "元江哈尼族彝族傣族自治县",
                "530429": "其它区",
                "530500": "保山市",
                "530502": "隆阳区",
                "530521": "施甸县",
                "530522": "腾冲县",
                "530523": "龙陵县",
                "530524": "昌宁县",
                "530525": "其它区",
                "530600": "昭通市",
                "530602": "昭阳区",
                "530621": "鲁甸县",
                "530622": "巧家县",
                "530623": "盐津县",
                "530624": "大关县",
                "530625": "永善县",
                "530626": "绥江县",
                "530627": "镇雄县",
                "530628": "彝良县",
                "530629": "威信县",
                "530630": "水富县",
                "530631": "其它区",
                "530700": "丽江市",
                "530702": "古城区",
                "530721": "玉龙纳西族自治县",
                "530722": "永胜县",
                "530723": "华坪县",
                "530724": "宁蒗彝族自治县",
                "530725": "其它区",
                "530800": "普洱市",
                "530802": "思茅区",
                "530821": "宁洱哈尼族彝族自治县",
                "530822": "墨江哈尼族自治县",
                "530823": "景东彝族自治县",
                "530824": "景谷傣族彝族自治县",
                "530825": "镇沅彝族哈尼族拉祜族自治县",
                "530826": "江城哈尼族彝族自治县",
                "530827": "孟连傣族拉祜族佤族自治县",
                "530828": "澜沧拉祜族自治县",
                "530829": "西盟佤族自治县",
                "530830": "其它区",
                "530900": "临沧市",
                "530902": "临翔区",
                "530921": "凤庆县",
                "530922": "云县",
                "530923": "永德县",
                "530924": "镇康县",
                "530925": "双江拉祜族佤族布朗族傣族自治县",
                "530926": "耿马傣族佤族自治县",
                "530927": "沧源佤族自治县",
                "530928": "其它区",
                "532300": "楚雄彝族自治州",
                "532301": "楚雄市",
                "532322": "双柏县",
                "532323": "牟定县",
                "532324": "南华县",
                "532325": "姚安县",
                "532326": "大姚县",
                "532327": "永仁县",
                "532328": "元谋县",
                "532329": "武定县",
                "532331": "禄丰县",
                "532332": "其它区",
                "532500": "红河哈尼族彝族自治州",
                "532501": "个旧市",
                "532502": "开远市",
                "532522": "蒙自市",
                "532523": "屏边苗族自治县",
                "532524": "建水县",
                "532525": "石屏县",
                "532526": "弥勒市",
                "532527": "泸西县",
                "532528": "元阳县",
                "532529": "红河县",
                "532530": "金平苗族瑶族傣族自治县",
                "532531": "绿春县",
                "532532": "河口瑶族自治县",
                "532533": "其它区",
                "532600": "文山壮族苗族自治州",
                "532621": "文山市",
                "532622": "砚山县",
                "532623": "西畴县",
                "532624": "麻栗坡县",
                "532625": "马关县",
                "532626": "丘北县",
                "532627": "广南县",
                "532628": "富宁县",
                "532629": "其它区",
                "532800": "西双版纳傣族自治州",
                "532801": "景洪市",
                "532822": "勐海县",
                "532823": "勐腊县",
                "532824": "其它区",
                "532900": "大理白族自治州",
                "532901": "大理市",
                "532922": "漾濞彝族自治县",
                "532923": "祥云县",
                "532924": "宾川县",
                "532925": "弥渡县",
                "532926": "南涧彝族自治县",
                "532927": "巍山彝族回族自治县",
                "532928": "永平县",
                "532929": "云龙县",
                "532930": "洱源县",
                "532931": "剑川县",
                "532932": "鹤庆县",
                "532933": "其它区",
                "533100": "德宏傣族景颇族自治州",
                "533102": "瑞丽市",
                "533103": "芒市",
                "533122": "梁河县",
                "533123": "盈江县",
                "533124": "陇川县",
                "533125": "其它区",
                "533300": "怒江傈僳族自治州",
                "533321": "泸水县",
                "533323": "福贡县",
                "533324": "贡山独龙族怒族自治县",
                "533325": "兰坪白族普米族自治县",
                "533326": "其它区",
                "533400": "迪庆藏族自治州",
                "533421": "香格里拉县",
                "533422": "德钦县",
                "533423": "维西傈僳族自治县",
                "533424": "其它区",
                "540000": "西藏自治区",
                "540100": "拉萨市",
                "540102": "城关区",
                "540121": "林周县",
                "540122": "当雄县",
                "540123": "尼木县",
                "540124": "曲水县",
                "540125": "堆龙德庆县",
                "540126": "达孜县",
                "540127": "墨竹工卡县",
                "540128": "其它区",
                "542100": "昌都地区",
                "542121": "昌都县",
                "542122": "江达县",
                "542123": "贡觉县",
                "542124": "类乌齐县",
                "542125": "丁青县",
                "542126": "察雅县",
                "542127": "八宿县",
                "542128": "左贡县",
                "542129": "芒康县",
                "542132": "洛隆县",
                "542133": "边坝县",
                "542134": "其它区",
                "542200": "山南地区",
                "542221": "乃东县",
                "542222": "扎囊县",
                "542223": "贡嘎县",
                "542224": "桑日县",
                "542225": "琼结县",
                "542226": "曲松县",
                "542227": "措美县",
                "542228": "洛扎县",
                "542229": "加查县",
                "542231": "隆子县",
                "542232": "错那县",
                "542233": "浪卡子县",
                "542234": "其它区",
                "542300": "日喀则地区",
                "542301": "日喀则市",
                "542322": "南木林县",
                "542323": "江孜县",
                "542324": "定日县",
                "542325": "萨迦县",
                "542326": "拉孜县",
                "542327": "昂仁县",
                "542328": "谢通门县",
                "542329": "白朗县",
                "542330": "仁布县",
                "542331": "康马县",
                "542332": "定结县",
                "542333": "仲巴县",
                "542334": "亚东县",
                "542335": "吉隆县",
                "542336": "聂拉木县",
                "542337": "萨嘎县",
                "542338": "岗巴县",
                "542339": "其它区",
                "542400": "那曲地区",
                "542421": "那曲县",
                "542422": "嘉黎县",
                "542423": "比如县",
                "542424": "聂荣县",
                "542425": "安多县",
                "542426": "申扎县",
                "542427": "索县",
                "542428": "班戈县",
                "542429": "巴青县",
                "542430": "尼玛县",
                "542431": "其它区",
                "542432": "双湖县",
                "542500": "阿里地区",
                "542521": "普兰县",
                "542522": "札达县",
                "542523": "噶尔县",
                "542524": "日土县",
                "542525": "革吉县",
                "542526": "改则县",
                "542527": "措勤县",
                "542528": "其它区",
                "542600": "林芝地区",
                "542621": "林芝县",
                "542622": "工布江达县",
                "542623": "米林县",
                "542624": "墨脱县",
                "542625": "波密县",
                "542626": "察隅县",
                "542627": "朗县",
                "542628": "其它区",
                "610000": "陕西省",
                "610100": "西安市",
                "610102": "新城区",
                "610103": "碑林区",
                "610104": "莲湖区",
                "610111": "灞桥区",
                "610112": "未央区",
                "610113": "雁塔区",
                "610114": "阎良区",
                "610115": "临潼区",
                "610116": "长安区",
                "610122": "蓝田县",
                "610124": "周至县",
                "610125": "户县",
                "610126": "高陵县",
                "610127": "其它区",
                "610200": "铜川市",
                "610202": "王益区",
                "610203": "印台区",
                "610204": "耀州区",
                "610222": "宜君县",
                "610223": "其它区",
                "610300": "宝鸡市",
                "610302": "渭滨区",
                "610303": "金台区",
                "610304": "陈仓区",
                "610322": "凤翔县",
                "610323": "岐山县",
                "610324": "扶风县",
                "610326": "眉县",
                "610327": "陇县",
                "610328": "千阳县",
                "610329": "麟游县",
                "610330": "凤县",
                "610331": "太白县",
                "610332": "其它区",
                "610400": "咸阳市",
                "610402": "秦都区",
                "610403": "杨陵区",
                "610404": "渭城区",
                "610422": "三原县",
                "610423": "泾阳县",
                "610424": "乾县",
                "610425": "礼泉县",
                "610426": "永寿县",
                "610427": "彬县",
                "610428": "长武县",
                "610429": "旬邑县",
                "610430": "淳化县",
                "610431": "武功县",
                "610481": "兴平市",
                "610482": "其它区",
                "610500": "渭南市",
                "610502": "临渭区",
                "610521": "华县",
                "610522": "潼关县",
                "610523": "大荔县",
                "610524": "合阳县",
                "610525": "澄城县",
                "610526": "蒲城县",
                "610527": "白水县",
                "610528": "富平县",
                "610581": "韩城市",
                "610582": "华阴市",
                "610583": "其它区",
                "610600": "延安市",
                "610602": "宝塔区",
                "610621": "延长县",
                "610622": "延川县",
                "610623": "子长县",
                "610624": "安塞县",
                "610625": "志丹县",
                "610626": "吴起县",
                "610627": "甘泉县",
                "610628": "富县",
                "610629": "洛川县",
                "610630": "宜川县",
                "610631": "黄龙县",
                "610632": "黄陵县",
                "610633": "其它区",
                "610700": "汉中市",
                "610702": "汉台区",
                "610721": "南郑县",
                "610722": "城固县",
                "610723": "洋县",
                "610724": "西乡县",
                "610725": "勉县",
                "610726": "宁强县",
                "610727": "略阳县",
                "610728": "镇巴县",
                "610729": "留坝县",
                "610730": "佛坪县",
                "610731": "其它区",
                "610800": "榆林市",
                "610802": "榆阳区",
                "610821": "神木县",
                "610822": "府谷县",
                "610823": "横山县",
                "610824": "靖边县",
                "610825": "定边县",
                "610826": "绥德县",
                "610827": "米脂县",
                "610828": "佳县",
                "610829": "吴堡县",
                "610830": "清涧县",
                "610831": "子洲县",
                "610832": "其它区",
                "610900": "安康市",
                "610902": "汉滨区",
                "610921": "汉阴县",
                "610922": "石泉县",
                "610923": "宁陕县",
                "610924": "紫阳县",
                "610925": "岚皋县",
                "610926": "平利县",
                "610927": "镇坪县",
                "610928": "旬阳县",
                "610929": "白河县",
                "610930": "其它区",
                "611000": "商洛市",
                "611002": "商州区",
                "611021": "洛南县",
                "611022": "丹凤县",
                "611023": "商南县",
                "611024": "山阳县",
                "611025": "镇安县",
                "611026": "柞水县",
                "611027": "其它区",
                "620000": "甘肃省",
                "620100": "兰州市",
                "620102": "城关区",
                "620103": "七里河区",
                "620104": "西固区",
                "620105": "安宁区",
                "620111": "红古区",
                "620121": "永登县",
                "620122": "皋兰县",
                "620123": "榆中县",
                "620124": "其它区",
                "620200": "嘉峪关市",
                "620300": "金昌市",
                "620302": "金川区",
                "620321": "永昌县",
                "620322": "其它区",
                "620400": "白银市",
                "620402": "白银区",
                "620403": "平川区",
                "620421": "靖远县",
                "620422": "会宁县",
                "620423": "景泰县",
                "620424": "其它区",
                "620500": "天水市",
                "620502": "秦州区",
                "620503": "麦积区",
                "620521": "清水县",
                "620522": "秦安县",
                "620523": "甘谷县",
                "620524": "武山县",
                "620525": "张家川回族自治县",
                "620526": "其它区",
                "620600": "武威市",
                "620602": "凉州区",
                "620621": "民勤县",
                "620622": "古浪县",
                "620623": "天祝藏族自治县",
                "620624": "其它区",
                "620700": "张掖市",
                "620702": "甘州区",
                "620721": "肃南裕固族自治县",
                "620722": "民乐县",
                "620723": "临泽县",
                "620724": "高台县",
                "620725": "山丹县",
                "620726": "其它区",
                "620800": "平凉市",
                "620802": "崆峒区",
                "620821": "泾川县",
                "620822": "灵台县",
                "620823": "崇信县",
                "620824": "华亭县",
                "620825": "庄浪县",
                "620826": "静宁县",
                "620827": "其它区",
                "620900": "酒泉市",
                "620902": "肃州区",
                "620921": "金塔县",
                "620922": "瓜州县",
                "620923": "肃北蒙古族自治县",
                "620924": "阿克塞哈萨克族自治县",
                "620981": "玉门市",
                "620982": "敦煌市",
                "620983": "其它区",
                "621000": "庆阳市",
                "621002": "西峰区",
                "621021": "庆城县",
                "621022": "环县",
                "621023": "华池县",
                "621024": "合水县",
                "621025": "正宁县",
                "621026": "宁县",
                "621027": "镇原县",
                "621028": "其它区",
                "621100": "定西市",
                "621102": "安定区",
                "621121": "通渭县",
                "621122": "陇西县",
                "621123": "渭源县",
                "621124": "临洮县",
                "621125": "漳县",
                "621126": "岷县",
                "621127": "其它区",
                "621200": "陇南市",
                "621202": "武都区",
                "621221": "成县",
                "621222": "文县",
                "621223": "宕昌县",
                "621224": "康县",
                "621225": "西和县",
                "621226": "礼县",
                "621227": "徽县",
                "621228": "两当县",
                "621229": "其它区",
                "622900": "临夏回族自治州",
                "622901": "临夏市",
                "622921": "临夏县",
                "622922": "康乐县",
                "622923": "永靖县",
                "622924": "广河县",
                "622925": "和政县",
                "622926": "东乡族自治县",
                "622927": "积石山保安族东乡族撒拉族自治县",
                "622928": "其它区",
                "623000": "甘南藏族自治州",
                "623001": "合作市",
                "623021": "临潭县",
                "623022": "卓尼县",
                "623023": "舟曲县",
                "623024": "迭部县",
                "623025": "玛曲县",
                "623026": "碌曲县",
                "623027": "夏河县",
                "623028": "其它区",
                "630000": "青海省",
                "630100": "西宁市",
                "630102": "城东区",
                "630103": "城中区",
                "630104": "城西区",
                "630105": "城北区",
                "630121": "大通回族土族自治县",
                "630122": "湟中县",
                "630123": "湟源县",
                "630124": "其它区",
                "632100": "海东市",
                "632121": "平安县",
                "632122": "民和回族土族自治县",
                "632123": "乐都区",
                "632126": "互助土族自治县",
                "632127": "化隆回族自治县",
                "632128": "循化撒拉族自治县",
                "632129": "其它区",
                "632200": "海北藏族自治州",
                "632221": "门源回族自治县",
                "632222": "祁连县",
                "632223": "海晏县",
                "632224": "刚察县",
                "632225": "其它区",
                "632300": "黄南藏族自治州",
                "632321": "同仁县",
                "632322": "尖扎县",
                "632323": "泽库县",
                "632324": "河南蒙古族自治县",
                "632325": "其它区",
                "632500": "海南藏族自治州",
                "632521": "共和县",
                "632522": "同德县",
                "632523": "贵德县",
                "632524": "兴海县",
                "632525": "贵南县",
                "632526": "其它区",
                "632600": "果洛藏族自治州",
                "632621": "玛沁县",
                "632622": "班玛县",
                "632623": "甘德县",
                "632624": "达日县",
                "632625": "久治县",
                "632626": "玛多县",
                "632627": "其它区",
                "632700": "玉树藏族自治州",
                "632721": "玉树市",
                "632722": "杂多县",
                "632723": "称多县",
                "632724": "治多县",
                "632725": "囊谦县",
                "632726": "曲麻莱县",
                "632727": "其它区",
                "632800": "海西蒙古族藏族自治州",
                "632801": "格尔木市",
                "632802": "德令哈市",
                "632821": "乌兰县",
                "632822": "都兰县",
                "632823": "天峻县",
                "632824": "其它区",
                "640000": "宁夏回族自治区",
                "640100": "银川市",
                "640104": "兴庆区",
                "640105": "西夏区",
                "640106": "金凤区",
                "640121": "永宁县",
                "640122": "贺兰县",
                "640181": "灵武市",
                "640182": "其它区",
                "640200": "石嘴山市",
                "640202": "大武口区",
                "640205": "惠农区",
                "640221": "平罗县",
                "640222": "其它区",
                "640300": "吴忠市",
                "640302": "利通区",
                "640303": "红寺堡区",
                "640323": "盐池县",
                "640324": "同心县",
                "640381": "青铜峡市",
                "640382": "其它区",
                "640400": "固原市",
                "640402": "原州区",
                "640422": "西吉县",
                "640423": "隆德县",
                "640424": "泾源县",
                "640425": "彭阳县",
                "640426": "其它区",
                "640500": "中卫市",
                "640502": "沙坡头区",
                "640521": "中宁县",
                "640522": "海原县",
                "640523": "其它区",
                "650000": "新疆维吾尔自治区",
                "650100": "乌鲁木齐市",
                "650102": "天山区",
                "650103": "沙依巴克区",
                "650104": "新市区",
                "650105": "水磨沟区",
                "650106": "头屯河区",
                "650107": "达坂城区",
                "650109": "米东区",
                "650121": "乌鲁木齐县",
                "650122": "其它区",
                "650200": "克拉玛依市",
                "650202": "独山子区",
                "650203": "克拉玛依区",
                "650204": "白碱滩区",
                "650205": "乌尔禾区",
                "650206": "其它区",
                "652100": "吐鲁番地区",
                "652101": "吐鲁番市",
                "652122": "鄯善县",
                "652123": "托克逊县",
                "652124": "其它区",
                "652200": "哈密地区",
                "652201": "哈密市",
                "652222": "巴里坤哈萨克自治县",
                "652223": "伊吾县",
                "652224": "其它区",
                "652300": "昌吉回族自治州",
                "652301": "昌吉市",
                "652302": "阜康市",
                "652323": "呼图壁县",
                "652324": "玛纳斯县",
                "652325": "奇台县",
                "652327": "吉木萨尔县",
                "652328": "木垒哈萨克自治县",
                "652329": "其它区",
                "652700": "博尔塔拉蒙古自治州",
                "652701": "博乐市",
                "652702": "阿拉山口市",
                "652722": "精河县",
                "652723": "温泉县",
                "652724": "其它区",
                "652800": "巴音郭楞蒙古自治州",
                "652801": "库尔勒市",
                "652822": "轮台县",
                "652823": "尉犁县",
                "652824": "若羌县",
                "652825": "且末县",
                "652826": "焉耆回族自治县",
                "652827": "和静县",
                "652828": "和硕县",
                "652829": "博湖县",
                "652830": "其它区",
                "652900": "阿克苏地区",
                "652901": "阿克苏市",
                "652922": "温宿县",
                "652923": "库车县",
                "652924": "沙雅县",
                "652925": "新和县",
                "652926": "拜城县",
                "652927": "乌什县",
                "652928": "阿瓦提县",
                "652929": "柯坪县",
                "652930": "其它区",
                "653000": "克孜勒苏柯尔克孜自治州",
                "653001": "阿图什市",
                "653022": "阿克陶县",
                "653023": "阿合奇县",
                "653024": "乌恰县",
                "653025": "其它区",
                "653100": "喀什地区",
                "653101": "喀什市",
                "653121": "疏附县",
                "653122": "疏勒县",
                "653123": "英吉沙县",
                "653124": "泽普县",
                "653125": "莎车县",
                "653126": "叶城县",
                "653127": "麦盖提县",
                "653128": "岳普湖县",
                "653129": "伽师县",
                "653130": "巴楚县",
                "653131": "塔什库尔干塔吉克自治县",
                "653132": "其它区",
                "653200": "和田地区",
                "653201": "和田市",
                "653221": "和田县",
                "653222": "墨玉县",
                "653223": "皮山县",
                "653224": "洛浦县",
                "653225": "策勒县",
                "653226": "于田县",
                "653227": "民丰县",
                "653228": "其它区",
                "654000": "伊犁哈萨克自治州",
                "654002": "伊宁市",
                "654003": "奎屯市",
                "654021": "伊宁县",
                "654022": "察布查尔锡伯自治县",
                "654023": "霍城县",
                "654024": "巩留县",
                "654025": "新源县",
                "654026": "昭苏县",
                "654027": "特克斯县",
                "654028": "尼勒克县",
                "654029": "其它区",
                "654200": "塔城地区",
                "654201": "塔城市",
                "654202": "乌苏市",
                "654221": "额敏县",
                "654223": "沙湾县",
                "654224": "托里县",
                "654225": "裕民县",
                "654226": "和布克赛尔蒙古自治县",
                "654227": "其它区",
                "654300": "阿勒泰地区",
                "654301": "阿勒泰市",
                "654321": "布尔津县",
                "654322": "富蕴县",
                "654323": "福海县",
                "654324": "哈巴河县",
                "654325": "青河县",
                "654326": "吉木乃县",
                "654327": "其它区",
                "659001": "石河子市",
                "659002": "阿拉尔市",
                "659003": "图木舒克市",
                "659004": "五家渠市",
                "710000": "台湾",
                "710100": "台北市",
                "710101": "中正区",
                "710102": "大同区",
                "710103": "中山区",
                "710104": "松山区",
                "710105": "大安区",
                "710106": "万华区",
                "710107": "信义区",
                "710108": "士林区",
                "710109": "北投区",
                "710110": "内湖区",
                "710111": "南港区",
                "710112": "文山区",
                "710113": "其它区",
                "710200": "高雄市",
                "710201": "新兴区",
                "710202": "前金区",
                "710203": "芩雅区",
                "710204": "盐埕区",
                "710205": "鼓山区",
                "710206": "旗津区",
                "710207": "前镇区",
                "710208": "三民区",
                "710209": "左营区",
                "710210": "楠梓区",
                "710211": "小港区",
                "710212": "其它区",
                "710241": "苓雅区",
                "710242": "仁武区",
                "710243": "大社区",
                "710244": "冈山区",
                "710245": "路竹区",
                "710246": "阿莲区",
                "710247": "田寮区",
                "710248": "燕巢区",
                "710249": "桥头区",
                "710250": "梓官区",
                "710251": "弥陀区",
                "710252": "永安区",
                "710253": "湖内区",
                "710254": "凤山区",
                "710255": "大寮区",
                "710256": "林园区",
                "710257": "鸟松区",
                "710258": "大树区",
                "710259": "旗山区",
                "710260": "美浓区",
                "710261": "六龟区",
                "710262": "内门区",
                "710263": "杉林区",
                "710264": "甲仙区",
                "710265": "桃源区",
                "710266": "那玛夏区",
                "710267": "茂林区",
                "710268": "茄萣区",
                "710300": "台南市",
                "710301": "中西区",
                "710302": "东区",
                "710303": "南区",
                "710304": "北区",
                "710305": "安平区",
                "710306": "安南区",
                "710307": "其它区",
                "710339": "永康区",
                "710340": "归仁区",
                "710341": "新化区",
                "710342": "左镇区",
                "710343": "玉井区",
                "710344": "楠西区",
                "710345": "南化区",
                "710346": "仁德区",
                "710347": "关庙区",
                "710348": "龙崎区",
                "710349": "官田区",
                "710350": "麻豆区",
                "710351": "佳里区",
                "710352": "西港区",
                "710353": "七股区",
                "710354": "将军区",
                "710355": "学甲区",
                "710356": "北门区",
                "710357": "新营区",
                "710358": "后壁区",
                "710359": "白河区",
                "710360": "东山区",
                "710361": "六甲区",
                "710362": "下营区",
                "710363": "柳营区",
                "710364": "盐水区",
                "710365": "善化区",
                "710366": "大内区",
                "710367": "山上区",
                "710368": "新市区",
                "710369": "安定区",
                "710400": "台中市",
                "710401": "中区",
                "710402": "东区",
                "710403": "南区",
                "710404": "西区",
                "710405": "北区",
                "710406": "北屯区",
                "710407": "西屯区",
                "710408": "南屯区",
                "710409": "其它区",
                "710431": "太平区",
                "710432": "大里区",
                "710433": "雾峰区",
                "710434": "乌日区",
                "710435": "丰原区",
                "710436": "后里区",
                "710437": "石冈区",
                "710438": "东势区",
                "710439": "和平区",
                "710440": "新社区",
                "710441": "潭子区",
                "710442": "大雅区",
                "710443": "神冈区",
                "710444": "大肚区",
                "710445": "沙鹿区",
                "710446": "龙井区",
                "710447": "梧栖区",
                "710448": "清水区",
                "710449": "大甲区",
                "710450": "外埔区",
                "710451": "大安区",
                "710500": "金门县",
                "710507": "金沙镇",
                "710508": "金湖镇",
                "710509": "金宁乡",
                "710510": "金城镇",
                "710511": "烈屿乡",
                "710512": "乌坵乡",
                "710600": "南投县",
                "710614": "南投市",
                "710615": "中寮乡",
                "710616": "草屯镇",
                "710617": "国姓乡",
                "710618": "埔里镇",
                "710619": "仁爱乡",
                "710620": "名间乡",
                "710621": "集集镇",
                "710622": "水里乡",
                "710623": "鱼池乡",
                "710624": "信义乡",
                "710625": "竹山镇",
                "710626": "鹿谷乡",
                "710700": "基隆市",
                "710701": "仁爱区",
                "710702": "信义区",
                "710703": "中正区",
                "710704": "中山区",
                "710705": "安乐区",
                "710706": "暖暖区",
                "710707": "七堵区",
                "710708": "其它区",
                "710800": "新竹市",
                "710801": "东区",
                "710802": "北区",
                "710803": "香山区",
                "710804": "其它区",
                "710900": "嘉义市",
                "710901": "东区",
                "710902": "西区",
                "710903": "其它区",
                "711100": "新北市",
                "711130": "万里区",
                "711131": "金山区",
                "711132": "板桥区",
                "711133": "汐止区",
                "711134": "深坑区",
                "711135": "石碇区",
                "711136": "瑞芳区",
                "711137": "平溪区",
                "711138": "双溪区",
                "711139": "贡寮区",
                "711140": "新店区",
                "711141": "坪林区",
                "711142": "乌来区",
                "711143": "永和区",
                "711144": "中和区",
                "711145": "土城区",
                "711146": "三峡区",
                "711147": "树林区",
                "711148": "莺歌区",
                "711149": "三重区",
                "711150": "新庄区",
                "711151": "泰山区",
                "711152": "林口区",
                "711153": "芦洲区",
                "711154": "五股区",
                "711155": "八里区",
                "711156": "淡水区",
                "711157": "三芝区",
                "711158": "石门区",
                "711200": "宜兰县",
                "711214": "宜兰市",
                "711215": "头城镇",
                "711216": "礁溪乡",
                "711217": "壮围乡",
                "711218": "员山乡",
                "711219": "罗东镇",
                "711220": "三星乡",
                "711221": "大同乡",
                "711222": "五结乡",
                "711223": "冬山乡",
                "711224": "苏澳镇",
                "711225": "南澳乡",
                "711226": "钓鱼台",
                "711300": "新竹县",
                "711314": "竹北市",
                "711315": "湖口乡",
                "711316": "新丰乡",
                "711317": "新埔镇",
                "711318": "关西镇",
                "711319": "芎林乡",
                "711320": "宝山乡",
                "711321": "竹东镇",
                "711322": "五峰乡",
                "711323": "横山乡",
                "711324": "尖石乡",
                "711325": "北埔乡",
                "711326": "峨眉乡",
                "711400": "桃园县",
                "711414": "中坜市",
                "711415": "平镇市",
                "711416": "龙潭乡",
                "711417": "杨梅市",
                "711418": "新屋乡",
                "711419": "观音乡",
                "711420": "桃园市",
                "711421": "龟山乡",
                "711422": "八德市",
                "711423": "大溪镇",
                "711424": "复兴乡",
                "711425": "大园乡",
                "711426": "芦竹乡",
                "711500": "苗栗县",
                "711519": "竹南镇",
                "711520": "头份镇",
                "711521": "三湾乡",
                "711522": "南庄乡",
                "711523": "狮潭乡",
                "711524": "后龙镇",
                "711525": "通霄镇",
                "711526": "苑里镇",
                "711527": "苗栗市",
                "711528": "造桥乡",
                "711529": "头屋乡",
                "711530": "公馆乡",
                "711531": "大湖乡",
                "711532": "泰安乡",
                "711533": "铜锣乡",
                "711534": "三义乡",
                "711535": "西湖乡",
                "711536": "卓兰镇",
                "711700": "彰化县",
                "711727": "彰化市",
                "711728": "芬园乡",
                "711729": "花坛乡",
                "711730": "秀水乡",
                "711731": "鹿港镇",
                "711732": "福兴乡",
                "711733": "线西乡",
                "711734": "和美镇",
                "711735": "伸港乡",
                "711736": "员林镇",
                "711737": "社头乡",
                "711738": "永靖乡",
                "711739": "埔心乡",
                "711740": "溪湖镇",
                "711741": "大村乡",
                "711742": "埔盐乡",
                "711743": "田中镇",
                "711744": "北斗镇",
                "711745": "田尾乡",
                "711746": "埤头乡",
                "711747": "溪州乡",
                "711748": "竹塘乡",
                "711749": "二林镇",
                "711750": "大城乡",
                "711751": "芳苑乡",
                "711752": "二水乡",
                "711900": "嘉义县",
                "711919": "番路乡",
                "711920": "梅山乡",
                "711921": "竹崎乡",
                "711922": "阿里山乡",
                "711923": "中埔乡",
                "711924": "大埔乡",
                "711925": "水上乡",
                "711926": "鹿草乡",
                "711927": "太保市",
                "711928": "朴子市",
                "711929": "东石乡",
                "711930": "六脚乡",
                "711931": "新港乡",
                "711932": "民雄乡",
                "711933": "大林镇",
                "711934": "溪口乡",
                "711935": "义竹乡",
                "711936": "布袋镇",
                "712100": "云林县",
                "712121": "斗南镇",
                "712122": "大埤乡",
                "712123": "虎尾镇",
                "712124": "土库镇",
                "712125": "褒忠乡",
                "712126": "东势乡",
                "712127": "台西乡",
                "712128": "仑背乡",
                "712129": "麦寮乡",
                "712130": "斗六市",
                "712131": "林内乡",
                "712132": "古坑乡",
                "712133": "莿桐乡",
                "712134": "西螺镇",
                "712135": "二仑乡",
                "712136": "北港镇",
                "712137": "水林乡",
                "712138": "口湖乡",
                "712139": "四湖乡",
                "712140": "元长乡",
                "712400": "屏东县",
                "712434": "屏东市",
                "712435": "三地门乡",
                "712436": "雾台乡",
                "712437": "玛家乡",
                "712438": "九如乡",
                "712439": "里港乡",
                "712440": "高树乡",
                "712441": "盐埔乡",
                "712442": "长治乡",
                "712443": "麟洛乡",
                "712444": "竹田乡",
                "712445": "内埔乡",
                "712446": "万丹乡",
                "712447": "潮州镇",
                "712448": "泰武乡",
                "712449": "来义乡",
                "712450": "万峦乡",
                "712451": "崁顶乡",
                "712452": "新埤乡",
                "712453": "南州乡",
                "712454": "林边乡",
                "712455": "东港镇",
                "712456": "琉球乡",
                "712457": "佳冬乡",
                "712458": "新园乡",
                "712459": "枋寮乡",
                "712460": "枋山乡",
                "712461": "春日乡",
                "712462": "狮子乡",
                "712463": "车城乡",
                "712464": "牡丹乡",
                "712465": "恒春镇",
                "712466": "满州乡",
                "712500": "台东县",
                "712517": "台东市",
                "712518": "绿岛乡",
                "712519": "兰屿乡",
                "712520": "延平乡",
                "712521": "卑南乡",
                "712522": "鹿野乡",
                "712523": "关山镇",
                "712524": "海端乡",
                "712525": "池上乡",
                "712526": "东河乡",
                "712527": "成功镇",
                "712528": "长滨乡",
                "712529": "金峰乡",
                "712530": "大武乡",
                "712531": "达仁乡",
                "712532": "太麻里乡",
                "712600": "花莲县",
                "712615": "花莲市",
                "712616": "新城乡",
                "712617": "太鲁阁",
                "712618": "秀林乡",
                "712619": "吉安乡",
                "712620": "寿丰乡",
                "712621": "凤林镇",
                "712622": "光复乡",
                "712623": "丰滨乡",
                "712624": "瑞穗乡",
                "712625": "万荣乡",
                "712626": "玉里镇",
                "712627": "卓溪乡",
                "712628": "富里乡",
                "712700": "澎湖县",
                "712707": "马公市",
                "712708": "西屿乡",
                "712709": "望安乡",
                "712710": "七美乡",
                "712711": "白沙乡",
                "712712": "湖西乡",
                "712800": "连江县",
                "712805": "南竿乡",
                "712806": "北竿乡",
                "712807": "莒光乡",
                "712808": "东引乡",
                "810000": "香港特别行政区",
                "810100": "香港岛",
                "810101": "中西区",
                "810102": "湾仔",
                "810103": "东区",
                "810104": "南区",
                "810200": "九龙",
                "810201": "九龙城区",
                "810202": "油尖旺区",
                "810203": "深水埗区",
                "810204": "黄大仙区",
                "810205": "观塘区",
                "810300": "新界",
                "810301": "北区",
                "810302": "大埔区",
                "810303": "沙田区",
                "810304": "西贡区",
                "810305": "元朗区",
                "810306": "屯门区",
                "810307": "荃湾区",
                "810308": "葵青区",
                "810309": "离岛区",
                "820000": "澳门特别行政区",
                "820100": "澳门半岛",
                "820200": "离岛",
                "990000": "海外",
                "990100": "海外"
            };
            // id pid/parentId name children
            function tree(list) {
                var mapped = {};
                for(var i = 0, item; i < list.length; i++){
                    item = list[i];
                    if (!item || !item.id) continue;
                    mapped[item.id] = item;
                }
                var result = [];
                for(var ii = 0; ii < list.length; ii++){
                    item = list[ii];
                    if (!item) continue;
                    /* jshint -W041 */ if (item.pid == undefined && item.parentId == undefined) {
                        result.push(item);
                        continue;
                    }
                    var parent = mapped[item.pid] || mapped[item.parentId];
                    if (!parent) continue;
                    if (!parent.children) parent.children = [];
                    parent.children.push(item);
                }
                return result;
            }
            var DICT_FIXED = function() {
                var fixed = [];
                for(var id in DICT){
                    var pid = id.slice(2, 6) === '0000' ? undefined : id.slice(4, 6) == '00' ? id.slice(0, 2) + '0000' : id.slice(0, 4) + '00';
                    fixed.push({
                        id: id,
                        pid: pid,
                        name: DICT[id]
                    });
                }
                return tree(fixed);
            }();
            module1.exports = DICT_FIXED;
        /***/ },
        /* 19 */ /***/ function(module1, exports1, __nested_webpack_require_261314_261333__) {
            /*
	    ## Miscellaneous
	*/ var DICT = __nested_webpack_require_261314_261333__(18);
            module1.exports = {
                // Dice
                d4: function() {
                    return this.natural(1, 4);
                },
                d6: function() {
                    return this.natural(1, 6);
                },
                d8: function() {
                    return this.natural(1, 8);
                },
                d12: function() {
                    return this.natural(1, 12);
                },
                d20: function() {
                    return this.natural(1, 20);
                },
                d100: function() {
                    return this.natural(1, 100);
                },
                /*
		    随机生成一个 GUID。

		    http://www.broofa.com/2008/09/javascript-uuid-function/
		    [UUID 规范](http://www.ietf.org/rfc/rfc4122.txt)
		        UUIDs (Universally Unique IDentifier)
		        GUIDs (Globally Unique IDentifier)
		        The formal definition of the UUID string representation is provided by the following ABNF [7]:
		            UUID                   = time-low "-" time-mid "-"
		                                   time-high-and-version "-"
		                                   clock-seq-and-reserved
		                                   clock-seq-low "-" node
		            time-low               = 4hexOctet
		            time-mid               = 2hexOctet
		            time-high-and-version  = 2hexOctet
		            clock-seq-and-reserved = hexOctet
		            clock-seq-low          = hexOctet
		            node                   = 6hexOctet
		            hexOctet               = hexDigit hexDigit
		            hexDigit =
		                "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" /
		                "a" / "b" / "c" / "d" / "e" / "f" /
		                "A" / "B" / "C" / "D" / "E" / "F"
		    
		    https://github.com/victorquinn/chancejs/blob/develop/chance.js#L1349
		*/ guid: function() {
                    var pool = "abcdefABCDEF1234567890", guid = this.string(pool, 8) + '-' + this.string(pool, 4) + '-' + this.string(pool, 4) + '-' + this.string(pool, 4) + '-' + this.string(pool, 12);
                    return guid;
                },
                uuid: function() {
                    return this.guid();
                },
                /*
		    随机生成一个 18 位身份证。

		    [身份证](http://baike.baidu.com/view/1697.htm#4)
		        地址码 6 + 出生日期码 8 + 顺序码 3 + 校验码 1
		    [《中华人民共和国行政区划代码》国家标准(GB/T2260)](http://zhidao.baidu.com/question/1954561.html)
		*/ id: function() {
                    var id, sum = 0, rank = [
                        "7",
                        "9",
                        "10",
                        "5",
                        "8",
                        "4",
                        "2",
                        "1",
                        "6",
                        "3",
                        "7",
                        "9",
                        "10",
                        "5",
                        "8",
                        "4",
                        "2"
                    ], last = [
                        "1",
                        "0",
                        "X",
                        "9",
                        "8",
                        "7",
                        "6",
                        "5",
                        "4",
                        "3",
                        "2"
                    ];
                    id = this.pick(DICT).id + this.date('yyyyMMdd') + this.string('number', 3);
                    for(var i = 0; i < id.length; i++){
                        sum += id[i] * rank[i];
                    }
                    id += last[sum % 11];
                    return id;
                },
                /*
		    生成一个全局的自增整数。
		    类似自增主键（auto increment primary key）。
		*/ increment: function() {
                    var key = 0;
                    return function(step) {
                        return key += +step || 1 // step?
                        ;
                    };
                }(),
                inc: function(step) {
                    return this.increment(step);
                }
            };
        /***/ },
        /* 20 */ /***/ function(module1, exports1, __nested_webpack_require_265811_265830__) {
            var Parser = __nested_webpack_require_265811_265830__(21);
            var Handler = __nested_webpack_require_265811_265830__(22);
            module1.exports = {
                Parser: Parser,
                Handler: Handler
            };
        /***/ },
        /* 21 */ /***/ function(module1, exports1) {
            // https://github.com/nuysoft/regexp
            // forked from https://github.com/ForbesLindesay/regexp
            function parse(n) {
                if ("string" != typeof n) {
                    var l = new TypeError("The regexp to parse must be represented as a string.");
                    throw l;
                }
                return index = 1, cgs = {}, parser.parse(n);
            }
            function Token(n) {
                this.type = n, this.offset = Token.offset(), this.text = Token.text();
            }
            function Alternate(n, l) {
                Token.call(this, "alternate"), this.left = n, this.right = l;
            }
            function Match(n) {
                Token.call(this, "match"), this.body = n.filter(Boolean);
            }
            function Group(n, l) {
                Token.call(this, n), this.body = l;
            }
            function CaptureGroup(n) {
                Group.call(this, "capture-group"), this.index = cgs[this.offset] || (cgs[this.offset] = index++), this.body = n;
            }
            function Quantified(n, l) {
                Token.call(this, "quantified"), this.body = n, this.quantifier = l;
            }
            function Quantifier(n, l) {
                Token.call(this, "quantifier"), this.min = n, this.max = l, this.greedy = !0;
            }
            function CharSet(n, l) {
                Token.call(this, "charset"), this.invert = n, this.body = l;
            }
            function CharacterRange(n, l) {
                Token.call(this, "range"), this.start = n, this.end = l;
            }
            function Literal(n) {
                Token.call(this, "literal"), this.body = n, this.escaped = this.body != this.text;
            }
            function Unicode(n) {
                Token.call(this, "unicode"), this.code = n.toUpperCase();
            }
            function Hex(n) {
                Token.call(this, "hex"), this.code = n.toUpperCase();
            }
            function Octal(n) {
                Token.call(this, "octal"), this.code = n.toUpperCase();
            }
            function BackReference(n) {
                Token.call(this, "back-reference"), this.code = n.toUpperCase();
            }
            function ControlCharacter(n) {
                Token.call(this, "control-character"), this.code = n.toUpperCase();
            }
            var parser = function() {
                function n(n, l) {
                    function u() {
                        this.constructor = n;
                    }
                    u.prototype = l.prototype, n.prototype = new u();
                }
                function l(n, l, u, t, r) {
                    function e(n, l) {
                        function u(n) {
                            function l(n) {
                                return n.charCodeAt(0).toString(16).toUpperCase();
                            }
                            return n.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(n) {
                                return "\\x0" + l(n);
                            }).replace(/[\x10-\x1F\x80-\xFF]/g, function(n) {
                                return "\\x" + l(n);
                            }).replace(/[\u0180-\u0FFF]/g, function(n) {
                                return "\\u0" + l(n);
                            }).replace(/[\u1080-\uFFFF]/g, function(n) {
                                return "\\u" + l(n);
                            });
                        }
                        var t, r;
                        switch(n.length){
                            case 0:
                                t = "end of input";
                                break;
                            case 1:
                                t = n[0];
                                break;
                            default:
                                t = n.slice(0, -1).join(", ") + " or " + n[n.length - 1];
                        }
                        return r = l ? '"' + u(l) + '"' : "end of input", "Expected " + t + " but " + r + " found.";
                    }
                    this.expected = n, this.found = l, this.offset = u, this.line = t, this.column = r, this.name = "SyntaxError", this.message = e(n, l);
                }
                function u(n) {
                    function u() {
                        return n.substring(Lt, qt);
                    }
                    function t() {
                        return Lt;
                    }
                    function r(l) {
                        function u(l, u, t) {
                            var r, e;
                            for(r = u; t > r; r++)e = n.charAt(r), "\n" === e ? (l.seenCR || l.line++, l.column = 1, l.seenCR = !1) : "\r" === e || "\u2028" === e || "\u2029" === e ? (l.line++, l.column = 1, l.seenCR = !0) : (l.column++, l.seenCR = !1);
                        }
                        return Mt !== l && (Mt > l && (Mt = 0, Dt = {
                            line: 1,
                            column: 1,
                            seenCR: !1
                        }), u(Dt, Mt, l), Mt = l), Dt;
                    }
                    function e(n) {
                        Ht > qt || (qt > Ht && (Ht = qt, Ot = []), Ot.push(n));
                    }
                    function o(n) {
                        var l = 0;
                        for(n.sort(); l < n.length;)n[l - 1] === n[l] ? n.splice(l, 1) : l++;
                    }
                    function c() {
                        var l, u, t, r, o;
                        return l = qt, u = i(), null !== u ? (t = qt, 124 === n.charCodeAt(qt) ? (r = fl, qt++) : (r = null, 0 === Wt && e(sl)), null !== r ? (o = c(), null !== o ? (r = [
                            r,
                            o
                        ], t = r) : (qt = t, t = il)) : (qt = t, t = il), null === t && (t = al), null !== t ? (Lt = l, u = hl(u, t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function i() {
                        var n, l, u, t, r;
                        if (n = qt, l = f(), null === l && (l = al), null !== l) if (u = qt, Wt++, t = d(), Wt--, null === t ? u = al : (qt = u, u = il), null !== u) {
                            for(t = [], r = h(), null === r && (r = a()); null !== r;)t.push(r), r = h(), null === r && (r = a());
                            null !== t ? (r = s(), null === r && (r = al), null !== r ? (Lt = n, l = dl(l, t, r), null === l ? (qt = n, n = l) : n = l) : (qt = n, n = il)) : (qt = n, n = il);
                        } else qt = n, n = il;
                        else qt = n, n = il;
                        return n;
                    }
                    function a() {
                        var n;
                        return n = x(), null === n && (n = Q(), null === n && (n = B())), n;
                    }
                    function f() {
                        var l, u;
                        return l = qt, 94 === n.charCodeAt(qt) ? (u = pl, qt++) : (u = null, 0 === Wt && e(vl)), null !== u && (Lt = l, u = wl()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function s() {
                        var l, u;
                        return l = qt, 36 === n.charCodeAt(qt) ? (u = Al, qt++) : (u = null, 0 === Wt && e(Cl)), null !== u && (Lt = l, u = gl()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function h() {
                        var n, l, u;
                        return n = qt, l = a(), null !== l ? (u = d(), null !== u ? (Lt = n, l = bl(l, u), null === l ? (qt = n, n = l) : n = l) : (qt = n, n = il)) : (qt = n, n = il), n;
                    }
                    function d() {
                        var n, l, u;
                        return Wt++, n = qt, l = p(), null !== l ? (u = k(), null === u && (u = al), null !== u ? (Lt = n, l = Tl(l, u), null === l ? (qt = n, n = l) : n = l) : (qt = n, n = il)) : (qt = n, n = il), Wt--, null === n && (l = null, 0 === Wt && e(kl)), n;
                    }
                    function p() {
                        var n;
                        return n = v(), null === n && (n = w(), null === n && (n = A(), null === n && (n = C(), null === n && (n = g(), null === n && (n = b()))))), n;
                    }
                    function v() {
                        var l, u, t, r, o, c;
                        return l = qt, 123 === n.charCodeAt(qt) ? (u = xl, qt++) : (u = null, 0 === Wt && e(yl)), null !== u ? (t = T(), null !== t ? (44 === n.charCodeAt(qt) ? (r = ml, qt++) : (r = null, 0 === Wt && e(Rl)), null !== r ? (o = T(), null !== o ? (125 === n.charCodeAt(qt) ? (c = Fl, qt++) : (c = null, 0 === Wt && e(Ql)), null !== c ? (Lt = l, u = Sl(t, o), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il)) : (qt = l, l = il)) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function w() {
                        var l, u, t, r;
                        return l = qt, 123 === n.charCodeAt(qt) ? (u = xl, qt++) : (u = null, 0 === Wt && e(yl)), null !== u ? (t = T(), null !== t ? (n.substr(qt, 2) === Ul ? (r = Ul, qt += 2) : (r = null, 0 === Wt && e(El)), null !== r ? (Lt = l, u = Gl(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function A() {
                        var l, u, t, r;
                        return l = qt, 123 === n.charCodeAt(qt) ? (u = xl, qt++) : (u = null, 0 === Wt && e(yl)), null !== u ? (t = T(), null !== t ? (125 === n.charCodeAt(qt) ? (r = Fl, qt++) : (r = null, 0 === Wt && e(Ql)), null !== r ? (Lt = l, u = Bl(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function C() {
                        var l, u;
                        return l = qt, 43 === n.charCodeAt(qt) ? (u = jl, qt++) : (u = null, 0 === Wt && e($l)), null !== u && (Lt = l, u = ql()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function g() {
                        var l, u;
                        return l = qt, 42 === n.charCodeAt(qt) ? (u = Ll, qt++) : (u = null, 0 === Wt && e(Ml)), null !== u && (Lt = l, u = Dl()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function b() {
                        var l, u;
                        return l = qt, 63 === n.charCodeAt(qt) ? (u = Hl, qt++) : (u = null, 0 === Wt && e(Ol)), null !== u && (Lt = l, u = Wl()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function k() {
                        var l;
                        return 63 === n.charCodeAt(qt) ? (l = Hl, qt++) : (l = null, 0 === Wt && e(Ol)), l;
                    }
                    function T() {
                        var l, u, t;
                        if (l = qt, u = [], zl.test(n.charAt(qt)) ? (t = n.charAt(qt), qt++) : (t = null, 0 === Wt && e(Il)), null !== t) for(; null !== t;)u.push(t), zl.test(n.charAt(qt)) ? (t = n.charAt(qt), qt++) : (t = null, 0 === Wt && e(Il));
                        else u = il;
                        return null !== u && (Lt = l, u = Jl(u)), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function x() {
                        var l, u, t, r;
                        return l = qt, 40 === n.charCodeAt(qt) ? (u = Kl, qt++) : (u = null, 0 === Wt && e(Nl)), null !== u ? (t = R(), null === t && (t = F(), null === t && (t = m(), null === t && (t = y()))), null !== t ? (41 === n.charCodeAt(qt) ? (r = Pl, qt++) : (r = null, 0 === Wt && e(Vl)), null !== r ? (Lt = l, u = Xl(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function y() {
                        var n, l;
                        return n = qt, l = c(), null !== l && (Lt = n, l = Yl(l)), null === l ? (qt = n, n = l) : n = l, n;
                    }
                    function m() {
                        var l, u, t;
                        return l = qt, n.substr(qt, 2) === Zl ? (u = Zl, qt += 2) : (u = null, 0 === Wt && e(_l)), null !== u ? (t = c(), null !== t ? (Lt = l, u = nu(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function R() {
                        var l, u, t;
                        return l = qt, n.substr(qt, 2) === lu ? (u = lu, qt += 2) : (u = null, 0 === Wt && e(uu)), null !== u ? (t = c(), null !== t ? (Lt = l, u = tu(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function F() {
                        var l, u, t;
                        return l = qt, n.substr(qt, 2) === ru ? (u = ru, qt += 2) : (u = null, 0 === Wt && e(eu)), null !== u ? (t = c(), null !== t ? (Lt = l, u = ou(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function Q() {
                        var l, u, t, r, o;
                        if (Wt++, l = qt, 91 === n.charCodeAt(qt) ? (u = iu, qt++) : (u = null, 0 === Wt && e(au)), null !== u) if (94 === n.charCodeAt(qt) ? (t = pl, qt++) : (t = null, 0 === Wt && e(vl)), null === t && (t = al), null !== t) {
                            for(r = [], o = S(), null === o && (o = U()); null !== o;)r.push(o), o = S(), null === o && (o = U());
                            null !== r ? (93 === n.charCodeAt(qt) ? (o = fu, qt++) : (o = null, 0 === Wt && e(su)), null !== o ? (Lt = l, u = hu(t, r), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il);
                        } else qt = l, l = il;
                        else qt = l, l = il;
                        return Wt--, null === l && (u = null, 0 === Wt && e(cu)), l;
                    }
                    function S() {
                        var l, u, t, r;
                        return Wt++, l = qt, u = U(), null !== u ? (45 === n.charCodeAt(qt) ? (t = pu, qt++) : (t = null, 0 === Wt && e(vu)), null !== t ? (r = U(), null !== r ? (Lt = l, u = wu(u, r), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il)) : (qt = l, l = il), Wt--, null === l && (u = null, 0 === Wt && e(du)), l;
                    }
                    function U() {
                        var n, l;
                        return Wt++, n = G(), null === n && (n = E()), Wt--, null === n && (l = null, 0 === Wt && e(Au)), n;
                    }
                    function E() {
                        var l, u;
                        return l = qt, Cu.test(n.charAt(qt)) ? (u = n.charAt(qt), qt++) : (u = null, 0 === Wt && e(gu)), null !== u && (Lt = l, u = bu(u)), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function G() {
                        var n;
                        return n = L(), null === n && (n = Y(), null === n && (n = H(), null === n && (n = O(), null === n && (n = W(), null === n && (n = z(), null === n && (n = I(), null === n && (n = J(), null === n && (n = K(), null === n && (n = N(), null === n && (n = P(), null === n && (n = V(), null === n && (n = X(), null === n && (n = _(), null === n && (n = nl(), null === n && (n = ll(), null === n && (n = ul(), null === n && (n = tl()))))))))))))))))), n;
                    }
                    function B() {
                        var n;
                        return n = j(), null === n && (n = q(), null === n && (n = $())), n;
                    }
                    function j() {
                        var l, u;
                        return l = qt, 46 === n.charCodeAt(qt) ? (u = ku, qt++) : (u = null, 0 === Wt && e(Tu)), null !== u && (Lt = l, u = xu()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function $() {
                        var l, u;
                        return Wt++, l = qt, mu.test(n.charAt(qt)) ? (u = n.charAt(qt), qt++) : (u = null, 0 === Wt && e(Ru)), null !== u && (Lt = l, u = bu(u)), null === u ? (qt = l, l = u) : l = u, Wt--, null === l && (u = null, 0 === Wt && e(yu)), l;
                    }
                    function q() {
                        var n;
                        return n = M(), null === n && (n = D(), null === n && (n = Y(), null === n && (n = H(), null === n && (n = O(), null === n && (n = W(), null === n && (n = z(), null === n && (n = I(), null === n && (n = J(), null === n && (n = K(), null === n && (n = N(), null === n && (n = P(), null === n && (n = V(), null === n && (n = X(), null === n && (n = Z(), null === n && (n = _(), null === n && (n = nl(), null === n && (n = ll(), null === n && (n = ul(), null === n && (n = tl()))))))))))))))))))), n;
                    }
                    function L() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Fu ? (u = Fu, qt += 2) : (u = null, 0 === Wt && e(Qu)), null !== u && (Lt = l, u = Su()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function M() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Fu ? (u = Fu, qt += 2) : (u = null, 0 === Wt && e(Qu)), null !== u && (Lt = l, u = Uu()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function D() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Eu ? (u = Eu, qt += 2) : (u = null, 0 === Wt && e(Gu)), null !== u && (Lt = l, u = Bu()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function H() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === ju ? (u = ju, qt += 2) : (u = null, 0 === Wt && e($u)), null !== u && (Lt = l, u = qu()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function O() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Lu ? (u = Lu, qt += 2) : (u = null, 0 === Wt && e(Mu)), null !== u && (Lt = l, u = Du()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function W() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Hu ? (u = Hu, qt += 2) : (u = null, 0 === Wt && e(Ou)), null !== u && (Lt = l, u = Wu()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function z() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === zu ? (u = zu, qt += 2) : (u = null, 0 === Wt && e(Iu)), null !== u && (Lt = l, u = Ju()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function I() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Ku ? (u = Ku, qt += 2) : (u = null, 0 === Wt && e(Nu)), null !== u && (Lt = l, u = Pu()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function J() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Vu ? (u = Vu, qt += 2) : (u = null, 0 === Wt && e(Xu)), null !== u && (Lt = l, u = Yu()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function K() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Zu ? (u = Zu, qt += 2) : (u = null, 0 === Wt && e(_u)), null !== u && (Lt = l, u = nt()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function N() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === lt ? (u = lt, qt += 2) : (u = null, 0 === Wt && e(ut)), null !== u && (Lt = l, u = tt()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function P() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === rt ? (u = rt, qt += 2) : (u = null, 0 === Wt && e(et)), null !== u && (Lt = l, u = ot()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function V() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === ct ? (u = ct, qt += 2) : (u = null, 0 === Wt && e(it)), null !== u && (Lt = l, u = at()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function X() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === ft ? (u = ft, qt += 2) : (u = null, 0 === Wt && e(st)), null !== u && (Lt = l, u = ht()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function Y() {
                        var l, u, t;
                        return l = qt, n.substr(qt, 2) === dt ? (u = dt, qt += 2) : (u = null, 0 === Wt && e(pt)), null !== u ? (n.length > qt ? (t = n.charAt(qt), qt++) : (t = null, 0 === Wt && e(vt)), null !== t ? (Lt = l, u = wt(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function Z() {
                        var l, u, t;
                        return l = qt, 92 === n.charCodeAt(qt) ? (u = At, qt++) : (u = null, 0 === Wt && e(Ct)), null !== u ? (gt.test(n.charAt(qt)) ? (t = n.charAt(qt), qt++) : (t = null, 0 === Wt && e(bt)), null !== t ? (Lt = l, u = kt(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    function _() {
                        var l, u, t, r;
                        if (l = qt, n.substr(qt, 2) === Tt ? (u = Tt, qt += 2) : (u = null, 0 === Wt && e(xt)), null !== u) {
                            if (t = [], yt.test(n.charAt(qt)) ? (r = n.charAt(qt), qt++) : (r = null, 0 === Wt && e(mt)), null !== r) for(; null !== r;)t.push(r), yt.test(n.charAt(qt)) ? (r = n.charAt(qt), qt++) : (r = null, 0 === Wt && e(mt));
                            else t = il;
                            null !== t ? (Lt = l, u = Rt(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il);
                        } else qt = l, l = il;
                        return l;
                    }
                    function nl() {
                        var l, u, t, r;
                        if (l = qt, n.substr(qt, 2) === Ft ? (u = Ft, qt += 2) : (u = null, 0 === Wt && e(Qt)), null !== u) {
                            if (t = [], St.test(n.charAt(qt)) ? (r = n.charAt(qt), qt++) : (r = null, 0 === Wt && e(Ut)), null !== r) for(; null !== r;)t.push(r), St.test(n.charAt(qt)) ? (r = n.charAt(qt), qt++) : (r = null, 0 === Wt && e(Ut));
                            else t = il;
                            null !== t ? (Lt = l, u = Et(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il);
                        } else qt = l, l = il;
                        return l;
                    }
                    function ll() {
                        var l, u, t, r;
                        if (l = qt, n.substr(qt, 2) === Gt ? (u = Gt, qt += 2) : (u = null, 0 === Wt && e(Bt)), null !== u) {
                            if (t = [], St.test(n.charAt(qt)) ? (r = n.charAt(qt), qt++) : (r = null, 0 === Wt && e(Ut)), null !== r) for(; null !== r;)t.push(r), St.test(n.charAt(qt)) ? (r = n.charAt(qt), qt++) : (r = null, 0 === Wt && e(Ut));
                            else t = il;
                            null !== t ? (Lt = l, u = jt(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il);
                        } else qt = l, l = il;
                        return l;
                    }
                    function ul() {
                        var l, u;
                        return l = qt, n.substr(qt, 2) === Tt ? (u = Tt, qt += 2) : (u = null, 0 === Wt && e(xt)), null !== u && (Lt = l, u = $t()), null === u ? (qt = l, l = u) : l = u, l;
                    }
                    function tl() {
                        var l, u, t;
                        return l = qt, 92 === n.charCodeAt(qt) ? (u = At, qt++) : (u = null, 0 === Wt && e(Ct)), null !== u ? (n.length > qt ? (t = n.charAt(qt), qt++) : (t = null, 0 === Wt && e(vt)), null !== t ? (Lt = l, u = bu(t), null === u ? (qt = l, l = u) : l = u) : (qt = l, l = il)) : (qt = l, l = il), l;
                    }
                    var rl, el = arguments.length > 1 ? arguments[1] : {}, ol = {
                        regexp: c
                    }, cl = c, il = null, al = "", fl = "|", sl = '"|"', hl = function(n, l) {
                        return l ? new Alternate(n, l[1]) : n;
                    }, dl = function(n, l, u) {
                        return new Match([
                            n
                        ].concat(l).concat([
                            u
                        ]));
                    }, pl = "^", vl = '"^"', wl = function() {
                        return new Token("start");
                    }, Al = "$", Cl = '"$"', gl = function() {
                        return new Token("end");
                    }, bl = function(n, l) {
                        return new Quantified(n, l);
                    }, kl = "Quantifier", Tl = function(n, l) {
                        return l && (n.greedy = !1), n;
                    }, xl = "{", yl = '"{"', ml = ",", Rl = '","', Fl = "}", Ql = '"}"', Sl = function(n, l) {
                        return new Quantifier(n, l);
                    }, Ul = ",}", El = '",}"', Gl = function(n) {
                        return new Quantifier(n, 1 / 0);
                    }, Bl = function(n) {
                        return new Quantifier(n, n);
                    }, jl = "+", $l = '"+"', ql = function() {
                        return new Quantifier(1, 1 / 0);
                    }, Ll = "*", Ml = '"*"', Dl = function() {
                        return new Quantifier(0, 1 / 0);
                    }, Hl = "?", Ol = '"?"', Wl = function() {
                        return new Quantifier(0, 1);
                    }, zl = /^[0-9]/, Il = "[0-9]", Jl = function(n) {
                        return +n.join("");
                    }, Kl = "(", Nl = '"("', Pl = ")", Vl = '")"', Xl = function(n) {
                        return n;
                    }, Yl = function(n) {
                        return new CaptureGroup(n);
                    }, Zl = "?:", _l = '"?:"', nu = function(n) {
                        return new Group("non-capture-group", n);
                    }, lu = "?=", uu = '"?="', tu = function(n) {
                        return new Group("positive-lookahead", n);
                    }, ru = "?!", eu = '"?!"', ou = function(n) {
                        return new Group("negative-lookahead", n);
                    }, cu = "CharacterSet", iu = "[", au = '"["', fu = "]", su = '"]"', hu = function(n, l) {
                        return new CharSet(!!n, l);
                    }, du = "CharacterRange", pu = "-", vu = '"-"', wu = function(n, l) {
                        return new CharacterRange(n, l);
                    }, Au = "Character", Cu = /^[^\\\]]/, gu = "[^\\\\\\]]", bu = function(n) {
                        return new Literal(n);
                    }, ku = ".", Tu = '"."', xu = function() {
                        return new Token("any-character");
                    }, yu = "Literal", mu = /^[^|\\\/.[()?+*$\^]/, Ru = "[^|\\\\\\/.[()?+*$\\^]", Fu = "\\b", Qu = '"\\\\b"', Su = function() {
                        return new Token("backspace");
                    }, Uu = function() {
                        return new Token("word-boundary");
                    }, Eu = "\\B", Gu = '"\\\\B"', Bu = function() {
                        return new Token("non-word-boundary");
                    }, ju = "\\d", $u = '"\\\\d"', qu = function() {
                        return new Token("digit");
                    }, Lu = "\\D", Mu = '"\\\\D"', Du = function() {
                        return new Token("non-digit");
                    }, Hu = "\\f", Ou = '"\\\\f"', Wu = function() {
                        return new Token("form-feed");
                    }, zu = "\\n", Iu = '"\\\\n"', Ju = function() {
                        return new Token("line-feed");
                    }, Ku = "\\r", Nu = '"\\\\r"', Pu = function() {
                        return new Token("carriage-return");
                    }, Vu = "\\s", Xu = '"\\\\s"', Yu = function() {
                        return new Token("white-space");
                    }, Zu = "\\S", _u = '"\\\\S"', nt = function() {
                        return new Token("non-white-space");
                    }, lt = "\\t", ut = '"\\\\t"', tt = function() {
                        return new Token("tab");
                    }, rt = "\\v", et = '"\\\\v"', ot = function() {
                        return new Token("vertical-tab");
                    }, ct = "\\w", it = '"\\\\w"', at = function() {
                        return new Token("word");
                    }, ft = "\\W", st = '"\\\\W"', ht = function() {
                        return new Token("non-word");
                    }, dt = "\\c", pt = '"\\\\c"', vt = "any character", wt = function(n) {
                        return new ControlCharacter(n);
                    }, At = "\\", Ct = '"\\\\"', gt = /^[1-9]/, bt = "[1-9]", kt = function(n) {
                        return new BackReference(n);
                    }, Tt = "\\0", xt = '"\\\\0"', yt = /^[0-7]/, mt = "[0-7]", Rt = function(n) {
                        return new Octal(n.join(""));
                    }, Ft = "\\x", Qt = '"\\\\x"', St = /^[0-9a-fA-F]/, Ut = "[0-9a-fA-F]", Et = function(n) {
                        return new Hex(n.join(""));
                    }, Gt = "\\u", Bt = '"\\\\u"', jt = function(n) {
                        return new Unicode(n.join(""));
                    }, $t = function() {
                        return new Token("null-character");
                    }, qt = 0, Lt = 0, Mt = 0, Dt = {
                        line: 1,
                        column: 1,
                        seenCR: !1
                    }, Ht = 0, Ot = [], Wt = 0;
                    if ("startRule" in el) {
                        if (!(el.startRule in ol)) throw new Error("Can't start parsing from rule \"" + el.startRule + '".');
                        cl = ol[el.startRule];
                    }
                    if (Token.offset = t, Token.text = u, rl = cl(), null !== rl && qt === n.length) return rl;
                    throw o(Ot), Lt = Math.max(qt, Ht), new l(Ot, Lt < n.length ? n.charAt(Lt) : null, Lt, r(Lt).line, r(Lt).column);
                }
                return n(l, Error), {
                    SyntaxError: l,
                    parse: u
                };
            }(), index = 1, cgs = {};
            module1.exports = parser;
        /***/ },
        /* 22 */ /***/ function(module1, exports1, __nested_webpack_require_297552_297571__) {
            /*
	    ## RegExp Handler

	    https://github.com/ForbesLindesay/regexp
	    https://github.com/dmajda/pegjs
	    http://www.regexper.com/

	    每个节点的结构
	        {
	            type: '',
	            offset: number,
	            text: '',
	            body: {},
	            escaped: true/false
	        }

	    type 可选值
	        alternate             |         选择
	        match                 匹配
	        capture-group         ()        捕获组
	        non-capture-group     (?:...)   非捕获组
	        positive-lookahead    (?=p)     零宽正向先行断言
	        negative-lookahead    (?!p)     零宽负向先行断言
	        quantified            a*        重复节点
	        quantifier            *         量词
	        charset               []        字符集
	        range                 {m, n}    范围
	        literal               a         直接量字符
	        unicode               \uxxxx    Unicode
	        hex                   \x        十六进制
	        octal                 八进制
	        back-reference        \n        反向引用
	        control-character     \cX       控制字符

	        // Token
	        start               ^       开头
	        end                 $       结尾
	        any-character       .       任意字符
	        backspace           [\b]    退格直接量
	        word-boundary       \b      单词边界
	        non-word-boundary   \B      非单词边界
	        digit               \d      ASCII 数字，[0-9]
	        non-digit           \D      非 ASCII 数字，[^0-9]
	        form-feed           \f      换页符
	        line-feed           \n      换行符
	        carriage-return     \r      回车符
	        white-space         \s      空白符
	        non-white-space     \S      非空白符
	        tab                 \t      制表符
	        vertical-tab        \v      垂直制表符
	        word                \w      ASCII 字符，[a-zA-Z0-9]
	        non-word            \W      非 ASCII 字符，[^a-zA-Z0-9]
	        null-character      \o      NUL 字符
	 */ var Util = __nested_webpack_require_297552_297571__(3);
            var Random = __nested_webpack_require_297552_297571__(5);
            /*
	        
	    */ var Handler = {
                extend: Util.extend
            };
            // http://en.wikipedia.org/wiki/ASCII#ASCII_printable_code_chart
            /*var ASCII_CONTROL_CODE_CHART = {
	    '@': ['\u0000'],
	    A: ['\u0001'],
	    B: ['\u0002'],
	    C: ['\u0003'],
	    D: ['\u0004'],
	    E: ['\u0005'],
	    F: ['\u0006'],
	    G: ['\u0007', '\a'],
	    H: ['\u0008', '\b'],
	    I: ['\u0009', '\t'],
	    J: ['\u000A', '\n'],
	    K: ['\u000B', '\v'],
	    L: ['\u000C', '\f'],
	    M: ['\u000D', '\r'],
	    N: ['\u000E'],
	    O: ['\u000F'],
	    P: ['\u0010'],
	    Q: ['\u0011'],
	    R: ['\u0012'],
	    S: ['\u0013'],
	    T: ['\u0014'],
	    U: ['\u0015'],
	    V: ['\u0016'],
	    W: ['\u0017'],
	    X: ['\u0018'],
	    Y: ['\u0019'],
	    Z: ['\u001A'],
	    '[': ['\u001B', '\e'],
	    '\\': ['\u001C'],
	    ']': ['\u001D'],
	    '^': ['\u001E'],
	    '_': ['\u001F']
	}*/ // ASCII printable code chart
            // var LOWER = 'abcdefghijklmnopqrstuvwxyz'
            // var UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            // var NUMBER = '0123456789'
            // var SYMBOL = ' !"#$%&\'()*+,-./' + ':;<=>?@' + '[\\]^_`' + '{|}~'
            var LOWER = ascii(97, 122);
            var UPPER = ascii(65, 90);
            var NUMBER = ascii(48, 57);
            var OTHER = ascii(32, 47) + ascii(58, 64) + ascii(91, 96) + ascii(123, 126) // 排除 95 _ ascii(91, 94) + ascii(96, 96)
            ;
            var PRINTABLE = ascii(32, 126);
            var SPACE = ' \f\n\r\t\v\u00A0\u2028\u2029';
            var CHARACTER_CLASSES = {
                '\\w': LOWER + UPPER + NUMBER + '_',
                '\\W': OTHER.replace('_', ''),
                '\\s': SPACE,
                '\\S': function() {
                    var result = PRINTABLE;
                    for(var i = 0; i < SPACE.length; i++){
                        result = result.replace(SPACE[i], '');
                    }
                    return result;
                }(),
                '\\d': NUMBER,
                '\\D': LOWER + UPPER + OTHER
            };
            function ascii(from, to) {
                var result = '';
                for(var i = from; i <= to; i++){
                    result += String.fromCharCode(i);
                }
                return result;
            }
            // var ast = RegExpParser.parse(regexp.source)
            Handler.gen = function(node, result, cache) {
                cache = cache || {
                    guid: 1
                };
                return Handler[node.type] ? Handler[node.type](node, result, cache) : Handler.token(node, result, cache);
            };
            Handler.extend({
                /* jshint unused:false */ token: function(node, result, cache) {
                    switch(node.type){
                        case 'start':
                        case 'end':
                            return '';
                        case 'any-character':
                            return Random.character();
                        case 'backspace':
                            return '';
                        case 'word-boundary':
                            return '';
                        case 'non-word-boundary':
                            break;
                        case 'digit':
                            return Random.pick(NUMBER.split(''));
                        case 'non-digit':
                            return Random.pick((LOWER + UPPER + OTHER).split(''));
                        case 'form-feed':
                            break;
                        case 'line-feed':
                            return node.body || node.text;
                        case 'carriage-return':
                            break;
                        case 'white-space':
                            return Random.pick(SPACE.split(''));
                        case 'non-white-space':
                            return Random.pick((LOWER + UPPER + NUMBER).split(''));
                        case 'tab':
                            break;
                        case 'vertical-tab':
                            break;
                        case 'word':
                            return Random.pick((LOWER + UPPER + NUMBER).split(''));
                        case 'non-word':
                            return Random.pick(OTHER.replace('_', '').split(''));
                        case 'null-character':
                            break;
                    }
                    return node.body || node.text;
                },
                /*
	        {
	            type: 'alternate',
	            offset: 0,
	            text: '',
	            left: {
	                boyd: []
	            },
	            right: {
	                boyd: []
	            }
	        }
	    */ alternate: function(node, result, cache) {
                    // node.left/right {}
                    return this.gen(Random.boolean() ? node.left : node.right, result, cache);
                },
                /*
	        {
	            type: 'match',
	            offset: 0,
	            text: '',
	            body: []
	        }
	    */ match: function(node, result, cache) {
                    result = '';
                    // node.body []
                    for(var i = 0; i < node.body.length; i++){
                        result += this.gen(node.body[i], result, cache);
                    }
                    return result;
                },
                // ()
                'capture-group': function(node, result, cache) {
                    // node.body {}
                    result = this.gen(node.body, result, cache);
                    cache[cache.guid++] = result;
                    return result;
                },
                // (?:...)
                'non-capture-group': function(node, result, cache) {
                    // node.body {}
                    return this.gen(node.body, result, cache);
                },
                // (?=p)
                'positive-lookahead': function(node, result, cache) {
                    // node.body
                    return this.gen(node.body, result, cache);
                },
                // (?!p)
                'negative-lookahead': function(node, result, cache) {
                    // node.body
                    return '';
                },
                /*
	        {
	            type: 'quantified',
	            offset: 3,
	            text: 'c*',
	            body: {
	                type: 'literal',
	                offset: 3,
	                text: 'c',
	                body: 'c',
	                escaped: false
	            },
	            quantifier: {
	                type: 'quantifier',
	                offset: 4,
	                text: '*',
	                min: 0,
	                max: Infinity,
	                greedy: true
	            }
	        }
	    */ quantified: function(node, result, cache) {
                    result = '';
                    // node.quantifier {}
                    var count = this.quantifier(node.quantifier);
                    // node.body {}
                    for(var i = 0; i < count; i++){
                        result += this.gen(node.body, result, cache);
                    }
                    return result;
                },
                /*
	        quantifier: {
	            type: 'quantifier',
	            offset: 4,
	            text: '*',
	            min: 0,
	            max: Infinity,
	            greedy: true
	        }
	    */ quantifier: function(node, result, cache) {
                    var min = Math.max(node.min, 0);
                    var max = isFinite(node.max) ? node.max : min + Random.integer(3, 7);
                    return Random.integer(min, max);
                },
                /*
	        
	    */ charset: function(node, result, cache) {
                    // node.invert
                    if (node.invert) return this['invert-charset'](node, result, cache);
                    // node.body []
                    var literal = Random.pick(node.body);
                    return this.gen(literal, result, cache);
                },
                'invert-charset': function(node, result, cache) {
                    var pool = PRINTABLE;
                    for(var i = 0, item; i < node.body.length; i++){
                        item = node.body[i];
                        switch(item.type){
                            case 'literal':
                                pool = pool.replace(item.body, '');
                                break;
                            case 'range':
                                var min = this.gen(item.start, result, cache).charCodeAt();
                                var max = this.gen(item.end, result, cache).charCodeAt();
                                for(var ii = min; ii <= max; ii++){
                                    pool = pool.replace(String.fromCharCode(ii), '');
                                }
                            /* falls through */ default:
                                var characters = CHARACTER_CLASSES[item.text];
                                if (characters) {
                                    for(var iii = 0; iii <= characters.length; iii++){
                                        pool = pool.replace(characters[iii], '');
                                    }
                                }
                        }
                    }
                    return Random.pick(pool.split(''));
                },
                range: function(node, result, cache) {
                    // node.start, node.end
                    var min = this.gen(node.start, result, cache).charCodeAt();
                    var max = this.gen(node.end, result, cache).charCodeAt();
                    return String.fromCharCode(Random.integer(min, max));
                },
                literal: function(node, result, cache) {
                    return node.escaped ? node.body : node.text;
                },
                // Unicode \u
                unicode: function(node, result, cache) {
                    return String.fromCharCode(parseInt(node.code, 16));
                },
                // 十六进制 \xFF
                hex: function(node, result, cache) {
                    return String.fromCharCode(parseInt(node.code, 16));
                },
                // 八进制 \0
                octal: function(node, result, cache) {
                    return String.fromCharCode(parseInt(node.code, 8));
                },
                // 反向引用
                'back-reference': function(node, result, cache) {
                    return cache[node.code] || '';
                },
                /*
	        http://en.wikipedia.org/wiki/C0_and_C1_control_codes
	    */ CONTROL_CHARACTER_MAP: function() {
                    var CONTROL_CHARACTER = '@ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \\ ] ^ _'.split(' ');
                    var CONTROL_CHARACTER_UNICODE = '\u0000 \u0001 \u0002 \u0003 \u0004 \u0005 \u0006 \u0007 \u0008 \u0009 \u000A \u000B \u000C \u000D \u000E \u000F \u0010 \u0011 \u0012 \u0013 \u0014 \u0015 \u0016 \u0017 \u0018 \u0019 \u001A \u001B \u001C \u001D \u001E \u001F'.split(' ');
                    var map = {};
                    for(var i = 0; i < CONTROL_CHARACTER.length; i++){
                        map[CONTROL_CHARACTER[i]] = CONTROL_CHARACTER_UNICODE[i];
                    }
                    return map;
                }(),
                'control-character': function(node, result, cache) {
                    return this.CONTROL_CHARACTER_MAP[node.code];
                }
            });
            module1.exports = Handler;
        /***/ },
        /* 23 */ /***/ function(module1, exports1, __nested_webpack_require_311667_311686__) {
            module1.exports = __nested_webpack_require_311667_311686__(24);
        /***/ },
        /* 24 */ /***/ function(module1, exports1, __nested_webpack_require_311813_311832__) {
            /*
	    ## toJSONSchema

	    把 Mock.js 风格的数据模板转换成 JSON Schema。

	    > [JSON Schema](http://json-schema.org/)
	 */ var Constant = __nested_webpack_require_311813_311832__(2);
            var Util = __nested_webpack_require_311813_311832__(3);
            var Parser = __nested_webpack_require_311813_311832__(4);
            function toJSONSchema(template, name, path /* Internal Use Only */ ) {
                // type rule properties items
                path = path || [];
                var result = {
                    name: typeof name === 'string' ? name.replace(Constant.RE_KEY, '$1') : name,
                    template: template,
                    type: Util.type(template),
                    rule: Parser.parse(name)
                };
                result.path = path.slice(0);
                result.path.push(name === undefined ? 'ROOT' : result.name);
                switch(result.type){
                    case 'array':
                        result.items = [];
                        Util.each(template, function(value, index) {
                            result.items.push(toJSONSchema(value, index, result.path));
                        });
                        break;
                    case 'object':
                        result.properties = [];
                        Util.each(template, function(value, name) {
                            result.properties.push(toJSONSchema(value, name, result.path));
                        });
                        break;
                }
                return result;
            }
            module1.exports = toJSONSchema;
        /***/ },
        /* 25 */ /***/ function(module1, exports1, __nested_webpack_require_313495_313514__) {
            module1.exports = __nested_webpack_require_313495_313514__(26);
        /***/ },
        /* 26 */ /***/ function(module1, exports1, __nested_webpack_require_313641_313660__) {
            /*
	    ## valid(template, data)

	    校验真实数据 data 是否与数据模板 template 匹配。
	    
	    实现思路：
	    1. 解析规则。
	        先把数据模板 template 解析为更方便机器解析的 JSON-Schame
	        name               属性名 
	        type               属性值类型
	        template           属性值模板
	        properties         对象属性数组
	        items              数组元素数组
	        rule               属性值生成规则
	    2. 递归验证规则。
	        然后用 JSON-Schema 校验真实数据，校验项包括属性名、值类型、值、值生成规则。

	    提示信息 
	    https://github.com/fge/json-schema-validator/blob/master/src/main/resources/com/github/fge/jsonschema/validator/validation.properties
	    [JSON-Schama validator](http://json-schema-validator.herokuapp.com/)
	    [Regexp Demo](http://demos.forbeslindesay.co.uk/regexp/)
	*/ var Constant = __nested_webpack_require_313641_313660__(2);
            var Util = __nested_webpack_require_313641_313660__(3);
            var toJSONSchema = __nested_webpack_require_313641_313660__(23);
            function valid(template, data) {
                var schema = toJSONSchema(template);
                var result = Diff.diff(schema, data);
                for(var i = 0; i < result.length; i++){
                // console.log(template, data)
                // console.warn(Assert.message(result[i]))
                }
                return result;
            }
            /*
	    ## name
	        有生成规则：比较解析后的 name
	        无生成规则：直接比较
	    ## type
	        无类型转换：直接比较
	        有类型转换：先试着解析 template，然后再检查？
	    ## value vs. template
	        基本类型
	            无生成规则：直接比较
	            有生成规则：
	                number
	                    min-max.dmin-dmax
	                    min-max.dcount
	                    count.dmin-dmax
	                    count.dcount
	                    +step
	                    整数部分
	                    小数部分
	                boolean 
	                string  
	                    min-max
	                    count
	    ## properties
	        对象
	            有生成规则：检测期望的属性个数，继续递归
	            无生成规则：检测全部的属性个数，继续递归
	    ## items
	        数组
	            有生成规则：
	                `'name|1': [{}, {} ...]`            其中之一，继续递归
	                `'name|+1': [{}, {} ...]`           顺序检测，继续递归
	                `'name|min-max': [{}, {} ...]`      检测个数，继续递归
	                `'name|count': [{}, {} ...]`        检测个数，继续递归
	            无生成规则：检测全部的元素个数，继续递归
	*/ var Diff = {
                diff: function diff(schema, data, name /* Internal Use Only */ ) {
                    var result = [];
                    // 先检测名称 name 和类型 type，如果匹配，才有必要继续检测
                    if (this.name(schema, data, name, result) && this.type(schema, data, name, result)) {
                        this.value(schema, data, name, result);
                        this.properties(schema, data, name, result);
                        this.items(schema, data, name, result);
                    }
                    return result;
                },
                /* jshint unused:false */ name: function(schema, data, name, result) {
                    var length = result.length;
                    Assert.equal('name', schema.path, name + '', schema.name + '', result);
                    return result.length === length;
                },
                type: function(schema, data, name, result) {
                    var length = result.length;
                    switch(schema.type){
                        case 'string':
                            // 跳过含有『占位符』的属性值，因为『占位符』返回值的类型可能和模板不一致，例如 '@int' 会返回一个整形值
                            if (schema.template.match(Constant.RE_PLACEHOLDER)) return true;
                            break;
                        case 'array':
                            if (schema.rule.parameters) {
                                // name|count: array
                                if (schema.rule.min !== undefined && schema.rule.max === undefined) {
                                    // 跳过 name|1: array，因为最终值的类型（很可能）不是数组，也不一定与 `array` 中的类型一致
                                    if (schema.rule.count === 1) return true;
                                }
                                // 跳过 name|+inc: array
                                if (schema.rule.parameters[2]) return true;
                            }
                            break;
                        case 'function':
                            // 跳过 `'name': function`，因为函数可以返回任何类型的值。
                            return true;
                    }
                    Assert.equal('type', schema.path, Util.type(data), schema.type, result);
                    return result.length === length;
                },
                value: function(schema, data, name, result) {
                    var length = result.length;
                    var rule = schema.rule;
                    var templateType = schema.type;
                    if (templateType === 'object' || templateType === 'array' || templateType === 'function') return true;
                    // 无生成规则
                    if (!rule.parameters) {
                        switch(templateType){
                            case 'regexp':
                                Assert.match('value', schema.path, data, schema.template, result);
                                return result.length === length;
                            case 'string':
                                // 同样跳过含有『占位符』的属性值，因为『占位符』的返回值会通常会与模板不一致
                                if (schema.template.match(Constant.RE_PLACEHOLDER)) return result.length === length;
                                break;
                        }
                        Assert.equal('value', schema.path, data, schema.template, result);
                        return result.length === length;
                    }
                    // 有生成规则
                    var actualRepeatCount;
                    switch(templateType){
                        case 'number':
                            var parts = (data + '').split('.');
                            parts[0] = +parts[0];
                            // 整数部分
                            // |min-max
                            if (rule.min !== undefined && rule.max !== undefined) {
                                Assert.greaterThanOrEqualTo('value', schema.path, parts[0], Math.min(rule.min, rule.max), result);
                                // , 'numeric instance is lower than the required minimum (minimum: {expected}, found: {actual})')
                                Assert.lessThanOrEqualTo('value', schema.path, parts[0], Math.max(rule.min, rule.max), result);
                            }
                            // |count
                            if (rule.min !== undefined && rule.max === undefined) {
                                Assert.equal('value', schema.path, parts[0], rule.min, result, '[value] ' + name);
                            }
                            // 小数部分
                            if (rule.decimal) {
                                // |dmin-dmax
                                if (rule.dmin !== undefined && rule.dmax !== undefined) {
                                    Assert.greaterThanOrEqualTo('value', schema.path, parts[1].length, rule.dmin, result);
                                    Assert.lessThanOrEqualTo('value', schema.path, parts[1].length, rule.dmax, result);
                                }
                                // |dcount
                                if (rule.dmin !== undefined && rule.dmax === undefined) {
                                    Assert.equal('value', schema.path, parts[1].length, rule.dmin, result);
                                }
                            }
                            break;
                        case 'boolean':
                            break;
                        case 'string':
                            // 'aaa'.match(/a/g)
                            actualRepeatCount = data.match(new RegExp(schema.template, 'g'));
                            actualRepeatCount = actualRepeatCount ? actualRepeatCount.length : 0;
                            // |min-max
                            if (rule.min !== undefined && rule.max !== undefined) {
                                Assert.greaterThanOrEqualTo('repeat count', schema.path, actualRepeatCount, rule.min, result);
                                Assert.lessThanOrEqualTo('repeat count', schema.path, actualRepeatCount, rule.max, result);
                            }
                            // |count
                            if (rule.min !== undefined && rule.max === undefined) {
                                Assert.equal('repeat count', schema.path, actualRepeatCount, rule.min, result);
                            }
                            break;
                        case 'regexp':
                            actualRepeatCount = data.match(new RegExp(schema.template.source.replace(/^\^|\$$/g, ''), 'g'));
                            actualRepeatCount = actualRepeatCount ? actualRepeatCount.length : 0;
                            // |min-max
                            if (rule.min !== undefined && rule.max !== undefined) {
                                Assert.greaterThanOrEqualTo('repeat count', schema.path, actualRepeatCount, rule.min, result);
                                Assert.lessThanOrEqualTo('repeat count', schema.path, actualRepeatCount, rule.max, result);
                            }
                            // |count
                            if (rule.min !== undefined && rule.max === undefined) {
                                Assert.equal('repeat count', schema.path, actualRepeatCount, rule.min, result);
                            }
                            break;
                    }
                    return result.length === length;
                },
                properties: function(schema, data, name, result) {
                    var length = result.length;
                    var rule = schema.rule;
                    var keys = Util.keys(data);
                    if (!schema.properties) return;
                    // 无生成规则
                    if (!schema.rule.parameters) {
                        Assert.equal('properties length', schema.path, keys.length, schema.properties.length, result);
                    } else {
                        // 有生成规则
                        // |min-max
                        if (rule.min !== undefined && rule.max !== undefined) {
                            Assert.greaterThanOrEqualTo('properties length', schema.path, keys.length, Math.min(rule.min, rule.max), result);
                            Assert.lessThanOrEqualTo('properties length', schema.path, keys.length, Math.max(rule.min, rule.max), result);
                        }
                        // |count
                        if (rule.min !== undefined && rule.max === undefined) {
                            // |1, |>1
                            if (rule.count !== 1) Assert.equal('properties length', schema.path, keys.length, rule.min, result);
                        }
                    }
                    if (result.length !== length) return false;
                    for(var i = 0; i < keys.length; i++){
                        result.push.apply(result, this.diff(function() {
                            var property;
                            Util.each(schema.properties, function(item /*, index*/ ) {
                                if (item.name === keys[i]) property = item;
                            });
                            return property || schema.properties[i];
                        }(), data[keys[i]], keys[i]));
                    }
                    return result.length === length;
                },
                items: function(schema, data, name, result) {
                    var length = result.length;
                    if (!schema.items) return;
                    var rule = schema.rule;
                    // 无生成规则
                    if (!schema.rule.parameters) {
                        Assert.equal('items length', schema.path, data.length, schema.items.length, result);
                    } else {
                        // 有生成规则
                        // |min-max
                        if (rule.min !== undefined && rule.max !== undefined) {
                            Assert.greaterThanOrEqualTo('items', schema.path, data.length, Math.min(rule.min, rule.max) * schema.items.length, result, '[{utype}] array is too short: {path} must have at least {expected} elements but instance has {actual} elements');
                            Assert.lessThanOrEqualTo('items', schema.path, data.length, Math.max(rule.min, rule.max) * schema.items.length, result, '[{utype}] array is too long: {path} must have at most {expected} elements but instance has {actual} elements');
                        }
                        // |count
                        if (rule.min !== undefined && rule.max === undefined) {
                            // |1, |>1
                            if (rule.count === 1) return result.length === length;
                            else Assert.equal('items length', schema.path, data.length, rule.min * schema.items.length, result);
                        }
                        // |+inc
                        if (rule.parameters[2]) return result.length === length;
                    }
                    if (result.length !== length) return false;
                    for(var i = 0; i < data.length; i++){
                        result.push.apply(result, this.diff(schema.items[i % schema.items.length], data[i], i % schema.items.length));
                    }
                    return result.length === length;
                }
            };
            /*
	    完善、友好的提示信息
	    
	    Equal, not equal to, greater than, less than, greater than or equal to, less than or equal to
	    路径 验证类型 描述 

	    Expect path.name is less than or equal to expected, but path.name is actual.

	    Expect path.name is less than or equal to expected, but path.name is actual.
	    Expect path.name is greater than or equal to expected, but path.name is actual.

	*/ var Assert = {
                message: function(item) {
                    return (item.message || '[{utype}] Expect {path}\'{ltype} {action} {expected}, but is {actual}').replace('{utype}', item.type.toUpperCase()).replace('{ltype}', item.type.toLowerCase()).replace('{path}', Util.isArray(item.path) && item.path.join('.') || item.path).replace('{action}', item.action).replace('{expected}', item.expected).replace('{actual}', item.actual);
                },
                equal: function(type, path, actual, expected, result, message) {
                    if (actual === expected) return true;
                    switch(type){
                        case 'type':
                            // 正则模板 === 字符串最终值
                            if (expected === 'regexp' && actual === 'string') return true;
                            break;
                    }
                    var item = {
                        path: path,
                        type: type,
                        actual: actual,
                        expected: expected,
                        action: 'is equal to',
                        message: message
                    };
                    item.message = Assert.message(item);
                    result.push(item);
                    return false;
                },
                // actual matches expected
                match: function(type, path, actual, expected, result, message) {
                    if (expected.test(actual)) return true;
                    var item = {
                        path: path,
                        type: type,
                        actual: actual,
                        expected: expected,
                        action: 'matches',
                        message: message
                    };
                    item.message = Assert.message(item);
                    result.push(item);
                    return false;
                },
                notEqual: function(type, path, actual, expected, result, message) {
                    if (actual !== expected) return true;
                    var item = {
                        path: path,
                        type: type,
                        actual: actual,
                        expected: expected,
                        action: 'is not equal to',
                        message: message
                    };
                    item.message = Assert.message(item);
                    result.push(item);
                    return false;
                },
                greaterThan: function(type, path, actual, expected, result, message) {
                    if (actual > expected) return true;
                    var item = {
                        path: path,
                        type: type,
                        actual: actual,
                        expected: expected,
                        action: 'is greater than',
                        message: message
                    };
                    item.message = Assert.message(item);
                    result.push(item);
                    return false;
                },
                lessThan: function(type, path, actual, expected, result, message) {
                    if (actual < expected) return true;
                    var item = {
                        path: path,
                        type: type,
                        actual: actual,
                        expected: expected,
                        action: 'is less to',
                        message: message
                    };
                    item.message = Assert.message(item);
                    result.push(item);
                    return false;
                },
                greaterThanOrEqualTo: function(type, path, actual, expected, result, message) {
                    if (actual >= expected) return true;
                    var item = {
                        path: path,
                        type: type,
                        actual: actual,
                        expected: expected,
                        action: 'is greater than or equal to',
                        message: message
                    };
                    item.message = Assert.message(item);
                    result.push(item);
                    return false;
                },
                lessThanOrEqualTo: function(type, path, actual, expected, result, message) {
                    if (actual <= expected) return true;
                    var item = {
                        path: path,
                        type: type,
                        actual: actual,
                        expected: expected,
                        action: 'is less than or equal to',
                        message: message
                    };
                    item.message = Assert.message(item);
                    result.push(item);
                    return false;
                }
            };
            valid.Diff = Diff;
            valid.Assert = Assert;
            module1.exports = valid;
        /***/ },
        /* 27 */ /***/ function(module1, exports1, __nested_webpack_require_333927_333946__) {
            module1.exports = __nested_webpack_require_333927_333946__(28);
        /***/ },
        /* 28 */ /***/ function(module1, exports1, __nested_webpack_require_334073_334092__) {
            /* global window, document, location, Event, setTimeout */ /*
	    ## MockXMLHttpRequest

	    期望的功能：
	    1. 完整地覆盖原生 XHR 的行为
	    2. 完整地模拟原生 XHR 的行为
	    3. 在发起请求时，自动检测是否需要拦截
	    4. 如果不必拦截，则执行原生 XHR 的行为
	    5. 如果需要拦截，则执行虚拟 XHR 的行为
	    6. 兼容 XMLHttpRequest 和 ActiveXObject
	        new window.XMLHttpRequest()
	        new window.ActiveXObject("Microsoft.XMLHTTP")

	    关键方法的逻辑：
	    * new   此时尚无法确定是否需要拦截，所以创建原生 XHR 对象是必须的。
	    * open  此时可以取到 URL，可以决定是否进行拦截。
	    * send  此时已经确定了请求方式。

	    规范：
	    http://xhr.spec.whatwg.org/
	    http://www.w3.org/TR/XMLHttpRequest2/

	    参考实现：
	    https://github.com/philikon/MockHttpRequest/blob/master/lib/mock.js
	    https://github.com/trek/FakeXMLHttpRequest/blob/master/fake_xml_http_request.js
	    https://github.com/ilinsky/xmlhttprequest/blob/master/XMLHttpRequest.js
	    https://github.com/firebug/firebug-lite/blob/master/content/lite/xhr.js
	    https://github.com/thx/RAP/blob/master/lab/rap.plugin.xinglie.js

	    **需不需要全面重写 XMLHttpRequest？**
	        http://xhr.spec.whatwg.org/#interface-xmlhttprequest
	        关键属性 readyState、status、statusText、response、responseText、responseXML 是 readonly，所以，试图通过修改这些状态，来模拟响应是不可行的。
	        因此，唯一的办法是模拟整个 XMLHttpRequest，就像 jQuery 对事件模型的封装。

	    // Event handlers
	    onloadstart         loadstart
	    onprogress          progress
	    onabort             abort
	    onerror             error
	    onload              load
	    ontimeout           timeout
	    onloadend           loadend
	    onreadystatechange  readystatechange
	 */ var Util = __nested_webpack_require_334073_334092__(3);
            // 备份原生 XMLHttpRequest
            window._XMLHttpRequest = window.XMLHttpRequest;
            window._ActiveXObject = window.ActiveXObject;
            /*
	    PhantomJS
	    TypeError: '[object EventConstructor]' is not a constructor (evaluating 'new Event("readystatechange")')

	    https://github.com/bluerail/twitter-bootstrap-rails-confirm/issues/18
	    https://github.com/ariya/phantomjs/issues/11289
	*/ try {
                new window.Event('custom');
            } catch (exception) {
                window.Event = function(type, bubbles, cancelable, detail) {
                    var event = document.createEvent('CustomEvent') // MUST be 'CustomEvent'
                    ;
                    event.initCustomEvent(type, bubbles, cancelable, detail);
                    return event;
                };
            }
            var XHR_STATES = {
                // The object has been constructed.
                UNSENT: 0,
                // The open() method has been successfully invoked.
                OPENED: 1,
                // All redirects (if any) have been followed and all HTTP headers of the response have been received.
                HEADERS_RECEIVED: 2,
                // The response's body is being received.
                LOADING: 3,
                // The data transfer has been completed or something went wrong during the transfer (e.g. infinite redirects).
                DONE: 4
            };
            var XHR_EVENTS = 'readystatechange loadstart progress abort error load timeout loadend'.split(' ');
            var XHR_REQUEST_PROPERTIES = 'timeout withCredentials'.split(' ');
            var XHR_RESPONSE_PROPERTIES = 'readyState responseURL status statusText responseType response responseText responseXML'.split(' ');
            // https://github.com/trek/FakeXMLHttpRequest/blob/master/fake_xml_http_request.js#L32
            var HTTP_STATUS_CODES = {
                100: "Continue",
                101: "Switching Protocols",
                200: "OK",
                201: "Created",
                202: "Accepted",
                203: "Non-Authoritative Information",
                204: "No Content",
                205: "Reset Content",
                206: "Partial Content",
                300: "Multiple Choice",
                301: "Moved Permanently",
                302: "Found",
                303: "See Other",
                304: "Not Modified",
                305: "Use Proxy",
                307: "Temporary Redirect",
                400: "Bad Request",
                401: "Unauthorized",
                402: "Payment Required",
                403: "Forbidden",
                404: "Not Found",
                405: "Method Not Allowed",
                406: "Not Acceptable",
                407: "Proxy Authentication Required",
                408: "Request Timeout",
                409: "Conflict",
                410: "Gone",
                411: "Length Required",
                412: "Precondition Failed",
                413: "Request Entity Too Large",
                414: "Request-URI Too Long",
                415: "Unsupported Media Type",
                416: "Requested Range Not Satisfiable",
                417: "Expectation Failed",
                422: "Unprocessable Entity",
                500: "Internal Server Error",
                501: "Not Implemented",
                502: "Bad Gateway",
                503: "Service Unavailable",
                504: "Gateway Timeout",
                505: "HTTP Version Not Supported"
            };
            /*
	    MockXMLHttpRequest
	*/ function MockXMLHttpRequest() {
                // 初始化 custom 对象，用于存储自定义属性
                this.custom = {
                    events: {},
                    requestHeaders: {},
                    responseHeaders: {}
                };
            }
            MockXMLHttpRequest._settings = {
                timeout: '10-100'
            };
            MockXMLHttpRequest.setup = function(settings) {
                Util.extend(MockXMLHttpRequest._settings, settings);
                return MockXMLHttpRequest._settings;
            };
            Util.extend(MockXMLHttpRequest, XHR_STATES);
            Util.extend(MockXMLHttpRequest.prototype, XHR_STATES);
            // 标记当前对象为 MockXMLHttpRequest
            MockXMLHttpRequest.prototype.mock = true;
            // 是否拦截 Ajax 请求
            MockXMLHttpRequest.prototype.match = false;
            // 初始化 Request 相关的属性和方法
            Util.extend(MockXMLHttpRequest.prototype, {
                // https://xhr.spec.whatwg.org/#the-open()-method
                // Sets the request method, request URL, and synchronous flag.
                open: function(method, url, async, username, password) {
                    var that = this;
                    Util.extend(this.custom, {
                        method: method,
                        url: url,
                        async: typeof async === 'boolean' ? async : true,
                        username: username,
                        password: password,
                        options: {
                            url: url,
                            type: method
                        }
                    });
                    this.custom.timeout = function(timeout) {
                        if (typeof timeout === 'number') return timeout;
                        if (typeof timeout === 'string' && !~timeout.indexOf('-')) return parseInt(timeout, 10);
                        if (typeof timeout === 'string' && ~timeout.indexOf('-')) {
                            var tmp = timeout.split('-');
                            var min = parseInt(tmp[0], 10);
                            var max = parseInt(tmp[1], 10);
                            return Math.round(Math.random() * (max - min)) + min;
                        }
                    }(MockXMLHttpRequest._settings.timeout);
                    // 查找与请求参数匹配的数据模板
                    var item = find(this.custom.options);
                    function handle(event) {
                        // 同步属性 NativeXMLHttpRequest => MockXMLHttpRequest
                        for(var i = 0; i < XHR_RESPONSE_PROPERTIES.length; i++){
                            try {
                                that[XHR_RESPONSE_PROPERTIES[i]] = xhr[XHR_RESPONSE_PROPERTIES[i]];
                            } catch (e) {}
                        }
                        // 触发 MockXMLHttpRequest 上的同名事件
                        that.dispatchEvent(new Event(event.type /*, false, false, that*/ ));
                    }
                    // 如果未找到匹配的数据模板，则采用原生 XHR 发送请求。
                    if (!item) {
                        // 创建原生 XHR 对象，调用原生 open()，监听所有原生事件
                        var xhr = createNativeXMLHttpRequest();
                        this.custom.xhr = xhr;
                        // 初始化所有事件，用于监听原生 XHR 对象的事件
                        for(var i = 0; i < XHR_EVENTS.length; i++){
                            xhr.addEventListener(XHR_EVENTS[i], handle);
                        }
                        // xhr.open()
                        if (username) xhr.open(method, url, async, username, password);
                        else xhr.open(method, url, async);
                        // 同步属性 MockXMLHttpRequest => NativeXMLHttpRequest
                        for(var j = 0; j < XHR_REQUEST_PROPERTIES.length; j++){
                            try {
                                xhr[XHR_REQUEST_PROPERTIES[j]] = that[XHR_REQUEST_PROPERTIES[j]];
                            } catch (e) {}
                        }
                        return;
                    }
                    // 找到了匹配的数据模板，开始拦截 XHR 请求
                    this.match = true;
                    this.custom.template = item;
                    this.readyState = MockXMLHttpRequest.OPENED;
                    this.dispatchEvent(new Event('readystatechange' /*, false, false, this*/ ));
                },
                // https://xhr.spec.whatwg.org/#the-setrequestheader()-method
                // Combines a header in author request headers.
                setRequestHeader: function(name, value) {
                    // 原生 XHR
                    if (!this.match) {
                        this.custom.xhr.setRequestHeader(name, value);
                        return;
                    }
                    // 拦截 XHR
                    var requestHeaders = this.custom.requestHeaders;
                    if (requestHeaders[name]) requestHeaders[name] += ',' + value;
                    else requestHeaders[name] = value;
                },
                timeout: 0,
                withCredentials: false,
                upload: {},
                // https://xhr.spec.whatwg.org/#the-send()-method
                // Initiates the request.
                send: function send(data) {
                    var that = this;
                    this.custom.options.body = data;
                    // 原生 XHR
                    if (!this.match) {
                        this.custom.xhr.send(data);
                        return;
                    }
                    // 拦截 XHR
                    // X-Requested-With header
                    this.setRequestHeader('X-Requested-With', 'MockXMLHttpRequest');
                    // loadstart The fetch initiates.
                    this.dispatchEvent(new Event('loadstart' /*, false, false, this*/ ));
                    if (this.custom.async) setTimeout(done, this.custom.timeout) // 异步
                    ;
                    else done() // 同步
                    ;
                    function done() {
                        that.readyState = MockXMLHttpRequest.HEADERS_RECEIVED;
                        that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ));
                        that.readyState = MockXMLHttpRequest.LOADING;
                        that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ));
                        that.status = 200;
                        that.statusText = HTTP_STATUS_CODES[200];
                        // fix #92 #93 by @qddegtya
                        that.response = that.responseText = JSON.stringify(convert(that.custom.template, that.custom.options), null, 4);
                        that.readyState = MockXMLHttpRequest.DONE;
                        that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ));
                        that.dispatchEvent(new Event('load' /*, false, false, that*/ ));
                        that.dispatchEvent(new Event('loadend' /*, false, false, that*/ ));
                    }
                },
                // https://xhr.spec.whatwg.org/#the-abort()-method
                // Cancels any network activity.
                abort: function abort() {
                    // 原生 XHR
                    if (!this.match) {
                        this.custom.xhr.abort();
                        return;
                    }
                    // 拦截 XHR
                    this.readyState = MockXMLHttpRequest.UNSENT;
                    this.dispatchEvent(new Event('abort', false, false, this));
                    this.dispatchEvent(new Event('error', false, false, this));
                }
            });
            // 初始化 Response 相关的属性和方法
            Util.extend(MockXMLHttpRequest.prototype, {
                responseURL: '',
                status: MockXMLHttpRequest.UNSENT,
                statusText: '',
                // https://xhr.spec.whatwg.org/#the-getresponseheader()-method
                getResponseHeader: function(name) {
                    // 原生 XHR
                    if (!this.match) {
                        return this.custom.xhr.getResponseHeader(name);
                    }
                    // 拦截 XHR
                    return this.custom.responseHeaders[name.toLowerCase()];
                },
                // https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
                // http://www.utf8-chartable.de/
                getAllResponseHeaders: function() {
                    // 原生 XHR
                    if (!this.match) {
                        return this.custom.xhr.getAllResponseHeaders();
                    }
                    // 拦截 XHR
                    var responseHeaders = this.custom.responseHeaders;
                    var headers = '';
                    for(var h in responseHeaders){
                        if (!responseHeaders.hasOwnProperty(h)) continue;
                        headers += h + ': ' + responseHeaders[h] + '\r\n';
                    }
                    return headers;
                },
                overrideMimeType: function() {},
                responseType: '',
                response: null,
                responseText: '',
                responseXML: null
            });
            // EventTarget
            Util.extend(MockXMLHttpRequest.prototype, {
                addEventListener: function addEventListener(type, handle) {
                    var events = this.custom.events;
                    if (!events[type]) events[type] = [];
                    events[type].push(handle);
                },
                removeEventListener: function removeEventListener(type, handle) {
                    var handles = this.custom.events[type] || [];
                    for(var i = 0; i < handles.length; i++){
                        if (handles[i] === handle) {
                            handles.splice(i--, 1);
                        }
                    }
                },
                dispatchEvent: function dispatchEvent(event) {
                    var handles = this.custom.events[event.type] || [];
                    for(var i = 0; i < handles.length; i++){
                        handles[i].call(this, event);
                    }
                    var ontype = 'on' + event.type;
                    if (this[ontype]) this[ontype](event);
                }
            });
            // Inspired by jQuery
            function createNativeXMLHttpRequest() {
                var isLocal = function() {
                    var rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;
                    var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/;
                    var ajaxLocation = location.href;
                    var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
                    return rlocalProtocol.test(ajaxLocParts[1]);
                }();
                return window.ActiveXObject ? !isLocal && createStandardXHR() || createActiveXHR() : createStandardXHR();
                function createStandardXHR() {
                    try {
                        return new window._XMLHttpRequest();
                    } catch (e) {}
                }
                function createActiveXHR() {
                    try {
                        return new window._ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e) {}
                }
            }
            // 查找与请求参数匹配的数据模板：URL，Type
            function find(options) {
                for(var sUrlType in MockXMLHttpRequest.Mock._mocked){
                    var item = MockXMLHttpRequest.Mock._mocked[sUrlType];
                    if ((!item.rurl || match(item.rurl, options.url)) && (!item.rtype || match(item.rtype, options.type.toLowerCase()))) {
                        // console.log('[mock]', options.url, '>', item.rurl)
                        return item;
                    }
                }
                function match(expected, actual) {
                    if (Util.type(expected) === 'string') {
                        return expected === actual;
                    }
                    if (Util.type(expected) === 'regexp') {
                        return expected.test(actual);
                    }
                }
            }
            // 数据模板 ＝> 响应数据
            function convert(item, options) {
                return Util.isFunction(item.template) ? item.template(options) : MockXMLHttpRequest.Mock.mock(item.template);
            }
            module1.exports = MockXMLHttpRequest;
        /***/ }
    ]);
});
;


}),
"841": (function (module) {
/**
 * Helpers.
 */ var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */ module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
        return parse(val);
    } else if (type === 'number' && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */ function parse(str) {
    str = String(str);
    if (str.length > 100) {
        return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch(type){
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            return undefined;
    }
}
/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return Math.round(ms / d) + 'd';
    }
    if (msAbs >= h) {
        return Math.round(ms / h) + 'h';
    }
    if (msAbs >= m) {
        return Math.round(ms / m) + 'm';
    }
    if (msAbs >= s) {
        return Math.round(ms / s) + 's';
    }
    return ms + 'ms';
}
/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return ms + ' ms';
}
/**
 * Pluralization helper.
 */ function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


}),
"3374": (function (module, __unused_webpack_exports, __webpack_require__) {
var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? 'object' : 'symbol') ? Symbol.toStringTag : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;
var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype // eslint-disable-line no-proto
 ? function(O) {
    return O.__proto__; // eslint-disable-line no-proto
} : null);
function addNumericSeparator(num, str) {
    if (num === Infinity || num === -Infinity || num !== num || num && num > -1000 && num < 1000 || $test.call(/e/, str)) {
        return str;
    }
    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof num === 'number') {
        var int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
        if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, '$&_') + '.' + $replace.call($replace.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
        }
    }
    return $replace.call(str, sepRegex, '$&_');
}
var utilInspect = __webpack_require__(9809);
var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
var quotes = {
    __proto__: null,
    'double': '"',
    single: "'"
};
var quoteREs = {
    __proto__: null,
    'double': /(["\\])/g,
    single: /(['\\])/g
};
module.exports = function inspect_(obj, options, depth, seen) {
    var opts = options || {};
    if (has(opts, 'quoteStyle') && !has(quotes, opts.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (has(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number' ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }
    if (has(opts, 'indent') && opts.indent !== null && opts.indent !== '\t' && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (has(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    }
    var numericSeparator = opts.numericSeparator;
    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }
    if (typeof obj === 'string') {
        return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
        if (obj === 0) {
            return Infinity / obj > 0 ? '0' : '-0';
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
        var bigIntStr = String(obj) + 'n';
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }
    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') {
        depth = 0;
    }
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return isArray(obj) ? '[Array]' : '[Object]';
    }
    var indent = getIndent(opts, depth);
    if (typeof seen === 'undefined') {
        seen = [];
    } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }
    function inspect(value, from, noIndent) {
        if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
        }
        if (noIndent) {
            var newOpts = {
                depth: opts.depth
            };
            if (has(opts, 'quoteStyle')) {
                newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
    }
    if (typeof obj === 'function' && !isRegExp(obj)) {
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for(var i = 0; i < attrs.length; i++){
            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) {
            s += '...';
        }
        s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
        return s;
    }
    if (isArray(obj)) {
        if (obj.length === 0) {
            return '[]';
        }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
            return '[' + indentedJoin(xs, indent) + ']';
        }
        return '[ ' + $join.call(xs, ', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable.call(obj, 'cause')) {
            return '{ [' + String(obj) + '] ' + $join.call($concat.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
        }
        if (parts.length === 0) {
            return '[' + String(obj) + ']';
        }
        return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
    }
    if (typeof obj === 'object' && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
            return utilInspect(obj, {
                depth: maxDepth - depth
            });
        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
    }
    if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
            mapForEach.call(obj, function(value, key) {
                mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
            });
        }
        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
    }
    if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
            setForEach.call(obj, function(value) {
                setParts.push(inspect(value, obj));
            });
        }
        return collectionOf('Set', setSize.call(obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    // note: in IE 8, sometimes `global !== window` but both are the prototypes of each other
    /* eslint-env browser */ if (typeof window !== 'undefined' && obj === window) {
        return '{ [object Window] }';
    }
    if (typeof globalThis !== 'undefined' && obj === globalThis || typeof global !== 'undefined' && obj === global) {
        return '{ [object globalThis] }';
    }
    if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? '' : 'null prototype';
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? 'Object' : '';
        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
        var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
        if (ys.length === 0) {
            return tag + '{}';
        }
        if (indent) {
            return tag + '{' + indentedJoin(ys, indent) + '}';
        }
        return tag + '{ ' + $join.call(ys, ', ') + ' }';
    }
    return String(obj);
};
function wrapQuotes(s, defaultStyle, opts) {
    var style = opts.quoteStyle || defaultStyle;
    var quoteChar = quotes[style];
    return quoteChar + s + quoteChar;
}
function quote(s) {
    return $replace.call(String(s), /"/g, '&quot;');
}
function isArray(obj) {
    return toStr(obj) === '[object Array]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}
function isDate(obj) {
    return toStr(obj) === '[object Date]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}
function isRegExp(obj) {
    return toStr(obj) === '[object RegExp]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}
function isError(obj) {
    return toStr(obj) === '[object Error]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}
function isString(obj) {
    return toStr(obj) === '[object String]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}
function isNumber(obj) {
    return toStr(obj) === '[object Number]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}
function isBoolean(obj) {
    return toStr(obj) === '[object Boolean]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}
// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
    if (hasShammedSymbols) {
        return obj && typeof obj === 'object' && obj instanceof Symbol;
    }
    if (typeof obj === 'symbol') {
        return true;
    }
    if (!obj || typeof obj !== 'object' || !symToString) {
        return false;
    }
    try {
        symToString.call(obj);
        return true;
    } catch (e) {}
    return false;
}
function isBigInt(obj) {
    if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
        return false;
    }
    try {
        bigIntValueOf.call(obj);
        return true;
    } catch (e) {}
    return false;
}
var hasOwn = Object.prototype.hasOwnProperty || function(key) {
    return key in this;
};
function has(obj, key) {
    return hasOwn.call(obj, key);
}
function toStr(obj) {
    return objectToString.call(obj);
}
function nameOf(f) {
    if (f.name) {
        return f.name;
    }
    var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
    if (m) {
        return m[1];
    }
    return null;
}
function indexOf(xs, x) {
    if (xs.indexOf) {
        return xs.indexOf(x);
    }
    for(var i = 0, l = xs.length; i < l; i++){
        if (xs[i] === x) {
            return i;
        }
    }
    return -1;
}
function isMap(x) {
    if (!mapSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}
function isWeakMap(x) {
    if (!weakMapHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakMapHas.call(x, weakMapHas);
        try {
            weakSetHas.call(x, weakSetHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}
function isWeakRef(x) {
    if (!weakRefDeref || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakRefDeref.call(x);
        return true;
    } catch (e) {}
    return false;
}
function isSet(x) {
    if (!setSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}
function isWeakSet(x) {
    if (!weakSetHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakSetHas.call(x, weakSetHas);
        try {
            weakMapHas.call(x, weakMapHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}
function isElement(x) {
    if (!x || typeof x !== 'object') {
        return false;
    }
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}
function inspectString(str, opts) {
    if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
    }
    var quoteRE = quoteREs[opts.quoteStyle || 'single'];
    quoteRE.lastIndex = 0;
    // eslint-disable-next-line no-control-regex
    var s = $replace.call($replace.call(str, quoteRE, '\\$1'), /[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
}
function lowbyte(c) {
    var n = c.charCodeAt(0);
    var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
    }[n];
    if (x) {
        return '\\' + x;
    }
    return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
}
function markBoxed(str) {
    return 'Object(' + str + ')';
}
function weakCollectionOf(type) {
    return type + ' { ? }';
}
function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
}
function singleLineValues(xs) {
    for(var i = 0; i < xs.length; i++){
        if (indexOf(xs[i], '\n') >= 0) {
            return false;
        }
    }
    return true;
}
function getIndent(opts, depth) {
    var baseIndent;
    if (opts.indent === '\t') {
        baseIndent = '\t';
    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), ' ');
    } else {
        return null;
    }
    return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
    };
}
function indentedJoin(xs, indent) {
    if (xs.length === 0) {
        return '';
    }
    var lineJoiner = '\n' + indent.prev + indent.base;
    return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
}
function arrObjKeys(obj, inspect) {
    var isArr = isArray(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for(var i = 0; i < obj.length; i++){
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
        symMap = {};
        for(var k = 0; k < syms.length; k++){
            symMap['$' + syms[k]] = syms[k];
        }
    }
    for(var key in obj){
        if (!has(obj, key)) {
            continue;
        } // eslint-disable-line no-restricted-syntax, no-continue
        if (isArr && String(Number(key)) === key && key < obj.length) {
            continue;
        } // eslint-disable-line no-restricted-syntax, no-continue
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
            continue; // eslint-disable-line no-restricted-syntax, no-continue
        } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    if (typeof gOPS === 'function') {
        for(var j = 0; j < syms.length; j++){
            if (isEnumerable.call(obj, syms[j])) {
                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
            }
        }
    }
    return xs;
}


}),
"9809": (function (module, __unused_webpack_exports, __webpack_require__) {
module.exports = (__webpack_require__(3837)/* .inspect */.inspect);


}),
"5247": (function (__unused_webpack_module, exports, __webpack_require__) {

var parseUrl = (__webpack_require__(7310)/* .parse */.parse);
var DEFAULT_PORTS = {
    ftp: 21,
    gopher: 70,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443
};
var stringEndsWith = String.prototype.endsWith || function(s) {
    return s.length <= this.length && this.indexOf(s, this.length - s.length) !== -1;
};
/**
 * @param {string|object} url - The URL, or the result from url.parse.
 * @return {string} The URL of the proxy that should handle the request to the
 *  given URL. If no proxy is set, this will be an empty string.
 */ function getProxyForUrl(url) {
    var parsedUrl = typeof url === 'string' ? parseUrl(url) : url || {};
    var proto = parsedUrl.protocol;
    var hostname = parsedUrl.host;
    var port = parsedUrl.port;
    if (typeof hostname !== 'string' || !hostname || typeof proto !== 'string') {
        return ''; // Don't proxy URLs without a valid scheme or host.
    }
    proto = proto.split(':', 1)[0];
    // Stripping ports in this way instead of using parsedUrl.hostname to make
    // sure that the brackets around IPv6 addresses are kept.
    hostname = hostname.replace(/:\d*$/, '');
    port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
    if (!shouldProxy(hostname, port)) {
        return ''; // Don't proxy URLs that match NO_PROXY.
    }
    var proxy = getEnv('npm_config_' + proto + '_proxy') || getEnv(proto + '_proxy') || getEnv('npm_config_proxy') || getEnv('all_proxy');
    if (proxy && proxy.indexOf('://') === -1) {
        // Missing scheme in proxy, default to the requested URL's scheme.
        proxy = proto + '://' + proxy;
    }
    return proxy;
}
/**
 * Determines whether a given URL should be proxied.
 *
 * @param {string} hostname - The host name of the URL.
 * @param {number} port - The effective port of the URL.
 * @returns {boolean} Whether the given URL should be proxied.
 * @private
 */ function shouldProxy(hostname, port) {
    var NO_PROXY = (getEnv('npm_config_no_proxy') || getEnv('no_proxy')).toLowerCase();
    if (!NO_PROXY) {
        return true; // Always proxy if NO_PROXY is not set.
    }
    if (NO_PROXY === '*') {
        return false; // Never proxy if wildcard is set.
    }
    return NO_PROXY.split(/[,\s]/).every(function(proxy) {
        if (!proxy) {
            return true; // Skip zero-length hosts.
        }
        var parsedProxy = proxy.match(/^(.+):(\d+)$/);
        var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
        var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
        if (parsedProxyPort && parsedProxyPort !== port) {
            return true; // Skip if ports don't match.
        }
        if (!/^[.*]/.test(parsedProxyHostname)) {
            // No wildcards, so stop proxying if there is an exact match.
            return hostname !== parsedProxyHostname;
        }
        if (parsedProxyHostname.charAt(0) === '*') {
            // Remove leading wildcard.
            parsedProxyHostname = parsedProxyHostname.slice(1);
        }
        // Stop proxying if the hostname ends with the no_proxy host.
        return !stringEndsWith.call(hostname, parsedProxyHostname);
    });
}
/**
 * Get the value for an environment variable.
 *
 * @param {string} key - The name of the environment variable.
 * @return {string} The value of the environment variable.
 * @private
 */ function getEnv(key) {
    return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || '';
}
exports.getProxyForUrl = getProxyForUrl;


}),
"3663": (function (module) {

var replace = String.prototype.replace;
var percentTwenties = /%20/g;
var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};
module.exports = {
    'default': Format.RFC3986,
    formatters: {
        RFC1738: function(value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function(value) {
            return String(value);
        }
    },
    RFC1738: Format.RFC1738,
    RFC3986: Format.RFC3986
};


}),
"4250": (function (module, __unused_webpack_exports, __webpack_require__) {

var stringify = __webpack_require__(4573);
var parse = __webpack_require__(7372);
var formats = __webpack_require__(3663);
module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};


}),
"7372": (function (module, __unused_webpack_exports, __webpack_require__) {

var utils = __webpack_require__(7808);
var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;
var defaults = {
    allowDots: false,
    allowEmptyArrays: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decodeDotInKeys: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    duplicates: 'combine',
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictDepth: false,
    strictNullHandling: false
};
var interpretNumericEntities = function(str) {
    return str.replace(/&#(\d+);/g, function($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};
var parseArrayValue = function(val, options) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }
    return val;
};
// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')
// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')
var parseValues = function parseQueryStringValues(str, options) {
    var obj = {
        __proto__: null
    };
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    cleanStr = cleanStr.replace(/%5B/gi, '[').replace(/%5D/gi, ']');
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;
    var charset = options.charset;
    if (options.charsetSentinel) {
        for(i = 0; i < parts.length; ++i){
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }
    for(i = 0; i < parts.length; ++i){
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];
        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;
        var key;
        var val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
            val = utils.maybeMap(parseArrayValue(part.slice(pos + 1), options), function(encodedVal) {
                return options.decoder(encodedVal, defaults.decoder, charset, 'value');
            });
        }
        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(String(val));
        }
        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [
                val
            ] : val;
        }
        var existing = has.call(obj, key);
        if (existing && options.duplicates === 'combine') {
            obj[key] = utils.combine(obj[key], val);
        } else if (!existing || options.duplicates === 'last') {
            obj[key] = val;
        }
    }
    return obj;
};
var parseObject = function(chain, val, options, valuesParsed) {
    var leaf = valuesParsed ? val : parseArrayValue(val, options);
    for(var i = chain.length - 1; i >= 0; --i){
        var obj;
        var root = chain[i];
        if (root === '[]' && options.parseArrays) {
            obj = options.allowEmptyArrays && (leaf === '' || options.strictNullHandling && leaf === null) ? [] : [].concat(leaf);
        } else {
            obj = options.plainObjects ? {
                __proto__: null
            } : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, '.') : cleanRoot;
            var index = parseInt(decodedRoot, 10);
            if (!options.parseArrays && decodedRoot === '') {
                obj = {
                    0: leaf
                };
            } else if (!isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit) {
                obj = [];
                obj[index] = leaf;
            } else if (decodedRoot !== '__proto__') {
                obj[decodedRoot] = leaf;
            }
        }
        leaf = obj;
    }
    return leaf;
};
var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }
    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;
    // The regex chunks
    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;
    // Get the parent
    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;
    // Stash the parent if it exists
    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(parent);
    }
    // Loop through children appending to the array until we hit depth
    var i = 0;
    while(options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth){
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }
    // If there's a remainder, check strictDepth option for throw, else just add whatever is left
    if (segment) {
        if (options.strictDepth === true) {
            throw new RangeError('Input depth exceeded depth option of ' + options.depth + ' and strictDepth is true');
        }
        keys.push('[' + key.slice(segment.index) + ']');
    }
    return parseObject(keys, val, options, valuesParsed);
};
var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }
    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }
    if (typeof opts.decodeDotInKeys !== 'undefined' && typeof opts.decodeDotInKeys !== 'boolean') {
        throw new TypeError('`decodeDotInKeys` option can only be `true` or `false`, when provided');
    }
    if (opts.decoder !== null && typeof opts.decoder !== 'undefined' && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;
    var duplicates = typeof opts.duplicates === 'undefined' ? defaults.duplicates : opts.duplicates;
    if (duplicates !== 'combine' && duplicates !== 'first' && duplicates !== 'last') {
        throw new TypeError('The duplicates option must be either combine, first, or last');
    }
    var allowDots = typeof opts.allowDots === 'undefined' ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
    return {
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decodeDotInKeys: typeof opts.decodeDotInKeys === 'boolean' ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: typeof opts.depth === 'number' || opts.depth === false ? +opts.depth : defaults.depth,
        duplicates: duplicates,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictDepth: typeof opts.strictDepth === 'boolean' ? !!opts.strictDepth : defaults.strictDepth,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};
module.exports = function(str, opts) {
    var options = normalizeParseOptions(opts);
    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? {
            __proto__: null
        } : {};
    }
    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? {
        __proto__: null
    } : {};
    // Iterate over the keys and setup the new object
    var keys = Object.keys(tempObj);
    for(var i = 0; i < keys.length; ++i){
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }
    if (options.allowSparse === true) {
        return obj;
    }
    return utils.compact(obj);
};


}),
"4573": (function (module, __unused_webpack_exports, __webpack_require__) {

var getSideChannel = __webpack_require__(7879);
var utils = __webpack_require__(7808);
var formats = __webpack_require__(3663);
var has = Object.prototype.hasOwnProperty;
var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};
var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function(arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [
        valueOrArray
    ]);
};
var toISO = Date.prototype.toISOString;
var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: 'indices',
    charset: 'utf-8',
    charsetSentinel: false,
    commaRoundTrip: false,
    delimiter: '&',
    encode: true,
    encodeDotInKeys: false,
    encoder: utils.encode,
    encodeValuesOnly: false,
    filter: void undefined,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};
var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'symbol' || typeof v === 'bigint';
};
var sentinel = {};
var stringify = function stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
    var obj = object;
    var tmpSc = sideChannel;
    var step = 0;
    var findFlag = false;
    while((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag){
        // Where object last appeared in the ref tree
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            } else {
                findFlag = true; // Break while
            }
        }
        if (typeof tmpSc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function(value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        });
    }
    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
        }
        obj = '';
    }
    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
            return [
                formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))
            ];
        }
        return [
            formatter(prefix) + '=' + formatter(String(obj))
        ];
    }
    var values = [];
    if (typeof obj === 'undefined') {
        return values;
    }
    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            obj = utils.maybeMap(obj, encoder);
        }
        objKeys = [
            {
                value: obj.length > 0 ? obj.join(',') || null : void undefined
            }
        ];
    } else if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }
    var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);
    var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + '[]' : encodedPrefix;
    if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
        return adjustedPrefix + '[]';
    }
    for(var j = 0; j < objKeys.length; ++j){
        var key = objKeys[j];
        var value = typeof key === 'object' && key && typeof key.value !== 'undefined' ? key.value : obj[key];
        if (skipNulls && value === null) {
            continue;
        }
        var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, '%2E') : String(key);
        var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? '.' + encodedKey : '[' + encodedKey + ']');
        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify(value, keyPrefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, generateArrayPrefix === 'comma' && encodeValuesOnly && isArray(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
    }
    return values;
};
var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }
    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }
    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
    }
    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }
    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];
    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }
    var arrayFormat;
    if (opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if ('indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = defaults.arrayFormat;
    }
    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }
    var allowDots = typeof opts.allowDots === 'undefined' ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat: arrayFormat,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};
module.exports = function(object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);
    var objKeys;
    var filter;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }
    var keys = [];
    if (typeof obj !== 'object' || obj === null) {
        return '';
    }
    var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
    var commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;
    if (!objKeys) {
        objKeys = Object.keys(obj);
    }
    if (options.sort) {
        objKeys.sort(options.sort);
    }
    var sideChannel = getSideChannel();
    for(var i = 0; i < objKeys.length; ++i){
        var key = objKeys[i];
        var value = obj[key];
        if (options.skipNulls && value === null) {
            continue;
        }
        pushToArray(keys, stringify(value, key, generateArrayPrefix, commaRoundTrip, options.allowEmptyArrays, options.strictNullHandling, options.skipNulls, options.encodeDotInKeys, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
    }
    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';
    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }
    return joined.length > 0 ? prefix + joined : '';
};


}),
"7808": (function (module, __unused_webpack_exports, __webpack_require__) {

var formats = __webpack_require__(3663);
var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;
var hexTable = function() {
    var array = [];
    for(var i = 0; i < 256; ++i){
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }
    return array;
}();
var compactQueue = function compactQueue(queue) {
    while(queue.length > 1){
        var item = queue.pop();
        var obj = item.obj[item.prop];
        if (isArray(obj)) {
            var compacted = [];
            for(var j = 0; j < obj.length; ++j){
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }
            item.obj[item.prop] = compacted;
        }
    }
};
var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? {
        __proto__: null
    } : {};
    for(var i = 0; i < source.length; ++i){
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }
    return obj;
};
var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */ if (!source) {
        return target;
    }
    if (typeof source !== 'object' && typeof source !== 'function') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [
                target,
                source
            ];
        }
        return target;
    }
    if (!target || typeof target !== 'object') {
        return [
            target
        ].concat(source);
    }
    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }
    if (isArray(target) && isArray(source)) {
        source.forEach(function(item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return t