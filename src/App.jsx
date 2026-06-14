import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Clock, MapPin, User, Check, Calendar, Users, ChevronDown, ChevronUp, LogOut, Filter, List, CalendarDays, ArrowLeft, Search, X, Columns } from 'lucide-react';

// --- FIREBASE INITIALISIERUNG ---
// Deine eigenen Firebase-Daten für das finale Hosting:
const userFirebaseConfig = {
  apiKey: "AIzaSyCNPIf1rBmjgf-ETdCaGuehPmcOyyIHl0U",
  authDomain: "hurricane-2026-40d21.firebaseapp.com",
  projectId: "hurricane-2026-40d21",
  storageBucket: "hurricane-2026-40d21.firebasestorage.app",
  messagingSenderId: "608765420460",
  appId: "1:608765420460:web:815ea3902f2856c2615009"
};

// Weiche: Nutzt die Vorschau-Datenbank hier im Editor, aber deine eigene Datenbank beim Hosting!
const isCanvas = typeof __firebase_config !== 'undefined';
const firebaseConfig = isCanvas ? JSON.parse(__firebase_config) : userFirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = isCanvas && typeof __app_id !== 'undefined' ? __app_id : 'hurricane-crew-2026';

// --- HURRICANE 2026 TIMETABLE DATEN ---
// Die echten Zeiten & Stages für 2026 inkl. realistischer Endzeiten
const HURRICANE_ACTS = [
  // Donnerstag
  { id: 'do1', day: 'Donnerstag', time: '17:30', endTime: '18:30', stage: 'Wild Coast Stage', name: 'Hansemädchen' },
  { id: 'do2', day: 'Donnerstag', time: '18:30', endTime: '19:30', stage: 'Wild Coast Stage', name: 'Siegfried & Joy' },
  { id: 'do3', day: 'Donnerstag', time: '20:00', endTime: '21:00', stage: 'Wild Coast Stage', name: 'Herrenmagazin' },
  { id: 'do4', day: 'Donnerstag', time: '21:30', endTime: '22:30', stage: 'Wild Coast Stage', name: 'Paula Carolina' },
  { id: 'do5', day: 'Donnerstag', time: '23:00', endTime: '00:15', stage: 'Wild Coast Stage', name: 'Juli' },
  { id: 'do6', day: 'Donnerstag', time: '00:45', endTime: '02:00', stage: 'Wild Coast Stage', name: 'Disarstar' },
  { id: 'do7', day: 'Donnerstag', time: '02:00', endTime: '05:00', stage: 'Wild Coast Stage', name: 'Buzz Beat Boutique' },

  // Freitag
  { id: 'fr1', day: 'Freitag', time: '15:00', endTime: '15:30', stage: 'Forest Stage', name: '#HURRICANESWIMTEAM' },
  { id: 'fr2', day: 'Freitag', time: '15:30', endTime: '16:00', stage: 'River Stage', name: 'Anda Morts' },
  { id: 'fr3', day: 'Freitag', time: '15:30', endTime: '16:00', stage: 'Wild Coast Stage', name: 'Raynor' },
  { id: 'fr4', day: 'Freitag', time: '16:00', endTime: '16:45', stage: 'Forest Stage', name: 'Grandson' },
  { id: 'fr5', day: 'Freitag', time: '16:00', endTime: '16:45', stage: 'Mountain Stage', name: 'The Ataris' },
  { id: 'fr6', day: 'Freitag', time: '16:30', endTime: '17:15', stage: 'River Stage', name: 'Rikas' },
  { id: 'fr7', day: 'Freitag', time: '16:30', endTime: '17:15', stage: 'Wild Coast Stage', name: 'Militarie Gun' },
  { id: 'fr8', day: 'Freitag', time: '17:15', endTime: '18:15', stage: 'Forest Stage', name: 'Sondaschule' },
  { id: 'fr9', day: 'Freitag', time: '17:15', endTime: '18:00', stage: 'Mountain Stage', name: 'Basement' },
  { id: 'fr10', day: 'Freitag', time: '18:00', endTime: '19:00', stage: 'River Stage', name: 'Royel Otis' },
  { id: 'fr11', day: 'Freitag', time: '18:00', endTime: '19:00', stage: 'Wild Coast Stage', name: 'Kayla Shyx' },
  { id: 'fr12', day: 'Freitag', time: '18:45', endTime: '19:45', stage: 'Forest Stage', name: 'Donots' },
  { id: 'fr13', day: 'Freitag', time: '18:45', endTime: '19:45', stage: 'Mountain Stage', name: 'President' },
  { id: 'fr14', day: 'Freitag', time: '19:30', endTime: '20:30', stage: 'River Stage', name: 'Bosse' },
  { id: 'fr15', day: 'Freitag', time: '19:30', endTime: '20:30', stage: 'Wild Coast Stage', name: 'Esther Graf' },
  { id: 'fr16', day: 'Freitag', time: '20:30', endTime: '21:45', stage: 'Forest Stage', name: 'The Offspring' },
  { id: 'fr17', day: 'Freitag', time: '20:30', endTime: '21:45', stage: 'Mountain Stage', name: 'Drunken Masters' },
  { id: 'fr18', day: 'Freitag', time: '21:45', endTime: '23:15', stage: 'River Stage', name: 'Yungblud' },
  { id: 'fr19', day: 'Freitag', time: '21:45', endTime: '22:45', stage: 'Wild Coast Stage', name: 'Betterov' },
  { id: 'fr20', day: 'Freitag', time: '23:00', endTime: '00:30', stage: 'Forest Stage', name: 'Kraftklub' },
  { id: 'fr21', day: 'Freitag', time: '23:15', endTime: '00:30', stage: 'Mountain Stage', name: 'Pennywise' },
  { id: 'fr22', day: 'Freitag', time: '23:15', endTime: '00:15', stage: 'Wild Coast Stage', name: 'Roya' },
  { id: 'fr23', day: 'Freitag', time: '00:30', endTime: '02:00', stage: 'River Stage', name: 'Roy Bianco & Die Abbrunzati Boys' },
  { id: 'fr24', day: 'Freitag', time: '00:45', endTime: '02:00', stage: 'Wild Coast Stage', name: 'Modestep (Live)' },

  // Samstag
  { id: 'sa1', day: 'Samstag', time: '11:00', endTime: '12:00', stage: 'Wild Coast Stage', name: 'Deutschland3000' },
  { id: 'sa2', day: 'Samstag', time: '12:00', endTime: '12:30', stage: 'Forest Stage', name: 'Just Mustard' },
  { id: 'sa3', day: 'Samstag', time: '12:00', endTime: '12:30', stage: 'Mountain Stage', name: 'Blackgold' },
  { id: 'sa4', day: 'Samstag', time: '12:30', endTime: '13:00', stage: 'River Stage', name: 'Latin Greek' },
  { id: 'sa5', day: 'Samstag', time: '12:30', endTime: '13:00', stage: 'Wild Coast Stage', name: 'Violent Vortex' },
  { id: 'sa6', day: 'Samstag', time: '13:00', endTime: '13:45', stage: 'Forest Stage', name: 'Scene Queen' },
  { id: 'sa7', day: 'Samstag', time: '13:00', endTime: '13:45', stage: 'Mountain Stage', name: 'The Sophs' },
  { id: 'sa8', day: 'Samstag', time: '13:30', endTime: '14:15', stage: 'River Stage', name: 'Florence Road' },
  { id: 'sa9', day: 'Samstag', time: '13:30', endTime: '14:15', stage: 'Wild Coast Stage', name: 'Picture Parlour' },
  { id: 'sa10', day: 'Samstag', time: '14:15', endTime: '15:00', stage: 'Forest Stage', name: 'Destroy Boys' },
  { id: 'sa11', day: 'Samstag', time: '14:15', endTime: '15:00', stage: 'Mountain Stage', name: 'Drei Meter Feldweg' },
  { id: 'sa12', day: 'Samstag', time: '14:45', endTime: '15:30', stage: 'River Stage', name: 'Ritter Lean' },
  { id: 'sa13', day: 'Samstag', time: '14:45', endTime: '15:30', stage: 'Wild Coast Stage', name: 'Yonaka' },
  { id: 'sa14', day: 'Samstag', time: '15:30', endTime: '16:30', stage: 'Forest Stage', name: 'All Time Low' },
  { id: 'sa15', day: 'Samstag', time: '15:30', endTime: '16:30', stage: 'Mountain Stage', name: 'PA69' },
  { id: 'sa16', day: 'Samstag', time: '16:00', endTime: '17:00', stage: 'River Stage', name: 'Natasha Bedingfield' },
  { id: 'sa17', day: 'Samstag', time: '16:15', endTime: '17:15', stage: 'Wild Coast Stage', name: 'Kingfishr' },
  { id: 'sa18', day: 'Samstag', time: '17:00', endTime: '18:00', stage: 'Forest Stage', name: 'Alexisonfire' },
  { id: 'sa19', day: 'Samstag', time: '17:00', endTime: '18:00', stage: 'Mountain Stage', name: 'Kasi' },
  { id: 'sa20', day: 'Samstag', time: '17:45', endTime: '18:45', stage: 'River Stage', name: 'Kaffkiez' },
  { id: 'sa21', day: 'Samstag', time: '18:00', endTime: '18:45', stage: 'Wild Coast Stage', name: 'RØRY' },
  { id: 'sa22', day: 'Samstag', time: '18:45', endTime: '19:45', stage: 'Forest Stage', name: 'Nothing But Thieves' },
  { id: 'sa23', day: 'Samstag', time: '18:45', endTime: '19:45', stage: 'Mountain Stage', name: 'OG Keemo' },
  { id: 'sa24', day: 'Samstag', time: '19:30', endTime: '20:30', stage: 'River Stage', name: 'Wolf Alice' },
  { id: 'sa25', day: 'Samstag', time: '19:45', endTime: '20:45', stage: 'Wild Coast Stage', name: 'Orville Peck' },
  { id: 'sa26', day: 'Samstag', time: '20:30', endTime: '21:45', stage: 'Forest Stage', name: 'Papa Roach' },
  { id: 'sa27', day: 'Samstag', time: '20:45', endTime: '22:00', stage: 'Mountain Stage', name: 'Edwin Rosen' },
  { id: 'sa28', day: 'Samstag', time: '21:45', endTime: '23:15', stage: 'River Stage', name: 'Florence + The Machine' },
  { id: 'sa29', day: 'Samstag', time: '21:45', endTime: '23:15', stage: 'Wild Coast Stage', name: 'Tinlicker' },
  { id: 'sa30', day: 'Samstag', time: '22:55', endTime: '00:30', stage: 'Forest Stage', name: 'Twenty One Pilots' },
  { id: 'sa31', day: 'Samstag', time: '23:15', endTime: '00:30', stage: 'Mountain Stage', name: 'SSIO' },
  { id: 'sa32', day: 'Samstag', time: '23:30', endTime: '01:00', stage: 'Wild Coast Stage', name: 'David Puentez' },
  { id: 'sa33', day: 'Samstag', time: '00:30', endTime: '02:00', stage: 'River Stage', name: 'Finch' },

  // Sonntag
  { id: 'so1', day: 'Sonntag', time: '10:30', endTime: '12:00', stage: 'Wild Coast Stage', name: 'Der Spiegel Live' },
  { id: 'so2', day: 'Sonntag', time: '12:00', endTime: '12:30', stage: 'Forest Stage', name: 'Ecca Vandal' },
  { id: 'so3', day: 'Sonntag', time: '12:00', endTime: '12:30', stage: 'Mountain Stage', name: 'Delilah Bon' },
  { id: 'so4', day: 'Sonntag', time: '12:30', endTime: '13:00', stage: 'River Stage', name: 'Unpeople' },
  { id: 'so5', day: 'Sonntag', time: '12:30', endTime: '13:00', stage: 'Wild Coast Stage', name: 'Boviy' },
  { id: 'so6', day: 'Sonntag', time: '13:00', endTime: '13:45', stage: 'Forest Stage', name: 'Skindred' },
  { id: 'so7', day: 'Sonntag', time: '13:00', endTime: '13:45', stage: 'Mountain Stage', name: 'Rosmarin' },
  { id: 'so8', day: 'Sonntag', time: '13:30', endTime: '14:15', stage: 'River Stage', name: 'Davina Michelle' },
  { id: 'so9', day: 'Sonntag', time: '13:30', endTime: '14:15', stage: 'Wild Coast Stage', name: 'Paula Engels' },
  { id: 'so10', day: 'Sonntag', time: '14:15', endTime: '15:15', stage: 'Forest Stage', name: 'Zebrahead' },
  { id: 'so11', day: 'Sonntag', time: '14:15', endTime: '15:15', stage: 'Mountain Stage', name: 'Vicky' },
  { id: 'so12', day: 'Sonntag', time: '15:00', endTime: '16:00', stage: 'River Stage', name: 'The Beaches' },
  { id: 'so13', day: 'Sonntag', time: '15:00', endTime: '16:00', stage: 'Wild Coast Stage', name: 'Tors' },
  { id: 'so14', day: 'Sonntag', time: '16:00', endTime: '17:00', stage: 'Forest Stage', name: 'The Butcher Sisters' },
  { id: 'so15', day: 'Sonntag', time: '16:00', endTime: '17:00', stage: 'Mountain Stage', name: 'Filow' },
  { id: 'so16', day: 'Sonntag', time: '16:45', endTime: '17:45', stage: 'River Stage', name: 'Clueso' },
  { id: 'so17', day: 'Sonntag', time: '16:45', endTime: '17:45', stage: 'Wild Coast Stage', name: 'Sprints' },
  { id: 'so18', day: 'Sonntag', time: '17:45', endTime: '18:45', stage: 'Forest Stage', name: 'A Day To Remember' },
  { id: 'so19', day: 'Sonntag', time: '17:45', endTime: '18:45', stage: 'Mountain Stage', name: 'Levin Liam' },
  { id: 'so20', day: 'Sonntag', time: '18:30', endTime: '19:45', stage: 'River Stage', name: 'Empire Of The Sun' },
  { id: 'so21', day: 'Sonntag', time: '18:45', endTime: '19:45', stage: 'Wild Coast Stage', name: 'Leony' },
  { id: 'so22', day: 'Sonntag', time: '19:45', endTime: '21:00', stage: 'Mountain Stage', name: 'BHZ' },
  { id: 'so23', day: 'Sonntag', time: '20:00', endTime: '21:00', stage: 'Forest Stage', name: 'Halsey' },
  { id: 'so24', day: 'Sonntag', time: '20:45', endTime: '22:15', stage: 'Wild Coast Stage', name: 'Boys Noize' },
  { id: 'so25', day: 'Sonntag', time: '21:00', endTime: '22:30', stage: 'River Stage', name: 'Provinz' },
  { id: 'so26', day: 'Sonntag', time: '22:30', endTime: '00:00', stage: 'Forest Stage', name: 'Billy Talent' },
  { id: 'so27', day: 'Sonntag', time: '22:30', endTime: '00:00', stage: 'Wild Coast Stage', name: 'Modeselektor' }
];

// Helper: Konvertiert Zeit ("15:30") in Minuten für sauberes Sortieren. 
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let total = hours * 60 + minutes;
  if (hours < 6) total += 24 * 60; 
  return total;
};

const SORTED_ACTS = [...HURRICANE_ACTS].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
const PIXELS_PER_MINUTE = 2.5;

export default function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [activeDay, setActiveDay] = useState('Freitag');
  const [activeStage, setActiveStage] = useState('Alle');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentTab, setCurrentTab] = useState('timetable');
  const [selectedCrewMember, setSelectedCrewMember] = useState(null);
  const [now, setNow] = useState(new Date());
  const [allVotes, setAllVotes] = useState({});
  const [expandedAct, setExpandedAct] = useState(null);
  const [modalActId, setModalActId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) setUser(authUser);
    });

    const initAuth = async () => {
      try {
        if (isCanvas && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error", err);
        setUser({ uid: 'fallback-test-user' });
      }
    };
    initAuth();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem('hurricaneName');
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'userVotes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data().votes || {};
      });
      setAllVotes(data);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputName.trim().length > 0) {
      const nameToSave = inputName.trim();
      setUserName(nameToSave);
      localStorage.setItem('hurricaneName', nameToSave);
    }
  };

  const handleLogout = () => {
    setUserName('');
    localStorage.removeItem('hurricaneName');
    setInputName('');
  };

  const handleVote = async (actId, status) => {
    if (!user || !userName) return;
    const currentUserVotes = allVotes[userName] ? { ...allVotes[userName] } : {};
    
    if (status === 'remove') {
      delete currentUserVotes[actId];
    } else {
      currentUserVotes[actId] = status;
    }

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'userVotes', userName);
    if (Object.keys(currentUserVotes).length === 0) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { userName: userName, votes: currentUserVotes });
    }
  };

  const getActAttendees = (actId) => {
    const definitely = [];
    const ifFits = [];
    Object.entries(allVotes).forEach(([name, votesMap]) => {
      if (votesMap[actId] === 'definitely') definitely.push(name);
      if (votesMap[actId] === 'if-fits') ifFits.push(name);
    });
    return { definitely, ifFits };
  };

  // VERBESSERTES MODAL: Zentriert & Intern Scrollbar
  const renderActModal = () => {
    if (!modalActId) return null;
    const act = HURRICANE_ACTS.find(a => a.id === modalActId);
    if (!act) return null;

    const attendees = getActAttendees(act.id);
    const totalAttendees = attendees.definitely.length + attendees.ifFits.length;
    const myVote = (allVotes[userName] || {})[act.id] || null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setModalActId(null)}>
        <div 
          className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95"
          onClick={e => e.stopPropagation()} 
        >
          {/* Modal Header - Bleibt immer oben */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900 flex justify-between items-start shrink-0 rounded-t-2xl">
            <div>
              <h3 className="text-xl font-black text-white mb-1">{act.name}</h3>
              <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {act.time} - {act.endTime} Uhr
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className={
                    act.stage === 'Forest Stage' ? 'text-green-400' :
                    act.stage === 'River Stage' ? 'text-blue-400' :
                    act.stage === 'Mountain Stage' ? 'text-purple-400' : 'text-orange-400'
                  } />
                  {act.stage}
                </span>
              </div>
            </div>
            <button onClick={() => setModalActId(null)} className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full shrink-0 ml-4">
              <X size={18} />
            </button>
          </div>

          {/* Modal Content - Scrollt intern wenn zu lang */}
          <div className="p-4 sm:p-5 bg-zinc-900/80 space-y-6 overflow-y-auto rounded-b-2xl">
            {/* Voting */}
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bist du dabei?</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleVote(act.id, 'definitely')}
                  className={`flex-1 min-w-[120px] py-3 sm:py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    myVote === 'definitely' ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {myVote === 'definitely' && <Check size={16} />} Auf jeden Fall!
                </button>
                <button 
                  onClick={() => handleVote(act.id, 'if-fits')}
                  className={`flex-1 min-w-[120px] py-3 sm:py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    myVote === 'if-fits' ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {myVote === 'if-fits' && <Check size={16} />} Nur wenns passt
                </button>
                {myVote && (
                  <button 
                    onClick={() => handleVote(act.id, 'remove')}
                    className="w-full sm:w-auto py-3 sm:py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-all mt-1 sm:mt-0"
                  >
                    Löschen
                  </button>
                )}
              </div>
            </div>

            {/* Crew Status */}
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Crew Status ({totalAttendees})</p>
              {totalAttendees === 0 ? (
                <p className="text-sm text-zinc-500 italic">Noch niemand eingetragen.</p>
              ) : (
                <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                  {attendees.definitely.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                      <div className="text-zinc-300">
                        <span className="font-semibold text-emerald-400">Dabei: </span>
                        {attendees.definitely.join(', ')}
                      </div>
                    </div>
                  )}
                  {attendees.ifFits.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                      <div className="text-zinc-400">
                        <span className="font-semibold text-yellow-500">Vielleicht: </span>
                        {attendees.ifFits.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!userName) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <User className="text-zinc-950 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-center mb-2 text-white">Hurricane '26</h1>
          <p className="text-zinc-400 text-center mb-8">Gemeinsamer Timetable deiner Crew.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Wie heißt du?</label>
              <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Dein Vorname / Spitzname" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-zinc-600 outline-none transition-all" required />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-colors">Los geht's</button>
          </form>
        </div>
      </div>
    );
  }

  const days = ['Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const timelineStages = ['Forest Stage', 'River Stage', 'Mountain Stage', 'Wild Coast Stage'];
  const stages = ['Alle', ...timelineStages];
  
  const actsForDay = isSearching 
    ? SORTED_ACTS.filter(act => act.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : SORTED_ACTS.filter(act => act.day === activeDay && (activeStage === 'Alle' || act.stage === activeStage));

  const myVotes = allVotes[userName] || {};
  const myActs = SORTED_ACTS.filter(act => myVotes[act.id]);

  const currentDayString = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + (now.getHours() < 6 ? 24 * 60 : 0);

  const viewToggleUI = (
    <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 flex-shrink-0">
      <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`} title="Listenansicht">
        <List size={16} />
      </button>
      <button onClick={() => setViewMode('timeline')} className={`p-1.5 rounded transition-all ${viewMode === 'timeline' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`} title="Timeline Balkenansicht">
        <Columns size={16} />
      </button>
    </div>
  );

  // VERBESSERTES TIMELINE-GRID: Nativ Edge-to-Edge & Ohne horizontales Scrollen
  const renderTimelineGrid = (dayString, actsToDisplay, showDayTitle = false) => {
    const allActsForTimelineDay = SORTED_ACTS.filter(act => act.day === dayString);
    if (allActsForTimelineDay.length === 0) return null;

    const minMins = Math.min(...allActsForTimelineDay.map(a => timeToMinutes(a.time)));
    const maxMins = Math.max(...allActsForTimelineDay.map(a => timeToMinutes(a.endTime)));
    
    const startHourMins = Math.floor(minMins / 60) * 60;
    const endHourMins = Math.ceil(maxMins / 60) * 60;
    const totalGridMinutes = endHourMins - startHourMins;
    
    const numHours = totalGridMinutes / 60;
    const timelineHours = Array.from({ length: numHours + 1 }).map((_, i) => startHourMins + i * 60);

    return (
      <div key={dayString} className={showDayTitle ? "mb-12" : ""}>
        {showDayTitle && (
          <h3 className="text-xl font-black text-white mb-4 sticky top-[70px] bg-zinc-950/90 backdrop-blur-sm py-2 z-10 border-b border-zinc-800/50 px-4 sm:px-0">
            {dayString}
          </h3>
        )}
        
        {actsToDisplay.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 mx-4 sm:mx-0">
            <CalendarDays className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">Du hast für {dayString} noch keine Acts ausgewählt.</p>
          </div>
        ) : (
          <div className="w-full border-y sm:border sm:rounded-2xl border-zinc-800/60 bg-zinc-950 sm:bg-zinc-900/30 overflow-hidden">
            {/* w-full verhindert seitliches Scrollen absolut zuverlässig */}
            <div className="w-full flex relative" style={{ height: `${totalGridMinutes * PIXELS_PER_MINUTE + 60}px` }}>
              
              {/* Zeit-Achse (Y-Achse) */}
              <div className="w-10 sm:w-16 flex-shrink-0 border-r border-zinc-800/50 bg-zinc-900/40 z-20 relative top-[40px]">
                {timelineHours.map((mins) => {
                  const hourLabel = `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:00`;
                  const topPx = (mins - startHourMins) * PIXELS_PER_MINUTE;
                  return (
                    <div key={mins} className="absolute w-full text-right pr-1 sm:pr-2" style={{ top: topPx - 8 }}>
                      <span className="text-[8px] sm:text-[10px] font-bold text-zinc-500">{hourLabel}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bühnen Spalten */}
              <div className="flex-1 flex relative min-w-0">
                {/* Horizontale Gitterlinien */}
                <div className="absolute inset-0 pointer-events-none top-[40px]">
                  {timelineHours.map((mins) => (
                    <div key={mins} className="absolute w-full border-t border-zinc-800/30" style={{ top: (mins - startHourMins) * PIXELS_PER_MINUTE }} />
                  ))}
                </div>

                {timelineStages.map(stage => {
                  const stageActs = actsToDisplay.filter(a => a.stage === stage);
                  const headerColor = stage === 'Forest Stage' ? 'border-b-green-500' :
                                      stage === 'River Stage' ? 'border-b-blue-500' :
                                      stage === 'Mountain Stage' ? 'border-b-purple-500' : 'border-b-orange-500';

                  return (
                    <div key={stage} className="flex-1 border-r border-zinc-800/40 last:border-r-0 relative group min-w-0">
                      {/* Spalten-Header */}
                      <div className={`h-[40px] sticky top-0 bg-zinc-900/95 backdrop-blur-md border-b-2 ${headerColor} z-30 flex items-center justify-center px-0.5 sm:px-1 overflow-hidden`}>
                        <span className="text-[8px] sm:text-[11px] font-black uppercase text-zinc-300 truncate tracking-tighter" title={stage}>{stage.replace(' Stage', '')}</span>
                      </div>
                      
                      {/* Spalten-Inhalt (Acts) */}
                      <div className="relative w-full h-full pt-[40px]">
                        {stageActs.map(act => {
                          const startMins = timeToMinutes(act.time);
                          const endMins = timeToMinutes(act.endTime);
                          const topPx = (startMins - startHourMins) * PIXELS_PER_MINUTE;
                          const heightPx = (endMins - startMins) * PIXELS_PER_MINUTE;
                          
                          const myVote = myVotes[act.id];
                          const totalAttendees = getActAttendees(act.id).definitely.length + getActAttendees(act.id).ifFits.length;
                          
                          const blockClasses = myVote === 'definitely' 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100 hover:bg-emerald-500/30' 
                            : myVote === 'if-fits' 
                              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100 hover:bg-yellow-500/30'
                              : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-500';

                          return (
                            <div 
                              key={act.id}
                              onClick={() => setModalActId(act.id)}
                              className={`absolute left-0.5 right-0.5 sm:left-1 sm:right-1 border rounded p-0.5 sm:p-1.5 cursor-pointer transition-all overflow-hidden flex flex-col shadow-lg backdrop-blur-md ${blockClasses}`}
                              style={{ top: topPx, height: heightPx - 2 }}
                            >
                              <span className="text-[7px] sm:text-[10px] font-bold opacity-80 mb-0.5 leading-none truncate">
                                {act.time}-{act.endTime}
                              </span>
                              <span className="text-[8px] sm:text-xs font-black leading-tight overflow-hidden text-ellipsis line-clamp-2 sm:line-clamp-3">
                                {act.name}
                              </span>
                              
                              {/* Icon Badge für Crew */}
                              {totalAttendees > 0 && (
                                <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 flex items-center gap-0.5 bg-black/50 px-1 rounded text-[7px] sm:text-[9px] font-bold">
                                  <Users size={8} /> {totalAttendees}
                                </div>
                              )}
                              
                              {/* Vote Icons */}
                              {myVote && (
                                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                                  <Check size={8} className={`sm:w-2.5 sm:h-2.5 ${myVote === 'definitely' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-emerald-500">Hurricane</span> Crew
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-sm text-zinc-400 flex items-center gap-1 bg-zinc-800/50 px-3 py-1.5 rounded-full">
                <User size={14} className="text-emerald-500"/> 
                <span className="font-medium text-zinc-200">{userName}</span>
              </div>
              <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition-colors p-2">
                <LogOut size={18} />
              </button>
            </div>
          </div>
          
          {/* Umschalter nach Oben verschoben in die Toolbar */}
          {currentTab === 'timetable' && (
            <div className="mb-4 flex gap-2 items-center">
              <div className={`flex-1 flex items-center border rounded-xl overflow-hidden transition-colors ${isSearching ? 'border-emerald-500 bg-zinc-950' : 'border-zinc-800 bg-zinc-900'}`}>
                <Search className={`ml-3 ${isSearching ? 'text-emerald-500' : 'text-zinc-500'}`} size={18} />
                <input
                  type="text" placeholder="Suche nach Bands..." value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(e.target.value.length > 0); }}
                  className="w-full bg-transparent border-none text-white px-3 py-2.5 focus:outline-none placeholder-zinc-500"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setIsSearching(false); }} className="p-2 mr-1 text-zinc-400 hover:text-white">
                    <X size={18} />
                  </button>
                )}
              </div>
              {!isSearching && viewToggleUI}
            </div>
          )}

          {currentTab === 'myplan' && !isSearching && (
            <div className="pb-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="text-emerald-500" size={20} />
                Mein Timetable
              </h2>
              {viewToggleUI}
            </div>
          )}

          {currentTab === 'crew' && (
            <div className="pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {selectedCrewMember ? (
                  <button onClick={() => setSelectedCrewMember(null)} className="text-zinc-400 hover:text-white transition-colors p-1 -ml-1">
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <Users className="text-emerald-500" size={20} />
                )}
                <h2 className="text-lg font-bold text-white">
                  {selectedCrewMember ? `Plan von ${selectedCrewMember}` : 'Crew Übersicht'}
                </h2>
              </div>
              {selectedCrewMember && viewToggleUI}
            </div>
          )}

          {(currentTab === 'timetable' || currentTab === 'myplan' || (currentTab === 'crew' && selectedCrewMember)) && !isSearching && (
            <>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
                {days.map(day => (
                  <button
                    key={day} onClick={() => { setActiveDay(day); setExpandedAct(null); }}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      activeDay === day ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {currentTab === 'timetable' && viewMode === 'list' && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mt-1">
                  {stages.map(stage => (
                    <button
                      key={stage} onClick={() => { setActiveStage(stage); setExpandedAct(null); }}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        activeStage === stage ? 'bg-zinc-200 text-zinc-900 border-zinc-200' : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {stage === 'Alle' ? <Filter size={12} /> : null}
                      {stage}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto sm:px-4 py-6 space-y-4">
        {/* VIEW: TIMETABLE */}
        {currentTab === 'timetable' && (
          <>
            {(viewMode === 'list' || isSearching) && (
              <div className="space-y-4 px-4 sm:px-0">
                {actsForDay.map(act => {
                  const isExpanded = expandedAct === act.id;
                  const attendees = getActAttendees(act.id);
                  const totalAttendees = attendees.definitely.length + attendees.ifFits.length;
                  const myVote = myVotes[act.id] || null;

                  return (
                    <div key={act.id} className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      myVote === 'definitely' ? 'border-emerald-500/50 bg-emerald-500/5' : 
                      myVote === 'if-fits' ? 'border-yellow-500/30 bg-yellow-500/5' : 
                      'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}>
                      <div className="p-4 cursor-pointer flex items-center gap-4" onClick={() => setExpandedAct(isExpanded ? null : act.id)}>
                        <div className="flex flex-col items-center justify-center min-w-[75px] text-center border-r border-zinc-800 pr-4">
                          {isSearching && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">{act.day.substring(0,2)}</span>}
                          <span className="text-lg font-black text-white leading-none">{act.time}</span>
                          <span className="text-xs font-medium text-zinc-500 mt-1">{act.endTime}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1 leading-tight">{act.name}</h3>
                          <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className={act.stage === 'Forest Stage' ? 'text-green-400' : act.stage === 'River Stage' ? 'text-blue-400' : act.stage === 'Mountain Stage' ? 'text-purple-400' : 'text-orange-400'} />
                              {act.stage}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {totalAttendees > 0 && (
                            <div className="flex items-center gap-1.5 bg-zinc-800 px-2 py-1 rounded text-xs font-bold">
                              <Users size={12} className="text-zinc-400" />
                              <span className="text-zinc-200">{totalAttendees}</span>
                            </div>
                          )}
                          {isExpanded ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-zinc-800/50 bg-zinc-900/80">
                          <div className="mb-5">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bist du dabei?</p>
                            <div className="flex flex-wrap gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'definitely'); }} className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${myVote === 'definitely' ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                                {myVote === 'definitely' && <Check size={16} />} Auf jeden Fall!
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'if-fits'); }} className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${myVote === 'if-fits' ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                                {myVote === 'if-fits' && <Check size={16} />} Nur wenns passt
                              </button>
                              {myVote && (
                                <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'remove'); }} className="py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-all">
                                  Löschen
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Crew Status</p>
                            {totalAttendees === 0 ? <p className="text-sm text-zinc-500 italic">Noch niemand eingetragen.</p> : (
                              <div className="space-y-2">
                                {attendees.definitely.length > 0 && (
                                  <div className="flex items-start gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                    <div className="text-zinc-300"><span className="font-semibold text-emerald-400">Dabei: </span>{attendees.definitely.join(', ')}</div>
                                  </div>
                                )}
                                {attendees.ifFits.length > 0 && (
                                  <div className="flex items-start gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                                    <div className="text-zinc-400"><span className="font-semibold text-yellow-500">Vielleicht: </span>{attendees.ifFits.join(', ')}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {actsForDay.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium">{isSearching ? 'Keine Acts für diese Suche gefunden.' : 'Keine Acts für diesen Filter gefunden.'}</p>
                  </div>
                )}
              </div>
            )}
            {(viewMode === 'timeline' && !isSearching) && renderTimelineGrid(activeDay, SORTED_ACTS.filter(a => a.day === activeDay))}
            {renderActModal()}
          </>
        )}

        {/* VIEW: MEIN PLAN */}
        {currentTab === 'myplan' && (
          <div className="space-y-4">
            {myActs.filter(a => a.day === activeDay).length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 mx-4 sm:mx-0">
                <CalendarDays className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 font-medium">Du hast für {activeDay} noch keine Acts ausgewählt.</p>
                <button onClick={() => setCurrentTab('timetable')} className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition-colors">Zum Timetable wechseln</button>
              </div>
            ) : (
              viewMode === 'timeline' ? renderTimelineGrid(activeDay, myActs.filter(a => a.day === activeDay), false) : (
                <div className="space-y-4 px-4 sm:px-0">
                  {myActs.filter(a => a.day === activeDay).map((act) => {
                    const startMins = timeToMinutes(act.time);
                    const endMins = timeToMinutes(act.endTime);
                    const isToday = currentDayString === act.day;
                    const isLiveNow = isToday && currentMinutes >= startMins && currentMinutes <= endMins;
                    const isPast = isToday && currentMinutes > endMins;
                    const voteStatus = myVotes[act.id];
                    const isExpanded = expandedAct === act.id;
                    const attendees = getActAttendees(act.id);
                    const totalAttendees = attendees.definitely.length + attendees.ifFits.length;

                    return (
                      <div key={act.id} className="relative flex gap-4">
                        <div className="absolute left-[29px] top-8 bottom-[-24px] w-0.5 bg-zinc-800 last:hidden"></div>
                        <div className="flex flex-col items-end min-w-[60px] pt-1 z-10 bg-zinc-950">
                          <span className={`text-base font-black ${isPast ? 'text-zinc-600' : 'text-zinc-200'}`}>{act.time}</span>
                          <span className="text-xs font-medium text-zinc-600">{act.endTime}</span>
                        </div>
                        <div className={`flex-1 rounded-xl border z-10 transition-all ${isLiveNow ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : isPast ? 'border-zinc-800/50 bg-zinc-900/30 opacity-60' : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'}`}>
                          <div className="p-4 cursor-pointer" onClick={() => setExpandedAct(isExpanded ? null : act.id)}>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-lg font-bold leading-tight ${isPast ? 'text-zinc-400' : 'text-white'}`}>{act.name}</h4>
                              <div className="flex items-center gap-2">
                                {isLiveNow && <span className="bg-emerald-500 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Jetzt</span>}
                                {isExpanded ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium text-zinc-400 mb-3">
                              <span className="flex items-center gap-1"><MapPin size={12} className={act.stage === 'Forest Stage' ? 'text-green-400' : act.stage === 'River Stage' ? 'text-blue-400' : act.stage === 'Mountain Stage' ? 'text-purple-400' : 'text-orange-400'} />{act.stage}</span>
                              <span className="flex items-center gap-1"><Clock size={12} />{startMins < 0 ? '' : `${endMins - startMins} Min.`}</span>
                              {totalAttendees > 1 && <span className="flex items-center gap-1 ml-auto bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300"><Users size={12} /> {totalAttendees}</span>}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${voteStatus === 'definitely' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-500'}`}>{voteStatus === 'definitely' ? 'Auf jeden Fall' : 'Nur wenns passt'}</span>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 border-t border-zinc-800/50 bg-zinc-900/80">
                              <div className="mb-5">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bist du dabei?</p>
                                <div className="flex flex-wrap gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'definitely'); }} className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${voteStatus === 'definitely' ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                                    {voteStatus === 'definitely' && <Check size={16} />} Auf jeden Fall!
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'if-fits'); }} className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${voteStatus === 'if-fits' ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                                    {voteStatus === 'if-fits' && <Check size={16} />} Nur wenns passt
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'remove'); }} className="py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-all">Löschen</button>
                                </div>
                              </div>
                              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Crew Status</p>
                              {totalAttendees <= 1 ? <p className="text-sm text-zinc-500 italic">Außer dir noch niemand eingetragen.</p> : (
                                <div className="space-y-2">
                                  {attendees.definitely.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                      <div className="text-zinc-300"><span className="font-semibold text-emerald-400">Dabei: </span>{attendees.definitely.join(', ')}</div>
                                    </div>
                                  )}
                                  {attendees.ifFits.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                                      <div className="text-zinc-400"><span className="font-semibold text-yellow-500">Vielleicht: </span>{attendees.ifFits.join(', ')}</div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
            {viewMode === 'timeline' && renderActModal()}
          </div>
        )}

        {/* VIEW: CREW */}
        {currentTab === 'crew' && !selectedCrewMember && (
          <div className="space-y-3 px-4 sm:px-0">
            {Object.keys(allVotes).length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 font-medium">Bisher hat sich noch niemand eingetragen.</p>
              </div>
            ) : (
              Object.entries(allVotes)
                .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                .map(([name, votes]) => {
                  const voteCount = Object.keys(votes).length;
                  return (
                    <div key={name} onClick={() => setSelectedCrewMember(name)} className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex justify-between items-center cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-900 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-inner ${name === userName ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-emerald-500'}`}>{name.charAt(0).toUpperCase()}</div>
                        <span className={`font-bold ${name === userName ? 'text-emerald-400' : 'text-white'}`}>{name} {name === userName && '(Du)'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/50">
                        <span>{voteCount} Acts</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {currentTab === 'crew' && selectedCrewMember && (
          <div className="space-y-4">
            {(() => {
              const friendVotes = allVotes[selectedCrewMember] || {};
              const friendActsDay = SORTED_ACTS.filter(act => friendVotes[act.id] && act.day === activeDay);

              if (friendActsDay.length === 0) {
                return (
                  <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 mx-4 sm:mx-0">
                    <CalendarDays className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-400 font-medium">{selectedCrewMember} hat für {activeDay} noch keine Acts ausgewählt.</p>
                  </div>
                );
              }

              return viewMode === 'timeline' ? renderTimelineGrid(activeDay, friendActsDay, false) : (
                <div className="space-y-4 px-4 sm:px-0">
                  {friendActsDay.map((act) => {
                    const startMins = timeToMinutes(act.time);
                    const endMins = timeToMinutes(act.endTime);
                    const isToday = currentDayString === act.day;
                    const isLiveNow = isToday && currentMinutes >= startMins && currentMinutes <= endMins;
                    const isPast = isToday && currentMinutes > endMins;
                    
                    const voteStatus = friendVotes[act.id];
                    const isExpanded = expandedAct === act.id;
                    const attendees = getActAttendees(act.id);
                    const totalAttendees = attendees.definitely.length + attendees.ifFits.length;
                    
                    const myVote = myVotes[act.id];

                    return (
                      <div key={act.id} className="relative flex gap-4">
                        <div className="absolute left-[29px] top-8 bottom-[-24px] w-0.5 bg-zinc-800 last:hidden"></div>
                        <div className="flex flex-col items-end min-w-[60px] pt-1 z-10 bg-zinc-950">
                          <span className={`text-base font-black ${isPast ? 'text-zinc-600' : 'text-zinc-200'}`}>{act.time}</span>
                          <span className="text-xs font-medium text-zinc-600">{act.endTime}</span>
                        </div>
                        <div className={`flex-1 rounded-xl border z-10 transition-all ${isLiveNow ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : isPast ? 'border-zinc-800/50 bg-zinc-900/30 opacity-60' : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'}`}>
                          <div className="p-4 cursor-pointer" onClick={() => setExpandedAct(isExpanded ? null : act.id)}>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-lg font-bold leading-tight ${isPast ? 'text-zinc-400' : 'text-white'}`}>{act.name}</h4>
                              <div className="flex items-center gap-2">
                                {isLiveNow && <span className="bg-emerald-500 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Jetzt</span>}
                                {isExpanded ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium text-zinc-400 mb-3">
                              <span className="flex items-center gap-1"><MapPin size={12} className={act.stage === 'Forest Stage' ? 'text-green-400' : act.stage === 'River Stage' ? 'text-blue-400' : act.stage === 'Mountain Stage' ? 'text-purple-400' : 'text-orange-400'} />{act.stage}</span>
                              {totalAttendees > 1 && <span className="flex items-center gap-1 ml-auto bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300"><Users size={12} /> {totalAttendees}</span>}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${voteStatus === 'definitely' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-500'}`}>{voteStatus === 'definitely' ? 'Auf jeden Fall' : 'Nur wenns passt'}</span>
                              {myVote && selectedCrewMember !== userName && <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md"><Check size={12} />Du bist auch da!</span>}
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 border-t border-zinc-800/50 bg-zinc-900/80">
                              <div className="mb-5">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bist du auch dabei?</p>
                                <div className="flex flex-wrap gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'definitely'); }} className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${myVote === 'definitely' ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                                    {myVote === 'definitely' && <Check size={16} />} Auf jeden Fall!
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'if-fits'); }} className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${myVote === 'if-fits' ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                                    {myVote === 'if-fits' && <Check size={16} />} Nur wenns passt
                                  </button>
                                  {myVote && <button onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'remove'); }} className="py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-all">Löschen</button>}
                                </div>
                              </div>
                              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Crew Status</p>
                              {totalAttendees <= 1 ? <p className="text-sm text-zinc-500 italic">Außer dir noch niemand eingetragen.</p> : (
                                <div className="space-y-2">
                                  {attendees.definitely.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                      <div className="text-zinc-300"><span className="font-semibold text-emerald-400">Dabei: </span>{attendees.definitely.join(', ')}</div>
                                    </div>
                                  )}
                                  {attendees.ifFits.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                                      <div className="text-zinc-400"><span className="font-semibold text-yellow-500">Vielleicht: </span>{attendees.ifFits.join(', ')}</div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            {viewMode === 'timeline' && renderActModal()}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-zinc-900 border-t border-zinc-800 pb-safe z-50">
        <div className="max-w-3xl mx-auto flex">
          <button onClick={() => setCurrentTab('timetable')} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${currentTab === 'timetable' ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <List size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Timetable</span>
          </button>
          <button onClick={() => setCurrentTab('myplan')} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors relative ${currentTab === 'myplan' ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <CalendarDays size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Mein Timetable</span>
          </button>
          <button onClick={() => { setCurrentTab('crew'); setSelectedCrewMember(null); }} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors relative ${currentTab === 'crew' ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Crew</span>
          </button>
        </div>
      </nav>
    </div>
  );
}