function makeUL(array) {
	// Create the list element:
	var list = document.createElement('ol');
	list.id = "lumpUL";

	var item = document.createElement('li');
	var dropdown = document.createElement('div');
	dropdown.className = 'dropdown';

	var button = document.createElement('button');
	button.type = 'button';
	button.dataset.toggle = 'dropdown';
	button.innerHTML = getIcon(MAPDATA);
	button.innerHTML += " MAPDATA";
	dropdown.appendChild(button);

        var dropdownMenu = document.createElement('ul');	
	dropdownMenu.className = 'dropdown-menu';
	dropdownMenu.id = 'graphicsToggle';
	dropdown.appendChild(dropdownMenu);
	item.appendChild(dropdown);
	list.appendChild(item);

	for(var i = 0; i < array.length; i++) {
		item = document.createElement('li');
		var span = document.createElement('span');
		span.innerHTML += getIcon(array[i][0]);
		var name = document.createTextNode(' '+array[i][1]);
		span.appendChild(name);
		item.appendChild(span);
		item.className='item';
		item.className += " " + array[i][0] + " " + i;
		
		if (array[i][0] == "mapdata") 
		{
			dropdownMenu.appendChild(item);
		} else {
			list.appendChild(item);
		}
	}

	// Finally, return the constructed list:
	return list;
}
