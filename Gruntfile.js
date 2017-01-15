module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			build: {
				files: {
					'dist/wad.min.js': ['src/wad.js', 'src/mapdata.js'],
					'dist/ui.min.js': ['src/ui/create_el.js', 'src/ui.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['uglify']);
}
