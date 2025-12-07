/* JavaScript für 404-Seite und automatische Weiterleitung */

document.addEventListener('DOMContentLoaded', function() {
    // Prüfe, ob es die 404-Seite ist (Bearblog fügt oft die Klasse .not-found hinzu)
    if (document.body.classList.contains('not-found')) {
        
        // 1. Definiere Umleitungsziel und Zeit
        const countdownSeconds = 5; // Countdown-Zeit in Sekunden
        const redirectDelay = countdownSeconds * 1000;
        
        // Zufälliges Weiterleitungsziel (ersetze dies mit deiner Logik)
        // Im Beispiel leite ich zur Homepage weiter, da Bearblog keine "zufälligen" Artikel nativ unterstützt.
        const redirectUrl = "/"; 
        
        // 2. Erzeuge den Text-Inhalt
        const titleElement = document.querySelector('.not-found h1');
        const paragraphElement = document.createElement('p');
        
        // Wenn kein H1 gefunden wird, brechen wir ab, um Fehler zu vermeiden
        if (!titleElement) return;

        // Setze den gewünschten Titel
        titleElement.innerHTML = 'Very oooopsi! Diese Seite gibt es leider nicht.';
        
        // 3. Füge den Countdown-Absatz hinzu
        titleElement.after(paragraphElement);

        let countdown = countdownSeconds;

        function updateCountdown() {
            paragraphElement.innerHTML = `Du wirst in **${countdown} Sekunden** zu einem zufälligen Qualitätsartikel weitergeleitet.`;
            countdown--;

            if (countdown < 0) {
                // Countdown beendet, jetzt umleiten
                paragraphElement.innerHTML = `Du wirst **jetzt** weitergeleitet...`;
                
                // Wir simulieren die "zufällige" Weiterleitung zur Startseite
                setTimeout(function() {
                    window.location.href = redirectUrl;
                }, 500); // Eine kleine Verzögerung, damit der Text kurz sichtbar ist.
                
                clearInterval(intervalId); // Stoppe das Intervall
            }
        }

        // Starte den Countdown und aktualisiere alle 1 Sekunde
        const intervalId = setInterval(updateCountdown, 1000);
        
        // Starte sofort, um den Text gleich anzuzeigen
        updateCountdown(); 
    }
});