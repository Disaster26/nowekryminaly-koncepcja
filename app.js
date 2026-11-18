(function(){
'use strict';
var AUT=window.NK_AUTORZY, BAZA=window.NK_KSIAZKI, K=BAZA, TRYB_TEST=false;
var $=function(s,r){return (r||document).querySelector(s)};
var app=$('#app');
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){return String(s||'').toLowerCase().replace(/ł/g,'l').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ø/g,'o')}
function slug(s){return norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function autor(b){return AUT[b.a]||{n:b.a,nar:'',jez:'',bio:''}}
function pl(n,a,b,c){var d=n%10,e=n%100;return n==1?a:(d>=2&&d<=4&&(e<10||e>=20))?b:c}
function ile(n){return n.toLocaleString('pl-PL')+' '+pl(n,'pozycja','pozycje','pozycji')}

/* indeks wyszukiwania - liczony raz */
function indeksuj(){K.forEach(function(b){var a=autor(b);b._q=norm(b.t+' '+a.n+' '+b.c+' '+b.s+' '+b.w+' '+b.tl);b._nar=a.nar;b._an=a.n})}
indeksuj();

/* okladka zastepcza */
function okladka(b,duza){
  var a=autor(b), odc=['#D3D7DC','#CACFD5','#C2C8CF','#D9DCE0'][b.id%4];
  return '<div class="okl'+(duza?' duza':'')+'" style="background:'+odc+'" aria-hidden="true"><span class="okl-t">'+esc(b.t)+'</span><span class="okl-a">'+esc(a.n)+'</span><span class="okl-r">'+b.r+'</span></div>';
}
function kafel(b){
  var a=autor(b);
  return '<a class="kafel" href="#/ksiazka/'+b.id+'">'+okladka(b)+'<span class="k-t">'+esc(b.t)+'</span><span class="k-a">'+esc(a.n)+'</span><span class="k-m">'+esc(b.w)+', '+b.r+(b.nw>1?' - wyd. '+b.nw:'')+'</span></a>';
}
function siatka(lista){return lista.length?'<div class="siatka-k">'+lista.map(kafel).join('')+'</div>':'<p class="pusto">Brak pozycji dla wybranych filtrów.</p>'}

/* parametry */
function parsuj(){
  var h=location.hash.replace(/^#\/?/,''), q='';
  var i=h.indexOf('?'); if(i>=0){q=h.slice(i+1);h=h.slice(0,i)}
  var p={}; q.split('&').forEach(function(kv){if(!kv)return;var x=kv.split('=');p[decodeURIComponent(x[0])]=decodeURIComponent((x[1]||'').replace(/\+/g,' '))});
  return {cz:h.split('/').filter(Boolean).map(decodeURIComponent),p:p};
}
function link(p){var s=[];for(var k in p)if(p[k]!==''&&p[k]!=null)s.push(encodeURIComponent(k)+'='+encodeURIComponent(p[k]));return '#/szukaj'+(s.length?'?'+s.join('&'):'')}

var POLA=[['autor','Autor',function(b){return b.a},function(v){return (AUT[v]||{n:v}).n}],
 ['wyd','Wydawnictwo',function(b){return b.w}],
 ['nar','Narodowość autora',function(b){return b._nar}],
 ['cykl','Cykl',function(b){return b.c}],
 ['seria','Seria wydawnicza',function(b){return b.s}],
 ['jezyk','Język oryginału',function(b){return b.jo}]];

function filtruj(p,pomin){
  var q=norm(p.q||'').split(/\s+/).filter(Boolean), od=+p.od||0, d=+p.do||0, rok=+p.rok||0;
  return K.filter(function(b){
    for(var i=0;i<q.length;i++) if(b._q.indexOf(q[i])<0) return false;
    if(rok&&b.r!==rok) return false;
    if(od&&b.r<od) return false; if(d&&b.r>d) return false;
    for(var j=0;j<POLA.length;j++){var f=POLA[j];if(f[0]===pomin)continue;if(p[f[0]]&&f[2](b)!==p[f[0]])return false}
    return true;
  });
}
function zlicz(lista,fn){var m={};lista.forEach(function(b){var v=fn(b);if(v)m[v]=(m[v]||0)+1});return Object.keys(m).map(function(k){return [k,m[k]]}).sort(function(a,b){return b[1]-a[1]||a[0].localeCompare(b[0],'pl')})}

/* widoki */
function naglowekSekcji(t,a){return '<div class="sek-g"><h2>'+t+'</h2>'+(a||'')+'</div>'}

function glowna(){
  var nowosci=K.slice().sort(function(a,b){return b.r-a.r||b.id-a.id}).slice(0,10);
  var dek={};K.forEach(function(b){var d=Math.floor(b.r/10)*10;dek[d]=(dek[d]||0)+1});
  var dekady='';for(var d=1900;d<=2020;d+=10){var n=dek[d]||0;dekady+='<a class="dek'+(n?'':' zero')+'" href="'+link({od:d,do:d+9})+'"><b>'+d+'.</b><span>'+n+'</span></a>'}
  var autorzy=zlicz(K,function(b){return b.a}).slice(0,12).map(function(x){var a=AUT[x[0]];return '<a class="poz" href="#/autor/'+x[0]+'"><b>'+esc(a.n)+'</b><span>'+esc(a.nar)+' - '+x[1]+'</span></a>'}).join('');
  var cykle=zlicz(K,function(b){return b.c}).slice(0,10).map(function(x){return '<a class="poz" href="'+link({cykl:x[0]})+'"><b>'+esc(x[0])+'</b><span>'+x[1]+' '+pl(x[1],'tom','tomy','tomów')+'</span></a>'}).join('');
  var narody=zlicz(K,function(b){return b._nar}).map(function(x){return '<a class="chip" href="'+link({nar:x[0]})+'">'+esc(x[0])+' <span>'+x[1]+'</span></a>'}).join('');
  var zap='';for(var i=1;i<=6;i++)zap+='<div class="kafel zap"><div class="okl" aria-hidden="true"><span class="okl-t">Zapowiedź</span><span class="okl-a">tytuł z Excela</span><span class="okl-r">2027</span></div><span class="k-t">Przykładowa zapowiedź '+i+'</span><span class="k-a">autor, wydawnictwo, data premiery</span></div>';
  var lb=K[Math.floor(Math.random()*K.length)],la=autor(lb);var losowa='<a class="losowa" href="#/ksiazka/'+lb.id+'"><span class="l-e"><span>Karta z kartoteki</span><span>nr '+lb.id+'</span></span><span class="l-in">'+okladka(lb)+'<span><b>'+esc(lb.t)+'</b><span>'+esc(la.n)+'</span><span>'+esc(lb.w)+', '+lb.r+'</span>'+(lb.c?'<span>cykl: '+esc(lb.c)+'</span>':'')+'</span></span></a>';
  return '<section class="start"><div class="wrap start-s"><div><h1>Wszystkie kryminały wydane po polsku od 1901 roku</h1><p>Bibliografia: tytuły, autorzy, tłumacze, wydawnictwa, serie i okładki. Bez sprzedaży - do szukania i przeglądania.</p>'+szukajka(true)+'<p class="przyklady">Na przykład: <a href="#/autor/marek-krajewski">Marek Krajewski</a> <a href="#/rok/1954">rok 1954</a> <a href="'+link({seria:'Klub Srebrnego Klucza'})+'">Klub Srebrnego Klucza</a> <a href="'+link({nar:'norweska'})+'">autorzy z Norwegii</a></p></div>'+losowa+'</div></section>'+
  '<section class="sek"><div class="wrap">'+naglowekSekcji('Zapowiedzi','<span class="uwaga">kafle przykładowe - w bazie docelowej z kolumny "zapowiedź" w Excelu</span>')+'<div class="tasma">'+zap+'</div></div></section>'+
  '<section class="sek szara"><div class="wrap">'+naglowekSekcji('Nowości w bazie','<a class="wiecej" href="'+link({sort:'rok-'})+'">Wszystkie od najnowszych</a>')+'<div class="tasma">'+nowosci.map(kafel).join('')+'</div></div></section>'+
  '<section class="sek"><div class="wrap">'+naglowekSekcji('Według lat wydania')+'<div class="dekady">'+dekady+'</div></div></section>'+
  '<section class="sek szara"><div class="wrap dwie"><div>'+naglowekSekcji('Autorzy','<a class="wiecej" href="#/autorzy">Wszyscy autorzy</a>')+'<div class="lista-p">'+autorzy+'</div></div><div>'+naglowekSekcji('Cykle','<a class="wiecej" href="#/cykle">Wszystkie cykle i serie</a>')+'<div class="lista-p">'+cykle+'</div></div></div></section>'+
  '<section class="sek"><div class="wrap">'+naglowekSekcji('Narodowość autorów')+'<div class="chipy">'+narody+'</div></div></section>';
}

function szukajka(duza,wart){
  return '<form class="szuk'+(duza?' duza':'')+'" role="search" autocomplete="off"><label class="sr" for="q'+(duza?1:2)+'">Szukaj</label><input id="q'+(duza?1:2)+'" name="q" type="search" placeholder="Tytuł, autor, seria, wydawnictwo..." value="'+esc(wart||'')+'"><button type="submit">Szukaj</button><div class="podp" hidden></div></form>';
}

function lista(p){
  var t0=performance.now();
  var wyn=filtruj(p);
  var sort=p.sort||'rok+';
  var cmp={'rok+':function(a,b){return a.r-b.r||a.t.localeCompare(b.t,'pl')},'rok-':function(a,b){return b.r-a.r||a.t.localeCompare(b.t,'pl')},'tytul':function(a,b){return a.t.localeCompare(b.t,'pl')},'autor':function(a,b){return a._an.localeCompare(b._an,'pl')||a.r-b.r}}[sort];
  wyn.sort(cmp);
  var na=48, str=Math.max(1,+p.str||1), stron=Math.max(1,Math.ceil(wyn.length/na));
  var widok=wyn.slice((str-1)*na,str*na);
  var filtry=POLA.map(function(f){
    var baza=filtruj(p,f[0]), z=zlicz(baza,f[2]), pokaz=z.slice(0,8), reszta=z.length-8;
    var opcje=pokaz.map(function(x){var on=p[f[0]]===x[0];var np=Object.assign({},p);np[f[0]]=on?'':x[0];delete np.str;return '<a class="opc'+(on?' on':'')+'" href="'+link(np)+'"><span>'+esc(f[3]?f[3](x[0]):x[0])+'</span><i>'+x[1].toLocaleString('pl-PL')+'</i></a>'}).join('');
    if(p[f[0]]&&!pokaz.some(function(x){return x[0]===p[f[0]]})){var np=Object.assign({},p);np[f[0]]='';opcje='<a class="opc on" href="'+link(np)+'"><span>'+esc(f[3]?f[3](p[f[0]]):p[f[0]])+'</span><i>x</i></a>'+opcje}
    return z.length?'<details class="filtr"'+(p[f[0]]||f[0]=='autor'||f[0]=='nar'?' open':'')+'><summary>'+f[1]+'</summary>'+opcje+(reszta>0?'<p class="resz">+ '+reszta+' więcej (w bazie docelowej: lista z wyszukiwaniem)</p>':'')+'</details>':'';
  }).join('');
  var lata='<details class="filtr" open><summary>Rok wydania</summary><form class="lata" data-lata><input name="od" inputmode="numeric" placeholder="od" value="'+esc(p.od||p.rok||'')+'" aria-label="Rok od"><span>-</span><input name="do" inputmode="numeric" placeholder="do" value="'+esc(p.do||p.rok||'')+'" aria-label="Rok do"><button>OK</button></form></details>';
  var aktywne=[];['q','autor','wyd','nar','cykl','seria','jezyk','rok','od','do'].forEach(function(k){if(p[k]){var np=Object.assign({},p);np[k]='';delete np.str;var et=k=='autor'?(AUT[p[k]]||{n:p[k]}).n:(k=='q'?'"'+p[k]+'"':k=='od'?'od '+p[k]:k=='do'?'do '+p[k]:p[k]);aktywne.push('<a class="chip on" href="'+link(np)+'">'+esc(et)+' <span>x</span></a>')}});
  var tytul=p.autor&&!p.cykl?(AUT[p.autor]||{n:p.autor}).n+' - książki':p.cykl?'Cykl: '+p.cykl:p.seria?'Seria: '+p.seria:p.wyd?'Wydawnictwo: '+p.wyd:p.nar?'Autorzy - narodowość '+p.nar:p.jezyk?'Przekłady z języka: '+p.jezyk:p.q?'Wyniki dla "'+p.q+'"':'Wszystkie książki';
  var pag='';if(stron>1){for(var i=1;i<=stron;i++){var np=Object.assign({},p);np.str=i;pag+='<a class="'+(i==str?'on':'')+'" href="'+link(np)+'">'+i+'</a>'}pag='<nav class="pag">'+pag+'</nav>'}
  var ms=(performance.now()-t0);
  return '<div class="wrap lista"><aside class="filtry" id="filtry"><div class="f-g"><b>Filtry</b><button class="zamk-f" type="button" aria-label="Zamknij filtry">Gotowe</button></div>'+lata+filtry+'</aside><div class="wyniki"><h1>'+esc(tytul)+'</h1><div class="pas"><span>'+ile(wyn.length)+' <small>('+ms.toFixed(1)+' ms)</small></span><button class="otw-f" type="button">Filtry</button><label>Sortuj <select data-sort><option value="rok+"'+(sort=='rok+'?' selected':'')+'>rok: od najstarszych</option><option value="rok-"'+(sort=='rok-'?' selected':'')+'>rok: od najnowszych</option><option value="tytul"'+(sort=='tytul'?' selected':'')+'>tytuł A-Z</option><option value="autor"'+(sort=='autor'?' selected':'')+'>autor A-Z</option></select></label></div>'+(aktywne.length?'<div class="chipy akt">'+aktywne.join('')+'<a class="czysc" href="#/szukaj">Wyczyść</a></div>':'')+siatka(widok)+pag+'</div></div>';
}

function wiersz(et,w){return '<tr><th>'+et+'</th><td>'+(w||'<span class="brak">-</span>')+'</td></tr>'}
function ksiazka(id){
  var b=K.find(function(x){return x.id==id});if(!b)return nieMa();
  var a=autor(b);
  var inne=K.filter(function(x){return x.id!==b.id&&norm(x.t)===norm(b.t)&&x.a===b.a});
  var cykl=b.c?K.filter(function(x){return x.c===b.c&&x.id!==b.id}).sort(function(x,y){return x.r-y.r}):[];
  var isbn=b.isbn||(b.r<1974?'<span class="brak">wydanie sprzed ISBN</span>':'<span class="brak">z Excela w bazie docelowej</span>');
  return '<div class="wrap"><nav class="okr"><a href="#/">Strona główna</a> / <a href="#/autor/'+b.a+'">'+esc(a.n)+'</a> / <span>'+esc(b.t)+'</span></nav><div class="karta-k"><div class="kk-okl">'+okladka(b,true)+'<p class="okl-info">Okładka zastępcza - docelowo skan z folderu, przeskalowany do jednej wysokości.</p></div><div class="fiszka"><h1>'+esc(b.t)+'</h1><p class="fa"><a href="#/autor/'+b.a+'">'+esc(a.n)+'</a></p><table>'+
   wiersz('Tytuł',esc(b.t))+wiersz('Autor','<a href="#/autor/'+b.a+'">'+esc(a.n)+'</a>')+wiersz('Tłumacz',esc(b.tl))+wiersz('Język oryginału','<a href="'+link({jezyk:b.jo})+'">'+esc(b.jo)+'</a>')+wiersz('Wydawnictwo','<a href="'+link({wyd:b.w})+'">'+esc(b.w)+'</a>')+wiersz('Numer wydania',b.nw?String(b.nw):'')+wiersz('Rok wydania','<a href="#/rok/'+b.r+'">'+b.r+'</a>')+wiersz('Cykl',b.c?'<a href="'+link({cykl:b.c})+'">'+esc(b.c)+'</a>':'')+wiersz('Seria',b.s?'<a href="'+link({seria:b.s})+'">'+esc(b.s)+'</a>':'')+wiersz('ISBN',isbn)+wiersz('Narodowość autora','<a href="'+link({nar:a.nar})+'">'+esc(a.nar)+'</a>')+
   '</table><div class="opis"><h2>Opis</h2><p>'+esc(b.o)+'</p></div></div></div>'+
   (inne.length?'<section class="sek-w">'+naglowekSekcji('Inne wydania tego tytułu')+siatka(inne)+'</section>':'')+
   (cykl.length?'<section class="sek-w">'+naglowekSekcji('Cykl: '+esc(b.c),'<a class="wiecej" href="'+link({cykl:b.c})+'">Cały cykl</a>')+'<div class="tasma">'+cykl.map(kafel).join('')+'</div></section>':'')+'</div>';
}

function autorStr(s){
  var a=AUT[s];if(!a)return nieMa();
  var ks=K.filter(function(b){return b.a===s}).sort(function(x,y){return x.r-y.r||x.t.localeCompare(y.t,'pl')});
  var lata={};ks.forEach(function(b){(lata[b.r]=lata[b.r]||[]).push(b)});
  var os=Object.keys(lata).map(function(r){return '<div class="os-rok"><a class="os-r" href="#/rok/'+r+'">'+r+'</a><div class="siatka-k">'+lata[r].map(kafel).join('')+'</div></div>'}).join('');
  var cykle=zlicz(ks,function(b){return b.c}).map(function(x){return '<a class="chip" href="'+link({autor:s,cykl:x[0]})+'">'+esc(x[0])+' <span>'+x[1]+'</span></a>'}).join('');
  return '<div class="wrap"><nav class="okr"><a href="#/">Strona główna</a> / <a href="#/autorzy">Autorzy</a> / <span>'+esc(a.n)+'</span></nav><header class="aut-g"><h1>'+esc(a.n)+'</h1><p class="aut-m"><a href="'+link({nar:a.nar})+'">narodowość: '+esc(a.nar)+'</a> - '+ile(ks.length)+' w bazie - '+(ks.length?ks[0].r+'-'+ks[ks.length-1].r:'')+'</p><p class="bio">'+esc(a.bio)+'</p>'+(cykle?'<div class="chipy">'+cykle+'</div>':'')+'</header><h2 class="os-t">Książki chronologicznie</h2><div class="os">'+os+'</div></div>';
}

function rokStr(r){
  r=+r;var ks=K.filter(function(b){return b.r===r}).sort(function(x,y){return x._an.localeCompare(y._an,'pl')});
  var lata=Array.from(new Set(K.map(function(b){return b.r}))).sort(function(a,b){return a-b});
  var prev=lata.filter(function(x){return x<r}).pop(), next=lata.filter(function(x){return x>r})[0];
  return '<div class="wrap"><nav class="okr"><a href="#/">Strona główna</a> / <a href="#/lata">Lata</a> / <span>'+r+'</span></nav><header class="rok-g">'+(prev?'<a class="rok-n" href="#/rok/'+prev+'">'+prev+'</a>':'<span></span>')+'<h1>Kryminały wydane w '+r+' r.</h1>'+(next?'<a class="rok-n" href="#/rok/'+next+'">'+next+'</a>':'<span></span>')+'</header><p class="rok-m">'+ile(ks.length)+' - wszystkie okładki z tego roku</p>'+siatka(ks)+'</div>';
}

function autorzyStr(){
  var z=zlicz(K,function(b){return b.a}).sort(function(a,b){return AUT[a[0]].n.split(' ').pop().localeCompare(AUT[b[0]].n.split(' ').pop(),'pl')});
  return '<div class="wrap"><nav class="okr"><a href="#/">Strona główna</a> / <span>Autorzy</span></nav><h1 class="t-str">Autorzy</h1><p class="rok-m">W bazie docelowej ok. 3 700 autorów - z indeksem liter A-Z i wyszukiwaniem.</p><div class="lista-p kol">'+z.map(function(x){var a=AUT[x[0]];return '<a class="poz" href="#/autor/'+x[0]+'"><b>'+esc(a.n)+'</b><span>'+esc(a.nar)+' - '+x[1]+'</span></a>'}).join('')+'</div></div>';
}
function cykleStr(){
  var c=zlicz(K,function(b){return b.c}), s=zlicz(K,function(b){return b.s});
  function l(arr,k){return arr.map(function(x){var o={};o[k]=x[0];return '<a class="poz" href="'+link(o)+'"><b>'+esc(x[0])+'</b><span>'+x[1]+'</span></a>'}).join('')}
  return '<div class="wrap"><nav class="okr"><a href="#/">Strona główna</a> / <span>Cykle i serie</span></nav><h1 class="t-str">Cykle i serie</h1><div class="dwie"><div>'+naglowekSekcji('Cykle (bohater, saga)')+'<div class="lista-p">'+l(c,'cykl')+'</div></div><div>'+naglowekSekcji('Serie wydawnicze')+'<div class="lista-p">'+l(s,'seria')+'</div></div></div></div>';
}
function lataStr(){
  var z=zlicz(K,function(b){return String(b.r)}).sort(function(a,b){return a[0]-b[0]});
  return '<div class="wrap"><nav class="okr"><a href="#/">Strona główna</a> / <span>Lata</span></nav><h1 class="t-str">Lata wydania</h1><div class="chipy">'+z.map(function(x){return '<a class="chip" href="#/rok/'+x[0]+'">'+x[0]+' <span>'+x[1]+'</span></a>'}).join('')+'</div></div>';
}
function nieMa(){return '<div class="wrap"><h1 class="t-str">Nie znaleziono</h1><p><a href="#/">Wróć na stronę główną</a></p></div>'}

/* test 33 000 */
function test(){
  if(!TRYB_TEST){
    var syn=[],n=0,ak=Object.keys(AUT);
    while(syn.length<33000){var b=BAZA[n%BAZA.length];var r=1901+((n*37)%125);syn.push({id:100000+n,t:b.t+(n>=BAZA.length?' ('+(Math.floor(n/BAZA.length)+1)+')':''),a:ak[n%ak.length],tl:b.tl,jo:AUT[ak[n%ak.length]].jez,w:b.w,nw:1+(n%3),r:r,c:b.c,s:b.s,o:b.o,isbn:''});n++}
    K=syn;indeksuj();TRYB_TEST=true;
  }
  var t=performance.now();var a=filtruj({q:'breslau'}).length;var t1=performance.now()-t;
  t=performance.now();var b=filtruj({nar:'norweska',od:'1950',do:'1990'}).length;var t2=performance.now()-t;
  t=performance.now();POLA.forEach(function(f){zlicz(K,f[2])});var t3=performance.now()-t;
  return '<div class="wrap"><h1 class="t-str">Test szybkości: 33 000 rekordów</h1><p class="rok-m">Wygenerowano 33 000 syntetycznych rekordów (powielone dane przykładowe), żeby sprawdzić mechanizm na skali docelowej bazy. Wszystko liczy się w przeglądarce, bez serwera.</p><table class="test"><tr><th>Szukanie "breslau" we wszystkich polach</th><td>'+t1.toFixed(1)+' ms ('+a+' wyników)</td></tr><tr><th>Filtr: narodowość + zakres lat</th><td>'+t2.toFixed(1)+' ms ('+b+' wyników)</td></tr><tr><th>Liczniki wszystkich 6 filtrów</th><td>'+t3.toFixed(1)+' ms</td></tr></table><p>Teraz cały prototyp działa na 33 000 rekordach - <a href="#/szukaj">przejdź do listy</a> i klikaj filtry. <a href="#/" data-reset>Wróć do danych przykładowych</a>.</p><p class="rok-m">Na docelowej stronie wyszukiwanie i filtry liczy baza MySQL na serwerze (indeksy), a strony autorów, lat i serii są gotowe w pamięci podręcznej - opis w README.</p></div>';
}

/* router */
function render(){
  var r=parsuj(),c=r.cz,html,tyt='Nowe Kryminały - bibliografia kryminałów (prototyp)';
  if(!c.length) html=glowna();
  else if(c[0]=='szukaj'){html=lista(r.p);tyt='Szukaj - Nowe Kryminały'}
  else if(c[0]=='ksiazka'){html=ksiazka(c[1]);var b=K.find(function(x){return x.id==c[1]});if(b)tyt=b.t+' - '+autor(b).n+' ('+b.r+') - Nowe Kryminały'}
  else if(c[0]=='autor'){html=autorStr(c[1]);if(AUT[c[1]])tyt=AUT[c[1]].n+' - wszystkie książki - Nowe Kryminały'}
  else if(c[0]=='rok'){html=rokStr(c[1]);tyt='Kryminały wydane w '+c[1]+' r. - Nowe Kryminały'}
  else if(c[0]=='autorzy') html=autorzyStr();
  else if(c[0]=='cykle') html=cykleStr();
  else if(c[0]=='lata') html=lataStr();
  else if(c[0]=='test') html=test();
  else html=nieMa();
  var pr=document.querySelector('.proto');if(pr){if(!pr._o)pr._o=pr.innerHTML;pr.innerHTML=TRYB_TEST?'Tryb testu: prototyp działa teraz na <b>33 000 syntetycznych rekordach</b>. <a href="#/" data-reset>Wróć do danych przykładowych</a>':pr._o}
  app.innerHTML=html;document.title=tyt;
  var hq=$('#q0');if(hq)hq.value=r.p.q||'';
  document.querySelectorAll('.nav a').forEach(function(a){var h=a.getAttribute('href').replace('#/','').split(/[?/]/)[0];a.classList.toggle('on',h===(c[0]||'')&&!!c[0])});
  window.scrollTo(0,0);
  podpiecia();
}
function podpiecia(){
  document.querySelectorAll('form.szuk').forEach(podpowiedzi);
  var s=$('[data-sort]');if(s)s.onchange=function(){var p=parsuj().p;p.sort=s.value;delete p.str;location.hash=link(p)};
  var l=$('[data-lata]');if(l)l.onsubmit=function(e){e.preventDefault();var p=parsuj().p;p.od=l.od.value.trim();p.do=l.do.value.trim();delete p.rok;delete p.str;location.hash=link(p)};
  var o=$('.otw-f'),f=$('#filtry');if(o&&f){o.onclick=function(){f.classList.add('otw');document.body.classList.add('blok')};$('.zamk-f').onclick=function(){f.classList.remove('otw');document.body.classList.remove('blok')}}
  document.querySelectorAll('[data-reset]').forEach(function(rs){rs.onclick=function(e){e.preventDefault();K=BAZA;TRYB_TEST=false;indeksuj();if(location.hash=='#/')render();else location.hash='#/'}});
}
function podpowiedzi(form){
  var inp=form.q,box=form.querySelector('.podp'),wyb=-1;
  form.onsubmit=function(e){e.preventDefault();var a=box.querySelector('.on');if(a){location.hash=a.getAttribute('href');return}location.hash=link({q:inp.value.trim()})};
  inp.oninput=function(){
    var q=norm(inp.value.trim());wyb=-1;if(q.length<2){box.hidden=true;return}
    var au=Object.keys(AUT).filter(function(k){return norm(AUT[k].n).indexOf(q)>=0}).slice(0,4).map(function(k){return '<a href="#/autor/'+k+'"><b>'+esc(AUT[k].n)+'</b><span>autor</span></a>'});
    var cy=Array.from(new Set(K.filter(function(b){return b.c&&norm(b.c).indexOf(q)>=0}).map(function(b){return b.c}))).slice(0,3).map(function(c){return '<a href="'+link({cykl:c})+'"><b>'+esc(c)+'</b><span>cykl</span></a>'});
    var se=Array.from(new Set(K.filter(function(b){return b.s&&norm(b.s).indexOf(q)>=0}).map(function(b){return b.s}))).slice(0,2).map(function(c){return '<a href="'+link({seria:c})+'"><b>'+esc(c)+'</b><span>seria</span></a>'});
    var ty=K.filter(function(b){return norm(b.t).indexOf(q)>=0}).slice(0,5).map(function(b){return '<a href="#/ksiazka/'+b.id+'"><b>'+esc(b.t)+'</b><span>'+esc(b._an)+', '+b.r+'</span></a>'});
    var w=au.concat(cy,se,ty);
    box.innerHTML=w.length?w.join('')+'<a class="wsz" href="'+link({q:inp.value.trim()})+'">Pokaż wszystkie wyniki</a>':'<p>Brak podpowiedzi - naciśnij Szukaj.</p>';box.hidden=false;
  };
  inp.onkeydown=function(e){var a=box.querySelectorAll('a');if(box.hidden||!a.length)return;if(e.key=='ArrowDown'||e.key=='ArrowUp'){e.preventDefault();wyb=(wyb+(e.key=='ArrowDown'?1:-1)+a.length)%a.length;a.forEach(function(x,i){x.classList.toggle('on',i==wyb)})}if(e.key=='Escape')box.hidden=true};
  inp.onblur=function(){setTimeout(function(){box.hidden=true},180)};
}
var m=$('#burger'),nav=$('.nav');if(m)m.onclick=function(){var o=nav.classList.toggle('otw');m.setAttribute('aria-expanded',o)};
nav.addEventListener('click',function(e){if(e.target.tagName=='A'){nav.classList.remove('otw')}});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.filtry a');if(a){var f=$('#filtry');if(f){f.classList.remove('otw');document.body.classList.remove('blok')}}});
addEventListener('hashchange',render);render();
})();
