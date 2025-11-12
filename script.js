document.addEventListener('DOMContentLoaded', () => {

    // ---------------- 1. Matrix Hintergrund (Unverändert) ----------------
    const canvas = document.getElementById('matrix');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let canvasWidth = window.innerWidth;
        let canvasHeight = window.innerHeight;
        canvas.height = canvasHeight;
        canvas.width = canvasWidth;

        const chars = '01'; 
        const fontSize = 14;
        let columns = Math.floor(canvasWidth / fontSize);
        let drops = Array(columns).fill(0); 

        const resizeCanvas = () => {
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
            canvas.height = canvasHeight;
            canvas.width = canvasWidth;
            columns = Math.floor(canvasWidth / fontSize);
            drops = Array(columns).fill(0);
        }
        window.addEventListener('resize', resizeCanvas);

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
    }

    // ---------------- 2. Rangliste Daten und Initialisierung ----------------

    // *** HAUPTDATEN: HIER die neuen Punkte pro Runde eintragen! ***
    let spieler = [
        // Beispiel: Daten wurden für die neue Runde geändert
        { name: 'Leo', punkte: [3, 3] }, 
        { name: 'Mika', punkte: [3, 0] }, 
        { name: 'Mike', punkte: [3, 2] },
        { name: 'Max', punkte: [0, 0] },
        { name: 'Der Tobi', punkte: [0, 4] },
        { name: 'Reisbällchen', punkte: [5, 0] },
        { name: 'Ruben', punkte: [0, 0] },
        { name: 'Lucas', punkte: [0, 1] },
        { name: 'Jul', punkte: [0, 2] },
        { name: 'Robert S.', punkte: [0, 4] },
        { name: 'Arian', punkte: [0, 0] },
        { name: 'Lennox', punkte: [0, 0] },
        { name: 'Henrik', punkte: [0, 0] },
        { name: 'Robert M.', punkte: [0, 0] },
        { name: 'AN', punkte: [0, 3] }
    ];

    // *** MANUELLER VERGLEICHSWERT für die historische Platzierungsveränderung ***
    // Dieses Objekt muss manuell aktualisiert werden!
    const altePlatzierungManuell = {
        'Leo': 2,
        'Mika': 5,
        'Mike': 3,
        'Max': 9,
        'Der Tobi': 4,
        'Reisbällchen': 1,
        'Ruben': 9,
        'Lucas': 8,
        'Jul': 7,
        'Robert S.': 4,
        'Arian': 9,
        'Lennox': 9,
        'Henrik': 9,
        'Robert M.': 9,
        'AN': 6
    };


    // Berechnung der Metriken
    let gesamtpunkteSumme = 0;
    let gesamtdurchschnittSumme = 0;
    const rundenAnzahl = spieler[0].punkte.length; // Geht davon aus, dass alle die gleiche Rundenanzahl haben
    
    spieler.forEach(s => {
        const summe = s.punkte.reduce((sum, p) => sum + p, 0);
        const runden = s.punkte.length;
        s.gesamt = summe;
        s.durchschnitt = runden > 0 ? summe / runden : 0;
        s.letzte_runde = s.punkte[s.punkte.length - 1] || 0;

        gesamtpunkteSumme += summe;
        gesamtdurchschnittSumme += s.durchschnitt;
    });

    const klassenDurchschnitt = gesamtdurchschnittSumme / spieler.length;
    const klassenLetzteRundeDurchschnitt = spieler.reduce((sum, s) => sum + s.letzte_runde, 0) / spieler.length;

    
    // Berechnung der fixen Platzierung (nach Gesamtpunkten)
    function calculatePlatzierung(data) {
        data.sort((a, b) => b.gesamt - a.gesamt);
        let currentRank = 1;
        for (let i = 0; i < data.length; i++) {
            if (i > 0 && data[i].gesamt === data[i - 1].gesamt) {
                data[i].platz = data[i - 1].platz;
            } else {
                data[i].platz = currentRank;
            }
            currentRank++;
        }
    }
    calculatePlatzierung(spieler);

    // ---------------- 3. Haupt-Rendering-Funktion ----------------

    function renderRangliste(sortCriterion = 'gesamt') {
        let sortedSpieler = [...spieler]; 
        
        if (sortCriterion === 'gesamt' || sortCriterion === 'durchschnitt' || sortCriterion === 'letzte_runde') {
             sortedSpieler.sort((a, b) => b[sortCriterion] - a[sortCriterion]);
        } 
        
        let displayRank = 1;
        for (let i = 0; i < sortedSpieler.length; i++) {
            if (i > 0 && sortedSpieler[i][sortCriterion] === sortedSpieler[i - 1][sortCriterion]) {
                sortedSpieler[i].display_platz = sortedSpieler[i - 1].display_platz;
            } else {
                sortedSpieler[i].display_platz = displayRank;
            }
            displayRank++;
        }


        const tbody = document.querySelector('#rangliste tbody');
        if (!tbody) return;
        tbody.innerHTML = ''; 

        sortedSpieler.forEach(s => {
            let symbol = '';
            let diffClass = '';
            
            // --- Logik für die Spalte 'Veränderung' ---
            
            if (sortCriterion === 'gesamt') {
                // HIER: Historischer Platzierungsvergleich (funktioniert immer)
                const altPlatz = altePlatzierungManuell[s.name]; 
                const neuPlatz = s.platz; 

                let diffValue = 0;
                
                if (altPlatz != null) {
                    diffValue = altPlatz - neuPlatz; 
                    
                    if (diffValue > 0) {
                        diffClass = 'up';
                        symbol = `+${diffValue} ▲`;
                    } else if (diffValue < 0) {
                        diffClass = 'down';
                        symbol = `${diffValue} ▼`;
                    } else {
                        diffClass = 'same';
                        symbol = '—';
                    }
                } else {
                    diffClass = 'same';
                    symbol = '—';
                }

            } else if (sortCriterion === 'letzte_runde') {
                // HIER: Vergleich mit dem Durchschnitt der LETZTEN RUNDE der Klasse
                if (s.letzte_runde > klassenLetzteRundeDurchschnitt) {
                    diffClass = 'up';
                    symbol = 'Über Ø ▲';
                } else if (s.letzte_runde < klassenLetzteRundeDurchschnitt) {
                    diffClass = 'down';
                    symbol = 'Unter Ø ▼';
                } else {
                    diffClass = 'same';
                    symbol = '—';
                }

            } else if (sortCriterion === 'durchschnitt') {
                 // HIER: Vergleich mit dem GESAMT-DURCHSCHNITT der Klasse
                if (s.durchschnitt > klassenDurchschnitt) {
                    diffClass = 'up';
                    symbol = 'Über Ø ▲';
                } else if (s.durchschnitt < klassenDurchschnitt) {
                    diffClass = 'down';
                    symbol = 'Unter Ø ▼';
                } else {
                    diffClass = 'same';
                    symbol = '—';
                }
            }


            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.display_platz}</td>
                <td class="player-name" data-points='${JSON.stringify(s.punkte)}' data-name="${s.name}">
                    ${s.name}
                </td>
                <td>${s.gesamt}</td>
                <td class="${diffClass}">${symbol}</td>
            `;
            tbody.appendChild(tr);
        });

        attachPlayerEvents();
    }
    
    // ---------------- 4. Event Listener und Speicherung ----------------
    
    function attachPlayerEvents() {
        const infoBox = document.getElementById('durchschnittsanzeige');
        
        document.querySelectorAll('.player-name').forEach(nameCell => {
            nameCell.removeEventListener('click', showPlayerStats); 
            nameCell.addEventListener('click', showPlayerStats); 
        });
        
        function showPlayerStats() {
            const name = this.getAttribute('data-name');
            const punkte = JSON.parse(this.dataset.points);
            const summe = punkte.reduce((sum, p) => sum + p, 0);
            const runden = punkte.length;
            const durchschnitt = runden > 0 ? (summe / runden).toFixed(2) : 0;
            
            if (infoBox) {
                infoBox.innerHTML = `
                    <strong>${name}</strong>: 
                    Gesamtpunkte: <strong>${summe}</strong> aus ${runden} Runden. 
                    <br>
                    Durchschnitt: <strong>${durchschnitt}</strong> Punkte pro Runde.
                `;
                
                infoBox.classList.add('highlight');
                setTimeout(() => {
                    infoBox.classList.remove('highlight');
                }, 1000);
            }
        }
    }
    
    // Event Listener für Filter-Buttons
    document.querySelectorAll('input[name="sort_by"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            renderRangliste(e.target.value); 
        });
    });

    // 5. Initiales Laden der Rangliste
    renderRangliste('gesamt');
});