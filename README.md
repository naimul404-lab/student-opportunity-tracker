# Student Opportunity Tracker

A simple, responsive organizer for scholarships, internships, courses, jobs, events, and volunteer opportunities. Track deadlines and application status in one place. No account is needed; your list stays in your browser's local storage.

## Features

- Add opportunities with category, deadline, priority, status, optional official URL, and notes
- Search by name, notes, or category; filter by category and status
- Sort by deadline, priority, or recently added
- See upcoming deadlines and application progress at a glance
- Update status or delete an entry
- Download a JSON backup of your list
- Responsive layout, keyboard focus styles, and reduced-motion support
- No backend, account, analytics, or third-party data collection

## Try it locally

Download or clone this repository, then serve the project directory with Python:

```bash
python -m http.server 8000
```

Open <http://localhost:8000> in your browser. You can also open `index.html` directly, though using a local server is recommended.

## Publish with GitHub Pages

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, then save. Once the deployment finishes, GitHub will show the site URL in the Pages settings.

## Privacy and data

This app saves entries in local storage in the browser you use. Data is not automatically synchronized to another device or sent to a server. Clearing browser data can remove your list, so use **Download backup** to save a JSON copy somewhere safe. Avoid entering sensitive personal information.

## Project structure

```text
student-opportunity-tracker/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Customization

The category and status options are defined near the top of `script.js` and in the form and filters in `index.html`. The app uses plain HTML, CSS, and JavaScript with no build step or dependencies.

## License

MIT. See [LICENSE](LICENSE).
