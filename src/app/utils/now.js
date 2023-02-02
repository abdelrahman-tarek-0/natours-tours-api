/**
 * @description function to get the current time
 * @param {String} unit - the unit of time {millie, second, minute, hour, day}
 * @returns {Number} the time in the unit of time
 * @example now('millie') // 1620000000000
 */
const now = (unit) => {
   const hrTime = process.hrtime()
   switch (unit) {
      case 'millie':
         return hrTime[0] * 1000 + hrTime[1] / 1000000
      case 'micro':
         return hrTime[0] * 1000000 + hrTime[1] / 1000
      case 'nano':
         return hrTime[0] * 1000000000 + hrTime[1]
      case 'second':
         return hrTime[0] + hrTime[1] / 1000000000
      case 'minute':
         return (hrTime[0] + hrTime[1] / 1000000000) / 60
      case 'hour':
         return (hrTime[0] + hrTime[1] / 1000000000) / 3600
      case 'day':
         return (hrTime[0] + hrTime[1] / 1000000000) / 86400
      default:
         return hrTime[0] * 1000000000 + hrTime[1]
   }
}

module.exports = now
