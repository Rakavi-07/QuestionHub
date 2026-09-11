# QuestionHub

QuestionHub is an academic question-paper management platform developed for the **Physiotherapy (BPT) department of SRM Institute of Science and Technology**.

It allows students to access previous-year question papers based on their registered semester, while admins can manage students and upload question papers.

## Features

### Student
- Student registration using official SRM email
- Admin approval system
- Secure student login
- Semester-specific question papers
- View and download PDFs
- Save and unsave question papers
- Responsive dashboard

### Admin
- Secure admin login
- View student statistics
- Search and filter students
- Approve or reject student accounts
- Upload, replace, view, and delete question papers
- Manage question papers semester-wise

## Department

Currently supports:

- Physiotherapy
- Bachelor of Physiotherapy (BPT)
- 8 semesters

## Question Paper Structure

One PDF is stored per subject. Each PDF can contain all previous-year question papers for that subject.

```text
Semester → Subject → Question Paper PDF
```

## Technology Stack

- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Cloudinary
- Vercel
- Render

## Project Structure

```text
questionhub/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── utils/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── .env.example
├── package.json
├── vercel.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/Rakavi-07/QuestionHub.git
cd QuestionHub
```

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Do not upload `.env` files or secret credentials to GitHub.

## Run Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:5000
```

## Build

```bash
npm run build
```

## Deployment

The frontend is deployed using Vercel and the backend is deployed using Render.

For production, set the frontend environment variable to the deployed backend URL:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## Security

- Passwords are hashed using bcrypt.
- JWT is used for authentication.
- Admin routes are role-protected.
- Students can access only their registered semester.
- PDFs are stored using Cloudinary.
- Sensitive credentials are stored in environment variables.

## Project Status

- Frontend completed
- Authentication completed
- Student management completed
- Question paper management completed
- Cloudinary integration completed
- Student dashboard completed
- Frontend deployment completed
- Backend deployment completed

## Author

Developed as an academic project for the Physiotherapy department of SRM Institute of Science and Technology.

## License

This project is intended for academic and educational use.