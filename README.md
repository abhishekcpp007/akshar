# अक्षर (Akshar)

A small programming language with Hindi keywords. It runs in the browser from one HTML file, and the errors come back in Hindi too.

```
मानो उम्र = २०
अगर उम्र >= 18 {
    छापो "आप वोट दे सकते हो"
} वरना {
    छापो "अभी छोटे हो"
}
```

## Run it

Open `index.html` in a browser. If the login screen says encryption isn't available, serve the folder instead:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`, register with any name and a password of 6 or more characters, and press चलाओ.

## The language

Every keyword works in Devanagari and in Roman.

| Hindi | Roman | What it does |
| --- | --- | --- |
| मानो | maano | make a variable |
| छापो | chhapo | print |
| अगर, वरना | agar, warna | if and else |
| जबतक | jabtak | while loop |
| काम, लौटाओ | kaam, lautao | define a function and return from it |
| सही, गलत, खाली | sahi, galat, khaali | true, false, null |
| और, या, नहीं | aur, ya, nahi | and, or, not |

It has numbers, strings, lists, closures and recursion. Devanagari digits like `२०` are numbers. `#` starts a comment, and a `।` at the end of a line is allowed.

Built-in functions: `लंबाई`, `जोड़ो`, `संख्या`, `पाठ`.

## The Sanskrit part

The login screen is written in Sanskrit, with Hindi hints under each field. The encryption functions have Sanskrit names:

| Sanskrit | Roman | What it does |
| --- | --- | --- |
| गोपय(संदेश, कुंजी) | gopay | encrypts with AES-256-GCM, key from PBKDF2-SHA256 |
| प्रकाशय(गुप्त, कुंजी) | prakashay | decrypts, and fails if the key is wrong |
| मुद्रय(पाठ) | mudray | SHA-256 digest |

Encrypted bytes print as Devanagari syllables. Each byte is one consonant for the high four bits plus one matra for the low four.

The login is a demo. Accounts live in the browser's localStorage and there's no server. Only a salted PBKDF2 seal of the password is stored.

## How it's built

`index.html` holds a lexer, a recursive descent parser and an async tree-walking interpreter in plain JavaScript, with no dependencies. The crypto uses the browser's Web Crypto API.

## Tests

```
node test/test_akshar.js index.html
```

This runs the four example programs and the error cases, and it fails if any output doesn't match. It needs Node 20 or newer.
