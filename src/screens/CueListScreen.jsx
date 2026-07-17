import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
const { ipcRenderer } = window.require('electron');
const GEL_COLORS = {
  // ROSCO ROSCOLUX
  'R00': '#F8F8F8',
  'R01': '#F5DFA0', 'R02': '#F0C060', 'R03': '#F5E090', 'R04': '#EDB84A',
  'R05': '#F5C8C0', 'R06': '#FAEEC0', 'R07': '#FAEEC0', 'R08': '#F5D878',
  'R09': '#F0C050', 'R10': '#F5E060', 'R11': '#F5E8A0', 'R12': '#F5E060',
  'R13': '#FAEEC0', 'R14': '#F0D060', 'R15': '#E8B840', 'R16': '#F5C84A',
  'R17': '#F5A030', 'R18': '#F08020', 'R19': '#E06010', 'R20': '#E09030',
  'R21': '#E8A020', 'R22': '#D07010', 'R23': '#E07010', 'R24': '#D03020',
  'R25': '#E05020', 'R26': '#D04030', 'R27': '#C02020', 'R28': '#C01010',
  'R30': '#F5D0C0', 'R31': '#F0C0A0', 'R32': '#F0A8A0', 'R33': '#F5D0D0',
  'R34': '#F0C8B8', 'R35': '#F0C8B8', 'R36': '#F0A8A0', 'R37': '#F0C0C8',
  'R38': '#F0A0B0', 'R39': '#E890A0', 'R40': '#F0B090', 'R41': '#E8A080',
  'R42': '#E09080', 'R43': '#E870A0', 'R44': '#D06080', 'R45': '#C84070',
  'R46': '#C03070', 'R47': '#C0A0D0', 'R48': '#B080C0', 'R49': '#9060B0',
  'R50': '#C090B0', 'R51': '#F0D0E0', 'R52': '#D0C0E0', 'R53': '#E0D0F0',
  'R54': '#D8C8E8', 'R55': '#C8B0D8', 'R56': '#A870C0', 'R57': '#B0A0D0',
  'R58': '#9070B0', 'R59': '#503080', 'R60': '#D0E0F8', 'R61': '#C0D8F0',
  'R62': '#B0C8E8', 'R63': '#A0C0E8', 'R64': '#90B0D8', 'R65': '#6090C8',
  'R66': '#80B0D0', 'R67': '#70A8D0', 'R68': '#5090C0', 'R69': '#4878B0',
  'R70': '#60A0B8', 'R71': '#5090A8', 'R72': '#4080A0', 'R73': '#307898',
  'R74': '#203870', 'R75': '#304880', 'R76': '#6090A8', 'R77': '#508090',
  'R78': '#4878B0', 'R79': '#2040A0', 'R80': '#1030C0', 'R81': '#304880',
  'R82': '#2040B0', 'R83': '#3060A0', 'R84': '#2048A0', 'R85': '#102080',
  'R86': '#608050', 'R87': '#C0D880', 'R88': '#90C070', 'R89': '#708050',
  'R90': '#90A040', 'R91': '#208030', 'R92': '#308080', 'R93': '#206050',
  'R94': '#208030', 'R95': '#306040', 'R96': '#90C020', 'R97': '#C8C8C8',
  'R98': '#A0A0A0', 'R99': '#704030',
  // ROSCO 300-series
  'R303': '#F5D0A0', 'R304': '#F5C890', 'R305': '#F5C0A8', 'R310': '#F5E060',
  'R312': '#F5E040', 'R313': '#F5D840', 'R316': '#F0B060', 'R317': '#F0A860',
  'R318': '#F0907A', 'R321': '#E8A840', 'R324': '#D04020', 'R331': '#F0C8B0',
  'R332': '#F090B0', 'R333': '#F5C8C8', 'R336': '#F0B0C0', 'R339': '#D060A0',
  'R342': '#E060A0', 'R343': '#E050A0', 'R344': '#E860B0', 'R346': '#C040A0',
  'R347': '#A040A0', 'R348': '#806090', 'R349': '#C040A0', 'R351': '#D0C0E0',
  'R353': '#C0A8D8', 'R355': '#B0A0D0', 'R356': '#B098C8', 'R357': '#9878C0',
  'R358': '#8060A0', 'R359': '#6050A0', 'R360': '#D8E8F8', 'R362': '#90B8D8',
  'R363': '#90C8D0', 'R364': '#80B0D8', 'R365': '#6098C8', 'R366': '#70A8C8',
  'R367': '#6090B8', 'R369': '#4070B8', 'R370': '#3060A8', 'R371': '#A0C0E0',
  'R372': '#90B8D8', 'R373': '#80A8C8', 'R374': '#308898', 'R376': '#5090A8',
  'R377': '#9880C0', 'R378': '#8090C8', 'R382': '#1020A0', 'R383': '#3050A0',
  'R384': '#2038A0', 'R385': '#1830A0', 'R386': '#408040', 'R388': '#90A030',
  'R389': '#40A020', 'R392': '#308898', 'R393': '#208840', 'R395': '#308878',
  'R397': '#C0C8D0', 'R398': '#A8B0B8',
  // ROSCO Frosts & Diffusions - all appear as near-white/translucent
  'R100': '#F0F0F0', 'R101': '#F4F4F4', 'R102': '#F4F4F4', 'R103': '#EFEFEF',
  'R104': '#F2F2F2', 'R105': '#F0F0F0', 'R106': '#F4F4F4', 'R107': '#EBEBEB',
  'R108': '#F8F8F8', 'R109': '#F0F0F0', 'R110': '#F2F2F2', 'R111': '#EFEFEF',
  'R112': '#F2F2F2', 'R113': '#F0F0F0', 'R114': '#ECECEC', 'R115': '#C8E8C8',
  'R116': '#F8F8F8', 'R117': '#F5F5F5', 'R119': '#F0F0F0', 'R120': '#F0C8C8',
  'R121': '#C8D8F0', 'R122': '#C8E8C8', 'R124': '#E8B8B8', 'R125': '#B8C8E8',
  'R126': '#B8E0B8', 'R127': '#F0D8A0', 'R132': '#F4F4F4',
  // ROSCO Cinegel CTB
  'R3202': '#6090D0', 'R3203': '#7098C8', 'R3204': '#80A8D0', 'R3206': '#90B0D8',
  'R3208': '#A0C0E0', 'R3216': '#C0D8F0', 'R3220': '#4070C0',
  // ROSCO Cinegel CTO
  'R3401': '#E09030', 'R3407': '#E8A030', 'R3408': '#F0B848', 'R3409': '#F5CC70',
  'R3410': '#F8E098',
  // ROSCO Cinegel Plus/Minus Green
  'R3304': '#80C060', 'R3308': '#C080C0', 'R3313': '#D0A0D0', 'R3314': '#E0C0E0',
  'R3315': '#A0D080', 'R3316': '#C0E0A0',
  // ROSCO Cinegel Diffusions
  'R3000': '#EBEBEB', 'R3006': '#F0F0F0', 'R3007': '#F4F4F4', 'R3008': '#F8F8F8',
  'R3010': '#EFEFEF', 'R3012': '#F4F4F4', 'R3014': '#F0F0F0', 'R3020': '#F2F2F2',
  'R3021': '#F5F5F5', 'R3026': '#F0F0F0', 'R3027': '#ECECEC', 'R3028': '#E8E8E8',
  'R3029': '#F8F8F8', 'R3030': '#FFFFFF',
  // LEE FILTERS
  'L001': '#FAEEC0', 'L002': '#F5D890', 'L003': '#F5E090', 'L004': '#EDB84A',
  'L005': '#F5C8C0', 'L006': '#FAEEC0', 'L008': '#F5D878', 'L009': '#F0C050',
  'L010': '#F5E060', 'L013': '#FAEEC0', 'L015': '#E8B840', 'L016': '#F5C84A',
  'L017': '#F5A030', 'L018': '#F08020', 'L019': '#E06010', 'L020': '#E09030',
  'L021': '#E8A020', 'L022': '#D07010', 'L023': '#E07010', 'L024': '#D03020',
  'L025': '#E05020', 'L026': '#D04030', 'L027': '#C02020',
  'L030': '#F5D0C0', 'L031': '#F0C0A0', 'L032': '#F0A8A0', 'L033': '#F5D0D0',
  'L034': '#F0C8B8', 'L035': '#F0C8B8', 'L036': '#F0A8A0', 'L037': '#F0C0C8',
  'L038': '#F0A0B0', 'L039': '#E890A0', 'L040': '#F0B090', 'L041': '#E8A080',
  'L042': '#E09080', 'L043': '#E870A0', 'L044': '#D06080', 'L045': '#C84070',
  'L046': '#C03070', 'L047': '#C0A0D0', 'L048': '#B080C0', 'L049': '#9060B0',
  'L050': '#C090B0', 'L051': '#D0C0E0', 'L052': '#D0C0E0', 'L053': '#E0D0F0',
  'L054': '#D8C8E8', 'L055': '#C8B0D8', 'L057': '#B0A0D0', 'L058': '#9070B0',
  'L059': '#503080', 'L061': '#C0D8F0', 'L062': '#B0C8E8', 'L063': '#A0C0E8',
  'L064': '#90B0D8', 'L065': '#6090C8', 'L066': '#80B0D0', 'L067': '#70A8D0',
  'L068': '#5090C0', 'L069': '#4878B0', 'L070': '#60A0B8', 'L071': '#5090A8',
  'L072': '#4080A0', 'L073': '#307898', 'L074': '#203870', 'L075': '#304880',
  'L079': '#2040A0', 'L080': '#1030C0', 'L081': '#304880', 'L082': '#2040B0',
  'L083': '#3060A0', 'L085': '#102080', 'L086': '#608050', 'L088': '#90C070',
  'L089': '#708050', 'L091': '#208030', 'L092': '#308080', 'L094': '#208030',
  'L096': '#90C020', 'L099': '#704030',
  // LEE Frosts
  'L100': '#F0F0F0', 'L101': '#F4F4F4', 'L102': '#F4F4F4', 'L103': '#EFEFEF',
  'L104': '#F2F2F2', 'L105': '#F0F0F0', 'L106': '#F4F4F4', 'L107': '#EBEBEB',
  'L108': '#F8F8F8', 'L110': '#F0F0F0', 'L111': '#EFEFEF', 'L112': '#F2F2F2',
  'L113': '#F0F0F0', 'L114': '#ECECEC', 'L129': '#E8E8E8', 'L216': '#F8F8F8',
  'L220': '#F8F8F8', 'L226': '#F0F0F0', 'L227': '#F5F5F5', 'L228': '#F2F2F2',
  'L229': '#E8E8E8', 'L230': '#FFFFFF', 'L231': '#EBEBEB', 'L236': '#ECECEC',
  'L238': '#F2F2F2', 'L239': '#F0F0F0', 'L241': '#F0F0F0', 'L261': '#EFEFEF',
  'L262': '#F0F0F0',
  // LEE Color Corrections
  'L200': '#6090D0', 'L201': '#4070C0', 'L202': '#6090C8', 'L203': '#80B0D8',
  'L204': '#E09030', 'L205': '#F0B848', 'L206': '#F5CC70', 'L207': '#F8E090',
  'L109': '#C09060', 'L119': '#102080', 'L120': '#102060', 'L131': '#204060',
  'L134': '#E8A020', 'L147': '#F0B878', 'L148': '#E870A0', 'L149': '#D03020',
  'L150': '#B0D0F0', 'L156': '#704030', 'L157': '#F0A8A0', 'L158': '#D06010',
  'L160': '#7088B0', 'L161': '#6080A8', 'L162': '#F0C060', 'L164': '#D04020',
  'L165': '#5888B8', 'L170': '#9070B0', 'L172': '#3070A0', 'L176': '#E8A840',
  'L179': '#E07820', 'L180': '#8060A0', 'L181': '#101850', 'L182': '#D04030',
  'L183': '#3060A8', 'L193': '#E0A878', 'L194': '#F090B0', 'L195': '#2050A0',
  'L196': '#2048A0', 'L199': '#1828A0',
  // GAM GAMCOLOR
  'G100': '#C03070', 'G105': '#F0A0C0', 'G110': '#F0B0C0', 'G115': '#F0D0E0',
  'G120': '#E890A0', 'G125': '#F0A0B0', 'G130': '#E890A0', 'G135': '#D06080',
  'G140': '#F5D0E0', 'G145': '#F0C0D0', 'G150': '#E8A0C0', 'G155': '#D870A0',
  'G160': '#D04090', 'G165': '#C030A0', 'G170': '#D0C0E0', 'G175': '#E0D0F0',
  'G180': '#B0A0D0', 'G185': '#9070B0', 'G190': '#8060A0',
  'G200': '#D03020', 'G205': '#D04030', 'G210': '#C02020', 'G215': '#B01010',
  'G220': '#A01010', 'G225': '#900808', 'G230': '#F5D0C0', 'G235': '#F0C0A0',
  'G240': '#E8A880', 'G245': '#E09070', 'G250': '#F0C8B8', 'G255': '#F0C0C8',
  'G260': '#F0A0B0', 'G265': '#E890A0', 'G270': '#D06080', 'G275': '#C03060',
  'G280': '#A02050', 'G285': '#C040A0',
  'G300': '#FAEEC0', 'G305': '#F5E090', 'G310': '#F0C8B0', 'G315': '#F5C84A',
  'G320': '#E8A020', 'G325': '#D07010', 'G330': '#C06010', 'G335': '#E8A020',
  'G340': '#E07010', 'G345': '#D06010', 'G350': '#C05010', 'G355': '#F5A030',
  'G360': '#F08020', 'G365': '#F09050', 'G370': '#F0A060', 'G375': '#F0B878',
  'G380': '#F0B090', 'G385': '#F0A080', 'G390': '#F5C0A0',
  'G400': '#FAEEC0', 'G405': '#F5E8A0', 'G410': '#F5E060', 'G415': '#F0D840',
  'G420': '#E8C820', 'G425': '#E8A820', 'G430': '#F5D878', 'G435': '#F0C860',
  'G440': '#FAEEC0', 'G445': '#FAEEC0', 'G450': '#F0E840', 'G455': '#D8E040',
  'G500': '#D8E890', 'G505': '#C8E070', 'G510': '#B0D850', 'G515': '#90C030',
  'G520': '#80C020', 'G525': '#90D030', 'G530': '#70B828', 'G535': '#508040',
  'G540': '#608050', 'G545': '#707840', 'G550': '#909040',
  'G600': '#C0E8B0', 'G605': '#A0D890', 'G610': '#70C060', 'G615': '#50A840',
  'G620': '#308830', 'G625': '#207020', 'G630': '#208030', 'G635': '#209040',
  'G640': '#208878', 'G645': '#A0E0B0', 'G650': '#308080', 'G655': '#207040',
  'G660': '#186030', 'G665': '#208858',
  'G700': '#B0D8C0', 'G705': '#90C8A8', 'G710': '#60A888', 'G715': '#408878',
  'G720': '#307880', 'G725': '#286870', 'G730': '#90C8D0', 'G735': '#307898',
  'G740': '#3070A0', 'G745': '#5090A8', 'G750': '#40C0D0', 'G755': '#2090A0',
  'G800': '#C0D8F0', 'G805': '#A0C8E8', 'G810': '#70A8D0', 'G815': '#5090C0',
  'G820': '#6090C8', 'G825': '#6080B0', 'G830': '#3060A8', 'G835': '#2040A0',
  'G840': '#102080', 'G845': '#203870', 'G850': '#101850', 'G855': '#2038A0',
  'G860': '#1030C0', 'G865': '#304880', 'G870': '#C0D8F0', 'G875': '#B0D0F0',
  'G880': '#D0E0F8', 'G885': '#B0C8E8',
  'G900': '#B0A0D0', 'G905': '#C0B0D8', 'G910': '#9070B0', 'G915': '#8060A8',
  'G920': '#7050A0', 'G925': '#6040A0', 'G930': '#503080', 'G935': '#502878',
  'G940': '#C090B0', 'G945': '#B0A0D0', 'G950': '#C8B0D8', 'G955': '#B080C0',
  // GAM Diffusions
  'G1505': '#F4F4F4', 'G1510': '#F0F0F0', 'G1515': '#E8E8E8', 'G1520': '#F2F2F2',
  'G1525': '#F0F0F0', 'G1530': '#F4F4F4', 'G1535': '#F0F0F0', 'G1540': '#ECECEC',
  'G1545': '#F5F5F5', 'G1550': '#F0F0F0', 'G1555': '#E8E8E8', 'G1560': '#EBEBEB',
  'G1565': '#F5F5F5', 'G1570': '#E8E8E8', 'G1575': '#EFEFEF', 'G1580': '#E8E8E8',
  'G1585': '#F8F8F8', 'G1590': '#D8D8D8', 'G1595': '#F8F8F8', 'G1600': '#FFFFFF',
};

function getGelColor(gelNum) {
  if (!gelNum) return '#2a2a2a';
  const key = gelNum.toUpperCase().replace(/\s/g, '');
  return GEL_COLORS[key] || '#2a2a2a';
}

const ACTIONS = [
  { name: 'Pick Up', short: 'Pick Up', color: '#3B6D11', intensityDefault: 'Full', timeDefault: null },
  { name: 'Fade Up', short: 'Fade Up', color: '#3B6D11', intensityDefault: null, timeDefault: null },
  { name: 'Fade Down', short: 'Fade Down', color: '#A32D2D', intensityDefault: null, timeDefault: null },
  { name: 'Fade Out', short: 'Fade Out', color: '#A32D2D', intensityDefault: 'Out', timeDefault: null },
  { name: 'Fade In Place', short: 'Fade In Plce', color: '#A32D2D', intensityDefault: 'Out', timeDefault: null },
  { name: 'Bump Up', short: 'Bump Up', color: '#3B6D11', intensityDefault: 'Full', timeDefault: '0' },
  { name: 'Bump Out', short: 'Bump Out', color: '#A32D2D', intensityDefault: 'Out', timeDefault: '0' },
  { name: 'Swap To', short: 'Swap To', color: '#185FA5', intensityDefault: null, timeDefault: null },
  { name: 'Slide To', short: 'Slide To', color: '#185FA5', intensityDefault: null, timeDefault: null },
  { name: 'Stay With', short: 'Stay With', color: '#185FA5', intensityDefault: null, timeDefault: null },
  { name: 'Iris In', short: 'Iris In', color: '#534AB7', intensityDefault: null, timeDefault: null },
  { name: 'Iris Out', short: 'Iris Out', color: '#534AB7', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Up', short: 'Iris/Fade Up', color: '#534AB7', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Down', short: 'Iris/Fade Dn', color: '#534AB7', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Out', short: 'Iris/Fade Out', color: '#534AB7', intensityDefault: 'Out', timeDefault: null },
  { name: 'Up & Out', short: 'Up & Out', color: '#854F0B', intensityDefault: 'Out', timeDefault: null },
  { name: 'Bump Color', short: 'Bump Color', color: '#854F0B', intensityDefault: null, timeDefault: '0' },
  { name: 'Roll Color', short: 'Roll Color', color: '#854F0B', intensityDefault: null, timeDefault: null },
  { name: 'Ballyhoo', short: 'Ballyhoo', color: '#D85A30', intensityDefault: null, timeDefault: null },
  { name: 'Off', short: 'Off', color: '#444', intensityDefault: 'Out', timeDefault: null },
  { name: 'Tracked', short: 'TRK', color: '#555555' },
];

const INTENSITIES = ['Full','90%','80%','75%','70%','60%','50%','40%','30%','25%','20%','10%','Glow','Out'];
const TIMES = ['0','1','2','3','4','5','6','7','8','9','10','Custom'];
const IRIS_SIZES = ['Full Body', '3/4 Body', '1/2 Body', 'Head & Shoulders', 'Head', 'Custom'];


const selectStyle = {
  width: '100%', background: '#111', border: '1px solid #2a2a2a',
  borderRadius: '4px', color: '#888', padding: '3px 4px',
  fontSize: '11px', outline: 'none',
};

function ActionIcon({ action, size = 20 }) {
  const s = size;
  switch (action) {
    case 'Pick Up': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 24,20 8,20" fill="#3B6D11"/><polygon points="16,14 22,26 10,26" fill="#639922" opacity="0.5"/></svg>;
    case 'Fade Up': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,5 23,18 9,18" fill="#3B6D11"/></svg>;
    case 'Fade Down': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,27 23,14 9,14" fill="#A32D2D"/></svg>;
    case 'Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,28 24,12 8,12" fill="#A32D2D"/><polygon points="16,18 22,6 10,6" fill="#E24B4A" opacity="0.5"/></svg>;
    case 'Fade In Place': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A32D2D" strokeWidth="2"/><polygon points="16,27 23,14 9,14" fill="#A32D2D"/></svg>;
    case 'Bump Up': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="8" y="10" width="16" height="3" rx="1.5" fill="#3B6D11"/><rect x="10" y="15" width="12" height="3" rx="1.5" fill="#3B6D11" opacity="0.6"/><rect x="12" y="20" width="8" height="3" rx="1.5" fill="#3B6D11" opacity="0.3"/></svg>;
    case 'Bump Out': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="8" y="19" width="16" height="3" rx="1.5" fill="#A32D2D"/><rect x="10" y="14" width="12" height="3" rx="1.5" fill="#A32D2D" opacity="0.6"/><rect x="12" y="9" width="8" height="3" rx="1.5" fill="#A32D2D" opacity="0.3"/></svg>;
    case 'Swap To': return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M10 10 C10 6 22 6 22 10 L22 16 C22 20 16 24 16 24 C16 24 10 20 10 16 Z" fill="none" stroke="#185FA5" strokeWidth="2"/><path d="M20 20 L26 24 L22 26 L20 20Z" fill="#185FA5"/></svg>;
    case 'Slide To': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round"/><polygon points="22,10 30,16 22,22" fill="#185FA5"/><polygon points="10,10 2,16 10,22" fill="#185FA5"/></svg>;
    case 'Stay With': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="#E6F1FB" stroke="#185FA5" strokeWidth="1.5"/><circle cx="12" cy="16" r="3" fill="#185FA5"/><circle cx="20" cy="16" r="3" fill="#185FA5"/></svg>;
    case 'Iris In': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#534AB7" strokeWidth="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#534AB7" strokeWidth="2" strokeLinecap="round"/><polygon points="10,12 6,16 10,20" fill="#534AB7"/><polygon points="22,12 26,16 22,20" fill="#534AB7"/></svg>;
    case 'Iris Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#534AB7" strokeWidth="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#534AB7" strokeWidth="2" strokeLinecap="round"/><polygon points="6,12 10,16 6,20" fill="#534AB7"/><polygon points="26,12 22,16 26,20" fill="#534AB7"/></svg>;
    case 'Iris/Fade Up': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="18" r="9" fill="none" stroke="#534AB7" strokeWidth="2"/><polygon points="16,4 22,14 10,14" fill="#3B6D11"/></svg>;
    case 'Iris/Fade Down': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="14" r="9" fill="none" stroke="#534AB7" strokeWidth="2"/><polygon points="16,28 22,18 10,18" fill="#A32D2D"/></svg>;
    case 'Iris/Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="none" stroke="#534AB7" strokeWidth="2"/><line x1="9" y1="16" x2="23" y2="16" stroke="#A32D2D" strokeWidth="2"/><polygon points="11,12 7,16 11,20" fill="#A32D2D"/><polygon points="21,12 25,16 21,20" fill="#A32D2D"/></svg>;
    case 'Up & Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 22,14 10,14" fill="#3B6D11"/><polygon points="16,28 22,18 10,18" fill="#A32D2D"/></svg>;
    case 'Bump Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#BA7517" strokeWidth="1.5"/><rect x="12" y="11" width="3" height="10" fill="#639922"/><rect x="16" y="11" width="3" height="10" fill="#E24B4A"/></svg>;
    case 'Roll Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#BA7517" strokeWidth="1.5"/><rect x="9" y="8" width="3.5" height="16" rx="1" fill="#E24B4A"/><rect x="12.5" y="8" width="3.5" height="16" fill="#EF9F27"/><rect x="16" y="8" width="3.5" height="16" fill="#639922"/><rect x="19.5" y="8" width="3.5" height="16" rx="1" fill="#185FA5"/></svg>;
    case 'Ballyhoo': return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M8 16 C8 10 12 6 16 6 C20 6 24 10 24 16 C24 22 20 26 16 26 C12 26 8 22 8 16 Z" fill="none" stroke="#D85A30" strokeWidth="2.5"/><path d="M16 6 C16 6 20 16 16 26" fill="none" stroke="#D85A30" strokeWidth="2"/><path d="M16 6 C16 6 12 16 16 26" fill="none" stroke="#D85A30" strokeWidth="2"/></svg>;
    case 'Off': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="8" y1="8" x2="24" y2="24" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/><line x1="24" y1="8" x2="8" y2="24" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/></svg>;
    case 'Tracked': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/><polygon points="20,10 26,16 20,22" fill="#555"/></svg>;
    default: return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#333"/></svg>;
  }
}

function ActionPicker({ value, onChange, onClose, pos }) {
  return (
    <div style={{ position: 'fixed', top: pos ? pos.top : 0, left: pos ? pos.left : 0, zIndex: 99999, background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '10px', padding: '8px', width: '280px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '4px' }}>
      {ACTIONS.map(a => (
        <div key={a.name} onClick={() => { onChange(a); onClose(); }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 4px', borderRadius: '6px', cursor: 'pointer', background: value === a.name ? '#2a2a3a' : 'transparent', border: value === a.name ? '1px solid #534AB7' : '1px solid transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={e => e.currentTarget.style.background = value === a.name ? '#2a2a3a' : 'transparent'}>
          <ActionIcon action={a.name} size={28} />
          <span style={{ fontSize: '11px', color: '#888', textAlign: 'center', lineHeight: 1.2 }}>{a.short}</span>
        </div>
      ))}
    </div>
  );
}

function SpotCueCell({ spotCue, spot, cue, characters, colorSlots, onUpdate, lqNumber, onDragStart, onDragOver, onDragLeave, onDrop, isDragTarget }) {
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState(null);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTimeVal, setCustomTimeVal] = useState('');
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  const ref = useRef();
  const actionBtnRef = useRef();
  const isOff = spotCue?.action === 'Off' || !spotCue?.action;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowActionPicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

 if (!spotCue) return (
    <td
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e); }}
      style={{ padding: '8px 10px', borderRight: '1px solid #1e1e1e', verticalAlign: 'top', minWidth: '200px', minHeight: '60px', background: isDragTarget ? '#1a1a2e' : '#060606', outline: isDragTarget ? '2px solid #534AB7' : 'none' }}>
      <div style={{ fontSize: '11px', color: '#222', minHeight: '40px', display: 'flex', alignItems: 'center' }}>—</div>
    </td>
  );

  const actionDef = ACTIONS.find(a => a.name === spotCue.action);
  const activeFrames = spotCue.active_frames ? spotCue.active_frames.split(',').filter(Boolean) : [];

  const handleActionSelect = (a) => {
    if (a.name === 'Tracked') {
      onUpdate(spotCue.id, 'action', '');
      onUpdate(spotCue.id, 'intensity', '');
      onUpdate(spotCue.id, 'fade_time', '');
      onUpdate(spotCue.id, 'description', '');
      onUpdate(spotCue.id, 'notes', '');
      setShowActionPicker(false);
      return;
    }
    onUpdate(spotCue.id, 'action', a.name);
    if (a.intensityDefault) onUpdate(spotCue.id, 'intensity', a.intensityDefault);
    if (a.timeDefault !== null) onUpdate(spotCue.id, 'fade_time', a.timeDefault);
  };

  const toggleFrame = (frame) => {
    const current = spotCue.active_frames ? spotCue.active_frames.split(',').filter(Boolean) : [];
    const next = current.includes(frame) ? current.filter(f => f !== frame) : [...current, frame];
    onUpdate(spotCue.id, 'active_frames', next.join(','));
  };

  const handleWLQ = () => {
    if (!lqNumber || !lqNumber.trim()) return;
    onUpdate(spotCue.id, 'description', 'w/ LQ ' + lqNumber);
  };

  if (spotCue.action === 'Off') {
    return (
      <td style={{ padding: '8px 10px', borderRight: '1px solid #1e1e1e', verticalAlign: 'top', minWidth: '200px', background: '#080808' }}>
        <div ref={ref} style={{ position: 'relative', zIndex: showActionPicker ? 99999 : 'auto' }}>
          <div ref={actionBtnRef} onClick={() => {
            if (actionBtnRef.current) {
              const rect = actionBtnRef.current.getBoundingClientRect();
              const pickerHeight = 380;
              const spaceBelow = window.innerHeight - rect.bottom;
              const top = spaceBelow < pickerHeight ? rect.top - pickerHeight - 4 : rect.bottom + 4;
              setPickerPos({ top, left: rect.left });
            }
            setShowActionPicker(v => !v);
          }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 7px', borderRadius: '5px', background: '#111', border: '1px solid #222', cursor: 'pointer' }}>
            <ActionIcon action="Off" size={16} />
            <span style={{ fontSize: '11px', color: '#444', fontWeight: '500' }}>Off</span>
          </div>
          {showActionPicker && <ActionPicker value={spotCue.action} onChange={handleActionSelect} onClose={() => setShowActionPicker(false)} pos={pickerPos} />}
          <div style={{ fontSize: '10px', color: '#2a2a2a', marginTop: '6px', fontStyle: 'italic', textAlign: 'center' }}>spot inactive</div>
        </div>
      </td>
    );
  }

  return (
    <td
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ padding: '8px 10px', borderRight: '1px solid #1e1e1e', verticalAlign: 'top', minWidth: '200px', outline: isDragTarget ? '2px solid #534AB7' : 'none', background: isDragTarget ? '#1a1a2e' : 'transparent', cursor: 'grab' }}>
      <div ref={ref} style={{ position: 'relative', zIndex: showActionPicker ? 9999 : 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
          <div ref={actionBtnRef} onClick={() => {
            if (actionBtnRef.current) {
              const rect = actionBtnRef.current.getBoundingClientRect();
              const pickerHeight = 380;
              const spaceBelow = window.innerHeight - rect.bottom;
              const top = spaceBelow < pickerHeight ? rect.top - pickerHeight - 4 : rect.bottom + 4;
              setPickerPos({ top, left: rect.left });
            }
            setShowActionPicker(v => !v);
          }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 7px', borderRadius: '5px', background: actionDef ? '#1e1e2e' : '#1a1a1a', border: `1px solid ${actionDef ? actionDef.color + '55' : '#2a2a2a'}`, cursor: 'pointer', flex: 1 }}>
            {spotCue.action ? (
              <>
                <ActionIcon action={spotCue.action} size={16} />
                <span style={{ fontSize: '13px', color: actionDef ? actionDef.color : '#888', fontWeight: '500' }}>{spotCue.action}</span>
              </>
            ) : (
              <span style={{ fontSize: '13px', color: '#333' }}>Select action...</span>
            )}
          </div>
          {showActionPicker && <ActionPicker value={spotCue.action} onChange={handleActionSelect} onClose={() => setShowActionPicker(false)} pos={pickerPos} />} 
        </div>

        <select value={spotCue.character_id || ''} onChange={e => onUpdate(spotCue.id, 'character_id', e.target.value ? parseInt(e.target.value) : null)}
          style={{ ...selectStyle, color: spotCue.character_id ? '#f0f0f0' : '#444', marginBottom: '5px' }}>
          <option value="">Character...</option>
          {characters.map(c => <option key={c.id} value={c.id}>{c.name}{c.actor_name ? ' (' + c.actor_name + ')' : ''}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
          <select value={spotCue.intensity || ''} onChange={e => onUpdate(spotCue.id, 'intensity', e.target.value)}
            style={{ ...selectStyle, flex: 1, color: spotCue.intensity ? '#f0f0f0' : '#444' }}>
            <option value="">Int...</option>
            {INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <div style={{ flex: 1 }}>
            {showCustomTime ? (
              <input autoFocus value={customTimeVal} onChange={e => setCustomTimeVal(e.target.value)}
                onBlur={() => { onUpdate(spotCue.id, 'fade_time', customTimeVal); setShowCustomTime(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { onUpdate(spotCue.id, 'fade_time', customTimeVal); setShowCustomTime(false); }}}
                style={{ width: '100%', background: '#111', border: '1px solid #534AB7', borderRadius: '4px', color: '#f0f0f0', padding: '3px 4px', fontSize: '11px', outline: 'none' }}
                placeholder="e.g. 2.5" />
            ) : (
              <select value={spotCue.fade_time || ''} onChange={e => { if (e.target.value === 'Custom') { setShowCustomTime(true); setCustomTimeVal(''); } else onUpdate(spotCue.id, 'fade_time', e.target.value); }}
                style={{ ...selectStyle, color: spotCue.fade_time ? '#f0f0f0' : '#444' }}>
                <option value="">Time...</option>
                {TIMES.map(t => <option key={t} value={t}>{t === 'Custom' ? 'Custom...' : t + 's'}</option>)}
              </select>
            )}
          </div>
        </div>

<div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[{label:'FB',value:'Full Body'},{label:'3/4',value:'3/4 Body'},{label:'1/2',value:'1/2 Body'},{label:'H&S',value:'Head & Shoulders'},{label:'Hd',value:'Head'}].map(iris => (
              <div key={iris.value}
                onClick={() => onUpdate(spotCue.id, 'frame_size', spotCue.frame_size === iris.value ? '' : iris.value)}
                style={{ padding: '2px 6px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', background: spotCue.frame_size === iris.value ? '#185FA5' : '#1a1a1a', color: spotCue.frame_size === iris.value ? '#fff' : '#444', border: `1px solid ${spotCue.frame_size === iris.value ? '#185FA5' : '#2a2a2a'}` }}>
                {iris.label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {colorSlots.map(slot => {
              const isActive = activeFrames.includes('F' + slot.slot_number);
              const isHovered = hoveredFrame === slot.id;
              return (
                <div key={slot.id} style={{ position: 'relative' }}>
                  <div
                    onClick={() => toggleFrame('F' + slot.slot_number)}
                    onMouseEnter={() => setHoveredFrame(slot.id)}
                    onMouseLeave={() => setHoveredFrame(null)}
                    style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', background: isActive ? '#534AB7' : '#1a1a1a', color: isActive ? '#fff' : '#555', border: `1px solid ${isActive ? '#534AB7' : '#2a2a2a'}` }}>
                    F{slot.slot_number}
                  </div>
                  {isHovered && slot.gel_number && (
                    <div style={{ position: 'fixed', zIndex: 99999, transform: 'translateX(-50%)', marginTop: '4px', background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '8px 10px', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', minWidth: '120px' }}
                      ref={el => {
                        if (el) {
                          const btn = el.previousSibling;
                          if (btn) {
                            const rect = btn.getBoundingClientRect();
                            el.style.top = (rect.bottom + 6) + 'px';
                            el.style.left = (rect.left + rect.width / 2) + 'px';
                          }
                        }
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: getGelColor(slot.gel_number), flexShrink: 0, border: '1px solid #444' }} />
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f0f0f0' }}>{slot.gel_number}</div>
                          <div style={{ fontSize: '10px', color: '#888' }}>{slot.gel_name}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '3px' }}>
          <input value={spotCue.description || ''} onChange={e => onUpdate(spotCue.id, 'description', e.target.value)}
            placeholder="When..."
            style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#888', padding: '2px 0', fontSize: '12px', outline: 'none' }} />
          <div onClick={handleWLQ} title="Auto-fill w/ LQ number"
            style={{ fontSize: '9px', color: '#333', cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', border: '1px solid #222', whiteSpace: 'nowrap', lineHeight: 1.3 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#333'; e.currentTarget.style.borderColor = '#222'; }}>
            w/LQ
          </div>
        </div>

        <input value={spotCue.notes || ''} onChange={e => onUpdate(spotCue.id, 'notes', e.target.value)}
          placeholder="Notes..."
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#666', padding: '2px 0', fontSize: '12px', outline: 'none', fontStyle: 'italic' }} />
      </div>
    </td>
  );
}

function InsertButton({ onInsert }) {
  const [hover, setHover] = useState(false);
  return (
    <tr style={{ height: hover ? '24px' : '4px', transition: 'height 0.1s' }}>
      <td colSpan={99}
        style={{ padding: 0, textAlign: 'center', verticalAlign: 'middle', overflow: 'visible', position: 'relative', zIndex: 0 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        {hover ? (
          <div onClick={onInsert}
            style={{ fontSize: '10px', color: '#534AB7', cursor: 'pointer', padding: '2px 6px', background: '#1a1a2a', borderRadius: '3px', display: 'inline-block', position: 'relative', zIndex: 1 }}>
            + insert cue here
          </div>
        ) : (
          <div style={{ width: '100%', height: '4px', pointerEvents: 'none' }} />
        )}
      </td>
    </tr>
  );
}

function CueRow({ cue, spots, spotCues, characters, colorSlotsBySpot, scenes, onUpdateCue, onUpdateSpotCue, onDelete, onInsertAfter, dragSource, dragTarget, setDragSource, setDragTarget, setShowDragModal }) {
  const [editingLQ, setEditingLQ] = useState(false);
  const [lqVal, setLqVal] = useState(cue.lq_number || '');

  useEffect(() => { setLqVal(cue.lq_number || ''); }, [cue.lq_number]);

  const saveLQ = () => {
    setEditingLQ(false);
    onUpdateCue(cue.id, 'lq_number', lqVal);
  };

  return (
    <>
      <tr style={{ borderBottom: '1px solid #141414' }}
        onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <td style={{ padding: '8px 6px', borderRight: '1px solid #1e1e1e', verticalAlign: 'top', width: '90px', minWidth: '90px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            {editingLQ ? (
              <input autoFocus value={lqVal} onChange={e => setLqVal(e.target.value)}
                onBlur={saveLQ} onKeyDown={e => e.key === 'Enter' && saveLQ()}
                style={{ width: '64px', background: '#111', border: '1px solid #534AB7', borderRadius: '4px', color: '#f0f0f0', padding: '3px 6px', fontSize: '16px', fontWeight: '700', textAlign: 'center', outline: 'none' }} />
            ) : (
              <div onClick={() => setEditingLQ(true)} style={{ fontSize: '20px', fontWeight: '700', color: lqVal ? '#f0f0f0' : '#2a2a2a', cursor: 'pointer', minHeight: '24px' }}>
                {lqVal || '—'}
              </div>
            )}
            <div style={{ fontSize: '10px', color: '#3a3a3a' }}>T·{cue.track_number}</div>
            <select value={cue.scene_id || ''} onChange={e => onUpdateCue(cue.id, 'scene_id', e.target.value ? parseInt(e.target.value) : null)}
              style={{ width: '72px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '3px', color: '#444', padding: '2px 2px', fontSize: '9px', outline: 'none', marginTop: '2px' }}>
              <option value="">No scene</option>
              {scenes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <div onClick={() => { if (window.confirm('Delete this cue?')) onDelete(cue.id); }}
              style={{ fontSize: '10px', color: '#c44', cursor: 'pointer', marginTop: '2px', opacity: 0.4 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.4}>
              del
            </div>
          </div>
        </td>
        {spots.map(spot => {
          const sc = spotCues.find(sc => sc.spot_id === spot.id && sc.cue_id === cue.id);
          const slots = colorSlotsBySpot[spot.id] || [];
          return (
            <SpotCueCell key={spot.id} spotCue={sc} spot={spot} cue={cue}
              characters={characters} colorSlots={slots}
              onUpdate={onUpdateSpotCue} lqNumber={lqVal}
              onDragStart={() => setDragSource({ spotCue: sc, spot, cue })}
              onDragOver={(e) => { e.preventDefault(); setDragTarget({ spotCue: sc, spot, cue }); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragTarget(null); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragSource && !(dragSource.spot?.id === spot?.id && dragSource.cue?.id === cue?.id)) {
                  setDragTarget({ spotCue: sc, spot, cue });
                  setShowDragModal(true);
                }
              }}
              isDragTarget={dragTarget?.cue?.id === cue?.id && dragTarget?.spot?.id === spot?.id}
            />
          );
        })}
      </tr>
      <InsertButton onInsert={() => onInsertAfter(cue.id, cue.scene_id)} />
    </>
  );
}

export default function CueListScreen({ show, navigate }) {
  const [data, setData] = useState({ spots: [], scenes: [], cues: [], spotCues: [] });
  const [characters, setCharacters] = useState([]);
  const [colorSlotsBySpot, setColorSlotsBySpot] = useState({});
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showCharModal, setShowCharModal] = useState(false);
  const [newSceneLabel, setNewSceneLabel] = useState('');
  const [newSceneSong, setNewSceneSong] = useState('');
  const [newCharName, setNewCharName] = useState('');
  const [newCharActor, setNewCharActor] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const scrollRef = useRef(null);
  const [dragSource, setDragSource] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);
  const [showDragModal, setShowDragModal] = useState(false);
  const [dragModalStep, setDragModalStep] = useState('action');

  const load = () => {
    const result = ipcRenderer.sendSync('db-get-cue-list', show.id);
    const safe = result && typeof result === 'object' ? result : { spots: [], scenes: [], cues: [], spotCues: [] };
    setData(safe);
    const chars = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(chars) ? chars : []);
    const slotsBySpot = {};
    for (const spot of (safe.spots || [])) {
      const slots = ipcRenderer.sendSync('db-get-color-slots', spot.id);
      slotsBySpot[spot.id] = Array.isArray(slots) ? slots : [];
    }
    setColorSlotsBySpot(slotsBySpot);
    if (safe.scenes && safe.scenes.length > 0) {
      const savedScene = sessionStorage.getItem(`cueScene_${show.id}`);
      if (savedScene) {
        setSelectedSceneId(parseInt(savedScene));
      } else if (!selectedSceneId) {
        setSelectedSceneId(safe.scenes[0].id);
      }
    }
    setTimeout(() => {
      const savedScroll = sessionStorage.getItem(`cueScroll_${show.id}`);
      if (savedScroll && scrollRef.current) {
        scrollRef.current.scrollTop = parseInt(savedScroll);
      }
    }, 100);
  };

  useEffect(() => { load(); }, []);

  const addCue = () => {
    const lastCue = (data?.cues || [])[(data?.cues || []).length - 1];
    const sceneId = selectedSceneId || (lastCue ? lastCue.scene_id : null);
    ipcRenderer.sendSync('db-create-cue', { showId: show.id, sceneId });
    load();
  };

  const insertCueAfter = (afterCueId, sceneId) => {
    ipcRenderer.sendSync('db-create-cue', { showId: show.id, sceneId, afterCueId });
    load();
  };

  const updateCue = (cueId, field, value) => {
    ipcRenderer.sendSync('db-update-cue', { cueId, field, value });
    if (field === 'scene_id') {
      load();
    } else {
      setData(d => ({ ...d, cues: (d?.cues || []).map(c => c.id === cueId ? { ...c, [field]: value } : c) }));
    }
  };

  const updateSpotCue = (spotCueId, field, value) => {
    ipcRenderer.sendSync('db-update-spot-cue', { spotCueId, field, value });
    setData(d => ({ ...d, spotCues: (d?.spotCues || []).map(sc => sc.id === spotCueId ? { ...sc, [field]: value } : sc) }));
  };
  const upsertSpotCue = (spotId, cueId, field, value) => {
    const result = ipcRenderer.sendSync('db-upsert-spot-cue', { spotId, cueId, field, value });
    if (result.success) {
      setData(d => {
        const existing = (d?.spotCues || []).find(sc => sc.spot_id === spotId && sc.cue_id === cueId);
        if (existing) {
          return { ...d, spotCues: d.spotCues.map(sc => sc.spot_id === spotId && sc.cue_id === cueId ? { ...sc, [field]: value } : sc) };
        } else {
          return { ...d, spotCues: [...(d.spotCues || []), { spot_id: spotId, cue_id: cueId, id: result.id, [field]: value }] };
        }
      });
    }
  };

  const deleteCue = (cueId) => {
    ipcRenderer.sendSync('db-delete-cue', cueId);
    load();
  };

  const addScene = () => {
    if (!newSceneLabel.trim()) return;
    const result = ipcRenderer.sendSync('db-create-scene', { showId: show.id, label: newSceneLabel, song: newSceneSong });
    if (result.success) { setSelectedSceneId(result.id); setNewSceneLabel(''); setNewSceneSong(''); setShowSceneModal(false); load(); }
  };

  const addCharacter = () => {
    if (!newCharName.trim()) return;
    ipcRenderer.sendSync('db-create-character', { showId: show.id, name: newCharName, actorName: newCharActor });
    setNewCharName(''); setNewCharActor(''); setShowCharModal(false);
    const chars = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(chars) ? chars : []);
  };

const groupedCues = () => {
    const cues = data?.cues || [];
    const scenes = data?.scenes || [];
    const sorted = [...cues].sort((a, b) => a.sort_order - b.sort_order);
    const groups = [];

    const sceneOrder = scenes.map(s => s.id);
    const usedSceneIds = new Set();

    for (const sceneId of sceneOrder) {
      const sceneCues = sorted.filter(c => c.scene_id === sceneId);
      if (sceneCues.length === 0) continue;
      const scene = scenes.find(s => s.id === sceneId);
      groups.push({
        sceneId,
        sceneLabel: scene ? scene.label : 'Unknown',
        sceneSong: scene ? scene.song : '',
        actBreak: scene ? !!scene.act_break : false,
        cues: sceneCues,
      });
      usedSceneIds.add(sceneId);
    }

    const unassigned = sorted.filter(c => !c.scene_id);
    if (unassigned.length > 0) {
      groups.push({ sceneId: null, sceneLabel: 'Unassigned', sceneSong: '', cues: unassigned });
    }

    return groups;
  };

      return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a' }}>
    <AppHeader title="Cue List" onBack={() => navigate('show', show)} backLabel={show.title}>
        <div style={{ flex: 1 }} />
        <select value={selectedSceneId || ''} onChange={e => setSelectedSceneId(e.target.value ? parseInt(e.target.value) : null)}
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#ccc', padding: '5px 8px', fontSize: '12px', outline: 'none' }}>
          <option value="">No scene</option>
          {(data?.scenes || []).map(s => <option key={s.id} value={s.id}>{s.label}{s.song ? ' · ' + s.song : ''}</option>)}
        </select>
        <button onClick={() => setShowSceneModal(true)} style={{ padding: '5px 10px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>+ Scene</button>
        <button onClick={() => setShowCharModal(true)} style={{ padding: '5px 10px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>+ Character</button>
        <button onClick={addCue} style={{ padding: '6px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Cue</button>
      </AppHeader>

      <div ref={scrollRef} onScroll={() => {
        if (scrollRef.current) {
          sessionStorage.setItem(`cueScroll_${show.id}`, scrollRef.current.scrollTop);
          sessionStorage.setItem(`cueScene_${show.id}`, selectedSceneId);
        }
      }} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
        {(data?.cues || []).length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '12px', color: '#333' }}>
            <div style={{ fontSize: '36px' }}>✦</div>
            <div style={{ fontSize: '15px' }}>No cues yet</div>
            <div style={{ fontSize: '12px', color: '#2a2a2a' }}>Add a scene first, then create your first cue</div>
            <button onClick={addCue} style={{ marginTop: '8px', padding: '8px 20px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>+ Add first cue</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr style={{ background: '#141414', borderBottom: '1px solid #2a2a2a' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#444', fontWeight: '600', width: '90px', borderRight: '1px solid #1e1e1e' }}>CUE</th>
                {(data?.spots || []).map(spot => (
                  <th key={spot.id} style={{ padding: '8px 10px', textAlign: 'left', borderRight: '1px solid #1e1e1e', minWidth: '200px' }}>
                    <div style={{ fontSize: '13px', color: '#534AB7', fontWeight: '800' }}>SPOT {spot.spot_number}</div>
                    {spot.operator_name && <div style={{ fontSize: '12px', color: '#888', fontWeight: '500', marginTop: '1px' }}>{spot.operator_name}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedCues().map(group => (
                <React.Fragment key={group.sceneId || 'unassigned'}>
                  <tr>
                    <td colSpan={(data?.spots || []).length + 1} style={{ padding: '5px 12px', background: group.actBreak ? '#1a0a2e' : '#0a1a10', borderTop: `1px solid ${group.actBreak ? '#3a1a5a' : '#1a3a24'}`, borderBottom: `1px solid ${group.actBreak ? '#3a1a5a' : '#1a3a24'}` }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: group.actBreak ? '#9060c0' : '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {group.sceneLabel}
                      </span>
                      {group.sceneSong && <span style={{ fontSize: '11px', color: group.actBreak ? '#6040a0' : '#0F6E56', marginLeft: '8px' }}>· {group.sceneSong}</span>}
                    </td>
                  </tr>
                  {group.cues.map(cue => (
                    <CueRow key={cue.id} cue={cue} spots={data?.spots || []}
                      spotCues={data?.spotCues || []} characters={characters}
                      colorSlotsBySpot={colorSlotsBySpot} scenes={data?.scenes || []}
                      onUpdateCue={updateCue} onUpdateSpotCue={updateSpotCue}
                      onDelete={deleteCue} onInsertAfter={insertCueAfter}
                      dragSource={dragSource} dragTarget={dragTarget}
                      setDragSource={setDragSource} setDragTarget={setDragTarget}
                      setShowDragModal={setShowDragModal} />
                  ))}
                </React.Fragment>
              ))}
              <tr>
                <td colSpan={(data?.spots || []).length + 1} style={{ textAlign: 'center', padding: '24px', color: '#333', fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', borderTop: '1px solid #2a2a2a' }}>
                  — End of Show —
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {showDragModal && dragSource && dragTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '28px', width: '400px' }}>
            {dragModalStep === 'action' ? (
              <>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f0f0f0', marginBottom: '8px' }}>Move cue data</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>
                  What do you want to do with <span style={{ color: '#534AB7' }}>Spot {dragSource.spot.spot_number} / {dragSource.cue.lq_number || 'T·' + dragSource.cue.track_number}</span>?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => {
                    const srcData = { ...dragSource.spotCue };
                    const tgtData = dragTarget.spotCue ? { ...dragTarget.spotCue } : {};
                    const fields = ['action','character_id','frame_size','intensity','fade_time','active_frames','description','notes'];
                    if (dragSource.spotCue) {
                      fields.forEach(f => updateSpotCue(dragSource.spotCue.id, f, tgtData[f] || ''));
                    } else {
                      fields.forEach(f => upsertSpotCue(dragSource.spot.id, dragSource.cue.id, f, tgtData[f] || ''));
                    }
                    if (dragTarget.spotCue) {
                      fields.forEach(f => updateSpotCue(dragTarget.spotCue.id, f, srcData[f] || ''));
                    } else {
                      fields.forEach(f => upsertSpotCue(dragTarget.spot.id, dragTarget.cue.id, f, srcData[f] || ''));
                    }
                    setShowDragModal(false);
                    setDragSource(null);
                    setDragTarget(null);
                    setDragModalStep('action');
                  }} style={{ padding: '12px', background: '#534AB7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                    <div>Swap</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Exchange data between both spots</div>
                  </button>
                  <button onClick={() => setDragModalStep('character')}
                    style={{ padding: '12px', background: '#1e1e1e', border: '1px solid #3a3a3a', borderRadius: '8px', color: '#f0f0f0', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                    <div>Copy</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Copy source data into target spot</div>
                  </button>
                  <button onClick={() => { setShowDragModal(false); setDragSource(null); setDragTarget(null); setDragModalStep('action'); }}
                    style={{ padding: '8px', background: 'none', border: 'none', color: '#555', fontSize: '13px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f0f0f0', marginBottom: '8px' }}>Copy character?</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>
                  Should the character name also be copied, or keep the existing character in the target spot?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => {
                    const srcData = { ...dragSource.spotCue };
                    const fields = ['action','character_id','frame_size','intensity','fade_time','active_frames','description','notes'];
                    if (dragTarget.spotCue) {
                      fields.forEach(f => updateSpotCue(dragTarget.spotCue.id, f, srcData[f] || ''));
                    } else {
                      fields.forEach(f => upsertSpotCue(dragTarget.spot.id, dragTarget.cue.id, f, srcData[f] || ''));
                    }
                    setShowDragModal(false);
                    setDragSource(null);
                    setDragTarget(null);
                    setDragModalStep('action');
                  }} style={{ padding: '12px', background: '#534AB7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                    <div>Copy everything including character</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Target spot will have the same character</div>
                  </button>
                  <button onClick={() => {
                    const srcData = { ...dragSource.spotCue };
                    const fields = ['action','frame_size','intensity','fade_time','active_frames','description','notes'];
                    if (dragTarget.spotCue) {
                      fields.forEach(f => updateSpotCue(dragTarget.spotCue.id, f, srcData[f] || ''));
                    } else {
                      fields.forEach(f => upsertSpotCue(dragTarget.spot.id, dragTarget.cue.id, f, srcData[f] || ''));
                    }
                    setShowDragModal(false);
                    setDragSource(null);
                    setDragTarget(null);
                    setDragModalStep('action');
                  }} style={{ padding: '12px', background: '#1e1e1e', border: '1px solid #3a3a3a', borderRadius: '8px', color: '#f0f0f0', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                    <div>Copy everything except character</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Keep the existing character in the target spot</div>
                  </button>
                  <button onClick={() => setDragModalStep('action')}
                    style={{ padding: '8px', background: 'none', border: 'none', color: '#555', fontSize: '13px', cursor: 'pointer' }}>
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>

      {showSceneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '12px', padding: '24px', width: '360px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#f0f0f0' }}>Add Scene</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Scene label *</label>
              <input autoFocus value={newSceneLabel} onChange={e => setNewSceneLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addScene()}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. Scene 1 - The Road" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Song (optional)</label>
              <input value={newSceneSong} onChange={e => setNewSceneSong(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addScene()}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. Time Is My Enemy" />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSceneModal(false)} style={{ padding: '7px 14px', background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addScene} style={{ padding: '7px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Add Scene</button>
            </div>
          </div>
        </div>
      )}

      {showCharModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '12px', padding: '24px', width: '360px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#f0f0f0' }}>Add Character</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Character name *</label>
              <input autoFocus value={newCharName} onChange={e => setNewCharName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. MARIO" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Actor name (optional)</label>
              <input value={newCharActor} onChange={e => setNewCharActor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. John Smith" />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCharModal(false)} style={{ padding: '7px 14px', background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addCharacter} style={{ padding: '7px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Add Character</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}