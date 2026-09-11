const C='https://commons.wikimedia.org/wiki/Special:Redirect/file/';
export const AUDIO_UPLOADS=[
 {key:'q01-wham',era:'80er',label:'Wham! – Wake Me Up Before You Go-Go',question:'Wer sang 1984 „Wake Me Up Before You Go-Go“?'},
 {key:'q02-bttf',era:'80er',label:'Back to the Future – Main Theme (Alan Silvestri)',question:'Welcher Film schickte Marty McFly 1985 zurück ins Jahr 1955?'},
 {key:'q03-aha',era:'80er',label:'a-ha – Take on Me',question:'Welches Musikvideo zeigt a-ha in einer Mischung aus Realfilm und Bleistift-Comic?'},
 {key:'q05-madonna',era:'80er',label:'Madonna – Like a Virgin',question:'Welche Sängerin erklärte 1984, sie sei „Like a Virgin“?'},
 {key:'q08-ghostbusters',era:'80er',label:'Ghostbusters – Ray Parker Jr. / Theme',question:'Welche Action-Komödie von 1984 fragte sinngemäß: Wen wirst du rufen?'},
 {key:'q09-spice',era:'90er',label:'Spice Girls – Wannabe',question:'Welche Girlgroup wollte 1996 wissen: „Tell me what you want, what you really really want“?'},
 {key:'q11-nirvana',era:'90er',label:'Nirvana – Smells Like Teen Spirit',question:'Wer veröffentlichte 1991 „Smells Like Teen Spirit“?'},
 {key:'q12-titanic',era:'90er',label:'Titanic – My Heart Will Go On / Filmthema',question:'Welcher Film machte 1997 den Satz „I’m the king of the world!“ berühmt?'},
 {key:'q13-bsb',era:'90er',label:'Backstreet Boys – Everybody (Backstreet’s Back)',question:'Welche Boyband hatte Hits wie „Everybody (Backstreet’s Back)“?'},
 {key:'q17-beyonce',era:'2000er',label:'Beyoncé – Crazy in Love',question:'Wer sang 2003 „Crazy in Love“ zusammen mit Jay-Z?'},
 {key:'q19-rihanna',era:'2000er',label:'Rihanna – Umbrella',question:'Welche Sängerin veröffentlichte 2007 „Umbrella“?'},
 {key:'q21-potter',era:'2000er',label:'Harry Potter – Hedwig’s Theme (John Williams)',question:'Welche Filmreihe begann 2001 mit einem Jungen, der nach Hogwarts kommt?'},
 {key:'q22-bep',era:'2000er',label:'The Black Eyed Peas – Where Is the Love?',question:'Welche Band fragte 2003: „Where Is the Love?“'},
 {key:'q25-gangnam',era:'2010er',label:'PSY – Gangnam Style',question:'Welcher Song wurde 2012 mit Pferdetanz und Milliarden Views zum globalen Meme?'},
 {key:'q27-adele',era:'2010er',label:'Adele – Rolling in the Deep',question:'Wer veröffentlichte 2011 „Rolling in the Deep“ als Single-Hit?'},
 {key:'q28-got',era:'2010er',label:'Game of Thrones – Main Title (Ramin Djawadi)',question:'Welche Fantasyserie machte „Winter is coming“ zum geflügelten Satz?'},
 {key:'q29-happy',era:'2010er',label:'Pharrell Williams – Happy',question:'Welcher Künstler sang 2014 „Happy“?'},
 {key:'q33-weeknd',era:'2020er',label:'The Weeknd – Blinding Lights',question:'Wer veröffentlichte 2020 den Hit „Blinding Lights“?'},
 {key:'q35-miley',era:'2020er',label:'Miley Cyrus – Flowers',question:'Welche Sängerin landete 2023 mit „Flowers“ einen weltweiten Hit?'},
 {key:'q38-bruno',era:'2020er',label:'Encanto – We Don’t Talk About Bruno',question:'Welcher Song aus „Encanto“ wurde 2022 zum überraschenden Chart-Hit?'}
];
const byQ=Object.fromEntries(AUDIO_UPLOADS.map(x=>[x.question,{audioKey:x.key,audioLabel:x.label,cat:'AUDIO'}]));
export const MEDIA={
 ...byQ,
 'Welcher Film schickte Marty McFly 1985 zurück ins Jahr 1955?':{...byQ['Welcher Film schickte Marty McFly 1985 zurück ins Jahr 1955?'],img:C+'Back_to_the_Future_DeLorean.jpg?width=1200',alt:'DeLorean-Zeitmaschine',credit:'Bild: Wikimedia Commons'},
 'Was war ein Walkman ursprünglich vor allem?':{cat:'POP',img:C+'Walkman_TPS-L2.jpg?width=1100',alt:'Sony Walkman TPS-L2',credit:'Anna Gerdén / Tekniska museet · Wikimedia Commons'},
 'Welches Handy wurde für Snake II und seine Robustheit legendär?':{cat:'POP',img:C+'Nokia3310.jpg?width=900',alt:'Nokia 3310',credit:'Wikimedia Commons'},
 'Welche Konsole brachte Nintendo 2006 mit Bewegungssteuerung ins Wohnzimmer?':{cat:'GAMES',img:C+'Wii-console.jpg?width=1100',alt:'Nintendo Wii mit Wii Remote',credit:'Evan-Amos · Public Domain · Wikimedia Commons'},
 'Welche Filmreihe begann 2001 mit einem Jungen, der nach Hogwarts kommt?':{...byQ['Welche Filmreihe begann 2001 mit einem Jungen, der nach Hogwarts kommt?'],img:C+'Sony-PlayStation-2-90001-Console-FL.jpg?width=1100',alt:'2000er-Technikmotiv',credit:'Evan-Amos · Public Domain · Wikimedia Commons'},
 'Welche Plattform machte kurze vertikale Videos endgültig zum Mainstream?':{cat:'POP',img:C+'IPhone_1st_Gen.svg?width=650',alt:'Frühes iPhone als Symbol für mobile Medien',credit:'Rafael Fernandez · CC BY-SA 4.0 · Wikimedia Commons'}
};
