insert into public.games(id,category_id,title,description,difficulty,is_active) values
('varnmala','varnmala','Punjabi Varnmala','Identify Gurmukhi letters and first sounds.','easy',true),
('matra','matra','Laga Matra Master','Learn and recognise Punjabi vowel signs.','easy',true),
('reading','reading','Punjabi Reading','Read Gurmukhi words and understand their meanings.','easy',true),
('word-builder','word-builder','Punjabi Word Builder','Build Punjabi words from letter tiles.','medium',true),
('english-punjabi','english-punjabi','English to Punjabi','Translate English prompts into Roman Punjabi.','easy',true),
('punjabi-english','punjabi-english','Punjabi to English','Translate Gurmukhi prompts into English.','easy',true),
('tenses','tenses','Tenses Challenge','Practise present, past and future tense forms.','medium',true),
('vocabulary','vocabulary','Punjabi Vocabulary','Learn everyday topic vocabulary.','easy',true),
('picture-matching','picture-matching','Picture Matching','Match everyday concepts with Punjabi words.','easy',true),
('sentence-master','sentence-master','Sentence Master','Construct correct Punjabi sentences.','medium',true),
('conversation','conversation','Daily Conversation','Practise common real-life Punjabi conversations.','easy',true),
('listening','listening','Listening Challenge','Listen to Punjabi and identify words and meaning.','easy',true),
('speaking','speaking','Punjabi Speaking','Practise spoken Punjabi with teacher review.','easy',true),
('grammar','grammar','Grammar Challenge','Practise Punjabi grammar and usage.','medium',true),
('multiplayer','multiplayer','Multiplayer Games','Play live Punjabi learning challenges with friends.','medium',true)
on conflict(id) do update set title=excluded.title,description=excluded.description;
