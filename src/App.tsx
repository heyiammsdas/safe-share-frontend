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
    if (match && !token) {  // Only if not already logged in (to avoid conflicts)
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 w-full max-w-lg">
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
              // Clean URL
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
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 text-center mb-6">
        Create Account
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            type="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            type="password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>

      {msg && (
        <p className={`mt-4 text-center text-sm font-medium ${msg.includes("Welcome") ? "text-emerald-600" : "text-red-600"}`}>
          {msg}
        </p>
      )}

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
        >
          Already have an account? Login
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
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 text-center mb-6">
        Login
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            type="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            type="password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {msg && (
        <p className={`mt-4 text-center text-sm font-medium ${msg.includes("Welcome") ? "text-emerald-600" : "text-red-600"}`}>
          {msg}
        </p>
      )}

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
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
  const [newNote, setNewNote] = useState({ title: "", content: "", password: "" }); 
  const [shareLink , setShareLink] = useState<string| null>(null) ;

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
  console.log("Sending request to:", `${API_BASE_URL}/notes/create`);
  try {
    const data = await apiRequest("/notes/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newNote),
    });

    console.log("Create response:", data);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = (data as any)._id;
    if (!id) {
      console.error("No _id in response");
      return;
    }

    const link = `${window.location.origin}/note/${id}`;
    setShareLink(link);
    console.log("Generated link:", link);

    setNotes([...notes, data]);
    setNewNote({ title: "", content: "", password: "" });
  } catch (err) {
    console.error("Failed to create note:", err);
    alert(err instanceof Error ? err.message : "Failed to create note");
  }
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-500">Loading profile...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {profile && !loading && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Profile Info</h3>
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-medium text-slate-500">Name</span>
              <span className="text-sm text-slate-800 font-medium">{profile.name}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">Email</span>
              <span className="text-sm text-slate-800">{profile.email}</span>
            </div>
          </div>
        </div>
      )}

       <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mt-6">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Create Secure Note</h3>
        
        <div className="space-y-4">
          <div>
            <input
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            />
          </div>
          <div>
            <textarea
              placeholder="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[120px] resize-y transition-colors"
            />
          </div>
          <div>
            <input
              placeholder="Encryption Password"
              type="password"
              value={newNote.password}
              onChange={(e) => setNewNote({...newNote, password: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            />
          </div>
          <button 
            onClick={createNote}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Create Secure Note
          </button>
        </div>

        {shareLink && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Your shareable link:</p>
            <a 
              href={shareLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 break-all hover:underline"
            >
              {shareLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// New Component: NoteViewer
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

  if (content) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Secure Note Unlocked
          </h2>
          <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
          <h3 className="text-xl font-medium text-slate-900 mb-4 pb-4 border-b border-slate-200">
            {content.title}
          </h3>
          <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
            {content.content}
          </p>
        </div>
        
        <button
          onClick={onBack}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors border border-slate-300"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          Unlock Secure Note
        </h2>
        <p className="text-sm text-slate-500">
          Enter the password to view this note
        </p>
      </div>

      <form onSubmit={verifyNote} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Unlocking..." : "Unlock Note"}
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-center text-sm font-medium text-red-600">
          {msg}
        </p>
      )}

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 font-medium hover:underline transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}