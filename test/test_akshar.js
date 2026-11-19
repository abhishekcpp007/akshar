const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');
const core = html.split('/*AKSHAR-CORE-START*/')[1].split('/*AKSHAR-CORE-END*/')[0];
const Akshar = vm.runInThisContext(core + '\nAkshar;');

async function output(source) {
  const lines = [];
  try {
    await Akshar.run(source, (text) => lines.push(text));
  } catch (e) {
    lines.push('ERR ' + e.message);
  }
  return lines;
}

const CASES = [
  ['undefined name', 'छापो क', ["ERR पंक्ति १: 'क' नाम की कोई चीज़ नहीं मिली"]],
  ['divide by zero', 'मानो क = 5\nछापो क / 0', ['ERR पंक्ति २: शून्य से भाग नहीं हो सकता']],
  ['unclosed string', 'छापो "अधूरा', ['ERR पंक्ति १: पाठ का उद्धरण चिह्न बंद नहीं हुआ']],
  ['endless loop', 'जबतक सही { }', ['ERR पंक्ति १: प्रोग्राम बहुत देर से चल रहा है। कहीं चक्र अनंत तो नहीं?']],
  ['wrong key', 'मानो ग = गोपय("राज़", "एक")\nछापो प्रकाशय(ग, "दो")', ['ERR पंक्ति २: कुंजी गलत है या संदेश बदला गया है']],
  ['lists', 'मानो स = [1, "दो", सही]\nजोड़ो(स, खाली)\nस[0] = 10\nछापो स, लंबाई(स)\nछापो संख्या("४२") + 1, पाठ(7) + "अ"', ['[10, "दो", सही, खाली] 4', '43 7अ']],
  ['else if', 'मानो क = 5।\nअगर क > 9 { छापो "बड़ा" } वरना अगर क > 3 { छापो "मझला" } वरना { छापो "छोटा" }', ['मझला']],
  ['closure', 'काम बनाओ(क) {\n काम अंदर(ख) { लौटाओ क + ख }\n लौटाओ अंदर\n}\nमानो जोड़५ = बनाओ(5)\nछापो जोड़५(10)', ['15']],
  ['deep recursion', 'काम क(न) { लौटाओ क(न + 1) }\nक(1)', ['ERR पंक्ति १: काम अपने आप को बहुत गहराई तक बुला रहा है']],
  ['bare return', 'काम क() {\n लौटाओ\n}\nछापो क()', ['खाली']],
  ['stray brace', 'छापो 1\n}', ["ERR पंक्ति २: यह '}' किसी खंड का नहीं है"]],
  ['roman keywords', 'maano x = 2\njabtak x < 5 { x = x + 1 }\nagar x == 5 aur nahi galat { chhapo "theek" } warna { chhapo "nahi" }', ['theek']],
];

(async () => {
  const [hello, loops, secret, roman] = await Promise.all(Akshar.EXAMPLES.map((example) => output(example.code)));
  assert.deepStrictEqual(hello, ['नमस्ते, दुनिया!', 'आप वोट दे सकते हो']);
  assert.deepStrictEqual(loops, [
    '1 का फ़ैक्टोरियल = 1',
    '2 का फ़ैक्टोरियल = 2',
    '3 का फ़ैक्टोरियल = 6',
    '4 का फ़ैक्टोरियल = 24',
    '5 का फ़ैक्टोरियल = 120',
  ]);
  assert.deepStrictEqual(roman, ['Jod hai: 16', 'Das se bada']);
  const [, cipher, , opened] = secret;
  assert.strictEqual(opened, 'कल सुबह छह बजे मिलो');
  assert.ok(!cipher.includes('मिलो'));

  for (const [name, source, expected] of CASES) {
    assert.deepStrictEqual(await output(source), expected, name);
  }

  const first = await Akshar.seal('rahasya123');
  const same = await Akshar.seal('rahasya123', first.salt);
  const other = await Akshar.seal('galat-pass', first.salt);
  assert.strictEqual(first.seal, same.seal);
  assert.notStrictEqual(first.seal, other.seal);

  console.log(`ok: ${Akshar.EXAMPLES.length} examples, ${CASES.length} cases, seal check`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
