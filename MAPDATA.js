
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

function createMapPreview({ data, palette }) {
    if (!data || !data.LINEDEFS) {
        return null;
    }
  
    let mapPalette = {};
    if (!palette || palette.length !== COLOR_COUNT_PER_PALETTE) {
        console.warn('No valid palette found. Map preview will be drawn with default color scheme.', { palette });
        mapPalette = DEFAULT_MAP_PALETTE;
    } else {
        mapPalette = {
          background: palette[0],
          solidWall: palette[176],
          lowerWall: palette[64],
          upperWall: palette[231],
        }
    }
  
    
}
