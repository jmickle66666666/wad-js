module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		browserify: {
			build: {
				options: {
					browserifyOptions: {
						debug: true
					},
				},
				files: {
					'dist/parser.bundle.js': ['src/wad/parser.js']
				}
			}
		},

		extract_sourcemap: {
			build: {
				options: {
					removeSourcesContent: false
				},
				files: {
					'dist': ['dist/parser.bundle.js']
				}
			}
		},

		uglify: {
			build: {
				options: {
					sourceMap: true
				},
				files: {
					'dist/wad.min.js': [
						'dist/parser.bundle.js',
						'src/wad/constants.js',
						'src/wad.js',
						'src/wad/mapdata.js',
						'src/wad/detectlump.js',
						'src/wad/playpal.js',
						'src/wad/colormap.js',
						'src/wad/endoom.js',
						'src/wad/flat.js',
						'src/wad/graphic.js',
						'src/wad/util.js',
						'src/wad/mus2midi.js'
					]
					'dist/ui.min.js': [
						'src/panels/wad_overview.js',
						'src/panels/lump_list.js',
						'src/panels/audio.js',
						'src/panels/text.js',
						'src/panels/image.js',
						'src/panels/midi.js',
						'src/ui.js'
					]
				}	
			}
		}
	});


	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-extract-sourcemap');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['browserify', 'extract_sourcemap', 'uglify']);
}
