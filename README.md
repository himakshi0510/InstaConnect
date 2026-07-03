# InstaConnect

A full-stack social media web application inspired by Instagram.

## Features

- User Authentication (JWT)
- User Registration & Login
- Create Posts
- Edit Posts
- Delete Posts
- Image Upload using Cloudinary
- Like & Unlike Posts
- Comment System
- Explore Feed
- User Search
- Follow & Unfollow Users
- User Profile
- Edit Profile
- Responsive UI

## Tech Stack

### Frontend
- Next.js
- React.js
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- JWT
- Multer
- Cloudinary

### Database
- MySQL

## Installation

### Clone

```bash
git clone https://github.com/himakshi0510/InstaConnect.git
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

## Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=instaconnect

JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Author

**Himakshi Bansal**

B.Tech Robotics & Artificial Intelligence

CGC University Mohali