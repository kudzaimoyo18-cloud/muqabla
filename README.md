# Muqabla Web Application

Muqabla is a video-first job matching platform for the GCC region (UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman) with the tagline "Your video is your resume."

## Features

- **Video Recording**: Record and upload video profiles and job applications
- **Job Matching**: AI-powered job recommendations and search
- **Dual User Types**: Candidate and employer workflows
- **GCC Localization**: Regional job data for Gulf countries
- **Real-time Features**: Supabase integration for live updates
- **Responsive Design**: Mobile and desktop optimized

## Tech Stack

- **Frontend**: Next.js 16 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Video Hosting**: Cloudflare Stream
- **State Management**: Zustand
- **Authentication**: Supabase Auth

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── hooks/              # Custom hooks
├── lib/                # Utilities and integrations
├── stores/             # Zustand state management
├── types/              # TypeScript definitions
└── constants/          # Configuration and data
```

## API Endpoints

- `POST /api/video-upload` - Upload video files
- `GET /api/jobs` - Get job listings
- `POST /api/applications` - Create job applications

## License

This project is licensed under the MIT License.