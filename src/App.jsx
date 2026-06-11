import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { Clock, MapPin, User, Check, Calendar, Users, ChevronDown, ChevronUp, LogOut, Filter, List, CalendarDays, AlertTriangle } from 'lucide-react';

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
  { id: 'do1', day: 'Donnerstag', time: '17:30', endTime: '18:15', stage: 'Wild Coast Stage', name: 'Hansemädchen' },
  { id: 'do2', day: 'Donnerstag', time: '18:30', endTime: '19:30', stage: 'Wild Coast Stage', name: 'Siegfried & Joy' },
  { id: 'do3', day: 'Donnerstag', time: '20:00', endTime: '21:00', stage: 'Wild Coast Stage', name: 'Herrenmagazin' },
  { id: 'do4', day: 'Donnerstag', time: '21:30', endTime: '22:30', stage: 'Wild Coast Stage', name: 'Paula Carolina' },
  { id: 'do5', day: 'Donnerstag', time: '23:00', endTime: '00:00', stage: 'Wild Coast Stage', name: 'Juli' },
  { id: 'do6', day: 'Donnerstag', time: '00:30', endTime: '01:30', stage: 'Wild Coast Stage', name: 'Disarstar' },

  // Freitag
  { id: 'fr1', day: 'Freitag', time: '15:00', endTime: '15:30', stage: 'Forest Stage', name: '#HURRICANESWIMTEAM' },
  { id: 'fr2', day: 'Freitag', time: '15:30', endTime: '16:00', stage: 'River Stage', name: 'Anda Morts' },
  { id: 'fr3', day: 'Freitag', time: '15:30', endTime: '16:15', stage: 'Wild Coast Stage', name: 'Raynor' },
  { id: 'fr4', day: 'Freitag', time: '16:00', endTime: '16:45', stage: 'Forest Stage', name: 'Grandson' },
  { id: 'fr5', day: 'Freitag', time: '16:00', endTime: '16:45', stage: 'Mountain Stage', name: 'The Ataris' },
  { id: 'fr6', day: 'Freitag', time: '16:30', endTime: '17:15', stage: 'River Stage', name: 'Rikas' },
  { id: 'fr7', day: 'Freitag', time: '16:30', endTime: '17:30', stage: 'Wild Coast Stage', name: 'Militarie Gun' },
  { id: 'fr8', day: 'Freitag', time: '17:15', endTime: '18:00', stage: 'Forest Stage', name: 'Sondaschule' },
  { id: 'fr9', day: 'Freitag', time: '17:15', endTime: '18:00', stage: 'Mountain Stage', name: 'Basement' },
  { id: 'fr10', day: 'Freitag', time: '18:00', endTime: '18:45', stage: 'River Stage', name: 'Royel Otis' },
  { id: 'fr11', day: 'Freitag', time: '18:00', endTime: '19:00', stage: 'Wild Coast Stage', name: 'Kayla Shyx' },
  { id: 'fr12', day: 'Freitag', time: '18:45', endTime: '19:45', stage: 'Forest Stage', name: 'Donots' },
  { id: 'fr13', day: 'Freitag', time: '18:45', endTime: '19:45', stage: 'Mountain Stage', name: 'President' },
  { id: 'fr14', day: 'Freitag', time: '19:30', endTime: '20:30', stage: 'River Stage', name: 'Bosse' },
  { id: 'fr15', day: 'Freitag', time: '19:30', endTime: '20:45', stage: 'Wild Coast Stage', name: 'Esther Graf' },
  { id: 'fr16', day: 'Freitag', time: '20:30', endTime: '21:45', stage: 'Forest Stage', name: 'The Offspring' },
  { id: 'fr17', day: 'Freitag', time: '20:30', endTime: '21:45', stage: 'Mountain Stage', name: 'Drunken Masters' },
  { id: 'fr18', day: 'Freitag', time: '21:45', endTime: '23:00', stage: 'River Stage', name: 'Yungblud' },
  { id: 'fr19', day: 'Freitag', time: '21:45', endTime: '23:00', stage: 'Wild Coast Stage', name: 'Betterov' },
  { id: 'fr20', day: 'Freitag', time: '23:00', endTime: '00:30', stage: 'Forest Stage', name: 'Kraftklub' },
  { id: 'fr21', day: 'Freitag', time: '23:15', endTime: '00:30', stage: 'Mountain Stage', name: 'Pennywise' },
  { id: 'fr22', day: 'Freitag', time: '23:15', endTime: '00:30', stage: 'Wild Coast Stage', name: 'Roya' },
  { id: 'fr23', day: 'Freitag', time: '00:30', endTime: '02:00', stage: 'River Stage', name: 'Roy Bianco & Die Abbrunzati Boys' },
  { id: 'fr24', day: 'Freitag', time: '00:45', endTime: '02:00', stage: 'Wild Coast Stage', name: 'Modestep' },

  // Samstag
  { id: 'sa1', day: 'Samstag', time: '12:00', endTime: '12:45', stage: 'Forest Stage', name: 'Just Mustard' },
  { id: 'sa2', day: 'Samstag', time: '12:00', endTime: '12:45', stage: 'Mountain Stage', name: 'Blackgold' },
  { id: 'sa3', day: 'Samstag', time: '12:30', endTime: '13:15', stage: 'River Stage', name: 'Latin Greek' },
  { id: 'sa4', day: 'Samstag', time: '13:00', endTime: '13:45', stage: 'Forest Stage', name: 'Scene Queen' },
  { id: 'sa5', day: 'Samstag', time: '13:00', endTime: '13:45', stage: 'Mountain Stage', name: 'The Sophs' },
  { id: 'sa6', day: 'Samstag', time: '13:30', endTime: '14:15', stage: 'River Stage', name: 'Florence Road' },
  { id: 'sa7', day: 'Samstag', time: '14:15', endTime: '15:00', stage: 'Forest Stage', name: 'Destroy Boys' },
  { id: 'sa8', day: 'Samstag', time: '14:15', endTime: '15:00', stage: 'Mountain Stage', name: 'Drei Meter Feldweg' },
  { id: 'sa9', day: 'Samstag', time: '14:45', endTime: '15:30', stage: 'River Stage', name: 'Ritter Lean' },
  { id: 'sa10', day: 'Samstag', time: '15:30', endTime: '16:30', stage: 'Forest Stage', name: 'All Time Low' },
  { id: 'sa11', day: 'Samstag', time: '15:30', endTime: '16:30', stage: 'Mountain Stage', name: 'PA69' },
  { id: 'sa12', day: 'Samstag', time: '16:00', endTime: '17:00', stage: 'River Stage', name: 'Natasha Bedingfield' },
  { id: 'sa13', day: 'Samstag', time: '17:00', endTime: '18:00', stage: 'Forest Stage', name: 'Alexisonfire' },
  { id: 'sa14', day: 'Samstag', time: '17:00', endTime: '18:00', stage: 'Mountain Stage', name: 'Kasi' },
  { id: 'sa15', day: 'Samstag', time: '17:45', endTime: '18:45', stage: 'River Stage', name: 'Kaffkiez' },
  { id: 'sa16', day: 'Samstag', time: '18:45', endTime: '19:45', stage: 'Forest Stage', name: 'Nothing But Thieves' },
  { id: 'sa17', day: 'Samstag', time: '18:45', endTime: '20:00', stage: 'Mountain Stage', name: 'OG Keemo' },
  { id: 'sa18', day: 'Samstag', time: '19:30', endTime: '20:45', stage: 'River Stage', name: 'Wolf Alice' },
  { id: 'sa19', day: 'Samstag', time: '20:30', endTime: '21:45', stage: 'Forest Stage', name: 'Papa Roach' },
  { id: 'sa20', day: 'Samstag', time: '20:45', endTime: '22:00', stage: 'Mountain Stage', name: 'Edwin Rosen' },
  { id: 'sa21', day: 'Samstag', time: '21:45', endTime: '23:15', stage: 'River Stage', name: 'Florence + The Machine' },
  { id: 'sa22', day: 'Samstag', time: '22:55', endTime: '00:30', stage: 'Forest Stage', name: 'Twenty One Pilots' },
  { id: 'sa23', day: 'Samstag', time: '23:15', endTime: '00:30', stage: 'Mountain Stage', name: 'SSIO' },
  { id: 'sa24', day: 'Samstag', time: '00:30', endTime: '02:00', stage: 'River Stage', name: 'Finch' },

  // Sonntag
  { id: 'so1', day: 'Sonntag', time: '12:00', endTime: '12:45', stage: 'Forest Stage', name: 'Ecca Vandal' },
  { id: 'so2', day: 'Sonntag', time: '12:00', endTime: '12:45', stage: 'Mountain Stage', name: 'Delilah Bon' },
  { id: 'so3', day: 'Sonntag', time: '12:30', endTime: '13:15', stage: 'River Stage', name: 'Unpeople' },
  { id: 'so4', day: 'Sonntag', time: '13:00', endTime: '13:45', stage: 'Forest Stage', name: 'Skindred' },
  { id: 'so5', day: 'Sonntag', time: '13:00', endTime: '13:45', stage: 'Mountain Stage', name: 'Rosmarin' },
  { id: 'so6', day: 'Sonntag', time: '13:30', endTime: '14:15', stage: 'River Stage', name: 'Davina Michelle' },
  { id: 'so7', day: 'Sonntag', time: '14:15', endTime: '15:15', stage: 'Forest Stage', name: 'Zebrahead' },
  { id: 'so8', day: 'Sonntag', time: '14:15', endTime: '15:15', stage: 'Mountain Stage', name: 'Vicky' },
  { id: 'so9', day: 'Sonntag', time: '15:00', endTime: '16:00', stage: 'River Stage', name: 'The Beaches' },
  { id: 'so10', day: 'Sonntag', time: '16:00', endTime: '17:00', stage: 'Forest Stage', name: 'The Butcher Sisters' },
  { id: 'so11', day: 'Sonntag', time: '16:00', endTime: '17:00', stage: 'Mountain Stage', name: 'Filow' },
  { id: 'so12', day: 'Sonntag', time: '16:45', endTime: '17:45', stage: 'River Stage', name: 'Clueso' },
  { id: 'so13', day: 'Sonntag', time: '17:45', endTime: '19:00', stage: 'Forest Stage', name: 'A Day To Remember' },
  { id: 'so14', day: 'Sonntag', time: '17:45', endTime: '19:00', stage: 'Mountain Stage', name: 'Levin Liam' },
  { id: 'so15', day: 'Sonntag', time: '18:30', endTime: '19:45', stage: 'River Stage', name: 'Empire Of The Sun' },
  { id: 'so16', day: 'Sonntag', time: '19:45', endTime: '21:00', stage: 'Mountain Stage', name: 'BHZ' },
  { id: 'so17', day: 'Sonntag', time: '20:00', endTime: '21:15', stage: 'Forest Stage', name: 'Halsey' },
  { id: 'so18', day: 'Sonntag', time: '21:00', endTime: '22:30', stage: 'River Stage', name: 'Provinz' },
  { id: 'so19', day: 'Sonntag', time: '22:30', endTime: '00:00', stage: 'Forest Stage', name: 'Billy Talent' }
];

// Helper: Konvertiert Zeit ("15:30") in Minuten für sauberes Sortieren. 
// Alles vor 06:00 Uhr wird als "nächster Tag" für das Sortieren behandelt.
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let total = hours * 60 + minutes;
  if (hours < 6) total += 24 * 60; 
  return total;
};

// Sortierte Acts
const SORTED_ACTS = [...HURRICANE_ACTS].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

// Neue Hilfsfunktion für Überschneidungen
const getOverlaps = (acts) => {
  const overlaps = new Set();
  for (let i = 0; i < acts.length; i++) {
    for (let j = i + 1; j < acts.length; j++) {
      const startA = timeToMinutes(acts[i].time);
      const endA = timeToMinutes(acts[i].endTime);
      const startB = timeToMinutes(acts[j].time);
      const endB = timeToMinutes(acts[j].endTime);
      
      // Wenn sich die Zeiten überlappen
      if (startA < endB && startB < endA) {
        overlaps.add(acts[i].id);
        overlaps.add(acts[j].id);
      }
    }
  }
  return overlaps;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [activeDay, setActiveDay] = useState('Freitag');
  const [activeStage, setActiveStage] = useState('Alle');
  const [currentTab, setCurrentTab] = useState('timetable'); // 'timetable' oder 'myplan'
  const [now, setNow] = useState(new Date());
  const [allVotes, setAllVotes] = useState({}); // Struktur: { "Max": { "fr1": "definitely", ... } }
  const [expandedAct, setExpandedAct] = useState(null);

  // 1. Initialisierung und Authentifizierung (Mandatory Rules)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      }
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
        // Fallback, falls "Anonyme Anmeldung" in Firebase nicht aktiviert wurde.
        setUser({ uid: 'fallback-test-user' });
      }
    };
    initAuth();
    
    return () => unsubscribe();
  }, []);

  // 2. Lokalen Namen aus dem Cache laden
  useEffect(() => {
    const storedName = localStorage.getItem('hurricaneName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // 3. Reale Daten aus Firebase laden
  useEffect(() => {
    if (!user) return;
    // Wir speichern alle Votes in einer Collection 'userVotes'. Jedes Dokument ist ein User.
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'userVotes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data().votes || {};
      });
      setAllVotes(data);
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  // 4. Uhrzeit aktualisieren für "Jetzt" Anzeige im Kalender (jede Minute)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle Login / Name speichern
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

  // Vote abgeben oder aktualisieren
  const handleVote = async (actId, status) => {
    if (!user || !userName) return;

    // Lokalen State der Votes des aktuellen Nutzers holen
    const currentUserVotes = allVotes[userName] ? { ...allVotes[userName] } : {};
    
    if (status === 'remove') {
      delete currentUserVotes[actId];
    } else {
      currentUserVotes[actId] = status;
    }

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'userVotes', userName);
    await setDoc(docRef, {
      userName: userName,
      votes: currentUserVotes
    }, { merge: true });
  };

  // Hilfsfunktion: Berechne wer bei einem Act dabei ist
  const getActAttendees = (actId) => {
    const definitely = [];
    const ifFits = [];

    Object.entries(allVotes).forEach(([name, votesMap]) => {
      if (votesMap[actId] === 'definitely') definitely.push(name);
      if (votesMap[actId] === 'if-fits') ifFits.push(name);
    });

    return { definitely, ifFits };
  };

  // Wenn der Nutzer noch keinen Namen angegeben hat, zeige Login-Screen
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
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Dein Vorname / Spitzname"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-zinc-600 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Los geht's
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  const days = ['Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const stages = ['Alle', 'Forest Stage', 'River Stage', 'Mountain Stage', 'Wild Coast Stage'];
  
  const actsForDay = SORTED_ACTS.filter(act => 
    act.day === activeDay && 
    (activeStage === 'Alle' || act.stage === activeStage)
  );

  // Daten für den persönlichen Plan
  const myVotes = allVotes[userName] || {};
  const myActs = SORTED_ACTS.filter(act => myVotes[act.id]);
  const myOverlaps = getOverlaps(myActs);

  // Bestimme den aktuellen Zeitpunkt (für die Live-Anzeige)
  const currentDayString = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + (now.getHours() < 6 ? 24 * 60 : 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-emerald-500">Hurricane</span> Crew
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-sm text-zinc-400 flex items-center gap-1 bg-zinc-800/50 px-3 py-1.5 rounded-full">
                <User size={14} className="text-emerald-500"/> 
                <span className="font-medium text-zinc-200">{userName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-400 transition-colors p-2"
                title="Name ändern"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          
          {currentTab === 'timetable' && (
            <>
              {/* Day Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => { setActiveDay(day); setExpandedAct(null); }}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      activeDay === day 
                        ? 'bg-emerald-500 text-zinc-950' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Stage Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {stages.map(stage => (
                  <button
                    key={stage}
                    onClick={() => { setActiveStage(stage); setExpandedAct(null); }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      activeStage === stage 
                        ? 'bg-zinc-200 text-zinc-900 border-zinc-200' 
                        : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {stage === 'Alle' ? <Filter size={12} /> : null}
                    {stage}
                  </button>
                ))}
              </div>
            </>
          )}

          {currentTab === 'myplan' && (
            <div className="pb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="text-emerald-500" size={20} />
                Mein Terminkalender
              </h2>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        
        {/* --- VIEW: TIMETABLE --- */}
        {currentTab === 'timetable' && (
          <>
            {actsForDay.map(act => {
              const isExpanded = expandedAct === act.id;
              const attendees = getActAttendees(act.id);
              const totalAttendees = attendees.definitely.length + attendees.ifFits.length;
              const myVote = myVotes[act.id] || null;

              return (
                <div 
                  key={act.id} 
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    myVote === 'definitely' ? 'border-emerald-500/50 bg-emerald-500/5' : 
                    myVote === 'if-fits' ? 'border-yellow-500/30 bg-yellow-500/5' : 
                    'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div 
                    className="p-4 cursor-pointer flex items-center gap-4"
                    onClick={() => setExpandedAct(isExpanded ? null : act.id)}
                  >
                    <div className="flex flex-col items-center justify-center min-w-[75px] text-center border-r border-zinc-800 pr-4">
                      <span className="text-lg font-black text-white leading-none">{act.time}</span>
                      <span className="text-xs font-medium text-zinc-500 mt-1">{act.endTime}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 leading-tight">{act.name}</h3>
                      <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
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
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'definitely'); }}
                            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                              myVote === 'definitely' ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            {myVote === 'definitely' && <Check size={16} />} Auf jeden Fall!
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'if-fits'); }}
                            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                              myVote === 'if-fits' ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            {myVote === 'if-fits' && <Check size={16} />} Nur wenns passt
                          </button>
                          {myVote && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleVote(act.id, 'remove'); }}
                              className="py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-all"
                            >
                              Löschen
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Crew Status</p>
                        {totalAttendees === 0 ? (
                          <p className="text-sm text-zinc-500 italic">Noch niemand eingetragen.</p>
                        ) : (
                          <div className="space-y-2">
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
                  )}
                </div>
              );
            })}
            
            {actsForDay.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">Keine Acts für diesen Filter gefunden.</p>
              </div>
            )}
          </>
        )}

        {/* --- VIEW: MEIN PLAN --- */}
        {currentTab === 'myplan' && (
          <div className="space-y-8">
            {myActs.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <CalendarDays className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 font-medium">Du hast noch keine Acts ausgewählt.</p>
                <button 
                  onClick={() => setCurrentTab('timetable')}
                  className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Zum Timetable wechseln
                </button>
              </div>
            ) : (
              days.map(day => {
                const dayActs = myActs.filter(a => a.day === day);
                if (dayActs.length === 0) return null;

                return (
                  <div key={day} className="relative">
                    <h3 className="text-xl font-black text-white mb-4 sticky top-[70px] bg-zinc-950/90 backdrop-blur-sm py-2 z-10 border-b border-zinc-800/50">
                      {day}
                    </h3>
                    <div className="space-y-4 pl-2">
                      {dayActs.map((act, index) => {
                        const startMins = timeToMinutes(act.time);
                        const endMins = timeToMinutes(act.endTime);
                        
                        // Live Status berechnen
                        const isToday = currentDayString === act.day;
                        const isLiveNow = isToday && currentMinutes >= startMins && currentMinutes <= endMins;
                        const isPast = isToday && currentMinutes > endMins;
                        
                        const hasOverlap = myOverlaps.has(act.id);
                        const voteStatus = myVotes[act.id];
                        const isExpanded = expandedAct === act.id;
                        const attendees = getActAttendees(act.id);
                        const totalAttendees = attendees.definitely.length + attendees.ifFits.length;

                        return (
                          <div key={act.id} className="relative flex gap-4">
                            {/* Timeline Line */}
                            <div className="absolute left-[29px] top-8 bottom-[-24px] w-0.5 bg-zinc-800 last:hidden"></div>
                            
                            {/* Time Block */}
                            <div className="flex flex-col items-end min-w-[60px] pt-1 z-10 bg-zinc-950">
                              <span className={`text-base font-black ${isPast ? 'text-zinc-600' : 'text-zinc-200'}`}>{act.time}</span>
                              <span className="text-xs font-medium text-zinc-600">{act.endTime}</span>
                            </div>

                            {/* Act Card */}
                            <div className={`flex-1 rounded-xl border z-10 transition-all ${
                              isLiveNow ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' :
                              isPast ? 'border-zinc-800/50 bg-zinc-900/30 opacity-60' :
                              'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
                            }`}>
                              {/* Clickable Area */}
                              <div 
                                className="p-4 cursor-pointer"
                                onClick={() => setExpandedAct(isExpanded ? null : act.id)}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className={`text-lg font-bold leading-tight ${isPast ? 'text-zinc-400' : 'text-white'}`}>
                                    {act.name}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {isLiveNow && (
                                      <span className="bg-emerald-500 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                        Jetzt
                                      </span>
                                    )}
                                    {isExpanded ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 text-xs font-medium text-zinc-400 mb-3">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} className={
                                      act.stage === 'Forest Stage' ? 'text-green-400' :
                                      act.stage === 'River Stage' ? 'text-blue-400' :
                                      act.stage === 'Mountain Stage' ? 'text-purple-400' : 'text-orange-400'
                                    } />
                                    {act.stage}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {startMins < 0 ? '' : `${endMins - startMins} Min.`}
                                  </span>
                                  {totalAttendees > 1 && (
                                    <span className="flex items-center gap-1 ml-auto bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                                      <Users size={12} /> {totalAttendees}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                    voteStatus === 'definitely' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-500'
                                  }`}>
                                    {voteStatus === 'definitely' ? 'Auf jeden Fall' : 'Nur wenns passt'}
                                  </span>
                                  
                                  {hasOverlap && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md">
                                      <AlertTriangle size={12} />
                                      Überschneidung!
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Expandable Crew Status */}
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-2 border-t border-zinc-800/50 bg-zinc-900/80">
                                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Crew Status</p>
                                  {totalAttendees <= 1 ? (
                                    <p className="text-sm text-zinc-500 italic">Außer dir noch niemand eingetragen.</p>
                                  ) : (
                                    <div className="space-y-2">
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
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-zinc-900 border-t border-zinc-800 pb-safe z-50">
        <div className="max-w-3xl mx-auto flex">
          <button 
            onClick={() => setCurrentTab('timetable')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${
              currentTab === 'timetable' ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <List size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Timetable</span>
          </button>
          <button 
            onClick={() => setCurrentTab('myplan')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors relative ${
              currentTab === 'myplan' ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CalendarDays size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Mein Plan</span>
            {myOverlaps.size > 0 && currentTab !== 'myplan' && (
              <span className="absolute top-3 right-[calc(50%-20px)] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900"></span>
            )}
          </button>
        </div>
      </nav>

    </div>
  );
}