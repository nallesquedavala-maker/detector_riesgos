// Conecta este segundo desafío (Detector de riesgos) con la misma base de datos que
// "Fuentes contra alucinaciones" (taller_fuentes_ia), para leer los equipos ya
// registrados ahí y guardar aquí la calificación como grades/desafio2 de cada integrante.
import { firebaseConfig } from "./firebase-config.js";

const localPrefix = "utel-evidence-game";
let firebaseApi = null;
let database = null;

function configured() {
  return Object.values(firebaseConfig).every((value) => value && !String(value).startsWith("REEMPLAZAR"));
}

async function initFirebase() {
  if (!configured()) return false;
  if (database) return true;
  const appModule = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");
  const dbModule = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js");
  const authModule = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js");
  const app = appModule.initializeApp(firebaseConfig);
  const auth = authModule.getAuth(app);
  if (!auth.currentUser) await authModule.signInAnonymously(auth);
  database = dbModule.getDatabase(app);
  firebaseApi = dbModule;
  return true;
}

export function cleanSessionCode(value) {
  return String(value || "UTEL0905").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20) || "UTEL0905";
}

function localKey(session) {
  return `${localPrefix}:${cleanSessionCode(session)}`;
}

function readLocal(session) {
  try {
    const state = JSON.parse(localStorage.getItem(localKey(session))) || {};
    return { teams: state.teams || {}, participants: state.participants || {} };
  } catch {
    return { teams: {}, participants: {} };
  }
}

export async function mode() {
  try {
    return (await initFirebase()) ? "realtime" : "demo";
  } catch {
    return "demo";
  }
}

export async function getTeams(session) {
  const safeSession = cleanSessionCode(session);
  if (await initFirebase().catch(() => false)) {
    const snapshot = await firebaseApi.get(firebaseApi.ref(database, `sessions/${safeSession}/teams`));
    return snapshot.val() || {};
  }
  return readLocal(safeSession).teams || {};
}

export async function getParticipants(session) {
  const safeSession = cleanSessionCode(session);
  if (await initFirebase().catch(() => false)) {
    const snapshot = await firebaseApi.get(firebaseApi.ref(database, `sessions/${safeSession}/participants`));
    return snapshot.val() || {};
  }
  return readLocal(safeSession).participants || {};
}

export async function saveDesafio2Grade(session, team, score, maxScore) {
  const safeSession = cleanSessionCode(session);
  const participantIds = Object.keys(team.participantIds || {});
  if (!participantIds.length) return false;

  if (await initFirebase().catch(() => false)) {
    const snapshots = await Promise.all(participantIds.map((participantId) => firebaseApi.get(firebaseApi.ref(database, `sessions/${safeSession}/participants/${participantId}/grades/desafio2`))));
    const existingGrade = snapshots.find((snapshot) => snapshot.exists())?.val();
    const completedAt = existingGrade?.completedAt || Date.now();
    const grade = { score, maxScore, percentage: Math.round((score / maxScore) * 100), completedAt };
    const updates = {};
    participantIds.forEach((participantId, index) => {
      if (!snapshots[index].exists()) {
        updates[`participants/${participantId}/grades/desafio2`] = grade;
      }
    });
    // Solo se escribe grades/desafio2: ese es el único sub-camino de "participants"
    // habilitado en database.rules.json para cualquier usuario anónimo autenticado.
    // Cualquier otro campo del participante sigue protegido por ownerUid y se
    // rechazaría si este desafío se juega desde un dispositivo distinto al que
    // registró al equipo.
    if (Object.keys(updates).length) await firebaseApi.update(firebaseApi.ref(database, `sessions/${safeSession}`), updates);
    return true;
  }

  const state = readLocal(safeSession);
  const existingGrade = participantIds.map((id) => state.participants[id]?.grades?.desafio2).find(Boolean);
  const completedAt = existingGrade?.completedAt || Date.now();
  participantIds.forEach((participantId) => {
    const participant = state.participants[participantId];
    if (!participant || participant.grades?.desafio2) return;
    participant.grades = { ...(participant.grades || {}), desafio2: { score, maxScore, percentage: Math.round((score / maxScore) * 100), completedAt } };
    participant.updatedAt = completedAt;
  });
  localStorage.setItem(localKey(safeSession), JSON.stringify(state));
  return true;
}
