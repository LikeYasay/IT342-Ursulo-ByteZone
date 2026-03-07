## 🛠 Git Workflow (Best Practices)

### 1. Check Current Status
```bash
git status
```

### 2. Update Local Main
```bash
git checkout main
git pull origin main
```

### 3. Create a New Branch
```bash
git checkout -b feature/your-feature-name
```
Examples:
- feature/user-accounts
- feature/ui-redesign
- fix/logout-bug

Follow the branch naming convention below:

```bash
main task/module/short description
```

Main Task Types:

| Task Type | Prefix |
|------------|----------|
| Technical | tech |
| Feature | feature |
| Bug Fix | fix |
| Setup | setup |

Examples:
- git branch feature/login/create_login_ui  
- git branch tech/login/change_library  
- git branch fix/login/color_of_button  
- git branch setup/login/auth_library  

### 4. Stage & Commit Changes
```bash
git add .
git commit -m "feature(login): create login ui"
```

Commit Using Proper Format:

```bash
main task(module): short description
```

Examples:
- git commit -m "feature(login): create login ui"  
- git commit -m "tech(login): change library"  
- git commit -m "fix(login): color of the button"  
- git commit -m "setup(login): authentication library"  

### 5. Push Branch to GitHub
```bash
git push origin feature/your-feature-name
```

### 6. Open Pull Request (PR) on GitHub
- Compare your branch → main  
- Add description  
- Request review and merge once approved  

### 7. Sync After Merge
```bash
git checkout main
git pull origin main
```

### 8. Clean Up Old Branches (Optional)
```bash
git branch -d feature/your-feature-name                  # delete locally
git push origin --delete feature/your-feature-name       # delete on GitHub
```
