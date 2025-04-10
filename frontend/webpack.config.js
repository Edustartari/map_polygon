var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var fs = require('fs');

// Create and entry dict
var entries = {}

console.log(path.join(__dirname, '', 'js'))

// JSX entrypoints
var folder_pool = [
	path.join(__dirname, '', 'js'),
]
// folder_pool = [ '/home/eduardo/coding/edu_projects/interviews/mozio/frontend/js' ]

for (var i = folder_pool.length - 1; i >= 0; i--) {
	var current_folder = folder_pool[i];
	
	// List all the files in the current folder
	var files = fs.readdirSync(path.join(current_folder));
	// files = [ 'components', 'index.js' ]

	// Append all the keys to the dict
	for (var j= files.length - 1; j >= 0; j--) {
		var file = files[j];

		if(file.includes('.js')){
			entries[file] = path.join(current_folder, file);
		} else {
			let inside_files = fs.readdirSync(path.join(current_folder, file));
			for (let j= inside_files.length - 1; j >= 0; j--) {
				let inside_file = inside_files[j];
				entries[inside_file] = path.join(path.join(current_folder, file), inside_file);
			}
		}
	}
}

// entries = {
//   'index.js': '/home/eduardo/coding/edu_projects/interviews/mozio/frontend/js/index.js',
//   'Map.js': '/home/eduardo/coding/edu_projects/interviews/mozio/frontend/js/components/Map.js',
//   'DrawRectangle.js': '/home/eduardo/coding/edu_projects/interviews/mozio/frontend/js/components/DrawRectangle.js',
//   'App.js': '/home/eduardo/coding/edu_projects/interviews/mozio/frontend/js/components/App.js'
// }

// Get current path
let current_path = path.join(__dirname, '')
// Remove 'frontend' text from the path
let application_path = current_path.replace('frontend', '')

module.exports = {
	entry: entries,  
	output: {
		path: path.join(application_path, 'static'),
		filename: (pathData) => {
			var extension = pathData.chunk.name.split('.').pop();
			var name = pathData.chunk.name.replace('.' + extension, '');

			if (extension === 'js') {
				// eslint-disable-next-line
				var output_extension = 'js'
			}
			if (extension === 'css') {
				// eslint-disable-next-line
				var output_extension = 'css'
			}

			return name + '_bundle.' + output_extension
		}
	},  
	plugins: [
		new BundleTracker({
			path: __dirname,
			filename: 'webpack-stats.json'
		})
	],
    module: {
		rules: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
			{
                test: /\.(png|jpe?g|gif|webp)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            }
		],
	},
	resolve: {
		extensions: ['.ts', '.js', '.jsx', '.css'],
		alias: {
		   "@": path.resolve(__dirname, ""),
		}
	},
}