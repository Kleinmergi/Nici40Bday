export const QUIZ = [
{name:'80er',theme:'80s',items:[
{q:'Welcher Film brachte Marty McFly 1985 ins Jahr 1955?',o:['Ghostbusters','Zurück in die Zukunft','Top Gun','E.T.'],a:1,e:'Zurück in die Zukunft startete 1985.'},
{q:'Welches Gerät kam 1989 in Europa auf den Markt?',o:['Game Boy','iPod','PlayStation 2','Nokia 3310'],a:0,e:'Nintendos Game Boy erschien 1989.'},
{q:'88 mph aus Zurück in die Zukunft sind ungefähr ...',o:['118 km/h','142 km/h','161 km/h','188 km/h'],a:1,e:'88 mph entsprechen rund 142 km/h.'}
]},
{name:'90er',theme:'90s',items:[
{q:'Welcher dieser Dienste prägte die 90er als Chat-Programm?',o:['ICQ','TikTok','Discord','Threads'],a:0,e:'ICQ erschien 1996 und wurde zum Kult-Messenger.'},
{q:'Welche Konsole erschien 1994 zuerst in Japan?',o:['PlayStation','Xbox','Wii','Dreamcast 2'],a:0,e:'Die erste PlayStation startete 1994 in Japan.'},
{q:'Welcher Film kam 1997 ins Kino?',o:['Titanic','Matrix','Gladiator','Findet Nemo'],a:0,e:'Titanic erschien 1997.'}
]},
{name:'2000er',theme:'00s',items:[
{q:'Welches Handy wurde 2000 zum Kultmodell?',o:['Nokia 3310','iPhone 4','Galaxy S','Pixel 2'],a:0,e:'Das Nokia 3310 kam 2000 auf den Markt.'},
{q:'Welche Plattform startete 2005?',o:['YouTube','Instagram','TikTok','Spotify'],a:0,e:'YouTube wurde 2005 gegründet.'},
{q:'Welches soziale Netzwerk wurde 2004 gegründet?',o:['Facebook','Snapchat','BeReal','Threads'],a:0,e:'Facebook startete 2004.'}
]},
{name:'2010er',theme:'10s',items:[
{q:'Welche App startete 2010 und prägte Foto-Feeds?',o:['Instagram','ICQ','Napster','MySpace'],a:0,e:'Instagram startete 2010.'},
{q:'Welcher Tanzhit dominierte 2012 weltweit?',o:['Gangnam Style','Macarena','Cotton Eye Joe','Blue'],a:0,e:'Gangnam Style wurde 2012 zum globalen Phänomen.'},
{q:'Welche Spielkonsole erschien 2017?',o:['Nintendo Switch','PlayStation 2','GameCube','Xbox 360'],a:0,e:'Die Nintendo Switch erschien 2017.'}
]},
{name:'2020er',theme:'20s',items:[
{q:'Welches Wort wurde ab 2020 praktisch zum Synonym für Videokonferenzen?',o:['Zoomen','Faxen','Poken','Beamen'],a:0,e:'Zoom wurde während der Pandemie allgegenwärtig.'},
{q:'Welche KI-Anwendung löste Ende 2022 einen weltweiten Hype aus?',o:['ChatGPT','ICQ','Winamp','Napster'],a:0,e:'ChatGPT wurde Ende 2022 öffentlich veröffentlicht.'},
{q:'Welcher Film war 2023 Teil des „Barbenheimer“-Phänomens?',o:['Oppenheimer','Avatar','Dune: Part Two','Joker'],a:0,e:'Barbie und Oppenheimer starteten am selben Wochenende.'}
]}
];
export const FLAT = QUIZ.flatMap((round,ri)=>round.items.map((item,qi)=>({roundIndex:ri,questionIndex:qi,roundName:round.name,theme:round.theme,...item})));
