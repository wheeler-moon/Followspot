const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const Database = require('better-sqlite3');

if (require('electron-squirrel-startup')) app.quit();

let db;

function getDb() {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'followspot.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS shows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      theatre TEXT,
      producer TEXT,
      designer TEXT,
      associate_ld TEXT,
      assistant_ld TEXT,
      production_electrician TEXT,
      programmer TEXT,
      logo_path TEXT,
      num_spots INTEGER DEFAULT 2,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS spots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id INTEGER NOT NULL,
      spot_number INTEGER NOT NULL,
      fixture_type TEXT,
      location TEXT,
      operator_name TEXT,
      FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS color_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spot_id INTEGER NOT NULL,
      slot_number INTEGER,
      is_permanent INTEGER DEFAULT 0,
      gel_number TEXT,
      gel_name TEXT,
      FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS scenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id INTEGER NOT NULL,
      sort_order INTEGER,
      label TEXT NOT NULL,
      act_break INTEGER DEFAULT 0,
      song TEXT,
      FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id INTEGER NOT NULL,
      sort_order INTEGER,
      name TEXT NOT NULL,
      actor_name TEXT,
      costume_notes TEXT,
      FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS cues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id INTEGER NOT NULL,
      lq_number TEXT,
      track_number INTEGER,
      scene_id INTEGER,
      caller_notes TEXT,
      rehearsal_notes TEXT,
      ignore INTEGER DEFAULT 0,
      sort_order INTEGER,
      FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
      FOREIGN KEY (scene_id) REFERENCES scenes(id)
    );
    CREATE TABLE IF NOT EXISTS spot_cues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cue_id INTEGER NOT NULL,
      spot_id INTEGER NOT NULL,
      action TEXT,
      character_id INTEGER,
      frame_size TEXT,
      intensity TEXT,
      fade_time TEXT,
      location TEXT,
      active_frames TEXT,
      description TEXT,
      ignore INTEGER DEFAULT 0,
      FOREIGN KEY (cue_id) REFERENCES cues(id) ON DELETE CASCADE,
      FOREIGN KEY (spot_id) REFERENCES spots(id)
    );
    CREATE TABLE IF NOT EXISTS gels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manufacturer TEXT NOT NULL,
      gel_number TEXT NOT NULL,
      gel_name TEXT NOT NULL
    );
  `);
  seedGels();
}

function seedGels() {
  const count = db.prepare('SELECT COUNT(*) as c FROM gels').get();
  if (count.c > 0) return;
  const insert = db.prepare('INSERT INTO gels (manufacturer, gel_number, gel_name) VALUES (?, ?, ?)');
  const insertMany = db.transaction((gels) => {
    for (const g of gels) insert.run(g[0], g[1], g[2]);
  });
  insertMany([
    ['Rosco','R01','Light Bastard Amber'],['Rosco','R02','Bastard Amber'],
    ['Rosco','R03','Straw'],['Rosco','R04','Medium Bastard Amber'],
    ['Rosco','R05','Orange Gold'],['Rosco','R06','No Color Straw'],
    ['Rosco','R07','Pale Yellow'],['Rosco','R08','Pale Gold'],
    ['Rosco','R09','Pale Amber Gold'],['Rosco','R10','Medium Yellow'],
    ['Rosco','R11','Light Straw'],['Rosco','R12','Straw'],
    ['Rosco','R13','Straw Tint'],['Rosco','R14','Medium Straw'],
    ['Rosco','R15','Deep Straw'],['Rosco','R16','Light Amber'],
    ['Rosco','R17','Light Flame'],['Rosco','R18','Flame'],
    ['Rosco','R19','Fire'],['Rosco','R20','Medium Amber'],
    ['Rosco','R21','Gold Amber'],['Rosco','R22','Deep Amber'],
    ['Rosco','R23','Orange'],['Rosco','R24','Scarlet'],
    ['Rosco','R25','Sunset Red'],['Rosco','R26','Light Red'],
    ['Rosco','R27','Medium Red'],['Rosco','R28','Bright Red'],
    ['Rosco','R29','Plasa Red'],['Rosco','R30','Light Salmon'],
    ['Rosco','R31','Salmon Pink'],['Rosco','R32','Medium Salmon Pink'],
    ['Rosco','R33','No Color Pink'],['Rosco','R34','Flesh Pink'],
    ['Rosco','R35','Light Pink'],['Rosco','R36','Medium Pink'],
    ['Rosco','R37','Pale Rose Pink'],['Rosco','R38','Light Rose'],
    ['Rosco','R39','Pink'],['Rosco','R40','Aurora Pink'],
    ['Rosco','R41','Salmon'],['Rosco','R42','Deep Salmon'],
    ['Rosco','R43','Deep Pink'],['Rosco','R44','Middle Rose'],
    ['Rosco','R45','Rose'],['Rosco','R46','Magenta'],
    ['Rosco','R47','Light Rose Purple'],['Rosco','R48','Rose Purple'],
    ['Rosco','R49','Medium Purple'],['Rosco','R50','Mauve'],
    ['Rosco','R51','Lavender'],['Rosco','R52','Light Lavender'],
    ['Rosco','R53','Pale Lavender'],['Rosco','R54','Special Lavender'],
    ['Rosco','R55','Lilac'],['Rosco','R56','Gypsy Lavender'],
    ['Rosco','R57','Light Violet'],['Rosco','R58','Deep Lavender'],
    ['Rosco','R59','Indigo'],['Rosco','R60','No Color Blue'],
    ['Rosco','R61','Mist Blue'],['Rosco','R62','Booster Blue'],
    ['Rosco','R63','Pale Blue'],['Rosco','R64','Light Steel Blue'],
    ['Rosco','R65','Daylight Blue'],['Rosco','R66','Cool Blue'],
    ['Rosco','R67','Light Sky Blue'],['Rosco','R68','Sky Blue'],
    ['Rosco','R69','Brilliant Blue'],['Rosco','R70','Nile Blue'],
    ['Rosco','R71','Sea Blue'],['Rosco','R72','Azure Blue'],
    ['Rosco','R73','Peacock Blue'],['Rosco','R74','Night Blue'],
    ['Rosco','R75','Evening Blue'],['Rosco','R76','Light Green Blue'],
    ['Rosco','R77','Green Blue'],['Rosco','R78','Trudy Blue'],
    ['Rosco','R79','Bright Blue'],['Rosco','R80','Primary Blue'],
    ['Rosco','R81','Urban Blue'],['Rosco','R82','Surprise Blue'],
    ['Rosco','R83','Medium Blue'],['Rosco','R84','Zephyr Blue'],
    ['Rosco','R85','Deep Blue'],['Rosco','R86','Pea Green'],
    ['Rosco','R87','Pale Yellow Green'],['Rosco','R88','Light Green'],
    ['Rosco','R89','Moss Green'],['Rosco','R90','Dark Yellow Green'],
    ['Rosco','R91','Primary Green'],['Rosco','R92','Turquoise'],
    ['Rosco','R93','Blue Green'],['Rosco','R94','Kelly Green'],
    ['Rosco','R95','Medium Blue Green'],['Rosco','R96','Lime'],
    ['Rosco','R97','Light Grey'],['Rosco','R98','Neutral Grey'],
    ['Rosco','R99','Chocolate'],['Rosco','R100','Frost'],
    ['Lee','L001','Pale Yellow'],['Lee','L002','Pale Amber'],
    ['Lee','L003','Straw'],['Lee','L004','Medium Bastard Amber'],
    ['Lee','L005','Rose Tint'],['Lee','L006','No Color Straw'],
    ['Lee','L008','Pale Gold'],['Lee','L009','Pale Amber Gold'],
    ['Lee','L010','Medium Yellow'],['Lee','L013','Straw Tint'],
    ['Lee','L015','Deep Straw'],['Lee','L016','Light Amber'],
    ['Lee','L017','Light Flame'],['Lee','L018','Flame'],
    ['Lee','L019','Fire'],['Lee','L020','Medium Amber'],
    ['Lee','L021','Gold Amber'],['Lee','L022','Deep Amber'],
    ['Lee','L023','Orange'],['Lee','L024','Scarlet'],
    ['Lee','L025','Sunset Red'],['Lee','L026','Bright Red'],
    ['Lee','L035','Light Pink'],['Lee','L036','Medium Pink'],
    ['Lee','L038','Light Rose'],['Lee','L039','Pink'],
    ['Lee','L044','Middle Rose'],['Lee','L045','Rose'],
    ['Lee','L046','Magenta'],['Lee','L048','Rose Purple'],
    ['Lee','L049','Medium Purple'],['Lee','L050','Mauve'],
    ['Lee','L051','Lavender'],['Lee','L052','Light Lavender'],
    ['Lee','L053','Pale Lavender'],['Lee','L058','Deep Lavender'],
    ['Lee','L059','Indigo'],['Lee','L061','Mist Blue'],
    ['Lee','L063','Pale Blue'],['Lee','L064','Light Steel Blue'],
    ['Lee','L065','Daylight Blue'],['Lee','L066','Cool Blue'],
    ['Lee','L068','Sky Blue'],['Lee','L069','Brilliant Blue'],
    ['Lee','L079','Bright Blue'],['Lee','L080','Primary Blue'],
    ['Lee','L085','Deep Blue'],['Lee','L088','Light Green'],
    ['Lee','L089','Moss Green'],['Lee','L091','Primary Green'],
    ['Lee','L092','Turquoise'],['Lee','L094','Kelly Green'],
    ['Lee','L096','Lime'],['Lee','L100','Frost'],
    ['Lee','L101','Light Frost'],['Lee','L109','Light Brown'],
    ['Lee','L119','Dark Blue'],['Lee','L120','Deep Blue'],
    ['Lee','L129','Heavy Frost'],['Lee','L131','Marine Blue'],
    ['Lee','L134','Golden Amber'],['Lee','L147','Apricot'],
    ['Lee','L148','Bright Rose'],['Lee','L149','Scarlet'],
    ['Lee','L150','Ice Blue'],['Lee','L152','Pale Gold'],
    ['Lee','L156','Chocolate'],['Lee','L157','Pink'],
    ['Lee','L158','Deep Orange'],['Lee','L160','Slate Blue'],
    ['Lee','L161','Slate Blue'],['Lee','L162','Bastard Amber'],
    ['Lee','L164','Flame Red'],['Lee','L165','Daylight Blue'],
    ['Lee','L169','Lilac Tint'],['Lee','L170','Deep Lavender'],
    ['Lee','L172','Lagoon Blue'],['Lee','L176','Loving Amber'],
    ['Lee','L179','Chrome Orange'],['Lee','L180','Dark Lavender'],
    ['Lee','L181','Congo Blue'],['Lee','L182','Light Red'],
    ['Lee','L183','Moonlight Blue'],['Lee','L184','Cosmetic Peach'],
    ['Lee','L190','Cosmetic Peach'],['Lee','L192','Flesh Pink'],
    ['Lee','L193','Rosy Amber'],['Lee','L194','Surprise Pink'],
    ['Lee','L195','Zenith Blue'],['Lee','L196','True Blue'],
    ['Lee','L197','Alice Blue'],['Lee','L198','Palace Blue'],
    ['Lee','L199','Regal Blue'],['Lee','L200','Double CT Blue'],
    ['Lee','L201','Full CT Blue'],['Lee','L202','Half CT Blue'],
    ['Lee','L204','Full CT Orange'],['Lee','L205','Half CT Orange'],
  ]);
}

function setupIPC() {
  ipcMain.on('db-get-shows', (event) => {
    try {
      const shows = getDb().prepare('SELECT * FROM shows ORDER BY created_at DESC').all();
      event.returnValue = shows;
    } catch(e) { event.returnValue = []; }
  });

  ipcMain.on('db-create-show', (event, { form, spots }) => {
    try {
      const database = getDb();
      const showStmt = database.prepare(`
        INSERT INTO shows (title, theatre, producer, designer, associate_ld,
          assistant_ld, production_electrician, programmer, num_spots)
        VALUES (@title, @theatre, @producer, @designer, @associate_ld,
          @assistant_ld, @production_electrician, @programmer, @num_spots)
      `);
      const spotStmt = database.prepare(`
        INSERT INTO spots (show_id, spot_number, fixture_type, location, operator_name)
        VALUES (@show_id, @spot_number, @fixture_type, @location, @operator_name)
      `);
      const gelStmt = database.prepare(`
        INSERT INTO color_slots (spot_id, slot_number, is_permanent, gel_number, gel_name)
        VALUES (@spot_id, @slot_number, @is_permanent, @gel_number, @gel_name)
      `);
      const create = database.transaction(() => {
        const showResult = showStmt.run({ ...form, num_spots: spots.length });
        const showId = showResult.lastInsertRowid;
        for (const spot of spots) {
          const spotResult = spotStmt.run({
            show_id: showId,
            spot_number: spot.spot_number,
            fixture_type: spot.fixture_type || '',
            location: spot.location || '',
            operator_name: spot.operator_name || '',
          });
          const spotId = spotResult.lastInsertRowid;
          for (const gel of spot.gels) {
            gelStmt.run({
              spot_id: spotId,
              slot_number: gel.slot,
              is_permanent: 0,
              gel_number: gel.gel_number || '',
              gel_name: gel.gel_name || '',
            });
          }
          if (spot.perm_gel_number || spot.perm_gel_name) {
            gelStmt.run({
              spot_id: spotId,
              slot_number: null,
              is_permanent: 1,
              gel_number: spot.perm_gel_number || '',
              gel_name: spot.perm_gel_name || '',
            });
          }
        }
      });
      create();
      event.returnValue = { success: true };
    } catch(e) {
      console.error(e);
      event.returnValue = { success: false, error: e.message };
    }
  });

  ipcMain.on('db-search-gels', (event, query) => {
    try {
      const q = '%' + query + '%';
      const results = getDb().prepare(`
        SELECT * FROM gels
        WHERE gel_number LIKE ? OR gel_name LIKE ?
        ORDER BY manufacturer, gel_number
        LIMIT 20
      `).all(q, q);
      event.returnValue = results;
    } catch(e) { event.returnValue = []; }
  });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  getDb();
  setupIPC();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});