/**
 * @description a function to filter the object by the given keys
 * @param {object} obj - Object to be filtered
 * @param {string[]} allowedKeys - Array of allowed keys
 * @returns {object}  Filtered object
 * @example filterObj({name: 'John', age: 30},['name']) // {name: 'John'}
 */
const filterObj = (obj, allowedKeys) => {
   Object.keys(obj).forEach((key) => {
      if (!allowedKeys.includes(key)) {
         delete obj[key]
      }
   })
   return obj
}

const filterNullUsers = (arr) =>
   arr?.filter((r) => {
      // console.log(r);
      if (r.user !== null) {
         return true
      }
      return false
   })
module.exports = { filterObj, filterNullUsers }
