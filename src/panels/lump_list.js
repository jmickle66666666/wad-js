function makeUL(array) {
	// Create the list element:
	var list = document.createElement('ol');
	list.id = "lumpUL";

	var lumptypes = [ "png", "mp3", "music", "midi",
		"text", "flat", "graphic", "map", "mapdata"
		];

	for (var i = 0; i < lumptypes.length; ++i) {
		var item = document.createElement('li');
		var dropdown = document.createElement('div');
		dropdown.className = 'dropdown';

		var button = document.createElement('button');
		button.type = 'button';
		button.dataset.toggle = 'dropdown';
		button.innerHTML = getIcon(lumptypes[i]);
		button.innerHTML += " " + lumptypes[i];
		dropdown.appendChild(button);

		var dropdownMenu = document.createElement('ul');	
		dropdownMenu.className = 'dropdown-menu';
		dropdownMenu.id = lumptypes[i] + 'Toggle';
		dropdown.appendChild(dropdownMenu);
		item.appendChild(dropdown);
		list.appendChild(item);
	}

	for(var i = 0; i < array.length; i++) {
		item = document.createElement('li');
		var span = document.createElement('span');
		span.innerHTML += getIcon(array[i][0]);
		var name = document.createTextNode(' '+array[i][1]);
		span.appendChild(name);
		item.appendChild(span);
		item.className='item';
		item.className += " " + array[i][0] + " " + i;
		
		if (lumptypes.indexOf(array[i][0]) !== -1) 
		{
			list.querySelector('#' + array[i][0] + "Toggle").appendChild(item);
		} else {
			list.appendChild(item);
		}
	}

	// Finally, return the constructed list:
	return list;
}
