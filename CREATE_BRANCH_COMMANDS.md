# Create Branch Commands

## Run these commands in your terminal:

### 1. Navigate to your project directory
```bash
cd "C:\Users\mr computer\CascadeProjects\CurrentDao-frontend"
```

### 2. Make sure you're on the main branch
```bash
git checkout main
```

### 3. Pull latest changes from main
```bash
git pull origin main
```

### 4. Create the new feature branch
```bash
git checkout -b feature/portfolio-analytics-implementation
```

### 5. Verify you're on the new branch
```bash
git branch
```

You should see:
```
* feature/portfolio-analytics-implementation
  main
```

### 6. Check the status to see all the new files
```bash
git status
```

You should see all the portfolio analytics files as untracked:
```
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        types/portfolio.ts
        utils/portfolioCalculations.ts
        hooks/usePortfolioAnalytics.ts
        components/portfolio/PerformanceMetrics.tsx
        app/portfolio/history/page.tsx
        PORTFOLIO_ANALYTICS_FIX.md
        CREATE_PR_INSTRUCTIONS.md
        FIXED_PR_STEPS.md
        CREATE_BRANCH_COMMANDS.md
```

## Next Steps (After creating branch):

1. Add all files:
```bash
git add .
```

2. Commit changes:
```bash
git commit -m "feat: Implement comprehensive portfolio analytics system"
```

3. Push to GitHub:
```bash
git push -u origin feature/portfolio-analytics-implementation
```

4. Create PR at:
https://github.com/hkyuni/CurrentDao-frontend/compare/main...feature/portfolio-analytics-implementation

## Troubleshooting:

### If you get "not a git repository":
```bash
git init
git remote add origin https://github.com/hkyuni/CurrentDao-frontend.git
```

### If you get authentication errors:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### If branch already exists:
```bash
git branch -D feature/portfolio-analytics-implementation
git checkout -b feature/portfolio-analytics-implementation
```

## Quick One-Liner:
```bash
cd "C:\Users\mr computer\CascadeProjects\CurrentDao-frontend" && git checkout main && git pull origin main && git checkout -b feature/portfolio-analytics-implementation
```

Run this single command and it will create the branch for you!
