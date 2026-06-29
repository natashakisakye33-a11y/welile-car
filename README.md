# Welile Car

Welile Car is a comprehensive platform designed to revolutionize vehicle ownership through flexible saving plans and financing. It enables users to save toward a required deposit milestone (typically 30%) through daily, weekly, or monthly installments. Once the milestone is reached, the remaining amount is financed, allowing users to drive their dream cars today.

This README provides all the essential guidelines and instructions for developers collaborating on the project via GitHub.

## 🚀 Project Architecture

The repository is structured as a monorepo containing both the frontend and backend applications:
*   `/frontend`: React 18, Vite, TypeScript, Tailwind CSS, Shadcn UI
*   `/backend`: Node.js, Express, Prisma, PostgreSQL

---

## 🤝 Collaboration Guidelines

We follow a structured Git workflow to keep our codebase clean and stable. Please read these instructions carefully before starting your work.

### 1. Branching Strategy

We use a feature-branch workflow. 
*   **`master` / `main`**: The primary branch. It should always be deployable and stable. Do NOT push directly to this branch.
*   **Feature Branches**: Create a new branch for every feature, bug fix, or chore.
    *   Format: `<type>/<short-description>`
    *   Examples: `feat/add-whatsapp-support`, `bugfix/fix-login-redirect`, `chore/update-readme`

### 2. Getting Started & Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/natashakisakye33-a11y/welile-car.git
    cd welile-car
    ```

2.  **Create your branch:**
    ```bash
    git checkout -b feat/your-feature-name
    ```

3.  **Setup the Backend:**
    ```bash
    cd backend
    npm install
    # Create a .env file with your local DATABASE_URL and JWT_SECRET
    npm run postinstall
    npm run db:push
    npm run dev
    ```

4.  **Setup the Frontend:**
    ```bash
    cd ../frontend
    npm install
    # Create a .env file (e.g., VITE_API_URL=http://localhost:3000)
    npm run dev
    ```

### 3. Commit Convention

We enforce **Conventional Commits**. This helps in auto-generating changelogs and tracking the history cleanly.
*   `feat:` A new feature
*   `fix:` A bug fix
*   `docs:` Documentation only changes
*   `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
*   `refactor:` A code change that neither fixes a bug nor adds a feature
*   `perf:` A code change that improves performance
*   `test:` Adding missing tests or correcting existing tests
*   `chore:` Changes to the build process or auxiliary tools and libraries

**Example:**
```bash
git commit -m "feat: implement support ticket redirection to WhatsApp"
```

### 4. Pull Request (PR) Process

1.  **Sync your branch:** Before opening a PR, ensure your branch is up-to-date with `master` to avoid merge conflicts.
    ```bash
    git fetch origin
    git rebase origin/master
    ```
2.  **Push your changes:**
    ```bash
    git push origin HEAD
    ```
3.  **Open a Pull Request:** Go to GitHub and open a Pull Request against the `master` branch.
4.  **PR Description:** Clearly describe what the PR does, why the approach was taken, and link any related GitHub Issues (e.g., `Closes #12`).
5.  **Code Review:** At least one core maintainer must review and approve your PR before it can be merged. Address any feedback promptly.

### 5. Coding Standards
*   **TypeScript:** Use strict typing. Avoid `any` where possible.
*   **Linting/Formatting:** Ensure your code passes all ESLint rules configured in the project before pushing.
*   **Components:** For the frontend, utilize the existing Shadcn UI components in `@/components/ui` rather than building from scratch unless necessary.

---

## 📝 License
This project is proprietary and confidential. All rights reserved by Welile Cars.
