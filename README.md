# Student Opportunity Tracker

A simple, responsive organizer for scholarships, internships, courses, jobs, events, and volunteer opportunities. It helps students keep track of deadlines, application status, and next steps in one place.

## Why this project matters

Students often miss important deadlines because they are managing many opportunities at once. This project gives them a clean place to plan, track, and update applications without needing an account or a complex system.

## Features

- Add opportunities with category, deadline, priority, and status
- Search by title, category, or notes
- Filter by category and status
- Sort by deadline, priority, or newest entry
- Track application progress from interested to applied to accepted
- Save information in the browser using local storage
- Download a JSON backup of your data
- Simple, mobile-friendly layout
- No backend or login required

## Project structure

```text
student-opportunity-tracker/
├── index.html
├── styles.css
├── script.js
├── README.md
├── LICENSE
└── .gitignore
```

## Run locally

Download or clone this repository, then run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish with GitHub Pages

In the repository, open Settings → Pages, choose Deploy from a branch, select main and / (root), and save. GitHub will provide the live site URL once deployment is complete.

## Privacy and data

This app saves entries in the browser local storage on the device you are using. It does not sync across devices or send data to a server. Clearing browser data can remove your saved opportunities, so use Download backup to keep a copy of your list.

## What this project shows

This project is a strong portfolio example because it solves a real student problem:

- keeping track of opportunities
- avoiding missed deadlines
- staying organized with limited effort

## License

MIT. See [LICENSE](LICENSE).
