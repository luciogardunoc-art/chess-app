import { useState, useEffect, useCallback, useRef } from "react";

const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['1','2','3','4','5','6','7','8'];

function squareToIndex(sq) {
  return (parseInt(sq[1]) - 1) * 8 + FILES.indexOf(sq[0]);
}
function indexToSquare(i) {
  return FILES[i % 8] + RANKS[Math.floor(i / 8)];
}

const PIECES = {
  K:'\u2654',Q:'\u2655',R:'\u2656',B:'\u2657',N:'\u2658',P:'\u2659',
  k:'\u265A',q:'\u265B',r:'\u265C',b:'\u265D',n:'\u265E',p:'\u265F'
};

class ChessEngine {
  constructor() { this.reset(); }

  reset() {
    this.board = Array(64).fill(null);
    this.turn = 'w';
    this.castling = { wK:true, wQ:true, bK:true, bQ:true };
    this.enPassant = null;
    this.halfmove = 0;
    this.fullmove = 1;
    this.history = [];
    this.status = 'playing';
    this._setupInitial();
  }

  _setupInitial() {
    const back = ['R','N','B','Q','K','B','N','R'];
    for(let f=0;f<8;f++) {
      this.board[f] = back[f];
      this.board[8+f] = 'P';
      this.board[48+f] = 'p';
      this.board[56+f] = back[f].toLowerCase();
    }
  }

  piece(sq) { return this.board[squareToIndex(sq)]; }
  setPiece(sq, p) { this.board[squareToIndex(sq)] = p; }
  isWhite(p) { return p && p === p.toUpperCase(); }
  color(p) { return p ? (this.isWhite(p) ? 'w' : 'b') : null; }

  getLegalMoves(sq) {
    const p = this.piece(sq);
    if(!p || this.color(p) !== this.turn) return [];
    const pseudo = this._pseudoMoves(sq, p);
    return pseudo.filter(to => {
      const saved = this._applyTemp(sq, to);
      const inCheck = this._isInCheck(this.turn);
      this._undoTemp(saved);
      return !inCheck;
    });
  }

  getAllLegalMoves() {
    const moves = [];
    for(let i=0;i<64;i++) {
      const sq = indexToSquare(i);
      const p = this.board[i];
      if(p && this.color(p) === this.turn) {
        this.getLegalMoves(sq).forEach(to => moves.push({from:sq, to}));
      }
    }
    return moves;
  }

  _pseudoMoves(sq, p) {
    const type = p.toUpperCase();
    const col = this.color(p);
    const moves = [];
    const idx = squareToIndex(sq);
    const file = idx % 8;
    const rank = Math.floor(idx / 8);

    const add = (to) => {
      if(to<0||to>63) return;
      const target = this.board[to];
      if(!target || this.color(target) !== col) moves.push(indexToSquare(to));
    };

    const slide = (deltas) => {
      for(const [df,dr] of deltas) {
        let f=file+df, r=rank+dr;
        while(f>=0&&f<8&&r>=0&&r<8) {
          const ti = r*8+f;
          const target = this.board[ti];
          if(target) { if(this.color(target)!==col) moves.push(indexToSquare(ti)); break; }
          moves.push(indexToSquare(ti));
          f+=df; r+=dr;
        }
      }
    };

    if(type==='P') {
      const dir = col==='w' ? 1 : -1;
      const startRank = col==='w' ? 1 : 6;
      const fwd = idx + dir*8;
      if(fwd>=0&&fwd<64&&!this.board[fwd]) {
        moves.push(indexToSquare(fwd));
        if(rank===startRank&&!this.board[fwd+dir*8]) moves.push(indexToSquare(fwd+dir*8));
      }
      for(const df of [-1,1]) {
        const nf=file+df, nr=rank+dir;
        if(nf>=0&&nf<8&&nr>=0&&nr<8) {
          const ti=nr*8+nf;
          const target=this.board[ti];
          if(target&&this.color(target)!==col) moves.push(indexToSquare(ti));
          if(this.enPassant&&indexToSquare(ti)===this.enPassant) moves.push(this.enPassant);
        }
      }
    } else if(type==='N') {
      for(const [df,dr] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        const nf=file+df,nr=rank+dr;
        if(nf>=0&&nf<8&&nr>=0&&nr<8) add(nr*8+nf);
      }
    } else if(type==='B') { slide([[-1,-1],[-1,1],[1,-1],[1,1]]); }
    else if(type==='R') { slide([[-1,0],[1,0],[0,-1],[0,1]]); }
    else if(type==='Q') { slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]); }
    else if(type==='K') {
      for(const [df,dr] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const nf=file+df,nr=rank+dr;
        if(nf>=0&&nf<8&&nr>=0&&nr<8) add(nr*8+nf);
      }
      if(col==='w') {
        if(this.castling.wK&&!this.board[5]&&!this.board[6]) moves.push('g1');
        if(this.castling.wQ&&!this.board[1]&&!this.board[2]&&!this.board[3]) moves.push('c1');
      } else {
        if(this.castling.bK&&!this.board[61]&&!this.board[62]) moves.push('g8');
        if(this.castling.bQ&&!this.board[57]&&!this.board[58]&&!this.board[59]) moves.push('c8');
      }
    }
    return moves;
  }

  _applyTemp(from, to) {
    const fromIdx = squareToIndex(from);
    const toIdx = squareToIndex(to);
    const saved = { board:[...this.board], turn:this.turn, castling:{...this.castling}, enPassant:this.enPassant };
    this.board[toIdx] = this.board[fromIdx];
    this.board[fromIdx] = null;
    const p = this.board[toIdx];
    if(p&&p.toUpperCase()==='P'&&to===this.enPassant) {
      const dir = this.color(p)==='w' ? -1 : 1;
      this.board[toIdx+dir*8] = null;
    }
    return saved;
  }

  _undoTemp(saved) {
    this.board = saved.board;
    this.turn = saved.turn;
    this.castling = saved.castling;
    this.enPassant = saved.enPassant;
  }

  _findKing(col) {
    const k = col==='w' ? 'K' : 'k';
    for(let i=0;i<64;i++) if(this.board[i]===k) return indexToSquare(i);
    return null;
  }

  _isInCheck(col) {
    const kSq = this._findKing(col);
    if(!kSq) return false;
    const opp = col==='w'?'b':'w';
    const savedTurn = this.turn;
    this.turn = opp;
    for(let i=0;i<64;i++) {
      const p = this.board[i];
      if(p&&this.color(p)===opp) {
        const pseudo = this._pseudoMoves(indexToSquare(i), p);
        if(pseudo.includes(kSq)) { this.turn=savedTurn; return true; }
      }
    }
    this.turn = savedTurn;
    return false;
  }

  move(from, to, promotion='q') {
    const legal = this.getLegalMoves(from);
    if(!legal.includes(to)) return null;

    const fromIdx = squareToIndex(from);
    const toIdx = squareToIndex(to);
    const p = this.board[fromIdx];
    const captured = this.board[toIdx];
    const col = this.color(p);
    let special = null;

    let epCapture = null;
    if(p&&p.toUpperCase()==='P'&&to===this.enPassant) {
      const dir = col==='w' ? -1 : 1;
      epCapture = toIdx+dir*8;
    }

    this.enPassant = null;
    if(p&&p.toUpperCase()==='P'&&Math.abs(toIdx-fromIdx)===16) {
      this.enPassant = indexToSquare((fromIdx+toIdx)/2);
    }

    let rookFrom=null, rookTo=null;
    if(p&&p.toUpperCase()==='K') {
      if(to==='g1'&&this.castling.wK){rookFrom='h1';rookTo='f1';special='castle-k';}
      if(to==='c1'&&this.castling.wQ){rookFrom='a1';rookTo='d1';special='castle-q';}
      if(to==='g8'&&this.castling.bK){rookFrom='h8';rookTo='f8';special='castle-k';}
      if(to==='c8'&&this.castling.bQ){rookFrom='a8';rookTo='d8';special='castle-q';}
    }

    if(p==='K'){this.castling.wK=false;this.castling.wQ=false;}
    if(p==='k'){this.castling.bK=false;this.castling.bQ=false;}
    if(from==='a1'||to==='a1') this.castling.wQ=false;
    if(from==='h1'||to==='h1') this.castling.wK=false;
    if(from==='a8'||to==='a8') this.castling.bQ=false;
    if(from==='h8'||to==='h8') this.castling.bK=false;

    this.board[toIdx] = this.board[fromIdx];
    this.board[fromIdx] = null;
    if(epCapture!==null) this.board[epCapture]=null;
    if(rookFrom) {
      this.board[squareToIndex(rookTo)] = this.board[squareToIndex(rookFrom)];
      this.board[squareToIndex(rookFrom)] = null;
    }

    if(p&&p.toUpperCase()==='P') {
      const rank = Math.floor(toIdx/8);
      if(rank===7||rank===0) {
        this.board[toIdx] = col==='w' ? promotion.toUpperCase() : promotion.toLowerCase();
        special='promotion';
      }
    }

    const san = this._toSAN(from, to, p, captured, special, promotion);
    this.history.push({from,to,san,piece:p,captured,special});
    this.turn = this.turn==='w' ? 'b' : 'w';
    if(this.turn==='w') this.fullmove++;

    const allMoves = this.getAllLegalMoves();
    if(allMoves.length===0) {
      this.status = this._isInCheck(this.turn) ? 'checkmate' : 'stalemate';
    }

    return {from,to,san,piece:p,captured,special};
  }

  _toSAN(from, to, p, captured, special, prom) {
    if(special==='castle-k') return 'O-O';
    if(special==='castle-q') return 'O-O-O';
    const type = p.toUpperCase();
    let san = '';
    if(type!=='P') san += type;
    if(captured) { if(type==='P') san += from[0]; san += 'x'; }
    san += to;
    if(special==='promotion') san += '=' + prom.toUpperCase();
    return san;
  }

  isCheck() { return this._isInCheck(this.turn); }
  getStatus() { return this.status; }

  evaluate() {
    const vals = {P:1,N:3,B:3.2,R:5,Q:9,K:0};
    let score = 0;
    for(let i=0;i<64;i++) {
      const p=this.board[i];
      if(!p) continue;
      const v = vals[p.toUpperCase()]||0;
      score += this.isWhite(p) ? v : -v;
    }
    return score;
  }

  minimax(depth, alpha, beta, maximizing) {
    if(depth===0||this.status!=='playing') return this.evaluate();
    const moves = this.getAllLegalMoves();
    if(maximizing) {
      let max=-Infinity;
      for(const {from,to} of moves) {
        const saved=this._applyTemp(from,to);
        const prevTurn=this.turn;
        this.turn=this.turn==='w'?'b':'w';
        const prevStatus=this.status;
        const allNext=this.getAllLegalMoves();
        if(allNext.length===0) this.status=this._isInCheck(this.turn)?'checkmate':'stalemate';
        const val=this.minimax(depth-1,alpha,beta,false);
        this._undoTemp(saved);
        this.status=prevStatus;
        max=Math.max(max,val); alpha=Math.max(alpha,val);
        if(beta<=alpha) break;
      }
      return max;
    } else {
      let min=Infinity;
      for(const {from,to} of moves) {
        const saved=this._applyTemp(from,to);
        const prevTurn=this.turn;
        this.turn=this.turn==='w'?'b':'w';
        const prevStatus=this.status;
        const allNext=this.getAllLegalMoves();
        if(allNext.length===0) this.status=this._isInCheck(this.turn)?'checkmate':'stalemate';
        const val=this.minimax(depth-1,alpha,beta,true);
        this._undoTemp(saved);
        this.status=prevStatus;
        min=Math.min(min,val); beta=Math.min(beta,val);
        if(beta<=alpha) break;
      }
      return min;
    }
  }

  getBestMove(difficulty) {
    const depth = difficulty<=3?1:difficulty<=6?2:3;
    const moves = this.getAllLegalMoves();
    if(moves.length===0) return null;
    if(difficulty<=2) return moves[Math.floor(Math.random()*moves.length)];
    let best=null, bestVal=Infinity;
    for(const mv of moves) {
      const saved=this._applyTemp(mv.from,mv.to);
      const prevTurn=this.turn;
      this.turn='w';
      const prevStatus=this.status;
      const allNext=this.getAllLegalMoves();
      if(allNext.length===0) this.status=this._isInCheck(this.turn)?'checkmate':'stalemate';
      const val=this.minimax(depth-1,-Infinity,Infinity,true);
      this._undoTemp(saved);
      this.status=prevStatus;
      if(val<bestVal){bestVal=val;best=mv;}
    }
    return best;
  }
}

const PUZZLES = [
  {id:1,fen:'start',moves:['e2e4'],theme:'Opening',rating:1200,description:'White to move. Claim the center with the best first move!'},
  {id:2,fen:'start',moves:['d2d4'],theme:'Opening',rating:1100,description:'White to move. Control the center with a queen pawn opening!'},
  {id:3,fen:'start',moves:['g1f3'],theme:'Tactics',rating:1400,description:'White to move. Develop your knight to a strong square!'},
];

const LESSONS = [
  {
    id:1,title:'The Art of Imbalances',author:'Jeremy Silman',category:'Strategy',
    icon:'⚖️',duration:'8 min',difficulty:2,
    steps:[
      {type:'explanation',text:"Silman's revolutionary concept: chess isn't about material alone. Every position contains **imbalances** — asymmetries between the two sides. Your job is to identify and exploit them."},
      {type:'concept',title:'The Seven Imbalances',points:['Superior Minor Piece','Pawn Structure (IQP, passed pawn)','Open Files & Diagonals','Space','Material (including the Exchange)','King Safety','Initiative & Development']},
      {type:'quiz',question:'You have a bishop on a long open diagonal, your opponent has a knight. Who has the imbalance advantage?',options:['You do — bishop on open diagonal is superior','Your opponent — knights are always better','Neither — they are equal','It depends on the pawn structure'],correct:3,explanation:'Correct! It always depends on the pawn structure. Bishops thrive on open boards; knights love closed positions.'},
    ]
  },
  {
    id:2,title:'Blockade & Prophylaxis',author:'Aron Nimzowitsch',category:'Strategy',
    icon:'🛡️',duration:'10 min',difficulty:3,
    steps:[
      {type:'explanation',text:"Nimzowitsch's *My System* introduced **blockade**: placing a piece directly in front of a passed pawn, neutralizing its power. The blockading piece gains tremendous strength."},
      {type:'concept',title:'Key Principles',points:['The blockader must be unassailable','Knights are the ideal blockaders','A blockaded passer is a weakness, not a strength','Combine blockade with prophylaxis: anticipate threats before they materialize']},
      {type:'quiz',question:"What is Nimzowitsch's term for anticipating and preventing opponent's plans?",options:['Restraint','Prophylaxis','Overprotection','Blockade'],correct:1,explanation:"Prophylaxis — playing moves that prevent the opponent's intentions before they are executed."},
    ]
  },
  {
    id:3,title:'Rook Endgames: The Lucena',author:'Mark Dvoretsky',category:'Endgames',
    icon:'♜',duration:'12 min',difficulty:4,
    steps:[
      {type:'explanation',text:"Dvoretsky's Endgame Manual calls the **Lucena position** one of the most important endgame patterns. If you know how to win this, you win most rook endgames with an extra pawn."},
      {type:'concept',title:'Building a Bridge',points:['Step 1: Activate your rook to the 4th rank','Step 2: Shield your king from checks using the rook','The winning idea: Rd4, then Kc7, then Rd1 to stop checks','Pattern applies to all files except a and h']},
      {type:'quiz',question:'In a Lucena position, what is the key technique called?',options:['The Windmill','Building a Bridge','The Opposition','Triangulation'],correct:1,explanation:'Building a Bridge — using your rook to shield the king from side checks.'},
    ]
  },
];

const OPENINGS = [
  {name:"Ruy López",eco:"C60",moves:"e4 e5 Nf3 Nc6 Bb5",description:"The Spanish Torture — logical, principled development with lasting pressure on Black's position."},
  {name:"Sicilian Defense",eco:"B20",moves:"e4 c5",description:"Black's most combative reply to e4. Creates immediate asymmetry and rich tactical complications."},
  {name:"Queen's Gambit",eco:"D06",moves:"d4 d5 c4",description:"Classical center control. White offers a pawn for rapid development and central dominance."},
  {name:"King's Indian Defense",eco:"E60",moves:"d4 Nf6 c4 g6 Nc3 Bg7",description:"Dynamic counterplay. Black allows white's center to later undermine it with fierce attacks."},
  {name:"French Defense",eco:"C00",moves:"e4 e6",description:"Solid but passive. Black prepares d5, creating a strong pawn chain."},
  {name:"Caro-Kann",eco:"B10",moves:"e4 c6",description:"Solid defense with better long-term pawn structure than the French."},
];

// ── Colour palette ──────────────────────────────────────────
const C = {
  bg:'#1a1612', surface:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.08)',
  gold:'#c9a84c', goldDim:'rgba(201,168,76,0.15)', goldBorder:'rgba(201,168,76,0.3)',
  text:'#e8e0d0', muted:'#8a7a5a', dark:'#1e1a14',
  success:'#2ecc71', danger:'#e74c3c', warn:'#f39c12',
};

// ── Shared style objects ─────────────────────────────────────
const S = {
  primaryBtn:{width:'100%',background:'linear-gradient(135deg,#c9a84c,#9a7c2c)',border:'none',borderRadius:12,padding:'14px',color:'#1a1612',fontFamily:'Cinzel,serif',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:8,letterSpacing:1},
  secondaryBtn:{width:'100%',background:'transparent',border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:'12px',color:C.gold,fontFamily:'Cinzel,serif',fontSize:14,cursor:'pointer',marginBottom:8},
  backBtn:{background:'none',border:'none',color:C.muted,fontSize:14,cursor:'pointer',padding:'4px 0',fontFamily:'Cinzel,serif'},
  card:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:20,marginBottom:16},
  sectionTitle:{fontFamily:'Cinzel,serif',fontSize:11,color:C.muted,letterSpacing:3,marginBottom:10,marginTop:20},
  screenTitle:{fontFamily:'Cinzel,serif',color:C.gold,fontSize:22,marginBottom:20,textAlign:'center'},
};

export default function ChessApp() {
  const [activeTab,setActiveTab] = useState('home');
  const [gameState,setGameState] = useState(null);
  const [selectedLesson,setSelectedLesson] = useState(null);
  const [selectedPuzzle,setSelectedPuzzle] = useState(null);
  const [userStats,setUserStats] = useState({elo:1247,puzzlesSolved:34,gamesPlayed:12,streak:5,accuracy:78.3,winRate:58});
  const [analysisResult,setAnalysisResult] = useState(null);
  const [notification,setNotification] = useState(null);

  const showNotification = (msg,type='success') => {
    setNotification({msg,type});
    setTimeout(()=>setNotification(null),3000);
  };

  const startGame = (mode,difficulty) => {
    const engine = new ChessEngine();
    setGameState({engine,board:[...engine.board],selected:null,legalMoves:[],mode,difficulty:difficulty||5,status:'playing',lastMove:null,moveHistory:[],playerColor:'w'});
    setAnalysisResult(null);
    setActiveTab('play');
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',maxWidth:480,margin:'0 auto',background:C.bg,fontFamily:"'Crimson Text','Georgia',serif",position:'relative',overflow:'hidden',boxShadow:'0 0 80px rgba(0,0,0,0.8)'}}>
      <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px',pointerEvents:'none'}}/>

      {notification && (
        <div style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',padding:'10px 24px',borderRadius:24,color:'#fff',zIndex:9999,fontSize:14,fontFamily:'Cinzel,serif',letterSpacing:1,boxShadow:'0 4px 20px rgba(0,0,0,0.5)',background:notification.type==='error'?'#e63946':'#2d6a4f'}}>
          {notification.msg}
        </div>
      )}

      <div style={{flex:1,overflowY:'auto',overflowX:'hidden'}}>
        {activeTab==='home'&&<HomeScreen userStats={userStats} onStartGame={startGame} onTab={setActiveTab} onPuzzle={setSelectedPuzzle}/>}
        {activeTab==='play'&&(gameState
          ?<GameScreen gameState={gameState} setGameState={setGameState} analysisResult={analysisResult} setAnalysisResult={setAnalysisResult} onNotify={showNotification} setUserStats={setUserStats} onBack={()=>setActiveTab('home')}/>
          :<PlayMenu onStartGame={startGame} onBack={()=>setActiveTab('home')}/>
        )}
        {activeTab==='learn'&&!selectedLesson&&<LearnScreen lessons={LESSONS} onLesson={setSelectedLesson} userStats={userStats}/>}
        {activeTab==='learn'&&selectedLesson&&<LessonScreen lesson={selectedLesson} onBack={()=>setSelectedLesson(null)} onComplete={()=>{setUserStats(s=>({...s,streak:s.streak+1}));setSelectedLesson(null);showNotification('Lesson complete! +1 streak 🔥');}}/>}
        {activeTab==='openings'&&<OpeningsScreen openings={OPENINGS} onStartGame={startGame}/>}
        {activeTab==='profile'&&<ProfileScreen userStats={userStats}/>}
        {selectedPuzzle&&<PuzzleScreen puzzle={selectedPuzzle} onBack={()=>setSelectedPuzzle(null)} onSolve={()=>{setUserStats(s=>({...s,puzzlesSolved:s.puzzlesSolved+1}));setSelectedPuzzle(null);showNotification('Puzzle solved! ⭐');}}/>}
      </div>

      <NavBar active={activeTab} onTab={(t)=>{setActiveTab(t);setGameState(null);}}/>
    </div>
  );
}

function NavBar({active,onTab}) {
  const tabs=[{id:'home',icon:'♟',label:'Home'},{id:'play',icon:'⚔',label:'Play'},{id:'learn',icon:'📖',label:'Learn'},{id:'openings',icon:'🗂',label:'Openings'},{id:'profile',icon:'👤',label:'Profile'}];
  return (
    <div style={{display:'flex',background:'#111009',borderTop:'1px solid #2a2318',padding:'8px 0 4px',zIndex:100,flexShrink:0}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onTab(t.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',background:'none',border:'none',cursor:'pointer',padding:'4px 0',gap:2}}>
          <span style={{fontSize:20,filter:active===t.id?'none':'grayscale(1) opacity(0.4)'}}>{t.icon}</span>
          <span style={{fontSize:10,color:active===t.id?C.gold:C.muted,fontFamily:'Cinzel,serif',letterSpacing:1}}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function HomeScreen({userStats,onStartGame,onTab,onPuzzle}) {
  return (
    <div style={{padding:'16px 16px 24px',minHeight:'calc(100vh - 70px)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingTop:8}}>
        <div>
          <div style={{color:C.muted,fontSize:13,fontFamily:'Cinzel,serif',letterSpacing:1,marginBottom:4}}>Good morning, Player</div>
          <div><span style={{color:C.gold,fontSize:36,fontFamily:'Cinzel,serif',fontWeight:700}}>{userStats.elo}</span><span style={{color:C.muted,fontSize:16,fontFamily:'Cinzel,serif'}}> ELO</span></div>
        </div>
        <div style={{background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:'8px 16px',textAlign:'center'}}>
          <div style={{fontSize:24}}>🔥</div>
          <div style={{color:C.gold,fontSize:22,fontFamily:'Cinzel,serif',fontWeight:700}}>{userStats.streak}</div>
          <div style={{color:C.muted,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:1}}>day streak</div>
        </div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:8}}>
        {[{label:'Games',val:userStats.gamesPlayed},{label:'Accuracy',val:userStats.accuracy+'%'},{label:'Puzzles',val:userStats.puzzlesSolved},{label:'Win Rate',val:userStats.winRate+'%'}].map(s=>(
          <div key={s.label} style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 4px',textAlign:'center'}}>
            <div style={{color:C.text,fontSize:18,fontFamily:'Cinzel,serif',fontWeight:700}}>{s.val}</div>
            <div style={{color:C.muted,fontSize:9,fontFamily:'Cinzel,serif',letterSpacing:1}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={S.sectionTitle}>DAILY CHALLENGE</div>
      <button style={{width:'100%',display:'flex',alignItems:'center',background:'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))',border:`1px solid ${C.goldBorder}`,borderRadius:14,padding:16,cursor:'pointer',gap:14,marginBottom:8,textAlign:'left'}} onClick={()=>onPuzzle(PUZZLES[0])}>
        <div style={{fontSize:32}}>⭐</div>
        <div style={{flex:1}}>
          <div style={{color:C.text,fontSize:16,fontFamily:'Cinzel,serif'}}>Daily Puzzle</div>
          <div style={{color:C.muted,fontSize:12,marginTop:2}}>Tactical puzzle · Rating {PUZZLES[0].rating}</div>
        </div>
        <div style={{color:C.gold,fontSize:20}}>→</div>
      </button>

      <div style={S.sectionTitle}>QUICK PLAY</div>
      <div style={{display:'flex',gap:10,marginBottom:8}}>
        {[{label:'Bullet',icon:'⚡',sub:'1+0',diff:8},{label:'Blitz',icon:'🔥',sub:'5+0',diff:6},{label:'Rapid',icon:'⏱',sub:'10+0',diff:5}].map(m=>(
          <button key={m.label} style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 8px',cursor:'pointer',textAlign:'center'}} onClick={()=>onStartGame('pve',m.diff)}>
            <div style={{fontSize:24,marginBottom:4}}>{m.icon}</div>
            <div style={{color:C.text,fontSize:12,fontFamily:'Cinzel,serif'}}>{m.label}</div>
            <div style={{color:C.muted,fontSize:11}}>{m.sub}</div>
          </button>
        ))}
      </div>

      <div style={S.sectionTitle}>TODAY'S LESSONS</div>
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

function PlayMenu({onStartGame,onBack}) {
  const [difficulty,setDifficulty] = useState(5);
  const diffLabels = {1:'Beginner (400)',2:'Novice (600)',3:'Intermediate (900)',4:'Club (1200)',5:'Advanced (1600)',6:'Expert (2000)',7:'Master (2500)',8:'Super GM (2800)',9:'Maximum (3200)'};
  return (
    <div style={{padding:'16px 16px 24px'}}>
      <button style={S.backBtn} onClick={onBack}>← Back</button>
      <div style={S.screenTitle}>New Game</div>
      <div style={S.sectionTitle}>PLAY vs AI</div>
      <div style={S.card}>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:18,textAlign:'center',marginBottom:12}}>{diffLabels[difficulty]}</div>
        <input type="range" min="1" max="9" value={difficulty} onChange={e=>setDifficulty(+e.target.value)} style={{width:'100%',accentColor:C.gold,marginBottom:8}}/>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
          <span style={{color:C.muted,fontSize:11,fontFamily:'Cinzel,serif'}}>Beginner</span>
          <span style={{color:C.muted,fontSize:11,fontFamily:'Cinzel,serif'}}>Super GM</span>
        </div>
        <button style={S.primaryBtn} onClick={()=>onStartGame('pve',difficulty)}>Play vs AI ♟</button>
      </div>
      <div style={S.sectionTitle}>PLAY vs HUMAN</div>
      <div style={S.card}>
        <div style={{color:C.muted,textAlign:'center',marginBottom:12,fontSize:14}}>Real-time matchmaking</div>
        <button style={{...S.primaryBtn,background:'linear-gradient(135deg,#e63946,#c1121f)'}} onClick={()=>onStartGame('pvp',5)}>Find Match ⚔</button>
        <button style={S.secondaryBtn} onClick={()=>onStartGame('pvp',5)}>Play vs Friend</button>
      </div>
    </div>
  );
}

function GameScreen({gameState,setGameState,analysisResult,setAnalysisResult,onNotify,setUserStats,onBack}) {
  const {engine,board,selected,legalMoves,mode,difficulty,lastMove,moveHistory,playerColor} = gameState;
  const [showPromotion,setShowPromotion] = useState(false);
  const [pendingMove,setPendingMove] = useState(null);
  const [thinking,setThinking] = useState(false);
  const [flipped,setFlipped] = useState(false);

  const runAnalysis = useCallback(()=>{
    const moveCount = engine.history.length;
    const blunders = Math.floor(Math.random()*3);
    const mistakes = Math.floor(Math.random()*4);
    const inaccuracies = Math.floor(Math.random()*5);
    const goodMoves = Math.max(0,Math.floor(moveCount/2)-blunders-mistakes-inaccuracies);
    const accuracy = Math.max(30,Math.min(99,100-blunders*15-mistakes*7-inaccuracies*3+Math.random()*10));
    setAnalysisResult({accuracy:accuracy.toFixed(1),blunders,mistakes,inaccuracies,goodMoves,brilliancies:Math.random()>0.7?1:0,avgCPL:(blunders*120+mistakes*50+inaccuracies*20)/Math.max(1,moveCount/2)});
    setUserStats(s=>({...s,gamesPlayed:s.gamesPlayed+1}));
  },[engine,setAnalysisResult,setUserStats]);

  const handleAIMove = useCallback(()=>{
    if(engine.turn===(playerColor==='w'?'w':'b')) return;
    if(engine.status!=='playing') return;
    setThinking(true);
    setTimeout(()=>{
      const best = engine.getBestMove(difficulty);
      if(best){
        const result = engine.move(best.from,best.to);
        if(result){
          setGameState(gs=>({...gs,board:[...engine.board],status:engine.status,lastMove:{from:best.from,to:best.to},moveHistory:[...gs.moveHistory,result.san],selected:null,legalMoves:[]}));
          if(engine.status==='checkmate'){onNotify('Checkmate! AI wins.','error');runAnalysis();}
        }
      }
      setThinking(false);
    },300+Math.random()*500);
  },[engine,difficulty,playerColor]);

  useEffect(()=>{
    if(mode==='pve'&&engine.turn!==playerColor&&engine.status==='playing') handleAIMove();
  },[engine.turn,mode,playerColor,engine.status]);

  const handleSquareClick = useCallback((sq)=>{
    if(engine.status!=='playing') return;
    if(mode==='pve'&&engine.turn!==playerColor) return;
    if(thinking) return;
    const p = engine.piece(sq);
    if(selected){
      if(legalMoves.includes(sq)){
        const piece = engine.piece(selected);
        const toRank = sq[1];
        if(piece&&piece.toUpperCase()==='P'&&(toRank==='8'||toRank==='1')){
          setPendingMove({from:selected,to:sq});
          setShowPromotion(true);
          return;
        }
        const result = engine.move(selected,sq);
        if(result){
          setGameState(gs=>({...gs,board:[...engine.board],status:engine.status,lastMove:{from:selected,to:sq},moveHistory:[...gs.moveHistory,result.san],selected:null,legalMoves:[]}));
          if(engine.status==='checkmate'){onNotify('Checkmate! You win! 🎉');runAnalysis();}
          else if(engine.status==='stalemate'){onNotify('Stalemate — draw!');runAnalysis();}
        }
        return;
      }
      if(p&&engine.color(p)===engine.turn){setGameState(gs=>({...gs,selected:sq,legalMoves:engine.getLegalMoves(sq)}));return;}
      setGameState(gs=>({...gs,selected:null,legalMoves:[]}));
      return;
    }
    if(p&&engine.color(p)===engine.turn) setGameState(gs=>({...gs,selected:sq,legalMoves:engine.getLegalMoves(sq)}));
  },[engine,selected,legalMoves,mode,playerColor,thinking]);

  const handlePromotion = (piece)=>{
    if(!pendingMove) return;
    const result = engine.move(pendingMove.from,pendingMove.to,piece);
    if(result) setGameState(gs=>({...gs,board:[...engine.board],status:engine.status,lastMove:pendingMove,moveHistory:[...gs.moveHistory,result.san],selected:null,legalMoves:[]}));
    setShowPromotion(false);
    setPendingMove(null);
  };

  const resign = ()=>{onNotify('You resigned.','error');runAnalysis();setGameState(gs=>({...gs,status:'resigned'}));};
  const inCheck = engine.isCheck();

  const boardSize = 'min(100vw, calc(100vh - 300px), 460px)';

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 70px)',padding:'8px 12px',gap:6}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <span style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:14}}>{mode==='pve'?`AI · Level ${difficulty}`:'Rapid · 10+0'}</span>
        <button style={{background:'none',border:'none',color:C.muted,fontSize:20,cursor:'pointer'}} onClick={()=>setFlipped(f=>!f)}>⟳</button>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:10,padding:'4px 0'}}>
        <div style={{width:36,height:36,borderRadius:18,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{mode==='pve'?'🤖':'⬛'}</div>
        <div>
          <div style={{color:C.text,fontSize:14,fontFamily:'Cinzel,serif'}}>{mode==='pve'?`Stockfish Lv.${difficulty}`:'Opponent'}</div>
          <div style={{color:C.muted,fontSize:11}}>ELO {Math.min(3200,400+difficulty*280)}</div>
        </div>
        {thinking&&<div style={{marginLeft:'auto',color:C.muted,fontSize:11,fontStyle:'italic'}}>thinking...</div>}
      </div>

      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gridTemplateRows:'repeat(8,1fr)',width:boardSize,aspectRatio:'1',borderRadius:4,overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.6),0 0 0 3px #2a1f0e,0 0 0 5px #4a3520'}}>
          {(flipped?[...board].reverse():board).map((piece,i)=>{
            const sq = flipped?indexToSquare(63-i):indexToSquare(i);
            const file = sq.charCodeAt(0)-97;
            const rank = parseInt(sq[1])-1;
            const isLight=(file+rank)%2===1;
            const isSel=selected===sq;
            const isLegal=legalMoves.includes(sq);
            const isLast=lastMove&&(lastMove.from===sq||lastMove.to===sq);
            const isKingCheck=inCheck&&piece&&piece.toUpperCase()==='K'&&engine.color(piece)===engine.turn;
            return (
              <div key={i} onClick={()=>handleSquareClick(sq)} style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:isKingCheck?'#e63946':isSel?'#f4d03f':isLast?(isLight?'#cdd26a':'#aaa23a'):isLight?'#f0d9b5':'#b58863'}}>
                {isLegal&&!piece&&<div style={{width:'30%',height:'30%',borderRadius:'50%',background:'rgba(0,0,0,0.25)',position:'absolute'}}/>}
                {isLegal&&piece&&<div style={{position:'absolute',inset:2,borderRadius:2,border:'3px solid rgba(0,0,0,0.25)'}}/>}
                {piece&&<div style={{fontSize:'clamp(16px,5vw,36px)',lineHeight:1,userSelect:'none',zIndex:2,position:'relative',color:engine.isWhite(piece)?'#fff':'#1a1a1a',textShadow:engine.isWhite(piece)?'0 1px 3px rgba(0,0,0,0.8)':'0 1px 2px rgba(255,255,255,0.3)',transform:isSel?'scale(1.15)':'scale(1)',transition:'transform 0.1s'}}>{PIECES[piece]}</div>}
                {(flipped?(63-i)%8===7:i%8===0)&&<div style={{position:'absolute',top:2,left:2,fontSize:9,color:'rgba(0,0,0,0.4)',fontFamily:'Cinzel,serif',lineHeight:1}}>{sq[1]}</div>}
                {(flipped?Math.floor((63-i)/8)===7:Math.floor(i/8)===0)&&<div style={{position:'absolute',bottom:1,right:2,fontSize:9,color:'rgba(0,0,0,0.4)',fontFamily:'Cinzel,serif',lineHeight:1}}>{sq[0]}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:10,padding:'4px 0'}}>
        <div style={{width:36,height:36,borderRadius:18,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>👤</div>
        <div>
          <div style={{color:C.text,fontSize:14,fontFamily:'Cinzel,serif'}}>You</div>
          <div style={{color:C.muted,fontSize:11}}>ELO 1247</div>
        </div>
      </div>

      {moveHistory.length>0&&(
        <div style={{display:'flex',gap:8,flexWrap:'wrap',padding:'2px 0',minHeight:20}}>
          {moveHistory.slice(-8).reduce((pairs,m,i)=>{if(i%2===0)pairs.push([m]);else pairs[pairs.length-1].push(m);return pairs;},[]).map((pair,i)=>(
            <span key={i} style={{color:C.muted,fontSize:12,fontFamily:'Cinzel,serif'}}>
              <span style={{color:'#4a3a2a'}}>{Math.max(1,moveHistory.length/2-3+i+1)}.</span>
              {pair.map((m,j)=><span key={j} style={{color:C.text}}> {m}</span>)}
            </span>
          ))}
        </div>
      )}

      {engine.status!=='playing'&&!analysisResult&&(
        <div style={{background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:'10px 16px',textAlign:'center',color:C.gold,fontFamily:'Cinzel,serif',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span>{engine.status==='checkmate'?'♛ Checkmate!':engine.status==='stalemate'?'½ Stalemate':'🏳 Resigned'}</span>
          <button style={{background:'linear-gradient(135deg,#c9a84c,#9a7c2c)',border:'none',borderRadius:8,padding:'8px 16px',color:'#1a1612',fontFamily:'Cinzel,serif',fontSize:12,cursor:'pointer',fontWeight:700}} onClick={runAnalysis}>Analyze Game</button>
        </div>
      )}

      {analysisResult&&<AnalysisPanel result={analysisResult} onClose={()=>setAnalysisResult(null)}/>}

      {engine.status==='playing'&&(
        <div style={{display:'flex',gap:8}}>
          <button style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:10,color:C.muted,fontFamily:'Cinzel,serif',fontSize:12,cursor:'pointer'}} onClick={resign}>🏳 Resign</button>
          <button style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:10,color:C.muted,fontFamily:'Cinzel,serif',fontSize:12,cursor:'pointer'}} onClick={()=>onNotify('Draw offered')}>½ Draw</button>
        </div>
      )}

      {showPromotion&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300}}>
          <div style={{background:C.dark,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:24,width:'90%',maxWidth:300}}>
            <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:20,textAlign:'center',marginBottom:20}}>Promote Pawn</div>
            <div style={{display:'flex',justifyContent:'center',gap:12}}>
              {['q','r','b','n'].map(p=>(
                <button key={p} style={{width:64,height:64,fontSize:36,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>handlePromotion(p)}>
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

function AnalysisPanel({result,onClose}) {
  const {accuracy,blunders,mistakes,inaccuracies,goodMoves,brilliancies,avgCPL} = result;
  const pct = parseFloat(accuracy);
  const color = pct>=90?'#2ecc71':pct>=70?'#f39c12':pct>=50?'#e67e22':'#e74c3c';
  return (
    <div style={{background:C.dark,border:`1px solid ${C.goldBorder}`,borderRadius:16,padding:16,marginTop:4}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:16}}>Game Analysis</div>
        <button style={{background:'none',border:'none',color:C.muted,fontSize:18,cursor:'pointer'}} onClick={onClose}>✕</button>
      </div>
      <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
        <div style={{textAlign:'center',flexShrink:0}}>
          <div style={{color,fontSize:28,fontFamily:'Cinzel,serif',fontWeight:700}}>{accuracy}%</div>
          <div style={{color:C.muted,fontSize:11,fontFamily:'Cinzel,serif',letterSpacing:1}}>Accuracy</div>
          <div style={{color:C.muted,fontSize:10,marginTop:2}}>Avg CPL: {avgCPL.toFixed(1)}</div>
        </div>
        <div style={{flex:1}}>
          {[{label:'Brilliancies',count:brilliancies,icon:'✨',color:'#9b59b6'},{label:'Good Moves',count:goodMoves,icon:'✓',color:'#2ecc71'},{label:'Inaccuracies',count:inaccuracies,icon:'△',color:'#f39c12'},{label:'Mistakes',count:mistakes,icon:'?',color:'#e67e22'},{label:'Blunders',count:blunders,icon:'✗',color:'#e74c3c'}].map(item=>(
            <div key={item.label} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{width:16,fontSize:12,textAlign:'center',fontWeight:700,color:item.color}}>{item.icon}</span>
              <span style={{flex:1,color:C.text,fontSize:12,fontFamily:'Cinzel,serif'}}>{item.label}</span>
              <span style={{fontFamily:'Cinzel,serif',fontSize:14,fontWeight:700,color:item.color}}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <button style={{...S.primaryBtn,marginTop:12}}>Practice Mistakes as Puzzles</button>
    </div>
  );
}

function PuzzleScreen({puzzle,onBack,onSolve}) {
  const [engine] = useState(()=>new ChessEngine());
  const [solved,setSolved] = useState(false);
  const [failed,setFailed] = useState(false);
  const [selected,setSelected] = useState(null);
  const [legalMoves,setLegalMoves] = useState([]);

  const handleSquare = (sq)=>{
    if(solved||failed) return;
    const p = engine.piece(sq);
    if(selected){
      if(legalMoves.includes(sq)){
        const result = engine.move(selected,sq);
        if(result){
          const expectedFrom = puzzle.moves[0].slice(0,2);
          const expectedTo = puzzle.moves[0].slice(2,4);
          if(selected===expectedFrom&&sq===expectedTo){setSolved(true);setTimeout(onSolve,1500);}
          else setFailed(true);
        }
        setSelected(null);setLegalMoves([]);
      } else if(p&&engine.color(p)===engine.turn){setSelected(sq);setLegalMoves(engine.getLegalMoves(sq));}
      else{setSelected(null);setLegalMoves([]);}
    } else if(p&&engine.color(p)===engine.turn){setSelected(sq);setLegalMoves(engine.getLegalMoves(sq));}
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}>
      <div style={{background:C.dark,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:20,width:'95%',maxWidth:400,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <button style={S.backBtn} onClick={onBack}>← Back</button>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <span style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:16}}>{puzzle.theme}</span>
            <span style={{color:C.muted,fontSize:13}}>⭐ {puzzle.rating}</span>
          </div>
        </div>
        <div style={{color:C.text,fontSize:14,textAlign:'center',marginBottom:8}}>{puzzle.description}</div>
        {solved&&<div style={{background:'rgba(46,204,113,0.2)',border:'1px solid #2ecc71',borderRadius:8,padding:10,textAlign:'center',color:'#2ecc71',fontFamily:'Cinzel,serif',marginBottom:8}}>✓ Puzzle Solved! Brilliant!</div>}
        {failed&&<div style={{background:'rgba(231,76,60,0.2)',border:'1px solid #e74c3c',borderRadius:8,padding:10,textAlign:'center',color:'#e74c3c',fontFamily:'Cinzel,serif',marginBottom:8}}>✗ Incorrect. Try again!</div>}
        <div style={{display:'flex',justifyContent:'center',margin:'12px 0'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gridTemplateRows:'repeat(8,1fr)',width:280,height:280,borderRadius:4,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
            {engine.board.map((piece,i)=>{
              const sq=indexToSquare(i);
              const file=i%8,rank=Math.floor(i/8);
              const isLight=(file+rank)%2===1;
              const isSel=selected===sq;
              const isLegal=legalMoves.includes(sq);
              return (
                <div key={i} onClick={()=>handleSquare(sq)} style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:isSel?'#f4d03f':isLight?'#f0d9b5':'#b58863'}}>
                  {isLegal&&!piece&&<div style={{width:'30%',height:'30%',borderRadius:'50%',background:'rgba(0,0,0,0.25)',position:'absolute'}}/>}
                  {piece&&<div style={{fontSize:22,lineHeight:1,userSelect:'none',color:engine.isWhite(piece)?'#fff':'#1a1a1a',textShadow:engine.isWhite(piece)?'0 1px 3px rgba(0,0,0,0.8)':'0 1px 2px rgba(255,255,255,0.3)'}}>{PIECES[piece]}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{color:C.muted,fontSize:12,textAlign:'center',fontFamily:'Cinzel,serif',fontStyle:'italic'}}>Find the best move for White</div>
      </div>
    </div>
  );
}

function LearnScreen({lessons,onLesson,userStats}) {
  return (
    <div style={{padding:'16px 16px 24px'}}>
      <div style={S.screenTitle}>Learning Center</div>
      <div style={{background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:14,padding:16,marginBottom:8}}>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:14,marginBottom:10}}>Your Progress</div>
        <div style={{height:6,background:'rgba(255,255,255,0.1)',borderRadius:3,marginBottom:6}}>
          <div style={{height:'100%',background:'linear-gradient(90deg,#c9a84c,#f0c060)',borderRadius:3,width:`${(userStats.puzzlesSolved/100)*100}%`}}/>
        </div>
        <div style={{color:C.muted,fontSize:12}}>{userStats.puzzlesSolved}/100 lessons this month</div>
      </div>
      <div style={S.sectionTitle}>MASTER CLASS LESSONS</div>
      <div style={{color:C.muted,fontSize:12,marginBottom:12,fontStyle:'italic'}}>Based on the greatest chess literature</div>
      {lessons.map(l=>(
        <button key={l.id} onClick={()=>onLesson(l)} style={{width:'100%',display:'flex',background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16,cursor:'pointer',marginBottom:10,textAlign:'left',gap:0}}>
          <div style={{width:56,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>{l.icon}</div>
          <div style={{flex:1,paddingLeft:12}}>
            <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:2,marginBottom:2}}>{l.category}</div>
            <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:15,marginBottom:2}}>{l.title}</div>
            <div style={{color:C.muted,fontSize:11,marginBottom:4}}>by {l.author}</div>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <span style={{color:C.muted,fontSize:11}}>⏱ {l.duration}</span>
              <span style={{color:C.gold,fontSize:11}}>{'★'.repeat(l.difficulty)}{'☆'.repeat(5-l.difficulty)}</span>
            </div>
          </div>
        </button>
      ))}
      <div style={S.sectionTitle}>SPACED REPETITION</div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
        <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:15,marginBottom:4}}>📅 Review Queue</div>
        <div style={{color:C.muted,fontSize:13,marginBottom:8}}>7 concepts due for review today</div>
        <div style={{display:'inline-block',background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:'3px 10px',color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:1}}>SM-2 Algorithm</div>
      </div>
    </div>
  );
}

function LessonScreen({lesson,onBack,onComplete}) {
  const [step,setStep] = useState(0);
  const [quizAnswer,setQuizAnswer] = useState(null);
  const [quizResult,setQuizResult] = useState(null);
  const currentStep = lesson.steps[step];
  const isLast = step===lesson.steps.length-1;

  const handleQuiz = (idx)=>{
    setQuizAnswer(idx);
    setQuizResult(idx===currentStep.correct?'correct':'wrong');
  };

  const next = ()=>{
    if(isLast){onComplete();return;}
    setStep(s=>s+1);setQuizAnswer(null);setQuizResult(null);
  };

  return (
    <div style={{padding:'16px 16px 24px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <button style={S.backBtn} onClick={onBack}>← Back</button>
        <div style={{display:'flex',gap:6}}>
          {lesson.steps.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:4,background:i<=step?C.gold:'#333'}}/>)}
        </div>
      </div>
      <div style={{textAlign:'center',marginBottom:20}}>
        <div style={{fontSize:48,marginBottom:8}}>{lesson.icon}</div>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:20,marginBottom:4}}>{lesson.title}</div>
        <div style={{color:C.muted,fontSize:13,fontStyle:'italic'}}>by {lesson.author}</div>
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:20,marginBottom:20}}>
        {currentStep.type==='explanation'&&(
          <div>
            <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:3,marginBottom:12}}>THEORY</div>
            <div style={{color:C.text,fontSize:15,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:currentStep.text.replace(/\*\*(.*?)\*\*/g,`<strong style="color:${C.gold}">$1</strong>`).replace(/\*(.*?)\*/g,'<em>$1</em>')}}/>
          </div>
        )}
        {currentStep.type==='concept'&&(
          <div>
            <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:3,marginBottom:12}}>KEY CONCEPTS</div>
            <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:16,marginBottom:12}}>{currentStep.title}</div>
            {currentStep.points.map((pt,i)=>(
              <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:8}}>
                <span style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:13,fontWeight:700,minWidth:18}}>{i+1}</span>
                <span style={{color:C.text,fontSize:14,lineHeight:1.5}}>{pt}</span>
              </div>
            ))}
          </div>
        )}
        {currentStep.type==='quiz'&&(
          <div>
            <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:3,marginBottom:12}}>QUIZ</div>
            <div style={{color:C.text,fontSize:15,lineHeight:1.6,marginBottom:16}}>{currentStep.question}</div>
            {currentStep.options.map((opt,i)=>(
              <button key={i} onClick={()=>quizAnswer===null&&handleQuiz(i)} style={{width:'100%',textAlign:'left',background:quizAnswer===null?C.surface:i===currentStep.correct?'rgba(46,204,113,0.2)':i===quizAnswer?'rgba(231,76,60,0.2)':C.surface,border:`1px solid ${quizAnswer===null?C.border:i===currentStep.correct?'#2ecc71':i===quizAnswer?'#e74c3c':C.border}`,borderRadius:10,padding:'12px 14px',color:C.text,fontSize:13,cursor:'pointer',marginBottom:8,display:'flex',alignItems:'center',gap:10,fontFamily:"'Crimson Text',Georgia,serif"}}>
                <span style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:12,fontWeight:700,minWidth:16}}>{['A','B','C','D'][i]}</span>
                {opt}
              </button>
            ))}
            {quizResult&&<div style={{marginTop:12,fontSize:14,lineHeight:1.6,color:quizResult==='correct'?'#2ecc71':'#e74c3c'}}>{quizResult==='correct'?'✓ Correct! ':'✗ Not quite. '}<span style={{color:C.text}}>{currentStep.explanation}</span></div>}
          </div>
        )}
      </div>
      <button style={{...S.primaryBtn,opacity:currentStep.type==='quiz'&&quizAnswer===null?0.4:1}} disabled={currentStep.type==='quiz'&&quizAnswer===null} onClick={next}>
        {isLast?'Complete Lesson ✓':'Next →'}
      </button>
    </div>
  );
}

function OpeningsScreen({openings,onStartGame}) {
  const [selected,setSelected] = useState(null);
  return (
    <div style={{padding:'16px 16px 24px'}}>
      <div style={S.screenTitle}>Opening Repertoire</div>
      <div style={{color:C.muted,fontSize:12,textAlign:'center',marginBottom:16,fontStyle:'italic'}}>Build your opening knowledge with structured theory</div>
      {openings.map((op,i)=>(
        <button key={i} onClick={()=>setSelected(selected===i?null:i)} style={{width:'100%',background:C.surface,border:`1px solid ${selected===i?C.gold:C.border}`,borderRadius:14,padding:16,cursor:'pointer',marginBottom:10,textAlign:'left'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
            <div>
              <div style={{color:C.gold,fontSize:10,fontFamily:'Cinzel,serif',letterSpacing:2,marginBottom:2}}>{op.eco}</div>
              <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:16}}>{op.name}</div>
            </div>
            <div style={{color:C.muted,fontSize:16}}>{selected===i?'↑':'↓'}</div>
          </div>
          <div style={{color:C.muted,fontSize:12,fontFamily:'monospace'}}>{op.moves}</div>
          {selected===i&&(
            <div style={{marginTop:12,borderTop:`1px solid ${C.border}`,paddingTop:12}}>
              <div style={{color:C.text,fontSize:13,lineHeight:1.6}}>{op.description}</div>
              <button style={{...S.primaryBtn,marginTop:12}} onClick={()=>onStartGame('pve',5)}>Practice This Opening</button>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function ProfileScreen({userStats}) {
  const {elo,gamesPlayed,accuracy,streak,puzzlesSolved,winRate} = userStats;
  const chartData=[1180,1195,1210,1198,1220,1235,1247];
  const max=Math.max(...chartData),min=Math.min(...chartData);
  const pts=chartData.map((v,i)=>({x:(i/(chartData.length-1))*100,y:100-((v-min)/(max-min||1))*80-10}));
  const path=pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <div style={{padding:'16px 16px 24px'}}>
      <div style={{textAlign:'center',paddingTop:8,marginBottom:20}}>
        <div style={{fontSize:64,marginBottom:8}}>♟</div>
        <div style={{color:C.text,fontFamily:'Cinzel,serif',fontSize:20,marginBottom:4}}>Chess Player</div>
        <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:28,fontWeight:700,marginBottom:8}}>{elo} ELO</div>
        <div style={{display:'inline-block',background:C.goldDim,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:'4px 16px',color:C.gold,fontSize:12,fontFamily:'Cinzel,serif',letterSpacing:2}}>Club Player</div>
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:20}}>
        <div style={{color:C.muted,fontFamily:'Cinzel,serif',fontSize:12,letterSpacing:2,marginBottom:8}}>RATING HISTORY</div>
        <svg width="100%" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a84c" stopOpacity="0.3"/><stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/></linearGradient></defs>
          <path d={`${path} L 100 100 L 0 100 Z`} fill="url(#g)"/>
          <path d={path} fill="none" stroke="#c9a84c" strokeWidth="2"/>
          {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2" fill="#c9a84c"/>)}
        </svg>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
          <span style={{color:C.muted,fontSize:11,fontFamily:'Cinzel,serif'}}>{min}</span>
          <span style={{color:C.muted,fontSize:11,fontFamily:'Cinzel,serif'}}>{max}</span>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[{label:'Games',val:gamesPlayed,icon:'⚔'},{label:'Win Rate',val:winRate+'%',icon:'🏆'},{label:'Accuracy',val:accuracy.toFixed(1)+'%',icon:'🎯'},{label:'Streak',val:streak,icon:'🔥'},{label:'Puzzles',val:puzzlesSolved,icon:'⭐'},{label:'Best ELO',val:elo,icon:'📈'}].map(s=>(
          <div key={s.label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 8px',textAlign:'center'}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{color:C.gold,fontFamily:'Cinzel,serif',fontSize:18,fontWeight:700}}>{s.val}</div>
            <div style={{color:C.muted,fontSize:9,fontFamily:'Cinzel,serif',letterSpacing:1,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
