export const TEXT = 'text';
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

/* Environment */

export const NO_BRAND_ENV = 'development-no-brand';

/* File formats */

export const SUPPORTED_FORMATS = [
    '.wad',
    '.zip',
    '.pk3',
    '.json',
];

export const VALID_FILE_FORMATS = [
    '',
    'application/x-doom',
    'application/zip',
    'application/json',
];

/* WAD types */

export const IWAD = 'IWAD';
export const PWAD = 'PWAD';
export const VALID_WAD_TYPES = [IWAD, PWAD];

/* Lump types */

export const MAP = 'maps';

export const INTERMISSION = 'intermission';

export const STATUS_BAR = 'status bar';

export const MENU = 'menu';

export const IMAGE_LUMPS = [
    'patches',
    'flats',
    'sprites',
    MENU,
    INTERMISSION,
    STATUS_BAR,
];

export const UNCATEGORIZED = 'uncategorized';

/* Lump names */

export const THINGS = 'THINGS';

export const TEXTMAP = 'TEXTMAP';

export const ENDMAP = 'ENDMAP';

export const MAP_LUMPS = [
    THINGS,
    'LINEDEFS',
    'SIDEDEFS',
    'VERTEXES',
    'SEGS',
    'TEXTMAP',
    'SSECTORS',
    'NODES',
    'SECTORS',
    'REJECT',
    'BLOCKMAP',
    // Hexen only
    'BEHAVIOR',
    // ZDoom only? (optional)
    'SCRIPTS',
    // Universal Doom Map Format only
    'ZNODES',
    'DIALOGUE',
];

export const OPENGL_MAP_LUMPS = [
    'GL_VERT',
    'GL_SEGS',
    'GL_SSECT',
    'GL_NODES',
    'GL_PVS',
];

export const INTERMISSION_LUMPS = new RegExp(/^WI[0-9a-zA-Z_]{1,}$/);

// Doom II
export const INTERMISSION_MAP_NAME_LUMPS = new RegExp(/^CWILV[0-9a-zA-Z_]{1,}$/);

export const STATUS_BAR_LUMPS = new RegExp(/^(ST|AMM|BRDR_)[0-9a-zA-Z_]{1,}$/);

/* Unique lumps */

export const ANSI_LUMPS = [
    // Doom or Chex Quest
    'ENDOOM',
    // Heretic
    'ENDTEXT',
    // Strife
    'ENDSTRF',
    // Boom
    'ENDBOOM',
    // lack of ANSI lump in IWAD = Hexen
];

export const MAPINFO = ['MAPINFO', 'ZMAPINFO'];

export const PLAYPAL = 'PLAYPAL';
export const COLORMAP = 'COLORMAP';

export const PNAMES = 'PNAMES';

export const SBARINFO = 'SBARINFO';

// Hexen only
export const SNDINFO = 'SNDINFO';

export const MENU_SCREENS = [
    'TITLEPIC',
    'HELP',
    'HELP1',
    'HELP2',
    'CREDIT',
];

export const INTER_SCREENS = [
    'INTERPIC',
    // Doom 1 registered
    'ENDPIC',
    'VICTORY2',
    'PFUB1',
    'PFUB2',
    // Doom 2
    'BOSSBACK',
];

export const MUSIC_LUMPS = [
    'GENMIDI',
    'DMXGUS',
    'DMXGUSC',
];

export const DEMO_LUMPS = [
    'DEMO1',
    'DEMO2',
    'DEMO3',
    'DEMO4',
];

export const END_LUMPS = new RegExp(/^END[0-9]{1,}$/);

/* Lump original formats */

export const ANSI = 'ANSI';

/* Lump special values */

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

export const HEXEN_SOUND_ARCHIVE_PATH = '$ARCHIVEPATH';

export const HEXEN_SOUND_REGISTERED = '$REGISTERED';

export const HEXEN_MUSIC_KEYWORD = '$MAP';

/* Worker internal errors */

export const INVALID_TEXT = 'INVALID_TEXT';

/* MUS -> MIDI conversion */

export const MUS_HEADER = 'MUS';
export const MUS_HEADER_SIGNATURE = ['M'.charCodeAt(0), 'U'.charCodeAt(0), 'S'.charCodeAt(0), 0x1A].join(' ');
export const MIDI_HEADER = 'MThd';
export const MIDI_HEADER_SIZE = 4;
export const MIDI_HEADER_DATA = [
    'M'.charCodeAt(0), 'T'.charCodeAt(0), 'h'.charCodeAt(0), 'd'.charCodeAt(0), // Main header
    0x00, 0x00, 0x00, 0x06, // Header size
    0x00, 0x00, // MIDI type (0)
    0x00, 0x01, // Number of tracks
    0x00, 0x46, // Resolution
    'M'.charCodeAt(0), 'T'.charCodeAt(0), 'r'.charCodeAt(0), 'k'.charCodeAt(0), // Start of track
    0x00, 0x00, 0x00, 0x00, // Placeholder for track length
];

export const MUS_NUM_CHANNELS = 16;
export const MUS_PERCUSSION_CHANNEL = 15;
export const MIDI_PERCUSSION_CHANNEL = 9;
export const MIDI_TRACKLENGTH_OFS = 18;

export const MIDI_CONTROLLER_MAP = [
    0x00, 0x20, 0x01, 0x07, 0x0A, 0x0B, 0x5B, 0x5D, 0x40, 0x43, 0x78, 0x7B, 0x7E, 0x7F, 0x79,
];

// MUS event codes
export const MUS_RELEASE_KEY = 0x00;
export const MUS_PRESS_KEY = 0x10;
export const MUS_PITCH_WHEEL = 0x20;
export const MUS_SYSTEM_EVENT = 0x30;
export const MUS_CHANGE_CONTROLLER = 0x40;
export const MUS_SCORE_END = 0x60;

// MIDI event codes
export const MIDI_RELEASE_KEY = 0x80;
export const MIDI_PRESS_KEY = 0x90;
export const MIDI_CHANGE_CONTROLLER = 0xB0;
export const MIDI_CHANGE_PATCH = 0xC0;
export const MIDI_PITCH_WHEEL = 0xE0;

/* MIDI player */

export const MAX_I16 = 2 ** 15;

export const MIDI_AUDIO_BUFFER_SIZE = 8192;

// signed 16-bit samples
export const MIDI_AUDIO_S16LSB = 0x8010;

export const MIDI_PATCH_URL = '/public/midi/pat/';

export const MIDI_ERROR = 'MIDI_ERROR';

export const MIDI_STATUS = 'MIDI_STATUS';

export const MIDI_PRELOAD = 'MIDI_PRELOAD';

export const MIDI_LOAD_FILE = 'MIDI_LOAD_FILE';

export const MIDI_LOAD_PATCH = 'MIDI_LOAD_PATCH';

export const MIDI_PLAY = 'MIDI_PLAY';

export const MIDI_PAUSE = 'MIDI_PAUSE';

export const MIDI_RESUME = 'MIDI_RESUME';

export const MIDI_STOP = 'MIDI_STOP';

export const MIDI_END = 'MIDI_END';

/* ANSI conversion */

export const ANSI_CODE_PAGE_437_TABLES = [
    '', '☺', '☻', '♥', '♦', '♣', '♠', '•', '◘', '○', '◙', '♂', '♀', '♪', '♫', '☼',
    '►', '◄', '↕', '‼', '¶', '§', '▬', '↨', '↑', '↓', '→', '←', '∟', '↔', '▲', '▼',
    ' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
    '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~', '⌂',
    'Ç', 'ü', 'é', 'â', 'ä', 'à', 'å', 'ç', 'ê', 'ë', 'è', 'ï', 'î', 'ì', 'Ä', 'Å',
    'É', 'æ', 'Æ', 'ô', 'ö', 'ò', 'û', 'ù', 'ÿ', 'Ö', 'Ü', '¢', '£', '¥', '₧', 'ƒ',
    'á', 'í', 'ó', 'ú', 'ñ', 'Ñ', 'ª', 'º', '¿', '⌐', '¬', '½', '¼', '¡', '«', '»',
    '░', '▒', '▓', '│', '┤', '╡', '╢', '╖', '╕', '╣', '║', '╗', '╝', '╜', '╛', '┐',
    '└', '┴', '┬', '├', '─', '┼', '╞', '╟', '╚', '╔', '╩', '╦', '╠', '═', '╬', '╧',
    '╨', '╤', '╥', '╙', '╘', '╒', '╓', '╫', '╪', '┘', '┌', '█', '▄', '▌', '▐', '▀',
    'α', 'ß', 'Γ', 'π', 'Σ', 'σ', 'µ', 'τ', 'Φ', 'Θ', 'Ω', 'δ', '∞', 'φ', 'ε', '∩',
    '≡', '±', '≥', '≤', '⌠', '⌡', '÷', '≈', '°', '∙', '·', '√', 'ⁿ', '²', '■', ' ',
];

export const ANSI_BACKGROUND_COLOR_CODES = [
    'black',
    'blue',
    'green',
    'cyan',
    'red',
    'magenta',
    'brown',
    'light-gray',
];

export const ANSI_FOREGROUND_COLOR_CODES = [
    'black',
    'blue',
    'green',
    'cyan',
    'red',
    'magenta',
    'brown',
    'light-gray',
    'dark-gray',
    'light-blue',
    'light-green',
    'light-cyan',
    'light-red',
    'light-magenta',
    'yellow',
    'white',
];
