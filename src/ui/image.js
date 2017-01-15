function createImagePreview(data) {
    var blob = new Blob([data]);
    imageEl = new Image();
    imageEl.src = URL.createObjectURL(blob);
    $('#preview').append(imageEl);
}
