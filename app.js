const STORAGE_KEY = "pickleball-league-manager-v1";

const groups = ["A", "B", "C", "D", "E", "F", "G", "H"];
const groupPairings = [
  [0, 1],
  [1, 2],
  [2, 0]
];

const formats = {
  group: { label: "One game to 11", roundsToWin: 1, target: 11, maxRounds: 1 },
  qf: { label: "Best of 3 games to 7", roundsToWin: 2, target: 7, maxRounds: 3 },
  sf: { label: "Best of 3 games to 7", roundsToWin: 2, target: 7, maxRounds: 3 },
  final: { label: "Best of 3 games to 11", roundsToWin: 2, target: 11, maxRounds: 3 }
};

let state = loadState();
let activeMatchId = state.activeMatchId || state.matches[0].id;

const els = {
  activeMatchTitle: document.querySelector("#activeMatchTitle"),
  activeMatchMeta: document.querySelector("#activeMatchMeta"),
  scoreTeamA: document.querySelector("#scoreTeamA"),
  scoreTeamB: document.querySelector("#scoreTeamB"),
  scoreA: document.querySelector("#scoreA"),
  scoreB: document.querySelector("#scoreB"),
  servingBadge: document.querySelector("#servingBadge"),
  roundBadge: document.querySelector("#roundBadge"),
  targetBadge: document.querySelector("#targetBadge"),
  pointA: document.querySelector("#pointA"),
  pointB: document.querySelector("#pointB"),
  sideOutBtn: document.querySelector("#sideOutBtn"),
  undoBtn: document.querySelector("#undoBtn"),
  nextRoundBtn: document.querySelector("#nextRoundBtn"),
  completeMatchBtn: document.querySelector("#completeMatchBtn"),
  fixturesGrid: document.querySelector("#fixturesGrid"),
  standingsGrid: document.querySelector("#standingsGrid"),
  bracket: document.querySelector("#bracket"),
  teamsEditor: document.querySelector("#teamsEditor"),
  exportBtn: document.querySelector("#exportBtn"),
  importFile: document.querySelector("#importFile"),
  resetBtn: document.querySelector("#resetBtn"),
  template: document.querySelector("#matchCardTemplate")
};

function createInitialState() {
  const teams = {};
  groups.forEach((group, groupIndex) => {
    const start = groupIndex * 3 + 1;
    teams[group] = [0, 1, 2].map((offset) => ({
      id: `T${start + offset}`,
      name: `T${start + offset}`
    }));
  });

  const matches = [];
  groups.forEach((group) => {
    groupPairings.forEach(([a, b], index) => {
      matches.push(createMatch(`G${group}-${index + 1}`, "group", `Group ${group}`, {
        teamARef: { type: "team", group, index: a },
        teamBRef: { type: "team", group, index: b }
      }));
    });
  });

  [
    ["QF1", "qf", "Quarterfinal 1", "A", "B"],
    ["QF2", "qf", "Quarterfinal 2", "C", "D"],
    ["QF3", "qf", "Quarterfinal 3", "E", "F"],
    ["QF4", "qf", "Quarterfinal 4", "G", "H"]
  ].forEach(([id, stage, title, groupA, groupB]) => {
    matches.push(createMatch(id, stage, title, {
      teamARef: { type: "winner", group: groupA },
      teamBRef: { type: "winner", group: groupB }
    }));
  });

  matches.push(createMatch("SF1", "sf", "Semifinal 1", {
    teamARef: { type: "matchWinner", matchId: "QF1" },
    teamBRef: { type: "matchWinner", matchId: "QF2" }
  }));
  matches.push(createMatch("SF2", "sf", "Semifinal 2", {
    teamARef: { type: "matchWinner", matchId: "QF3" },
    teamBRef: { type: "matchWinner", matchId: "QF4" }
  }));
  matches.push(createMatch("F", "final", "Final", {
    teamARef: { type: "matchWinner", matchId: "SF1" },
    teamBRef: { type: "matchWinner", matchId: "SF2" }
  }));

  return {
    teams,
    matches,
    activeMatchId: matches[0].id
  };
}

function createMatch(id, stage, title, refs) {
  const format = formats[stage];
  return {
    id,
    stage,
    title,
    teamARef: refs.teamARef,
    teamBRef: refs.teamBRef,
    rounds: [createRound(format.target)],
    serverTeam: "A",
    serverNumber: 2,
    completed: false,
    winnerSide: null,
    history: []
  };
}

function createRound(target) {
  return {
    a: 0,
    b: 0,
    target,
    completed: false,
    winnerSide: null
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createInitialState();

  try {
    const parsed = JSON.parse(saved);
    if (!parsed.teams || !Array.isArray(parsed.matches)) return createInitialState();
    return normalizeState(parsed);
  } catch {
    return createInitialState();
  }
}

function save() {
  state.activeMatchId = activeMatchId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeState(savedState) {
  return {
    ...savedState,
    matches: savedState.matches.map((match) => ({
      ...match,
      history: Array.isArray(match.history) ? match.history.slice(-20).map(normalizeHistoryItem) : []
    }))
  };
}

function normalizeHistoryItem(item) {
  try {
    return createHistorySnapshot(JSON.parse(item));
  } catch {
    return item;
  }
}

function createHistorySnapshot(match) {
  return JSON.stringify({
    rounds: match.rounds,
    serverTeam: match.serverTeam,
    serverNumber: match.serverNumber,
    completed: match.completed,
    winnerSide: match.winnerSide
  });
}

function restoreHistorySnapshot(match, snapshot) {
  const previous = JSON.parse(snapshot);
  match.rounds = previous.rounds;
  match.serverTeam = previous.serverTeam;
  match.serverNumber = previous.serverNumber;
  match.completed = previous.completed;
  match.winnerSide = previous.winnerSide;
}

function rememberMatch(match) {
  match.history.push(createHistorySnapshot(match));
  if (match.history.length > 50) match.history.shift();
}

function resolveTeam(ref) {
  if (ref.type === "team") return state.teams[ref.group][ref.index];
  if (ref.type === "winner") return getGroupWinner(ref.group);
  if (ref.type === "matchWinner") {
    const match = getMatch(ref.matchId);
    if (!match || !match.winnerSide) return null;
    return match.winnerSide === "A" ? resolveTeam(match.teamARef) : resolveTeam(match.teamBRef);
  }
  return null;
}

function getMatch(id) {
  return state.matches.find((match) => match.id === id);
}

function currentRound(match) {
  return match.rounds[match.rounds.length - 1];
}

function scoreCall(match, round) {
  const servingScore = match.serverTeam === "A" ? round.a : round.b;
  const receivingScore = match.serverTeam === "A" ? round.b : round.a;
  return `${servingScore}-${receivingScore}-${match.serverNumber}`;
}

function scoreLabel(match) {
  const teamA = resolveTeam(match.teamARef);
  const teamB = resolveTeam(match.teamBRef);
  return `${teamA?.name || "TBD"} vs ${teamB?.name || "TBD"}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isReady(match) {
  return Boolean(resolveTeam(match.teamARef) && resolveTeam(match.teamBRef));
}

function roundIsWon(round) {
  const high = Math.max(round.a, round.b);
  const diff = Math.abs(round.a - round.b);
  return high >= round.target && diff >= 2;
}

function applyRally(winningSide) {
  const match = getMatch(activeMatchId);
  if (!match || match.completed || !isReady(match)) return;

  const round = currentRound(match);
  if (round.completed) return;

  rememberMatch(match);

  if (match.serverTeam === winningSide) {
    round[winningSide.toLowerCase()] += 1;
    if (roundIsWon(round)) {
      round.completed = true;
      round.winnerSide = winningSide;
      updateMatchWinner(match);
    }
  } else if (match.serverNumber === 1) {
    match.serverNumber = 2;
  } else {
    match.serverTeam = winningSide;
    match.serverNumber = 1;
  }

  saveAndRender();
}

function sideOut() {
  const match = getMatch(activeMatchId);
  if (!match || match.completed || !isReady(match)) return;
  rememberMatch(match);
  match.serverTeam = match.serverTeam === "A" ? "B" : "A";
  match.serverNumber = 1;
  saveAndRender();
}

function updateMatchWinner(match) {
  const needed = formats[match.stage].roundsToWin;
  const winsA = match.rounds.filter((round) => round.winnerSide === "A").length;
  const winsB = match.rounds.filter((round) => round.winnerSide === "B").length;

  if (winsA >= needed || winsB >= needed) {
    match.completed = true;
    match.winnerSide = winsA > winsB ? "A" : "B";
    return;
  }

  if (match.rounds.length < formats[match.stage].maxRounds) {
    match.rounds.push(createRound(formats[match.stage].target));
    match.serverTeam = match.rounds.length % 2 === 0 ? "B" : "A";
    match.serverNumber = 2;
  }
}

function undo() {
  const match = getMatch(activeMatchId);
  if (!match || match.history.length === 0) return;
  restoreHistorySnapshot(match, match.history.pop());
  saveAndRender();
}

function nextRound() {
  const match = getMatch(activeMatchId);
  if (!match || match.completed || !isReady(match)) return;
  const format = formats[match.stage];
  if (!currentRound(match).completed || match.rounds.length >= format.maxRounds) return;
  rememberMatch(match);
  match.rounds.push(createRound(format.target));
  match.serverTeam = match.rounds.length % 2 === 0 ? "B" : "A";
  match.serverNumber = 2;
  saveAndRender();
}

function completeMatch() {
  const match = getMatch(activeMatchId);
  if (!match || match.completed) return;
  const winsA = match.rounds.filter((round) => round.winnerSide === "A").length;
  const winsB = match.rounds.filter((round) => round.winnerSide === "B").length;
  const needed = formats[match.stage].roundsToWin;
  if (winsA < needed && winsB < needed) return;
  rememberMatch(match);
  match.completed = true;
  match.winnerSide = winsA > winsB ? "A" : "B";
  saveAndRender();
}

function groupMatches(group) {
  return state.matches.filter((match) => match.stage === "group" && match.title === `Group ${group}`);
}

function calculateStandings(group) {
  const rows = state.teams[group].map((team) => ({
    team,
    played: 0,
    wins: 0,
    pointsFor: 0,
    pointDiff: 0,
    bestWinMargin: 0
  }));

  groupMatches(group).forEach((match) => {
    if (!match.completed) return;
    const teamA = resolveTeam(match.teamARef);
    const teamB = resolveTeam(match.teamBRef);
    const rowA = rows.find((row) => row.team.id === teamA.id);
    const rowB = rows.find((row) => row.team.id === teamB.id);
    const pointsA = match.rounds.reduce((total, round) => total + round.a, 0);
    const pointsB = match.rounds.reduce((total, round) => total + round.b, 0);

    rowA.played += 1;
    rowB.played += 1;
    rowA.pointsFor += pointsA;
    rowB.pointsFor += pointsB;
    rowA.pointDiff += pointsA - pointsB;
    rowB.pointDiff += pointsB - pointsA;
    if (match.winnerSide === "A") {
      rowA.wins += 1;
      rowA.bestWinMargin = Math.max(rowA.bestWinMargin, pointsA - pointsB);
    }
    if (match.winnerSide === "B") {
      rowB.wins += 1;
      rowB.bestWinMargin = Math.max(rowB.bestWinMargin, pointsB - pointsA);
    }
  });

  const completedMatches = groupMatches(group).filter((match) => match.completed);
  const isThreeWayOneWinTie = completedMatches.length === 3 && rows.every((row) => row.wins === 1);

  return rows.sort((a, b) => (
    b.wins - a.wins ||
    (isThreeWayOneWinTie ? b.bestWinMargin - a.bestWinMargin : 0) ||
    b.pointDiff - a.pointDiff ||
    b.pointsFor - a.pointsFor ||
    a.team.name.localeCompare(b.team.name)
  ));
}

function getGroupWinner(group) {
  const matches = groupMatches(group);
  if (!matches.every((match) => match.completed)) return null;
  return calculateStandings(group)[0].team;
}

function renderScorePanel() {
  const match = getMatch(activeMatchId);
  const round = match ? currentRound(match) : null;
  const teamA = match ? resolveTeam(match.teamARef) : null;
  const teamB = match ? resolveTeam(match.teamBRef) : null;
  const ready = Boolean(match && round && teamA && teamB);

  els.activeMatchTitle.textContent = match ? match.title : "Select a match";
  els.activeMatchMeta.textContent = match ? `${scoreLabel(match)} - ${formats[match.stage].label}` : "";
  els.scoreTeamA.textContent = teamA?.name || "TBD";
  els.scoreTeamB.textContent = teamB?.name || "TBD";
  els.scoreA.textContent = round?.a ?? 0;
  els.scoreB.textContent = round?.b ?? 0;
  els.servingBadge.textContent = match && round
    ? `Server: ${match.serverTeam === "A" ? teamA?.name || "TBD" : teamB?.name || "TBD"} | Call: ${scoreCall(match, round)}`
    : "Server: -";
  els.roundBadge.textContent = match ? `Round ${match.rounds.length}` : "Round 1";
  els.targetBadge.textContent = round ? `Target ${round.target}, win by 2` : "Target 11";

  const canScore = ready && !match.completed && !round.completed;
  els.pointA.disabled = !canScore;
  els.pointB.disabled = !canScore;
  els.sideOutBtn.disabled = !canScore;
  els.undoBtn.disabled = !match || match.history.length === 0;
  els.nextRoundBtn.disabled = !match || match.completed || !round?.completed || match.rounds.length >= formats[match.stage].maxRounds;
  els.completeMatchBtn.disabled = !match || match.completed || Math.max(
    match.rounds.filter((item) => item.winnerSide === "A").length,
    match.rounds.filter((item) => item.winnerSide === "B").length
  ) < formats[match.stage].roundsToWin;
}

function renderFixtures() {
  els.fixturesGrid.innerHTML = "";
  state.matches.forEach((match) => {
    const card = els.template.content.firstElementChild.cloneNode(true);
    card.classList.toggle("active", match.id === activeMatchId);
    card.querySelector(".match-stage").textContent = match.stage === "group" ? match.title : match.stage.toUpperCase();
    card.querySelector(".match-status").textContent = match.completed ? "Complete" : isReady(match) ? "Ready" : "Waiting";
    card.querySelector(".match-title").textContent = scoreLabel(match);
    card.querySelector(".match-format").textContent = formats[match.stage].label;
    card.querySelector(".rounds").innerHTML = renderRounds(match);
    card.querySelector(".select-match").addEventListener("click", () => {
      activeMatchId = match.id;
      saveAndRender();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    els.fixturesGrid.append(card);
  });
}

function renderRounds(match) {
  return match.rounds.map((round, index) => {
    const winner = round.winnerSide ? `Winner ${round.winnerSide}` : "In play";
    return `<div class="round-row"><span>Round ${index + 1} to ${round.target}</span><span>${round.a}-${round.b} ${escapeHtml(winner)}</span></div>`;
  }).join("");
}

function renderStandings() {
  els.standingsGrid.innerHTML = "";
  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "standing-card";
    const winner = getGroupWinner(group);
    card.innerHTML = `
      <h3>Group ${group}${winner ? ` - Winner: ${escapeHtml(winner.name)}` : ""}</h3>
      <div class="standing-row header"><span>#</span><span>Team</span><span>P</span><span>W</span><span>PF</span><span>TB</span></div>
      ${calculateStandings(group).map((row, index) => `
        <div class="standing-row">
          <span>${index + 1}</span>
          <strong>${escapeHtml(row.team.name)}</strong>
          <span>${row.played}</span>
          <span>${row.wins}</span>
          <span>${row.pointsFor}</span>
          <span>${row.bestWinMargin || row.pointDiff}</span>
        </div>
      `).join("")}
    `;
    els.standingsGrid.append(card);
  });
}

function renderBracket() {
  const columns = [
    ["Quarterfinals", ["QF1", "QF2", "QF3", "QF4"]],
    ["Semifinals", ["SF1", "SF2"]],
    ["Final", ["F"]],
    ["Champion", ["F"]]
  ];
  els.bracket.innerHTML = "";

  columns.forEach(([title, ids], columnIndex) => {
    const column = document.createElement("div");
    column.className = "bracket-column";
    column.innerHTML = `<h3>${title}</h3>`;
    ids.forEach((id) => {
      const match = getMatch(id);
      const winner = match?.winnerSide ? resolveTeam(match.winnerSide === "A" ? match.teamARef : match.teamBRef) : null;
      const item = document.createElement("article");
      item.className = `bracket-match ${winner ? "winner" : ""}`;
      item.innerHTML = columnIndex === 3
        ? `<h3>Champion</h3><p>${escapeHtml(winner?.name || "TBD")}</p>`
        : `<h3>${escapeHtml(match.title)}</h3><p>${escapeHtml(scoreLabel(match))}</p><p>${winner ? `Winner: ${escapeHtml(winner.name)}` : "Winner: TBD"}</p>`;
      if (columnIndex !== 3) {
        item.addEventListener("click", () => {
          activeMatchId = match.id;
          saveAndRender();
        });
      }
      column.append(item);
    });
    els.bracket.append(column);
  });
}

function renderTeams() {
  els.teamsEditor.innerHTML = "";
  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "team-group";
    card.innerHTML = `<h3>Group ${group}</h3>`;
    state.teams[group].forEach((team, index) => {
      const row = document.createElement("label");
      row.className = "team-edit-row";
      row.innerHTML = `<span>${escapeHtml(team.id)}</span><input value="${escapeHtml(team.name)}" aria-label="${escapeHtml(team.id)} name">`;
      row.querySelector("input").addEventListener("input", (event) => {
        state.teams[group][index].name = event.target.value.trim() || team.id;
        saveAndRender(false);
      });
      card.append(row);
    });
    els.teamsEditor.append(card);
  });
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`#${tab.dataset.view}View`).classList.add("active");
    });
  });
}

function saveAndRender(includeTeams = true) {
  save();
  renderScorePanel();
  renderFixtures();
  renderStandings();
  renderBracket();
  if (includeTeams) renderTeams();
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pickleball-league.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importState(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported.teams || !Array.isArray(imported.matches)) throw new Error("Invalid file");
      state = imported;
      activeMatchId = state.activeMatchId || state.matches[0].id;
      saveAndRender();
    } catch {
      alert("That file does not look like a Pickleball League Manager export.");
    }
  };
  reader.readAsText(file);
}

els.pointA.addEventListener("click", () => applyRally("A"));
els.pointB.addEventListener("click", () => applyRally("B"));
els.sideOutBtn.addEventListener("click", sideOut);
els.undoBtn.addEventListener("click", undo);
els.nextRoundBtn.addEventListener("click", nextRound);
els.completeMatchBtn.addEventListener("click", completeMatch);
els.exportBtn.addEventListener("click", exportState);
els.importFile.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) importState(file);
});
els.resetBtn.addEventListener("click", () => {
  if (!confirm("Reset all teams, scores, standings, and bracket results?")) return;
  state = createInitialState();
  activeMatchId = state.activeMatchId;
  saveAndRender();
});

renderTabs();
saveAndRender();
