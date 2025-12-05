import { useState } from "react";
import axios from "axios";
import api, { setAuthToken } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      setMsg(`Welcome ${user.name}`);
      // redirect or update UI
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMsg(err.response?.data?.msg || "Registration failed");
      } else {
        setMsg("Registration failed");
      }
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Register</h2>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" required/>
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required/>
      <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" required/>
      <button type="submit">Sign up</button>
      <p>{msg}</p>
    </form>
  );
}