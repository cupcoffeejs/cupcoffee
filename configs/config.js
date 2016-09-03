require('dotenv').config();

module.exports = (target) => {
    var target = target.toUpperCase();
    var result = process.env['CUPCOFFEE_' + target] || process.env['NODE_CUPCOFFEE_' + target] || process.env['NODE_' + target] || process.env[target] || undefined;

    if (result == 'true' || result == "TRUE") {
        return true
    }

    if (result == 'false' || result == "FALSE") {
        return false
    }

    if (result == 'null' || result == "NULL") {
        return null
    }

    return result;
}