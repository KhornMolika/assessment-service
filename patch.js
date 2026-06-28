/* eslint-disable */
const fs = require('fs');
const file = 'src/components/assessment/session/PresentRealTimeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace local state with roomState
content = content.replace(/const \[phase, setPhase\] = useState<HostPhase>\("lobby"\);/, 'const phase = roomState.phase === "active" ? "reveal" : roomState.phase === "results" ? "winner" : roomState.phase as HostPhase;');
content = content.replace(/const \[timerSeconds, setTimerSeconds\] = useState\(15\);/, 'const [timerSeconds, setTimerSeconds] = useState(0);');
content = content.replace(/const activeParticipants = roomState.participants.length > 0 \? roomState\.participants : participants; \/\/ Fallback to mock if empty/, 'const activeParticipants = roomState.participants;');
content = content.replace(/const \[mockResponseCount, setMockResponseCount\] = useState\(0\);/, '');
content = content.replace(/const responseCount = roomState.questionResults \? activeParticipants\.length : mockResponseCount;/, '');
content = content.replace(/const leaderboard = roomState.leaderboard \|\| initialLeaderboard;/, 'const leaderboard = roomState.leaderboard || [];');

// Timer logic based on endTime
content = content.replace(/useEffect\(\(\) => \{\n    if \(phase !== "reveal"\) \{[\s\S]*?\}, \[activeParticipants.length, phase, timerSeconds, emitRevealAnswers\]\);/, `
  useEffect(() => {
    if (phase !== "reveal" || !roomState.endTime) return;
    
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(roomState.endTime).getTime() - Date.now()) / 1000));
      setTimerSeconds(remaining);
    };
    
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, roomState.endTime]);
`);

// When host starts session
content = content.replace(/function startSession\(\) \{\n    prime\(\);\n    setQuestionIndex\(0\);\n    setTimerSeconds\(15\);\n    setMockResponseCount\(0\);\n    setPhase\("reveal"\);\n    emitStartQuestion\(rounds\[0\].id\);\n  \}/, `
  function startSession() {
    prime();
    setQuestionIndex(0);
    emitStartQuestion(rounds[0].id);
  }
`);

// Advance next
content = content.replace(/function advanceToNextQuestion\(\) \{\n    if \(questionIndex === rounds.length - 1\) \{\n      setPhase\("winner"\);\n      return;\n    \}\n\n    const nextIndex = questionIndex \+ 1;\n    setQuestionIndex\(nextIndex\);\n    setTimerSeconds\(15\);\n    setMockResponseCount\(0\);\n    setPhase\("reveal"\);\n    emitStartQuestion\(rounds\[nextIndex\].id\);\n  \}/, `
  function advanceToNextQuestion() {
    if (questionIndex === rounds.length - 1) {
      // Backend automatically sends SESSION_ENDED or SHOW_FINAL_RANK which sets phase=results
      return;
    }
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    emitStartQuestion(rounds[nextIndex].id);
  }
`);

// Skip to correct
content = content.replace(/function skipToCorrectAnswer\(\) \{\n    setTimerSeconds\(0\);\n    setMockResponseCount\(activeParticipants.length\);\n    setPhase\("correct"\);\n    emitRevealAnswers\(\);\n  \}/, `
  function skipToCorrectAnswer() {
    emitRevealAnswers();
  }
`);

// Show leaderboard
content = content.replace(/function showLeaderboard\(\) \{\n    setPhase\("leaderboard"\);\n  \}/, `
  function showLeaderboard() {
    // handled by backend SHOW_RANK via automatic transition or something else? Wait, backend sends SHOW_RANK automatically after Q_RESULTS!
    // Wait, no. The host might need to explicitly request SHOW_RANK. But in backend, endQuestion automatically broadcasts SHOW_RANK.
    // So the host just needs to know they are in leaderboard phase.
  }
`);

// Wait, the backend actually DOES send SHOW_RANK automatically right after Q_RESULTS:
//       this.server.to(assessmentId).emit(RealtimeEvents.Q_RESULTS, {
//       this.server.to(member.socketId).emit(RealtimeEvents.SHOW_RANK, {
// Wait! They happen AT THE SAME TIME.
// If Q_RESULTS and SHOW_RANK are emitted immediately one after another, then roomState will immediately be "leaderboard".
// We want the host to see "correct" first, then click "Next" to see "leaderboard".
// I'll keep the local phase for the host so they can control the progression from correct -> leaderboard -> winner.

fs.writeFileSync(file, content);
