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

const sheetPlayers = [
  ["p1", "AADI JAIN", "20", "(817) 492-2817"],
  ["p2", "UTKARSH JAIN", "18", "(700) 799-1146"],
  ["p3", "VATSAL JAIN", "25", "(638) 781-7223"],
  ["p4", "DIYA JAIN", "22", "(788) 051-3512"],
  ["p5", "MEDHANSH JAIN", "12", "(983) 910-5166"],
  ["p6", "NAVYA JAIN", "16", "(727) 544-4444"],
  ["p7", "MANAN KATARIA", "31", "(979) 288-6888"],
  ["p8", "RISHABH JAIN", "28", "(63) 945-69698"],
  ["p9", "JAY SHAH", "26", "(870) 705-6040"],
  ["p10", "SAHIL SHAH", "20", "(937) 261-6629"],
  ["p11", "VARUN JAIN", "16", "(752) 407-6991"],
  ["p12", "DAKSH JAIN", "16", "(962) 140-3350"],
  ["p13", "PRIYAM BETALA", "24", "(876) 595-3766"],
  ["p14", "DEVANSHU JAIN", "22", "(752) 584-2111"],
  ["p15", "DIYA SHAH", "16", "(630) 769-2980"],
  ["p16", "MAHEK SHAH", "21", "(700) 790-6414"],
  ["p17", "DARSHAN SHAH", "23", "(831) 815-3992"],
  ["p18", "MANAN SHAH", "17", "(930) 517-5465"],
  ["p19", "KUSHAL JAIN", "24", "(708) 492-2111"],
  ["p20", "DIVYA JAIN", "27", "(708) 443-3111"],
  ["p21", "HARSHIT JAIN", "14", "(911) 551-0299"],
  ["p22", "PRAKHAR JAIN", "12", "(911) 551-0299"],
  ["p23", "ANANYA JAIN", "20", "(915) 156-6650"],
  ["p24", "ISHAN JAIN", "26", "(797) 687-1194"],
  ["p25", "KETAN JAIN", "32", "(945) 300-3275"],
  ["p26", "UTKARSH JAIN", "33", "(967) 306-4855"],
  ["p27", "KRITIKA JAIN", "17", "(969) 636-5052"],
  ["p28", "RUDRANSH JAIN", "13", "(900) 559-5188"],
  ["p29", "RISHABH JAIN", "18", "(959) 840-0555"],
  ["p30", "KANAV JAIN", "18", "(958) 079-7831"],
  ["p31", "VANSH VORA", "24", "(933) 611-7058"],
  ["p32", "ARNAV JAIN", "18", "(798) 522-6500"],
  ["p33", "SNEHA JAIN", "30", "99560 68989"],
  ["p34", "VRINDA JAIN", "30", "(740) 623-9119"],
  ["p35", "DHARMIK JAIN", "22", "(909) 069-9079"],
  ["p36", "UTKARSH JAIN", "31", "(875) 663-4830"],
  ["p37", "AMAN JAIN", "28", "(894) 844-1133"],
  ["p38", "ARNAV JAIN", "25", "(914) 088-7577"],
  ["p39", "AANYA JAIN", "19", "(780) 046-9999"],
  ["p40", "RADHIKA JAIN", "26", "(812) 397-2606"],
  ["p41", "SAMYAK JAIN", "30", "(933) 677-1313"],
  ["p42", "PRAKHAR JAIN", "25", "(955) 957-2727"],
  ["p43", "AKANSHA JAIN", "25", "(914) 078-4975"],
  ["p44", "AKARSH JAIN", "25", "(831) 866-8229"],
  ["p45", "RISHABH JAIN", "25", "(907) 652-5252"],
  ["p46", "NAMAN JAIN", "23", "(955) 527-4121"],
  ["p47", "SAMANVAY JAIN", "24", "(831) 890-2545"],
  ["p48", "BHAKTI JAIN", "19", "(910) 812-4389"]
].map(([id, name, age, mobile]) => ({ id, name, age, mobile }));

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
  teamForm: document.querySelector("#teamForm"),
  teamRoster: document.querySelector("#teamRoster"),
  teamsEditor: document.querySelector("#teamsEditor"),
  newTeamName: document.querySelector("#newTeamName"),
  playerOneSearch: document.querySelector("#playerOneSearch"),
  playerTwoSearch: document.querySelector("#playerTwoSearch"),
  availablePlayersList: document.querySelector("#availablePlayersList"),
  availablePlayersNote: document.querySelector("#availablePlayersNote"),
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
      name: `T${start + offset}`,
      teamId: null
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
    players: sheetPlayers,
    rosterTeams: [],
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
    players: normalizePlayers(savedState.players),
    rosterTeams: Array.isArray(savedState.rosterTeams) ? savedState.rosterTeams.map(normalizeRosterTeam) : [],
    teams: normalizeGroupSlots(savedState.teams),
    matches: savedState.matches.map((match) => ({
      ...match,
      history: Array.isArray(match.history) ? match.history.slice(-20).map(normalizeHistoryItem) : []
    }))
  };
}

function normalizePlayers(savedPlayers) {
  const playerMap = new Map(sheetPlayers.map((player) => [player.id, player]));
  if (Array.isArray(savedPlayers)) {
    savedPlayers.forEach((player) => {
      if (!player?.id) return;
      playerMap.set(player.id, {
        id: player.id,
        name: player.name || "",
        age: player.age || "",
        mobile: player.mobile || ""
      });
    });
  }
  return Array.from(playerMap.values());
}

function normalizeGroupSlots(savedTeams) {
  const initialTeams = createInitialState().teams;
  return groups.reduce((normalized, group) => {
    const sourceSlots = Array.isArray(savedTeams?.[group]) ? savedTeams[group] : initialTeams[group];
    normalized[group] = [0, 1, 2].map((index) => ({
      ...initialTeams[group][index],
      ...sourceSlots[index],
      teamId: sourceSlots[index]?.teamId || null
    }));
    return normalized;
  }, {});
}

function normalizeRosterTeam(team) {
  return {
    id: team.id || createTeamId(),
    name: team.name || "Unnamed team",
    players: [0, 1].map((index) => ({
      id: team.players?.[index]?.id || "",
      name: team.players?.[index]?.name || "",
      mobile: team.players?.[index]?.mobile || "",
      age: team.players?.[index]?.age || ""
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
  if (ref.type === "team") return getGroupSlotTeam(ref.group, ref.index);
  if (ref.type === "winner") return getGroupWinner(ref.group);
  if (ref.type === "matchWinner") {
    const match = getMatch(ref.matchId);
    if (!match || !match.winnerSide) return null;
    return match.winnerSide === "A" ? resolveTeam(match.teamARef) : resolveTeam(match.teamBRef);
  }
  return null;
}

function getRosterTeam(teamId) {
  return state.rosterTeams.find((team) => team.id === teamId) || null;
}

function getPlayer(playerId) {
  return state.players.find((player) => player.id === playerId) || null;
}

function getAssignedPlayerIds() {
  const assigned = new Set();
  state.rosterTeams.forEach((team) => {
    team.players.forEach((player) => {
      if (player.id) assigned.add(player.id);
    });
  });
  return assigned;
}

function getAvailablePlayers() {
  const assigned = getAssignedPlayerIds();
  return state.players.filter((player) => !assigned.has(player.id));
}

function playerOptionLabel(player) {
  return `${player.name} | Age ${player.age} | ${player.mobile}`;
}

function findPlayerFromInput(value) {
  const normalized = value.trim().toLowerCase();
  return getAvailablePlayers().find((player) => (
    playerOptionLabel(player).toLowerCase() === normalized ||
    `${player.name} ${player.mobile}`.toLowerCase() === normalized
  )) || null;
}

function getGroupSlotTeam(group, index) {
  const slot = state.teams[group][index];
  return slot.teamId ? getRosterTeam(slot.teamId) || slot : slot;
}

function createTeamId() {
  return `team-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
  const rows = state.teams[group].map((slot, index) => ({
    team: getGroupSlotTeam(group, index),
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
  renderRoster();
  renderAvailablePlayers();
  els.teamsEditor.innerHTML = "";
  const assignedTeamIds = new Set();
  groups.forEach((group) => {
    state.teams[group].forEach((slot) => {
      if (slot.teamId) assignedTeamIds.add(slot.teamId);
    });
  });

  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "team-group";
    card.innerHTML = `<h3>Group ${group}</h3>`;
    state.teams[group].forEach((slot, index) => {
      const assignedTeam = getGroupSlotTeam(group, index);
      const row = document.createElement("label");
      row.className = "team-edit-row";
      const label = document.createElement("span");
      label.textContent = slot.id;
      const select = document.createElement("select");
      select.setAttribute("aria-label", `${slot.id} team`);

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = `${slot.id} - ${slot.name}`;
      select.append(placeholder);

      state.rosterTeams.forEach((team) => {
        const option = document.createElement("option");
        option.value = team.id;
        option.textContent = team.name;
        option.selected = slot.teamId === team.id;
        option.disabled = assignedTeamIds.has(team.id) && slot.teamId !== team.id;
        select.append(option);
      });

      select.addEventListener("change", (event) => {
        state.teams[group][index].teamId = event.target.value || null;
        saveAndRender();
      });

      row.append(label, select);
      if (assignedTeam.players) {
        const players = document.createElement("small");
        players.className = "slot-players";
        players.textContent = assignedTeam.players.map((player) => player.name).filter(Boolean).join(" / ");
        row.append(players);
      }
      card.append(row);
    });
    els.teamsEditor.append(card);
  });
}

function renderAvailablePlayers() {
  const available = getAvailablePlayers();
  els.availablePlayersList.innerHTML = "";
  available.forEach((player) => {
    const option = document.createElement("option");
    option.value = playerOptionLabel(player);
    els.availablePlayersList.append(option);
  });
  els.availablePlayersNote.textContent = `${available.length} players available from Google Sheet data.`;
}

function renderRoster() {
  els.teamRoster.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = "Registered teams";
  els.teamRoster.append(title);

  if (state.rosterTeams.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No teams added yet.";
    els.teamRoster.append(empty);
    return;
  }

  state.rosterTeams.forEach((team) => {
    const card = document.createElement("article");
    card.className = "roster-card";
    card.innerHTML = `
      <div>
        <strong>${escapeHtml(team.name)}</strong>
        <p>${formatPlayer(team.players[0], "Player 1")}</p>
        <p>${formatPlayer(team.players[1], "Player 2")}</p>
      </div>
      <button class="ghost remove-team" type="button">Remove</button>
    `;
    card.querySelector(".remove-team").addEventListener("click", () => removeRosterTeam(team.id));
    els.teamRoster.append(card);
  });
}

function formatPlayer(player, fallbackName) {
  const resolved = player.id ? getPlayer(player.id) || player : player;
  const name = resolved.name || fallbackName;
  const mobile = resolved.mobile || "No mobile";
  const age = resolved.age ? `Age ${resolved.age}` : "No age";
  return `${escapeHtml(name)} - ${escapeHtml(mobile)} - ${escapeHtml(age)}`;
}

function addRosterTeam(event) {
  event.preventDefault();
  const playerOne = findPlayerFromInput(els.playerOneSearch.value);
  const playerTwo = findPlayerFromInput(els.playerTwoSearch.value);

  if (!playerOne || !playerTwo || playerOne.id === playerTwo.id) {
    alert("Choose two different available players from the dropdown.");
    return;
  }

  const teamName = els.newTeamName.value.trim() || `${playerOne.name} / ${playerTwo.name}`;
  const team = {
    id: createTeamId(),
    name: teamName,
    players: [
      {
        id: playerOne.id,
        name: playerOne.name,
        mobile: playerOne.mobile,
        age: playerOne.age
      },
      {
        id: playerTwo.id,
        name: playerTwo.name,
        mobile: playerTwo.mobile,
        age: playerTwo.age
      }
    ]
  };

  state.rosterTeams.push(team);
  els.teamForm.reset();
  saveAndRender();
}

function removeRosterTeam(teamId) {
  if (!confirm("Remove this team from the roster and any group slot?")) return;
  state.rosterTeams = state.rosterTeams.filter((team) => team.id !== teamId);
  groups.forEach((group) => {
    state.teams[group].forEach((slot) => {
      if (slot.teamId === teamId) slot.teamId = null;
    });
  });
  saveAndRender();
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
      state = normalizeState(imported);
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
els.teamForm.addEventListener("submit", addRosterTeam);
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
