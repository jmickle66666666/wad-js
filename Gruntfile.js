module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			build: {
				files: {
					'dist/wad.min.js': ['src/wad.js', 'src/mapdata.js'],
					'dist/ui.min.js': ['src/ui/lump_list.js', 'src/ui/audio.js', 'src/ui/text.js', 'src/ui/image.js', 'src/ui/midi.js', 'src/ui.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['uglify']);
}
