/* ==========================================================
   La Gazzetta · fuente de noticias
   ----------------------------------------------------------
   Para publicar notas desde Google Sheets:
   1. Crea una hoja con una pestaña llamada "Gazzetta" y estas
      columnas en la fila 1 (usa gazzetta-plantilla.csv):
      fecha | seccion | titulo | resumen | imagen | fuente | url | destacada
      - fecha: AAAA-MM-DD
      - destacada: "si" para la nota principal
   2. Compartir > "Cualquier persona con el enlace" > Lector.
   3. Pega el ID de la hoja (lo que va entre /d/ y /edit en la URL)
      en GACETA_SHEET_ID. Las notas nuevas aparecen solas.
   Si la hoja no responde, la página usa las notas de abajo.
   ========================================================== */
var GACETA_SHEET_ID = '';
var GACETA_SHEET_TAB = 'Gazzetta';

var GACETA_LOCAL = [
  {
    fecha: '2026-11-09', seccion: 'Ride Like a Pro México', destacada: 'si',
    titulo: 'Ride Like a Pro llega al Zócalo: la salida será el 28 de febrero de 2027',
    resumen: 'La edición mexicana del gran fondo del Giro d’Italia arrancará en la esquina de 20 de Noviembre y el Zócalo capitalino, con dos distancias: Medio Fondo (60 km) y Gran Fondo (120 km). Al cruzar la meta, todos llegan a GIRO-LAND, la zona de hospitalidad oficial.',
    imagen: 'img/fb-salida.jpg', fuente: 'Organización Ride Like a Pro México', url: 'index.html#distancias'
  },
  {
    fecha: '2026-11-03', seccion: 'Giro 2027',
    titulo: 'El Giro 2027 ya tiene ruta: de Trieste a Roma, con doble Mortirolo, Gavia y Zoncolan',
    resumen: 'La 110.ª edición correrá del 8 al 30 de mayo de 2027: 21 etapas y 3,418.9 km, con dos contrarrelojes (una de ellas cronoescalada) y más de 50,000 metros de desnivel. La etapa reina sube dos veces el Mortirolo con el Gavia en medio.',
    imagen: '', fuente: 'Escape Collective · Flashscore', url: 'https://escapecollective.com/a-spectacular-queen-stage-and-the-zoncolan-too-the-2027-giro-route-revealed/'
  },
  {
    fecha: '2026-11-03', seccion: 'Giro Women',
    titulo: 'El Giro femenino 2027 saldrá de Viareggio y terminará en el Monte Bianco',
    resumen: 'Nueve etapas y 1,132 km del 29 de mayo al 6 de junio de 2027, con llegadas en alto al Passo della Presolana y a Madesimo-Valle Spluga.',
    imagen: '', fuente: 'Flashscore', url: 'https://www.flashscore.com.mx/noticias/el-giro-de-italia-2027-saldra-de-trieste-y-llegara-a-roma-con-cinco-etapas-de-alta-montana/d6MR5huh/'
  },
  {
    fecha: '2026-10-10', seccion: 'Clásicas',
    titulo: 'Paul Seixas gana Il Lombardia; Isaac del Toro termina en el lugar 28',
    resumen: 'El francés se llevó su primer Monumento en la última gran clásica de la temporada. El mexicano no pudo repetir el top 5 del año pasado y cerró en la posición 28.',
    imagen: '', fuente: 'ClaroSports', url: 'https://www.clarosports.com/ciclismo/paul-seixas-gana-y-hace-historia-en-el-giro-de-lombardia-2026-isaac-del-toro-termina-en-el-lugar-28/'
  },
  {
    fecha: '2026-09-29', seccion: 'México',
    titulo: 'Isaac del Toro, quinto en el Mundial de Montreal',
    resumen: 'El ciclista de Ensenada firmó un resultado histórico en la prueba de ruta del Campeonato Mundial 2026 y se quedó a las puertas del podio.',
    imagen: '', fuente: 'ClaroSports', url: 'https://www.clarosports.com/ciclismo/que-sigue-para-isaac-del-toro-despues-del-campeonato-mundial/'
  },
  {
    fecha: '2026-07-30', seccion: 'Ride Like a Pro',
    titulo: 'Ride Like a Pro Brasil estrena sede en São Paulo',
    resumen: 'El gran fondo del Giro sumó una nueva edición brasileña el 23 de agosto de 2026, tras los antecedentes de Campos do Jordão y Fortaleza.',
    imagen: '', fuente: 'giroditalia.it', url: 'https://www.giroditalia.it/en/news/giro-ditalia-ride-like-a-pro-brazil-2026-sao-paulo-edition-23-august-2026/'
  },
  {
    fecha: '2026-05-31', seccion: 'Giro 2026',
    titulo: 'Jonas Vingegaard conquista el Giro 2026 en Roma',
    resumen: 'El danés ganó su primera maglia rosa y completó la trilogía de grandes vueltas. Felix Gall fue segundo a 5:22 y Jai Hindley completó el podio.',
    imagen: '', fuente: 'TVMax', url: 'https://www.tvn-2.com/tvmax/mas-deportes/giro-de-italia-2026-jonas-vingegaard-corona-trilogia-vueltas-ciclismo-internacional_1_2243564.html'
  },
  {
    fecha: '2025-12-03', seccion: 'Ride Like a Pro',
    titulo: 'Colombia recibe su primer gran fondo Ride Like a Pro',
    resumen: 'Cundinamarca fue sede el 1 de marzo de 2026 con dos recorridos, 132 y 84 km, y más de 5,000 ciclistas esperados en nueve categorías.',
    imagen: '', fuente: 'ClaroSports', url: 'https://www.clarosports.com/ciclismo/colombia-hara-historia-con-el-giro-de-italia-ride-like-a-pro/'
  }
];

function gacetaParseCSV(text) {
  var rows = [], row = [], cur = '', q = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  var head = (rows.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
  return rows.filter(function (r) { return r.join('').trim(); }).map(function (r) {
    var o = {}; head.forEach(function (h, k) { o[h] = (r[k] || '').trim(); }); return o;
  });
}

function gacetaCargar(cb) {
  var done = function (list, origen) {
    list = list.filter(function (n) { return n.titulo; })
      .sort(function (a, b) { return (b.fecha || '').localeCompare(a.fecha || ''); });
    cb(list, origen);
  };
  if (!GACETA_SHEET_ID) { done(GACETA_LOCAL.slice(), 'local'); return; }
  var url = 'https://docs.google.com/spreadsheets/d/' + GACETA_SHEET_ID +
    '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(GACETA_SHEET_TAB);
  fetch(url).then(function (r) { if (!r.ok) throw 0; return r.text(); })
    .then(function (t) { var l = gacetaParseCSV(t); done(l.length ? l : GACETA_LOCAL.slice(), l.length ? 'sheet' : 'local'); })
    .catch(function () { done(GACETA_LOCAL.slice(), 'local'); });
}

var GACETA_MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function gacetaFecha(f) {
  var p = (f || '').split('-');
  if (p.length < 3) return f || '';
  return (+p[2]) + ' ' + GACETA_MESES[(+p[1]) - 1] + ' ' + p[0];
}
function gacetaEsc(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function gacetaEsExterna(u) { return /^https?:\/\//.test(u || ''); }
