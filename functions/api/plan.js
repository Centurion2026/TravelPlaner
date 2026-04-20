const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const OPEN_METEO_GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const OSRM_ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving'
const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1'
const AMADEUS_TEST_URL = 'https://test.api.amadeus.com'
const SHERPA_BASE_URL = 'https://apply.joinsherpa.com/visa'
const BOSNIA_PASSPORT_SLUG = 'bosnianherzegovinian-citizens'

// --- STATIC DATABASES --------------------------------------------------------

// Transit prices per city: single / daily / weekly (EUR, odrasli)
const TRANSIT_PRICES_DB = {
  london:      { single_eur: 3.40,  daily_eur: 10.50, weekly_eur: 49.00, note: 'Oyster, zona 1-2',           tourist_pass: 'Travelcard',          website: 'https://tfl.gov.uk',                     tips: 'Contactless kartica - automatski se primjenjuje dnevni cap.' },
  paris:       { single_eur: 2.15,  daily_eur: 14.90, weekly_eur: 30.00, note: 'Paris Visite, zona 1-5',     tourist_pass: 'Paris Visite',        website: 'https://www.ratp.fr',                    tips: 'Navigo Dec. sedmicna karta (pon-ned) = EUR30 - isplativa od 7 dana.' },
  berlin:      { single_eur: 3.00,  daily_eur: 9.00,  weekly_eur: 38.00, note: 'BVG, zona A+B',              tourist_pass: 'Berlin WelcomeCard',  website: 'https://www.bvg.de',                     tips: 'WelcomeCard ukljucuje popuste na muzeje.' },
  munich:      { single_eur: 3.70,  daily_eur: 10.00, weekly_eur: 43.00, note: 'MVV, zona M (innenraum)',    tourist_pass: 'CityTourCard',        website: 'https://www.mvv-muenchen.de',            tips: 'Gruppen-Tageskarte za 5 osoba = EUR20 - super za porodice.' },
  hamburg:     { single_eur: 3.60,  daily_eur: 8.50,  weekly_eur: 37.00, note: 'HVV, zona A',               tourist_pass: 'Hamburg CARD',        website: 'https://www.hvv.de',                     tips: 'Hamburg Card = 1 dan EUR11.90, ukljucuje muzeje.' },
  frankfurt:   { single_eur: 3.25,  daily_eur: 7.50,  weekly_eur: 34.00, note: 'RMV, zona 50',              tourist_pass: null,                  website: 'https://www.rmv.de',                     tips: '24h-Ticket za grad = EUR7.50. Airport je u zoni 1.' },
  madrid:      { single_eur: 1.50,  daily_eur: 8.40,  weekly_eur: null,  note: 'Metro, zona A',              tourist_pass: 'Madrid Card',         website: 'https://www.metromadrid.es',             tips: 'T10 10-voznji = EUR12.20. Turisticka karta ukljucuje muzeje.' },
  barcelona:   { single_eur: 2.55,  daily_eur: 10.50, weekly_eur: null,  note: 'TMB, zona 1',               tourist_pass: 'Hola BCN! card',      website: 'https://www.tmb.cat',                    tips: 'T-Casual 10 voznji = EUR12.15 - jeftiniji od pojedinacnih.' },
  rome:        { single_eur: 1.50,  daily_eur: 7.00,  weekly_eur: 24.00, note: 'ATAC 90min/24h/CIS',        tourist_pass: '48h / 72h karta',     website: 'https://www.atac.roma.it',               tips: '48h = EUR7, 72h = EUR11. Valjana metro + bus + tramvaj.' },
  milan:       { single_eur: 2.20,  daily_eur: 7.60,  weekly_eur: 16.50, note: 'ATM, grad',                 tourist_pass: '24h / 48h / 72h',     website: 'https://www.atm.it',                     tips: '48h = EUR13.80 - isplativa od 3 voznje dnevno.' },
  venice:      { single_eur: 9.50,  daily_eur: 25.00, weekly_eur: null,  note: 'ACTV vaporetto',             tourist_pass: 'ACTV Tourist Pass',   website: 'https://www.actv.it',                    tips: '72h = EUR45. Vaporetto je jedini javni prevoz na kanalima.' },
  florence:    { single_eur: 1.70,  daily_eur: 5.00,  weekly_eur: null,  note: 'ATAF autobus',               tourist_pass: null,                  website: 'https://www.at-bus.it',                  tips: 'Historijski centar je kompaktan - vecina atrakcija pjesice.' },
  amsterdam:   { single_eur: 3.40,  daily_eur: 9.00,  weekly_eur: null,  note: 'GVB 24h karta',             tourist_pass: 'Amsterdam Travel Ticket', website: 'https://www.gvb.nl',                  tips: '24h=EUR9, 48h=EUR15, 72h=EUR21. OV-chipkaart za duzi boravak.' },
  brussels:    { single_eur: 2.10,  daily_eur: 7.50,  weekly_eur: null,  note: 'STIB/MIVB 24h',             tourist_pass: 'Brussels Card',       website: 'https://www.stib-mivb.be',               tips: 'Brussels Card (24h=EUR29) ukljucuje javni prevoz + muzeje.' },
  vienna:      { single_eur: 2.40,  daily_eur: 8.00,  weekly_eur: 17.10, note: 'Wiener Linien',             tourist_pass: 'Vienna City Card',    website: 'https://www.wienerlinien.at',            tips: 'Vienna City Card 24h=EUR17 - ukljucuje popuste na muzeje.' },
  zurich:      { single_eur: 4.40,  daily_eur: 13.00, weekly_eur: null,  note: 'ZVV, zona 110',             tourist_pass: 'Zurich Card',         website: 'https://www.zvv.ch',                     tips: 'Zurich Card 24h=CHF 27 - ukljucuje muzeje i airport vlak.' },
  geneva:      { single_eur: 3.50,  daily_eur: 9.00,  weekly_eur: null,  note: 'TPG, grad',                 tourist_pass: 'Geneva Transport Card', website: 'https://www.tpg.ch',                   tips: 'Hotelski gosti dobijaju besplatnu Geneva Transport Card.' },
  prague:      { single_eur: 1.30,  daily_eur: 3.60,  weekly_eur: 13.30, note: 'PID, sve zone',             tourist_pass: '24h / 72h tourist',   website: 'https://www.dpp.cz',                     tips: '24h = CZK 120 (~EUR5). Jedna od najjeftinijih mreza u EU.' },
  warsaw:      { single_eur: 1.70,  daily_eur: 4.60,  weekly_eur: 17.30, note: 'ZTM 90min karta',           tourist_pass: null,                  website: 'https://www.ztm.waw.pl',                 tips: 'Jednosmjerna = PLN 3.40 (~EUR0.80). Dnevna karta = PLN 15.' },
  krakow:      { single_eur: 1.20,  daily_eur: 3.40,  weekly_eur: null,  note: 'MPK Krakow 90min',          tourist_pass: null,                  website: 'https://www.mpk.krakow.pl',              tips: 'Stari grad je pjesacka zona - malo potrebe za javnim prevozom.' },
  budapest:    { single_eur: 1.10,  daily_eur: 7.00,  weekly_eur: 17.50, note: 'BKK, 24h/72h/7-dana',      tourist_pass: 'Budapest Card',       website: 'https://www.bkk.hu',                     tips: 'Budapest Card 48h = HUF 8.890 - ukljucuje muzeje.' },
  athens:      { single_eur: 1.40,  daily_eur: 4.10,  weekly_eur: null,  note: 'OASA 90min karta',          tourist_pass: '5-dnevna turisticka', website: 'https://www.oasa.gr',                    tips: '3-dnevna karta = EUR5.50 - ukljucuje metro i tramvaj.' },
  istanbul:    { single_eur: 0.90,  daily_eur: 2.80,  weekly_eur: null,  note: 'Istanbulkart po voznji',    tourist_pass: '2/3/5-dnevna',        website: 'https://www.iett.istanbul',              tips: '2-dnevna karta = ~EUR11. Istanbulkart ostaje kao suvenir.' },
  lisbon:      { single_eur: 1.80,  daily_eur: 6.80,  weekly_eur: null,  note: 'Carris/Metro 24h',          tourist_pass: 'Lisboa Card',         website: 'https://www.carris.pt',                  tips: 'Lisboa Card 24h=EUR21 - ukljucuje muzeje i aerodromski metro.' },
  porto:       { single_eur: 1.85,  daily_eur: 8.00,  weekly_eur: null,  note: 'Andante, zona 2',           tourist_pass: 'Andante Tour 1/3 dana', website: 'https://www.stcp.pt',                  tips: 'Andante Tour 3 dana = EUR15. Ukljucuje metro, autobus, tramvaj.' },
  copenhagen:  { single_eur: 4.50,  daily_eur: 14.00, weekly_eur: null,  note: 'DOT 2 zone 24h',           tourist_pass: 'Copenhagen Card',     website: 'https://www.dinoffentligetransport.dk',  tips: 'Copenhagen Card 24h=DKK 399 - ukljucuje muzeje i transport.' },
  stockholm:   { single_eur: 4.00,  daily_eur: 12.00, weekly_eur: 44.00, note: 'SL 24h / sedmicna',        tourist_pass: 'SL Access card',      website: 'https://sl.se',                          tips: '72h = SEK 330 (~EUR28). Bezgotovinsko placanje svuda prihvaceno.' },
  oslo:        { single_eur: 4.40,  daily_eur: 12.80, weekly_eur: null,  note: 'Ruter 24h karta',           tourist_pass: 'Oslo City Card',      website: 'https://ruter.no',                       tips: 'Oslo Pass 24h=NOK 595 - ukljucuje muzeje i transport.' },
  helsinki:    { single_eur: 3.10,  daily_eur: 9.00,  weekly_eur: null,  note: 'HSL 24h, zona A+B',         tourist_pass: 'Helsinki Card',       website: 'https://www.hsl.fi',                     tips: '72h = EUR22. Helsinki Card ukljucuje muzeje i brodske ture.' },
  zagreb:      { single_eur: 1.40,  daily_eur: 4.00,  weekly_eur: 13.30, note: 'ZET dnevna karta',         tourist_pass: null,                  website: 'https://www.zet.hr',                     tips: 'Tramvaj je glavni prevoz u centru - cest raspored voznji.' },
  belgrade:    { single_eur: 0.90,  daily_eur: 2.20,  weekly_eur: null,  note: 'GSP BeoCard po voznji',     tourist_pass: null,                  website: 'https://www.gsp.rs',                     tips: 'BeoCard kartica = jeftinija od papirnih. Kupiti na kioscima.' },
  bratislava:  { single_eur: 1.00,  daily_eur: 3.50,  weekly_eur: 13.50, note: 'DPB 24h karta',            tourist_pass: null,                  website: 'https://imhd.sk',                        tips: 'Kompaktan grad - centar je uglavnom pjesacka zona.' },
  dubai:       { single_eur: 1.90,  daily_eur: 7.70,  weekly_eur: null,  note: 'NOL Red Card, zona 1',      tourist_pass: 'Dubai Pass',          website: 'https://www.rta.ae',                     tips: 'NOL kartica deposit = AED 25. Metro do 00:00 (pet. do 01:00).' },
  singapore:   { single_eur: 1.80,  daily_eur: 5.80,  weekly_eur: null,  note: 'EZ-Link Card po voznji',    tourist_pass: 'Singapore Tourist Pass', website: 'https://www.transitlink.com.sg',       tips: 'Tourist Pass 3 dana = SGD 30 - neogranicene MRT + bus voznje.' },
  tokyo:       { single_eur: 2.00,  daily_eur: 8.00,  weekly_eur: null,  note: 'Suica/Pasmo po voznji',     tourist_pass: 'Tokyo Subway Ticket', website: 'https://www.tokyometro.jp',              tips: '48h Subway Ticket = JPY 800 (~EUR5). Suica radi na svim linijama.' },
  seoul:       { single_eur: 1.40,  daily_eur: 4.60,  weekly_eur: null,  note: 'T-Money po voznji',         tourist_pass: 'Discover Seoul Pass', website: 'https://www.seoulmetro.co.kr',           tips: 'T-Money za sve autobuse i metro - popust pri prelasku.' },
  'new york':  { single_eur: 2.90,  daily_eur: 8.50,  weekly_eur: 32.00, note: 'OMNY / MetroCard',         tourist_pass: 'NYC Explorer Pass',   website: 'https://new.mta.info',                   tips: 'Contactless kartica direktno radi na torniquetima - nema naplate.' },
  'new york city': { single_eur: 2.90, daily_eur: 8.50, weekly_eur: 32.00, note: 'OMNY / MetroCard', tourist_pass: 'NYC Explorer Pass', website: 'https://new.mta.info', tips: 'Contactless kartica direktno radi. 7-dana MetroCard = USD 34.' },
  toronto:     { single_eur: 3.40,  daily_eur: null,  weekly_eur: null,  note: 'TTC PRESTO kartica',         tourist_pass: null,                  website: 'https://www.ttc.ca',                     tips: 'Day pass = CAD 13.50 (~EUR9). PRESTO kartica za ustede.' },
}

// Famous attractions price database (EUR, odrasli)
const ATTRACTION_PRICES_DB = {
  // London
  'london eye':              { price_eur: 32,   note: 'Standard, odrasli' },
  'tower of london':         { price_eur: 34,   note: 'Odrasli' },
  'buckingham palace':       { price_eur: 32,   note: 'Drzavne sobe, samo ljeti' },
  'british museum':          { price_eur: 0,    note: 'Besplatno' },
  'natural history museum':  { price_eur: 0,    note: 'Besplatno' },
  'national gallery':        { price_eur: 0,    note: 'Besplatno' },
  'tate modern':             { price_eur: 0,    note: 'Besplatno' },
  "st paul's cathedral":     { price_eur: 23,   note: 'Odrasli' },
  'westminster abbey':       { price_eur: 29,   note: 'Odrasli' },
  'the shard':               { price_eur: 35,   note: 'Standard, odrasli' },
  'tower bridge':            { price_eur: 12,   note: 'Odrasli' },
  'kew gardens':             { price_eur: 22,   note: 'Odrasli' },
  'hampton court palace':    { price_eur: 29,   note: 'Odrasli' },
  'windsor castle':          { price_eur: 28,   note: 'Odrasli' },
  'victoria and albert museum': { price_eur: 0, note: 'Besplatno' },
  'science museum':          { price_eur: 0,    note: 'Besplatno' },
  // Paris
  'eiffel tower':            { price_eur: 29,   note: 'Vrh, odrasli' },
  'tour eiffel':             { price_eur: 29,   note: 'Vrh, odrasli' },
  'louvre':                  { price_eur: 22,   note: 'Odrasli' },
  'musee du louvre':         { price_eur: 22,   note: 'Odrasli' },
  'versailles':              { price_eur: 20,   note: 'Dvorac, odrasli' },
  "chateau de versailles":   { price_eur: 20,   note: 'Dvorac, odrasli' },
  "musee d'orsay":           { price_eur: 16,   note: 'Odrasli' },
  'centre pompidou':         { price_eur: 15,   note: 'Galerija, odrasli' },
  "sacre-coeur":              { price_eur: 0,    note: 'Crkva besplatna, kupola EUR8' },
  "notre-dame":              { price_eur: 0,    note: 'Katedrala besplatna' },
  'arc de triomphe':         { price_eur: 13,   note: 'Vrh, odrasli' },
  'catacombes de paris':     { price_eur: 15,   note: 'Odrasli' },
  'disneyland paris':        { price_eur: 68,   note: 'Jedan park, 1 dan' },
  'palais royal':            { price_eur: 0,    note: 'Besplatno' },
  // Rome
  'colosseum':               { price_eur: 18,   note: 'Ukljucuje Forum i Palatino' },
  'colosseo':                { price_eur: 18,   note: 'Ukljucuje Forum i Palatino' },
  'vatican museums':         { price_eur: 20,   note: 'Vatikanski muzeji' },
  'musei vaticani':          { price_eur: 20,   note: 'Odrasli' },
  'sistine chapel':          { price_eur: 20,   note: 'U sklopu Vatican Museums' },
  'borghese gallery':        { price_eur: 15,   note: 'Obavezna rezervacija' },
  'galleria borghese':       { price_eur: 15,   note: 'Obavezna rezervacija' },
  'pantheon':                { price_eur: 5,    note: 'Odrasli (od 2023)' },
  'trevi fountain':          { price_eur: 0,    note: 'Besplatno' },
  'fontana di trevi':        { price_eur: 0,    note: 'Besplatno' },
  'roman forum':             { price_eur: 18,   note: 'U sklopu Colosseum ulaznice' },
  'spanish steps':           { price_eur: 0,    note: 'Besplatno' },
  // Barcelona
  'sagrada familia':         { price_eur: 26,   note: 'Bazilika, odrasli' },
  'sagrada familia':         { price_eur: 26,   note: 'Bazilika, odrasli' },
  'park guell':              { price_eur: 10,   note: 'Monumentalna zona, online' },
  'park guell':              { price_eur: 10,   note: 'Monumentalna zona' },
  'casa batllo':             { price_eur: 39,   note: 'Standard, online' },
  'casa batllo':             { price_eur: 39,   note: 'Standard' },
  'camp nou':                { price_eur: 30,   note: 'Obilazak stadiona' },
  'picasso museum':          { price_eur: 14,   note: 'Ponedeljak besplatno' },
  'barcelona aquarium':      { price_eur: 23,   note: 'Odrasli' },
  // Amsterdam
  'rijksmuseum':             { price_eur: 22,   note: 'Odrasli' },
  'van gogh museum':         { price_eur: 22,   note: 'Odrasli' },
  'anne frank house':        { price_eur: 16,   note: 'Online obavezno' },
  'anne frank huis':         { price_eur: 16,   note: 'Online obavezno' },
  'keukenhof':               { price_eur: 22,   note: 'Samo proljece (mart-maj)' },
  // Berlin
  'berliner dom':            { price_eur: 9,    note: 'Odrasli' },
  'pergamon museum':         { price_eur: 12,   note: 'Odrasli' },
  'pergamonmuseum':          { price_eur: 12,   note: 'Odrasli' },
  'berlin zoo':              { price_eur: 21,   note: 'Odrasli' },
  'neues museum':            { price_eur: 12,   note: 'Odrasli' },
  'brandenburger tor':       { price_eur: 0,    note: 'Besplatno' },
  'reichstag':               { price_eur: 0,    note: 'Besplatno, rezervacija obavezna' },
  // Vienna
  'schonbrunn palace':       { price_eur: 26,   note: 'Grand Tour, odrasli' },
  'kunsthistorisches museum':{ price_eur: 21,   note: 'Odrasli' },
  'belvedere':               { price_eur: 16,   note: 'Upper Belvedere, odrasli' },
  'hofburg':                 { price_eur: 18,   note: 'Imperial Apartments' },
  'prater':                  { price_eur: 12,   note: 'Riesenrad (Veliki tocak)' },
  'albertina':               { price_eur: 19,   note: 'Odrasli' },
  // Prague
  'prague castle':           { price_eur: 18,   note: 'Krug A, odrasli' },
  'prazsk? hrad':            { price_eur: 18,   note: 'Krug A' },
  'charles bridge':          { price_eur: 0,    note: 'Besplatno' },
  'karlov most':             { price_eur: 0,    note: 'Besplatno' },
  'astronomical clock':      { price_eur: 0,    note: 'Toranj EUR11' },
  'vrtba garden':            { price_eur: 5,    note: 'Odrasli' },
  // Budapest
  'hungarian parliament':    { price_eur: 12,   note: 'Sa vodicom, odrasli' },
  'parliament':              { price_eur: 12,   note: 'Odrasli' },
  "fisherman's bastion":     { price_eur: 0,    note: 'Terasa uglavnom besplatna' },
  'szechenyi thermal bath':  { price_eur: 22,   note: 'Ulaz + kabina, odrasli' },
  'buda castle':             { price_eur: 0,    note: 'Zamak besplatan, muzeji placaju se' },
  'great synagogue':         { price_eur: 9,    note: 'Odrasli' },
  // Athens
  'acropolis':               { price_eur: 20,   note: 'Odrasli (kombinovana EUR30)' },
  'acropolis museum':        { price_eur: 10,   note: 'Odrasli' },
  'ancient agora':           { price_eur: 10,   note: 'Ukljuceno u kombo' },
  // Istanbul
  'hagia sophia':            { price_eur: 0,    note: 'Dzamija, besplatno' },
  'ayasofya':                { price_eur: 0,    note: 'Besplatno' },
  'topkapi palace':          { price_eur: 18,   note: 'Unutarnji dvor + harem' },
  'grand bazaar':            { price_eur: 0,    note: 'Besplatno' },
  'blue mosque':             { price_eur: 0,    note: 'Sultanahmet, besplatno' },
  'basilica cistern':        { price_eur: 7,    note: 'Odrasli' },
  // Dubai
  'burj khalifa':            { price_eur: 37,   note: '124-125 kat, standard' },
  'dubai aquarium':          { price_eur: 23,   note: 'Tunnel + akvarij, odrasli' },
  'dubai frame':             { price_eur: 13,   note: 'Odrasli' },
  'dubai museum':            { price_eur: 1,    note: 'Al Fahidi' },
  // New York
  'statue of liberty':       { price_eur: 24,   note: 'Feri + otok, odrasli' },
  'empire state building':   { price_eur: 42,   note: '86. kat, odrasli' },
  'top of the rock':         { price_eur: 38,   note: 'Dnevni posjet, odrasli' },
  'metropolitan museum':     { price_eur: 30,   note: 'Odrasli' },
  'museum of modern art':    { price_eur: 25,   note: 'MoMA, odrasli' },
  'central park':            { price_eur: 0,    note: 'Besplatno' },
  'brooklyn bridge':         { price_eur: 0,    note: 'Besplatno' },
  'one world observatory':   { price_eur: 38,   note: 'Odrasli' },
  // Tokyo
  'tokyo skytree':           { price_eur: 18,   note: 'Tembo Deck 350m, odrasli' },
  'tokyo tower':             { price_eur: 12,   note: 'Main Deck 150m, odrasli' },
  'senso-ji':                { price_eur: 0,    note: 'Hram besplatan' },
  'teamlab planets':         { price_eur: 30,   note: 'Odrasli' },
  // Singapore
  'marina bay sands':        { price_eur: 23,   note: 'SkyPark, odrasli' },
  'gardens by the bay':      { price_eur: 22,   note: 'Flower Dome + Cloud Forest' },
  'universal studios singapore': { price_eur: 72, note: 'Odrasli, 1 dan' },
  'singapore zoo':           { price_eur: 30,   note: 'Odrasli' },
}

// Typical hotel prices per city per night per room (EUR)
const HOTEL_PRICE_RANGES_DB = {
  london:      { budget: 80,  mid: 175, luxury: 420 },
  paris:       { budget: 75,  mid: 160, luxury: 380 },
  berlin:      { budget: 55,  mid: 120, luxury: 300 },
  munich:      { budget: 70,  mid: 140, luxury: 350 },
  madrid:      { budget: 60,  mid: 130, luxury: 320 },
  barcelona:   { budget: 65,  mid: 145, luxury: 350 },
  rome:        { budget: 65,  mid: 140, luxury: 360 },
  milan:       { budget: 70,  mid: 150, luxury: 380 },
  venice:      { budget: 90,  mid: 200, luxury: 500 },
  amsterdam:   { budget: 80,  mid: 165, luxury: 400 },
  vienna:      { budget: 60,  mid: 130, luxury: 320 },
  prague:      { budget: 40,  mid: 85,  luxury: 220 },
  budapest:    { budget: 35,  mid: 75,  luxury: 200 },
  warsaw:      { budget: 35,  mid: 70,  luxury: 180 },
  krakow:      { budget: 30,  mid: 65,  luxury: 160 },
  athens:      { budget: 50,  mid: 110, luxury: 280 },
  istanbul:    { budget: 40,  mid: 90,  luxury: 250 },
  dubai:       { budget: 70,  mid: 155, luxury: 420 },
  'new york':  { budget: 130, mid: 280, luxury: 700 },
  tokyo:       { budget: 55,  mid: 125, luxury: 350 },
  singapore:   { budget: 80,  mid: 170, luxury: 450 },
  zagreb:      { budget: 55,  mid: 110, luxury: 260 },
  belgrade:    { budget: 30,  mid: 65,  luxury: 160 },
  bratislava:  { budget: 40,  mid: 80,  luxury: 200 },
  lisbon:      { budget: 60,  mid: 130, luxury: 320 },
  porto:       { budget: 50,  mid: 110, luxury: 280 },
  stockholm:   { budget: 90,  mid: 170, luxury: 400 },
  copenhagen:  { budget: 95,  mid: 180, luxury: 420 },
  oslo:        { budget: 100, mid: 200, luxury: 480 },
  helsinki:    { budget: 80,  mid: 155, luxury: 370 },
  brussels:    { budget: 65,  mid: 135, luxury: 320 },
  zurich:      { budget: 120, mid: 220, luxury: 550 },
  florence:    { budget: 70,  mid: 145, luxury: 360 },
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

// --- Helper: normalize city key ----------------------------------------------
function normalizeCityKey(text) {
  return String(text || '').toLowerCase().trim().split(',')[0].trim()
}

function lookupTransitPrices(cityKey) {
  if (!cityKey) return null
  if (TRANSIT_PRICES_DB[cityKey]) return TRANSIT_PRICES_DB[cityKey]
  // Partial match
  for (const key of Object.keys(TRANSIT_PRICES_DB)) {
    if (cityKey.includes(key) || key.includes(cityKey)) return TRANSIT_PRICES_DB[key]
  }
  return null
}

function lookupAttractionPrice(name) {
  if (!name) return null
  const key = name.toLowerCase().trim()
  if (ATTRACTION_PRICES_DB[key]) return ATTRACTION_PRICES_DB[key]
  for (const dbKey of Object.keys(ATTRACTION_PRICES_DB)) {
    if (key.includes(dbKey) || dbKey.includes(key.substring(0, Math.min(key.length, 20)))) {
      return ATTRACTION_PRICES_DB[dbKey]
    }
  }
  return null
}

function lookupHotelPriceRange(destinationGeo) {
  const key = normalizeCityKey(destinationGeo.name || destinationGeo.displayName || '')
  if (HOTEL_PRICE_RANGES_DB[key]) return HOTEL_PRICE_RANGES_DB[key]
  for (const k of Object.keys(HOTEL_PRICE_RANGES_DB)) {
    if (key.includes(k) || k.includes(key)) return HOTEL_PRICE_RANGES_DB[k]
  }
  return null
}

// --- Claude API: fetch city knowledge for ANY destination --------------------

async function fetchCityKnowledge(destinationGeo, env) {
  const cityKey = normalizeCityKey(destinationGeo.name || destinationGeo.displayName || '')
  const staticTransit = lookupTransitPrices(cityKey)
  const staticHotel = lookupHotelPriceRange(destinationGeo)
  const empty = { transit: staticTransit, hotel_range: staticHotel, attractions: [], city_info: null, tourist_traps: [], currency: null, source: 'static' }

  const apiKey = env && env.GROQ_API_KEY
  if (!apiKey) return empty

  const cityName = destinationGeo.displayName || destinationGeo.name || 'Unknown'

  // Helper: single Groq call
  const groqCall = async (prompt, maxTokens) => {
    try {
      const resp = await fetchWithTimeout(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'Travel data API. Respond with valid JSON only. No markdown.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          max_tokens: maxTokens,
        }),
      }, 17000)
      if (!resp.ok) { console.error('Groq error:', resp.status); return null }
      const groqLimits = {
        remainingRequests: resp.headers.get('x-ratelimit-remaining-requests'),
        remainingTokens: resp.headers.get('x-ratelimit-remaining-tokens'),
        limitTokens: resp.headers.get('x-ratelimit-limit-tokens'),
        resetTokens: resp.headers.get('x-ratelimit-reset-tokens'),
      }
      const data = await resp.json()
      const text = (data.choices?.[0]?.message?.content || '').replace(/```json\n?|\n?```/g, '').trim()
      try { return { parsed: JSON.parse(text), groqLimits } } catch { return null }
    } catch (e) { console.error('groqCall error:', e?.message); return null }
  }

  // CALL 1 (core): city_info + transit + hotel + attractions
  const corePrompt = `Travel data API. Return ONLY valid JSON for "${cityName}". No markdown.
{
  "city_info": {"summary":"3 factual sentences","population":500000,"population_year":2023,"area_km2":1285,"founded_year":753,"language":"Italian","timezone":"CET (UTC+1)","religion_pct":{"Christian":80,"Muslim":5,"Atheist":12,"Other":3},"crime_index":45,"crime_level":"Moderate","crime_note":"short note","safety_tips":["tip1","tip2"],"youtube_city_tour":"https://www.youtube.com/results?search_query=cityname+city+guide","wikipedia_url":"https://en.wikipedia.org/wiki/City","history_url":"https://en.wikipedia.org/wiki/History_of_City","numbeo_url":"https://www.numbeo.com/crime/in/City","worldometers_url":"https://www.worldometers.info/world-population/country-population/"},
  "transit": {"single_eur":2.5,"daily_eur":8,"weekly_eur":25,"note":"card info","tourist_pass":"pass name or null","website":"https://transit.example.com","tips":"practical tip"},
  "hotel_range": {"budget":65,"mid":140,"luxury":360},
  "attractions": [{"name":"Name","description":"2 sentences.","why_visit":"reason.","price_eur":15,"price_note":"adults","duration_hours":2,"category":"museum","highlight":true}]
}
Rules for ${cityName}:
- city_info: real facts. crime_level: Very Low|Low|Moderate|High|Very High
- transit: real EUR prices or null
- hotel_range: budget hostel/3-star/5-star per night
- attractions: exactly 12 most important museums and landmarks. highlight=true for top 5. AVOID generic memorials/plaques.`

  // CALL 2 (enrich): tourist_traps + currency
  const enrichPrompt = `Travel data API. Return ONLY valid JSON for "${cityName}". No markdown.
{
  "tourist_traps": [{"title":"Trap name","description":"What happens.","avoid":"How to avoid.","severity":"Medium","category":"scam"}],
  "currency": {"name":"Euro","code":"EUR","symbol":"EUR","is_eur":true,"approx_rate":1,"rate_note":"Uses EUR","exchange_tips":["tip"],"typical_costs":{"coffee":"3-5 EUR","budget_meal":"12-18 EUR","taxi_5km":"10-15 EUR"}}
}
Rules for ${cityName}:
- tourist_traps: exactly 5 real specific scams for this city. severity: Low|Medium|High. category: scam|overpriced|crowded|unsafe|misleading
- currency: local currency. is_eur=true if city uses EUR. typical_costs in local currency with symbol.`

  // Run both in parallel
  const [coreResult, enrichResult] = await Promise.all([
    groqCall(corePrompt, 2200),
    groqCall(enrichPrompt, 800),
  ])

  const core = coreResult?.parsed || {}
  const enrich = enrichResult?.parsed || {}

  return {
    transit: core.transit ? { ...core.transit, modes: staticTransit?.modes } : staticTransit,
    hotel_range: core.hotel_range || staticHotel,
    attractions: Array.isArray(core.attractions) ? core.attractions : [],
    city_info: core.city_info || null,
    tourist_traps: Array.isArray(enrich.tourist_traps) ? enrich.tourist_traps : [],
    currency: enrich.currency || null,
    groq_limits: coreResult?.groqLimits || null,
    source: 'groq',
  }
}


// Enrich OSM attractions with Claude's price knowledge (fuzzy name match)
// When Groq returns curated attractions, use them as primary list
// and look up OSM coordinates by name matching
function buildAttractionsFromKnowledge(knowledgeAttractions, osmElements, destinationGeo) {
  if (!knowledgeAttractions?.length) return null

  return knowledgeAttractions.slice(0, 15).map((ka) => {
    // Try to find coordinates in OSM data by name matching
    const nameLower = (ka.name || '').toLowerCase()
    const osmMatch = osmElements.find((el) => {
      const elName = (el.tags?.name || '').toLowerCase()
      if (!elName) return false
      if (elName === nameLower) return true
      if (elName.includes(nameLower.substring(0, 12)) || nameLower.includes(elName.substring(0, 12))) return true
      // Word-level: any significant word matches
      return nameLower.split(' ').some((w) => w.length > 5 && elName.includes(w))
    })

    const point = osmMatch ? coordsOf(osmMatch) : { lat: 0, lng: 0 }
    const price = ka.price_eur

    return {
      name: ka.name || 'Atrakcija',
      description: ka.description || '',
      why_visit: ka.why_visit || '',
      price_eur: typeof price === 'number' ? price : null,
      free: price === 0,
      price_note: price === 0
        ? 'Besplatno.'
        : typeof price === 'number' && price > 0
          ? `~EUR${price} odrasli${ka.price_note ? ' - ' + ka.price_note : ''}.`
          : 'Cijena: provjeri online ili na ulazu.',
      lat: point.lat,
      lng: point.lng,
      duration_hours: ka.duration_hours || 1.5,
      area: destinationGeo.name || '',
      category: ka.category || 'attraction',
      highlight: ka.highlight === true,
      source: 'ai',
    }
  }).filter((a) => a.name)
}

// Fallback: enrich OSM attractions with Groq prices (old behaviour)
function enrichAttractionsWithPrices(attractions, knowledgeAttractions) {
  if (!knowledgeAttractions?.length) return attractions
  return attractions.map((attraction) => {
    if (attraction.price_eur !== null && attraction.price_eur !== undefined) return attraction
    if (attraction.free) return attraction

    const nameLower = (attraction.name || '').toLowerCase()
    const match = knowledgeAttractions.find((ka) => {
      const kaLower = (ka.name || '').toLowerCase()
      if (nameLower === kaLower) return true
      if (nameLower.includes(kaLower) || kaLower.includes(nameLower)) return true
      return nameLower.split(' ').some((w) => w.length > 4 && kaLower.includes(w))
    })

    if (!match || match.price_eur === null || match.price_eur === undefined) return attraction

    return {
      ...attraction,
      price_eur: match.price_eur,
      free: match.price_eur === 0,
      price_note: match.price_eur === 0
        ? 'Besplatno.'
        : `~EUR${match.price_eur} odrasli -- ${match.price_note || match.note || 'provjeri trenutnu cijenu na ulazu'}.`,
    }
  })
}

// -----------------------------------------------------------------------------

const EMERGENCY_BY_COUNTRY = {
  IT: { general_emergency: '112', police: '112', ambulance: '118', fire: '115' },
  HR: { general_emergency: '112', police: '192', ambulance: '194', fire: '193' },
  RS: { general_emergency: '112', police: '192', ambulance: '194', fire: '193' },
  SI: { general_emergency: '112', police: '113', ambulance: '112', fire: '112' },
  AT: { general_emergency: '112', police: '133', ambulance: '144', fire: '122' },
  DE: { general_emergency: '112', police: '110', ambulance: '112', fire: '112' },
  FR: { general_emergency: '112', police: '17', ambulance: '15', fire: '18' },
  ES: { general_emergency: '112', police: '091', ambulance: '112', fire: '080' },
  GB: { general_emergency: '999', police: '999', ambulance: '999', fire: '999' },
  TR: { general_emergency: '112', police: '112', ambulance: '112', fire: '112' },
  BA: { general_emergency: '112', police: '122', ambulance: '124', fire: '123' },
}

export async function onRequestGet(context) {
  const { env } = context

  return json({
    status: 'ok',
    message: 'Putni Planer backend je aktivan.',
    timestamp: new Date().toISOString(),
    providers: {
      amadeus: !!(env.AMADEUS_CLIENT_ID && env.AMADEUS_CLIENT_SECRET),
      anthropic: !!(env.ANTHROPIC_API_KEY),
      groq: !!(env.GROQ_API_KEY),
      sherpa: true,
      openWeather: !!(env.OPENWEATHER_API_KEY),
      openStreetMap: true,
      osrm: true,
    },
  })
}

export async function onRequestPost(context) {
  const DEADLINE_MS = 60000

  try {
    const result = await Promise.race([
      mainLogic(context),
      new Promise((resolve) => setTimeout(() => resolve({ __timeout: true }), DEADLINE_MS)),
    ])

    if (result?.__timeout) {
      return json({
        error: 'Vremenski limit je prekoracen (60s).',
        hint: 'Pokusaj ponovo - serveri su mozda bili zauzeti.',
      }, 504)
    }

    return result
  } catch (err) {
    console.error('FATAL:', err?.stack || err)
    return json({
      error: 'Neocekivana greska na serveru.',
      details: [err?.message || String(err)],
    }, 500)
  }
}

async function mainLogic(context) {
  const { request, env } = context

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Nevazeci JSON u zahtjevu.' }, 400)
  }

  const { origin, destination, departDate, returnDate, adults, children, transport } = body || {}
  if (!origin || !destination || !departDate || !returnDate) {
    return json({ error: 'Nedostaju polja: origin, destination, departDate, returnDate.' }, 400)
  }

  const adultsN = clampInt(adults, 2, 1)
  const childrenN = clampInt(children, 0, 0)
  const totalPeople = adultsN + childrenN
  const days = Math.max(1, Math.round((new Date(returnDate) - new Date(departDate)) / 86400000))
  const transportMode = ['plane', 'car', 'bus', 'train'].includes(transport) ? transport : 'plane'

  const [destinationGeo, originGeo] = await Promise.all([
    geocodePlace(destination),
    transportMode === 'plane' || transportMode === 'car' ? geocodePlace(origin) : Promise.resolve(null),
  ])
  if (!destinationGeo) {
    return json({ error: 'Destinacija nije pronadjena. Pokusaj unijeti grad i drzavu, npr. Rim, Italija.' }, 404)
  }

  const countryInfo = await fetchCountryInfo(destinationGeo.countryCode, destinationGeo.country)

  const [weather, transit, countryEmergency, cityKnowledge, osmElements] = await Promise.all([
    fetchWeather(destinationGeo, departDate, returnDate, env),
    fetchTransit(destinationGeo),
    buildEmergencyInfo(countryInfo),
    fetchCityKnowledge(destinationGeo, env),
    fetchAttractionElements(destinationGeo),
  ])

  // Build curated attraction list: Groq primary, OSM for coordinates/fallback
  const osmAttractions = buildOsmAttractions(osmElements, destinationGeo)
  const enrichedAttractions = cityKnowledge.attractions?.length
    ? (buildAttractionsFromKnowledge(cityKnowledge.attractions, osmElements, destinationGeo) || osmAttractions)
    : enrichAttractionsWithPrices(osmAttractions, [])

  const hotelDataPromise = fetchAccommodation({
    destinationGeo,
    attractions: enrichedAttractions,
    checkInDate: departDate,
    checkOutDate: returnDate,
    adults: adultsN,
    totalPeople,
    env,
  })

  const transportPromise = fetchTransport({
    mode: transportMode,
    origin,
    destination,
    originGeo,
    destinationGeo,
    departDate,
    returnDate,
    adults: adultsN,
    children: childrenN,
    env,
  })

  const [accommodationData, food, chainRestaurants, transportData, visa, embassy] = await Promise.all([
    hotelDataPromise,
    hotelDataPromise.then((hotelData) => fetchFood(hotelData?.primary || destinationGeo)),
    hotelDataPromise.then((hotelData) => fetchChainRestaurants(hotelData?.primary || destinationGeo)),
    transportPromise,
    fetchVisaInfo(countryInfo, env),
    fetchEmbassy(countryInfo),
  ])
  const accommodation = accommodationData?.primary || null
  const accommodationOptions = accommodationData?.options || (accommodation ? [accommodation] : [])

  const enrichedTransit = cityKnowledge.transit
    ? { ...transit, ...cityKnowledge.transit, modes: transit.modes?.length ? transit.modes : cityKnowledge.transit.modes }
    : transit
  const hotelPriceRange = cityKnowledge.hotel_range || null

  // Attach hotel price range to accommodation options (for frontend display)
  const accommodationWithRange = accommodationOptions.map((opt) => ({
    ...opt,
    price_range: opt.price_range || hotelPriceRange,
  }))
  const primaryAccommodation = accommodation
    ? { ...accommodation, price_range: accommodation.price_range || hotelPriceRange }
    : null

  const itinerary = buildItinerary(enrichedAttractions, departDate, days)
  const emergency = {
    ...countryEmergency,
    bih_embassy: embassy || { city: '', address: '', phone: '', email: '', notes: '' },
  }

  const plan = {
    summary: buildSummary({
      destination: destinationGeo.displayName,
      days,
      totalPeople,
      transportMode,
      hasFlights: Array.isArray(transportData.flights) && transportData.flights.length > 0,
      hasHotelPrice: accommodationWithRange.some((item) => typeof item?.total_price_eur === 'number' && item.total_price_eur > 0),
    }),
    city_info: cityKnowledge.city_info || null,
    tourist_traps: cityKnowledge.tourist_traps || [],
    currency: cityKnowledge.currency || null,
    groq_limits: cityKnowledge.groq_limits || null,
    destination_coords: { lat: destinationGeo.lat, lng: destinationGeo.lng },
    accommodation: primaryAccommodation,
    accommodation_options: accommodationWithRange,
    attractions: enrichedAttractions,
    itinerary,
    transit: enrichedTransit,
    weather,
    food,
    chain_restaurants: chainRestaurants,
    visa,
    emergency,
    tips: buildTips({ transportMode, weather, accommodation }),
    ...transportData,
  }

  const budget = computeBudget(plan, { totalPeople, adults: adultsN, days })
  plan.budget = budget.values
  plan.budget_notes = budget.notes

  const partialFailures = []
  if (!enrichedAttractions.length) partialFailures.push('atrakcije')
  if (!primaryAccommodation) partialFailures.push('smjestaj')
  if (!food.length) partialFailures.push('hrana')
  if (transportMode === 'plane' && !(plan.flights || []).length) partialFailures.push('letovi')
  if (transportMode === 'bus' && !(plan.bus_routes || []).length) partialFailures.push('autobus')
  if (transportMode === 'train' && !(plan.train_routes || []).length) partialFailures.push('voz')
  if (Object.keys(plan.budget).length <= 1) partialFailures.push('budzet')
  if (partialFailures.length) plan._partial_failures = partialFailures

  return json(plan)
}

async function fetchTransport({ mode, origin, destination, originGeo, destinationGeo, departDate, returnDate, adults, children, env }) {
  if (mode === 'car') {
    const route = originGeo ? await fetchCarRoute(originGeo, destinationGeo) : null
    return {
      car_route: route,
      transport_notice: route ? '' : 'Ruta nije pronadjena. Provjeri naziv polaska ili koristi direktno Google Maps.',
    }
  }

  if (mode === 'plane') {
    const flightsData = await fetchFlightsFromAmadeus({
      origin,
      destination,
      originGeo,
      destinationGeo,
      departDate,
      returnDate,
      adults,
      children,
      env,
    })
    return flightsData
  }

  if (mode === 'bus') {
    return {
      bus_routes: [],
      transport_notice: 'Bus provider API nije integrisan u ovoj verziji. Koristi FlixBus ili Omio za live polaske.',
    }
  }

  return {
    train_routes: [],
    transport_notice: 'Rail provider API nije integrisan u ovoj verziji. Koristi Omio ili zeljeznickog operatera za live polaske.',
  }
}

async function fetchFlightsFromAmadeus({ origin, destination, originGeo, destinationGeo, departDate, returnDate, adults, children, env }) {
  const token = await getAmadeusToken(env)
  if (!token) {
    return {
      flights: [],
      alternative_dates: [],
      flight_search_links: buildFlightSearchLinks({ origin, destination, departDate, returnDate, adults, children }),
      transport_notice: 'Amadeus API nije konfigurisan. Koristi linkove ispod za live pretragu letova.',
    }
  }

  const [originCode, destinationCode] = await Promise.all([
    resolveAmadeusLocationCode(token, origin, originGeo),
    resolveAmadeusLocationCode(token, destination, destinationGeo),
  ])

  if (!originCode || !destinationCode) {
    return {
      flights: [],
      alternative_dates: [],
      transport_notice: 'Nisam uspio mapirati polaziste ili destinaciju na Amadeus aerodromski/gradski kod.',
    }
  }

  const offers = await searchAmadeusFlightOffers(token, {
    originCode,
    destinationCode,
    departDate,
    returnDate,
    adults,
    children,
    max: 3,
  })

  const flights = offers.map((offer) => mapFlightOffer(offer))
  const alternative_dates = await fetchAlternativeFlightDates(token, {
    originCode,
    destinationCode,
    departDate,
    returnDate,
    adults,
    children,
  })

  return {
    flights,
    alternative_dates,
    transport_notice: flights.length ? '' : 'Amadeus nije vratio ponude za zadane datume i putnike.',
  }
}

async function fetchAlternativeFlightDates(token, params) {
  const duration = Math.max(1, Math.round((new Date(params.returnDate) - new Date(params.departDate)) / 86400000))
  const offsets = [-3, -2, -1, 0, 1, 2, 3]
  const today = new Date().toISOString().slice(0, 10)

  const results = await Promise.all(offsets.map(async (offset) => {
    const depart = addDays(params.departDate, offset)
    const ret = addDays(params.returnDate, offset)
    if (depart < today) return null
    const offers = await searchAmadeusFlightOffers(token, {
      ...params,
      departDate: depart,
      returnDate: addDays(depart, duration),
      max: 1,
    })
    const first = offers[0]
    if (!first) return null
    return {
      depart,
      return: addDays(depart, duration),
      price_total_eur: toNum(first.price?.grandTotal),
    }
  }))

  const valid = results.filter(Boolean).sort((a, b) => a.price_total_eur - b.price_total_eur)
  const current = valid.find((item) => item.depart === params.departDate && item.return === params.returnDate)
  const basePrice = current?.price_total_eur || valid[0]?.price_total_eur || 0

  return valid.slice(0, 7).map((item) => ({
    ...item,
    savings_eur: basePrice > 0 ? round(Math.max(0, basePrice - item.price_total_eur), 2) : 0,
    note: '',
  }))
}

async function fetchAccommodation({ destinationGeo, attractions, checkInDate, checkOutDate, adults, totalPeople, env }) {
  const token = await getAmadeusToken(env)
  if (token) {
    const amadeusHotels = await fetchAccommodationFromAmadeus({
      token,
      destinationGeo,
      attractions,
      checkInDate,
      checkOutDate,
      adults,
      totalPeople,
    })
    if (amadeusHotels.length) {
      return {
        primary: amadeusHotels[0],
        options: amadeusHotels,
      }
    }
  }

  const osmCandidates = await fetchAccommodationCandidates(destinationGeo)
  return chooseAccommodation(osmCandidates, attractions, destinationGeo)
}

async function fetchAccommodationFromAmadeus({ token, destinationGeo, attractions, checkInDate, checkOutDate, adults, totalPeople }) {
  const hotelList = await amadeusFetch(token, '/v1/reference-data/locations/hotels/by-geocode', {
    latitude: destinationGeo.lat,
    longitude: destinationGeo.lng,
    radius: 8,
    radiusUnit: 'KM',
    hotelSource: 'ALL',
  })

  const hotels = hotelList?.data || []
  if (!hotels.length) return []

  const hotelIds = hotels.slice(0, 20).map((hotel) => hotel.hotelId).filter(Boolean)
  if (!hotelIds.length) return []

  const offersResponse = await amadeusFetch(token, '/v3/shopping/hotel-offers', {
    hotelIds: hotelIds.join(','),
    adults,
    checkInDate,
    checkOutDate,
    roomQuantity: Math.max(1, Math.ceil((totalPeople || adults || 1) / 2)),
    bestRateOnly: true,
    currency: 'EUR',
  })

  const offers = offersResponse?.data || []
  if (!offers.length) return []

  const attractionCenter = attractions.length ? averageCoords(attractions) : destinationGeo
  const ranked = offers
    .map((item) => {
      const hotel = item.hotel || {}
      const offer = item.offers?.[0] || {}
      const total = toNum(offer.price?.total)
      const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000))
      return {
        name: hotel.name || '',
        area: hotel.address?.cityName || destinationGeo.name,
        address: [hotel.address?.lines?.[0], hotel.address?.cityName].filter(Boolean).join(', '),
        price_per_night_eur: total > 0 ? round(total / nights, 2) : null,
        total_price_eur: total > 0 ? total : null,
        rating: toNum(hotel.rating) || null,
        beds: null,
        distance_to_center_km: hotel.geoCode ? round(distanceKm({ lat: hotel.geoCode.latitude, lng: hotel.geoCode.longitude }, attractionCenter), 1) : null,
        lat: hotel.geoCode?.latitude || 0,
        lng: hotel.geoCode?.longitude || 0,
        why: 'Odabrano iz Amadeus live hotel ponuda po cijeni i blizini atrakcija.',
        booking_url: offer.self || '',
        score: total > 0 ? (100000 / total) - (hotel.geoCode ? distanceKm({ lat: hotel.geoCode.latitude, lng: hotel.geoCode.longitude }, attractionCenter) : 10) : -9999,
      }
    })
    .filter((item) => item.name)
    .sort((a, b) => b.score - a.score)

  return ranked.slice(0, 6)
}

async function fetchVisaInfo(countryInfo) {
  const destinationSlug = slugifyCountryName(countryInfo?.name?.common)
  if (!destinationSlug) {
    return buildFallbackVisa()
  }

  const url = `${SHERPA_BASE_URL}/${destinationSlug}/${BOSNIA_PASSPORT_SLUG}?language=en-US`
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'TravelPlaner/1.0' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    return parseSherpaVisa(html, url)
  } catch (err) {
    console.error('Sherpa error:', err?.message || err)
    return buildFallbackVisa(url)
  }
}

function parseSherpaVisa(html, url) {
  const text = cleanHtmlText(html)
  const lower = text.toLowerCase()

  const noVisa = /you don't need a visa/i.test(text)
  const needsVisa = /you need (an?|may need an?) .*visa|you need an? eta|you need travel authorization/i.test(text)
  const headline = firstMatch(text, /#?\s*(You [^\n]+passport)/i)
  const shortBlock = firstMatch(text, /## Visa options[\s\S]{0,1200}/i) || ''

  const optionTitles = Array.from(shortBlock.matchAll(/(?:Electronic visa|Electronic Travel Authorization \(eTA\)|Embassy visa|Visa on arrival|eVisa|eTA|Visitor visa|Digital Arrival Card|travel authorization)/gi))
    .map((match) => match[0])
    .filter(Boolean)
  const uniqueOptions = dedupeStrings(optionTitles).slice(0, 4)

  const stayMatch = text.match(/stay for\s+(\d+)\s+days/i)
  const notes = [headline, shorten(shortBlock, 420)].filter(Boolean).join(' ')

  return {
    visa_required: noVisa ? false : needsVisa ? true : null,
    visa_type: uniqueOptions.join(', '),
    max_stay_days: stayMatch ? Number(stayMatch[1]) : null,
    passport_validity_required_months: null,
    documents_needed: [],
    processing_time: '',
    notes: notes || 'Provjeri Sherpa provider stranicu za detalje.',
    official_url: url,
  }
}

function buildFallbackVisa(url = 'https://www.joinsherpa.com/products/travel-restrictions') {
  return {
    visa_required: null,
    visa_type: '',
    max_stay_days: null,
    passport_validity_required_months: null,
    documents_needed: [],
    processing_time: '',
    notes: 'Visa provider podaci trenutno nisu dostupni. Otvori provider link i potvrdi uslove za BiH pasos.',
    official_url: url,
  }
}

async function fetchEmbassy(countryInfo) {
  if (!countryInfo?.capital?.[0] || !countryInfo?.name?.common) return null

  const capitalGeo = await geocodePlace(`${countryInfo.capital[0]}, ${countryInfo.name.common}`)
  if (!capitalGeo) return null

  const query = `
[out:json][timeout:25];
(
  nwr(around:25000,${capitalGeo.lat},${capitalGeo.lng})["amenity"="embassy"]["name"~"Bosnia|Herzegovina|BiH",i];
  nwr(around:25000,${capitalGeo.lat},${capitalGeo.lng})["office"="diplomatic"]["name"~"Bosnia|Herzegovina|BiH",i];
);
out center tags 20;
`

  const elements = await fetchOverpass(query)
  const item = elements[0]
  if (!item) return null

  return {
    city: capitalGeo.name || countryInfo.capital[0],
    address: buildAddress(item.tags),
    phone: item.tags?.phone || item.tags?.contact_phone || '',
    email: item.tags?.email || item.tags?.contact_email || '',
    notes: item.tags?.name || '',
  }
}

async function fetchWeather(destinationGeo, departDate, returnDate, env) {
  const owKey = env?.OPENWEATHER_API_KEY

  if (owKey) {
    try {
      const result = await fetchWeatherOpenWeather(destinationGeo, departDate, returnDate, owKey)
      if (result) return result
    } catch (err) {
      console.error('OpenWeather error:', err?.message)
    }
  }

  // Fallback: Open-Meteo (besplatno, bez kljuca)
  return fetchWeatherOpenMeteo(destinationGeo, departDate, returnDate)
}

async function fetchWeatherOpenWeather(destinationGeo, departDate, returnDate, apiKey) {
  // One Call API 3.0 - daje daily forecast do 8 dana unaprijed
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${destinationGeo.lat}&lon=${destinationGeo.lng}&appid=${apiKey}&units=metric&exclude=minutely,current,alerts&lang=hr`
  const resp = await fetch(url)
  if (!resp.ok) {
    // Pokusaj stariji 2.5 endpoint
    return fetchWeatherOpenWeather25(destinationGeo, departDate, returnDate, apiKey)
  }
  const data = await resp.json()
  const daily = data?.daily
  if (!daily?.length) return null

  const start = new Date(departDate + 'T00:00:00Z')
  const end   = new Date(returnDate + 'T00:00:00Z')

  // Filtriraj samo dane koji su u periodu putovanja
  const tripDays = daily.filter(d => {
    const date = new Date(d.dt * 1000)
    return date >= start && date <= end
  })

  if (!tripDays.length) {
    // Ako nisu u rasponu, uzmi prvih 7 od forecast-a
    tripDays.push(...daily.slice(0, 7))
  }

  const mins = tripDays.map(d => d.temp.min)
  const maxs = tripDays.map(d => d.temp.max)
  const rains = tripDays.map(d => Math.round((d.pop || 0) * 100))
  const minTemp = Math.round(Math.min(...mins))
  const maxTemp = Math.round(Math.max(...maxs))
  const rainMax = Math.max(...rains)

  // Dnevni pregled
  const dayForecast = tripDays.slice(0, 10).map(d => {
    const date = new Date(d.dt * 1000)
    const dateStr = date.toISOString().slice(0, 10)
    return {
      date: dateStr,
      min_c: Math.round(d.temp.min),
      max_c: Math.round(d.temp.max),
      rain_pct: Math.round((d.pop || 0) * 100),
      description: d.weather?.[0]?.description || '',
      icon: d.weather?.[0]?.icon || '',
      humidity: d.humidity,
      wind_ms: Math.round(d.wind_speed || 0),
      uvi: Math.round(d.uvi || 0),
    }
  })

  return {
    forecast_summary: `OpenWeatherMap prognoza za ${tripDays.length} ${tripDays.length === 1 ? 'dan' : 'dana'} putovanja.`,
    min_temp_c: minTemp,
    max_temp_c: maxTemp,
    rain_probability: rainMax > 60 ? `Visoka (~${rainMax}%)` : rainMax > 25 ? `Umjerena (~${rainMax}%)` : `Niska (~${rainMax}%)`,
    clothing_recommendation: inferClothingRecommendation(minTemp, maxTemp, rainMax),
    daily_forecast: dayForecast,
    source: 'OpenWeatherMap',
  }
}

async function fetchWeatherOpenWeather25(destinationGeo, departDate, returnDate, apiKey) {
  // Free 2.5 endpoint - 5-day/3h forecast, agregiramo po danu
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${destinationGeo.lat}&lon=${destinationGeo.lng}&appid=${apiKey}&units=metric&lang=hr&cnt=40`
  const resp = await fetch(url)
  if (!resp.ok) return null
  const data = await resp.json()
  const list = data?.list
  if (!list?.length) return null

  // Grupisaj po datumu
  const byDay = {}
  for (const entry of list) {
    const d = entry.dt_txt?.slice(0, 10)
    if (!d) continue
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(entry)
  }

  const dayForecast = Object.entries(byDay).slice(0, 5).map(([date, entries]) => {
    const mins = entries.map(e => e.main.temp_min)
    const maxs = entries.map(e => e.main.temp_max)
    const rains = entries.map(e => Math.round((e.pop || 0) * 100))
    return {
      date,
      min_c: Math.round(Math.min(...mins)),
      max_c: Math.round(Math.max(...maxs)),
      rain_pct: Math.max(...rains),
      description: entries[4]?.weather?.[0]?.description || entries[0]?.weather?.[0]?.description || '',
      icon: entries[4]?.weather?.[0]?.icon || entries[0]?.weather?.[0]?.icon || '',
      humidity: entries[4]?.main?.humidity || 0,
      wind_ms: Math.round(entries[4]?.wind?.speed || 0),
      uvi: 0,
    }
  })

  if (!dayForecast.length) return null
  const allMins = dayForecast.map(d => d.min_c)
  const allMaxs = dayForecast.map(d => d.max_c)
  const rainMax = Math.max(...dayForecast.map(d => d.rain_pct))

  return {
    forecast_summary: `OpenWeatherMap prognoza za sljedecih ${dayForecast.length} dana.`,
    min_temp_c: Math.round(Math.min(...allMins)),
    max_temp_c: Math.round(Math.max(...allMaxs)),
    rain_probability: rainMax > 60 ? `Visoka (~${rainMax}%)` : rainMax > 25 ? `Umjerena (~${rainMax}%)` : `Niska (~${rainMax}%)`,
    clothing_recommendation: inferClothingRecommendation(Math.min(...allMins), Math.max(...allMaxs), rainMax),
    daily_forecast: dayForecast,
    source: 'OpenWeatherMap',
  }
}

async function fetchWeatherOpenMeteo(destinationGeo, departDate, returnDate) {
  const url = `${OPEN_METEO_FORECAST_URL}?latitude=${destinationGeo.lat}&longitude=${destinationGeo.lng}&timezone=auto&start_date=${departDate}&end_date=${returnDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode`
  const response = await fetch(url)
  if (!response.ok) return null
  const data = await response.json()
  const daily = data?.daily
  if (!daily?.time?.length) return null

  const min = Math.round(Math.min(...daily.temperature_2m_min))
  const max = Math.round(Math.max(...daily.temperature_2m_max))
  const rainMax = Math.max(...daily.precipitation_probability_max)
  const codes = dedupeStrings(daily.weathercode.map(describeWeatherCode).filter(Boolean))

  const dayForecast = daily.time.map((date, i) => ({
    date,
    min_c: Math.round(daily.temperature_2m_min[i]),
    max_c: Math.round(daily.temperature_2m_max[i]),
    rain_pct: daily.precipitation_probability_max[i] || 0,
    description: describeWeatherCode(daily.weathercode[i]) || '',
    icon: '',
    humidity: 0,
    wind_ms: 0,
    uvi: 0,
  }))

  return {
    forecast_summary: `Prognoza: ${codes.slice(0, 3).join(', ')}.`,
    min_temp_c: min,
    max_temp_c: max,
    rain_probability: rainMax > 60 ? `Visoka (~${rainMax}%)` : rainMax > 25 ? `Umjerena (~${rainMax}%)` : `Niska (~${rainMax}%)`,
    clothing_recommendation: inferClothingRecommendation(min, max, rainMax),
    daily_forecast: dayForecast,
    source: 'Open-Meteo',
  }
}

async function fetchAttractionElements(destinationGeo) {
  const query = `
[out:json][timeout:25];
(
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["tourism"="museum"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["tourism"="gallery"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["tourism"="attraction"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["tourism"="theme_park"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["tourism"="aquarium"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["tourism"="zoo"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["historic"="castle"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["historic"="palace"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["historic"="ruins"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["historic"="archaeological_site"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["amenity"="theatre"];
  nwr(around:8000,${destinationGeo.lat},${destinationGeo.lng})["leisure"="park"]["name"]["wikidata"];
);
out center tags 150;
`
  return fetchOverpass(query)
}

function buildOsmAttractions(elements, destinationGeo) {
  return dedupeByNameAndCoords(elements)
    .map((item) => mapAttraction(item, destinationGeo))
    .filter((item) => item.name && item.name.length > 2)
    .sort((a, b) => attractionScore(b) - attractionScore(a))
    .slice(0, 15)
}

// Keep for backward compat
async function fetchAttractions(destinationGeo) {
  const elements = await fetchAttractionElements(destinationGeo)
  return buildOsmAttractions(elements, destinationGeo)
}

async function fetchAccommodationCandidates(destinationGeo) {
  const query = `
[out:json][timeout:25];
(
  nwr(around:5000,${destinationGeo.lat},${destinationGeo.lng})["tourism"~"hotel|apartment|guest_house|hostel|motel"];
);
out center tags 60;
`

  const elements = await fetchOverpass(query)
  return dedupeByNameAndCoords(elements)
    .map((item) => {
      const point = coordsOf(item)
      return {
        name: item.tags?.name || item.tags?.brand || '',
        area: pickArea(item.tags, destinationGeo),
        address: buildAddress(item.tags),
        price_per_night_eur: null,
        total_price_eur: null,
        rating: null,
        beds: parseBeds(item.tags),
        distance_to_center_km: round(distanceKm(point, destinationGeo), 1),
        lat: point.lat,
        lng: point.lng,
        why: 'Odabrano po blizini centra i atrakcija iz OpenStreetMap podataka.',
        booking_url: '',
        score: accommodationScore(item, destinationGeo),
      }
    })
    .filter((item) => item.name)
    .sort((a, b) => b.score - a.score)
}

function chooseAccommodation(candidates, attractions, destinationGeo) {
  if (!candidates.length) return null
  const attractionCenter = attractions.length ? averageCoords(attractions) : destinationGeo

  const ranked = [...candidates]
    .sort((a, b) => {
      const scoreA = (10 - Math.min(10, distanceKm(a, attractionCenter))) - (a.distance_to_center_km || 0)
      const scoreB = (10 - Math.min(10, distanceKm(b, attractionCenter))) - (b.distance_to_center_km || 0)
      return scoreB - scoreA
    })
    .slice(0, 6)

  const priceRange = lookupHotelPriceRange(destinationGeo)

  // Attach typical price range info to each item if no live price
  const withRanges = ranked.map((item) => ({
    ...item,
    price_range: priceRange || null,
  }))

  return {
    primary: withRanges[0] || null,
    options: withRanges,
  }
}

async function fetchFood(anchor) {
  const query = `
[out:json][timeout:25];
(
  nwr(around:2200,${anchor.lat},${anchor.lng})["shop"="supermarket"];
  nwr(around:2200,${anchor.lat},${anchor.lng})["amenity"="fast_food"];
  nwr(around:2200,${anchor.lat},${anchor.lng})["amenity"="restaurant"];
);
out center tags 120;
`

  const elements = await fetchOverpass(query)
  const mapped = dedupeByNameAndCoords(elements).map((item) => {
    const tags = item.tags || {}
    const point = coordsOf(item)
    const type = tags.shop === 'supermarket'
      ? 'market'
      : tags.amenity === 'fast_food'
      ? 'fast_food'
      : 'restaurant'

    return {
      name: tags.name || tags.brand || '',
      type,
      avg_price_eur: parseCharge(tags),
      distance_m: Math.round(distanceKm(point, anchor) * 1000),
      lat: point.lat,
      lng: point.lng,
      note: tags.cuisine ? `Kuhinja: ${tags.cuisine.replace(/;/g, ', ')}` : '',
    }
  }).filter((item) => item.name)

  return [
    ...mapped.filter((item) => item.type === 'market').sort(sortByDistance).slice(0, 2),
    ...mapped.filter((item) => item.type === 'fast_food').sort(sortByDistance).slice(0, 2),
    ...mapped.filter((item) => item.type === 'restaurant').sort(sortByDistance).slice(0, 2),
  ]
}

async function fetchChainRestaurants(anchor) {
  const query = `
[out:json][timeout:30];
(
  nwr(around:10000,${anchor.lat},${anchor.lng})["amenity"~"restaurant|fast_food|cafe"]["brand"];
  nwr(around:10000,${anchor.lat},${anchor.lng})["amenity"~"restaurant|fast_food|cafe"]["name"~"McDonald|KFC|Burger King|Subway|Starbucks|Pizza Hut|Domino|Taco Bell|Tim Hortons|Popeyes|Wendy|Five Guys|Shake Shack|Costa|Pret A Manger",i];
);
out center tags 200;
`

  const BRANDS = [
    "McDonald's", 'KFC', 'Burger King', 'Subway', 'Starbucks',
    'Pizza Hut', "Domino's", 'Taco Bell', 'Tim Hortons', "Popeyes",
    "Wendy's", 'Five Guys', 'Shake Shack', 'Costa Coffee', 'Pret A Manger',
  ]

  const elements = await fetchOverpass(query)

  // Map each element to a brand + location
  const located = dedupeByNameAndCoords(elements)
    .map((item) => {
      const tags = item.tags || {}
      const combined = `${tags.brand || ''} ${tags.name || ''}`.toLowerCase()
      const brand = BRANDS.find((b) => combined.includes(b.toLowerCase()))
      if (!brand) return null
      const point = coordsOf(item)
      return {
        brand,
        name: tags.name && tags.name.toLowerCase() !== brand.toLowerCase() ? tags.name : brand,
        avg_price_eur: parseCharge(tags),
        distance_m: Math.round(distanceKm(point, anchor) * 1000),
        lat: point.lat,
        lng: point.lng,
        address: buildAddress(tags),
      }
    })
    .filter(Boolean)
    .sort(sortByDistance)

  // Group by brand - keep up to 3 locations per brand
  const grouped = {}
  for (const item of located) {
    if (!grouped[item.brand]) grouped[item.brand] = []
    if (grouped[item.brand].length < 3) grouped[item.brand].push(item)
  }

  // Return flat list: each brand entry with all its locations
  return Object.entries(grouped).map(([brand, locations]) => ({
    name: brand,
    avg_price_eur: locations[0]?.avg_price_eur ?? null,
    locations, // array of {distance_m, lat, lng, address, name}
    distance_m: locations[0]?.distance_m ?? 0,
  }))
}

async function fetchTransit(destinationGeo) {
  const query = `
[out:json][timeout:25];
(
  node(around:5000,${destinationGeo.lat},${destinationGeo.lng})["public_transport"];
  node(around:5000,${destinationGeo.lat},${destinationGeo.lng})["railway"~"station|tram_stop|subway_entrance"];
  node(around:5000,${destinationGeo.lat},${destinationGeo.lng})["highway"="bus_stop"];
);
out tags 200;
`

  const elements = await fetchOverpass(query)
  const counts = { subway: 0, tram: 0, bus: 0, rail: 0 }

  elements.forEach((item) => {
    const tags = item.tags || {}
    if (tags.railway === 'subway_entrance' || tags.station === 'subway') counts.subway += 1
    else if (tags.railway === 'tram_stop' || tags.tram === 'yes') counts.tram += 1
    else if (tags.highway === 'bus_stop' || tags.bus === 'yes') counts.bus += 1
    else if (tags.railway === 'station') counts.rail += 1
  })

  const osmModes = []
  if (counts.subway) osmModes.push('metro')
  if (counts.tram) osmModes.push('tramvaj')
  if (counts.bus) osmModes.push('autobus')
  if (counts.rail) osmModes.push('gradska zeljeznica')

  const cityKey = normalizeCityKey(destinationGeo.name || destinationGeo.displayName || '')
  const dbInfo = lookupTransitPrices(cityKey)

  const modes = osmModes.length ? osmModes : (dbInfo?.modes || [])

  const recommendation = modes.length
    ? `U centru su pronadjeni tragovi za: ${modes.join(', ')}.`
    : 'Nisu pronadjeni jasni OSM podaci o javnom prevozu u centru; provjeri gradski sajt prevoznika.'

  return {
    modes,
    single_eur: dbInfo?.single_eur ?? null,
    daily_eur: dbInfo?.daily_eur ?? null,
    weekly_eur: dbInfo?.weekly_eur ?? null,
    note: dbInfo?.note ?? null,
    tourist_pass: dbInfo?.tourist_pass ?? null,
    website: dbInfo?.website ?? null,
    tips: dbInfo?.tips ?? null,
    recommendation,
  }
}

async function fetchCarRoute(originGeo, destinationGeo) {
  const url = `${OSRM_ROUTE_URL}/${originGeo.lng},${originGeo.lat};${destinationGeo.lng},${destinationGeo.lat}?overview=false&steps=false&annotations=false`
  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json()
  const route = data?.routes?.[0]
  if (!route) return null

  const distance_km = round(route.distance / 1000, 1)
  const fuel_cost_eur = estimateFuelCost(distance_km)
  const total_cost_eur = round(fuel_cost_eur * 2, 2)

  return {
    distance_km,
    duration_hours: round(route.duration / 3600, 1),
    fuel_cost_eur,
    toll_cost_eur: null,
    total_cost_eur,
    round_trip_total_eur: total_cost_eur,
    route_summary: `${originGeo.displayName} -> ${destinationGeo.displayName}`,
    border_crossings: '',
    vignettes_required: '',
    suggested_stops: [],
    tips: 'Google Maps link koristi za putarine, granice i eventualne zastoje u realnom vremenu.',
  }
}

async function geocodePlace(query) {
  const parsed = parseCoordString(query)
  if (parsed) {
    return {
      name: query,
      displayName: query,
      admin1: '',
      country: '',
      countryCode: '',
      lat: parsed.lat,
      lng: parsed.lng,
    }
  }

  const url = `${OPEN_METEO_GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1&language=bs&format=json`
  const response = await fetch(url)
  if (!response.ok) return null
  const data = await response.json()
  const item = data?.results?.[0]
  if (!item) return null

  return {
    name: item.name,
    displayName: [item.name, item.admin1, item.country].filter(Boolean).join(', '),
    admin1: item.admin1 || '',
    country: item.country || '',
    countryCode: item.country_code || '',
    lat: item.latitude,
    lng: item.longitude,
  }
}

async function fetchCountryInfo(countryCode, countryName) {
  if (countryCode) {
    const byCode = await fetchJson(`${REST_COUNTRIES_URL}/alpha/${countryCode}?fields=name,cca2,capital,languages,region,subregion`)
    if (byCode) return Array.isArray(byCode) ? byCode[0] : byCode
  }
  if (!countryName) return null
  const byName = await fetchJson(`${REST_COUNTRIES_URL}/name/${encodeURIComponent(countryName)}?fields=name,cca2,capital,languages,region,subregion`)
  return Array.isArray(byName) ? byName[0] : byName
}

async function fetchOverpass(query) {
  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: query,
    })
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data?.elements) ? data.elements : []
  } catch {
    return []
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function getAmadeusToken(env) {
  if (!env.AMADEUS_CLIENT_ID || !env.AMADEUS_CLIENT_SECRET) return null

  try {
    const response = await fetch(`${AMADEUS_TEST_URL}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: env.AMADEUS_CLIENT_ID,
        client_secret: env.AMADEUS_CLIENT_SECRET,
      }).toString(),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data?.access_token || null
  } catch {
    return null
  }
}

async function resolveAmadeusLocationCode(token, keyword, geo) {
  const keywords = buildAmadeusLocationKeywords(keyword, geo)

  for (const candidate of keywords) {
    const data = await amadeusFetch(token, '/v1/reference-data/locations', {
      subType: 'CITY,AIRPORT',
      keyword: candidate,
      'page[limit]': 5,
      view: 'LIGHT',
    })
    const first = data?.data?.find((item) => item.subType === 'CITY' && item.iataCode) || data?.data?.find((item) => item.iataCode) || data?.data?.[0]
    if (first?.iataCode) return first.iataCode
  }

  if (geo?.lat && geo?.lng) {
    const nearby = await amadeusFetch(token, '/v1/reference-data/locations/airports', {
      latitude: geo.lat,
      longitude: geo.lng,
      radius: 250,
    })
    const airport = nearby?.data?.find((item) => item.iataCode) || nearby?.data?.[0]
    if (airport?.iataCode) return airport.iataCode
  }

  return null
}

async function searchAmadeusFlightOffers(token, { originCode, destinationCode, departDate, returnDate, adults, children, max }) {
  const data = await amadeusFetch(token, '/v2/shopping/flight-offers', {
    originLocationCode: originCode,
    destinationLocationCode: destinationCode,
    departureDate: departDate,
    returnDate,
    adults,
    children: children || undefined,
    currencyCode: 'EUR',
    max: max || 3,
  })
  return data?.data || []
}

async function amadeusFetch(token, path, params) {
  const url = new URL(`${AMADEUS_TEST_URL}${path}`)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  })

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return null
  return await response.json()
}

function mapFlightOffer(offer) {
  const outbound = offer.itineraries?.[0]
  const firstSegment = outbound?.segments?.[0]
  const lastSegment = outbound?.segments?.[outbound.segments.length - 1]
  const stops = Math.max(0, (outbound?.segments?.length || 1) - 1)

  return {
    airline: firstSegment?.carrierCode || '',
    price_total_eur: toNum(offer.price?.grandTotal),
    departure: firstSegment?.departure?.at || '',
    arrival: lastSegment?.arrival?.at || '',
    stops,
    duration: outbound?.duration || '',
    booking_url: '',
    price_note: 'Live cijena iz Amadeus Flight Offers Search API-ja.',
  }
}

function mapAttraction(item, destinationGeo) {
  const tags = item.tags || {}
  const point = coordsOf(item)
  let charge = parseCharge(tags)
  const free = parseFree(tags)
  const name = tags.name || readableAttractionType(tags) || 'Atrakcija'

  // Look up price in static DB if OSM doesn't have it
  let priceSource = 'osm'
  if (!Number.isFinite(charge) && !free && name) {
    const dbEntry = lookupAttractionPrice(name)
    if (dbEntry !== null) {
      charge = dbEntry.price_eur
      priceSource = 'db'
    }
  }

  const priceNote = free || charge === 0
    ? 'Besplatna atrakcija.'
    : Number.isFinite(charge) && charge > 0
      ? priceSource === 'db'
        ? `~EUR${charge} odrasli (provjeri trenutnu cijenu na ulazu).`
        : `EUR${charge} odrasli (iz OSM podataka).`
      : 'Ulaznica potrebna - provjeri cijenu online ili na ulazu.'

  return {
    name,
    description: describeAttraction(tags),
    why_visit: '',
    price_eur: Number.isFinite(charge) ? charge : null,
    price_total_eur: null,
    free: free || charge === 0,
    price_note: priceNote,
    lat: point.lat,
    lng: point.lng,
    duration_hours: estimateDuration(tags),
    area: pickArea(tags, destinationGeo),
    category: osmCategory(tags),
    highlight: false,
    source: 'osm',
    _tags: tags,
  }
}

function attractionScore(item) {
  let score = 0
  if (item.name) score += 5
  if (item.description && item.description.length > 10) score += 3
  if (item.area) score += 1
  if (item.free || Number.isFinite(item.price_eur)) score += 2
  if (item.highlight) score += 10
  // Reward by category
  const cat = item.category || ''
  const tier = { museum: 8, gallery: 7, palace: 7, ancient: 7, science: 6, zoo: 5, aquarium: 5, landmark: 5, viewpoint: 4, park: 3, church: 2 }
  score += tier[cat] || 0
  // Reward OSM tourism tag priority
  const tags = item._tags || {}
  if (tags.tourism === 'museum') score += 6
  if (tags.tourism === 'gallery') score += 5
  if (tags.tourism === 'theme_park' || tags.tourism === 'zoo' || tags.tourism === 'aquarium') score += 4
  if (tags.tourism === 'attraction') score += 3
  if (tags.historic === 'castle' || tags.historic === 'palace') score += 5
  if (tags.historic === 'ruins' || tags.historic === 'archaeological_site') score += 4
  if (tags.wikidata) score += 3  // Has Wikipedia/Wikidata entry = more notable
  return score
}

function accommodationScore(item, destinationGeo) {
  const point = coordsOf(item)
  let score = 10 - Math.min(10, distanceKm(point, destinationGeo))
  if (item.tags?.stars) score += toNum(item.tags.stars) || 0
  if (item.tags?.brand) score += 1
  return score
}

function osmCategory(tags) {
  if (tags.tourism === 'museum') return 'museum'
  if (tags.tourism === 'gallery') return 'gallery'
  if (tags.tourism === 'theme_park') return 'park'
  if (tags.tourism === 'aquarium') return 'aquarium'
  if (tags.tourism === 'zoo') return 'zoo'
  if (tags.historic === 'castle' || tags.historic === 'palace') return 'palace'
  if (tags.historic === 'ruins' || tags.historic === 'archaeological_site') return 'ancient'
  if (tags.amenity === 'theatre') return 'theatre'
  if (tags.leisure === 'park') return 'park'
  return 'landmark'
}

function readableAttractionType(tags) {
  if (tags.tourism === 'museum') return 'Muzej'
  if (tags.tourism === 'gallery') return 'Galerija'
  if (tags.tourism === 'theme_park') return 'Tematski park'
  if (tags.tourism === 'aquarium') return 'Akvarij'
  if (tags.tourism === 'zoo') return 'Zoo'
  if (tags.tourism === 'attraction') return 'Atrakcija'
  if (tags.historic) return `Historijska lokacija (${tags.historic})`
  return ''
}

function describeAttraction(tags) {
  const type = readableAttractionType(tags)
  const descriptor = tags.historic || tags.tourism || tags.amenity || ''
  if (type && descriptor && type.toLowerCase() !== descriptor.toLowerCase()) {
    return `${type}. Tip lokacije: ${descriptor}.`
  }
  return type ? `${type}.` : ''
}

function estimateDuration(tags) {
  if (tags.tourism === 'museum' || tags.tourism === 'gallery') return 2
  if (tags.tourism === 'theme_park' || tags.tourism === 'zoo') return 3
  return 1.5
}

function buildAddress(tags) {
  return [tags?.['addr:street'], tags?.['addr:housenumber'], tags?.['addr:city']].filter(Boolean).join(' ').trim()
}

function pickArea(tags, destinationGeo) {
  return tags?.['addr:suburb'] || tags?.['addr:city'] || tags?.district || destinationGeo.name || ''
}

function parseBeds(tags) {
  return tags?.beds ? clampInt(tags.beds, 0, 0) : null
}

function parseCharge(tags) {
  if (!tags) return NaN
  if (String(tags.fee || '').toLowerCase() === 'no') return 0
  if (tags.charge) return toNum(tags.charge)
  return NaN
}

function parseFree(tags) {
  const fee = String(tags?.fee || '').toLowerCase()
  return fee === 'no' || fee === 'free'
}

function coordsOf(item) {
  return {
    lat: item.lat ?? item.center?.lat ?? 0,
    lng: item.lon ?? item.center?.lon ?? 0,
  }
}

function dedupeByNameAndCoords(items) {
  const seen = new Set()
  const out = []
  for (const item of items || []) {
    const point = coordsOf(item)
    const key = `${(item.tags?.name || item.tags?.brand || '').trim().toLowerCase()}|${round(point.lat, 5)}|${round(point.lng, 5)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function buildItinerary(attractions, departDate, days) {
  if (!attractions.length) return []
  const buckets = chunkArray(attractions, Math.max(1, Math.ceil(attractions.length / days)))
  return buckets.slice(0, days).map((bucket, index) => ({
    day: index + 1,
    date: addDays(departDate, index),
    title: bucket[0]?.area || `Dan ${index + 1}`,
    area: bucket[0]?.area || '',
    attraction_indices: bucket.map((item) => attractions.findIndex((candidate) => candidate.name === item.name && candidate.lat === item.lat && candidate.lng === item.lng)).filter((value) => value >= 0),
    morning: bucket[0] ? `Zapocni sa ${bucket[0].name}.` : '',
    afternoon: bucket[1] ? `Nastavi prema ${bucket[1].name}${bucket[2] ? ` i ${bucket[2].name}` : ''}.` : '',
    evening: bucket[bucket.length - 1] ? `Vece ostavi za dio oko ${bucket[bucket.length - 1].name}.` : '',
    walking_minutes: bucket.length > 1 ? 15 + (bucket.length - 1) * 10 : 0,
  }))
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    return resp
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

function buildFlightSearchLinks({ origin, destination, departDate, returnDate, adults, children }) {
  const from     = (origin || '').split(',')[0].trim()
  const to       = (destination || '').split(',')[0].trim()
  const fromSlug = from.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const toSlug   = to.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const pax      = adults || 2
  const ch       = children || 0

  const gf      = `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${from} to ${to} on ${departDate} returning ${returnDate} ${pax} adults${ch ? ' ' + ch + ' children' : ''}`)}`
  const kiwi    = `https://www.kiwi.com/en/search/results/${encodeURIComponent(fromSlug)}/${encodeURIComponent(toSlug)}/${departDate}/${returnDate}?adults=${pax}&children=${ch}&infants=0&cabinClass=economy`
  const kayak   = `https://www.kayak.com/flights/${encodeURIComponent(from)}-${encodeURIComponent(to)}/${departDate}/${returnDate}/${pax}adults${ch ? '/' + ch + 'children' : ''}`
  const momondo = `https://www.momondo.com/flight-search/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${departDate}/${returnDate}/?adults=${pax}&children=${ch}`

  return [
    { name: 'Google Flights', url: gf,      emoji: 'GF' },
    { name: 'Kiwi.com',       url: kiwi,    emoji: 'KW' },
    { name: 'Kayak',          url: kayak,   emoji: 'KY' },
    { name: 'Momondo',        url: momondo, emoji: 'MM' },
  ]
}

function computeBudget(plan, input) {
  const values = {}
  const notes = []

  if (Array.isArray(plan.flights) && plan.flights.length) {
    const cheapest = minPositive(plan.flights.map((item) => item.price_total_eur))
    if (cheapest > 0) values.Prevoz = cheapest
  } else if (typeof plan.car_route?.round_trip_total_eur === 'number' && plan.car_route.round_trip_total_eur > 0) {
    values.Prevoz = plan.car_route.round_trip_total_eur
  } else {
    notes.push('Prevoz je ukljucen samo kada provider vrati konkretnu live cijenu.')
  }

  const hotelPrices = [plan.accommodation, ...(plan.accommodation_options || [])]
    .map((item) => toNum(item?.total_price_eur))
    .filter((value) => value > 0)
  const cheapestHotel = minPositive(hotelPrices)
  if (cheapestHotel > 0) {
    values.Smjestaj = cheapestHotel
  } else {
    notes.push('Smjestaj nije ukljucen dok provider ne vrati cijenu za zadane datume.')
  }

  const attractionsTotal = (plan.attractions || []).reduce((sum, item) => {
    if (typeof item.price_eur === 'number' && item.price_eur > 0) return sum + (item.price_eur * input.totalPeople)
    return sum
  }, 0)
  if (attractionsTotal > 0) values.Atrakcije = round(attractionsTotal, 2)
  else notes.push('Atrakcije ulaze u budzet samo kada javni podaci sadrze konkretnu cijenu.')

  const total = Object.values(values).reduce((sum, value) => sum + value, 0)
  if (Object.keys(values).length) values.UKUPNO = round(total, 2)
  notes.unshift('UKUPNO ukljucuje samo kategorije sa konkretnim provider cijenama.')

  return { values, notes: dedupeStrings(notes) }
}

function buildEmergencyInfo(countryInfo) {
  return EMERGENCY_BY_COUNTRY[countryInfo?.cca2] || { general_emergency: '112', police: '', ambulance: '', fire: '' }
}

function buildSummary({ destination, days, totalPeople, transportMode, hasFlights, hasHotelPrice }) {
  const transportLabel = { plane: 'avion', car: 'auto', bus: 'autobus', train: 'voz' }[transportMode] || 'prevoz'
  const segments = [
    `${destination} za ${days} dana i ${totalPeople} putnika.`,
    `Plan koristi javne live izvore i provider API-je gdje su dostupni.`,
  ]
  if (transportMode === 'plane' && hasFlights) segments.push('Letovi dolaze iz Amadeus provider API-ja.')
  else if (transportLabel) segments.push(`Odabrani tip prevoza: ${transportLabel}.`)
  if (hasHotelPrice) segments.push('Smjestaj koristi live hotel ponude.')
  return segments.join(' ')
}

function buildTips({ transportMode, weather, accommodation }) {
  const tips = []
  if (transportMode === 'plane') tips.push('Za let provjeri i pravila prtljaga prije kupovine karte.')
  if (weather?.rain_probability?.includes('Visoka')) tips.push('Prognoza pokazuje vecu sansu za kisu, pa planiraj fleksibilnije vanjske aktivnosti.')
  if (accommodation?.distance_to_center_km !== null && accommodation?.distance_to_center_km <= 1.5) {
    tips.push('Odabrani smjestaj je relativno blizu centra, pa se velik dio plana moze obici pjesice.')
  }
  return tips
}

function buildAmadeusLocationKeywords(keyword, geo) {
  return dedupeStrings([
    keyword,
    geo?.name,
    geo?.displayName,
    geo?.admin1,
    [geo?.name, geo?.country].filter(Boolean).join(', '),
    String(keyword || '').split(',')[0]?.trim(),
  ].filter(Boolean))
}

function describeWeatherCode(code) {
  const map = {
    0: 'Vedro',
    1: 'Pretezno vedro',
    2: 'Djelimicno oblacno',
    3: 'Oblacno',
    45: 'Magla',
    48: 'Magla s injem',
    51: 'Slaba rosulja',
    53: 'Umjerena rosulja',
    55: 'Jaka rosulja',
    61: 'Slaba kisa',
    63: 'Umjerena kisa',
    65: 'Jaka kisa',
    71: 'Slab snijeg',
    73: 'Umjeren snijeg',
    75: 'Jak snijeg',
    80: 'Lokalni pljuskovi',
    81: 'Pljuskovi',
    82: 'Jaki pljuskovi',
    95: 'Grmljavina',
  }
  return map[code] || ''
}

function inferClothingRecommendation(minTemp, maxTemp, rainPercent) {
  if (maxTemp >= 28) return rainPercent > 40 ? 'Lagane stvari, sesir i mali kisobran.' : 'Lagane ljetne stvari, sesir i zastita od sunca.'
  if (maxTemp >= 20) return rainPercent > 40 ? 'Lagana jakna za vece i kisobran.' : 'Proljetna odjeca sa jednim laganim slojem za jutro i vece.'
  if (maxTemp >= 10) return rainPercent > 40 ? 'Jakna srednje tezine i vodootporna obuca.' : 'Jakna srednje tezine i slojevita odjeca.'
  return 'Topla jakna i slojevita odjeca.'
}

function slugifyCountryName(value) {
  if (!value) return ''
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanHtmlText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstMatch(text, regex) {
  const match = text.match(regex)
  return match?.[1] || match?.[0] || ''
}

function shorten(text, max) {
  const value = String(text || '').trim()
  return value.length > max ? `${value.slice(0, max - 1)}...` : value
}

function estimateFuelCost(distanceKmValue) {
  const liters = distanceKmValue * 0.07
  return round(liters * 1.6, 2)
}

function distanceKm(a, b) {
  if (!a || !b) return Infinity
  const toRad = (value) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function averageCoords(items) {
  const valid = items.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
  const lat = valid.reduce((sum, item) => sum + item.lat, 0) / valid.length
  const lng = valid.reduce((sum, item) => sum + item.lng, 0) / valid.length
  return { lat, lng }
}

function sortByDistance(a, b) {
  return (a.distance_m || Number.MAX_SAFE_INTEGER) - (b.distance_m || Number.MAX_SAFE_INTEGER)
}

function chunkArray(values, size) {
  const out = []
  for (let index = 0; index < values.length; index += size) out.push(values.slice(index, index + size))
  return out
}

function addDays(isoDate, offset) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

function parseCoordString(value) {
  const match = String(value || '').match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
  if (!match) return null
  return { lat: Number(match[1]), lng: Number(match[2]) }
}

function clampInt(value, fallback, min) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, parsed)
}

function toNum(value) {
  if (value === null || value === undefined || value === '') return NaN
  if (typeof value === 'number') return value
  const normalized = String(value).replace(',', '.').replace(/[^0-9.-]/g, '')
  return Number.parseFloat(normalized)
}

function minPositive(values) {
  const filtered = (values || []).map(toNum).filter((value) => Number.isFinite(value) && value > 0)
  return filtered.length ? Math.min(...filtered) : 0
}

function round(value, digits = 0) {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function dedupeStrings(values) {
  return Array.from(new Set((values || []).filter(Boolean)))
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
