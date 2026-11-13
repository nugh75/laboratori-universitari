const storagePrefix = "laboratori-universitari";

function leggiPercorso(laboratorio) {
  try {
    const saved = JSON.parse(localStorage.getItem(`${storagePrefix}/guida/${laboratorio}`));
    return typeof saved?.groupName === "string" && saved.groupName.trim() ? saved : null;
  } catch {
    return null;
  }
}

window.addEventListener("pageshow", () => {
  for (const link of document.querySelectorAll(".guide-link")) {
    const hasProgress = Boolean(leggiPercorso(link.dataset.laboratory));
    const resume = link.querySelector("[data-resume]");
    if (resume) resume.hidden = !hasProgress;
    else link.textContent = hasProgress ? "Riprendi il laboratorio" : "Avvia il laboratorio";
  }
});

const guide = document.querySelector("[data-guide]");
const selectedLab = new URLSearchParams(location.search).get("laboratorio");

if (guide && Object.hasOwn(laboratori, selectedLab)) avviaGuida(selectedLab);

function avviaGuida(laboratorio) {
  const info = laboratori[laboratorio];
  const find = (id) => document.getElementById(id);
  const form = find("group-form");
  const groupName = find("group-name");
  const workspace = find("guide-workspace");
  const storageStatus = find("guide-storage");
  const heading = find("step-title");
  const panel = find("step-content");
  const stepList = find("step-list");
  const back = find("step-back");
  const next = find("step-next");
  const checkPrefix = `${storagePrefix}/checklist-${laboratorio}`;
  const state = leggiPercorso(laboratorio) ?? { groupName: "", stepId: "organizzazione" };
  const promptEdits = new Map();
  let steps = creaPassaggi(laboratorio, state.groupName);
  let stepIndex = Math.max(0, steps.findIndex((step) => step.id === state.stepId));
  const checks = steps.flatMap((step) => step.checks ?? []);
  const checked = new Set();

  find("guide-title").textContent = info.title;
  find("guide-choice").hidden = true;
  find("guide-nav").open = !matchMedia("(max-width: 760px)").matches;
  document.title = `${info.title} · Guida al laboratorio`;

  function showStorageMessage() {
    storageStatus.textContent = "Il browser non ha potuto salvare i progressi. Tieni aperta questa pagina per continuare.";
    storageStatus.hidden = false;
  }

  try {
    for (const [key] of checks) {
      const saved = localStorage.getItem(`${checkPrefix}/${key}`);
      const wasConfigured = (key === "mistral" || key === "notion") &&
        localStorage.getItem(`${checkPrefix}/configurazione`) === "1";
      if (saved === "1" || (saved === null && wasConfigured)) checked.add(key);
    }
  } catch {
    showStorageMessage();
  }

  function savePath() {
    try {
      localStorage.setItem(`${storagePrefix}/guida/${laboratorio}`, JSON.stringify({
        groupName: state.groupName,
        stepId: steps[stepIndex].id
      }));
    } catch {
      showStorageMessage();
    }
  }

  function openForm() {
    form.hidden = false;
    groupName.value = state.groupName;
    find("save-group").textContent = state.groupName ? "Salva il nome" : "Inizia il percorso";
  }

  groupName.addEventListener("input", () => groupName.setCustomValidity(""));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = groupName.value.trim();
    if (!name) {
      groupName.setCustomValidity("Scrivi il nome del gruppo.");
      groupName.reportValidity();
      return;
    }
    state.groupName = name;
    steps = creaPassaggi(laboratorio, name);
    savePath();
    form.hidden = true;
    workspace.hidden = false;
    render();
    heading.focus();
  });

  find("edit-group").addEventListener("click", () => {
    workspace.hidden = true;
    openForm();
    groupName.focus();
  });

  function goTo(index) {
    stepIndex = index;
    savePath();
    render();
    heading.focus();
  }

  back.addEventListener("click", () => goTo(stepIndex - 1));
  next.addEventListener("click", () => goTo(stepIndex + 1));

  function updateProgress() {
    find("check-progress").textContent = `${checked.size} di ${checks.length} voci spuntate`;
    for (const [index, step] of steps.entries()) {
      const control = stepList.children[index].firstElementChild;
      const complete = step.checks?.every(([key]) => checked.has(key));
      const suffix = complete ? " · Fatto" : "";
      control.textContent = `${index + 1}. ${step.title}${suffix}`;
    }
  }

  function render() {
    const step = steps[stepIndex];
    const isSummary = step.id === "riepilogo";
    find("active-group").textContent = state.groupName;
    find("step-meta").textContent = `Passaggio ${stepIndex + 1} di ${steps.length} · ${step.time}`;
    heading.textContent = step.title;
    back.disabled = stepIndex === 0;
    next.hidden = isSummary;
    next.textContent = stepIndex === steps.length - 2 ? "Vai al riepilogo" : "Avanti";

    stepList.replaceChildren(...steps.map((item, index) => {
      const listItem = document.createElement("li");
      const control = document.createElement("button");
      control.type = "button";
      if (index === stepIndex) control.setAttribute("aria-current", "step");
      control.addEventListener("click", () => goTo(index));
      listItem.append(control);
      return listItem;
    }));
    updateProgress();
    panel.replaceChildren();

    if (isSummary) {
      renderSummary();
      return;
    }

    const actions = document.createElement("ol");
    actions.className = "guide-actions";
    for (const action of step.actions) addText(actions, "li", action);
    panel.append(actions);

    if (step.suggestion) {
      const [label, value] = step.suggestion;
      const suggestion = addText(panel, "p", "");
      suggestion.className = "guide-suggestion";
      addText(suggestion, "strong", label);
      addText(suggestion, "span", value);
    }
    if (step.links) {
      const links = document.createElement("div");
      links.className = "guide-links";
      for (const [label, url] of step.links) {
        const link = addText(links, "a", label);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
        link.className = label.startsWith("Apri") ? "button" : "guide-secondary";
        link.setAttribute("aria-label", `${label} (nuova scheda)`);
      }
      panel.append(links);
    }
    if (step.note) addText(panel, "p", step.note).className = "guide-note";

    const fieldset = document.createElement("fieldset");
    fieldset.className = "checklist";
    addText(fieldset, "legend", "Checklist del passaggio");
    for (const [key, description] of step.checks) {
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = checked.has(key);
      box.addEventListener("change", () => {
        if (box.checked) checked.add(key);
        else checked.delete(key);
        try {
          localStorage.setItem(`${checkPrefix}/${key}`, box.checked ? "1" : "0");
        } catch {
          showStorageMessage();
        }
        updateProgress();
      });
      label.append(box);
      addText(label, "span", description);
      fieldset.append(label);
    }
    panel.append(fieldset);

    if (step.instructions) renderCopyBlock(...step.instructions, "Copia istruzioni");
    if (step.template) renderCopyBlock(...step.template, "Copia modello");
    if (step.prompt) renderCopyBlock(...step.prompt, "Copia prompt", step.id);
  }

  function renderCopyBlock(label, original, buttonLabel, promptId) {
    const section = document.createElement("div");
    section.className = "guide-prompt";
    const title = addText(section, "h3", label);
    const toolbar = document.createElement("div");
    toolbar.className = "guide-copy-actions";
    section.append(toolbar);
    const disclosure = document.createElement("details");
    disclosure.className = "guide-copy-details";
    const toggle = addText(disclosure, "summary", promptId ? "Mostra e modifica il testo" : "Mostra il testo");
    disclosure.addEventListener("toggle", () => {
      toggle.textContent = disclosure.open ? "Nascondi il testo"
        : promptId ? "Mostra e modifica il testo" : "Mostra il testo";
    });
    section.append(disclosure);
    let content;

    if (promptId) {
      title.id = "prompt-label";
      const note = addText(disclosure, "p", "Questa è una traccia. Potete modificarla o sostituirla prima di copiarla in Mistral.");
      note.className = "guide-note prompt-hint";
      note.id = "prompt-hint";
      content = document.createElement("textarea");
      content.setAttribute("aria-labelledby", title.id);
      content.setAttribute("aria-describedby", note.id);
      content.rows = original.length > 420 ? 10 : 4;
      const key = `${storagePrefix}/prompt/${laboratorio}/${promptId}`;
      try {
        if (!promptEdits.has(promptId)) promptEdits.set(promptId, localStorage.getItem(key));
      } catch {
        showStorageMessage();
      }
      content.value = promptEdits.get(promptId) ?? original;
      content.addEventListener("input", () => {
        promptEdits.set(promptId, content.value);
        try {
          localStorage.setItem(key, content.value);
        } catch {
          showStorageMessage();
        }
      });
      disclosure.append(content);
    } else {
      content = addText(disclosure, "blockquote", original);
    }

    const copy = addText(toolbar, "button", buttonLabel);
    copy.type = "button";
    copy.className = "guide-secondary";
    const status = addText(toolbar, "span", "");
    status.className = "guide-note";
    status.setAttribute("role", "status");
    copy.addEventListener("click", async () => {
      const value = promptId ? content.value : original;
      try {
        await navigator.clipboard.writeText(value);
        status.textContent = "Testo copiato.";
      } catch {
        disclosure.open = true;
        if (promptId) {
          content.focus();
          content.select();
        } else {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(content);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        status.textContent = "Testo selezionato. Usa il comando Copia del dispositivo.";
      }
    });
    panel.append(section);
  }

  function renderSummary() {
    addText(panel, "p", "Anche un prototipo incompleto è un risultato valido. Rivedete le spunte. Il segretario aggiorna il diario in Notion con l’uso dell’IA, le decisioni del gruppo e il prossimo passo.");
    const list = document.createElement("ul");
    list.className = "guide-summary";
    for (const [index, step] of steps.entries()) {
      for (const [key, label] of step.checks ?? []) {
        const item = document.createElement("li");
        const control = addText(item, "button", checked.has(key) ? "Fatto" : "Da spuntare");
        control.type = "button";
        control.className = "guide-secondary";
        control.setAttribute("aria-label", `${control.textContent}. Vai al passaggio «${step.title}» per ${label}`);
        control.addEventListener("click", () => goTo(index));
        addText(item, "span", label);
        list.append(item);
      }
    }
    panel.append(list);

    addText(panel, "p", "Per ricevere un feedback potete inviare una sola email per gruppo con i nomi dei componenti, una breve presentazione, il progetto in Word o PDF e il link alla wiki accessibile al docente oppure un’esportazione.");
    addText(panel, "p", "Il feedback è esclusivamente formativo e non incide sul voto finale universitario.");
    const email = addText(panel, "a", "Apri una bozza email");
    email.href = `mailto:daniele.dragoni@uniroma3.it?subject=${encodeURIComponent(`Laboratorio ${info.shortTitle} - ${state.groupName}`)}`;
    email.className = "button guide-email";
    addText(panel, "p", "daniele.dragoni@uniroma3.it").className = "guide-note";
  }

  if (state.groupName) {
    workspace.hidden = false;
    render();
  } else {
    openForm();
  }
}

function addText(container, tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  container.append(element);
  return element;
}
