import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ApiResponse {
  token: string;
  user: User;
}

interface NoteContent {
  title: string;
  content: string;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: "Request failed" }));
    throw new Error(error.msg || `HTTP ${response.status}`);
  }

  return response.json();
}

export default function App() {
  const [currentView, setCurrentView] = useState<"register" | "login" | "dashboard" | "viewNote">("login");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);

  // Check URL on mount for /note/{id} path
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/note\/([a-zA-Z0-9]+)$/);
    if (match && !token) {  // Only if not already logged in
      setNoteId(match[1]);
      setCurrentView("viewNote");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCurrentView("login");
  };

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-3xl flex flex-col items-center">
        {currentView === "register" && (
          <Register
            onSuccess={(newToken, newUser) => {
              setToken(newToken);
              setUser(newUser);
              setCurrentView("dashboard");
            }}
            onSwitchToLogin={() => setCurrentView("login")}
          />
        )}
        {currentView === "login" && (
          <Login
            onSuccess={(newToken, newUser) => {
              setToken(newToken);
              setUser(newUser);
              setCurrentView("dashboard");
            }}
            onSwitchToRegister={() => setCurrentView("register")}
          />
        )}
        {currentView === "dashboard" && (
          <Dashboard user={user} token={token} onLogout={handleLogout} />
        )}
        {currentView === "viewNote" && noteId && (
          <NoteViewer
            noteId={noteId}
            onBack={() => {
              setCurrentView("login");
              setNoteId(null);
              window.history.replaceState({}, '', '/');
            }}
          />
        )}
      </div>
    </div>
  );
}

function Register({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: (token: string, user: User) => void;
  onSwitchToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = (await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      })) as ApiResponse;

      setMsg(`Welcome ${data.user.name}!`);
      setTimeout(() => onSuccess(data.token, data.user), 500);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-blue-900/40 p-8 sm:p-10 rounded-2xl border border-blue-800/50 shadow-2xl backdrop-blur-md">
      <h2 className="text-3xl font-medium text-white mb-8 text-center tracking-wide">
        Create Account
      </h2>

      <form onSubmit={submit} className="space-y-5 text-left">
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">Full Name</label>
          <input
            className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">Email Address</label>
          <input
            className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">Password</label>
          <input
            className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-2 py-3 rounded-lg text-white font-semibold transition-colors ${
            loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-400"
          }`}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>

      {msg && (
        <p className={`mt-6 text-center text-sm font-semibold ${msg.includes("Welcome") ? "text-emerald-400" : "text-red-300"}`}>
          {msg}
        </p>
      )}

      <div className="text-center mt-8 pt-6 border-t border-blue-800/50">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm text-blue-300 hover:text-white transition-colors"
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
}

function Login({
  onSuccess,
  onSwitchToRegister,
}: {
  onSuccess: (token: string, user: User) => void;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = (await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })) as ApiResponse;

      setMsg(`Welcome back, ${data.user.name}!`);
      setTimeout(() => onSuccess(data.token, data.user), 500);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-blue-900/40 p-8 sm:p-10 rounded-2xl border border-blue-800/50 shadow-2xl backdrop-blur-md">
      <h2 className="text-3xl font-medium text-white mb-8 text-center tracking-wide">
        Safe Share
      </h2>

      <form onSubmit={submit} className="space-y-5 text-left">
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">Email Address</label>
          <input
            className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">Password</label>
          <input
            className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-2 py-3 rounded-lg text-white font-semibold transition-colors ${
            loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-400"
          }`}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      {msg && (
        <p className={`mt-6 text-center text-sm font-semibold ${msg.includes("Welcome") ? "text-emerald-400" : "text-red-300"}`}>
          {msg}
        </p>
      )}

      <div className="text-center mt-8 pt-6 border-t border-blue-800/50">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-sm text-blue-300 hover:text-white transition-colors"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
}

function Dashboard({
  user,
  token,
  onLogout,
}: {
  user: User | null;
  token: string | null;
  onLogout: () => void;
}) {
  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // for creating note 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "", password: "", expiresIn: "never" }); 
  const [shareLink , setShareLink] = useState<string| null>(null) ;
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (token && !profile) {
      setLoading(true);
      apiRequest("/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((data) => {
          setProfile(data as User);
          setError("");
        })
        .catch(() => {
          setError("Failed to load profile. Please login again.");
          setTimeout(onLogout, 2000);
        })
        .finally(() => setLoading(false));
    }
  }, [token, profile, onLogout]);

  // create note request
  const createNote = async () => {
    if (!newNote.title || !newNote.content || !newNote.password) return;
    
    setCreating(true);
    setShareLink(null);

    try {
      const data = await apiRequest("/notes/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = (data as any)._id;
      if (!id) throw new Error("Missing ID in response");

      const link = `${window.location.origin}/note/${id}`;
      setShareLink(link);
      setNotes([...notes, data]);
      setNewNote({ title: "", content: "", password: "", expiresIn: "never" });
    } catch (err) {
      console.error("Failed to create note:", err);
      alert(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-8">
      {/* Minimal Navigation */}
      <div className="flex justify-between items-center bg-blue-900/30 px-6 py-4 rounded-xl border border-blue-800/50 backdrop-blur-sm">
        <div className="text-blue-100 font-medium">
          Logged in as <span className="font-semibold text-white ml-1">{profile?.name || user?.name || "..."}</span>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-blue-300 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>

      {(loading || error) && (
        <div className="text-center py-4">
          {loading && <p className="text-blue-300 text-sm">Loading...</p>}
          {error && <p className="text-red-300 text-sm">{error}</p>}
        </div>
      )}

      {/* Main Create Note Area */}
      <div className="bg-blue-900/40 p-6 sm:p-10 rounded-2xl border border-blue-800/50 shadow-2xl backdrop-blur-md text-left">
        <h3 className="text-2xl font-medium text-white mb-8">Create Secure Note</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Note Title</label>
            <input
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Note Content</label>
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              className="w-full bg-white text-slate-900 px-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow min-h-[220px] resize-y leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Passkey</label>
              <input
                type="password"
                value={newNote.password}
                onChange={(e) => setNewNote({...newNote, password: e.target.value})}
                className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Expiration</label>
              <select
                value={newNote.expiresIn}
                onChange={(e) => setNewNote({...newNote, expiresIn: e.target.value})}
                className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
              >
                <option value="10m">10 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
                <option value="never">Never Expires</option>
              </select>
            </div>
          </div>

          <button 
            onClick={createNote}
            disabled={creating}
            className={`w-full mt-4 py-3.5 rounded-lg text-white font-semibold transition-colors ${
              creating ? "bg-blue-600/50 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-400"
            }`}
          >
            {creating ? "Creating..." : "Create Secure Note"}
          </button>
        </div>

        {shareLink && (
          <div className="mt-8 p-6 bg-white rounded-xl border border-blue-100 text-center shadow-inner">
            <p className="text-sm font-semibold text-slate-500 mb-2">Your shareable link is ready:</p>
            <a 
              href={shareLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all hover:underline font-semibold text-lg"
            >
              {shareLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteViewer({
  noteId,
  onBack,
}: {
  noteId: string;
  onBack: () => void;
}) {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<NoteContent | null>(null);

  const [statusLoading, setStatusLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    apiRequest(`/notes/${noteId}/status`, { method: "GET" })
      .then(() => {
        if (isMounted) setStatusLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          setIsExpired(true);
          setExpiredMsg(err instanceof Error ? err.message : "This link has expired and is no longer available.");
          setStatusLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [noteId]);

  const verifyNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = await apiRequest(`/notes/${noteId}/verify`, {
        method: "POST",
        body: JSON.stringify({ password }),
      }) as NoteContent;

      setContent(data);
      setMsg(""); // Clear any old messages
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Verification failed");
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="w-full max-w-md bg-blue-900/40 p-8 sm:p-10 rounded-2xl border border-blue-800/50 shadow-2xl backdrop-blur-md text-center">
        <p className="text-blue-200">Checking link status...</p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="w-full max-w-md bg-blue-900/40 p-8 sm:p-10 rounded-2xl border border-blue-800/50 shadow-2xl backdrop-blur-md text-center">
        <div className="text-blue-200 mb-6">
          <svg className="w-16 h-16 mx-auto mb-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-medium text-white mb-2">Link Unavailable</h2>
          <p className="text-sm mt-2">{expiredMsg}</p>
        </div>
        <button
          onClick={onBack}
          className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  // State when unlocked successfully
  if (content) {
    return (
      <div className="w-full max-w-3xl space-y-6">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-2xl text-left border border-slate-100">
          <h2 className="text-3xl font-medium text-slate-900 mb-6 pb-6 border-b border-slate-100">
            {content.title}
          </h2>
          <div className="whitespace-pre-wrap text-slate-800 leading-relaxed text-lg min-h-[250px]">
            {content.content}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <button
            onClick={onBack}
            className="text-sm text-blue-300 hover:text-white transition-colors"
          >
            Close Note
          </button>
        </div>
      </div>
    );
  }

  // State when requesting passkey
  return (
    <div className="w-full max-w-md bg-blue-900/40 p-8 sm:p-10 rounded-2xl border border-blue-800/50 shadow-2xl backdrop-blur-md text-center">
      <h2 className="text-2xl font-medium text-white mb-2">
        Unlock Note
      </h2>
      <p className="text-sm text-blue-200 mb-8">
        This note requires a passkey to view.
      </p>

      <form onSubmit={verifyNote} className="space-y-5 text-left">
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">Passkey</label>
          <input
            className="w-full bg-white text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow text-center tracking-widest"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-2 py-3 rounded-lg text-white font-semibold transition-colors ${
            loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-400"
          }`}
        >
          {loading ? "Unlocking..." : "Verify & Read"}
        </button>
      </form>

      {msg && (
        <p className="mt-6 text-center text-sm font-semibold text-red-300">
          {msg}
        </p>
      )}

      <div className="text-center mt-8 pt-6 border-t border-blue-800/50">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-300 hover:text-white transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}