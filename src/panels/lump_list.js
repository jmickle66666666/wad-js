function makeUL(array) {
	// Create the list element:
	var list = document.createElement('ol');
	list.id = "lumpUL";

	for(var i = 0; i < array.length; i++) {
		// Create the list item:
		var item = document.createElement('li');

		// Set its contents:
		var span = document.createElement('span');
		span.innerHTML += getIcon(array[i][0]);
		var name = document.createTextNode(' '+array[i][1]);
		span.appendChild(name);
		item.appendChild(span);

		item.id='item';

		// Add it to the list:
		list.appendChild(item);
	}

	// Finally, return the constructed list:
	return list;
}
