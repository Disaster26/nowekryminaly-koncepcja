# nowekryminaly.pl - prototyp mechanizmu biblioteki

Klikalny prototyp (HTML + JS, bez serwera) pokazujący, jak będzie działać bibliografia kryminałów wydanych po polsku od 1901 r.

**Dane są przykładowe** (46 pozycji, 19 autorów): tytuły prawdziwe, szczegóły wydań (wydawnictwo, rok, tłumacz, seria) poglądowe. Docelowo cała baza z Excela właściciela (ok. 33 000 pozycji, ok. 3 700 autorów). Okładki to szare kafle zastępcze.

## Co pokazuje prototyp
- Strona główna: wyszukiwarka, zapowiedzi, nowości, przeglądanie według dekad, autorzy, cykle, narodowości.
- Lista z filtrami i licznikami: autor, wydawnictwo, narodowość autora, rok (zakres), cykl, seria wydawnicza, język oryginału; sortowanie, stronicowanie po 48.
- Wyszukiwarka z podpowiedziami (autorzy, cykle, serie, tytuły), obsługa klawiaturą.
- Karta książki: 11 pól (tytuł, autor, tłumacz, język oryginału, wydawnictwo, nr wydania, rok, cykl, seria, opis, ISBN, narodowość autora), inne wydania tego tytułu, pozostałe tomy cyklu.
- Strona autora: książki chronologicznie, rok po roku.
- Strona roku (np. `#/rok/1954`): wszystkie okładki z danego roku, przejście do roku poprzedniego/następnego.
- `#/test`: generuje 33 000 syntetycznych rekordów i mierzy czas szukania i liczenia filtrów w przeglądarce (ok. 1-6 ms).

## Architektura docelowa (33 000+ rekordów, szybko także na telefonie)

### Dane
- **MySQL** (hosting właściciela): tabele `ksiazki`, `autorzy`, `wydawnictwa`, `cykle`, `serie`, `jezyki`, `narodowosci` + tabele pomocnicze z gotowymi licznikami (np. liczba książek autora, roku, serii).
- Indeksy na wszystkich polach filtrów (`autor_id`, `wydawnictwo_id`, `rok`, `cykl_id`, `seria_id`, `jezyk_id`, `narodowosc_id`) i indeks pełnotekstowy (FULLTEXT, parser ngram) na tytule, autorze, tłumaczu, serii i opisie. Wyszukiwanie bez polskich znaków (kolumna znormalizowana: "smierc" znajduje "Śmierć").

### Import z Excela
- Właściciel dalej pracuje w Excelu. Dwie drogi (do wyboru):
  1. **Panel**: wgrywa plik XLSX/CSV przyciskiem "Importuj", widzi podsumowanie (ile nowych, zmienionych, błędnych wierszy) i zatwierdza.
  2. **Automat**: zapisuje plik do wskazanego folderu na hostingu, a zadanie CRON raz na dobę (np. w nocy) sam go wczytuje.
- Import jest przyrostowy: każdy wiersz ma klucz (np. ISBN albo stały numer wiersza/ID w Excelu), więc aktualizowane są tylko zmienione rekordy; usunięte w Excelu znikają ze strony. Raport importu (np. brak autora, zły rok) w panelu i mailem.
- Wymagany stały układ kolumn (11 kolumn jak dziś) - ustalimy go raz na początku.

### Okładki
- Skrypt skanuje folder z okładkami na hostingu (nazwa pliku = ISBN albo ID z Excela), tworzy wersje WebP o jednej wysokości (np. 300 px na listy i 900 px na kartę książki), z zachowaniem proporcji. Oryginały zostają nietknięte.
- Generowanie tylko dla nowych/zmienionych plików, więc codzienna aktualizacja trwa sekundy. Brak okładki = elegancki kafel zastępczy jak w prototypie.

### Strony i Google
- Każdy autor, rok, seria, cykl, wydawnictwo i książka ma własny, stały adres, np. `/autor/marek-krajewski/`, `/rok/1954/`, `/seria/klub-srebrnego-klucza/`, `/cykl/eberhard-mock/`, `/ksiazka/smierc-w-breslau-1999/`.
- Strony renderowane na serwerze (PHP) jako zwykły HTML - Google widzi pełną treść bez JavaScriptu; tytuły i opisy stron generowane automatycznie (np. "Marek Krajewski - wszystkie książki chronologicznie").
- Mapa witryny (sitemap.xml, dzielona po 10 000 adresów) generowana po każdym imporcie; dane strukturalne `Book` + `BreadcrumbList`.
- Pamięć podręczna stron (cache plikowy, odświeżany po imporcie) - strony autorów i lat ładują się natychmiast; lista z filtrami pyta bazę z indeksami (typowo kilka-kilkadziesiąt ms).

### Wyszukiwarka i filtry
- Podpowiedzi z osobnego, lekkiego zapytania (autorzy, serie, cykle, tytuły; prefiks i fragment), odpowiedź w JSON, wyświetlana po 2 znakach.
- Liczniki przy filtrach liczone w bazie (GROUP BY na indeksach) i keszowane dla częstych kombinacji. Stronicowanie po 48 pozycji, okładki ładowane leniwie (lazy) w WebP.

### Panel
- Logowanie właściciela, import pliku z podglądem zmian, ręczna edycja pojedynczej książki/autora (np. notka o autorze), oznaczanie zapowiedzi i nowości na stronie głównej, raport importu.

### Bez sprzedaży
- Strona niekomercyjna: bez koszyka i płatności. Ewentualnie w przyszłości link "u wydawcy".

## Uruchomienie prototypu
Dowolny serwer statyczny (np. GitHub Pages). Pliki: `index.html`, `app.js`, `data.js` (generowany przez `gen_data.py`), `fonts/`.
