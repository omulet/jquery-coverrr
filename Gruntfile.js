module.exports = function(grunt) {

	grunt.initConfig({

		// Import package manifest
		pkg: grunt.file.readJSON("coverrr.jquery.json"),

		// Banner definitions
		meta: {
			banner: "/*\n" +
				" *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
				" *  <%= pkg.description %>\n" +
				" *  <%= pkg.homepage %>\n" +
				" *\n" +
				" *  Made by <%= pkg.author.name %>\n" +
				" *  Under <%= pkg.licenses[0].type %> License\n" +
				" */\n"
		},

		concat: {
			dist: {
				src: ["src/jquery.coverrr.js"],
				dest: "dist/jquery.coverrr.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		jshint: {
			files: ["src/jquery.coverrr.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		uglify: {
			my_target: {
				src: ["dist/jquery.coverrr.js"],
				dest: "dist/jquery.coverrr.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		coffee: {
			compile: {
				files: {
					"dist/jquery.coverrr.js": "src/jquery.coverrr.coffee"
				}
			}
		},
		
		watch: {
		    files: ['src/*'],
		    tasks: ['default'],
		    options: {
		      livereload: true,
		    }
		}

	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-coffee");
	grunt.loadNpmTasks("grunt-contrib-watch");

	// grunt.registerTask("default", ["jshint", "concat", "uglify"]);
	grunt.registerTask("default", ["coffee", "uglify"]);
	grunt.registerTask("travis", ["jshint"]);

};
