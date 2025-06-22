# 🎨 Gallery

Aplikacja umożliwiająca dodawanie użytkowników, tworzenie galerii oraz dodawanie zdjęć do galerii. Wspiera rolę **admina** oraz **zwykłego użytkownika** z odpowiednimi uprawnieniami.

## ⚙️ Funkcjonalności

### 🔐 Administrator

- Dodawanie użytkowników za pomocą formularza **Add user**
- Usuwanie użytkowników przy użyciu przycisku obok użytkownika na widoku **Users**
- Ma pełny dostęp do zasobów w bazie (wszystkie galerie i obrazy każdego użytkownika)
- Wszystkie funkcjonalności dostępne dla zwykłego użytkownika

### 👤 Zwykły użytkownik

- Logowanie się do aplikacji
- Zarządzanie galeriami (dodawanie, edycja, usuwanie)
- Zarządzanie obrazkami w galerii (dodawanie, przeglądanie, edycja, usuwanie)
- Przeglądanie własnych galerii oraz galerii innych użytkowników

---

## 🧩 Modele danych

W projekcie zdefiniowano trzy główne modele danych: **User**, **Gallery**, **Image**.

### 👤 Model: `User`

Reprezentuje użytkownika systemu.  
**Kolekcja**: `users`

| Pole       | Typ      | Wymagane | Maks. długość | Opis                              |
|------------|----------|----------|----------------|-----------------------------------|
| `name`     | String   | Nie      | 100            | Imię użytkownika                  |
| `surname`  | String   | Nie      | 100            | Nazwisko użytkownika              |
| `username` | String   | Nie      | 100            | Unikalna nazwa użytkownika        |
| `password` | String   | Nie      | —              | Hasło (przechowywane zaszyfrowane)|

---

### 🖼️ Model: `Gallery`

Reprezentuje galerię utworzoną przez użytkownika.  
**Kolekcja**: `galleries`

| Pole          | Typ             | Wymagane | Maks. długość | Opis                                 |
|---------------|------------------|----------|----------------|--------------------------------------|
| `name`        | String           | Tak      | 100            | Nazwa galerii                        |
| `description` | String           | Nie      | 200            | Opis galerii                         |
| `date`        | Date             | Nie      | —              | Data utworzenia (domyślnie: teraz)   |
| `user`        | ObjectId (User)  | Tak      | —              | Referencja do właściciela galerii    |

---

### 🖼️ Model: `Image`

Reprezentuje pojedynczy obraz w galerii.  
**Kolekcja**: `images`

| Pole          | Typ               | Wymagane | Maks. długość | Opis                                          |
|---------------|--------------------|----------|----------------|-----------------------------------------------|
| `name`        | String             | Tak      | 100            | Nazwa obrazu                                  |
| `description` | String             | Nie      | 200            | Opis obrazu                                   |
| `path`        | String             | Nie      | 200            | Ścieżka do pliku (URL lub lokalna ścieżka)    |
| `gallery`     | ObjectId (Gallery) | Tak      | —              | Referencja do galerii, do której należy obraz |

---

## 🔗 Relacje między modelami

- Jeden **User** może mieć wiele **Gallery**
- Jedna **Gallery** może zawierać wiele **Image**
- Każdy **Image** należy do jednej **Gallery**, która należy do jednego **User**

## 🧪 Wykorzystane technologie

Projekt został zrealizowany w oparciu o poniższe technologie i biblioteki:

- **Node.js** – środowisko uruchomieniowe JavaScript po stronie serwera
- **JavaScript (ES)** – język programowania używany do logiki backendowej
- **MongoDB** – nierelacyjna baza danych (NoSQL) do przechowywania danych aplikacji
- **Express** – minimalistyczny framework webowy dla Node.js, odpowiedzialny za routing i logikę serwera
- **Mongoose** – biblioteka ODM (Object Data Modeling) dla MongoDB, upraszcza operacje na bazie danych
- **Pug** – silnik szablonów, umożliwiający dynamiczne generowanie HTML na serwerze
- **Bootstrap** – framework CSS zapewniający szybkie tworzenie responsywnych interfejsów
- **Swagger** – narzędzie do dokumentowania i testowania API w standardzie OpenAPI


---

## 📦 Wykorzystane pakiety

Lista głównych pakietów Node.js użytych w projekcie:

| Pakiet                  | Opis                                                                 |
|-------------------------|----------------------------------------------------------------------|
| `bcrypt`                | Hashowanie haseł użytkowników                                         |
| `cookie-parser`         | Obsługa ciasteczek HTTP                                               |
| `debug`                 | Prosty debuger do logowania informacji w aplikacji                   |
| `express`               | Minimalistyczny framework do tworzenia serwera HTTP                  |
| `express-async-handler` | Ułatwia obsługę błędów w funkcjach async w Express                   |
| `express-validator`     | Walidacja danych wejściowych w żądaniach HTTP                        |
| `formidable`            | Parsowanie formularzy, w tym upload plików                          |
| `http-errors`           | Generowanie błędów HTTP z odpowiednim statusem                      |
| `jsonwebtoken`          | Tworzenie i weryfikacja tokenów JWT (autoryzacja)                   |
| `mongoose`              | ODM do komunikacji z bazą MongoDB                                    |
| `morgan`                | Logger HTTP do środowiska deweloperskiego                           |
| `pug`                   | Silnik szablonów do generowania HTML po stronie serwera             |
| `swagger-ui-express`    | Integracja Swagger UI z aplikacją Express                           |
| `yamljs`                | Parsowanie plików YAML (np. plików Swagger/OpenAPI)                 |


---

## 🗂️ Struktura projektu

Poniżej przedstawiono strukturę katalogów i plików projektu wraz z ich przeznaczeniem (bez plików `.pdf`):

```
gallery-app/
├── backup/                # Kopie zapasowe bazy danych (do `mongorestore`)
├── bin/                   # Binarki (do startu serwera)
├── controllers/           # Logika biznesowa aplikacji (obsługa żądań HTTP)
├── middleware/            # Własne middleware Express (np. autoryzacja)
├── models/                # Modele danych Mongoose (MongoDB)
├── node_modules/          # Folder zainstalowanych zależności Node.js
├── public/                # Pliki statyczne (obrazki wrzucane prez userów)
├── routes/                # Definicje ścieżek Express (routing)
├── views/                 # Szablony Pug generujące HTML
│
├── app.js                 # Główne wejście aplikacji Express
├── openapi.yaml           # Specyfikacja API w formacie OpenAPI (Swagger)
├── package.json           # Definicja projektu i zależności
├── README.md              # Dokumentacja projektu
```

## 👮‍♂️ Admin – Dane logowania

- **Login**: `admin`  
- **Hasło**: `123123123`

## 👤 John Doe (przykładowy użytkownik)

- **Login**: `johnd`  
- **Hasło**: `123123123`

Użytkownik stworzony do celów testowych

## 🚀 Uruchamianie aplikacji

### 📥 Import przykładowej bazy danych

Uruchom w katalogu głównym aplikacji:

```bash
mongorestore --archive="backup/GalleryDB"
```

W bazie są wgrane obrazki, dlatego aby aplikacja działała poprawnie po wczytaniu backupu bazy, wymagane jest korzystanie z najnowszej wersji z githuba (która ma w folderze `/public/images` obrazki wykorzystywane w bazie)

### 📦 Instalacja zależności

```bash
npm install
```

### ▶️ Start aplikacji

```bash
npm run start
```