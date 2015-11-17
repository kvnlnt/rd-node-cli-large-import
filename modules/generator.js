/**
 * Main Generator function
 * @param {Object} options result of command line options
 */
function Generator(options){
    this.options = options || {};
}

/**
 * Main Generator methods
 * @type {Object}
 */
Generator.prototype = {
    generate: function(){
        console.log('generate');
    }
};

module.exports = Generator;