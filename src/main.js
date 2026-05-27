const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const Database = require('better-sqlite3');
const { generateSpotSheetPDF, generateCallerSheetPDF, generateColorLoadPDF } = require('./pdfGenerator');

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
      photo_path TEXT,
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
      notes TEXT,
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
  try { db.exec('ALTER TABLE characters ADD COLUMN photo_path TEXT'); } catch(e) {}
}

function seedGels() {
  const count = db.prepare('SELECT COUNT(*) as c FROM gels').get();
  if (count.c >= 500) return;
  db.prepare('DELETE FROM gels').run();
  const insert = db.prepare('INSERT INTO gels (manufacturer, gel_number, gel_name) VALUES (?, ?, ?)');
  const insertMany = db.transaction((gels) => {
    for (const g of gels) insert.run(g[0], g[1], g[2]);
  });
  insertMany([
    // ROSCO ROSCOLUX - Colors
    ['Rosco','R00','Clear'],
    ['Rosco','R01','Light Bastard Amber'],['Rosco','R02','Bastard Amber'],
    ['Rosco','R03','Dark Bastard Amber'],['Rosco','R04','Medium Bastard Amber'],
    ['Rosco','R05','Rose Tint'],['Rosco','R06','No Color Straw'],
    ['Rosco','R07','Pale Yellow'],['Rosco','R08','Pale Gold'],
    ['Rosco','R09','Pale Amber Gold'],['Rosco','R10','Medium Yellow'],
    ['Rosco','R11','Light Straw'],['Rosco','R12','Straw'],
    ['Rosco','R13','Straw Tint'],['Rosco','R14','Medium Straw'],
    ['Rosco','R15','Deep Straw'],['Rosco','R16','Light Amber'],
    ['Rosco','R17','Light Flame'],['Rosco','R18','Flame'],
    ['Rosco','R19','Fire'],['Rosco','R20','Medium Amber'],
    ['Rosco','R21','Golden Amber'],['Rosco','R22','Deep Amber'],
    ['Rosco','R23','Orange'],['Rosco','R24','Scarlet'],
    ['Rosco','R25','Orange Red'],['Rosco','R26','Light Red'],
    ['Rosco','R27','Medium Red'],['Rosco','R28','Bright Red'],
    ['Rosco','R29','Plasa Red'],['Rosco','R30','Light Salmon Pink'],
    ['Rosco','R31','Salmon Pink'],['Rosco','R32','Medium Salmon Pink'],
    ['Rosco','R33','No Color Pink'],['Rosco','R34','Floral Pink'],
    ['Rosco','R35','Light Pink'],['Rosco','R36','Medium Pink'],
    ['Rosco','R37','Pale Rose Pink'],['Rosco','R38','Light Rose'],
    ['Rosco','R39','Skelton Exotic Sangria'],['Rosco','R40','Light Salmon'],
    ['Rosco','R41','Salmon'],['Rosco','R42','Deep Salmon'],
    ['Rosco','R43','Deep Pink'],['Rosco','R44','Middle Rose'],
    ['Rosco','R45','Rose'],['Rosco','R46','Magenta'],
    ['Rosco','R47','Light Rose Purple'],['Rosco','R48','Rose Purple'],
    ['Rosco','R49','Medium Purple'],['Rosco','R50','Mauve'],
    ['Rosco','R51','Surprise Pink'],['Rosco','R52','Light Lavender'],
    ['Rosco','R53','Pale Lavender'],['Rosco','R54','Special Lavender'],
    ['Rosco','R55','Lilac'],['Rosco','R56','Dark Amethyst'],
    ['Rosco','R57','Lavender'],['Rosco','R58','Deep Lavender'],
    ['Rosco','R59','Indigo'],['Rosco','R60','No Color Blue'],
    ['Rosco','R61','Mist Blue'],['Rosco','R62','Booster Blue'],
    ['Rosco','R63','Pale Blue'],['Rosco','R64','Light Steel Blue'],
    ['Rosco','R65','Daylight Blue'],['Rosco','R66','Cool Blue'],
    ['Rosco','R67','Light Sky Blue'],['Rosco','R68','Sky Blue'],
    ['Rosco','R69','Brilliant Blue'],['Rosco','R70','Nile Blue'],
    ['Rosco','R71','Sea Blue'],['Rosco','R72','Azure Blue'],
    ['Rosco','R73','Peacock Blue'],['Rosco','R74','Night Blue'],
    ['Rosco','R75','Twilight Blue'],['Rosco','R76','Light Green Blue'],
    ['Rosco','R77','Green Blue'],['Rosco','R78','Trudy Blue'],
    ['Rosco','R79','Bright Blue'],['Rosco','R80','Primary Blue'],
    ['Rosco','R81','Urban Blue'],['Rosco','R82','Surprise Blue'],
    ['Rosco','R83','Medium Blue'],['Rosco','R84','Zephyr Blue'],
    ['Rosco','R85','Deep Blue'],['Rosco','R86','Pea Green'],
    ['Rosco','R87','Pale Yellow Green'],['Rosco','R88','Light Green'],
    ['Rosco','R89','Moss Green'],['Rosco','R90','Dark Yellow Green'],
    ['Rosco','R91','Primary Green'],['Rosco','R92','Turquoise'],
    ['Rosco','R93','Blue Green'],['Rosco','R94','Kelly Green'],
    ['Rosco','R95','Medium Green'],['Rosco','R96','Lime'],
    ['Rosco','R97','Light Grey'],['Rosco','R98','Medium Grey'],
    ['Rosco','R99','Chocolate'],
    // ROSCO 300-series
    ['Rosco','R303','Warm Peach'],['Rosco','R304','Pale Apricot'],
    ['Rosco','R305','Rose Gold'],['Rosco','R310','Daffodil'],
    ['Rosco','R312','Canary'],['Rosco','R313','Light Relief Yellow'],
    ['Rosco','R316','Gallo Gold'],['Rosco','R317','Apricot'],
    ['Rosco','R318','Mayan Sun'],['Rosco','R321','Soft Golden Amber'],
    ['Rosco','R324','Cherry Red'],['Rosco','R331','Shell Pink'],
    ['Rosco','R332','Cherry Rose'],['Rosco','R333','Blush Pink'],
    ['Rosco','R336','Billinton Pink'],['Rosco','R339','Broadway Pink'],
    ['Rosco','R342','Rose Pink'],['Rosco','R343','Neon Pink'],
    ['Rosco','R344','Follies Pink'],['Rosco','R346','Tropical Magenta'],
    ['Rosco','R347','Belladonna Rose'],['Rosco','R348','Purple Jazz'],
    ['Rosco','R349','Fischer Fuchsia'],['Rosco','R351','Lavender Mist'],
    ['Rosco','R353','Lilly Lavender'],['Rosco','R355','Pale Violet'],
    ['Rosco','R356','Middle Lavender'],['Rosco','R357','Royal Lavender'],
    ['Rosco','R358','Rose Indigo'],['Rosco','R359','Medium Violet'],
    ['Rosco','R360','Clearwater'],['Rosco','R362','Tipton Blue'],
    ['Rosco','R363','Aquamarine'],['Rosco','R364','Blue Bell'],
    ['Rosco','R365','Tharon Delft Blue'],['Rosco','R366','Jordan Blue'],
    ['Rosco','R367','Slate Blue'],['Rosco','R369','Tahitian Blue'],
    ['Rosco','R370','Italian Blue'],['Rosco','R371','Theatre Booster 1'],
    ['Rosco','R372','Theatre Booster 2'],['Rosco','R373','Theatre Booster 3'],
    ['Rosco','R374','Sea Green'],['Rosco','R376','Bermuda Blue'],
    ['Rosco','R377','Iris Purple'],['Rosco','R378','Alice Blue'],
    ['Rosco','R382','Congo Blue'],['Rosco','R383','Sapphire Blue'],
    ['Rosco','R384','Midnight Blue'],['Rosco','R385','Royal Blue'],
    ['Rosco','R386','Leaf Green'],['Rosco','R388','Gaslight Green'],
    ['Rosco','R389','Chroma Green'],['Rosco','R392','Pacific Green'],
    ['Rosco','R393','Emerald Green'],['Rosco','R395','Teal Green'],
    ['Rosco','R397','Pale Grey'],['Rosco','R398','Neutral Grey'],
    // ROSCO Diffusions & Frosts
    ['Rosco','R100','Frost'],['Rosco','R101','Light Frost'],
    ['Rosco','R102','Light Tough Frost'],['Rosco','R103','Tough Frost'],
    ['Rosco','R104','Tough Silk'],['Rosco','R105','Tough Spun'],
    ['Rosco','R106','Light Tough Spun'],['Rosco','R107','Tough Rolux'],
    ['Rosco','R108','Hilite'],['Rosco','R109','Opal Frost'],
    ['Rosco','R110','Opal'],['Rosco','R111','Tough Opal'],
    ['Rosco','R112','Tough Silk'],['Rosco','R113','Matte Silk'],
    ['Rosco','R114','Hamburg Frost'],['Rosco','R115','Tough Booster Green'],
    ['Rosco','R116','Tough White Diffusion'],['Rosco','R117','Half Tough White Diffusion'],
    ['Rosco','R119','Light Hamburg Frost'],['Rosco','R120','Red Diffusion'],
    ['Rosco','R121','Blue Diffusion'],['Rosco','R122','Green Diffusion'],
    ['Rosco','R124','Red Cyc Silk'],['Rosco','R125','Blue Cyc Silk'],
    ['Rosco','R126','Green Cyc Silk'],['Rosco','R127','Amber Cyc Silk'],
    ['Rosco','R132','Quarter Hamburg Frost'],
    // ROSCO Cinegel - Diffusions
    ['Rosco','3000','Cinegel Tough Rolux'],['Rosco','3006','Cinegel Tough Spun'],
    ['Rosco','3007','Cinegel Light Spun'],['Rosco','3008','Cinegel Hilite'],
    ['Rosco','3010','Cinegel Tough Frost'],['Rosco','3012','Cinegel Light Frost'],
    ['Rosco','3014','Cinegel Opal Frost'],['Rosco','3015','Cinegel Light Grid Cloth'],
    ['Rosco','3016','Cinegel Grid Cloth'],['Rosco','3017','Cinegel Tough Grid Cloth'],
    ['Rosco','3018','Cinegel Silent Grid Cloth'],['Rosco','3019','Cinegel Silent Light Grid'],
    ['Rosco','3020','Cinegel Tough Silk'],['Rosco','3021','Cinegel Soft Frost'],
    ['Rosco','3026','Cinegel Light Hamburg Frost'],['Rosco','3027','Cinegel Hamburg Frost'],
    ['Rosco','3028','Cinegel Heavy Frost'],['Rosco','3029','Cinegel Tough White Diffusion'],
    ['Rosco','3030','Cinegel Ultra Bounce'],['Rosco','3031','Cinegel Full Bounce'],
    ['Rosco','3032','Cinegel Light Grid Cloth'],
    // ROSCO Cinegel - Color Corrections (CTB)
    ['Rosco','3202','Full Blue CTB'],['Rosco','3203','3/4 Blue CTB'],
    ['Rosco','3204','Half Blue CTB'],['Rosco','3206','Third Blue CTB'],
    ['Rosco','3208','Quarter Blue CTB'],['Rosco','3216','Eighth Blue CTB'],
    ['Rosco','3220','Double Blue CTB'],
    // ROSCO Cinegel - Color Corrections (CTO)
    ['Rosco','3401','Sun 85 CTO'],['Rosco','3407','Full CTO'],
    ['Rosco','3408','Half CTO'],['Rosco','3409','Quarter CTO'],
    ['Rosco','3410','Eighth CTO'],
    // ROSCO Cinegel - Plus/Minus Green
    ['Rosco','3304','Full Plus Green'],['Rosco','3308','Full Minus Green'],
    ['Rosco','3313','Half Minus Green'],['Rosco','3314','Quarter Minus Green'],
    ['Rosco','3315','Half Plus Green'],['Rosco','3316','Quarter Plus Green'],
    // ROSCO Cinegel - Neutral Density
    ['Rosco','3401','ND 0.3 (1 Stop)'],['Rosco','3402','ND 0.6 (2 Stop)'],
    ['Rosco','3403','ND 0.9 (3 Stop)'],['Rosco','3404','ND 1.2 (4 Stop)'],
    ['Rosco','3405','ND 1.5 (5 Stop)'],
    // LEE FILTERS - Colors
    ['Lee','L001','Pale Yellow'],['Lee','L002','Pale Amber'],
    ['Lee','L003','Straw'],['Lee','L004','Medium Bastard Amber'],
    ['Lee','L005','Rose Tint'],['Lee','L006','No Color Straw'],
    ['Lee','L007','Pale Rose'],['Lee','L008','Pale Gold'],
    ['Lee','L009','Pale Amber Gold'],['Lee','L010','Medium Yellow'],
    ['Lee','L011','Light Straw'],['Lee','L013','Straw Tint'],
    ['Lee','L015','Deep Straw'],['Lee','L016','Light Amber'],
    ['Lee','L017','Light Flame'],['Lee','L018','Flame'],
    ['Lee','L019','Fire'],['Lee','L020','Medium Amber'],
    ['Lee','L021','Gold Amber'],['Lee','L022','Deep Amber'],
    ['Lee','L023','Orange'],['Lee','L024','Scarlet'],
    ['Lee','L025','Sunset Red'],['Lee','L026','Bright Red'],
    ['Lee','L027','Medium Red'],['Lee','L029','Plasa Red'],
    ['Lee','L030','Light Salmon Pink'],['Lee','L031','Salmon Pink'],
    ['Lee','L032','Medium Salmon Pink'],['Lee','L033','No Color Pink'],
    ['Lee','L034','Flesh Pink'],['Lee','L035','Light Pink'],
    ['Lee','L036','Medium Pink'],['Lee','L037','Pale Rose Pink'],
    ['Lee','L038','Light Rose'],['Lee','L039','Pink'],
    ['Lee','L040','Light Salmon'],['Lee','L041','Salmon'],
    ['Lee','L042','Deep Salmon'],['Lee','L043','Deep Pink'],
    ['Lee','L044','Middle Rose'],['Lee','L045','Rose'],
    ['Lee','L046','Magenta'],['Lee','L047','Light Rose Purple'],
    ['Lee','L048','Rose Purple'],['Lee','L049','Medium Purple'],
    ['Lee','L050','Mauve'],['Lee','L051','Surprise Pink'],
    ['Lee','L052','Light Lavender'],['Lee','L053','Pale Lavender'],
    ['Lee','L054','Special Lavender'],['Lee','L055','Lilac'],
    ['Lee','L056','Gypsy Lavender'],['Lee','L057','Lavender'],
    ['Lee','L058','Deep Lavender'],['Lee','L059','Indigo'],
    ['Lee','L061','Mist Blue'],['Lee','L062','Booster Blue'],
    ['Lee','L063','Pale Blue'],['Lee','L064','Light Steel Blue'],
    ['Lee','L065','Daylight Blue'],['Lee','L066','Cool Blue'],
    ['Lee','L067','Light Sky Blue'],['Lee','L068','Sky Blue'],
    ['Lee','L069','Brilliant Blue'],['Lee','L070','Nile Blue'],
    ['Lee','L071','Sea Blue'],['Lee','L072','Azure Blue'],
    ['Lee','L073','Peacock Blue'],['Lee','L074','Night Blue'],
    ['Lee','L075','Evening Blue'],['Lee','L079','Bright Blue'],
    ['Lee','L080','Primary Blue'],['Lee','L081','Urban Blue'],
    ['Lee','L082','Surprise Blue'],['Lee','L083','Medium Blue'],
    ['Lee','L085','Deep Blue'],['Lee','L086','Pea Green'],
    ['Lee','L088','Light Green'],['Lee','L089','Moss Green'],
    ['Lee','L091','Primary Green'],['Lee','L092','Turquoise'],
    ['Lee','L094','Kelly Green'],['Lee','L096','Lime'],
    ['Lee','L099','Chocolate'],['Lee','L100','Frost'],
    ['Lee','L101','Light Frost'],['Lee','L102','Light Tough Frost'],
    ['Lee','L103','Tough Frost'],['Lee','L104','Tough Silk'],
    ['Lee','L105','Tough Spun'],['Lee','L106','Light Tough Spun'],
    ['Lee','L107','Tough Rolux'],['Lee','L108','Hilite'],
    ['Lee','L109','Light Brown'],['Lee','L110','Opal Frost'],
    ['Lee','L111','Tough Opal'],['Lee','L112','Silk'],
    ['Lee','L113','Matte Silk'],['Lee','L114','Hamburg Frost'],
    ['Lee','L115','Tough Booster Green'],['Lee','L116','Tough Booster Blue'],
    ['Lee','L117','Steel Blue'],['Lee','L118','Antique Rose'],
    ['Lee','L119','Dark Blue'],['Lee','L120','Deep Blue'],
    ['Lee','L121','LEE Green'],['Lee','L122','Fern Green'],
    ['Lee','L124','Dark Green'],['Lee','L126','Mauve'],
    ['Lee','L127','Smoky Pink'],['Lee','L128','Broadcast Pink'],
    ['Lee','L129','Heavy Frost'],['Lee','L130','Clear'],
    ['Lee','L131','Marine Blue'],['Lee','L132','Medium Blue Green'],
    ['Lee','L134','Golden Amber'],['Lee','L135','Deep Golden Amber'],
    ['Lee','L136','Pale Lavender'],['Lee','L137','Special Lavender'],
    ['Lee','L138','Pale Green'],['Lee','L139','Primary Green'],
    ['Lee','L140','Summer Blue'],['Lee','L141','Bright Blue'],
    ['Lee','L142','Pale Violet'],['Lee','L143','Pale Navy Blue'],
    ['Lee','L144','No Color Blue'],['Lee','L147','Apricot'],
    ['Lee','L148','Bright Rose'],['Lee','L149','Scarlet'],
    ['Lee','L150','Ice Blue'],['Lee','L151','Gold Tint'],
    ['Lee','L152','Pale Gold'],['Lee','L153','Pale Salmon'],
    ['Lee','L154','Pale Rose'],['Lee','L156','Chocolate'],
    ['Lee','L157','Pink'],['Lee','L158','Deep Orange'],
    ['Lee','L159','No Color Pink'],['Lee','L160','Slate Blue'],
    ['Lee','L161','Slate Blue'],['Lee','L162','Bastard Amber'],
    ['Lee','L163','Aquamarine'],['Lee','L164','Flame Red'],
    ['Lee','L165','Daylight Blue'],['Lee','L166','Pale Red'],
    ['Lee','L167','Pale Yellow'],['Lee','L169','Lilac Tint'],
    ['Lee','L170','Deep Lavender'],['Lee','L172','Lagoon Blue'],
    ['Lee','L174','Dark Bastard Amber'],['Lee','L176','Loving Amber'],
    ['Lee','L177','Myrt'],['Lee','L178','Alice Blue'],
    ['Lee','L179','Chrome Orange'],['Lee','L180','Dark Lavender'],
    ['Lee','L181','Congo Blue'],['Lee','L182','Light Red'],
    ['Lee','L183','Moonlight Blue'],['Lee','L184','Cosmetic Peach'],
    ['Lee','L185','Cosmetic Silver Rose'],['Lee','L186','Cosmetic Aqua Rose'],
    ['Lee','L187','Cosmetic Highlight'],['Lee','L188','Cosmetic Silver Moss'],
    ['Lee','L190','Cosmetic Peach'],['Lee','L192','Flesh Pink'],
    ['Lee','L193','Rosy Amber'],['Lee','L194','Surprise Pink'],
    ['Lee','L195','Zenith Blue'],['Lee','L196','True Blue'],
    ['Lee','L197','Alice Blue'],['Lee','L198','Palace Blue'],
    ['Lee','L199','Regal Blue'],['Lee','L200','Double CT Blue'],
    ['Lee','L201','Full CT Blue'],['Lee','L202','Half CT Blue'],
    ['Lee','L203','Quarter CT Blue'],['Lee','L204','Full CT Orange'],
    ['Lee','L205','Half CT Orange'],['Lee','L206','Quarter CT Orange'],
    ['Lee','L207','Full CT Straw'],['Lee','L208','Half CT Straw'],
    ['Lee','L209','Full Minus Green'],['Lee','L210','Half Minus Green'],
    ['Lee','L211','Quarter Minus Green'],['Lee','L212','Full Plus Green'],
    ['Lee','L213','Half Plus Green'],['Lee','L214','Quarter Plus Green'],
    ['Lee','L218','Eighth CT Blue'],['Lee','L219','Eighth CT Orange'],
    ['Lee','L220','White Diffusion'],['Lee','L221','Silver Diffusion'],
    ['Lee','L222','Quarter White Diffusion'],['Lee','L223','Quarter Silver Diffusion'],
    ['Lee','L224','Eighth White Diffusion'],['Lee','L225','Quarter Quarter White Diffusion'],
    ['Lee','L226','Tough Spun'],['Lee','L227','Soft Frost'],
    ['Lee','L228','Brushed Silk'],['Lee','L229','Heavy Frost'],
    ['Lee','L230','Super White Frost'],['Lee','L231','Tough Rolux'],
    ['Lee','L232','Ultra Bounce'],['Lee','L236','Hamburg Frost'],
    ['Lee','L238','Tough Silk'],['Lee','L239','Opal Frost'],
    ['Lee','L241','Lee Frost'],['Lee','L242','Opal Diffusion'],
    ['Lee','L250','Half White Diffusion'],['Lee','L251','Half Silver Diffusion'],
    ['Lee','L252','Half Tough Spun'],['Lee','L253','Grid Cloth'],
    ['Lee','L254','Quarter Tough Spun'],['Lee','L256','Gridcloth'],
    ['Lee','L257','Mirror Silver'],['Lee','L258','Quarter Hampshire Frost'],
    ['Lee','L259','Half Hampshire Frost'],['Lee','L260','Hampshire Frost'],
    ['Lee','L261','Tough Opal'],['Lee','L262','Frost'],
    ['Lee','L263','Toughscreen'],
    // GAM GAMCOLOR - Magentas (100s)
    ['GAM','G100','Magenta'],['GAM','G105','Rose Pink'],
    ['GAM','G110','English Rose'],['GAM','G115','Surprise Pink'],
    ['GAM','G120','Rose'],['GAM','G125','Carnation'],
    ['GAM','G130','Rose'],['GAM','G135','Deep Rose'],
    ['GAM','G140','Pale Pink'],['GAM','G145','Light Pink'],
    ['GAM','G150','Pink'],['GAM','G155','Deep Pink'],
    ['GAM','G160','Hot Pink'],['GAM','G165','Fuschia'],
    ['GAM','G170','Special Lavender'],['GAM','G175','Pale Lavender'],
    ['GAM','G180','Lavender'],['GAM','G185','Deep Lavender'],
    ['GAM','G190','Dark Lavender'],
    // GAM GAMCOLOR - Reds (200s)
    ['GAM','G200','Scarlet'],['GAM','G205','Light Red'],
    ['GAM','G210','Red'],['GAM','G215','Medium Red'],
    ['GAM','G220','Deep Red'],['GAM','G225','Dark Red'],
    ['GAM','G230','Pale Salmon'],['GAM','G235','Light Salmon'],
    ['GAM','G240','Salmon'],['GAM','G245','Deep Salmon'],
    ['GAM','G250','Flesh Pink'],['GAM','G255','Pale Rose Pink'],
    ['GAM','G260','Light Rose'],['GAM','G265','Rose'],
    ['GAM','G270','Deep Rose'],['GAM','G275','Cherry'],
    ['GAM','G280','Ruby'],['GAM','G285','Magenta Rose'],
    // GAM GAMCOLOR - Oranges (300s)
    ['GAM','G300','Pale Straw'],['GAM','G305','Straw'],
    ['GAM','G310','English Rose'],['GAM','G315','Light Amber'],
    ['GAM','G320','Amber'],['GAM','G325','Medium Amber'],
    ['GAM','G330','Deep Amber'],['GAM','G335','Golden Amber'],
    ['GAM','G340','Orange'],['GAM','G345','Deep Orange'],
    ['GAM','G350','Dark Orange'],['GAM','G355','Light Flame'],
    ['GAM','G360','Flame'],['GAM','G365','Sunset'],
    ['GAM','G370','Apricot'],['GAM','G375','Peach'],
    ['GAM','G380','Salmon Pink'],['GAM','G385','Coral'],
    ['GAM','G390','Warm Peach'],
    // GAM GAMCOLOR - Yellows (400s)
    ['GAM','G400','Pale Yellow'],['GAM','G405','Light Yellow'],
    ['GAM','G410','Yellow'],['GAM','G415','Medium Yellow'],
    ['GAM','G420','Deep Yellow'],['GAM','G425','Gold'],
    ['GAM','G430','Pale Gold'],['GAM','G435','Light Gold'],
    ['GAM','G440','Gold Tint'],['GAM','G445','Pale Straw'],
    ['GAM','G450','Lemon'],['GAM','G455','Lime Yellow'],
    // GAM GAMCOLOR - Yellow Greens (500s)
    ['GAM','G500','Pale Yellow Green'],['GAM','G505','Light Yellow Green'],
    ['GAM','G510','Yellow Green'],['GAM','G515','Medium Yellow Green'],
    ['GAM','G520','Lime'],['GAM','G525','Bright Yellow Green'],
    ['GAM','G530','Spring Green'],['GAM','G535','Leaf Green'],
    ['GAM','G540','Moss Green'],['GAM','G545','Olive Green'],
    ['GAM','G550','Yellow Olive'],
    // GAM GAMCOLOR - Greens (600s)
    ['GAM','G600','Pale Green'],['GAM','G605','Light Green'],
    ['GAM','G610','Green'],['GAM','G615','Medium Green'],
    ['GAM','G620','Deep Green'],['GAM','G625','Dark Green'],
    ['GAM','G630','Primary Green'],['GAM','G635','Emerald Green'],
    ['GAM','G640','Teal'],['GAM','G645','Mint Green'],
    ['GAM','G650','Turquoise'],['GAM','G655','Rich Green'],
    ['GAM','G660','Forest Green'],['GAM','G665','Jade Green'],
    // GAM GAMCOLOR - Blue Greens (700s)
    ['GAM','G700','Pale Blue Green'],['GAM','G705','Light Blue Green'],
    ['GAM','G710','Blue Green'],['GAM','G715','Medium Blue Green'],
    ['GAM','G720','Teal Blue'],['GAM','G725','Deep Blue Green'],
    ['GAM','G730','Aquamarine'],['GAM','G735','Peacock Blue'],
    ['GAM','G740','Lagoon Blue'],['GAM','G745','Sea Blue'],
    ['GAM','G750','Cyan'],['GAM','G755','Deep Cyan'],
    // GAM GAMCOLOR - Blues (800s)
    ['GAM','G800','Pale Blue'],['GAM','G805','Light Blue'],
    ['GAM','G810','Sky Blue'],['GAM','G815','Medium Blue'],
    ['GAM','G820','Daylight Blue'],['GAM','G825','Steel Blue'],
    ['GAM','G830','Deep Blue'],['GAM','G835','Royal Blue'],
    ['GAM','G840','Dark Blue'],['GAM','G845','Night Blue'],
    ['GAM','G850','Congo Blue'],['GAM','G855','Sapphire Blue'],
    ['GAM','G860','Primary Blue'],['GAM','G865','Urban Blue'],
    ['GAM','G870','Mist Blue'],['GAM','G875','Ice Blue'],
    ['GAM','G880','No Color Blue'],['GAM','G885','Booster Blue'],
    // GAM GAMCOLOR - Violets (900s)
    ['GAM','G900','Pale Violet'],['GAM','G905','Light Violet'],
    ['GAM','G910','Violet'],['GAM','G915','Medium Violet'],
    ['GAM','G920','Deep Violet'],['GAM','G925','Purple'],
    ['GAM','G930','Indigo'],['GAM','G935','Dark Purple'],
    ['GAM','G940','Mauve'],['GAM','G945','Lavender'],
    ['GAM','G950','Lilac'],['GAM','G955','Rose Purple'],
    // GAM Diffusions
    ['GAM','G1505','Diffusion - Light Frost'],
    ['GAM','G1510','Diffusion - Frost'],
    ['GAM','G1515','Diffusion - Heavy Frost'],
    ['GAM','G1520','Diffusion - Tough Silk'],
    ['GAM','G1525','Diffusion - Tough Spun'],
    ['GAM','G1530','Diffusion - Light Tough Spun'],
    ['GAM','G1535','Diffusion - Opal Frost'],
    ['GAM','G1540','Diffusion - Hamburg Frost'],
    ['GAM','G1545','Diffusion - Light Diffusion'],
    ['GAM','G1550','Diffusion - Medium Diffusion'],
    ['GAM','G1555','Diffusion - Heavy Diffusion'],
    ['GAM','G1560','Diffusion - Rolux'],
    ['GAM','G1565','Diffusion - Soft Frost'],
    ['GAM','G1570','Diffusion - Grid Cloth'],
    ['GAM','G1575','Diffusion - Light Grid Cloth'],
    ['GAM','G1580','Diffusion - Tough Grid Cloth'],
    ['GAM','G1585','Diffusion - White Diffusion'],
    ['GAM','G1590','Diffusion - Silver Diffusion'],
    ['GAM','G1595','Diffusion - Ultra Bounce'],
    ['GAM','G1600','Diffusion - Bounce Board'],
  ]);
}

function setupIPC() {
  ipcMain.on('db-get-shows', (event) => {
    try {
      const shows = getDb().prepare('SELECT * FROM shows ORDER BY created_at DESC').all();
      event.returnValue = shows;
    } catch(e) { event.returnValue = []; }
  });
  ipcMain.on('db-get-spots', (event, showId) => {
    try {
      const spots = getDb().prepare('SELECT * FROM spots WHERE show_id = ? ORDER BY spot_number').all(showId);
      event.returnValue = spots;
    } catch(e) { event.returnValue = []; }
  });
ipcMain.on('get-app-icon', (event) => {
    try {
      const fs = require('fs');
      const iconPath = path.join(__dirname, '../../src/icon.png');
      const data = fs.readFileSync(iconPath);
      event.returnValue = 'data:image/png;base64,' + data.toString('base64');
    } catch(e) {
      console.error('Icon load error:', e);
      event.returnValue = null;
    }
  });
  ipcMain.on('db-get-color-slots-all', (event, spotId) => {
    try {
      const slots = getDb().prepare('SELECT * FROM color_slots WHERE spot_id = ? ORDER BY is_permanent, slot_number').all(spotId);
      event.returnValue = slots;
    } catch(e) { event.returnValue = []; }
  });

  ipcMain.on('db-update-spot', (event, { spotId, operator_name, fixture_type, location }) => {
    try {
      getDb().prepare('UPDATE spots SET operator_name = ?, fixture_type = ?, location = ? WHERE id = ?').run(operator_name || '', fixture_type || '', location || '', spotId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-update-color-slot', (event, { slotId, gelNumber, gelName }) => {
    try {
      getDb().prepare('UPDATE color_slots SET gel_number = ?, gel_name = ? WHERE id = ?').run(gelNumber || '', gelName || '', slotId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-add-spot', (event, { showId, spotNumber }) => {
    try {
      const database = getDb();
      const result = database.prepare('INSERT INTO spots (show_id, spot_number, operator_name, fixture_type, location) VALUES (?, ?, ?, ?, ?)').run(showId, spotNumber, '', '', '');
      const spotId = result.lastInsertRowid;
      for (let i = 1; i <= 6; i++) {
        database.prepare('INSERT INTO color_slots (spot_id, slot_number, is_permanent, gel_number, gel_name) VALUES (?, ?, 0, ?, ?)').run(spotId, i, '', '');
      }
      database.prepare('INSERT INTO color_slots (spot_id, slot_number, is_permanent, gel_number, gel_name) VALUES (?, NULL, 1, ?, ?)').run(spotId, '', '');
      database.prepare('UPDATE shows SET num_spots = ? WHERE id = ?').run(spotNumber, showId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-remove-spot', (event, spotId) => {
    try {
      const database = getDb();
      const spot = database.prepare('SELECT * FROM spots WHERE id = ?').get(spotId);
      database.prepare('DELETE FROM spot_cues WHERE spot_id = ?').run(spotId);
      database.prepare('DELETE FROM color_slots WHERE spot_id = ?').run(spotId);
      database.prepare('DELETE FROM spots WHERE id = ?').run(spotId);
      const remaining = database.prepare('SELECT * FROM spots WHERE show_id = ? ORDER BY spot_number').all(spot.show_id);
      remaining.forEach((s, i) => database.prepare('UPDATE spots SET spot_number = ? WHERE id = ?').run(i + 1, s.id));
      database.prepare('UPDATE shows SET num_spots = ? WHERE id = ?').run(remaining.length, spot.show_id);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });
    ipcMain.on('db-update-show', (event, { showId, form }) => {
    try {
      getDb().prepare(`
        UPDATE shows SET title = ?, theatre = ?, producer = ?, designer = ?,
        associate_ld = ?, assistant_ld = ?, production_electrician = ?, programmer = ?,
        updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(form.title, form.theatre || '', form.producer || '', form.designer || '',
        form.associate_ld || '', form.assistant_ld || '', form.production_electrician || '',
        form.programmer || '', showId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });
  ipcMain.on('db-delete-show', (event, showId) => {
    try {
      getDb().prepare('DELETE FROM shows WHERE id = ?').run(showId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });
  ipcMain.on('dialog-get-dropped-path', (event, fileName) => {
    const { dialog } = require('electron');
    const result = dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'gif'] }],
      message: `Select the image file: ${fileName}`,
    });
    event.returnValue = result ? result[0] : null;
  });
  ipcMain.on('db-update-character', (event, { characterId, name, actorName, costumeNotes, photoPath }) => {
    try {
      getDb().prepare('UPDATE characters SET name = ?, actor_name = ?, costume_notes = ?, photo_path = ? WHERE id = ?').run(name, actorName || '', costumeNotes || '', photoPath || '', characterId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-delete-character', (event, characterId) => {
    try {
      getDb().prepare('UPDATE spot_cues SET character_id = NULL WHERE character_id = ?').run(characterId);
      getDb().prepare('DELETE FROM characters WHERE id = ?').run(characterId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-reorder-characters', (event, updates) => {
    try {
      const database = getDb();
      const stmt = database.prepare('UPDATE characters SET sort_order = ? WHERE id = ?');
      const update = database.transaction((updates) => {
        for (const u of updates) stmt.run(u.sort_order, u.id);
      });
      update(updates);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });
  ipcMain.on('db-update-scene', (event, { sceneId, label, song, actBreak }) => {
    try {
      getDb().prepare('UPDATE scenes SET label = ?, song = ?, act_break = ? WHERE id = ?').run(label, song || '', actBreak ? 1 : 0, sceneId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-delete-scene', (event, sceneId) => {
    try {
      getDb().prepare('UPDATE cues SET scene_id = NULL WHERE scene_id = ?').run(sceneId);
      getDb().prepare('DELETE FROM scenes WHERE id = ?').run(sceneId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-reorder-scenes', (event, updates) => {
    try {
      const database = getDb();
      const stmt = database.prepare('UPDATE scenes SET sort_order = ? WHERE id = ?');
      const update = database.transaction((updates) => {
        for (const u of updates) stmt.run(u.sort_order, u.id);
      });
      update(updates);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });
ipcMain.on('db-generate-caller-pdf', async (event, { showId, label, hideOff, hideTracked, rangeStart, rangeEnd }) => {
    try {
      const { dialog } = require('electron');
      const database = getDb();
      const show = database.prepare('SELECT * FROM shows WHERE id = ?').get(showId);
      const spots = database.prepare('SELECT * FROM spots WHERE show_id = ? ORDER BY spot_number').all(showId);
      const cues = database.prepare('SELECT * FROM cues WHERE show_id = ? ORDER BY sort_order').all(showId);
      const characters = database.prepare('SELECT * FROM characters WHERE show_id = ?').all(showId);
      const scenes = database.prepare('SELECT * FROM scenes WHERE show_id = ? ORDER BY sort_order').all(showId);

      const colorSlotsBySpot = {};
      const spotCuesBySpot = {};
      for (const spot of spots) {
        colorSlotsBySpot[spot.id] = database.prepare('SELECT * FROM color_slots WHERE spot_id = ? ORDER BY is_permanent, slot_number').all(spot.id);
        spotCuesBySpot[spot.id] = database.prepare('SELECT * FROM spot_cues WHERE spot_id = ?').all(spot.id);
      }

      const { filePath } = await dialog.showSaveDialog({
        defaultPath: `${show.title} - Caller Sheet - ${label || 'Sheet'}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });

      if (!filePath) { event.returnValue = { success: false, cancelled: true }; return; }

      await generateCallerSheetPDF({
        show, spots, colorSlotsBySpot, cues, spotCuesBySpot,
        characters, scenes, label, outputPath: filePath,
      });

      event.returnValue = { success: true, path: filePath };
    } catch(e) {
      console.error('Caller PDF error:', e);
      event.returnValue = { success: false, error: e.message };
    }
  });
  ipcMain.on('db-generate-color-load-pdf', async (event, { showId, label }) => {
    try {
      const { dialog } = require('electron');
      const database = getDb();
      const show = database.prepare('SELECT * FROM shows WHERE id = ?').get(showId);
      const spots = database.prepare('SELECT * FROM spots WHERE show_id = ? ORDER BY spot_number').all(showId);
      const colorSlotsBySpot = {};
      for (const spot of spots) {
        colorSlotsBySpot[spot.id] = database.prepare('SELECT * FROM color_slots WHERE spot_id = ? ORDER BY is_permanent, slot_number').all(spot.id);
      }
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: `${show.title} - Color Load - ${label || 'Sheet'}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });
      if (!filePath) { event.returnValue = { success: false, cancelled: true }; return; }
      await generateColorLoadPDF({ show, spots, colorSlotsBySpot, label, outputPath: filePath });
      event.returnValue = { success: true, path: filePath };
    } catch(e) {
      console.error('Color load PDF error:', e);
      event.returnValue = { success: false, error: e.message };
    }
  });
  ipcMain.on('dialog-open-image', (event) => {
    const { dialog } = require('electron');
    const result = dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'gif'] }],
    });
    event.returnValue = result ? result[0] : null;
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
      console.error('PDF generation error:', e);
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
  ipcMain.on('db-update-cue-scene', (event, { cueId, sceneId }) => {
    try {
      getDb().prepare('UPDATE cues SET scene_id = ? WHERE id = ?').run(sceneId, cueId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });
  });
      ipcMain.on('db-generate-pdf', async (event, { showId, spotId, label, hideOff, hideTracked, rangeStart, rangeEnd }) => {
    try {
      const { dialog } = require('electron');
      const database = getDb();
      const show = database.prepare('SELECT * FROM shows WHERE id = ?').get(showId);
      const spot = database.prepare('SELECT * FROM spots WHERE id = ?').get(spotId);
      const colorSlots = database.prepare('SELECT * FROM color_slots WHERE spot_id = ? ORDER BY is_permanent, slot_number').all(spotId);
      const cues = database.prepare('SELECT * FROM cues WHERE show_id = ? ORDER BY sort_order').all(showId);
      const spotCues = database.prepare('SELECT * FROM spot_cues WHERE spot_id = ?').all(spotId);
      const characters = database.prepare('SELECT * FROM characters WHERE show_id = ?').all(showId);
      const scenes = database.prepare('SELECT * FROM scenes WHERE show_id = ? ORDER BY sort_order').all(showId);
      const spots = database.prepare('SELECT * FROM spots WHERE show_id = ?').all(showId);

      const { filePath } = await dialog.showSaveDialog({
        defaultPath: `${show.title} - Spot ${spot.spot_number} - ${label || 'Sheet'}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });

      if (!filePath) { event.returnValue = { success: false, cancelled: true }; return; }

      await generateSpotSheetPDF({
        show, spot, colorSlots, cues, spotCues, characters, scenes,
        label, numSpots: spots.length, outputPath: filePath,
        hideOff, hideTracked, rangeStart, rangeEnd,
      });

      event.returnValue = { success: true, path: filePath };
    } catch(e) {
      console.error(e);
     console.error('PDF generation error:', e);
      event.returnValue = { success: false, error: e.message };
    }
  });
ipcMain.on('db-get-show-stats', (event, showId) => {
    try {
      const database = getDb();
      const cues = database.prepare('SELECT COUNT(*) as c FROM cues WHERE show_id = ?').get(showId);
      const scenes = database.prepare('SELECT COUNT(*) as c FROM scenes WHERE show_id = ?').get(showId);
      const characters = database.prepare('SELECT COUNT(*) as c FROM characters WHERE show_id = ?').get(showId);
      const spots = database.prepare('SELECT * FROM spots WHERE show_id = ? ORDER BY spot_number').all(showId);
      event.returnValue = { cues: cues.c, scenes: scenes.c, characters: characters.c, spots };
    } catch(e) { event.returnValue = { cues: 0, scenes: 0, characters: 0, spots: [] }; }
  });
 ipcMain.on('db-get-cue-list', (event, showId) => {
    try {
      const database = getDb();
      const spots = database.prepare('SELECT * FROM spots WHERE show_id = ? ORDER BY spot_number').all(showId);
      const scenes = database.prepare('SELECT * FROM scenes WHERE show_id = ? ORDER BY sort_order').all(showId);
      const cues = database.prepare(`
        SELECT c.*, s.label as scene_label, s.song as scene_song
        FROM cues c
        LEFT JOIN scenes s ON c.scene_id = s.id
        WHERE c.show_id = ?
        ORDER BY c.sort_order, c.id
      `).all(showId);
      const spotCues = database.prepare(`
        SELECT sc.* FROM spot_cues sc
        JOIN cues c ON sc.cue_id = c.id
        WHERE c.show_id = ?
      `).all(showId);
      event.returnValue = { spots, scenes, cues, spotCues };
    } catch(e) { console.error(e); event.returnValue = { spots: [], scenes: [], cues: [], spotCues: [] }; }
  });

  ipcMain.on('db-get-color-slots', (event, spotId) => {
    try {
      const slots = getDb().prepare('SELECT * FROM color_slots WHERE spot_id = ? AND is_permanent = 0 ORDER BY slot_number').all(spotId);
      event.returnValue = slots;
    } catch(e) { event.returnValue = []; }
  });

  ipcMain.on('db-get-scenes', (event, showId) => {
    try {
      const scenes = getDb().prepare('SELECT * FROM scenes WHERE show_id = ? ORDER BY sort_order').all(showId);
      event.returnValue = scenes;
    } catch(e) { event.returnValue = []; }
  });

  ipcMain.on('db-create-scene', (event, { showId, label, song, actBreak }) => {
    try {
      const database = getDb();
      const maxSort = database.prepare('SELECT MAX(sort_order) as m FROM scenes WHERE show_id = ?').get(showId);
      const sort = (maxSort.m || 0) + 1;
      const result = database.prepare('INSERT INTO scenes (show_id, label, song, act_break, sort_order) VALUES (?, ?, ?, ?, ?)').run(showId, label, song || '', actBreak ? 1 : 0, sort);
      event.returnValue = { success: true, id: result.lastInsertRowid };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-create-cue', (event, { showId, sceneId, afterCueId }) => {
    try {
      const database = getDb();
      const maxTrack = database.prepare('SELECT MAX(track_number) as m FROM cues WHERE show_id = ?').get(showId);
      const trackNum = (maxTrack.m || 0) + 1;
      const spots = database.prepare('SELECT * FROM spots WHERE show_id = ? ORDER BY spot_number').all(showId);

      const allCues = database.prepare('SELECT * FROM cues WHERE show_id = ? ORDER BY sort_order ASC, id ASC').all(showId);

      let insertIndex;
      let prevCueId = null;

      if (afterCueId) {
        insertIndex = allCues.findIndex(c => c.id === afterCueId);
        prevCueId = afterCueId;
      } else {
        insertIndex = allCues.length - 1;
        prevCueId = allCues.length > 0 ? allCues[allCues.length - 1].id : null;
      }

      const newSortOrder = (insertIndex + 1) * 1000 + 500;

      const result = database.prepare('INSERT INTO cues (show_id, scene_id, track_number, sort_order, lq_number) VALUES (?, ?, ?, ?, ?)').run(showId, sceneId || null, trackNum, newSortOrder, '');
      const newCueId = result.lastInsertRowid;

      const allCuesAfterInsert = database.prepare('SELECT * FROM cues WHERE show_id = ? ORDER BY sort_order ASC, id ASC').all(showId);
      allCuesAfterInsert.forEach((c, i) => {
        database.prepare('UPDATE cues SET sort_order = ? WHERE id = ?').run((i + 1) * 1000, c.id);
      });

      let prevSpotCues = {};
      if (prevCueId) {
        const prevSCs = database.prepare('SELECT * FROM spot_cues WHERE cue_id = ?').all(prevCueId);
        prevSCs.forEach(sc => { prevSpotCues[sc.spot_id] = sc; });
      }

      for (const spot of spots) {
        const prevSpotCue = prevSpotCues[spot.id] || null;
        const prevAction = prevSpotCue ? prevSpotCue.action : '';
        const endsInOff = ['Fade Out', 'Bump Out', 'Fade In Place'].includes(prevAction);
        const wasOff = prevAction === 'Off';
        const startsOff = endsInOff || wasOff;

        database.prepare('INSERT INTO spot_cues (cue_id, spot_id, action, character_id, intensity, fade_time, active_frames, description, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
          newCueId,
          spot.id,
          startsOff ? 'Off' : '',
          startsOff ? null : (prevSpotCue ? prevSpotCue.character_id : null),
          '',
          '',
          startsOff ? '' : (prevSpotCue ? prevSpotCue.active_frames : ''),
          '',
          ''
        );
      }

      event.returnValue = { success: true, id: newCueId, track_number: trackNum };
    } catch(e) {
      console.error(e);
      event.returnValue = { success: false };
    }
  });

  ipcMain.on('db-update-cue', (event, { cueId, field, value }) => {
    try {
      const safe = ['lq_number','scene_id','caller_notes','rehearsal_notes','ignore','sort_order'];
      if (!safe.includes(field)) { event.returnValue = { success: false }; return; }
      getDb().prepare(`UPDATE cues SET ${field} = ? WHERE id = ?`).run(value, cueId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-update-spot-cue', (event, { spotCueId, field, value }) => {
    try {
      const safe = ['action','character_id','frame_size','intensity','fade_time','location','active_frames','description','notes','ignore'];
      if (!safe.includes(field)) { event.returnValue = { success: false }; return; }
      getDb().prepare(`UPDATE spot_cues SET ${field} = ? WHERE id = ?`).run(value, spotCueId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-get-characters', (event, showId) => {
    try {
      const chars = getDb().prepare('SELECT * FROM characters WHERE show_id = ? ORDER BY sort_order, name').all(showId);
      event.returnValue = chars;
    } catch(e) { event.returnValue = []; }
  });

  ipcMain.on('db-create-character', (event, { showId, name, actorName }) => {
    try {
      const database = getDb();
      const maxSort = database.prepare('SELECT MAX(sort_order) as m FROM characters WHERE show_id = ?').get(showId);
      const sort = (maxSort.m || 0) + 1;
      const result = database.prepare('INSERT INTO characters (show_id, name, actor_name, sort_order) VALUES (?, ?, ?, ?)').run(showId, name, actorName || '', sort);
      event.returnValue = { success: true, id: result.lastInsertRowid };
    } catch(e) { event.returnValue = { success: false }; }
  });

  ipcMain.on('db-delete-cue', (event, cueId) => {
    try {
      getDb().prepare('DELETE FROM cues WHERE id = ?').run(cueId);
      event.returnValue = { success: true };
    } catch(e) { event.returnValue = { success: false }; }
  });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, '../src/icons/mac/icon.icns'),
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; connect-src 'self' https://spotplot-server.onrender.com"]
      }
    });
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