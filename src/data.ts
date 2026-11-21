export type Question = { prompt: string; options: string[]; answer: string; hint?: string }
export type Game = { id: string; title: string; category: string; description: string; icon: string; color: string; questions: Question[]; duration: string; level: string }
const q = (prompt:string, options:string[], answer:string, hint?:string):Question => ({prompt,options,answer,hint})
export const games: Game[] = [
 {id:'roman',title:'English to Punjabi',category:'Speaking & Translation',description:'Turn everyday English into natural Roman Punjabi.',icon:'Languages',color:'violet',duration:'5 min',level:'Beginner',questions:[
 q('This is my book.',['Eh meri kitab hai.','Eh mera ghar hai.','Meri eh kitab han.','Oh meri kitab hai.'],'Eh meri kitab hai.'),
 q('Where are you going?',['Tusi ki kar rahe ho?','Tusi kithe ja rahe ho?','Tusi kadon aoge?','Tusi kithe ho?'],'Tusi kithe ja rahe ho?'),
 q('Please sit down.',['Kirpa karke khade ho jao.','Kirpa karke baith jao.','Darwaza kholo.','Ithe aao.'],'Kirpa karke baith jao.'),
 q('I am hungry.',['Main thak gaya haan.','Mainu bhukh laggi hai.','Main khana bana reha haan.','Main khush haan.'],'Mainu bhukh laggi hai.'),
 q('Give me water.',['Mainu paani deo.','Mainu kitab deo.','Paani le aao.','Main paani pee reha haan.'],'Mainu paani deo.')
 ]},
 {id:'tense',title:'Tenses Challenge',category:'Grammar & Sentences',description:'Spot the tense and choose the right Punjabi sentence.',icon:'Clock3',color:'blue',duration:'6 min',level:'Intermediate',questions:[
 q('I am playing.',['Main khed reha haan.','Main khed reha si.','Main khedanga.','Main khed chukka haan.'],'Main khed reha haan.'),
 q('I was studying.',['Main padhanga.','Main padh reha si.','Main padh reha haan.','Main school javanga.'],'Main padh reha si.'),
 q('I will go.',['Main geya si.','Main ja reha haan.','Main javanga.','Main aa reha haan.'],'Main javanga.'),
 q('She is cooking.',['Oh khana bana reha hai.','Oh khana bana rahi hai.','Oh khana banavegi.','Oh khana bana rahi si.'],'Oh khana bana rahi hai.'),
 q('They were playing.',['Oh khed rahe han.','Oh khedange.','Oh khed rahe san.','Oh khed reha si.'],'Oh khed rahe san.')
 ]},
 {id:'matra',title:'Laga Matra Master',category:'Gurmukhi & Reading',description:'Recognise vowel signs and read Punjabi words.',icon:'BookOpen',color:'orange',duration:'5 min',level:'Beginner',questions:[
 q('Which word contains Kanna (ਾ)?',['ਕਿਤਾਬ','ਕਾਲਾ','ਕੁੱਤਾ','ਸੇਬ'],'ਕਾਲਾ'),
 q('Choose the word with Sihari (ਿ).',['ਪੀਲਾ','ਦਿਨ','ਮੋਰ','ਘਰ'],'ਦਿਨ'),
 q('Which word contains Bihari (ੀ)?',['ਖੀਰ','ਕਮਲ','ਨਲ','ਫਲ'],'ਖੀਰ'),
 q('Choose the word with Lavan (ੇ).',['ਮੋਰ','ਸੇਬ','ਕੁੱਤਾ','ਦਿਨ'],'ਸੇਬ'),
 q('Which word contains Hora (ੋ)?',['ਰੋਟੀ','ਕਿਤਾਬ','ਘਰ','ਪਾਣੀ'],'ਰੋਟੀ')
 ]},
 {id:'vocab',title:'Punjabi Vocabulary',category:'Words & Pictures',description:'Build useful words for home, school and everyday life.',icon:'Shapes',color:'pink',duration:'4 min',level:'Beginner',questions:[
 q('What is “Apple” in Punjabi?',['ਅੰਬ','ਸੇਬ','ਕੇਲਾ','ਅੰਗੂਰ'],'ਸੇਬ'),
 q('What is “House” in Punjabi?',['ਘਰ','ਸਕੂਲ','ਕਿਤਾਬ','ਮੇਜ਼'],'ਘਰ'),
 q('What is “Water” in Punjabi?',['ਦੁੱਧ','ਚਾਹ','ਪਾਣੀ','ਰੋਟੀ'],'ਪਾਣੀ'),
 q('What is “Book” in Punjabi?',['ਕੁਰਸੀ','ਕਿਤਾਬ','ਪੈਨ','ਬੈਗ'],'ਕਿਤਾਬ'),
 q('What is “Peacock” in Punjabi?',['ਘੋੜਾ','ਮੋਰ','ਸ਼ੇਰ','ਹਾਥੀ'],'ਮੋਰ')
 ]},
 {id:'reading',title:'Punjabi Reading',category:'Gurmukhi & Reading',description:'Read Gurmukhi words and understand their meanings.',icon:'LibraryBig',color:'green',duration:'5 min',level:'Beginner',questions:[
 q('What does ਘਰ mean?',['House','Flower','Water','School'],'House'),
 q('What does ਫਲ mean?',['Book','Fruit','Bird','Milk'],'Fruit'),
 q('What does ਕਿਤਾਬ mean?',['Pencil','Table','Book','Chair'],'Book'),
 q('What does ਪਾਣੀ mean?',['Water','Food','Sun','Moon'],'Water'),
 q('What does ਮੋਰ mean?',['Horse','Peacock','Tiger','Rabbit'],'Peacock')
 ]},
 {id:'sentence',title:'Sentence Master',category:'Grammar & Sentences',description:'Put words in order and build clear Punjabi sentences.',icon:'Puzzle',color:'cyan',duration:'5 min',level:'Intermediate',questions:[
 q('Choose the correct sentence for “This is a table.”',['Eh mez hai.','Mez eh hai?','Hai eh kursi.','Eh kursi han.'],'Eh mez hai.'),
 q('Choose the correct sentence for “You are my friend.”',['Tusi mere dost ho.','Main tuhade dost haan.','Oh mera dost hai.','Tusi kithe ho.'],'Tusi mere dost ho.'),
 q('Choose the correct sentence for “Open the door.”',['Darwaza kholo.','Darwaza band karo.','Ithe baitho.','Paani peeo.'],'Darwaza kholo.'),
 q('Choose the correct sentence for “We are going home.”',['Asi ghar ja rahe haan.','Asi ghar gaye si.','Oh ghar ja reha hai.','Main ghar javanga.'],'Asi ghar ja rahe haan.')
 ]},
 {id:'varna',title:'Varnmala Explorer',category:'Gurmukhi & Reading',description:'Get confident with Gurmukhi letters and first sounds.',icon:'A-Z',color:'yellow',duration:'4 min',level:'Beginner',questions:[
 q('Which letter starts the word ਕਮਲ?',['ਕ','ਮ','ਲ','ਸ'],'ਕ'),
 q('Which letter starts the word ਘਰ?',['ਰ','ਗ','ਘ','ਹ'],'ਘ'),
 q('Which letter starts the word ਸੇਬ?',['ਬ','ਸ','ੇ','ਕ'],'ਸ'),
 q('Which letter starts the word ਮੋਰ?',['ਰ','ਮ','ਵ','ਨ'],'ਮ'),
 q('Which letter starts the word ਫਲ?',['ਲ','ਫ','ਪ','ਬ'],'ਫ')
 ]},
 {id:'conversation',title:'Daily Conversation',category:'Speaking & Translation',description:'Practise the Punjabi you need in real-life situations.',icon:'MessagesSquare',color:'indigo',duration:'5 min',level:'Beginner',questions:[
 q('Someone asks “Tuhada naam ki hai?” What are they asking?',['Where do you live?','What is your name?','How old are you?','What are you doing?'],'What is your name?'),
 q('How do you say “Come here”?',['Ithe aao.','Othe jao.','Baith jao.','Darwaza kholo.'],'Ithe aao.'),
 q('How do you say “May I drink water?”',['Ki main paani pee sakda/sakdi haan?','Mainu paani chahida hai.','Tusi paani peeo.','Paani kithe hai?'],'Ki main paani pee sakda/sakdi haan?'),
 q('What does “Tusi ki kar rahe ho?” mean?',['Where are you going?','What are you doing?','Who are you?','Are you hungry?'],'What are you doing?')
 ]}

 ,{id:'word-builder',title:'Punjabi Word Builder',category:'Gurmukhi & Reading',description:'Arrange Gurmukhi letter tiles to build the word.',icon:'Puzzle',color:'cyan',duration:'5 min',level:'Intermediate',questions:[
 q('Build the Punjabi word for KAMAL.',['ਕਮਲ','ਕਲਮ','ਮਲਕ','ਕਮਾਲ'],'ਕਮਲ'),
 q('Build the Punjabi word for GHAR.',['ਘਰ','ਗਰ','ਹਰ','ਘਾਰ'],'ਘਰ'),
 q('Build the Punjabi word for SEB.',['ਸੇਬ','ਸਬ','ਸਾਬ','ਸਿਬ'],'ਸੇਬ'),
 q('Build the Punjabi word for MOR.',['ਮੋਰ','ਮਰ','ਮੂਰ','ਮੋੜ'],'ਮੋਰ'),
 q('Build the Punjabi word for PHAL.',['ਫਲ','ਫੱਲ','ਪਲ','ਫਾਲ'],'ਫਲ')
 ]},
 {id:'punjabi-english',title:'Punjabi to English',category:'Speaking & Translation',description:'Understand Punjabi words and translate them into English.',icon:'Languages',color:'blue',duration:'5 min',level:'Beginner',questions:[
 q('ਇਹ ਮੇਰੀ ਕਿਤਾਬ ਹੈ।',['This is my book.','This is my bag.','That is my book.','I have a pen.'],'This is my book.'),
 q('ਘਰ',['House','School','Garden','Room'],'House'),
 q('ਮੈਂ ਸਕੂਲ ਜਾ ਰਿਹਾ ਹਾਂ।',['I am going to school.','I went to school.','I am at home.','I will go tomorrow.'],'I am going to school.'),
 q('ਪਾਣੀ',['Milk','Water','Juice','Tea'],'Water'),
 q('ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?',['Where are you?','How are you?','What is your name?','Where are you going?'],'How are you?')
 ]},
 {id:'picture-matching',title:'Picture Matching',category:'Words & Pictures',description:'Match everyday objects and animals with Punjabi words.',icon:'Shapes',color:'pink',duration:'4 min',level:'Beginner',questions:[
 q('Which Punjabi word means Elephant?',['ਹਾਥੀ','ਘੋੜਾ','ਸ਼ੇਰ','ਖਰਗੋਸ਼'],'ਹਾਥੀ'),
 q('Which Punjabi word means Banana?',['ਸੇਬ','ਕੇਲਾ','ਅੰਬ','ਅੰਗੂਰ'],'ਕੇਲਾ'),
 q('Which Punjabi word means Chair?',['ਮੇਜ਼','ਕੁਰਸੀ','ਕਿਤਾਬ','ਪੈਨ'],'ਕੁਰਸੀ'),
 q('Which Punjabi word means Flower?',['ਫੁੱਲ','ਫਲ','ਪੱਤਾ','ਰੁੱਖ'],'ਫੁੱਲ'),
 q('Which Punjabi word means Horse?',['ਬਿੱਲੀ','ਕੁੱਤਾ','ਘੋੜਾ','ਮੋਰ'],'ਘੋੜਾ')
 ]},
 {id:'listening',title:'Listening Challenge',category:'Speaking & Translation',description:'Listen to a Punjabi phrase and identify what you heard.',icon:'MessagesSquare',color:'indigo',duration:'4 min',level:'Beginner',questions:[
 q('Listen/read: “Sat Sri Akal”. What is it?',['A greeting','A goodbye','A food','A colour'],'A greeting'),
 q('“Paani” means…',['Bread','Water','Milk','Book'],'Water'),
 q('“Dhanvaad” means…',['Please','Sorry','Thank you','Welcome'],'Thank you'),
 q('“Ithe aao” means…',['Come here','Go there','Sit down','Stand up'],'Come here'),
 q('“Shubh raatri” means…',['Good morning','Good night','Good afternoon','Goodbye'],'Good night')
 ]},
 {id:'speaking',title:'Punjabi Speaking',category:'Speaking & Translation',description:'Practise speaking prompts and record your own response.',icon:'MessagesSquare',color:'green',duration:'3 min',level:'Beginner',questions:[
 q('How would you introduce yourself?',['Mera naam ___ hai.','Main school ja reha haan.','Eh meri kitab hai.','Mainu paani chahida hai.'],'Mera naam ___ hai.'),
 q('Say “I am happy”.',['Main khush haan.','Main thak gaya haan.','Main bhukha haan.','Main ghar haan.'],'Main khush haan.'),
 q('Say “I like mangoes”.',['Mainu amb pasand han.','Mainu seb pasand hai.','Main amb kha reha haan.','Amb kithe han?'],'Mainu amb pasand han.'),
 q('Say “My family”.',['Mera parivaar.','Mera school.','Mera dost.','Meri kitab.'],'Mera parivaar.'),
 q('Say “What is your name?”',['Tuhada naam ki hai?','Tusi kithe ho?','Tusi ki kar rahe ho?','Tusi kiven ho?'],'Tuhada naam ki hai?')
 ]},
 {id:'grammar',title:'Grammar Challenge',category:'Grammar & Sentences',description:'Practise pronouns, gender, number and correct word usage.',icon:'BookOpen',color:'orange',duration:'5 min',level:'Intermediate',questions:[
 q('Choose the respectful pronoun for “you”.',['Tusi','Main','Oh','Asi'],'Tusi'),
 q('Choose the feminine form: “I am going” (female speaker).',['Main ja reha haan.','Main ja rahi haan.','Main javanga.','Main geya si.'],'Main ja rahi haan.'),
 q('Which means “we”?',['Main','Tusi','Asi','Oh'],'Asi'),
 q('Choose the correct plural pronoun for “they”.',['Oh','Asi','Main','Tu'],'Oh'),
 q('Which is the question word for “where”?',['Ki','Kithe','Kyon','Kado'],'Kithe')
 ]},
 {id:'multiplayer',title:'Punjabi Word Race',category:'Multiplayer Games',description:'Challenge classmates in a private room and race for points.',icon:'Gamepad2',color:'violet',duration:'Live',level:'All levels',questions:[
 q('What does “Sat Sri Akal” mean in use?',['A respectful greeting','A fruit','A colour','A number'],'A respectful greeting'),
 q('Choose the Punjabi word for Book.',['ਕਿਤਾਬ','ਘਰ','ਪਾਣੀ','ਫਲ'],'ਕਿਤਾਬ'),
 q('What is “Thank you” in Punjabi?',['Dhanvaad','Sat Sri Akal','Shubh raatri','Kirpa karke'],'Dhanvaad')
 ]}

]
export const categories = ['All games','Gurmukhi & Reading','Speaking & Translation','Grammar & Sentences','Words & Pictures','Multiplayer Games']
export const leaderboard = [{name:'Aarav K.',xp:2840,level:'Punjabi Star',avatar:'AK'},{name:'Mehar S.',xp:2510,level:'Word Master',avatar:'MS'},{name:'Armaan D.',xp:2180,level:'Explorer',avatar:'AD'},{name:'Noor K.',xp:1960,level:'Explorer',avatar:'NK'},{name:'You',xp:0,level:'Beginner',avatar:'YO'}]
