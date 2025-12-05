// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api";

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.get("/profile/me")
      .then(res => setUser(res.data))
      .catch(err => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
}