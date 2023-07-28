const {nanoid} = require('nanoid');

const generateId = (feature) => `${feature}-${nanoid(16)}`;

module.exports = generateId;
