/* Lexicon: words that fire before they are understood. [word, weight, valence 1-9, arousal 1-9]
 * Valence/arousal are Clyde's own rough ratings in the spirit of published affective norms
 * (Warriner, Kuperman & Brysbaert 2013); they drive the physics, not the other way round. */
var LEX = {
  'Alarm':      [['FIRE', 3, 2.6, 7.4], ['DEADLINE', 2.4, 2.9, 6.6], ['LUMP', 2, 2.4, 6.0], ['POSITIVE', 1.4, 2.5, 7.0], ['URGENT', 2, 3.0, 6.9], ['BLOOD', 2, 2.7, 6.8], ['SIREN', 1.6, 3.0, 7.0], ['AUDIT', 1.2, 3.2, 5.8],
                 ['SPIDER', 1.4, 2.8, 6.4], ['FALLING', 1.6, 2.9, 6.6], ['BIOPSY', 1.2, 2.6, 6.2], ['DROWN', 1.4, 2.0, 6.9], ['WAKE UP', 1.2, 3.6, 6.3], ['NOW', 1.6, 4.0, 6.6]],
  'Attachment': [['HOME', 3, 7.9, 4.2], ['MOTHER', 3, 7.4, 5.0], ['STAY', 2, 6.6, 4.4], ['HOLD', 2, 6.8, 4.6], ['LOVE', 2.2, 8.0, 5.4], ['SAFE', 1.6, 7.6, 3.6], ['DAUGHTER', 1.2, 7.2, 4.9],
                 ['FATHER', 2, 6.9, 4.8], ['SISTER', 1.4, 7.0, 4.6], ['KITCHEN', 1.2, 6.8, 3.8], ['BLANKET', 1.2, 7.2, 3.0], ['TOGETHER', 1.2, 7.4, 4.6], ['SUNDAY', 1.2, 7.0, 3.9], ['NANA', 1.2, 7.6, 4.0]],
  'Loss':       [['SORRY', 3, 3.2, 4.4], ['GONE', 2, 2.8, 4.0], ['ALONE', 2.6, 2.6, 3.9], ['NEVER', 2, 3.0, 4.6], ['LATE', 1.4, 3.4, 4.8], ['WAS', 1.2, 3.6, 3.2], ['EMPTY', 1.6, 2.7, 3.5],
                 ['GOODBYE', 1.8, 3.3, 4.6], ['ONCE', 1.2, 4.6, 3.4], ['ASHES', 1.2, 2.4, 3.8], ['FORMER', 1.0, 3.9, 3.2], ['UNSAID', 1.2, 3.4, 4.0], ['NO ONE', 1.4, 2.6, 4.2]],
  'Want':       [['YES', 2.4, 7.6, 5.9], ['MORE', 2.4, 6.4, 6.2], ['MINE', 2, 6.2, 5.8], ['AGAIN', 2, 6.0, 5.4], ['SUGAR', 1.4, 7.0, 6.0], ['KISS', 1.6, 8.0, 6.6],
                 ['WINNER', 1.4, 7.8, 6.6], ['FREE', 1.6, 7.6, 5.6], ['JACKPOT', 1.0, 7.4, 7.2], ['SALE', 1.2, 6.4, 5.4], ['TONIGHT', 1.4, 6.8, 6.2]],
  'Summons':    [['SEEN', 2, 4.4, 5.8], ['TYPING', 2, 5.2, 6.0], ['CALL ME', 1.6, 5.6, 6.4], ['UNREAD', 1.4, 4.2, 5.2], ['REPLY', 1.2, 5.0, 5.4],
                 ['LIKED', 1.2, 6.4, 5.4], ['MISSED CALL', 1.0, 3.8, 5.8], ['ONLINE', 1.2, 5.4, 5.0], ['TAGGED', 1.0, 5.0, 5.6]]
};
