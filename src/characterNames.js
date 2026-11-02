// More than one character in a spot cue ("Pick Up Bob & Matt"). The first character stays where it
// always was (spot_cues.character_id, or spot_cues.custom_character for a typed name). Any others are
// in spot_cues.extra_characters, a JSON list in order where a number is a character id and text is a
// typed name, e.g. [12, "Ensemble"]. Shown together as "Bob & Matt" or "Bob, Matt & Sue".

const MAX_CHARACTERS = 3;

// The extra characters list, from the column's JSON (bad or empty → [])
function extraCharacters(json) {
  let list = [];
  try { list = (typeof json === 'string' ? JSON.parse(json) : json) || []; } catch (e) { list = []; }
  if (!Array.isArray(list)) return [];
  return list.filter(x => (typeof x === 'number' && x > 0) || (typeof x === 'string' && x.trim()));
}

// The column's value for a list (null when empty, so a spot cue with one character looks as before)
function extraCharactersJSON(list) {
  const clean = extraCharacters(list);
  return clean.length ? JSON.stringify(clean) : null;
}

// Every character name in a spot cue, in order. characters: a Map or a plain object of id → character.
function characterNames(sc, characters) {
  if (!sc) return [];
  const get = (id) => (characters instanceof Map ? characters.get(id) : characters?.[id]);
  const nameOf = (x) => (typeof x === 'number' ? (get(x)?.name || '') : x).trim();
  const first = sc.character_id ? (get(sc.character_id)?.name || '') : (sc.custom_character || '');
  return [first, ...extraCharacters(sc.extra_characters)].map(nameOf).filter(Boolean);
}

// "Bob", "Bob & Matt", "Bob, Matt & Sue"
function joinNames(names) {
  if (names.length <= 1) return names[0] || '';
  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
}

function characterLabel(sc, characters) {
  return joinNames(characterNames(sc, characters));
}

module.exports = { MAX_CHARACTERS, extraCharacters, extraCharactersJSON, characterNames, joinNames, characterLabel };
