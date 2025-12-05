// src/pages/Login.tsx
import { useState } from "react";
import axios from "axios";
import api, { setAuthToken } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      setMsg(`Welcome back, ${user.name}`);
      // redirect
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMsg(err.response?.data?.msg || "Login failed");
      } else {
        setMsg("Login failed");
      }
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <input 
        value={email} 
        onChange={(e)=>setEmail(e.target.value)} 
        placeholder="Email" 
        type="email"
        required
      />
      <input 
        value={password} 
        onChange={(e)=>setPassword(e.target.value)} 
        placeholder="Password" 
        type="password" 
        required
      />
      <button type="submit">Login</button>
      <p>{msg}</p>
    </form>
  );
}