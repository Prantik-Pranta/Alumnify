# 📌 Alumnify (Django)


## ⚙️ Setup Instructions

### 1 Clone the Repository
```bash
git clone https://github.com/Prantik-Pranta/alumnify.git
```
```
cd alumnify
```


### 2 Create and Activate Virtual Environment
```
python -m venv venv
```
# Activate virtual environment

# On Linux/Mac
```
source venv/bin/activate
```
# On Windows
```
venv\Scripts\activate
```


### 3 Install Dependencies
```
pip install -r requirements.txt
```

### 4 Apply Migrations
```
python manage.py makemigrations
```
```
python manage.py migrate
```

### 5 Run Development Server
```
python manage.py runserver
```




### git push rules:

### for **First time**
```
git init
```
```
git add .
```
```
git commit -m "your commited msg here"
```
```
git branch -M main
```
```
git remote add origin [repo link]
```

### if say error: remote origin already exists. Then:
```
git remote set-url origin [repo link]
```
```
git push -u origin main
```
```
To push in a existing repo just
```
```
git add .
```
```
git commit -m "your commited msg here"
```
```
git remote add origin [repo link]
```

### if say error: remote origin already exists. Then:
```
git remote set-url origin [repo link]
```
```
git push -u origin main
```