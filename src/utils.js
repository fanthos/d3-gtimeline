//var moment = require("moment"),
//    d3 = require("d3");
    
// import { createDuration } from 'moment/src/lib/duration/create';
// import {humanize} from 'moment/src/lib/duration/humanize';

// import {default as moment} from 'moment/moment';

export function durationFormat(seconds) {
    function round10(x) {
        return Math.round(x * 10) / 10;
    }
    var cutoff = 2;
    var ret;
    if (seconds < cutoff * 60) {
        ret = seconds + 's';
    } else if (seconds < cutoff * 60 * 60) {
        ret = round10(seconds / 60) + ' min';
    } else if (seconds < cutoff * 60 * 60 * 24) {
        ret = round10(seconds / 3600) + ' hours';
    } else if (seconds < cutoff * 3600 * 24 * 30) {
        ret = round10(seconds / 86400) + ' day(s)';
    } else if (seconds < cutoff * 3600 * 24 * 365) {
        ret = round10(seconds / (86400 * 30)) + ' month(s)';
    } else {
        ret = round10(seconds / (86400 * 365)) + ' year(s)';
    }
    return ret;
}

//
// Function composition
//
// Function.prototype.wrap = function(g) {
//      var fn = this;
//      return function() {
//          return g.call(this, fn.apply(this, arguments));
//      };
// };

// Function.prototype.compose = function(g) {
//      var fn = this;
//      return function() {
//          return fn.call(this, g.apply(this, arguments));
//      };
// };

// export function compose() {
//     var funcs = [].slice.call(arguments, 1),
//         first = arguments[0];
//     return function () {
//         return funcs.reduce(function(value, fn) {
//             return fn.call(this, value);
//         }, first.apply(this, arguments));
//     }
// }

export function f(value) {
    return function(d) {
        return value === undefined? d: d[value];
    }
}