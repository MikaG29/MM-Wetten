document.addEventListener('DOMContentLoaded', () => {

  // ---------------- Matrix Hintergrund ----------------
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  const chars = '01';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(0);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff66';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(drawMatrix, 40);

  // ---------------- Rangliste ----------------

  let spieler = [
    { name: 'Leo', punkte: [3] },
    { name: 'Mika', punkte: [3] },
    { name: 'Mike', punkte: [3] },
    { name: 'Max', punkte: [0] },
    { name: 'Der Tobi', punkte: [0] },
    { name: 'Reisbällchen', punkte: [5] },
    { name: 'Ruben', punkte: [0] },
    { name: 'Lucas', punkte: [0] }
  ];

  let letztePlatzierung = JSON.parse(localStorage.getItem('letztePlatzierung')) || {};

  spieler.forEach(s => {
    s.gesamt = s.punkte.reduce((sum, p) => sum + p, 0);
  });

  spieler.sort((a, b) => b.gesamt - a.gesamt);

  let platz = 1;
  for (let i = 0; i < spieler.length; i++) {
    if (i > 0 && spieler[i].gesamt === spieler[i - 1].gesamt) {
      spieler[i].platz = spieler[i - 1].platz;
    } else {
      spieler[i].platz = platz;
    }
    platz = i + 2;
  }

  spieler.forEach(s => {
    const alt = letztePlatzierung[s.name];
    const neu = s.platz;
    if (alt == null) s.diff = 'same';
    else if (alt > neu) s.diff = 'up';
    else if (alt < neu) s.diff = 'down';
    else s.diff = 'same';
  });

  let neuePlatzierung = {};
  spieler.forEach(s => {
    neuePlatzierung[s.name] = s.platz;
  });
  localStorage.setItem('letztePlatzierung', JSON.stringify(neuePlatzierung));

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
