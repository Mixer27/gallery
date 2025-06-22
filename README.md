# Gallery

Aplikacja umożliwiająca dodawanie użytkowników, tworzenie galerii oraz dodawanie zdjęć do galerii.

## admin

Dane logowania dla admina

* `login` admin
* `hasło` - 123123123

## Funkcjonalności:

Admin:

* Dodawanie użytkowników przez dedykowany formularz `Add user`
* Usuwanie użytkowników za pomocą przycisku umiejscowionego przy danym użytkowniku na widoku `Users`
* to samo co zwykły użytkownik ale dla każdego zasobu w bazie.

Zwykły użytkownik:

* zalogowanie się do aplikacji
* dodawanie (przez dedykowany formularz), edycja usuwanie galerii (z listy galerii)
* dodawanie (przez dedykowany formularz), wyświetlanie, edycja oraz usuwanie obrazków (z widoku `Gallery browse`)
* przeglądanie galerii swoich oraz innych użytkowników

Import przykładowej bazy danych:

```bash
    # wywołać komendę w katalogu głównym aplikacji
    mongorestore --archive="backup/GalleryDB"