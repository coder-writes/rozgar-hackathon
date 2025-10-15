# Localized Talent & Skill Ecosystem (LTSE)

![LTSE Platform](https://img.shields.io/badge/Status-MVP-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Stack](https://img.shields.io/badge/Stack-MERN-orange)

## 🎯 Project Overview

The **Localized Talent & Skill Ecosystem (LTSE)** is a dynamic, localized web platform designed to bridge the gap between local job seekers and regional employers while fostering continuous skill development within communities. The platform provides a comprehensive solution for job discovery, skill enhancement, and professional networking at the local level.

## 🚀 Key Features

### For Job Seekers
- 📋 **Job Board**: Browse and filter job opportunities with advanced search capabilities
- 📚 **Skill Library**: Access curated learning resources and track your progress
- 🏆 **Badge System**: Earn and display skill badges upon course completion
- 🎨 **Project Showcase**: Share your projects and build your portfolio
- 💬 **Community Feed**: Network with other professionals and participate in discussions

### For Recruiters
- ✍️ **Job Posting**: Simple interface to post and manage job listings
- 👥 **Candidate Discovery**: Access to community profiles and skill badges
- 📊 **Application Management**: Track and manage job applications

### System Intelligence
- 🤖 **AI-Sourced Jobs**: Automated job aggregation from multiple sources
- 🎓 **Smart Skill Recommendations**: Automated course and workshop suggestions
- 🔗 **Resource Curation**: Continuously updated skill-building resources

## 🏗️ Architecture

### Technology Stack

```
Frontend:  React (JSX) + Tailwind CSS
Backend:   Node.js + Express
Database:  MongoDB (via Google Cloud Firestore)
Auth:      Firebase Authentication
Hosting:   [To be determined]
```

### System Design

```
LTSE Platform
├── Authentication Layer (Firebase)
├── Frontend (React SPA)
│   ├── Job Seeker Dashboard
│   ├── Recruiter Dashboard
│   ├── Job Board Module
│   ├── Skill Library Module
│   └── Community Module
├── Backend API (Express)
│   ├── Job Management
│   ├── Skill Resources
│   ├── User Profiles
│   └── Community Features
└── Data Layer (Firestore)
    ├── /jobs
    ├── /skills
    ├── /community_posts
    └── /user_profiles
```

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase Account
- Google Cloud Platform Account (for Firestore)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rozgar
   ```

2. **Install dependencies**

   Frontend:
   ```bash
   cd frontend
   npm install
   ```

   Backend:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**

   Create `.env` files in both frontend and backend directories:

   **Frontend `.env`:**
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

   **Backend `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   FIREBASE_SERVICE_ACCOUNT=path_to_service_account.json
   JWT_SECRET=your_jwt_secret
   ```

4. **Initialize Firestore**
   - Set up Firestore database in Google Cloud Console
   - Configure security rules for public data access
   - Create initial collections: `jobs`, `skills`, `community_posts`, `user_profiles`

5. **Run the application**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 🗂️ Project Structure

```
rozgar/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── jobs/
│   │   │   ├── skills/
│   │   │   └── community/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   ├── server.js
│   └── package.json
└── README.md
```

## 🎨 Design Guidelines

The platform follows a **LinkedIn-inspired professional aesthetic** with:

- **Color Palette**: Primary blues (#0A66C2), neutral grays, crisp whites
- **Typography**: Clean, readable sans-serif fonts (Inter, Roboto)
- **Layout**: Card-based design with clear section separation
- **Spacing**: Generous whitespace for visual clarity
- **Components**: Rounded corners, subtle shadows, smooth transitions
- **Responsive**: Mobile-first approach with adaptive breakpoints

### Tailwind CSS Configuration

```js
// Key design tokens
colors: {
  primary: '#0A66C2',
  secondary: '#378fe9',
  accent: '#70B5F9',
  text: {
    primary: '#000000e6',
    secondary: '#00000099',
  },
  background: {
    primary: '#ffffff',
    secondary: '#f3f2ef',
  }
}
```

## 👥 User Roles

### 1. Job Seeker
**Capabilities:**
- Register and authenticate
- Browse and search jobs with advanced filters
- Access skill library and track progress
- Earn and display skill badges
- Submit projects to showcase
- Participate in community discussions

### 2. Recruiter/Employer
**Capabilities:**
- Register and authenticate
- Post new job listings
- Manage existing job postings
- View candidate profiles
- Track applications

### 3. System Agent (Automated)
**Functions:**
- Aggregate job listings from external sources
- Curate skill-building resources
- Suggest relevant courses and workshops
- Update content continuously

## 🔐 Authentication Flow

```
User Registration/Login
    ↓
Firebase Authentication
    ↓
Token Generation
    ↓
Role Assignment (Job Seeker/Recruiter)
    ↓
Dashboard Access
```

**Supported Methods:**
- Email/Password
- Google OAuth
- Anonymous Sign-in (fallback)
- Password Recovery

## 📊 Data Architecture

### Firestore Collections

#### `/jobs`
```json
{
  "jobId": "unique_id",
  "title": "Software Developer",
  "description": "Job description...",
  "skills": ["React", "Node.js"],
  "experienceLevel": "Mid-level",
  "jobType": "Full-time",
  "recruiterId": "user_id",
  "source": "manual" | "ai-sourced",
  "postedAt": "timestamp",
  "location": "City, State"
}
```

#### `/skills`
```json
{
  "skillId": "unique_id",
  "title": "React Fundamentals",
  "description": "Learn React basics...",
  "category": "Web Development",
  "provider": "Coursera",
  "link": "https://...",
  "source": "ai-sourced" | "community",
  "tags": ["react", "javascript"],
  "difficulty": "Beginner"
}
```

#### `/user_profiles`
```json
{
  "userId": "unique_id",
  "displayName": "John Doe",
  "email": "john@example.com",
  "role": "job_seeker" | "recruiter",
  "badges": ["react_badge", "node_badge"],
  "completedCourses": ["course_id_1"],
  "inProgressCourses": ["course_id_2"],
  "projects": ["project_id_1"]
}
```

#### `/community_posts`
```json
{
  "postId": "unique_id",
  "type": "project" | "discussion",
  "userId": "user_id",
  "title": "My React Portfolio",
  "description": "Description...",
  "tags": ["react", "portfolio"],
  "link": "https://github.com/...",
  "comments": [],
  "createdAt": "timestamp"
}
```

## 🔍 Key Features Implementation

### Job Board
- **Filters**: Skill tags, experience level, job type, source
- **Search**: Real-time text search across titles and descriptions
- **Real-time Updates**: onSnapshot listeners for live data
- **Source Tags**: Visual differentiation between manual and AI-sourced jobs

### Skill Library
- **Course Tracking**: "In Progress" and "Completed" status
- **Badge System**: Automatic badge award on course completion
- **External Links**: Direct links to course providers
- **Community Contributions**: User-submitted resources

### Community Showcase
- **Project Submissions**: Title, description, tags, external links
- **Discussion Threads**: Nested comment system
- **User Profiles**: Public display of badges and completed projects
- **Open Source Links**: Integration with GitHub and other repositories

## 📱 Responsive Design

### Breakpoints
```css
sm:  640px  /* Mobile landscape */
md:  768px  /* Tablets */
lg:  1024px /* Desktop */
xl:  1280px /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile-First Approach
- Touch-friendly target sizes (minimum 44x44px)
- Fluid typography and spacing
- Collapsible navigation
- Optimized images and lazy loading

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test

# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist folder
```

### Backend Deployment (Heroku/Google Cloud Run)
```bash
cd backend
# Configure environment variables
# Deploy using platform-specific commands
```

## 📈 Success Metrics (MVP)

- ✅ User registration and authentication within 30 seconds
- ✅ Job board navigation and filtering within 60 seconds
- ✅ Successful project submission and community interaction
- ✅ Badge earning and profile display
- ✅ Real-time data synchronization
- ✅ Mobile-responsive on all screen sizes

## 🛠️ Development Guidelines

### Code Style
- **React**: Functional components with Hooks
- **Naming**: camelCase for variables, PascalCase for components
- **File Structure**: One component per file
- **Comments**: JSDoc for functions, inline for complex logic

### Best Practices
- Use React Hook Form for form management
- Implement error boundaries for robust error handling
- Optimize re-renders with React.memo and useMemo
- Use Lucide React for consistent iconography
- Implement loading states and skeleton screens
- Handle edge cases and empty states

### Git Workflow
```bash
# Feature branch
git checkout -b feature/feature-name

# Commit with conventional commits
git commit -m "feat: add job filtering functionality"

# Push and create PR
git push origin feature/feature-name
```

## 🐛 Troubleshooting

### Common Issues

**Firebase Authentication Errors:**
- Verify API keys in `.env`
- Check Firebase Console for enabled auth methods
- Ensure domain is whitelisted in Firebase settings

**Firestore Permission Errors:**
- Review Firestore security rules
- Verify service account permissions
- Check data path structure

**Build Failures:**
- Clear node_modules and reinstall
- Update dependencies to compatible versions
- Check for TypeScript/ESLint errors

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Development Team

- **Project Lead**: [Name]
- **Frontend Developer**: [Name]
- **Backend Developer**: [Name]
- **UI/UX Designer**: [Name]

## 📞 Support

For questions or issues:
- 📧 Email: support@ltse-platform.com
- 💬 Discord: [Community Link]
- 🐛 Issues: [GitHub Issues](link)

## 🗺️ Roadmap

### Phase 1 (MVP) - Current
- ✅ Core authentication
- ✅ Job board functionality
- ✅ Skill library basics
- ✅ Community showcase

### Phase 2 (Q1 2026)
- 🔄 Advanced AI job matching
- 🔄 In-app messaging
- 🔄 Video interviews
- 🔄 Analytics dashboard

### Phase 3 (Q2 2026)
- 📅 Mobile app (React Native)
- 📅 Advanced skill assessments
- 📅 Employer branding pages
- 📅 Referral system

---

**Built with ❤️ for local communities**

*Last Updated: October 2025*