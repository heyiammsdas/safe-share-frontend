🔐 NoteCrypt – Secure Note Sharing Application

NoteCrypt is a secure note-sharing web application that allows users to create encrypted notes, generate a unique shareable link, 
and let others access the note only with the correct password. The app ensures privacy, security, and simplicity.

🚀 Features

✅ User Authentication (Register & Login)
✅ Secure Note Creation with Password Encryption
✅ Unique Shareable Link Generation
✅ Password-Protected Note Viewing
✅ JWT-Based Authentication
✅ Responsive & Clean UI
✅ Profile Dashboard
✅ Deployed on Vercel (Frontend) & Render (Backend)

🛠️ Tech Stack
Frontend

⚛️ React + TypeScript

⚡ Vite

🎨 Inline CSS Styling

🌐 Deployed on Vercel

Backend

🟢 Node.js

🚀 Express.js

🍃 MongoDB

🔐 JWT Authentication

🔑 bcrypt for Password Encryption

☁️ Deployed on Render

🔁 How It Works
1️⃣ Register / Login

Users must register and log in to access the dashboard.

2️⃣ Create Secure Note

Enter Title

Enter Content

Enter a Password

3️⃣ Generate Shareable Link

Once the note is created, a unique link is generated:

https://yourdomain.com/note/{noteId}

4️⃣ Unlock with Password

Anyone with the link must enter the correct password to view the note.

📦 Project Structure
safe-share-frontend/
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
│
├── .env
├── package.json
└── README.md


⚙️ Environment Variables
Frontend (.env)
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api

Backend (.env)
MONGODB_URI=your_mongodb_url
JWT_SECRET=your_secret_key
PORT=5000

🧪 API Endpoints
Auth
Method	Route	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
Profile

| GET | /api/profile/me | Fetch user profile |

Notes

| POST | /api/notes/create | Create secure note |
| POST | /api/notes/:id/verify | Verify & view note |

🧑‍💻 Installation & Setup (Local)
1️⃣ Clone the Repositories
git clone https://github.com/your-username/safe-share-frontend.git
git clone https://github.com/your-username/safe-share-backend.git

2️⃣ Frontend Setup
cd safe-share-frontend
npm install
npm run dev

3️⃣ Backend Setup
cd safe-share-backend
npm install
npm start

🔐 Security Highlights

🔑 Passwords are hashed using bcrypt

🔐 JWT Token-based authentication

🛡️ Notes cannot be accessed without password

🔗 Unique link per note

🌍 Live Demo


👨‍💻 Author

Madhusudan Das
🎓 Computer Science Student
💻 Fullstack Developer

💡Improvements :

  Give suggestions (write issue) if any improvement is required
  

❤️ Support

If you like this project, please give it a ⭐ on GitHub!
