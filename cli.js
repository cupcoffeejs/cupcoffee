#! /usr/bin/node

const opt = require('optimist').argv,
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    util = require('util'),
    execSync = require('child_process').execSync,
    validator = require('validator'),
    merge = require('utils-merge'),
    inquirer = require('inquirer');

var cache = {},
    pack;
var appDefaultDir = ['app/controllers', 'app/models', 'app/views', 'app/routes', 'public']


var config = (callback) => {
    console.log('Creating cupcoffee.json...');
    fs.writeFile('./cupcoffee.json', JSON.stringify(cache, null, 2), (err) => {
        if (err) throw err;
        else {
            console.log('cupcoffee.json ......................... OK!');

            if (callback) {
                callback()
            }
        }
    })
}

var create = () => {
    console.log('Creating index.js...');

    fs.writeFile('./index.js', JSON.stringify("require('cupcoffe-mvc')().start();"), (err) => {
        if (err) throw err;
        else {
            console.log('index.js ......................... OK!');

            config(()=> {
                console.log('Creating default directories...');

                appDefaultDir.forEach((dir) => {
                    console.log(dir + ' ......................... OK!');
                    mkdirp.sync(dir)
                })

                console.log('Downloading CupCoffee MVC modules...');

                var npm = 'npm i --save cupcoffee-mvc';

                if (cache.app[cache.app.env].database.config.dialect) {
                    if (cache.app[cache.app.env].database.config.dialect == 'mysql') {
                        npm += ' mysql';
                    }
                    else if (cache.app[cache.app.env].database.config.dialect == 'sqlite') {
                        npm += ' sqlite3';
                    }
                    else if (cache.app[cache.app.env].database.config.dialect == 'mssql') {
                        npm += ' tedious';
                    }
                    else if (cache.app[cache.app.env].database.config.dialect == 'postgres') {
                        npm += ' pg pg-hstore';
                    }
                }

                if (execSync(npm)) {
                    console.log(' ......................... Download completed');
                    console.log('Setting package.json...')
                    if (pack.name) {
                        pack.scripts = {
                            "start": "node ."
                        }

                        fs.writeFile('./package.json', JSON.stringify(pack, null, 2), (err) => {
                            if (err) throw err;
                            else {
                                console.log("Good luck!");
                            }
                        })
                    }
                    else {
                        console.log("Good luck!");
                    }
                }
            });
        }
    });


}

var packageJson = (callback, error) => {
    try {
        pack = JSON.parse(fs.readFileSync('./package.json').toString());
        callback();
    }
    catch (e) {
        if (error) {
            console.error(' ERROR: package.json not found.\n Before you run this application you need to set the package.json. To make it, run \'npm init\'.')
            return;
        }

        callback();
    }

}

var createWithCli = (callback) => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the application name?',
            default: () => {
                if (pack && pack.name) {
                    return pack.name;
                }

                return null;
            },
            validate: function (value) {

                return value ? true : 'You will need a name to continue';
            }
        },
        {
            type: 'input',
            name: 'port',
            message: 'On which port you want run the application?',
            default: () => {
                return 80;
            },
            validate: function (value) {
                if (validator.isNumeric(value.toString())) {
                    return true;
                }

                return 'Use only numbers';
            }
        },
        {
            type: 'list',
            name: 'env',
            message: 'In what environment you are in that moment?',
            choices: [
                {
                    name: 'Development',
                    value: 'development'
                },
                {
                    name: 'Production',
                    value: 'production'
                }
            ]
        },
        {
            type: 'list',
            name: 'database',
            message: 'What type of database you want to use',
            choices: [
                {
                    name: 'MySQL',
                    value: 'mysql'
                },
                {
                    name: 'PostgreSQL',
                    value: 'postgres'
                },
                {
                    name: 'SQLite',
                    value: 'sqlite'
                },
                {
                    name: 'MSSQL',
                    value: 'mssql'
                },
                {
                    name: 'Do not use any database!',
                    value: false
                }
            ]
        }
    ]).then((answers) => {
        cache.app = {};
        cache.app.env = answers.env;
        cache.app[cache.app.env] = {};
        cache.app[cache.app.env].port = answers.port;
        console.log(answers.database)
        if (answers.database) {
            cache.app[cache.app.env].database = {};
            cache.app[cache.app.env].database.config = {};
            cache.app[cache.app.env].database.config.dialect = answers.database;

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'host',
                    message: 'What is the database host?',
                    default: () => {
                        return 'localhost'
                    }
                },
                {
                    type: 'input',
                    name: 'schema',
                    message: 'What is the database name you want to use?',
                    validate: function (value) {
                        return value ? true : 'You must define a name of a database';
                    }
                },
                {
                    type: 'input',
                    name: 'username',
                    message: 'What username database?',
                    default: () => {
                        return 'root'
                    }
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'What is the database password?'
                }
            ]).then((answers) => {
                cache.app[cache.app.env].database.config.host = answers.host;
                cache.app[cache.app.env].database.schema = answers.schema;
                cache.app[cache.app.env].database.username = answers.username;
                cache.app[cache.app.env].database.password = answers.password;

                callback();
            })
        }
        else {
            callback();
        }
    });
}

var createWithFlags = () => {
    if (!opt['_'][1] && !opt.name && !pack.name) {
        console.log('ERROR: You need to define a name for your application')
        return false;
    }

    cache.app = {};
    cache.app.name = opt.name ? opt.name : (opt['_'][1]) ? opt['_'][1] : pack.name;
    cache.app.env = (opt.env) ? opt.env : 'production';
    cache.app[cache.app.env] = {};
    cache.app[cache.app.env].port = (opt.port) ? opt.port : '80';

    if (opt.database) {
        cache.app[cache.app.env].database = opt.database;
    }

    if (opt.db) {
        cache.app[cache.app.env].database = opt.db;
    }

    return true;
}

switch (opt['_'][0]) {
    case 'create':
        packageJson(() => {
            if (createWithFlags()) {
                create()
            }
        }, true)
        break;
    case 'config':
        packageJson(() => {
            if (createWithFlags()) {
                config();
            }
        })
        break;
    default:

        if(opt.v || opt.version){
            console.log(require('./package.json')['version']);
            return
        }

        inquirer.prompt([
            {
                type: 'list',
                name: 'menu',
                message: 'What do you want me to do?',
                choices: [
                    {
                        name: 'Create a new project, now!',
                        value: 'create'
                    },
                    {
                        name: 'Set an existing project!',
                        value: 'config'
                    },
                    {
                        name: 'Nothing, bye.',
                        value: 'exit'
                    }
                ]
            }
        ]).then(function (answers) {
            switch (answers.menu) {
                case 'create':
                    packageJson(() => {
                        createWithCli(() => {
                            create()
                        })
                    }, true)

                    break;
                case 'config':
                    packageJson(() => {
                        createWithCli(() => {
                            config()
                        })
                    })

                    break;
                case 'exit':
                    console.log('Bye, bye...')
                    break;
            }
        });
        break;
}



