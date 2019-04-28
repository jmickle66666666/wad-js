
function getMapSize({ vertices }) {
  const mostLeftX = vertices.reduce((mostLeft, vertex) => {
      if (vertex.x < min) {
        return vertex.x;
      }
      
      return min;
  })
}
