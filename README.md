# Word Finder

This little app lets you play around with word lists in various ways:

* Random mode lets you pick words at random from a word list. It uses
  <a href="https://en.wikipedia.org/wiki/Sampling_(statistics)">uniform-random sampling witt replacement"</a>.

* Jabber mode (for <a href="https://en.wikipedia.org/wiki/Jabberwocky"><i>Jabberwocky</i></a>)
  lets you see new words spliced together from existing words: for example, like the way we combine
  <i>spoon</i> and <i>fork</i> to make <i>spork</i>. This uses <a
  href="https://en.wikipedia.org/wiki/N-gram">n-grams</a> using the method detailed in <a
  href="https://johnkerl.org/randspell/randspell-slides-ts.pdf">this write-up</a> from 2012. My
  implementation then was a command-line version written in Python; the implementation here is the
  same algorithm, but in JavaScript, usable on desktop or mobile.

* Pattern mode is a dictionary lookup. If you type in only letters, such as <code>example</code>,
  you'll the word at the bottom if it's in the dictionary, or nothing if it isn't.  You can also use
  a <i>.</i> to match a single letter, and/or <i>*</i> to match zero or more letters. For example,
  <i>t..th</i> will match <i>teeth</i>, <i>tooth</i>, and <i>tenth</i>; <i>th*st</i> will show you
  all words starting with <i>th</i> and ending with <i>st</i>.

* <a href="https://en.wikipedia.org/wiki/Anagram">Anagram</a> mode lets you see all the ways the
  letters of a given word can be permuted to make another existing word.

* Bee mode is a tool of last resort for the New York Times Spelling Bee (see below
  for philosophy).

## On-line help

Please see the hosted app, at either of the following locations, for on-line help:

* [https://johnkerl.org/word-finder](https://johnkerl.org/word-finder).
* [https://johnkerl.github.io/word-finder](https://johnkerl.github.io/word-finder)

## JavaScript tooling

This app uses the [Sliver JavaScript library](https://github.com/johnkerl/sliver).

This is a fun little DIY JavaScript project at the end of 2024 and the start of 2025.

## Spelling-Bee Philosophy

This is a word-list app -- a tool of last resort for the NYT Spelling Bee, and other things as well.
Here is my own approach:


* First: I start with the day's letters, of course.

* Second: I generally get around half the words before looking at the Grid. I consider this
  effectively a part of the game itself.

* Also second: The Buddy's Grid and Two-Letter List portions have all the same information as the
  Grid, while removing the need for scratch paper.

* Third, the Stats: these aren't hints by any means, but, they help me prioritize: if I'm missing,
  say, a six-letter word starting with a P, then if 80% of readers have found it, I do know the
  word, and I just need to search. But if only 20% of readers have found it, in my experience,
  that's a word I do _not_ know (yet).

* My partner and I have developed a list of the "usual suspects" -- words that seem to appear only
  in the Spelling Bee, including _aril_, _natant_, _tilth_, and _tinct_. These are encoded in the
  Word Finder app. The usual-suspects list also includes our oh-I-cannot-believe-I-keep-forgetting
  that words.

* I try to complete the puzzle using these four. About half the time, I can Queen Bee on this basis:
  without hints.

* Fifth: the reader hints. On those days I've got a few words left, I end up taking 1, 2, 3, 5
  hints; worst case, 10 or so. And looking at a hint almost always results in success.

* Sixth: even with reader hints there is occasionally a stumper. This rarely happens for me -- less
  than one day in ten -- in large part due to the quality of the reader hints.  The fork in the road
  is to shrug and say _I don't know what this word is_, and call it a loss for the day -- or, to
  find a way to learn what may be a new word.  Here is where word lists come into play -- and Word
  Finder's Bee mode is a word-list app designed for that desperate purpose.
