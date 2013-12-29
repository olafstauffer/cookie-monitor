/*jshint camelcase: false*/
// Generated on 2013-12-29 using generator-chrome-extension 0.2.5
'use strict';
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

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
        yeoman: yeomanConfig,
        'bower-install': {
            app: {
                src: ['<%= yeoman.app %>/popup.html'],
                ignorePath: '<%= yeoman.app %>'
            }
        },
    });

    grunt.registerTask('build', [
        'bower-install'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
