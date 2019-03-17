export const TEXT = 'text';
export const MAP = 'map';
export const MAPDATA = 'mapdata';
export const MUSIC = 'music';
export const MIDI = 'midi';
export const MP3 = 'mp3';
export const PNG = 'png';
export const MUS = 'mus';
export const GRAPHIC = 'graphic';
export const FLAT = 'flat';
export const MARKER = 'marker';
export const ENDOOM = 'ENDOOM';
export const TEXTUREx = ['TEXTURE1', 'TEXTURE2'];

export const TEXTLUMPS = ['DEHACKED', 'MAPINFO', 'ZMAPINFO', 'EMAPINFO',
    'DMXGUS', 'DMXGUSC', 'WADINFO', 'EMENUS', 'MUSINFO',
    'SNDINFO', 'GLDEFS', 'KEYCONF', 'SCRIPTS', 'LANGUAGE',
    'DECORATE', 'SBARINFO', 'MENUDEF'];
export const DATA_LUMPS = ['PLAYPAL', 'COLORMAP', 'TEXTURE1', 'TEXTURE2', 'PNAMES',
    'ENDOOM'];

export const DEFAULT_EXTENSION = 'lmp';
export const EXTENSIONS = {
    text: 'txt',
    mp3: 'mp3',
    mus: 'mus',
    midi: 'mid',
    png: 'png',
};

// The value of constants which name contains the word "SIZE" is a number of bytes.

export const IWAD = 'IWAD';

export const PWAD = 'PWAD';

export const VALID_FILE_FORMATS = ['', 'application/x-doom', 'application/zip'];

export const VALID_WAD_TYPES = [IWAD, PWAD];

export const MAP_LUMPS = [
    'THINGS', 'LINEDEFS', 'SIDEDEFS', 'VERTEXES', 'SEGS', 'TEXTMAP', 'SSECTORS', 'NODES', 'SECTORS', 'REJECT', 'BLOCKMAP', 'BEHAVIOR', 'ZNODES',
];

export const OPENGL_LUMPS = [
    'GL_VERT', 'GL_SEGS', 'GL_SSECT', 'GL_NODES', 'GL_PVS',
];

export const THINGS = 'THINGS';

export const PLAYPAL = 'PLAYPAL';

export const COLORMAP = 'COLORMAP';

export const PNAMES = 'PNAMES';

export const UNCATEGORIZED = 'uncategorized';

export const IMAGE_LUMPS = ['patches', 'flats', 'sprites'];

export const LUMP_INDEX_ENTRY_SIZE = 16;

export const LUMP_INDEX_ENTRY_OFFSET_TO_LUMP_SIZE = 4;

export const LUMP_INDEX_ENTRY_OFFSET_TO_LUMP_NAME = 8;

export const COLOR_COUNT_PER_PALETTE = 256;

export const PALETTE_SIZE = 768;

export const COLORMAP_SIZE = 256;

export const BYTES_PER_COLOR = 3;
export const GREEN_COLOR_OFFSET = 1;
export const BLUE_COLOR_OFFSET = 2;

export const FLAT_DIMENSIONS = 64;

export const IMAGE_DATA_HEADER_SIZE = 8;

export const IMAGE_DATA_BOUNDARY = 255;

export const TRANSPARENT_PIXEL = -1;
