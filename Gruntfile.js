/*jshint camelcase: false*/
// Generated on 2013-12-29 using generator-chrome-extension 0.2.5
'use strict';


// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        manifest: grunt.file.readJSON('app/manifest.json'),
        pkg: grunt.file.readJSON('package.json'),
        yeoman: yeomanConfig,
        'bower-install': {
            app: {
                src: ['<%= yeoman.app %>/popup.html', '<%= yeoman.app %>/options.html'],
                ignorePath: '<%= yeoman.app %>'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                'test/**/*_spec.js',
                'test/helper.js'
            ]
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            }
        },
        useminPrepare: {
            html: [
                '<%= yeoman.app %>/popup.html',
                '<%= yeoman.app %>/options.html',
                '<%= yeoman.app %>/templates/*'
            ],
            options: {
                dest: '<%= yeoman.dist %>/'
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        usemin: {
            options: {
                dirs: ['<%= yeoman.dist %>']
            },
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
        },
        htmlmin: {
            dist: {
                options: {
                    // removeComments: true
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                    // collapseWhitespace: true
                    // removeAttributeQuotes: true,
                    // removeRedundantAttributes: true,
                    // useShortDoctype: true,
                    // removeEmptyAttributes: true,
                    // removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '{,*/}*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        concat: {
            dist: {
                src: ['<%= yeoman.app %>/scripts/cookie-event.js',
                        '<%= yeoman.app %>/scripts/background.js'],
                dest: '.tmp/concat/scripts/background.js'
            }
        },
        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },
        // TODO: check what causes the error within
        //       the vendor code when activating mangle
        uglify: {
            options: {
                mangle: false
            },
        },
        // Put files not handled in other tasks here
        copy: {
            strip_code_prepare: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '.tmp/concat',
                    src: [
                        'scripts/background.js',
                        'scripts/cookie-event.js'
                    ]
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        'scripts/background.js',
                        'scripts/cookie-event.js'
                    ]
                }]
            }
        },
        chromeManifest: {
            dist: {
                options: {
                    buildnumber: false,
                    background: {
                        target:'scripts/background.js'
                    }
                },
                src: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist %>'
            }
        },
        compress: {
            dist: {
                options: {
                    archive: 'packages/cookie-monitor_v<%= manifest.version%>.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        },
        protractor: {
            options: {
                keepAlive: true,
                noColor: false,
                args: {
                    includeStackTrace: true,
                    verbose: true,
                    params: {
                        initialNrOfRows: 0
                    }
                }
            },
            dist: {
                options: {
                    configFile: 'test/e2e.conf.dist.js'
                }
            },
            dev: {
                options: {
                    configFile: 'test/e2e.conf.dev.js',
                    args: {
                        params: {
                            initialNrOfRows: 2
                        }
                    }
                }
            }
        },
        strip_code: {
            removeTestCode: {
                options: {
                    start_commend: 'test-code',
                    end_comment: 'end-test-code'
                },
                src: '.tmp/concat/scripts/*.js'
            },
            removeConsoleLog: {
                options: {
                    pattern: /.*console.log\(.*/g
                },
                src: '.tmp/concat/scripts/*.js'
            }
        },
        crx: {
            production: {
                'src': '<%= yeoman.dist %>',
                'dest': 'packages/<%= pkg.name %>-v<%= manifest.version %>.crx',
                'baseURL': 'https://github.com/olafstauffer/cookie-monitor/packages',
                'exclude': ['.git', '*.pem'],
                'privateKey': 'keys/id_rsa_cookie-monitor.pem',
                'options': {
                    'maxBuffer': 3000 * 1024
                }
            }
        }
    });

    grunt.registerTask('test', [
        'chromeManifest',
        'protractor:dist'
    ]);

    grunt.registerTask('package', [
        'clean:dist',
        'bower-install',
        'useminPrepare',
        'concat:generated',
        'concat:dist',
        'strip_code',
        'ngAnnotate',
        'uglify',
        'cssmin',
        'imagemin',
        'htmlmin',
        'usemin',
        'copy:dist',
        'chromeManifest',
        'crx'
    ]);

        
    grunt.registerTask('build', [
        'clean:dist',
        'bower-install',
        'useminPrepare',
        'concat:generated',
        'copy:strip_code_prepare',
        'strip_code',
        'ngAnnotate',
        'uglify',
        'cssmin',
        'imagemin',
        'htmlmin',
        'usemin',
        'copy:dist'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};
