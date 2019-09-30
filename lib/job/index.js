'use strict';

/**
 * Internal method to turn priority into a number
 * @param {String|Number} priority string to parse into number
 * @returns {Number} priority that was parsed
 */
const parsePriority = priority => {
  const priorityMap = {
    lowest: -20,
    low: -10,
    normal: 0,
    high: 10,
    highest: 20
  };
  if (typeof priority === 'number' || priority instanceof Number) {
    return priority;
  }
  return priorityMap[priority];
};

/**
 * Internal method to track property value changes of a job's attr object
 * @param {Object} attrs a job's attr object, which should be a plain-old js object
 * @returns {Object} A proxy that behaves exactly like a plain-old object except for an additional property "_changedProps" which is an array of property names that indicates those whose property value of this object has been changed
 */
const wrapAttrs = (attrs) => {
  let changedProps = {};
  return new Proxy(attrs, {
    get(target, p, receiver) {
      if (p === '_changedProps') {
        return Object.keys(changedProps);
      } else if (p === '_clearChanges') {
        return () => {changedProps = {};};
      } else {
        return Reflect.get(target, p, receiver);
      }
    },
    set(target, p, value, receiver) {
      changedProps[p] = true;
      return Reflect.set(target, p, value, receiver);
    }
  });
};

/**
 * @class
 * @param {Object} args - Job Options
 * @property {Object} agenda - The Agenda instance
 * @property {Object} attrs
 */
class Job {
  constructor(args) {
    args = args || {};

    // Remove special args
    this.agenda = args.agenda;
    delete args.agenda;

    // Process args
    args.priority = parsePriority(args.priority) || 0;

    // Set attrs to args
    const attrs = {};
    for (const key in args) {
      if ({}.hasOwnProperty.call(args, key)) {
        attrs[key] = args[key];
      }
    }

    // Set defaults if undefined
    // NOTE: What is the difference between 'once' here and 'single' in agenda/index.js?
    attrs.nextRunAt = attrs.nextRunAt || new Date();
    attrs.type = attrs.type || 'once';

    this.attrs = wrapAttrs(attrs);
  }
}

Job.prototype.toJSON = require('./to-json');
Job.prototype.computeNextRunAt = require('./compute-next-run-at');
Job.prototype.repeatEvery = require('./repeat-every');
Job.prototype.repeatAt = require('./repeat-at');
Job.prototype.disable = require('./disable');
Job.prototype.enable = require('./enable');
Job.prototype.unique = require('./unique');
Job.prototype.schedule = require('./schedule');
Job.prototype.priority = require('./priority');
Job.prototype.fail = require('./fail');
Job.prototype.run = require('./run');
Job.prototype.isRunning = require('./is-running');
Job.prototype.save = require('./save');
Job.prototype.remove = require('./remove');
Job.prototype.touch = require('./touch');

module.exports = Job;
