const laboratori = {
  conflitti: {
    title: "Gestione dei gruppi e dei conflitti",
    shortTitle: "Conflitti",
    prototype: {
      actions: [
        "Scegliete un caso documentato o dichiaratamente simulato.",
        "Analizzate gli attori, le loro posizioni e le relazioni di potere.",
        "Abbozzate una procedura con alternative, tutele e criteri di verifica."
      ],
      checks: [
        ["caso", "Abbiamo scelto e analizzato il caso."],
        ["procedura", "Abbiamo abbozzato una procedura di intervento."]
      ]
    },
    simulation: {
      actions: [
        "Mettete in scena un episodio con due decisioni alternative.",
        "Discutete le conseguenze plausibili di ciascuna scelta e confrontatele con le fonti.",
        "Annotate nel diario un limite e la prossima modifica concordata."
      ],
      check: "Abbiamo simulato due alternative e discusso le conseguenze."
    }
  },
  competenze: {
    title: "Competenze in azione",
    shortTitle: "Competenze",
    prototype: {
      actions: [
        "Scegliete una competenza e definite la situazione e il compito.",
        "Individuate i comportamenti che permettono di osservarla.",
        "Abbozzate una rubrica con 3–4 livelli descritti tramite evidenze osservabili."
      ],
      checks: [
        ["indicatori", "Abbiamo definito la competenza, il compito e gli indicatori."],
        ["rubrica", "Abbiamo abbozzato una rubrica."]
      ]
    },
    simulation: {
      actions: [
        "Proponete una situazione nuova in cui usare la stessa competenza.",
        "Provate la rubrica su una risposta simulata e formulate il feedback.",
        "Annotate nel diario che cosa avete deciso di rivedere nel compito, negli indicatori o nella rubrica."
      ],
      check: "Abbiamo provato la rubrica in una nuova situazione."
    }
  }
};

function creaPassaggi(laboratorio, groupName) {
  const info = laboratori[laboratorio];
  const projectName = `${groupName} – ${info.shortTitle}`;
  return [
    {
      id: "organizzazione",
      title: "Organizzare il gruppo e assegnare i ruoli",
      time: "0–25 min",
      actions: [
        "Formate un gruppo di massimo quattro persone. I gruppi già costituiti possono restare come sono.",
        "Scegliete un segretario. Tiene traccia delle decisioni del gruppo e cura il diario delle attività con l’IA in Notion.",
        "Scegliete un altro componente che interagisca con Mistral. Inserisce i prompt concordati, condivide le risposte e raccoglie le richieste del gruppo."
      ],
      checks: [["ruoli", "Abbiamo assegnato il ruolo di segretario e quello di chi interagisce con Mistral."]]
    },
    {
      id: "mistral",
      title: "Configurare il progetto in Mistral Work",
      time: "0–25 min",
      actions: [
        "Aprite Mistral. Accedete con il vostro account oppure registratevi e completate la verifica richiesta.",
        "Aprite Vibe Work. Se compare il selettore Work / Code, scegliete Work.",
        "Chi interagisce con Mistral seleziona New Project e usa il nome suggerito qui sotto.",
        "Aprite il progetto e scegliete Customize (Personalizza). Nel campo Instructions (Istruzioni), incollate e salvate le istruzioni di progetto qui sotto. Aprite quindi una chat dentro il progetto."
      ],
      suggestion: ["Nome del progetto", projectName],
      links: [["Apri Mistral", "https://chat.mistral.ai/"], ["Guida ai progetti", "https://docs.mistral.ai/vibe/work/projects"]],
      instructions: ["Istruzioni di progetto", istruzioniProgetto(laboratorio)],
      checks: [
        ["mistral", "Abbiamo aperto una chat nel progetto Mistral."],
        ["istruzioni", "Abbiamo salvato le istruzioni nelle impostazioni del progetto."]
      ]
    },
    {
      id: "skill",
      title: "Aggiungere le skill del laboratorio",
      time: "0–25 min",
      actions: [
        "Aprite le fonti qui sotto. Su Mistral, da Context → Skills, attivate le skill del laboratorio già disponibili. Usate il Gist di LLM Wiki come modello per la wiki in Notion.",
        "Adattate la traccia e incollatela nella chat del progetto. Rivedete le bozze prima di salvare eventuali nuove skill.",
        "Se l’account non consente di creare skill, usate la traccia nella chat per applicare i quattro metodi e annotate la scelta nel diario."
      ],
      prompt: ["Prompt per aggiungere le skill", tracciaSkill],
      links: [
        ...risorseSkill.map(({ name, url }) => [name, url]),
        ["Guida alle skill di Mistral", "https://docs.mistral.ai/vibe/work/skills"]
      ],
      checks: [["skill", "Abbiamo attivato o aggiunto le skill, oppure concordato come usare i metodi in chat."]]
    },
    {
      id: "notion",
      title: "Creare la wiki in Notion",
      time: "0–25 min",
      actions: [
        "Aprite Notion. Accedete o registratevi. Se usate un account Google, scegliete Continua con Google.",
        "Un componente crea la pagina principale con il nome suggerito qui sotto.",
        "Dal menu Condividi, invitate i compagni con il permesso Può modificare. Chiedete a un altro componente di aprire l’invito e scrivere una riga di prova."
      ],
      suggestion: ["Nome della wiki", projectName],
      links: [["Apri Notion", "https://www.notion.com/"], ["Guida alla condivisione", "https://www.notion.com/help/sharing-and-permissions"]],
      checks: [["notion", "La wiki è condivisa e un compagno ha verificato di poter scrivere."]]
    },
    {
      id: "diario",
      title: "Aprire il diario delle attività con l’IA",
      time: "0–25 min",
      actions: [
        "Il segretario crea nella wiki Notion una pagina intitolata Diario delle attività con l’IA e registra chi ricopre i due ruoli.",
        "A ogni fase, il segretario annota le attività svolte con l’IA, i prompt effettivamente usati o modificati e le verifiche sulle risposte.",
        "Dopo il confronto, registra le decisioni del gruppo e la loro motivazione. Usate il modello per la prima voce e aggiornatelo durante le due ore."
      ],
      template: ["Modello di voce del diario", modelloDiario],
      checks: [["diario", "Abbiamo creato il diario in Notion e scritto la prima voce."]]
    },
    {
      id: "collegamento",
      title: "Provare il collegamento con Notion",
      time: "0–25 min",
      actions: [
        "In Mistral aprite Connectors, scegliete Notion e completate l’autorizzazione. Se richiesto, selezionate la pagina del gruppo.",
        "Incollate il prompt di prova nella chat del progetto e controllate che Mistral riporti il titolo e il link della wiki."
      ],
      note: "Se il connettore è indisponibile, lavorate direttamente nella wiki e copiate in chat i passaggi necessari. Annotate nella wiki la modalità usata e proseguite.",
      prompt: ["Prompt di prova", `Usa Notion per aprire la pagina «${projectName}». Riporta il titolo e il link. Limitati alla lettura.`],
      links: [["Guida ai connettori", "https://docs.mistral.ai/vibe/work/connectors"]],
      checks: [["collegamento", "Abbiamo provato il connettore o scelto di copiare i passaggi dalla wiki."]]
    },
    {
      id: "avvio",
      title: "Incollare il prompt di avvio",
      time: "0–25 min",
      actions: [
        "Adattate il prompt di avvio al vostro obiettivo e incollatelo nella chat del progetto Mistral. Il segretario annota nel diario la versione usata.",
        "Leggete insieme la risposta e concordate la prima domanda su cui lavorare."
      ],
      prompt: ["Prompt di avvio", promptAvvio[laboratorio]],
      checks: [["avvio", "Abbiamo avviato la chat di lavoro con il prompt del laboratorio."]]
    },
    {
      id: "ricerca",
      title: "Formulare la domanda e verificare le fonti",
      time: "25–50 min",
      actions: [
        "Definite che cosa volete capire e confrontate le ipotesi del gruppo.",
        "Aprite le fonti suggerite e verificate autore, titolo, anno e pertinenza.",
        "Registrate nella wiki definizioni, fonti e decisioni. Collegate le pagine del caso o della competenza, del prototipo e della simulazione. Il segretario riporta nel diario le verifiche e le decisioni del gruppo."
      ],
      prompt: ["Prompt di ricerca", "Facci due domande per delimitare il problema. Proponi parole chiave di ricerca e segnala i riferimenti da verificare."],
      checks: [["ricerca", "Abbiamo formulato una domanda, verificato le prime fonti e aggiornato la wiki."]]
    },
    {
      id: "prototipo",
      title: "Progettare il prototipo",
      time: "50–90 min",
      actions: info.prototype.actions,
      prompt: ["Prompt per il prototipo", "Fai emergere due decisioni ancora aperte e chiedici di motivarle."],
      checks: info.prototype.checks
    },
    {
      id: "simulazione",
      title: "Simulare e rivedere",
      time: "90–120 min",
      actions: info.simulation.actions,
      prompt: ["Prompt per la simulazione", "Simula la situazione, fermati al momento della scelta e chiedici come procedere."],
      checks: [
        ["simulazione", info.simulation.check],
        ["revisione", "Abbiamo annotato un limite e il prossimo passo."]
      ]
    },
    {
      id: "riepilogo",
      title: "Riepilogo e consegna facoltativa",
      time: "Al termine delle due ore"
    }
  ];
}
