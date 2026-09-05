import { cleanSessionCode, getParticipants, getTeams, saveDesafio2Grade } from "./desafio2-storage.js";

const ACCESS_CODE = "RIESGOS26";

const riskLabels = {
  hallucination: "Alucinación",
  bias: "Sesgo",
  generalization: "Generalización",
  "false-citation": "Cita falsa"
};

const cases = [
  {
    shortTitle: "Servicios públicos digitales",
    title: "¿La población está preparada para trámites exclusivamente digitales?",
    request: "La dirección considera migrar todos los trámites públicos a una modalidad exclusivamente digital y solicita una conclusión ejecutiva.",
    segments: [
      { text: "De acuerdo con la Encuesta Nacional sobre Disponibilidad y Uso de Tecnologías de la Información en los Hogares 2024, el 83.1 % de la población mexicana cuenta con internet. " },
      { id: "digital-capacity", text: "Esto demuestra que al menos ocho de cada diez ciudadanos pueden realizar cualquier trámite público digital sin asistencia. ", risk: "generalization", explanation: "La encuesta mide uso de internet entre personas de seis años o más. No midió dominio de trámites, autonomía digital ni necesidad de asistencia." },
      { id: "rural-resistance", text: "En las comunidades rurales, quienes no utilizan servicios digitales generalmente lo hacen por falta de interés o resistencia al cambio.", risk: "bias", explanation: "La respuesta convierte una desigualdad de acceso y habilidades en una atribución negativa sobre las personas rurales. La fuente también registra falta de conocimientos y recursos." }
    ],
    evidence: [
      "El 83.1 % corresponde a personas de seis años o más que utilizaron internet.",
      "El uso fue de 86.9 % en zonas urbanas y 68.5 % en zonas rurales.",
      "La encuesta registra falta de conocimientos, falta de recursos y falta de interés entre las razones para no usar internet.",
      "La encuesta no midió la capacidad para completar trámites gubernamentales."
    ],
    sourceName: "Instituto Nacional de Estadística y Geografía",
    sourceUrl: "https://www.inegi.org.mx/programas/endutih/2024/"
  },
  {
    shortTitle: "Inteligencia artificial y menores",
    title: "¿La guía internacional obliga a prohibir su uso?",
    request: "Una escuela analiza si debe prohibir el uso de inteligencia artificial generativa a estudiantes menores de 13 años.",
    segments: [
      { text: "Sí. En 2023, la Organización de las Naciones Unidas para la Educación, la Ciencia y la Cultura " },
      { id: "binding-rule", text: "aprobó una norma internacional obligatoria que prohíbe utilizar inteligencia artificial generativa a cualquier menor de 13 años. ", risk: "hallucination", explanation: "La guía propone un umbral mínimo de edad y medidas regulatorias, pero no creó una norma internacional jurídicamente obligatoria." },
      { id: "schools-breach", text: "Su guía establece que las escuelas que permitan este uso incumplen los estándares internacionales de protección infantil.", risk: "false-citation", explanation: "La publicación no contiene esa consecuencia jurídica. La respuesta atribuye a una fuente real una afirmación que la fuente no hace." }
    ],
    evidence: [
      "La guía propone establecer un límite mínimo de 13 años.",
      "Recomienda regulación, protección de datos, formación docente y supervisión adecuada para la edad.",
      "Está dirigida a gobiernos, instituciones educativas y responsables de políticas.",
      "No establece que una escuela que permita su uso incumpla automáticamente una norma jurídica internacional."
    ],
    sourceName: "Guía para el uso de inteligencia artificial generativa en educación e investigación",
    sourceUrl: "https://unesdoc.unesco.org/ark:/48223/pf0000386693"
  },
  {
    shortTitle: "Incidentes de inteligencia artificial",
    title: "¿Aumentaron los reportes o disminuyó la seguridad?",
    request: "El comité de riesgos pregunta si el aumento de incidentes demuestra que los sistemas de inteligencia artificial se volvieron menos seguros.",
    segments: [
      { text: "El Índice de Inteligencia Artificial 2025 de Stanford " },
      { id: "safety-drop", text: "confirma que la seguridad de estos sistemas disminuyó 56.4 % en un año. ", risk: "false-citation", explanation: "Stanford reporta un aumento de 56.4 % en la cantidad de incidentes registrados, no una reducción equivalente de la seguridad." },
      { text: "En 2024 se registraron 233 incidentes. " },
      { id: "incident-probability", text: "Esto significa que cualquier organización que utilice inteligencia artificial enfrenta una probabilidad de 56.4 % de sufrir un incidente. ", risk: "hallucination", explanation: "La respuesta inventa una probabilidad. El informe no proporciona un denominador de organizaciones o sistemas que permita calcularla." },
      { id: "same-risk", text: "El riesgo es el mismo para todos los sectores, tamaños de organización y tipos de sistema.", risk: "generalization", explanation: "Los reportes agregados no permiten afirmar que el riesgo sea idéntico en cualquier sector, organización o implementación." }
    ],
    evidence: [
      "En 2024 se registraron 233 reportes de incidentes relacionados con inteligencia artificial.",
      "La cantidad reportada aumentó 56.4 % respecto de 2023.",
      "El informe no afirma que la seguridad haya disminuido en ese porcentaje.",
      "La base no permite calcular la probabilidad individual de que una organización sufra un incidente."
    ],
    sourceName: "Índice de Inteligencia Artificial 2025 de Stanford",
    sourceUrl: "https://hai.stanford.edu/ai-index/2025-ai-index-report/responsible-ai"
  },
  {
    shortTitle: "Presupuesto de ciberseguridad",
    title: "Reto final: una recomendación ejecutiva convincente",
    request: "La gerencia solicita definir en qué debe concentrarse el presupuesto de ciberseguridad del próximo año.",
    segments: [
      { text: "El Informe de Investigaciones sobre Filtraciones de Datos 2024 de Verizon " },
      { id: "careless-68", text: "demuestra que el 68 % de las filtraciones es causado por empleados descuidados. ", risk: "false-citation", explanation: "El informe señala que 68 % de las filtraciones involucró un elemento humano no malicioso. Involucrar no significa ser la causa única ni equivale a descuido." },
      { id: "weakest-point", text: "Esto confirma que el personal es el punto más débil de cualquier organización. ", risk: "bias", explanation: "La frase convierte un fenómeno de seguridad complejo en una valoración que culpabiliza al personal e ignora diseño, controles, vulnerabilidades y acciones de atacantes." },
      { id: "older-workers", text: "Las personas de mayor edad tienen más probabilidades de caer en engaños digitales. ", risk: "hallucination", explanation: "El informe citado no presenta ese hallazgo por edad. La respuesta incorpora una afirmación no respaldada y la presenta como un hecho." },
      { id: "budget-68", text: "Por lo tanto, toda organización debe destinar exactamente el 68 % de su presupuesto de ciberseguridad a cursos obligatorios para empleados.", risk: "generalization", explanation: "Un porcentaje de incidentes no se convierte directamente en un porcentaje presupuestal, ni justifica la misma distribución para todas las organizaciones." }
    ],
    evidence: [
      "El 68 % de las filtraciones analizadas involucró un elemento humano no malicioso.",
      "El elemento humano incluye errores y personas que fueron víctimas de ingeniería social.",
      "El informe no presenta una comparación por edad ni recomienda asignar 68 % del presupuesto a capacitación.",
      "Los riesgos varían según sector, tamaño, infraestructura, información tratada y forma de acceso."
    ],
    sourceName: "Informe de Investigaciones sobre Filtraciones de Datos 2024 de Verizon",
    sourceUrl: "https://www.verizon.com/business/resources/reports/2024-dbir-executive-summary.pdf"
  }
];

const app = document.querySelector("#riskApp");
const accessTemplate = document.querySelector("#accessTemplate");
const sessionStatus = document.querySelector("#riskSessionStatus");
const LEADERBOARD_KEY = "detectorRiesgosLeaderboard";
let state = { session: "", team: null, caseIndex: 0, found: {}, order: {}, score: 0, attempts: 0 };

function loadLeaderboard() {
  try {
    const raw = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    return [];
  }
}

function saveResult(teamName, score) {
  const list = loadLeaderboard();
  const existing = list.find((entry) => entry.team.toLowerCase() === teamName.toLowerCase());
  const record = { team: teamName, score, total: totalTargets(), date: new Date().toISOString() };
  if (!existing) {
    list.push(record);
  } else if (score > existing.score) {
    Object.assign(existing, record);
  }
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
  } catch (error) {
    /* localStorage no disponible: la puntuación no se guarda en la tabla */
  }
  return list;
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentFindings() {
  return state.found[state.caseIndex] || {};
}

function caseTargets(item) {
  return item.segments.filter((segment) => segment.risk);
}

function totalTargets() {
  return cases.reduce((sum, item) => sum + caseTargets(item).length, 0);
}

function totalFound() {
  return Object.values(state.found).reduce((sum, found) => sum + Object.keys(found).length, 0);
}

function caseOrder(item) {
  if (!state.order[state.caseIndex]) {
    state.order[state.caseIndex] = shuffle(caseTargets(item).map((segment) => segment.id));
  }
  return state.order[state.caseIndex];
}

function assignedTarget(item) {
  const found = currentFindings();
  const nextId = caseOrder(item).find((id) => !found[id]);
  return nextId ? item.segments.find((segment) => segment.id === nextId) : null;
}

function renderAccess() {
  app.innerHTML = "";
  app.appendChild(accessTemplate.content.cloneNode(true));
  sessionStatus.textContent = "Actividad protegida";
  const requestedSession = new URLSearchParams(location.search).get("sesion");
  if (requestedSession) document.querySelector("#sessionCode").value = cleanSessionCode(requestedSession);
  document.querySelector("#accessForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const session = document.querySelector("#sessionCode").value.trim();
    const code = document.querySelector("#accessCode").value.trim().toUpperCase();
    const error = document.querySelector("#accessError");
    const button = event.currentTarget.querySelector('button[type="submit"]');
    if (!session) {
      error.textContent = "Escribe el código de sesión de tu taller.";
      return;
    }
    if (code !== ACCESS_CODE) {
      error.textContent = "El código no corresponde a esta actividad.";
      return;
    }
    error.textContent = "";
    button.disabled = true;
    button.textContent = "Buscando equipos…";
    state.session = cleanSessionCode(session);
    await renderTeamPicker();
  });
  document.querySelector("#leaderboardLink").addEventListener("click", () => {
    const session = document.querySelector("#sessionCode").value.trim() || state.session;
    renderLeaderboard(cleanSessionCode(session));
  });
}

async function renderTeamPicker() {
  sessionStatus.textContent = "Buscando equipos…";
  let teams = {};
  try {
    teams = await getTeams(state.session);
  } catch (error) {
    teams = {};
  }
  const teamList = Object.entries(teams).map(([id, team]) => ({ id, ...team }));

  if (!teamList.length) {
    app.innerHTML = `
      <section class="access-layout">
        <div class="access-intro">
          <p class="risk-eyebrow">Sin equipos encontrados</p>
          <h1>Todavía no hay equipos en esta sesión.</h1>
          <p>Verifica el código de sesión con quien registró a los equipos en el primer desafío, o pide que se registren antes de continuar.</p>
        </div>
        <div class="access-card">
          <button type="button" class="risk-primary-button" id="backToAccess">Volver a intentarlo</button>
        </div>
      </section>`;
    document.querySelector("#backToAccess").addEventListener("click", renderAccess);
    return;
  }

  sessionStatus.textContent = "Selecciona tu equipo";
  app.innerHTML = `
    <section class="access-layout">
      <div class="access-intro">
        <p class="risk-eyebrow">Sesión ${escapeHtml(state.session)}</p>
        <h1>¿Cuál es tu equipo?</h1>
        <p>Selecciona el equipo con el que ya se registraron en el primer desafío. Tu calificación de esta actividad se guardará para todos sus integrantes.</p>
      </div>
      <div class="access-card team-picker-card">
        <p class="risk-eyebrow">Equipos registrados</p>
        <ul class="team-picker-list">
          ${teamList.map((team) => `
            <li>
              <button type="button" class="team-picker-option" data-team="${team.id}">
                <strong>${escapeHtml(team.name)}</strong>
                <span>${(team.members || []).map(escapeHtml).join(" · ") || "Integrantes sin registrar"}</span>
              </button>
            </li>`).join("")}
        </ul>
        <button type="button" class="risk-ghost-button" id="backToAccess">Volver</button>
      </div>
    </section>`;

  document.querySelectorAll(".team-picker-option").forEach((button) => {
    button.addEventListener("click", () => {
      const team = teamList.find((candidate) => candidate.id === button.dataset.team);
      state.team = team;
      sessionStatus.textContent = "Auditoría en curso";
      renderCase();
    });
  });
  document.querySelector("#backToAccess").addEventListener("click", renderAccess);
}

async function firebaseDesafio2Leaderboard(session) {
  if (!session) return null;
  let participants = {};
  try {
    participants = await getParticipants(session);
  } catch (error) {
    return null;
  }
  const byTeam = new Map();
  Object.values(participants).forEach((participant) => {
    const grade = participant.grades?.desafio2;
    if (!grade || byTeam.has(participant.teamId)) return;
    byTeam.set(participant.teamId, { team: participant.teamName, score: Number(grade.score) || 0, total: Number(grade.maxScore) || totalTargets(), date: new Date(grade.completedAt || 0).toISOString() });
  });
  return [...byTeam.values()];
}

async function renderLeaderboard(session) {
  sessionStatus.textContent = "Tabla de posiciones";
  app.innerHTML = `<section class="leaderboard-layout"><div class="leaderboard-wrap"><p class="risk-eyebrow">Resultados</p><h1>Tabla de posiciones</h1><p class="leaderboard-note">Buscando resultados del Desafío 2…</p></div></section>`;

  const fromFirebase = await firebaseDesafio2Leaderboard(session);
  const ranked = (fromFirebase && fromFirebase.length ? fromFirebase : loadLeaderboard())
    .slice()
    .sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
  const source = fromFirebase && fromFirebase.length ? "Tablero del taller (Firebase)" : "Respaldo local de este dispositivo";
  const rows = ranked.length
    ? ranked.map((entry, index) => `
      <tr class="${index < 3 ? "leaderboard-top" : ""}">
        <td><span class="leaderboard-rank rank-${index + 1}">${index + 1}</span></td>
        <td>${escapeHtml(entry.team)}</td>
        <td>${entry.score}/${entry.total}</td>
      </tr>`).join("")
    : `<tr><td colspan="3">Todavía no hay equipos con resultados registrados.</td></tr>`;

  app.innerHTML = `
    <section class="leaderboard-layout">
      <div class="leaderboard-wrap">
        <p class="risk-eyebrow">Resultados · ${escapeHtml(source)}</p>
        <h1>Tabla de posiciones</h1>
        <p class="leaderboard-note">Se muestra la puntuación del Desafío 2 por equipo, contando solo los aciertos en el primer y único intento por riesgo.</p>
        <table class="risk-matrix leaderboard-table">
          <thead><tr><th>Lugar</th><th>Equipo</th><th>Puntaje</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="result-actions"><button type="button" class="risk-secondary-button" id="backButton">Volver</button></div>
      </div>
    </section>`;
  document.querySelector("#backButton").addEventListener("click", renderAccess);
}

function renderSegments(item) {
  const complete = !assignedTarget(item);
  return item.segments.map((segment) => {
    if (!segment.id) return escapeHtml(segment.text);
    return `<button type="button" class="response-segment" data-segment="${segment.id}" ${complete ? "disabled" : ""}>${escapeHtml(segment.text)}</button>`;
  }).join("");
}

function renderAssigned(target) {
  if (!target) {
    return `<div class="risk-assigned risk-assigned-done"><span class="risk-assigned-label">Riesgo asignado</span><strong>Todas las selecciones de este caso quedaron registradas</strong></div>`;
  }
  return `<div class="risk-assigned" data-risk="${target.risk}"><span class="risk-assigned-label">Riesgo asignado</span><strong>${riskLabels[target.risk]}</strong></div>`;
}

function renderCase(message = null) {
  const item = cases[state.caseIndex];
  const found = currentFindings();
  const targets = caseTargets(item);
  const complete = Object.keys(found).length === targets.length;
  const overallProgress = Math.round((totalFound() / totalTargets()) * 100);
  const target = assignedTarget(item);
  const defaultMessage = target
    ? { tone: "", title: `Riesgo asignado: ${riskLabels[target.risk]}`, text: "Tienes un solo intento por riesgo. Consulta la ficha y revisa tu elección antes de seleccionar una frase. La corrección se mostrará al finalizar la actividad." }
    : { tone: "", title: "Caso registrado", text: "Registramos todas tus selecciones. Puedes continuar; verás la corrección al finalizar la actividad." };
  const activeMessage = message || defaultMessage;

  app.innerHTML = `
    <section class="audit-layout">
      <aside class="audit-sidebar">
        <p class="risk-eyebrow">Equipo ${escapeHtml(state.team.name)}</p>
        <h1>Auditoría de respuestas</h1>
        <div class="audit-progress-label"><span>Selecciones registradas</span><strong>${totalFound()}/${totalTargets()}</strong></div>
        <div class="audit-progress"><span style="width:${overallProgress}%"></span></div>
        <ol class="case-list">
          ${cases.map((caseItem, index) => `<li class="case-token ${index < state.caseIndex ? "complete" : index === state.caseIndex ? "current" : ""}"><span>${index + 1}</span>${escapeHtml(caseItem.shortTitle)}</li>`).join("")}
        </ol>
        <div class="sidebar-score"><strong>${totalFound()}</strong><span>selecciones registradas · resultados al finalizar</span></div>
      </aside>

      <section class="audit-workspace">
        <div class="case-heading">
          <div><p class="risk-eyebrow">Respuesta ${state.caseIndex + 1}</p><h2>${escapeHtml(item.title)}</h2></div>
          <span class="case-count">0${state.caseIndex + 1}</span>
        </div>
        <blockquote class="manager-request"><strong>Solicitud de la gerencia</strong>${escapeHtml(item.request)}</blockquote>

        <div class="audit-grid">
          <article class="response-card">
            <div class="response-head"><span class="ai-label"><span class="ai-dot"></span>Respuesta generada</span><span class="finding-count">${Object.keys(found).length} de ${targets.length} registrados</span></div>
            <p class="response-text">${renderSegments(item)}</p>
            <p class="response-instruction">Localiza y selecciona la frase que corresponde al riesgo asignado</p>
            ${renderAssigned(target)}
            <div class="audit-message ${activeMessage.tone}"><strong>${escapeHtml(activeMessage.title)}</strong><p>${escapeHtml(activeMessage.text)}</p></div>
          </article>

          <aside class="evidence-panel">
            <button type="button" class="evidence-toggle" aria-expanded="false"><span>Ficha de verificación</span><span aria-hidden="true">+</span></button>
            <div class="evidence-content" hidden>
              <ul>${item.evidence.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>
              <a class="evidence-link" href="${item.sourceUrl}" target="_blank" rel="noreferrer">Consultar fuente original ↗</a>
            </div>
          </aside>
        </div>

        <div class="case-actions">
          <button type="button" class="risk-primary-button" id="nextButton" ${complete ? "" : "disabled"}>${state.caseIndex === cases.length - 1 ? "Ver resultado" : "Continuar"}</button>
        </div>
      </section>
    </section>`;

  document.querySelectorAll(".response-segment:not(.marked)").forEach((button) => {
    button.addEventListener("click", () => evaluateSegment(button.dataset.segment));
  });

  document.querySelector(".evidence-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const content = document.querySelector(".evidence-content");
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    content.hidden = expanded;
  });

  document.querySelector("#nextButton").addEventListener("click", nextCase);
}

function evaluateSegment(segmentId) {
  const item = cases[state.caseIndex];
  const target = assignedTarget(item);
  const segment = item.segments.find((candidate) => candidate.id === segmentId);
  if (!target || !segment || !segment.risk) return;

  state.attempts += 1;
  if (!state.found[state.caseIndex]) state.found[state.caseIndex] = {};
  state.found[state.caseIndex][target.id] = segment.id;
  if (segment.id === target.id) state.score += 1;
  renderCase();
}

function nextCase() {
  if (assignedTarget(cases[state.caseIndex])) return;
  if (state.caseIndex === cases.length - 1) {
    renderResult();
    return;
  }
  state.caseIndex += 1;
  renderCase();
}

function renderResult() {
  if (totalFound() !== totalTargets()) return;
  sessionStatus.textContent = "Auditoría completada";
  saveResult(state.team.name, state.score);

  const saveStatus = { tone: "", text: "Guardando tu calificación como Desafío 2…" };
  const matrix = cases.map((item) => {
    const present = new Set(caseTargets(item).map((target) => target.risk));
    return `<tr><td>${escapeHtml(item.shortTitle)}</td>${Object.keys(riskLabels).map((risk) => `<td>${present.has(risk) ? '<span class="matrix-check">✓</span>' : '—'}</td>`).join("")}</tr>`;
  }).join("");

  app.innerHTML = `
    <section class="result-layout">
      <div class="result-wrap">
        <header class="result-header">
          <p class="risk-eyebrow">Auditoría completada · Equipo ${escapeHtml(state.team.name)}</p>
          <h1>El riesgo estaba en la interpretación.</h1>
          <div class="result-score"><strong>${state.score}/${totalTargets()}</strong><span>aciertos en el primer intento</span></div>
          <p id="desafio2SaveStatus" class="save-status">${escapeHtml(saveStatus.text)}</p>
          <p>Una institución reconocida y una cifra real no garantizan que la conclusión sea válida. La revisión exige contrastar la afirmación, el alcance y lo que realmente dice la fuente.</p>
        </header>
        <div class="matrix-wrap">
          <table class="risk-matrix">
            <thead><tr><th>Respuesta</th><th>Alucinación</th><th>Sesgo</th><th>Generalización</th><th>Cita falsa</th></tr></thead>
            <tbody>${matrix}</tbody>
          </table>
        </div>
        <div class="result-review">
          <h2>Revisión de tus selecciones</h2>
          ${cases.map((item, index) => `<details class="review-case"><summary>${escapeHtml(item.shortTitle)}</summary>${caseTargets(item).map((target) => {
            const selected = item.segments.find((segment) => segment.id === state.found[index][target.id]);
            return `<section><h3>${escapeHtml(riskLabels[target.risk])} · ${selected.id === target.id ? "Correcto" : "Por revisar"}</h3><p><strong>Tu selección:</strong> ${escapeHtml(selected.text)}</p><p><strong>Frase correspondiente:</strong> ${escapeHtml(target.text)}</p><p>${escapeHtml(target.explanation)}</p></section>`;
          }).join("")}</details>`).join("")}
        </div>
        <div class="result-actions">
          <button type="button" class="risk-ghost-button" id="leaderboardButton">Ver tabla de posiciones</button>
          <button type="button" class="risk-secondary-button" id="restartButton">Reiniciar actividad</button>
        </div>
      </div>
    </section>`;
  document.querySelector("#leaderboardButton").addEventListener("click", () => renderLeaderboard(state.session));
  document.querySelector("#restartButton").addEventListener("click", () => {
    state = { session: "", team: null, caseIndex: 0, found: {}, order: {}, score: 0, attempts: 0 };
    renderAccess();
  });

  saveDesafio2Grade(state.session, state.team, state.score, totalTargets())
    .then((saved) => {
      const status = document.querySelector("#desafio2SaveStatus");
      if (!status) return;
      status.textContent = saved
        ? "Tu calificación quedó guardada como Desafío 2 en el tablero del taller."
        : "No se encontraron integrantes registrados para este equipo; avisa a tu facilitador.";
      status.classList.toggle("save-status-warning", !saved);
    })
    .catch(() => {
      const status = document.querySelector("#desafio2SaveStatus");
      if (!status) return;
      status.textContent = "No se pudo guardar en el tablero del taller. Tu resultado quedó respaldado en este dispositivo; avisa a tu facilitador.";
      status.classList.add("save-status-warning");
    });
}

renderAccess();
