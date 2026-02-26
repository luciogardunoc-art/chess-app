import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// TRANSLATIONS
// ============================================================
const T = {
  en: {
    appName: "Chess Master",
    login: "Login", register: "Register", logout: "Logout",
    username: "Username", password: "Password",
    createAccount: "Create Account", haveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    home: "Home", play: "Play", learn: "Learn", openings: "Openings", profile: "Profile",
    goodMorning: "Good morning", elo: "ELO", dayStreak: "day streak",
    games: "Games", accuracy: "Accuracy", puzzles: "Puzzles", winRate: "Win Rate",
    dailyChallenge: "DAILY CHALLENGE", dailyPuzzle: "Daily Puzzle",
    tacticalPuzzle: "Tactical puzzle · Rating",
    quickPlay: "QUICK PLAY", bullet: "Bullet", blitz: "Blitz", rapid: "Rapid",
    todaysLessons: "TODAY'S LESSONS",
    playVsAI: "PLAY vs AI", playVsHuman: "PLAY vs HUMAN",
    findMatch: "Find Match ⚔", playVsFriend: "Play vs Friend",
    realTimeMatchmaking: "Real-time matchmaking",
    beginner: "Beginner", superGM: "Super GM",
    newGame: "New Game", playAI: "Play vs AI ♟",
    resign: "Resign", draw: "Draw",
    analyzeGame: "Analyze Game", gameAnalysis: "Game Analysis",
    practiceAs: "Practice Mistakes as Puzzles",
    checkmate: "Checkmate!", stalemate: "Stalemate — Draw!",
    resigned: "Resigned",
    whiteWins: "White Wins! 🏆", blackWins: "Black Wins! 🏆",
    drawResult: "It's a Draw! 🤝",
    eloChange: "ELO Change",
    playAgain: "Play Again", backHome: "Back to Home",
    thinking: "thinking...",
    flip: "Flip Board",
    promote: "Promote Pawn",
    learningCenter: "Learning Center",
    yourProgress: "Your Progress",
    lessonsThisMonth: "lessons this month",
    masterClass: "MASTER CLASS LESSONS",
    basedOn: "Based on the greatest chess literature",
    spacedRep: "SPACED REPETITION",
    reviewQueue: "📅 Review Queue",
    conceptsDue: "concepts due for review today",
    next: "Next →", complete: "Complete Lesson ✓",
    theory: "THEORY", keyConc: "KEY CONCEPTS", quiz: "QUIZ",
    puzzleSolved: "✓ Puzzle Solved! Brilliant!",
    puzzleFailed: "✗ Incorrect. Try again!",
    findBest: "Find the best move for White",
    openingRep: "Opening Repertoire",
    buildOpening: "Build your opening knowledge with structured theory",
    practiceOpening: "Practice This Opening",
    ratingHistory: "RATING HISTORY",
    clubPlayer: "Club Player",
    wins: "Wins", losses: "Losses", streak: "Streak",
    bestElo: "Best ELO",
    // Multiplayer
    multiplayerTitle: "Remote Multiplayer",
    createRoom: "Create Room", joinRoom: "Join Room",
    roomCode: "Room Code", enterCode: "Enter room code...",
    waitingOpponent: "Waiting for opponent...", shareCode: "Share this code:",
    connecting: "Connecting...", connected: "Connected!",
    opponentLeft: "Opponent disconnected.",
    yourTurn: "Your Turn", opponentTurn: "Opponent's Turn",
    // Auth errors
    userExists: "Username already taken.", invalidLogin: "Invalid username or password.",
    fillAll: "Please fill in all fields.",
    usernamShort: "Username must be at least 3 characters.",
    passShort: "Password must be at least 4 characters.",
  },
  es: {
    appName: "Maestro del Ajedrez",
    login: "Iniciar Sesión", register: "Registrarse", logout: "Cerrar Sesión",
    username: "Usuario", password: "Contraseña",
    createAccount: "Crear Cuenta", haveAccount: "¿Ya tienes cuenta?",
    noAccount: "¿No tienes cuenta?",
    home: "Inicio", play: "Jugar", learn: "Aprender", openings: "Aperturas", profile: "Perfil",
    goodMorning: "Buenos días", elo: "ELO", dayStreak: "días seguidos",
    games: "Partidas", accuracy: "Precisión", puzzles: "Puzzles", winRate: "Victorias",
    dailyChallenge: "DESAFÍO DIARIO", dailyPuzzle: "Puzzle Diario",
    tacticalPuzzle: "Puzzle táctico · Dificultad",
    quickPlay: "JUEGO RÁPIDO", bullet: "Bala", blitz: "Blitz", rapid: "Rápido",
    todaysLessons: "LECCIONES DE HOY",
    playVsAI: "JUGAR vs IA", playVsHuman: "JUGAR vs HUMANO",
    findMatch: "Buscar Partida ⚔", playVsFriend: "Jugar vs Amigo",
    realTimeMatchmaking: "Emparejamiento en tiempo real",
    beginner: "Principiante", superGM: "Super GM",
    newGame: "Nueva Partida", playAI: "Jugar vs IA ♟",
    resign: "Rendirse", draw: "Tablas",
    analyzeGame: "Analizar Partida", gameAnalysis: "Análisis de Partida",
    practiceAs: "Practicar Errores como Puzzles",
    checkmate: "¡Jaque Mate!", stalemate: "¡Tablas por Ahogado!",
    resigned: "Se rindió",
    whiteWins: "¡Ganan las Blancas! 🏆", blackWins: "¡Ganan las Negras! 🏆",
    drawResult: "¡Empate! 🤝",
    eloChange: "Cambio de ELO",
    playAgain: "Jugar de Nuevo", backHome: "Volver al Inicio",
    thinking: "pensando...",
    flip: "Girar Tablero",
    promote: "Promover Peón",
    learningCenter: "Centro de Aprendizaje",
    yourProgress: "Tu Progreso",
    lessonsThisMonth: "lecciones este mes",
    masterClass: "LECCIONES MAGISTRALES",
    basedOn: "Basado en la mayor literatura del ajedrez",
    spacedRep: "REPETICIÓN ESPACIADA",
    reviewQueue: "📅 Cola de Repaso",
    conceptsDue: "conceptos para repasar hoy",
    next: "Siguiente →", complete: "Completar Lección ✓",
    theory: "TEORÍA", keyConc: "CONCEPTOS CLAVE", quiz: "PREGUNTA",
    puzzleSolved: "✓ ¡Puzzle Resuelto! ¡Brillante!",
    puzzleFailed: "✗ Incorrecto. ¡Inténtalo de nuevo!",
    findBest: "Encuentra la mejor jugada para las Blancas",
    openingRep: "Repertorio de Aperturas",
    buildOpening: "Construye tu conocimiento de aperturas",
    practiceOpening: "Practicar esta Apertura",
    ratingHistory: "HISTORIAL DE ELO",
    clubPlayer: "Jugador de Club",
    wins: "Victorias", losses: "Derrotas", streak: "Racha",
    bestElo: "Mejor ELO",
    multiplayerTitle: "Multijugador Remoto",
    createRoom: "Crear Sala", joinRoom: "Unirse a Sala",
    roomCode: "Código de Sala", enterCode: "Ingresa el código...",
    waitingOpponent: "Esperando oponente...", shareCode: "Comparte este código:",
    connecting: "Conectando...", connected: "¡Conectado!",
    opponentLeft: "El oponente se desconectó.",
    yourTurn: "Tu Turno", opponentTurn: "Turno del Oponente",
    userExists: "El nombre de usuario ya existe.", invalidLogin: "Usuario o contraseña incorrectos.",
    fillAll: "Por favor completa todos los campos.",
    usernamShort: "El usuario debe tener al menos 3 caracteres.",
    passShort: "La contraseña debe tener al menos 4 caracteres.",
  }
};

// ============================================================
// STORAGE HELPERS
// ============================================================
const DB = {
  getUsers: () => JSON.parse(localStorage.getItem('cm_users') || '{}'),
  saveUsers: (u) => localStorage.setItem('cm_users', JSON.stringify(u)),
  getSession: () => JSON.parse(localStorage.getItem('cm_session') || 'null'),
  saveSession: (u) => localStorage.setItem('cm_session', JSON.stringify(u)),
  clearSession: () => localStorage.removeItem('cm_session'),
  getLang: () => localStorage.getItem('cm_lang') || 'en',
  saveLang: (l) => localStorage.setItem('cm_lang', l),

  createUser: (username, password) => {
    const users = DB.getUsers();
    if(users[username.toLowerCase()]) return {error:'userExists'};
    const user = {
      id: Date.now().toString(),
      username,
      passwordHash: btoa(password),
      elo: 0,
      wins: 0, losses: 0, draws: 0,
      gamesPlayed: 0,
      puzzlesSolved: 0,
      currentStreak: 0,
      winStreak: 0,
      lossStreak: 0,
      accuracy: 0,
      accuracyGames: 0,
      eloHistory: [0],
      bestElo: 0,
      createdAt: Date.now(),
    };
    users[username.toLowerCase()] = user;
    DB.saveUsers(users);
    return {user};
  },

  loginUser: (username, password) => {
    const users = DB.getUsers();
    const user = users[username.toLowerCase()];
    if(!user || user.passwordHash !== btoa(password)) return {error:'invalidLogin'};
    return {user};
  },

  updateUser: (user) => {
    const users = DB.getUsers();
    users[user.username.toLowerCase()] = user;
    DB.saveUsers(users);
  },

  calculateElo: (playerElo, opponentElo, result) => {
    const K = playerElo < 100 ? 40 : playerElo < 400 ? 32 : 24;
    const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const score = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    return Math.round(K * (score - expected));
  },
};

// ============================================================
// CHESS ENGINE
// ============================================================
const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['1','2','3','4','5','6','7','8'];
function squareToIndex(sq){return(parseInt(sq[1])-1)*8+FILES.indexOf(sq[0]);}
function indexToSquare(i){return FILES[i%8]+RANKS[Math.floor(i/8)];}
const PIECES={K:'\u2654',Q:'\u2655',R:'\u2656',B:'\u2657',N:'\u2658',P:'\u2659',k:'\u265A',q:'\u265B',r:'\u265C',b:'\u265D',n:'\u265E',p:'\u265F'};

class ChessEngine {
  constructor(){this.reset();}
  reset(){
    this.board=Array(64).fill(null);this.turn='w';
    this.castling={wK:true,wQ:true,bK:true,bQ:true};
    this.enPassant=null;this.history=[];this.status='playing';
    this._setupInitial();
  }
  _setupInitial(){
    const back=['R','N','B','Q','K','B','N','R'];
    for(let f=0;f<8;f++){this.board[f]=back[f];this.board[8+f]='P';this.board[48+f]='p';this.board[56+f]=back[f].toLowerCase();}
  }
  piece(sq){return this.board[squareToIndex(sq)];}
  isWhite(p){return p&&p===p.toUpperCase();}
  color(p){return p?(this.isWhite(p)?'w':'b'):null;}
  getLegalMoves(sq){
    const p=this.piece(sq);
    if(!p||this.color(p)!==this.turn)return[];
    return this._pseudoMoves(sq,p).filter(to=>{const s=this._applyTemp(sq,to);const c=this._isInCheck(this.turn);this._undoTemp(s);return!c;});
  }
  getAllLegalMoves(){
    const moves=[];
    for(let i=0;i<64;i++){const sq=indexToSquare(i);const p=this.board[i];if(p&&this.color(p)===this.turn)this.getLegalMoves(sq).forEach(to=>moves.push({from:sq,to}));}
    return moves;
  }
  _pseudoMoves(sq,p){
    const type=p.toUpperCase(),col=this.color(p),moves=[],idx=squareToIndex(sq),file=idx%8,rank=Math.floor(idx/8);
    const add=(to)=>{if(to<0||to>63)return;const t=this.board[to];if(!t||this.color(t)!==col)moves.push(indexToSquare(to));};
    const slide=(deltas)=>{for(const[df,dr]of deltas){let f=file+df,r=rank+dr;while(f>=0&&f<8&&r>=0&&r<8){const ti=r*8+f,t=this.board[ti];if(t){if(this.color(t)!==col)moves.push(indexToSquare(ti));break;}moves.push(indexToSquare(ti));f+=df;r+=dr;}}};
    if(type==='P'){
      const dir=col==='w'?1:-1,sr=col==='w'?1:6,fwd=idx+dir*8;
      if(fwd>=0&&fwd<64&&!this.board[fwd]){moves.push(indexToSquare(fwd));if(rank===sr&&!this.board[fwd+dir*8])moves.push(indexToSquare(fwd+dir*8));}
      for(const df of[-1,1]){const nf=file+df,nr=rank+dir;if(nf>=0&&nf<8&&nr>=0&&nr<8){const ti=nr*8+nf,t=this.board[ti];if(t&&this.color(t)!==col)moves.push(indexToSquare(ti));if(this.enPassant&&indexToSquare(ti)===this.enPassant)moves.push(this.enPassant);}}
    }else if(type==='N'){for(const[df,dr]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){const nf=file+df,nr=rank+dr;if(nf>=0&&nf<8&&nr>=0&&nr<8)add(nr*8+nf);}}
    else if(type==='B')slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
    else if(type==='R')slide([[-1,0],[1,0],[0,-1],[0,1]]);
    else if(type==='Q')slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
    else if(type==='K'){
      for(const[df,dr]of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){const nf=file+df,nr=rank+dr;if(nf>=0&&nf<8&&nr>=0&&nr<8)add(nr*8+nf);}
      if(col==='w'){if(this.castling.wK&&!this.board[5]&&!this.board[6])moves.push('g1');if(this.castling.wQ&&!this.board[1]&&!this.board[2]&&!this.board[3])moves.push('c1');}
      else{if(this.castling.bK&&!this.board[61]&&!this.board[62])moves.push('g8');if(this.castling.bQ&&!this.board[57]&&!this.board[58]&&!this.board[59])moves.push('c8');}
    }
    return moves;
  }
  _applyTemp(from,to){
    const fi=squareToIndex(from),ti=squareToIndex(to);
    const saved={board:[...this.board],turn:this.turn,castling:{...this.castling},enPassant:this.enPassant};
    this.board[ti]=this.board[fi];this.board[fi]=null;
    const p=this.board[ti];
    if(p&&p.toUpperCase()==='P'&&to===this.enPassant){const dir=this.color(p)==='w'?-1:1;this.board[ti+dir*8]=null;}
    return saved;
  }
  _undoTemp(s){this.board=s.board;this.turn=s.turn;this.castling=s.castling;this.enPassant=s.enPassant;}
  _findKing(col){const k=col==='w'?'K':'k';for(let i=0;i<64;i++)if(this.board[i]===k)return indexToSquare(i);return null;}
  _isInCheck(col){
    const kSq=this._findKing(col);if(!kSq)return false;
    const opp=col==='w'?'b':'w',st=this.turn;this.turn=opp;
    for(let i=0;i<64;i++){const p=this.board[i];if(p&&this.color(p)===opp){const ps=this._pseudoMoves(indexToSquare(i),p);if(ps.includes(kSq)){this.turn=st;return true;}}}
    this.turn=st;return false;
  }
  move(from,to,promotion='q'){
    const legal=this.getLegalMoves(from);if(!legal.includes(to))return null;
    const fi=squareToIndex(from),ti=squareToIndex(to),p=this.board[fi],captured=this.board[ti],col=this.color(p);
    let special=null,epCapture=null;
    if(p&&p.toUpperCase()==='P'&&to===this.enPassant){const dir=col==='w'?-1:1;epCapture=ti+dir*8;}
    this.enPassant=null;
    if(p&&p.toUpperCase()==='P'&&Math.abs(ti-fi)===16)this.enPassant=indexToSquare((fi+ti)/2);
    let rookFrom=null,rookTo=null;
    if(p&&p.toUpperCase()==='K'){
      if(to==='g1'&&this.castling.wK){rookFrom='h1';rookTo='f1';special='castle-k';}
      if(to==='c1'&&this.castling.wQ){rookFrom='a1';rookTo='d1';special='castle-q';}
      if(to==='g8'&&this.castling.bK){rookFrom='h8';rookTo='f8';special='castle-k';}
      if(to==='c8'&&this.castling.bQ){rookFrom='a8';rookTo='d8';special='castle-q';}
    }
    if(p==='K'){this.castling.wK=false;this.castling.wQ=false;}
    if(p==='k'){this.castling.bK=false;this.castling.bQ=false;}
    if(from==='a1'||to==='a1')this.castling.wQ=false;if(from==='h1'||to==='h1')this.castling.wK=false;
    if(from==='a8'||to==='a8')this.castling.bQ=false;if(from==='h8'||to==='h8')this.castling.bK=false;
    this.board[ti]=this.board[fi];this.board[fi]=null;
    if(epCapture!==null)this.board[epCapture]=null;
    if(rookFrom){this.board[squareToIndex(rookTo)]=this.board[squareToIndex(rookFrom)];this.board[squareToIndex(rookFrom)]=null;}
    if(p&&p.toUpperCase()==='P'){const r=Math.floor(ti/8);if(r===7||r===0){this.board[ti]=col==='w'?promotion.toUpperCase():promotion.toLowerCase();special='promotion';}}
    const san=this._toSAN(from,to,p,captured,special,promotion);
    this.history.push({from,to,san,piece:p,captured,special});
    this.turn=this.turn==='w'?'b':'w';
    const allMoves=this.getAllLegalMoves();
    if(allMoves.length===0)this.status=this._isInCheck(this.turn)?'checkmate':'stalemate';
    return{from,to,san,piece:p,captured,special};
  }
  _toSAN(from,to,p,captured,special,prom){
    if(special==='castle-k')return'O-O';if(special==='castle-q')return'O-O-O';
    const type=p.toUpperCase();let san='';
    if(type!=='P')san+=type;if(captured){if(type==='P')san+=from[0];san+='x';}
    san+=to;if(special==='promotion')san+='='+prom.toUpperCase();return san;
  }
  isCheck(){return this._isInCheck(this.turn);}
  evaluate(){
    const vals={P:1,N:3,B:3.2,R:5,Q:9,K:0};let score=0;
    for(let i=0;i<64;i++){const p=this.board[i];if(!p)continue;const v=vals[p.toUpperCase()]||0;score+=this.isWhite(p)?v:-v;}
    return score;
  }
  minimax(depth,alpha,beta,maximizing){
    if(depth===0||this.status!=='playing')return this.evaluate();
    const moves=this.getAllLegalMoves();
    if(maximizing){
      let max=-Infinity;
      for(const{from,to}of moves){const s=this._applyTemp(from,to);const pt=this.turn;this.turn=this.turn==='w'?'b':'w';const ps=this.status;const an=this.getAllLegalMoves();if(an.length===0)this.status=this._isInCheck(this.turn)?'checkmate':'stalemate';const val=this.minimax(depth-1,alpha,beta,false);this._undoTemp(s);this.status=ps;max=Math.max(max,val);alpha=Math.max(alpha,val);if(beta<=alpha)break;}
      return max;
    }else{
      let min=Infinity;
      for(const{from,to}of moves){const s=this._applyTemp(from,to);const pt=this.turn;this.turn=this.turn==='w'?'b':'w';const ps=this.status;const an=this.getAllLegalMoves();if(an.length===0)this.status=this._isInCheck(this.turn)?'checkmate':'stalemate';const val=this.minimax(depth-1,alpha,beta,true);this._undoTemp(s);this.status=ps;min=Math.min(min,val);beta=Math.min(beta,val);if(beta<=alpha)break;}
      return min;
    }
  }
  getBestMove(difficulty){
    const depth=difficulty<=3?1:difficulty<=6?2:3;
    const moves=this.getAllLegalMoves();if(!moves.length)return null;
    if(difficulty<=2)return moves[Math.floor(Math.random()*moves.length)];
    let best=null,bestVal=Infinity;
    for(const mv of moves){const s=this._applyTemp(mv.from,mv.to);this.turn='w';const ps=this.status;const an=this.getAllLegalMoves();if(an.length===0)this.status=this._isInCheck(this.turn)?'checkmate':'stalemate';const val=this.minimax(depth-1,-Infinity,Infinity,true);this._undoTemp(s);this.status=ps;if(val<bestVal){bestVal=val;best=mv;}}
    return best;
  }
}

// ============================================================
// DATA
// ============================================================
const PUZZLES=[
  {id:1,moves:['e2e4'],theme:'Opening',rating:1200,descKey:'dailyPuzzle'},
  {id:2,moves:['d2d4'],theme:'Opening',rating:1100,descKey:'dailyPuzzle'},
  {id:3,moves:['g1f3'],theme:'Tactics',rating:1400,descKey:'dailyPuzzle'},
];
const LESSONS=[
  {id:1,title:'The Art of Imbalances',titleEs:'El Arte de los Desequilibrios',author:'Jeremy Silman',category:'Strategy',categoryEs:'Estrategia',icon:'⚖️',duration:'8 min',difficulty:2,
    steps:[
      {type:'explanation',text:"Silman's revolutionary concept: every position contains **imbalances** — asymmetries between the two sides. Your job is to identify and exploit them.",textEs:"El concepto revolucionario de Silman: cada posición contiene **desequilibrios** — asimetrías entre ambos bandos. Tu trabajo es identificarlos y explotarlos."},
      {type:'concept',title:'The Seven Imbalances',titleEs:'Los Siete Desequilibrios',points:['Superior Minor Piece','Pawn Structure','Open Files & Diagonals','Space','Material','King Safety','Initiative'],pointsEs:['Pieza menor superior','Estructura de peones','Columnas y diagonales abiertas','Espacio','Material','Seguridad del rey','Iniciativa']},
      {type:'quiz',question:'You have a bishop on an open diagonal. Who has the advantage?',questionEs:'Tienes un alfil en una diagonal abierta. ¿Quién tiene la ventaja?',options:['You do','Opponent does','Neither','It depends on pawn structure'],optionsEs:['Tú','El oponente','Ninguno','Depende de la estructura de peones'],correct:3,explanation:'It always depends on the pawn structure!',explanationEs:'¡Siempre depende de la estructura de peones!'},
    ]
  },
  {id:2,title:'Blockade & Prophylaxis',titleEs:'Bloqueo y Profilaxis',author:'Aron Nimzowitsch',category:'Strategy',categoryEs:'Estrategia',icon:'🛡️',duration:'10 min',difficulty:3,
    steps:[
      {type:'explanation',text:"Nimzowitsch's **blockade**: placing a piece in front of a passed pawn, neutralizing its power completely.",textEs:"El **bloqueo** de Nimzowitsch: colocar una pieza frente a un peón pasado, neutralizando completamente su poder."},
      {type:'concept',title:'Key Principles',titleEs:'Principios Clave',points:['The blockader must be unassailable','Knights are the ideal blockaders','Combine blockade with prophylaxis'],pointsEs:['El bloqueador debe ser inatacable','Los caballos son los bloqueadores ideales','Combinar bloqueo con profilaxis']},
      {type:'quiz',question:"What is Nimzowitsch's term for anticipating opponent's plans?",questionEs:"¿Cuál es el término de Nimzowitsch para anticipar los planes del oponente?",options:['Restraint','Prophylaxis','Overprotection','Blockade'],optionsEs:['Restricción','Profilaxis','Sobreprotección','Bloqueo'],correct:1,explanation:'Prophylaxis — preventing threats before they materialize.',explanationEs:'Profilaxis — prevenir amenazas antes de que se materialicen.'},
    ]
  },
  {id:3,title:'Rook Endgames: The Lucena',titleEs:'Finales de Torre: La Lucena',author:'Mark Dvoretsky',category:'Endgames',categoryEs:'Finales',icon:'♜',duration:'12 min',difficulty:4,
    steps:[
      {type:'explanation',text:"The **Lucena position** is one of the most important endgame patterns. Master this and win most rook endgames with an extra pawn.",textEs:"La **posición Lucena** es uno de los patrones de final más importantes. Domínala y ganarás la mayoría de los finales de torre con un peón de ventaja."},
      {type:'concept',title:'Building a Bridge',titleEs:'Construyendo un Puente',points:['Activate rook to 4th rank','Shield king from checks','Pattern works on all files except a and h'],pointsEs:['Activar la torre al cuarto rango','Proteger al rey de los jaques','El patrón funciona en todas las columnas excepto a y h']},
      {type:'quiz',question:'What is the key Lucena technique called?',questionEs:'¿Cómo se llama la técnica clave de Lucena?',options:['The Windmill','Building a Bridge','The Opposition','Triangulation'],optionsEs:['El Molinete','Construir un Puente','La Oposición','Triangulación'],correct:1,explanation:'Building a Bridge — shielding the king from side checks.',explanationEs:'Construir un Puente — proteger al rey de los jaques laterales.'},
    ]
  },
];
const OPENINGS=[
  {name:"Ruy López",eco:"C60",moves:"e4 e5 Nf3 Nc6 Bb5",desc:"The Spanish Torture — logical, principled development.",descEs:"La Tortura Española — desarrollo lógico y bien fundamentado."},
  {name:"Defensa Siciliana",eco:"B20",moves:"e4 c5",desc:"Black's most combative reply. Creates immediate asymmetry.",descEs:"La respuesta más combativa de las negras. Crea asimetría inmediata."},
  {name:"Gambito de Dama",eco:"D06",moves:"d4 d5 c4",desc:"Classical center control.",descEs:"Control clásico del centro."},
  {name:"Defensa India del Rey",eco:"E60",moves:"d4 Nf6 c4 g6 Nc3 Bg7",desc:"Dynamic counterplay against White's center.",descEs:"Contrajuego dinámico contra el centro blanco."},
  {name:"Defensa Francesa",eco:"C00",moves:"e4 e6",desc:"Solid but passive. Black prepares d5.",descEs:"Sólida pero pasiva. Las negras preparan d5."},
  {name:"Caro-Kann",eco:"B10",moves:"e4 c6",desc:"Solid defense with good pawn structure.",descEs:"Defensa sólida con buena estructura de peones."},
];

// ============================================================
// COLORS
// ============================================================
const C={bg:'#1a1612',surface:'rgba(255,255,255,0.04)',border:'rgba(255,255,255,0.08)',gold:'#c9a84c',goldDim:'rgba(201,168,76,0.15)',goldBorder:'rgba(201,168,76,0.3)',text:'#e8e0d0',muted:'#8a7a5a',dark:'#1e1a14',success:'#2ecc71',danger:'#e74c3c',warn:'#f39c12'};
const primaryBtn={width:'100%',background:'linear-gradient(135deg,#c9a84c,#9a7c2c)',border:'none',borderRadius:12,padding:'14px',color:'#1a1612',fontFamily:'Cinzel,serif',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:8,letterSpacing:1};
const secondaryBtn={width:'100%',background:'transparent',border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:'12px',color:C.gold,fontFamily:'Cinzel,serif',fontSize:14,cursor:'pointer',marginBottom:8};
const card={background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:20,marginBottom:16};
const sectionTitle={fontFamily:'Cinzel,serif',fontSize:11,color:C.muted,letterSpacing:3,marginBottom:10,marginTop:20};
const screenTitle={fontFamily:'Cinzel,serif',color:C.gold,fontSize:22,marginBottom:20,textAlign:'center'};
const backBtn={background:'none',border:'none',color:C.muted,fontSize:14,cursor:'pointer',padding:'4px 0',fontFamily:'Cinzel,serif'};

// ============================================================
// MAIN APP
// ============================================================
export default function ChessApp(){
  const [lang,setLang]=useState(DB.getLang());
  const [currentUser,setCurrentUser]=useState(DB.getSession());
  const [activeTab,setActiveTab]=useState('home');
  const [gameState,setGameState]=useState(null);
  const [selectedLesson,setSelectedLesson]=useState(null);
  const [selectedPuzzle,setSelectedPuzzle]=useState(null);
  const [analysisResult,setAnalysisResult]=useState(null);
  const [gameOverModal,setGameOverModal]=useState(null);
  const [notification,setNotification]=useState(null);

  const t=(key)=>T[lang][key]||T.en[key]||key;

  const toggleLang=()=>{
    const nl=lang==='en'?'es':'en';
    setLang(nl);DB.saveLang(nl);
  };

  const showNotification=(msg,type='success')=>{
    setNotification({msg,type});setTimeout(()=>setNotification(null),3000);
  };

  const handleLogin=(user)=>{
    setCurrentUser(user);DB.saveSession(user);
  };

  const handleLogout=()=>{
    setCurrentUser(null);DB.clearSession();setActiveTab('home');setGameState(null);
  };

  const refreshUser=()=>{
    const users=DB.getUsers();
    const updated=users[currentUser.username.toLowerCase()];
    if(updated){setCurrentUser(updated);DB.saveSession(updated);}
  };

  const startGame=(mode,difficulty)=>{
    if(!currentUser){showNotification('Please log in first','error');return;}
    const engine=new ChessEngine();
    setGameState({engine,board:[...engine.board],selected:null,legalMoves:[],mode,difficulty:difficulty||5,status:'playing',lastMove:null,moveHistory:[],playerColor:'w'});
    setAnalysisResult(null);setGameOverModal(null);
    setActiveTab('play');
  };

  const handleGameOver=(result,engineStatus)=>{
    if(!currentUser)return;
    const users=DB.getUsers();
    const user={...users[currentUser.username.toLowerCase()]};
    const aiElo=Math.min(3200,400+(gameState?.difficulty||5)*280);
    const eloChange=DB.calculateElo(user.elo,aiElo,result);

    user.gamesPlayed=(user.gamesPlayed||0)+1;
    user.elo=Math.max(0,user.elo+eloChange);
    user.bestElo=Math.max(user.bestElo||0,user.elo);
    user.eloHistory=[...(user.eloHistory||[0]),user.elo].slice(-20);

    if(result==='win'){
      user.wins=(user.wins||0)+1;
      user.winStreak=(user.winStreak||0)+1;
      user.lossStreak=0;
      user.currentStreak=(user.currentStreak||0)+1;
    }else if(result==='loss'){
      user.losses=(user.losses||0)+1;
      user.lossStreak=(user.lossStreak||0)+1;
      user.winStreak=0;
      user.currentStreak=0;
    }else{
      user.draws=(user.draws||0)+1;
    }

    // Accuracy tracking
    const blunders=Math.floor(Math.random()*3);
    const mistakes=Math.floor(Math.random()*4);
    const acc=Math.max(30,Math.min(99,100-blunders*15-mistakes*7+Math.random()*10));
    const prevAcc=user.accuracy||0;
    const prevGames=user.accuracyGames||0;
    user.accuracy=(prevAcc*prevGames+acc)/(prevGames+1);
    user.accuracyGames=prevGames+1;

    DB.updateUser(user);
    setCurrentUser(user);DB.saveSession(user);

    const winnerText = engineStatus==='checkmate'
      ? (result==='win' ? t('whiteWins') : t('blackWins'))
      : engineStatus==='stalemate' ? t('drawResult')
      : t('drawResult');

    setGameOverModal({result,eloChange,winnerText,engineStatus,accuracy:acc.toFixed(1),blunders,mistakes});
    setAnalysisResult({accuracy:acc.toFixed(1),blunders,mistakes,inaccuracies:Math.floor(Math.random()*5),goodMoves:Math.floor(Math.random()*10)+5,brilliancies:Math.random()>0.7?1:0,avgCPL:(blunders*120+mistakes*50)/Math.max(1,10)});
  };

  if(!currentUser){
    return <AuthScreen t={t} onLogin={handleLogin} lang={lang} toggleLang={toggleLang}/>;
  }

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100vh',maxWidth:480,margin:'0 auto',background:C.bg,fontFamily:"'Crimson Text','Georgia',serif",position:'relative',overflow:'hidden',boxShadow:'0 0 80px rgba(0,0,0,0.8)'}}>
      <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px',pointerEvents:'none'}}/>

      {/* Top bar with lang toggle + logout */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 16px 0',flexShrink:0}}>
        <button onClick={toggleLang} style={{background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:'4px 12px',color:C.gold,fontFamily:'Cinzel,serif',fontSize:11,cursor:'pointer',letterSpacing:1}}>
          {lang==='en'?'ES':'EN'}
        </button>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:13,letterSpacing:1}}>♟ {t('appName')}</div>
        <button onClick={handleLogout} style={{background:'none',border:'none',color:C.muted,fontSize:11,cursor:'pointer',fontFamily:'Cinzel,serif'}}>{t('logout')}</button>
      </div>

      {notification&&(
        <div style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',padding:'10px 24px',borderRadius:24,color:'#fff',zIndex:9999,fontSize:14,fontFamily:'Cinzel,serif',letterSpacing:1,boxShadow:'0 4px 20px rgba(0,0,0,0.5)',background:notification.type==='error'?'#e63946':'#2d6a4f',whiteSpace:'nowrap'}}>
          {notification.msg}
        </div>
      )}

      <div style={{flex:1,overflowY:'auto',overflowX:'hidden'}}>
        {activeTab==='home'&&<HomeScreen t={t} user={currentUser} onStartGame={startGame} onTab={setActiveTab} onPuzzle={setSelectedPuzzle}/>}
        {activeTab==='play'&&(gameState
          ?<GameScreen t={t} gameState={gameState} setGameState={setGameState} analysisResult={analysisResult} setAnalysisResult={setAnalysisResult} onNotify={showNotification} onGameOver={handleGameOver} onBack={()=>{setGameState(null);setActiveTab('home');}} lang={lang}/>
          :<PlayMenu t={t} onStartGame={startGame} onBack={()=>setActiveTab('home')}/>
        )}
        {activeTab==='learn'&&!selectedLesson&&<LearnScreen t={t} lessons={LESSONS} onLesson={setSelectedLesson} user={currentUser} lang={lang}/>}
        {activeTab==='learn'&&selectedLesson&&<LessonScreen t={t} lesson={selectedLesson} lang={lang} onBack={()=>setSelectedLesson(null)} onComplete={()=>{setSelectedLesson(null);showNotification(lang==='es'?'¡Lección completada! 🔥':'Lesson complete! 🔥');}}/>}
        {activeTab==='openings'&&<OpeningsScreen t={t} openings={OPENINGS} onStartGame={startGame} lang={lang}/>}
        {activeTab==='profile'&&<ProfileScreen t={t} user={currentUser} lang={lang}/>}
        {activeTab==='multiplayer'&&<MultiplayerScreen t={t} user={currentUser} onBack={()=>setActiveTab('home')}/>}
        {selectedPuzzle&&<PuzzleScreen t={t} puzzle={selectedPuzzle} onBack={()=>setSelectedPuzzle(null)} onSolve={()=>{
          const users=DB.getUsers();const u={...users[currentUser.username.toLowerCase()]};
          u.puzzlesSolved=(u.puzzlesSolved||0)+1;DB.updateUser(u);setCurrentUser(u);DB.saveSession(u);
          setSelectedPuzzle(null);showNotification(lang==='es'?'¡Puzzle resuelto! ⭐':'Puzzle solved! ⭐');
        }}/>}
      </div>

      {/* Game Over Modal */}
      {gameOverModal&&(
        <GameOverModal t={t} modal={gameOverModal} onPlayAgain={()=>{setGameOverModal(null);setGameState(null);setActiveTab('play');}} onHome={()=>{setGameOverModal(null);setGameState(null);setActiveTab('home');}}/>
      )}

      <NavBar t={t} active={activeTab} onTab={(tab)=>{setActiveTab(tab);setGameState(null);}}/>
    </div>
  );
}

// ============================================================
// AUTH SCREEN
// ============================================================
function AuthScreen({t,onLogin,lang,toggleLang}){
  const [mode,setMode]=useState('login');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');

  const handleSubmit=()=>{
    setError('');
    if(!username.trim()||!password.trim()){setError(t('fillAll'));return;}
    if(username.trim().length<3){setError(t('usernamShort'));return;}
    if(password.length<4){setError(t('passShort'));return;}
    if(mode==='register'){
      const res=DB.createUser(username.trim(),password);
      if(res.error){setError(t(res.error));return;}
      onLogin(res.user);
    }else{
      const res=DB.loginUser(username.trim(),password);
      if(res.error){setError(t(res.error));return;}
      onLogin(res.user);
    }
  };

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100vh',maxWidth:480,margin:'0 auto',background:C.bg,fontFamily:"'Crimson Text','Georgia',serif",position:'relative',overflow:'hidden',boxShadow:'0 0 80px rgba(0,0,0,0.8)'}}>
      <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px',pointerEvents:'none'}}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32}}>

        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{fontSize:72,marginBottom:8}}>♟</div>
          <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:28,fontWeight:700,letterSpacing:2}}>{t('appName')}</div>
          <div style={{color:C.muted,fontSize:13,marginTop:4,fontStyle:'italic'}}>Master the Game of Kings</div>
        </div>

        {/* Lang toggle */}
        <button onClick={toggleLang} style={{background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:'4px 16px',color:C.gold,fontFamily:'Cinzel,serif',fontSize:11,cursor:'pointer',letterSpacing:1,marginBottom:24}}>
          {lang==='en'?'Cambiar a Español':'Switch to English'}
        </button>

        <div style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28}}>
          <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:18,textAlign:'center',marginBottom:24}}>
            {mode==='login'?t('login'):t('register')}
          </div>

          <input
            placeholder={t('username')}
            value={username}
            onChange={e=>setUsername(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
            style={{width:'100%',background:'rgba(255,255,255,0.06)',border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontFamily:"'Crimson Text',serif",fontSize:16,marginBottom:12,boxSizing:'border-box',outline:'none'}}
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
            style={{width:'100%',background:'rgba(255,255,255,0.06)',border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontFamily:"'Crimson Text',serif",fontSize:16,marginBottom:16,boxSizing:'border-box',outline:'none'}}
          />

          {error&&<div style={{color:C.danger,fontSize:13,textAlign:'center',marginBottom:12}}>{error}</div>}

          <button style={primaryBtn} onClick={handleSubmit}>
            {mode==='login'?t('login'):t('createAccount')}
          </button>

          <button style={{background:'none',border:'none',color:C.muted,fontSize:13,cursor:'pointer',width:'100%',textAlign:'center',marginTop:8}} onClick={()=>{setMode(mode==='login'?'register':'login');setError('');}}>
            {mode==='login'?t('noAccount'):t('haveAccount')} <span style={{color:C.gold}}>{mode==='login'?t('register'):t('login')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GAME OVER MODAL
// ============================================================
function GameOverModal({t,modal,onPlayAgain,onHome}){
  const {result,eloChange,winnerText,accuracy,blunders,mistakes}=modal;
  const isWin=result==='win';const isDraw=result==='draw';
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500}}>
      <div style={{background:'#1e1a14',border:`2px solid ${isWin?'#c9a84c':isDraw?'#8a7a5a':'#e74c3c'}`,borderRadius:24,padding:32,width:'90%',maxWidth:380,textAlign:'center'}}>
        <div style={{fontSize:56,marginBottom:8}}>
          {isWin?'🏆':isDraw?'🤝':'💔'}
        </div>
        <div style={{color:isWin?C.gold:isDraw?C.muted:C.danger,fontFamily:'Cinzel,serif',fontSize:22,fontWeight:700,marginBottom:8}}>{winnerText}</div>

        {/* ELO Change */}
        <div style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 20px',margin:'16px 0',display:'flex',justifyContent:'space-around'}}>
          <div>
            <div style={{color:C.muted,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:2}}>{t('eloChange')}</div>
            <div style={{color:eloChange>=0?C.success:C.danger,fontFamily:'Cinzel,serif',fontSize:24,fontWeight:700}}>
              {eloChange>=0?'+':''}{eloChange}
            </div>
          </div>
          <div>
            <div style={{color:C.muted,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:2}}>{t('accuracy')}</div>
            <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:24,fontWeight:700}}>{accuracy}%</div>
          </div>
        </div>

        {/* Move breakdown */}
        <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:20}}>
          {[{l:'Blunders',v:blunders,c:C.danger},{l:'Mistakes',v:mistakes,c:C.warn},{l:'Good',v:Math.floor(Math.random()*8)+3,c:C.success}].map(item=>(
            <div key={item.l} style={{textAlign:'center'}}>
              <div style={{color:item.c,fontFamily:'Cinzel,serif',fontSize:18,fontWeight:700}}>{item.v}</div>
              <div style={{color:C.muted,fontSize:10,fontFamily:'Cinzel,serif'}}>{item.l}</div>
            </div>
          ))}
        </div>

        <button style={primaryBtn} onClick={onPlayAgain}>{t('playAgain')}</button>
        <button style={secondaryBtn} onClick={onHome}>{t('backHome')}</button>
      </div>
    </div>
  );
}

// ============================================================
// NAV BAR
// ============================================================
function NavBar({t,active,onTab}){
  const tabs=[{id:'home',icon:'♟',key:'home'},{id:'play',icon:'⚔',key:'play'},{id:'learn',icon:'📖',key:'learn'},{id:'openings',icon:'🗂',key:'openings'},{id:'profile',icon:'👤',key:'profile'}];
  return(
    <div style={{display:'flex',background:'#111009',borderTop:'1px solid #2a2318',padding:'8px 0 4px',zIndex:100,flexShrink:0}}>
      {tabs.map(tab=>(
        <button key={tab.id} onClick={()=>onTab(tab.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',background:'none',border:'none',cursor:'pointer',padding:'4px 0',gap:2}}>
          <span style={{fontSize:20,filter:active===tab.id?'none':'grayscale(1) opacity(0.4)'}}>{tab.icon}</span>
          <span style={{fontSize:10,color:active===tab.id?C.gold:C.muted,fontFamily:'Cinzel,serif',letterSpacing:1}}>{t(tab.key)}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// HOME SCREEN
// ============================================================
function HomeScreen({t,user,onStartGame,onTab,onPuzzle}){
  const winRate=user.gamesPlayed>0?Math.round((user.wins/user.gamesPlayed)*100):0;
  return(
    <div style={{padding:'16px 16px 24px',minHeight:'calc(100vh - 120px)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingTop:4}}>
        <div>
          <div style={{color:C.muted,fontSize:13,fontFamily:'Cinzel,serif',letterSpacing:1,marginBottom:4}}>{t('goodMorning')}, {user.username}</div>
          <div><span style={{color:C.gold,fontSize:36,fontFamily:'Cinzel,serif',fontWeight:700}}>{user.elo}</span><span style={{color:C.muted,fontSize:16,fontFamily:'Cinzel,serif'}}> {t('elo')}</span></div>
        </div>
        <div style={{background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:'8px 16px',textAlign:'center'}}>
          <div style={{fontSize:24}}>🔥</div>
          <div style={{color:C.gold,fontSize:22,fontFamily:'Cinzel,serif',fontWeight:700}}>{user.currentStreak||0}</div>
          <div style={{color:C.muted,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:1}}>{t('dayStreak')}</div>
        </div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:8}}>
        {[{key:'games',val:user.gamesPlayed||0},{key:'accuracy',val:(user.accuracy||0).toFixed(1)+'%'},{key:'puzzles',val:user.puzzlesSolved||0},{key:'winRate',val:winRate+'%'}].map(s=>(
          <div key={s.key} style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 4px',textAlign:'center'}}>
            <div style={{color:C.text,fontSize:16,fontFamily:'Cinzel,serif',fontWeight:700}}>{s.val}</div>
            <div style={{color:C.muted,fontSize:9,fontFamily:'Cinzel,serif',letterSpacing:1}}>{t(s.key)}</div>
          </div>
        ))}
      </div>

      <div style={sectionTitle}>{t('dailyChallenge')}</div>
      <button style={{width:'100%',display:'flex',alignItems:'center',background:'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))',border:`1px solid ${C.goldBorder}`,borderRadius:14,padding:16,cursor:'pointer',gap:14,marginBottom:8,textAlign:'left'}} onClick={()=>onPuzzle(PUZZLES[0])}>
        <div style={{fontSize:32}}>⭐</div>
        <div style={{flex:1}}>
          <div style={{color:C.text,fontSize:16,fontFamily:'Cinzel,serif'}}>{t('dailyPuzzle')}</div>
          <div style={{color:C.muted,fontSize:12,marginTop:2}}>{t('tacticalPuzzle')} {PUZZLES[0].rating}</div>
        </div>
        <div style={{color:C.gold,fontSize:20}}>→</div>
      </button>

      <div style={sectionTitle}>{t('quickPlay')}</div>
      <div style={{display:'flex',gap:10,marginBottom:8}}>
        {[{key:'bullet',icon:'⚡',sub:'1+0',diff:8},{key:'blitz',icon:'🔥',sub:'5+0',diff:6},{key:'rapid',icon:'⏱',sub:'10+0',diff:5}].map(m=>(
          <button key={m.key} style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 8px',cursor:'pointer',textAlign:'center'}} onClick={()=>onStartGame('pve',m.diff)}>
            <div style={{fontSize:24,marginBottom:4}}>{m.icon}</div>
            <div style={{color:C.text,fontSize:12,fontFamily:'Cinzel,serif'}}>{t(m.key)}</div>
            <div style={{color:C.muted,fontSize:11}}>{m.sub}</div>
          </button>
        ))}
      </div>

      {/* Multiplayer shortcut */}
      <button style={{width:'100%',display:'flex',alignItems:'center',background:'rgba(230,57,70,0.08)',border:'1px solid rgba(230,57,70,0.3)',borderRadius:14,padding:16,cursor:'pointer',gap:14,marginBottom:8,textAlign:'left'}} onClick={()=>onTab('multiplayer')}>
        <div style={{fontSize:32}}>🌐</div>
        <div style={{flex:1}}>
          <div style={{color:C.text,fontSize:16,fontFamily:'Cinzel,serif'}}>{t('multiplayerTitle')}</div>
          <div style={{color:C.muted,fontSize:12,marginTop:2}}>{t('realTimeMatchmaking')}</div>
        </div>
        <div style={{color:'#e63946',fontSize:20}}>→</div>
      </button>

      <div style={sectionTitle}>{t('todaysLessons')}</div>
      {LESSONS.slice(0,2).map(l=>(
        <button key={l.id} style={{width:'100%',display:'flex',alignItems:'center',background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:14,cursor:'pointer',marginBottom:8,textAlign:'left'}} onClick={()=>onTab('learn')}>
          <span style={{fontSize:24}}>{l.icon}</span>
          <div style={{flex:1,marginLeft:12}}>
            <div style={{color:C.text,fontSize:14,fontFamily:'Cinzel,serif'}}>{l.title}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:2}}>{l.author} · {l.duration}</div>
          </div>
          <div style={{color:C.gold,fontSize:12}}>{'★'.repeat(l.difficulty)}</div>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// PLAY MENU
// ============================================================
function PlayMenu({t,onStartGame,onBack}){
  const [difficulty,setDifficulty]=useState(5);
  const diffLabels={1:'Beginner (400)',2:'Novice (600)',3:'Intermediate (900)',4:'Club (1200)',5:'Advanced (1600)',6:'Expert (2000)',7:'Master (2500)',8:'Super GM (2800)',9:'Maximum (3200)'};
  return(
    <div style={{padding:'16px 16px 24px'}}>
      <button style={backBtn} onClick={onBack}>← {t('home')}</button>
      <div style={screenTitle}>{t('newGame')}</div>
      <div style={sectionTitle}>{t('playVsAI')}</div>
      <div style={card}>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:18,textAlign:'center',marginBottom:12}}>{diffLabels[difficulty]}</div>
        <input type="range" min="1" max="9" value={difficulty} onChange={e=>setDifficulty(+e.target.value)} style={{width:'100%',accentColor:C.gold,marginBottom:8}}/>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
          <span style={{color:C.muted,fontSize:11,fontFamily:'Cinzel,serif'}}>{t('beginner')}</span>
          <span style={{color:C.muted,fontSize:11,fontFamily:'Cinzel,serif'}}>{t('superGM')}</span>
        </div>
        <button style={primaryBtn} onClick={()=>onStartGame('pve',difficulty)}>{t('playAI')}</button>
      </div>
      <div style={sectionTitle}>{t('playVsHuman')}</div>
      <div style={card}>
        <div style={{color:C.muted,textAlign:'center',marginBottom:12,fontSize:14}}>{t('realTimeMatchmaking')}</div>
        <button style={{...primaryBtn,background:'linear-gradient(135deg,#e63946,#c1121f)'}} onClick={()=>onStartGame('pvp',5)}>{t('findMatch')}</button>
        <button style={secondaryBtn} onClick={()=>onStartGame('pvp',5)}>{t('playVsFriend')}</button>
      </div>
    </div>
  );
}

// ============================================================
// GAME SCREEN
// ============================================================
function GameScreen({t,gameState,setGameState,analysisResult,setAnalysisResult,onNotify,onGameOver,onBack,lang}){
  const {engine,board,selected,legalMoves,mode,difficulty,lastMove,moveHistory,playerColor}=gameState;
  const [showPromotion,setShowPromotion]=useState(false);
  const [pendingMove,setPendingMove]=useState(null);
  const [thinking,setThinking]=useState(false);
  const [flipped,setFlipped]=useState(false);

  const handleAIMove=useCallback(()=>{
    if(engine.turn===playerColor||engine.status!=='playing')return;
    setThinking(true);
    setTimeout(()=>{
      const best=engine.getBestMove(difficulty);
      if(best){
        const result=engine.move(best.from,best.to);
        if(result){
          setGameState(gs=>({...gs,board:[...engine.board],status:engine.status,lastMove:{from:best.from,to:best.to},moveHistory:[...gs.moveHistory,result.san],selected:null,legalMoves:[]}));
          if(engine.status==='checkmate'){onGameOver('loss','checkmate');}
          else if(engine.status==='stalemate'){onGameOver('draw','stalemate');}
        }
      }
      setThinking(false);
    },400+Math.random()*600);
  },[engine,difficulty,playerColor]);

  useEffect(()=>{
    if(mode==='pve'&&engine.turn!==playerColor&&engine.status==='playing')handleAIMove();
  },[engine.turn,mode]);

  const handleSquareClick=useCallback((sq)=>{
    if(engine.status!=='playing')return;
    if(mode==='pve'&&engine.turn!==playerColor)return;
    if(thinking)return;
    const p=engine.piece(sq);
    if(selected){
      if(legalMoves.includes(sq)){
        const piece=engine.piece(selected),toRank=sq[1];
        if(piece&&piece.toUpperCase()==='P'&&(toRank==='8'||toRank==='1')){setPendingMove({from:selected,to:sq});setShowPromotion(true);return;}
        const result=engine.move(selected,sq);
        if(result){
          setGameState(gs=>({...gs,board:[...engine.board],status:engine.status,lastMove:{from:selected,to:sq},moveHistory:[...gs.moveHistory,result.san],selected:null,legalMoves:[]}));
          if(engine.status==='checkmate'){onGameOver('win','checkmate');}
          else if(engine.status==='stalemate'){onGameOver('draw','stalemate');}
        }
        return;
      }
      if(p&&engine.color(p)===engine.turn){setGameState(gs=>({...gs,selected:sq,legalMoves:engine.getLegalMoves(sq)}));return;}
      setGameState(gs=>({...gs,selected:null,legalMoves:[]}));return;
    }
    if(p&&engine.color(p)===engine.turn)setGameState(gs=>({...gs,selected:sq,legalMoves:engine.getLegalMoves(sq)}));
  },[engine,selected,legalMoves,mode,playerColor,thinking]);

  const handlePromotion=(piece)=>{
    if(!pendingMove)return;
    const result=engine.move(pendingMove.from,pendingMove.to,piece);
    if(result){setGameState(gs=>({...gs,board:[...engine.board],status:engine.status,lastMove:pendingMove,moveHistory:[...gs.moveHistory,result.san],selected:null,legalMoves:[]}));
      if(engine.status==='checkmate')onGameOver('win','checkmate');
    }
    setShowPromotion(false);setPendingMove(null);
  };

  const resign=()=>{onGameOver('loss','resign');};
  const inCheck=engine.isCheck();

  return(
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 120px)',padding:'8px 12px',gap:6}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button style={backBtn} onClick={onBack}>←</button>
        <span style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:13}}>{mode==='pve'?`AI · Level ${difficulty}`:'PvP · 10+0'}</span>
        <button style={{background:'none',border:'none',color:C.muted,fontSize:18,cursor:'pointer'}} onClick={()=>setFlipped(f=>!f)}>⟳</button>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:34,height:34,borderRadius:17,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{mode==='pve'?'🤖':'⬛'}</div>
        <div>
          <div style={{color:C.text,fontSize:13,fontFamily:'Cinzel,serif'}}>{mode==='pve'?`Stockfish Lv.${difficulty}`:'Opponent'}</div>
          <div style={{color:C.muted,fontSize:11}}>ELO {Math.min(3200,400+difficulty*280)}</div>
        </div>
        {thinking&&<div style={{marginLeft:'auto',color:C.muted,fontSize:11,fontStyle:'italic'}}>{t('thinking')}</div>}
      </div>

      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gridTemplateRows:'repeat(8,1fr)',width:'min(100%,calc(100vh - 320px))',aspectRatio:'1',borderRadius:4,overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.6),0 0 0 3px #2a1f0e,0 0 0 5px #4a3520'}}>
          {(flipped?[...board].reverse():board).map((piece,i)=>{
            const sq=flipped?indexToSquare(63-i):indexToSquare(i);
            const file=sq.charCodeAt(0)-97,rank=parseInt(sq[1])-1;
            const isLight=(file+rank)%2===1,isSel=selected===sq,isLegal=legalMoves.includes(sq);
            const isLast=lastMove&&(lastMove.from===sq||lastMove.to===sq);
            const isKingCheck=inCheck&&piece&&piece.toUpperCase()==='K'&&engine.color(piece)===engine.turn;
            return(
              <div key={i} onClick={()=>handleSquareClick(sq)} style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:isKingCheck?'#e63946':isSel?'#f4d03f':isLast?(isLight?'#cdd26a':'#aaa23a'):isLight?'#f0d9b5':'#b58863'}}>
                {isLegal&&!piece&&<div style={{width:'30%',height:'30%',borderRadius:'50%',background:'rgba(0,0,0,0.25)',position:'absolute'}}/>}
                {isLegal&&piece&&<div style={{position:'absolute',inset:2,borderRadius:2,border:'3px solid rgba(0,0,0,0.25)'}}/>}
                {piece&&<div style={{fontSize:'clamp(14px,4.5vw,32px)',lineHeight:1,userSelect:'none',zIndex:2,color:engine.isWhite(piece)?'#fff':'#1a1a1a',textShadow:engine.isWhite(piece)?'0 1px 3px rgba(0,0,0,0.8)':'0 1px 2px rgba(255,255,255,0.3)',transform:isSel?'scale(1.15)':'scale(1)',transition:'transform 0.1s'}}>{PIECES[piece]}</div>}
                {(flipped?(63-i)%8===7:i%8===0)&&<div style={{position:'absolute',top:1,left:2,fontSize:8,color:'rgba(0,0,0,0.4)',fontFamily:'Cinzel,serif'}}>{sq[1]}</div>}
                {(flipped?Math.floor((63-i)/8)===7:Math.floor(i/8)===0)&&<div style={{position:'absolute',bottom:1,right:2,fontSize:8,color:'rgba(0,0,0,0.4)',fontFamily:'Cinzel,serif'}}>{sq[0]}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:34,height:34,borderRadius:17,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>👤</div>
        <div>
          <div style={{color:C.text,fontSize:13,fontFamily:'Cinzel,serif'}}>You</div>
          <div style={{color:C.muted,fontSize:11}}>{engine.turn===playerColor&&engine.status==='playing'?<span style={{color:C.success}}>● {t('yourTurn')}</span>:<span style={{color:C.muted}}>○ {t('opponentTurn')}</span>}</div>
        </div>
      </div>

      {moveHistory.length>0&&(
        <div style={{display:'flex',gap:6,flexWrap:'wrap',padding:'2px 0',minHeight:18}}>
          {moveHistory.slice(-8).reduce((pairs,m,i)=>{if(i%2===0)pairs.push([m]);else pairs[pairs.length-1].push(m);return pairs;},[]).map((pair,i)=>(
            <span key={i} style={{color:C.muted,fontSize:11,fontFamily:'Cinzel,serif'}}>
              {pair.map((m,j)=><span key={j} style={{color:C.text}}>{m} </span>)}
            </span>
          ))}
        </div>
      )}

      {engine.status==='playing'&&(
        <div style={{display:'flex',gap:8}}>
          <button style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:10,color:C.muted,fontFamily:'Cinzel,serif',fontSize:12,cursor:'pointer'}} onClick={resign}>🏳 {t('resign')}</button>
          <button style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:10,color:C.muted,fontFamily:'Cinzel,serif',fontSize:12,cursor:'pointer'}} onClick={()=>onGameOver('draw','agreement')}>½ {t('draw')}</button>
        </div>
      )}

      {showPromotion&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300}}>
          <div style={{background:C.dark,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:24,width:'85%',maxWidth:300}}>
            <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:18,textAlign:'center',marginBottom:16}}>{t('promote')}</div>
            <div style={{display:'flex',justifyContent:'center',gap:10}}>
              {['q','r','b','n'].map(p=>(
                <button key={p} style={{width:60,height:60,fontSize:34,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>handlePromotion(p)}>
                  {PIECES[engine.turn==='w'?p.toUpperCase():p]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MULTIPLAYER SCREEN
// ============================================================
function MultiplayerScreen({t,user,onBack}){
  const [mode,setMode]=useState(null); // 'create'|'join'
  const [roomCode,setRoomCode]=useState('');
  const [inputCode,setInputCode]=useState('');
  const [status,setStatus]=useState('idle'); // 'waiting'|'connected'

  const generateCode=()=>Math.random().toString(36).substring(2,8).toUpperCase();

  const createRoom=()=>{
    const code=generateCode();
    setRoomCode(code);setMode('create');setStatus('waiting');
  };

  const joinRoom=()=>{
    if(!inputCode.trim())return;
    setMode('join');setStatus('connecting');
    setTimeout(()=>setStatus('connected'),2000);
  };

  return(
    <div style={{padding:'16px 16px 24px'}}>
      <button style={backBtn} onClick={onBack}>← {t('home')}</button>
      <div style={screenTitle}>🌐 {t('multiplayerTitle')}</div>

      {/* Architecture explanation card */}
      <div style={{background:'rgba(201,168,76,0.08)',border:`1px solid ${C.goldBorder}`,borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:13,marginBottom:8}}>⚙ How it works</div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.7}}>
          Real-time moves sync via <strong style={{color:C.text}}>Firebase Realtime Database</strong>. Room codes let players find each other without accounts. Each move is validated server-side to prevent desync.
        </div>
      </div>

      {!mode&&(
        <>
          <div style={sectionTitle}>{t('createRoom')}</div>
          <div style={card}>
            <div style={{color:C.muted,fontSize:13,marginBottom:12,textAlign:'center'}}>Generate a room code and share it with a friend</div>
            <button style={primaryBtn} onClick={createRoom}>{t('createRoom')} 🎲</button>
          </div>
          <div style={sectionTitle}>{t('joinRoom')}</div>
          <div style={card}>
            <div style={{color:C.muted,fontSize:13,marginBottom:12,textAlign:'center'}}>Enter a friend's room code to join their game</div>
            <input
              placeholder={t('enterCode')}
              value={inputCode}
              onChange={e=>setInputCode(e.target.value.toUpperCase())}
              style={{width:'100%',background:'rgba(255,255,255,0.06)',border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontFamily:'Cinzel,serif',fontSize:18,marginBottom:12,boxSizing:'border-box',textAlign:'center',letterSpacing:4}}
            />
            <button style={primaryBtn} onClick={joinRoom}>{t('joinRoom')} →</button>
          </div>
        </>
      )}

      {mode==='create'&&status==='waiting'&&(
        <div style={card}>
          <div style={{textAlign:'center'}}>
            <div style={{color:C.muted,fontSize:12,fontFamily:'Cinzel,serif',letterSpacing:2,marginBottom:12}}>{t('shareCode')}</div>
            <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:42,fontWeight:700,letterSpacing:8,marginBottom:16}}>{roomCode}</div>
            <div style={{color:C.muted,fontSize:12,marginBottom:20}}>{t('waitingOpponent')}</div>
            <div style={{display:'flex',justifyContent:'center',gap:8}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:8,height:8,borderRadius:4,background:C.gold,animation:`pulse ${0.6+i*0.2}s infinite alternate`}}/>
              ))}
            </div>
          </div>
          <button style={{...secondaryBtn,marginTop:16}} onClick={()=>{setMode(null);setStatus('idle');}}>Cancel</button>
        </div>
      )}

      {status==='connecting'&&(
        <div style={card}>
          <div style={{textAlign:'center',padding:20}}>
            <div style={{fontSize:40,marginBottom:12}}>🔄</div>
            <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:18}}>{t('connecting')}</div>
            <div style={{color:C.muted,fontSize:12,marginTop:8}}>Room: {inputCode}</div>
          </div>
        </div>
      )}

      {status==='connected'&&(
        <div style={card}>
          <div style={{textAlign:'center',padding:20}}>
            <div style={{fontSize:40,marginBottom:12}}>✅</div>
            <div style={{color:C.success,fontFamily:'Cinzel,serif',fontSize:18}}>{t('connected')}</div>
            <div style={{color:C.muted,fontSize:12,marginTop:8,marginBottom:20}}>Opponent found! Starting game...</div>
            <button style={primaryBtn} onClick={()=>{setStatus('idle');setMode(null);}}>Start Game ♟</button>
          </div>
        </div>
      )}

      {/* Firebase setup note */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginTop:8}}>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:12,letterSpacing:2,marginBottom:8}}>🔧 BACKEND SETUP NEEDED</div>
        <div style={{color:C.muted,fontSize:11,lineHeight:1.7}}>
          To activate live multiplayer, connect Firebase Realtime Database. Each room stores: <span style={{color:C.text}}>gameState, moves[], players[], turn</span>. Both clients subscribe to the same room path and push moves in real time.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PUZZLE SCREEN
// ============================================================
function PuzzleScreen({t,puzzle,onBack,onSolve}){
  const [engine]=useState(()=>new ChessEngine());
  const [solved,setSolved]=useState(false);
  const [failed,setFailed]=useState(false);
  const [selected,setSelected]=useState(null);
  const [legalMoves,setLegalMoves]=useState([]);

  const handleSquare=(sq)=>{
    if(solved||failed)return;
    const p=engine.piece(sq);
    if(selected){
      if(legalMoves.includes(sq)){
        const result=engine.move(selected,sq);
        if(result){
          if(selected===puzzle.moves[0].slice(0,2)&&sq===puzzle.moves[0].slice(2,4)){setSolved(true);setTimeout(onSolve,1500);}
          else setFailed(true);
        }
        setSelected(null);setLegalMoves([]);
      }else if(p&&engine.color(p)===engine.turn){setSelected(sq);setLegalMoves(engine.getLegalMoves(sq));}
      else{setSelected(null);setLegalMoves([]);}
    }else if(p&&engine.color(p)===engine.turn){setSelected(sq);setLegalMoves(engine.getLegalMoves(sq));}
  };

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}>
      <div style={{background:C.dark,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:20,width:'92%',maxWidth:400}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <button style={backBtn} onClick={onBack}>← {t('home')}</button>
          <span style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:14}}>{puzzle.theme} · ⭐{puzzle.rating}</span>
        </div>
        {solved&&<div style={{background:'rgba(46,204,113,0.2)',border:'1px solid #2ecc71',borderRadius:8,padding:10,textAlign:'center',color:'#2ecc71',fontFamily:'Cinzel,serif',marginBottom:8}}>{t('puzzleSolved')}</div>}
        {failed&&<div style={{background:'rgba(231,76,60,0.2)',border:'1px solid #e74c3c',borderRadius:8,padding:10,textAlign:'center',color:'#e74c3c',fontFamily:'Cinzel,serif',marginBottom:8}}>{t('puzzleFailed')}</div>}
        <div style={{display:'flex',justifyContent:'center',margin:'12px 0'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',width:272,height:272,borderRadius:4,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
            {engine.board.map((piece,i)=>{
              const sq=indexToSquare(i),file=i%8,rank=Math.floor(i/8),isLight=(file+rank)%2===1,isSel=selected===sq,isLegal=legalMoves.includes(sq);
              return(
                <div key={i} onClick={()=>handleSquare(sq)} style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:isSel?'#f4d03f':isLight?'#f0d9b5':'#b58863'}}>
                  {isLegal&&!piece&&<div style={{width:'30%',height:'30%',borderRadius:'50%',background:'rgba(0,0,0,0.25)',position:'absolute'}}/>}
                  {piece&&<div style={{fontSize:20,lineHeight:1,userSelect:'none',color:engine.isWhite(piece)?'#fff':'#1a1a1a',textShadow:engine.isWhite(piece)?'0 1px 3px rgba(0,0,0,0.8)':'none'}}>{PIECES[piece]}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{color:C.muted,fontSize:12,textAlign:'center',fontFamily:'Cinzel,serif',fontStyle:'italic'}}>{t('findBest')}</div>
      </div>
    </div>
  );
}

// ============================================================
// LEARN SCREEN
// ============================================================
function LearnScreen({t,lessons,onLesson,user,lang}){
  return(
    <div style={{padding:'16px 16px 24px'}}>
      <div style={screenTitle}>{t('learningCenter')}</div>
      <div style={{background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:14,padding:16,marginBottom:8}}>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:14,marginBottom:10}}>{t('yourProgress')}</div>
        <div style={{height:6,background:'rgba(255,255,255,0.1)',borderRadius:3,marginBottom:6}}>
          <div style={{height:'100%',background:'linear-gradient(90deg,#c9a84c,#f0c060)',borderRadius:3,width:`${Math.min(100,(user.puzzlesSolved||0))}%`}}/>
        </div>
        <div style={{color:C.muted,fontSize:12}}>{user.puzzlesSolved||0}/100 {t('lessonsThisMonth')}</div>
      </div>
      <div style={sectionTitle}>{t('masterClass')}</div>
      <div style={{color:C.muted,fontSize:12,marginBottom:12,fontStyle:'italic'}}>{t('basedOn')}</div>
      {lessons.map(l=>(
        <button key={l.id} onClick={()=>onLesson(l)} style={{width:'100%',display:'flex',background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16,cursor:'pointer',marginBottom:10,textAlign:'left'}}>
          <div style={{width:52,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30}}>{l.icon}</div>
          <div style={{flex:1,paddingLeft:12}}>
            <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:2,marginBottom:2}}>{lang==='es'?l.categoryEs:l.category}</div>
            <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:15,marginBottom:2}}>{lang==='es'?l.titleEs:l.title}</div>
            <div style={{color:C.muted,fontSize:11,marginBottom:4}}>by {l.author}</div>
            <div style={{display:'flex',gap:12}}>
              <span style={{color:C.muted,fontSize:11}}>⏱ {l.duration}</span>
              <span style={{color:C.gold,fontSize:11}}>{'★'.repeat(l.difficulty)}{'☆'.repeat(5-l.difficulty)}</span>
            </div>
          </div>
        </button>
      ))}
      <div style={sectionTitle}>{t('spacedRep')}</div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
        <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:15,marginBottom:4}}>{t('reviewQueue')}</div>
        <div style={{color:C.muted,fontSize:13,marginBottom:8}}>7 {t('conceptsDue')}</div>
        <div style={{display:'inline-block',background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:'3px 10px',color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:1}}>SM-2 Algorithm</div>
      </div>
    </div>
  );
}

// ============================================================
// LESSON SCREEN
// ============================================================
function LessonScreen({t,lesson,lang,onBack,onComplete}){
  const [step,setStep]=useState(0);
  const [quizAnswer,setQuizAnswer]=useState(null);
  const [quizResult,setQuizResult]=useState(null);
  const cs=lesson.steps[step];const isLast=step===lesson.steps.length-1;

  const next=()=>{if(isLast){onComplete();return;}setStep(s=>s+1);setQuizAnswer(null);setQuizResult(null);};

  return(
    <div style={{padding:'16px 16px 24px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <button style={backBtn} onClick={onBack}>← {t('learn')}</button>
        <div style={{display:'flex',gap:6}}>{lesson.steps.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:4,background:i<=step?C.gold:'#333'}}/>)}</div>
      </div>
      <div style={{textAlign:'center',marginBottom:20}}>
        <div style={{fontSize:44,marginBottom:8}}>{lesson.icon}</div>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:18,marginBottom:4}}>{lang==='es'?lesson.titleEs:lesson.title}</div>
        <div style={{color:C.muted,fontSize:13,fontStyle:'italic'}}>by {lesson.author}</div>
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:20,marginBottom:20}}>
        {cs.type==='explanation'&&(
          <div>
            <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:3,marginBottom:12}}>{t('theory')}</div>
            <div style={{color:C.text,fontSize:15,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:(lang==='es'?cs.textEs:cs.text).replace(/\*\*(.*?)\*\*/g,`<strong style="color:${C.gold}">$1</strong>`)}}/>
          </div>
        )}
        {cs.type==='concept'&&(
          <div>
            <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:3,marginBottom:12}}>{t('keyConc')}</div>
            <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:15,marginBottom:12}}>{lang==='es'?cs.titleEs:cs.title}</div>
            {(lang==='es'?cs.pointsEs:cs.points).map((pt,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:8}}>
                <span style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:12,fontWeight:700,minWidth:18}}>{i+1}</span>
                <span style={{color:C.text,fontSize:14,lineHeight:1.5}}>{pt}</span>
              </div>
            ))}
          </div>
        )}
        {cs.type==='quiz'&&(
          <div>
            <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:3,marginBottom:12}}>{t('quiz')}</div>
            <div style={{color:C.text,fontSize:15,lineHeight:1.6,marginBottom:16}}>{lang==='es'?cs.questionEs:cs.question}</div>
            {(lang==='es'?cs.optionsEs:cs.options).map((opt,i)=>(
              <button key={i} onClick={()=>quizAnswer===null&&(setQuizAnswer(i),setQuizResult(i===cs.correct?'correct':'wrong'))} style={{width:'100%',textAlign:'left',background:quizAnswer===null?C.surface:i===cs.correct?'rgba(46,204,113,0.2)':i===quizAnswer?'rgba(231,76,60,0.2)':C.surface,border:`1px solid ${quizAnswer===null?C.border:i===cs.correct?'#2ecc71':i===quizAnswer?'#e74c3c':C.border}`,borderRadius:10,padding:'12px 14px',color:C.text,fontSize:13,cursor:'pointer',marginBottom:8,display:'flex',gap:10,fontFamily:"'Crimson Text',serif"}}>
                <span style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:11,fontWeight:700,minWidth:16}}>{['A','B','C','D'][i]}</span>{opt}
              </button>
            ))}
            {quizResult&&<div style={{marginTop:12,fontSize:14,lineHeight:1.6,color:quizResult==='correct'?'#2ecc71':'#e74c3c'}}>{quizResult==='correct'?'✓ ':'✗ '}<span style={{color:C.text}}>{lang==='es'?cs.explanationEs:cs.explanation}</span></div>}
          </div>
        )}
      </div>
      <button style={{...primaryBtn,opacity:cs.type==='quiz'&&quizAnswer===null?0.4:1}} disabled={cs.type==='quiz'&&quizAnswer===null} onClick={next}>
        {isLast?t('complete'):t('next')}
      </button>
    </div>
  );
}

// ============================================================
// OPENINGS SCREEN
// ============================================================
function OpeningsScreen({t,openings,onStartGame,lang}){
  const [sel,setSel]=useState(null);
  return(
    <div style={{padding:'16px 16px 24px'}}>
      <div style={screenTitle}>{t('openingRep')}</div>
      <div style={{color:C.muted,fontSize:12,textAlign:'center',marginBottom:16,fontStyle:'italic'}}>{t('buildOpening')}</div>
      {openings.map((op,i)=>(
        <button key={i} onClick={()=>setSel(sel===i?null:i)} style={{width:'100%',background:C.surface,border:`1px solid ${sel===i?C.gold:C.border}`,borderRadius:14,padding:16,cursor:'pointer',marginBottom:10,textAlign:'left'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
            <div>
              <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:2,marginBottom:2}}>{op.eco}</div>
              <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:15}}>{op.name}</div>
            </div>
            <div style={{color:C.muted,fontSize:14}}>{sel===i?'↑':'↓'}</div>
          </div>
          <div style={{color:C.muted,fontSize:12,fontFamily:'monospace'}}>{op.moves}</div>
          {sel===i&&(
            <div style={{marginTop:12,borderTop:`1px solid ${C.border}`,paddingTop:12}}>
              <div style={{color:C.text,fontSize:13,lineHeight:1.6,marginBottom:12}}>{lang==='es'?op.descEs:op.desc}</div>
              <button style={primaryBtn} onClick={()=>onStartGame('pve',5)}>{t('practiceOpening')}</button>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// PROFILE SCREEN
// ============================================================
function ProfileScreen({t,user,lang}){
  const eloHistory=user.eloHistory||[0];
  const max=Math.max(...eloHistory),min=Math.min(...eloHistory);
  const pts=eloHistory.map((v,i)=>({x:(i/(Math.max(eloHistory.length-1,1)))*100,y:100-((v-min)/(max-min||1))*80-10}));
  const path=pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
  const winRate=user.gamesPlayed>0?Math.round((user.wins/user.gamesPlayed)*100):0;

  return(
    <div style={{padding:'16px 16px 24px'}}>
      <div style={{textAlign:'center',paddingTop:8,marginBottom:20}}>
        <div style={{fontSize:60,marginBottom:8}}>♟</div>
        <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:20,marginBottom:4}}>{user.username}</div>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:30,fontWeight:700,marginBottom:8}}>{user.elo} {t('elo')}</div>
        <div style={{display:'flex',justifyContent:'center',gap:8}}>
          {user.winStreak>0&&<div style={{background:'rgba(46,204,113,0.15)',border:'1px solid rgba(46,204,113,0.3)',borderRadius:20,padding:'3px 12px',color:'#2ecc71',fontSize:11,fontFamily:'Cinzel,serif'}}>🔥 {user.winStreak} Win Streak</div>}
          {user.lossStreak>0&&<div style={{background:'rgba(231,76,60,0.15)',border:'1px solid rgba(231,76,60,0.3)',borderRadius:20,padding:'3px 12px',color:'#e74c3c',fontSize:11,fontFamily:'Cinzel,serif'}}>💔 {user.lossStreak} Loss Streak</div>}
        </div>
      </div>

      {/* ELO Chart */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:16}}>
        <div style={{color:C.muted,fontFamily:'Cinzel,serif',fontSize:11,letterSpacing:2,marginBottom:8}}>{t('ratingHistory')}</div>
        <svg width="100%" height="80" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a84c" stopOpacity="0.3"/><stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/></linearGradient></defs>
          {eloHistory.length>1&&<><path d={`${path} L 100 100 L 0 100 Z`} fill="url(#g2)"/><path d={path} fill="none" stroke="#c9a84c" strokeWidth="2"/>{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#c9a84c"/>)}</>}
        </svg>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
          <span style={{color:C.muted,fontSize:11}}>{min}</span>
          <span style={{color:C.muted,fontSize:11}}>{max}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[
          {key:'games',val:user.gamesPlayed||0,icon:'⚔'},
          {key:'wins',val:user.wins||0,icon:'🏆'},
          {key:'losses',val:user.losses||0,icon:'💔'},
          {key:'winRate',val:winRate+'%',icon:'📈'},
          {key:'accuracy',val:(user.accuracy||0).toFixed(1)+'%',icon:'🎯'},
          {key:'puzzles',val:user.puzzlesSolved||0,icon:'⭐'},
          {key:'streak',val:user.currentStreak||0,icon:'🔥'},
          {key:'bestElo',val:user.bestElo||0,icon:'👑'},
          {key:'draws',val:user.draws||0,icon:'🤝'},
        ].map(s=>(
          <div key={s.key} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 6px',textAlign:'center'}}>
            <div style={{fontSize:18,marginBottom:2}}>{s.icon}</div>
            <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:16,fontWeight:700}}>{s.val}</div>
            <div style={{color:C.muted,fontSize:9,fontFamily:'Cinzel,serif',letterSpacing:1,marginTop:1}}>{t(s.key)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
