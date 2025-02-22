"use strict"

// Please see for context
// https://johnkerl.org/randspell/randspell-slides-ts.pdf

export class NGramsKeeper {

  // ----------------------------------------------------------------
  constructor(
    wordList,
    n,
  ) {

    this.n = n
    this.verbose = false

    this.word_lengths_histogram = {}
    this.word_lengths_CMF = null

    this.start_histograms = null
    this.middle_histograms = null
    this.end_histogram = null

    this.ingest_words(wordList)

    if (this.verbose) {
      console.log("STATE", this)
    }
  }

  // ----------------------------------------------------------------
  ingest_words(words) {

    this.word_lengths_histogram = {}
    this.word_lengths_CMF = null

    this.start_histograms = {}
    this.middle_histograms = null
    this.end_histogram = null

    words.forEach((word) => {
      if (this.verbose) {
        console.log("---------------------------------------- INGEST START", word)
      }

      this.ingest_word(word)

      if (this.verbose) {
        console.log("---------------------------------------- INGEST END", word)
      }
    })

    // Compute CMFs from histograms, for weighted sampling.
    this.compute_CMFs()

  }

  // ----------------------------------------------------------------
  ingest_word(word) {
    // Accumulate a histogram of word lengths, so when we're asked to emit words,
    // we can emit them with word lengths of this same distribution.
    let word_length = word.length
    if (word_length < 1) {
      return
    }

    if (this.verbose) {
      console.log()
      console.log("INGEST", word, word_length)
    }

    if (word_length in this.word_lengths_histogram) {
      this.word_lengths_histogram[word_length] += 1
    } else {
      this.word_lengths_histogram[word_length] = 1
    }

    let from_begin = 0
    let from_end   = 0
    let to_index   = 0

    // We are doing n-grams, so say with n=5, each 4 letter predicts the 5th.
    // However, at the start of a word we don't *have* 4 yet. So the starting
    // histograms are for stats on the first few letters.
    //
    // * For picking the first letter we get stats on the (arbitrary) start symbol
    //   "_" as mapping to the first letter.
    // * Then stats on the first mapping to the second.
    // * Then stats on the first & second mapping to the third.
    // * Etc.
    //
    // Exammple: input word "abcdefghij" with n=5.
    // * this.start_letter_histogram[0] is { "_"   : { "a": 1 }}
    // * this.start_letter_histogram[1] is { "a"   : { "b": 1 }}
    // * this.start_letter_histogram[2] is { "ab"  : { "c": 1 }}
    // * this.start_letter_histogram[3] is { "abc" : { "d": 1 }}

    for (let i = 0; i < this.n-1; i += 1) {
      if (to_index > word_length-1) {
        return
      }
      let letters_from = "_"
      if (to_index > 0) {
        letters_from = word.substring(from_begin, from_end)
      }
      let letter_to = word[to_index]

      if (this.verbose) {
        console.log("START  [", from_begin, ":", from_end, " -> ", to_index, "]", letters_from, "->", letter_to)
      }

      // XXX make a helper
      if (this.start_histograms[i] == null) {
        this.start_histograms[i] = {}
      }
      if (this.start_histograms[i][letters_from] == null) {
        this.start_histograms[i][letters_from] = {}
      }
      if (this.start_histograms[i][letters_from][letter_to] == null) {
        this.start_histograms[i][letters_from][letter_to] = 0
      }
      this.start_histograms[i][letters_from][letter_to] += 1

      from_end += 1
      to_index += 1
    }

    // Now we have n-1 letters for the "letters_from" part followed by the 1 letter "letter_to" part.
    // Exammple: input word "abcdefghij" with n=5.
    // * this.middle_histograms is {
    //   "abcd"   : { "e": 1 },
    //   "bcde"   : { "f": 1 },
    //   "cdef"   : { "g": 1 },
    //   "defg"   : { "h": 1 },
    // }
    // We don't get stats on "efgh" -> "i" since we track that separately in the word-ending histogram.

    while (to_index < word_length-1) {
      var letters_from = word.substring(from_begin, from_end)
      var letter_to   = word[to_index]
      if (this.verbose) {
        console.log("MIDDLE [" , from_begin , ":" , from_end , " -> ", to_index , "]", letters_from, "->", letter_to)
      }

      // XXX make a helper
      if (this.middle_histograms == null) {
       this.middle_histograms = {}
      }
      if (this.middle_histograms[letters_from] == null) {
       this.middle_histograms[letters_from] = {}
      }
      if (this.middle_histograms[letters_from][letter_to] == null) {
       this.middle_histograms[letters_from][letter_to] = 0
      }
      this.middle_histograms[letters_from][letter_to] += 1

      from_begin += 1
      from_end   += 1
      to_index   += 1
    }

    if (to_index >= word_length) {
      if (this.verbose) {
        console.log("NO END", to_index, word_length)
      }
      return
    }

    // Word-ending histogram: separately tracks what words end in. Without this, it'd be easy
    // to produce words like "childhoo" or somesuch, not matching *endings* of words in the input.
    letters_from = word.substring(from_begin, from_end)
    letter_to   = word[to_index]

    if (this.verbose) {
      console.log("END    [" , from_begin , ":" , from_end , " -> ", to_index , "]", letters_from, "->", letter_to)
    }

    // XXX make a helper
    if (this.end_histogram == null) {
      this.end_histogram = {}
    }
    if (this.end_histogram[letters_from] == null) {
      this.end_histogram[letters_from] = {}
    }
    if (this.end_histogram[letters_from][letter_to] == null) {
      this.end_histogram[letters_from][letter_to] = 0
    }
    this.end_histogram[letters_from][letter_to] += 1
  }

  // Here we simply turn the histograms into cumulative mass functions
  // which are convenient for sampling.
  //
  // Example: if the input list has first letter 'a' twice, 'b' once, and 'c' once, then
  // the histogram is 'a':2, 'b':1, 'c':1. The CMF is 'a':0.50, 'b':0.75, 'c':1.00.

  compute_CMFs() {
    this.word_lengths_CMF = _compute_CMF_from_histogram(this.word_lengths_histogram)

    this.start_CMFs = {}
    for (let i = 0; i < this.n-1; i += 1) {
      this.start_CMFs[i] = {}
      for (let letters_from in this.start_histograms[i]) {
        this.start_CMFs[i][letters_from] = _compute_CMF_from_histogram(this.start_histograms[i][letters_from])
      }
    }

    this.middle_CMF = {}
    for (let letters_from in this.middle_histograms) {
      this.middle_CMF[letters_from] = _compute_CMF_from_histogram(this.middle_histograms[letters_from])
    }

    this.end_CMF = {}
    for (let letters_from in this.end_histogram) {
      this.end_CMF[letters_from] = _compute_CMF_from_histogram(this.end_histogram[letters_from])
    }

  }

  // ----------------------------------------------------------------
  // Splicing n-gram chains for start/middle of word with end-of-word data, doesn't always
  // connect. Hence the emit_word_aux helper function.
  emit_word() {
    let max_tries = 100
    for (let i = 0; i < max_tries; i += 1) {
      if (this.verbose) {
        console.log("---------------------------------------- EMIT-AUX START")
      }

      let word = this.emit_word_aux()

      if (this.verbose) {
        console.log("---------------------------------------- EMIT-AUX END")
      }
      if (word != null) {
        return word
      }
    }
    console.log("Could not generate ngram word after", max_tries, "tries.")
    return null
  }

  // ----------------------------------------------------------------
  emit_word_aux() {
    // Pick a word length distributed according to the word lengths in the input.
    let output_word_length = _sample_from_CMF(this.word_lengths_CMF)
    let word = ""

    if (this.verbose) {
      console.log()
      console.log("output_word_length  ", output_word_length)
    }

    // Walk through the 'start' chains to build up a word of length n.
    var letters_from = "_"
    for (let i = 0; i < this.n-1; i += 1) {
      if (this.verbose) {
        console.log("letters_from  ", letters_from)
      }
      if (this.start_CMFs[i][letters_from] == null) {
        if (this.verbose) {
          console.log("out1")
        }
        return null
      }
      let letter = _sample_from_CMF(this.start_CMFs[i][letters_from])
      word += letter
      if (this.verbose) {
        console.log("START YIELD ", word)
      }
      letters_from = word
    }

    // Now having a word of length n, continue it using the middle-of-word chain.
    for (let i = this.n; i < output_word_length; i += 1) {
      if (this.verbose) {
        console.log("letters_from  ", letters_from)
      }
      if (word.length >= output_word_length) {
        if (this.verbose) {
          console.log("out2")
        }
        return word
      }
      if (this.middle_CMF[letters_from] == null) {
        if (this.verbose) {
          console.log("out3")
        }
        return null
      }
      let letter = _sample_from_CMF(this.middle_CMF[letters_from])
      if (letter == null) {
        if (this.verbose) {
          console.log("out4")
        }
        return null
      }
      word += letter
      if (this.verbose) {
        console.log("MIDDLE YIELD ", word)
      }
      letters_from = word.substring(word.length - this.n + 1, word.length)
    }

    if (this.end_CMF[letters_from] == null) {
      if (this.verbose) {
        console.log("out5")
      }
      return null
    }

    // Finally, finish off the word using the end-of-word distribution.
    let last_letter = _sample_from_CMF(this.end_CMF[letters_from])
    if (last_letter == null) {
      return nulL
    }
    if (this.verbose) {
      console.log("END YIELD ", word)
    }
    word += last_letter

    return word
  }

} // end class

// ----------------------------------------------------------------
function _compute_sum_from_histogram(histogram) {
  let sum = 0
  for (const [k, n] of Object.entries(histogram)) {
    sum += n
  }
  return sum
}

// ----------------------------------------------------------------
function _compute_PMF_from_histogram(histogram) {
  let sum = _compute_sum_from_histogram(histogram)
  let cumu = 0.0
  let pmf = {}
  for (const k in histogram) {
    let p = histogram[k] / sum
    pmf[k] = p
  }
  return pmf
}

// ----------------------------------------------------------------
function _compute_CMF_from_histogram(histogram) {
  return _compute_CMF_from_PMF(_compute_PMF_from_histogram(histogram))
}

// ----------------------------------------------------------------
function _compute_CMF_from_PMF(pmf) {
  let cumu = 0.0
  let cmf = {}
  for (const [k, p] of Object.entries(pmf)) {
    cumu += p
    cmf[k] = cumu
  }
  return cmf
}

// ----------------------------------------------------------------
function _sample_from_CMF(cmf) {
  let u = Math.random()
  let output = ""
  for (const [k, c] of Object.entries(cmf)) {
    output = k
    if (u < c) {
      break
    }
  }
  return output
}
