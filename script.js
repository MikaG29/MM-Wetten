document.addEventListener('DOMContentLoaded', () => {
  // ---------------- Rangliste ----------------

  // Spieler-Daten: Array von Punkten pro Durchgang
  let spieler = [
    { name: 'Leo', punkte: [3] },
    { name: 'Mika', punkte: [3] },
    { name: 'Mike', punkte: [3] },
    { name: 'Max', punkte: [0] },
    { name: 'Der Tobi', punkte: [0] },
    { name: 'Reisbällchen', punkte: [5] },
    { name: 'Ruben', punkte: [0] },
  ];

  // Alte Platzierungen aus localStorage laden
  let letztePlatzierung = JSON.parse(localStorage.getItem('letztePlatzierung')) || {};

  // Punkte summieren
  spieler.forEach(s => {
    s.gesamt = s.punkte.reduce((sum, p) => sum + p, 0);
  });

  // Sortieren nach Gesamtpunkten (absteigend)
  spieler.sort((a, b) => b.gesamt - a.gesamt);

  // Platzierung mit Gleichständen berechnen
  let platz = 1;
  for (let i = 0; i < spieler.length; i++) {
    if (i > 0 && spieler[i].gesamt === spieler[i - 1].gesamt) {
      spieler[i].platz = spieler[i - 1].platz;
    } else {
      spieler[i].platz = platz;
    }
    platz = i + 2; // nächster Platzindex
  }

  // Vergleich zur alten Rangliste für Pfeile
  spieler.forEach(s => {
    const alt = letztePlatzierung[s.name];
    const neu = s.platz;
    if (alt == null) s.diff = 'same';
    else if (alt > neu) s.diff = 'up';
    else if (alt < neu) s.diff = 'down';
    else s.diff = 'same';
  });

  // Neue Platzierungen speichern
  let neuePlatzierung = {};
  spieler.forEach(s => {
    neuePlatzierung[s.name] = s.platz;
  });
  localStorage.setItem('letztePlatzierung', JSON.stringify(neuePlatzierung));

  // Tabelle anzeigen
  const tbody = document.querySelector('#rangliste tbody');
  spieler.forEach(s => {
    const tr = document.createElement('tr');
    let symbol = '';
    if (s.diff === 'up') symbol = '▲';
    if (s.diff === 'down') symbol = '▼';
    if (s.diff === 'same') symbol = '•';
    tr.innerHTML = `
      <td>${s.platz}</td>
      <td>${s.name}</td>
      <td>${s.gesamt}</td>
      <td class="${s.diff}">${symbol}</td>
    `;
    tbody.appendChild(tr);
  });
});
