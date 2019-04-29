
function getMapSize({ vertices }) {
  const minX = vertices.reduce((mX, vertex) => {
      if (vertex.x < mX) {
        return vertex.x;
      }
      
      return mX;
  }):
  
  const maxX = vertices.reduce((mX, vertex) => {
      if (vertex.x > mX) {
        return vertex.x;
      }
      
      return mX;
  });
  
  const minY = vertices.reduce((mX, vertex) => {
      if (vertex.y < mX) {
        return vertex.y;
      }
      
      return mX;
  }):
  
  const maxY = vertices.reduce((mX, vertex) => {
      if (vertex.y > mX) {
        return vertex.y;
      }
      
      return mX;
  });
  

  
  const width = maxX - minX;
  const height = maxY - maxY;
  
  return {
      minX,
      maxX,
      minY,
      maxY,
      width,
      height,
  };
}

function createMapPreview({ data }) {
    
}
