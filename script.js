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
        // Beispiel: Punkte R1, R2, R3. Die alte Rangliste wird anhand von R1+R2 berechnet!
        { name: 'Leo', punkte: [3, 3, 0, 0, 0] }, 
        { name: 'Mika', punkte: [3, 0, 2, 0, 2] }, 
        { name: 'Mike', punkte: [3, 2, 3, 0, 4] },
        { name: 'Max', punkte: [0, 0, 1, 2, 2] },
        { name: 'Der Tobi', punkte: [0, 4, 2, 2, 3] },
        { name: 'Reisbällchen', punkte: [5, 0, 3, 0, 2] },
        { name: 'Ruben', punkte: [0, 0, 1, 0, 4] },
        { name: 'Lucas', punkte: [0, 1, 2, 1, 0] },
        { name: 'Jul', punkte: [0, 2, 0, 5, 3] },
        { name: 'Robert S.', punkte: [0, 4, 0, 0, -50] },
        { name: 'Arian', punkte: [0, 0, 1, 0, 5] },
        { name: 'Lennox', punkte: [0, 0, 3, 3, 4] },
        { name: 'Henrik', punkte: [0, 0, 1, 0, 0] },
        { name: 'Robert M.', punkte: [0, 0, 5, 0, 0] }
    ];

    // Berechnung der Metriken
    let gesamtdurchschnittSumme = 0;
    let klassenLetzteRundeSumme = 0;
    
    spieler.forEach(s => {
        const summe = s.punkte.reduce((sum, p) => sum + p, 0);
        const runden = s.punkte.length;
        s.gesamt = summe;
        s.durchschnitt = runden > 0 ? summe / runden : 0;
        s.letzte_runde = s.punkte[s.punkte.length - 1] || 0;
        
        // NEU: Berechne Gesamtpunkte der Vorrunde
        // Summe aller Punkte außer dem letzten (neuesten) Wert.
        const vorrundenPunkte = s.punkte.slice(0, runden - 1);
        s.gesamt_vorrunde = vorrundenPunkte.reduce((sum, p) => sum + p, 0);
        
        gesamtdurchschnittSumme += s.durchschnitt;
        klassenLetzteRundeSumme += s.letzte_runde;
    });

    const klassenDurchschnitt = gesamtdurchschnittSumme / spieler.length;
    const klassenLetzteRundeDurchschnitt = klassenLetzteRundeSumme / spieler.length;

    
    // Funktion zur Berechnung der Platzierung basierend auf einem Kriterium
    function calculatePlatzierung(data, criterion) {
        // Sortiere eine Kopie der Daten, um die Originalreihenfolge nicht zu zerstören
        let tempSortedData = [...data].sort((a, b) => b[criterion] - a[criterion]);
        let currentRank = 1;
        
        let platzierungen = {};

        for (let i = 0; i < tempSortedData.length; i++) {
            let rank;
            if (i > 0 && tempSortedData[i][criterion] === tempSortedData[i - 1][criterion]) {
                rank = tempSortedData[i - 1].temp_rank;
            } else {
                rank = currentRank;
            }
            tempSortedData[i].temp_rank = rank;
            platzierungen[tempSortedData[i].name] = rank;
            currentRank++;
        }
        return platzierungen;
    }
    
    // Platzierungen berechnen
    const aktuellePlatzierung = calculatePlatzierung(spieler, 'gesamt');
    const altePlatzierung = calculatePlatzierung(spieler, 'gesamt_vorrunde');


    // ---------------- 3. Haupt-Rendering-Funktion ----------------

    function renderRangliste(sortCriterion = 'gesamt') {
        let sortedSpieler = [...spieler]; 
        
        if (sortCriterion === 'gesamt' || sortCriterion === 'durchschnitt' || sortCriterion === 'letzte_runde') {
             sortedSpieler.sort((a, b) => b[sortCriterion] - a[sortCriterion]);
        } 
        
        // Platzierung für die Anzeige festlegen (1., 2., 3., etc.)
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
                // NEU: Dynamischer historischer Platzierungsvergleich
                const altPlatz = altePlatzierung[s.name] || s.punkte.length; // Wenn neu, setze auf maximale Ränge
                const neuPlatz = aktuellePlatzierung[s.name]; 

                let diffValue = 0;
                
                if (s.punkte.length > 1) { // Nur vergleichen, wenn mehr als 1 Runde gespielt wurde
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
                    symbol = '—'; // Erste Runde, kein Vergleich möglich
                }

            } else if (sortCriterion === 'letzte_runde') {
                // Vergleich mit dem Durchschnitt der LETZTEN RUNDE der Klasse
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
                 // Vergleich mit dem GESAMT-DURCHSCHNITT der Klasse
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
    
    // ---------------- 4. Event Listener (Mobile Fix) ----------------
    
    function attachPlayerEvents() {
        const infoBox = document.getElementById('durchschnittsanzeige');
        
        document.querySelectorAll('.player-name').forEach(nameCell => {
            nameCell.removeEventListener('click', showPlayerStats); 
            nameCell.removeEventListener('touchend', showPlayerStats);
            
            // 'touchend' für sofortige Reaktion auf Touch-Geräten
            nameCell.addEventListener('touchend', showPlayerStats); 
            // Fallback für Desktop:
            nameCell.addEventListener('click', showPlayerStats); 
        });
        
        function showPlayerStats(event) {
            // Verhindere Klick-Verzögerung auf Touch-Geräten
            if (event.type === 'touchend') {
                event.preventDefault(); 
            }
            
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