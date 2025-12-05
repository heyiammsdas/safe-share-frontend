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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #ebf4ff, #e0e7ff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          padding: "32px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
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

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "12px",
    fontSize: "14px",
  };

  return (
    <div>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", textAlign: "center", marginBottom: "20px" }}>
        Create Account
      </h2>

      <form onSubmit={submit}>
        <label style={{ fontSize: "14px", color: "#374151" }}>Name</label>
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <label style={{ fontSize: "14px", color: "#374151" }}>Email</label>
        <input
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          type="email"
          required
        />

        <label style={{ fontSize: "14px", color: "#374151" }}>Password</label>
        <input
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          type="password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#60a5fa" : "#2563eb",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>

      {msg && (
        <p
          style={{
            marginTop: "10px",
            textAlign: "center",
            color: msg.includes("Welcome") ? "green" : "red",
          }}
        >
          {msg}
        </p>
      )}

      <div style={{ textAlign: "center", marginTop: "12px" }}>
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: "none",
            color: "#2563eb",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
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

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "12px",
    fontSize: "14px",
  };

  return (
    <div>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", textAlign: "center", marginBottom: "20px" }}>
        Login
      </h2>

      <form onSubmit={submit}>
        <label style={{ fontSize: "14px", color: "#374151" }}>Email</label>
        <input
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          type="email"
          required
        />

        <label style={{ fontSize: "14px", color: "#374151" }}>Password</label>
        <input
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          type="password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#60a5fa" : "#2563eb",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {msg && (
        <p
          style={{
            marginTop: "10px",
            textAlign: "center",
            color: msg.includes("Welcome") ? "green" : "red",
          }}
        >
          {msg}
        </p>
      )}

      <div style={{ textAlign: "center", marginTop: "12px" }}>
        <button
          type="button"
          onClick={onSwitchToRegister}
          style={{
            background: "none",
            color: "#2563eb",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>Dashboard</h2>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <div
            style={{
              height: "48px",
              width: "48px",
              border: "4px solid #93c5fd",
              borderTop: "4px solid #2563eb",
              borderRadius: "50%",
              margin: "auto",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading profile...</p>
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginTop: "20px" }}>
          {error}
        </div>
      )}

      {profile && !loading && (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: "8px",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <div>
            <strong>Name:</strong>
            <p>{profile.name}</p>
          </div>
          <div>
            <strong>Email:</strong>
            <p>{profile.email}</p>
          </div>
        </div>
      )}
       <div style={{ marginTop: "20px", padding: "20px", background: "#f8fafc", borderRadius: "8px" }}>
        <h3>Create Secure Note</h3>
        <input
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({...newNote, title: e.target.value})}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <textarea
          placeholder="Content"
          value={newNote.content}
          onChange={(e) => setNewNote({...newNote, content: e.target.value})}
          style={{ width: "100%", marginBottom: "10px", padding: "8px", minHeight: "100px" }}
        />
        <input
          placeholder="Encryption Password"
          type="password"
          value={newNote.password}
          onChange={(e) => setNewNote({...newNote, password: e.target.value})}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <button onClick={createNote}>Create Secure Note</button>
        {shareLink && (
          <div style={{ marginTop: "15px", background: "#f1f5f9", padding: "10px", borderRadius: "8px" }}>
            <p>Your shareable link:</p>
            <a href={shareLink} target="_blank" rel="noopener noreferrer">{shareLink}</a>
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

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "12px",
    fontSize: "14px",
  };

  const buttonStyle = {
    width: "100%",
    backgroundColor: loading ? "#60a5fa" : "#2563eb",
    color: "white",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    fontWeight: 500,
    cursor: loading ? "not-allowed" : "pointer",
    marginBottom: "12px",
  };

  if (content) {
    return (
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", textAlign: "center", marginBottom: "20px" }}>
          Secure Note Unlocked
        </h2>
        <div style={{ background: "#f9fafb", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "10px", color: "#1e293b" }}>{content.title}</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{content.content}</p>
        </div>
        <button
          onClick={onBack}
          style={{
            ...buttonStyle,
            backgroundColor: "#6b7280",
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", textAlign: "center", marginBottom: "20px" }}>
        Unlock Secure Note
      </h2>
      <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "20px" }}>
        Enter the password to view the note.
      </p>

      <form onSubmit={verifyNote}>
        <label style={{ fontSize: "14px", color: "#374151" }}>Password</label>
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter the password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Unlocking..." : "Unlock Note"}
        </button>
      </form>

      {msg && (
        <p
          style={{
            marginTop: "10px",
            textAlign: "center",
            color: "red",
          }}
        >
          {msg}
        </p>
      )}

      <div style={{ textAlign: "center", marginTop: "12px" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            color: "#2563eb",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}