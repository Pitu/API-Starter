const uuidv4 = require('uuid/v4');

class Util {
	static uuid() {
		return uuidv4();
	}
}

module.exports = Util;
