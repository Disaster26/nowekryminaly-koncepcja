import json, re, unicodedata


def slug(s):
    s = s.replace('ł', 'l').replace('Ł', 'L')
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


A = {  # autor: (narodowosc, jezyk oryginalu, notka)
    'Joe Alex': ('polska', 'polski', "Pseudonim Macieja Słomczyńskiego (1920-1998), tłumacza Joyce'a i Szekspira. Jako Joe Alex pisał klasyczne powieści detektywistyczne z pisarzem-detektywem w roli głównej."),
    'Leopold Tyrmand': ('polska', 'polski', 'Pisarz i publicysta (1920-1985). "Zły" to jedna z najsłynniejszych polskich powieści kryminalnych, osadzona w powojennej Warszawie.'),
    'Marek Krajewski': ('polska', 'polski', 'Ur. 1966 we Wrocławiu, filolog klasyczny. Autor cyklu o Eberhardzie Mocku z przedwojennego Breslau i cyklu o Edwardzie Popielskim.'),
    'Zygmunt Miłoszewski': ('polska', 'polski', 'Ur. 1976. Autor trylogii o prokuratorze Teodorze Szackim.'),
    'Remigiusz Mróz': ('polska', 'polski', 'Ur. 1987. Autor wielu cykli, m.in. o adwokatce Joannie Chyłce.'),
    'Katarzyna Bonda': ('polska', 'polski', 'Ur. 1977. Autorka cyklu o profilerce Saszy Załuskiej.'),
    'Mariusz Czubaj': ('polska', 'polski', 'Ur. 1970, antropolog kultury. Autor powieści z profilerem Rudolfem Heinzem.'),
    'Agatha Christie': ('brytyjska', 'angielski', 'Królowa kryminału (1890-1976). Twórczyni Herkulesa Poirota i panny Marple.'),
    'Arthur Conan Doyle': ('brytyjska', 'angielski', 'Pisarz i lekarz (1859-1930), twórca Sherlocka Holmesa.'),
    'Raymond Chandler': ('amerykańska', 'angielski', "Klasyk czarnego kryminału (1888-1959), twórca detektywa Philipa Marlowe'a."),
    'Dashiell Hammett': ('amerykańska', 'angielski', 'Współtwórca amerykańskiego czarnego kryminału (1894-1961).'),
    'Georges Simenon': ('belgijska', 'francuski', 'Belgijski pisarz piszący po francusku (1903-1989), twórca komisarza Maigreta.'),
    'Gaston Leroux': ('francuska', 'francuski', 'Francuski dziennikarz i pisarz (1868-1927).'),
    'Maurice Leblanc': ('francuska', 'francuski', "Francuski pisarz (1864-1941), twórca Arsène'a Lupina."),
    'Stieg Larsson': ('szwedzka', 'szwedzki', 'Szwedzki dziennikarz (1954-2004), autor trylogii Millennium.'),
    'Henning Mankell': ('szwedzka', 'szwedzki', 'Szwedzki pisarz (1948-2015), twórca komisarza Kurta Wallandera.'),
    'Jo Nesbø': ('norweska', 'norweski', "Norweski pisarz i muzyk (ur. 1960), twórca Harry'ego Hole."),
    'Umberto Eco': ('włoska', 'włoski', 'Włoski semiotyk i pisarz (1932-2016).'),
    'Boris Akunin': ('rosyjska', 'rosyjski', 'Pseudonim Grigorija Czchartiszwilego (ur. 1956), twórcy Erasta Fandorina.'),
}
MON = 'Wydawnictwo Ministerstwa Obrony Narodowej'
KSK = 'Klub Srebrnego Klucza'
# tytul, autor, tlumacz, wydawnictwo, nr wyd, rok, cykl, seria, opis
B = [
    ('Powiem wam, jak zginął', 'Joe Alex', '', 'Iskry', 1, 1959, 'Joe Alex', '', 'Pierwsza powieść z Joe Aleksem: zagadka śmierci w zamkniętym gronie podejrzanych.'),
    ('Śmierć mówi w moim imieniu', 'Joe Alex', '', 'Iskry', 1, 1960, 'Joe Alex', '', 'Morderstwo w czasie przedstawienia - Joe Alex szuka sprawcy wśród aktorów i widzów.'),
    ('Jesteś tylko diabłem', 'Joe Alex', '', 'Iskry', 1, 1960, 'Joe Alex', '', 'Klasyczna zagadka w odosobnionym domu, z inspektorem Parkerem u boku.'),
    ('Cichym ścigałam go lotem', 'Joe Alex', '', 'Iskry', 1, 1962, 'Joe Alex', '', 'Śmierć na wykopaliskach - zagadka, w której klucz kryje antyczna poezja.'),
    ('Gdzie przykazań brak dziesięciu', 'Joe Alex', '', 'Iskry', 1, 1968, 'Joe Alex', '', 'Joe Alex i tajemnica śmierci w egzotycznym otoczeniu.'),
    ('Powiem wam, jak zginął', 'Joe Alex', '', 'Wydawnictwo Lubelskie', 2, 1983, 'Joe Alex', '', 'Wznowienie pierwszej powieści z Joe Aleksem.'),
    ('Zły', 'Leopold Tyrmand', '', 'Czytelnik', 1, 1955, '', '', 'Powojenna Warszawa, chuligańskie gangi i tajemniczy mściciel zwany Złym.'),
    ('Zły', 'Leopold Tyrmand', '', 'Czytelnik', 2, 1956, '', '', 'Kolejne wydanie głośnej powieści.'),
    ('Śmierć w Breslau', 'Marek Krajewski', '', 'Wydawnictwo Dolnośląskie', 1, 1999, 'Eberhard Mock', '', 'Breslau, 1933. Eberhard Mock prowadzi śledztwo w sprawie brutalnego mordu w salonce pociągu.'),
    ('Koniec świata w Breslau', 'Marek Krajewski', '', 'W.A.B.', 1, 2003, 'Eberhard Mock', '', 'Mock ściga mordercę, który zostawia przy ofiarach kartki z kalendarza.'),
    ('Widma w mieście Breslau', 'Marek Krajewski', '', 'W.A.B.', 1, 2005, 'Eberhard Mock', '', 'Zagadka ciał znalezionych w Ogrodzie Zoologicznym.'),
    ('Festung Breslau', 'Marek Krajewski', '', 'W.A.B.', 1, 2006, 'Eberhard Mock', '', 'Oblężone miasto, 1945. Mock prowadzi śledztwo w twierdzy.'),
    ('Dżuma w Breslau', 'Marek Krajewski', '', 'W.A.B.', 1, 2007, 'Eberhard Mock', '', 'Młody Mock i seria zabójstw w mieście lat dwudziestych.'),
    ('Głowa Minotaura', 'Marek Krajewski', '', 'W.A.B.', 1, 2009, 'Eberhard Mock', '', 'Mock i Edward Popielski na tropie mordercy między Breslau a Lwowem.'),
    ('Erynie', 'Marek Krajewski', '', 'Znak', 1, 2010, 'Edward Popielski', '', 'Lwów lat trzydziestych i komisarz Popielski wobec zbrodni na dziecku.'),
    ('Liczby Charona', 'Marek Krajewski', '', 'Znak', 1, 2011, 'Edward Popielski', '', 'Popielski, matematyka i zagadka zaszyfrowanych listów.'),
    ('Uwikłanie', 'Zygmunt Miłoszewski', '', 'W.A.B.', 1, 2007, 'Teodor Szacki', '', 'Prokurator Szacki bada śmierć uczestnika terapii ustawień rodzinnych.'),
    ('Ziarno prawdy', 'Zygmunt Miłoszewski', '', 'W.A.B.', 1, 2011, 'Teodor Szacki', '', 'Sandomierz i morderstwo, które budzi stare uprzedzenia.'),
    ('Gniew', 'Zygmunt Miłoszewski', '', 'W.A.B.', 1, 2014, 'Teodor Szacki', '', 'Olsztyn - ostatnie śledztwo prokuratora Szackiego.'),
    ('Kasacja', 'Remigiusz Mróz', '', 'Czwarta Strona', 1, 2015, 'Joanna Chyłka', '', 'Adwokatka Joanna Chyłka broni syna biznesmena oskarżonego o podwójne zabójstwo.'),
    ('Zaginięcie', 'Remigiusz Mróz', '', 'Czwarta Strona', 1, 2015, 'Joanna Chyłka', '', 'Chyłka i Zordon w sprawie zaginionej dziewczynki.'),
    ('Rewizja', 'Remigiusz Mróz', '', 'Czwarta Strona', 1, 2016, 'Joanna Chyłka', '', 'Kolejna sprawa kancelarii Żelazny & McVay.'),
    ('Pochłaniacz', 'Katarzyna Bonda', '', 'Muza', 1, 2014, 'Sasza Załuska', '', 'Profilerka Sasza Załuska wraca do Polski i trafia na sprawę z Trójmiasta.'),
    ('Okularnik', 'Katarzyna Bonda', '', 'Muza', 1, 2015, 'Sasza Załuska', '', 'Hajnówka i zbrodnie z przeszłością sięgającą wojny.'),
    ('21:37', 'Mariusz Czubaj', '', 'W.A.B.', 1, 2008, 'Rudolf Heinz', '', 'Profiler Rudolf Heinz i seria zabójstw w Warszawie.'),
    ('Zabójstwo Rogera Ackroyda', 'Agatha Christie', '', 'Iskry', 1, 1966, 'Herkules Poirot', KSK, "Poirot w wiejskim King's Abbot - jedna z najsłynniejszych zagadek kryminału."),
    ('Morderstwo w Orient Expressie', 'Agatha Christie', '', 'Iskry', 1, 1965, 'Herkules Poirot', KSK, 'Pociąg utknął w zaspach, a w przedziale leży martwy pasażer.'),
    ('Śmierć na Nilu', 'Agatha Christie', '', 'Iskry', 1, 1968, 'Herkules Poirot', KSK, 'Rejs po Nilu kończy się zbrodnią na pokładzie.'),
    ('Dziesięciu Murzynków', 'Agatha Christie', '', 'Iskry', 1, 1977, '', KSK, 'Dziesięć osób na odciętej wyspie i wyliczanka, która się spełnia. Późniejsze wydania pod tytułem "I nie było już nikogo".'),
    ('Morderstwo w Orient Expressie', 'Agatha Christie', '', 'Wydawnictwo Dolnośląskie', 2, 1997, 'Herkules Poirot', '', 'Wznowienie klasyki z Herkulesem Poirotem.'),
    ("Pies Baskerville'ów", 'Arthur Conan Doyle', '', MON, 1, 1954, 'Sherlock Holmes', '', 'Sherlock Holmes i legenda piekielnego psa z wrzosowisk Dartmoor.'),
    ('Studium w szkarłacie', 'Arthur Conan Doyle', '', MON, 1, 1956, 'Sherlock Holmes', '', 'Pierwsze spotkanie Holmesa i doktora Watsona.'),
    ('Głęboki sen', 'Raymond Chandler', '', 'Iskry', 1, 1961, 'Philip Marlowe', KSK, 'Philip Marlowe zostaje wynajęty przez generała Sternwooda.'),
    ('Długie pożegnanie', 'Raymond Chandler', '', 'Iskry', 1, 1962, 'Philip Marlowe', KSK, 'Marlowe i przyjaźń, która wciąga go w sprawę morderstwa.'),
    ('Sokół maltański', 'Dashiell Hammett', '', 'Iskry', 1, 1960, 'Sam Spade', KSK, 'Detektyw Sam Spade i polowanie na bezcenną statuetkę.'),
    ('Maigret zastawia sidła', 'Georges Simenon', '', 'Iskry', 1, 1960, 'Komisarz Maigret', KSK, 'Komisarz Maigret zastawia pułapkę na paryskiego mordercę.'),
    ('Tajemnica żółtego pokoju', 'Gaston Leroux', '', MON, 1, 1954, 'Józef Rouletabille', '', 'Zbrodnia w pokoju zamkniętym od wewnątrz - klasyka zagadki niemożliwej.'),
    ('Arsène Lupin, dżentelmen włamywacz', 'Maurice Leblanc', '', MON, 1, 1958, 'Arsène Lupin', '', 'Przygody najsłynniejszego włamywacza literatury.'),
    ('Mężczyźni, którzy nienawidzą kobiet', 'Stieg Larsson', 'Beata Walczak-Larsson', 'Czarna Owca', 1, 2008, 'Millennium', '', 'Dziennikarz Mikael Blomkvist i hakerka Lisbeth Salander badają zaginięcie sprzed lat.'),
    ('Dziewczyna, która igrała z ogniem', 'Stieg Larsson', 'Beata Walczak-Larsson', 'Czarna Owca', 1, 2009, 'Millennium', '', 'Lisbeth Salander oskarżona o potrójne zabójstwo.'),
    ('Zamek z piasku, który runął', 'Stieg Larsson', 'Beata Walczak-Larsson', 'Czarna Owca', 1, 2009, 'Millennium', '', 'Finał trylogii Millennium.'),
    ('Morderca bez twarzy', 'Henning Mankell', '', 'W.A.B.', 1, 2009, 'Kurt Wallander', '', 'Komisarz Wallander i brutalny napad na farmę w Skanii.'),
    ('Pierwszy śnieg', 'Jo Nesbø', 'Iwona Zimnicka', 'Wydawnictwo Dolnośląskie', 1, 2008, 'Harry Hole', '', 'Harry Hole i seryjny morderca, który zostawia bałwana.'),
    ('Pentagram', 'Jo Nesbø', 'Iwona Zimnicka', 'Wydawnictwo Dolnośląskie', 1, 2009, 'Harry Hole', '', 'Upalne Oslo i zabójstwa ze znakiem pentagramu.'),
    ('Imię róży', 'Umberto Eco', 'Adam Szymanowski', 'Państwowy Instytut Wydawniczy', 1, 1987, '', '', 'Opactwo w XIV wieku, seria tajemniczych śmierci i biblioteka-labirynt.'),
    ('Azazel', 'Boris Akunin', 'Jerzy Czech', 'Świat Książki', 1, 2001, 'Erast Fandorin', '', 'Moskwa, 1876. Młody Erast Fandorin i sprawa dziwnego samobójstwa.'),
]
autorzy = {slug(k): {'n': k, 'nar': v[0], 'jez': v[1], 'bio': v[2]} for k, v in A.items()}
ks = []
for i, (t, a, tl, w, nw, r, c, s, o) in enumerate(B, 1):
    ks.append({'id': i, 't': t, 'a': slug(a), 'tl': tl, 'jo': A[a][1], 'w': w, 'nw': nw, 'r': r, 'c': c, 's': s, 'o': o, 'isbn': ''})
with open('data.js', 'w', encoding='utf-8') as f:
    f.write('window.NK_AUTORZY=' + json.dumps(autorzy, ensure_ascii=False) + ';\nwindow.NK_KSIAZKI=' + json.dumps(ks, ensure_ascii=False) + ';\n')
print(len(ks), len(autorzy))
